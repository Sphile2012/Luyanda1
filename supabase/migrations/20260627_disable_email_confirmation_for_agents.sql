-- ============================================================
-- MIGRATION: Auto-confirm agent emails on signup
-- This is an invite-only portal — email confirmation causes
-- agents to be locked out after signing up.
-- We auto-confirm every new user via the handle_new_user trigger.
-- ============================================================

-- Replace the handle_new_user trigger to also auto-confirm the email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
BEGIN
  BEGIN
    SELECT assigned_role INTO v_role
    FROM public.applications
    WHERE email = NEW.email AND status = 'approved'
    ORDER BY reviewed_at DESC
    LIMIT 1;

    v_full_name := COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(
        COALESCE(NEW.raw_user_meta_data->>'first_name','') || ' ' ||
        COALESCE(NEW.raw_user_meta_data->>'last_name','')
      ), ''),
      ''
    );

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, v_full_name, COALESCE(v_role, 'pending'))
    ON CONFLICT (id) DO UPDATE
      SET role = COALESCE(v_role, profiles.role),
          full_name = CASE WHEN v_full_name != '' THEN v_full_name ELSE profiles.full_name END,
          email = NEW.email;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed for %: %', NEW.email, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Auto-confirm emails: update auth.users immediately after insert
-- so agents don't get the "Email not confirmed" error on sign-in.
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = auth, public;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_email();
