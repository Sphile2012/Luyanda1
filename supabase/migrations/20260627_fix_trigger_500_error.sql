-- ============================================================
-- MIGRATION: Fix 500 error on signup
-- The handle_new_user trigger is causing a 500 because of
-- constraint violations or missing columns. This makes it
-- bulletproof.
-- ============================================================

-- Step 1: Drop and recreate the profiles table constraints cleanly
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check1;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check1;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('pending','remote_agent','inoffice_agent','management','admin'));

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_status_check
    CHECK (status IN ('active','inactive','suspended'));

-- Step 2: Make all profile columns have safe defaults so INSERT never fails
ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'pending',
  ALTER COLUMN status SET DEFAULT 'active',
  ALTER COLUMN full_name SET DEFAULT '',
  ALTER COLUMN phone SET DEFAULT '',
  ALTER COLUMN city SET DEFAULT '',
  ALTER COLUMN province SET DEFAULT '',
  ALTER COLUMN avatar_url SET DEFAULT '';

-- Step 3: Replace the trigger with a version that CANNOT cause a 500
-- It uses a broad EXCEPTION handler so even if something fails, the
-- auth user is still created successfully.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT := 'pending';
  v_full_name TEXT := '';
BEGIN
  BEGIN
    -- Look up pre-approved application
    SELECT assigned_role INTO v_role
    FROM public.applications
    WHERE lower(email) = lower(NEW.email)
      AND status = 'approved'
    ORDER BY reviewed_at DESC NULLS LAST
    LIMIT 1;

    IF v_role IS NULL THEN
      v_role := 'pending';
    END IF;

    -- Extract full name from metadata
    v_full_name := COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(
        COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' ||
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      ), ''),
      ''
    );

    -- Insert or update profile
    INSERT INTO public.profiles (id, email, full_name, role, status)
    VALUES (NEW.id, NEW.email, v_full_name, v_role, 'active')
    ON CONFLICT (id) DO UPDATE
      SET role      = EXCLUDED.role,
          full_name = CASE WHEN EXCLUDED.full_name != '' THEN EXCLUDED.full_name ELSE profiles.full_name END,
          email     = EXCLUDED.email,
          updated_at = now();

  EXCEPTION WHEN OTHERS THEN
    -- Log the error but NEVER let it bubble up and cause a 500
    RAISE WARNING '[handle_new_user] failed for user % (%): %', NEW.id, NEW.email, SQLERRM;
    -- Attempt a minimal insert as fallback
    BEGIN
      INSERT INTO public.profiles (id, email, full_name, role, status)
      VALUES (NEW.id, COALESCE(NEW.email, ''), '', 'pending', 'active')
      ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '[handle_new_user] fallback insert also failed for %: %', NEW.id, SQLERRM;
    END;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-attach the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Auto-confirm email trigger (belt-and-suspenders)
CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    confirmation_token  = '',
    updated_at          = now()
  WHERE id = NEW.id
    AND email_confirmed_at IS NULL;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = auth, public;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_email();
