
-- Make handle_new_user resilient - never block auth user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
BEGIN
  BEGIN
    SELECT assigned_role INTO v_role
    FROM applications
    WHERE email = NEW.email AND status = 'approved'
    ORDER BY reviewed_at DESC
    LIMIT 1;

    v_full_name := COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(
        COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' ||
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      ), ''),
      ''
    );

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      NEW.id,
      NEW.email,
      v_full_name,
      COALESCE(v_role, 'pending')
    )
    ON CONFLICT (id) DO UPDATE
      SET role = COALESCE(v_role, profiles.role),
          full_name = CASE WHEN v_full_name != '' THEN v_full_name ELSE profiles.full_name END,
          email = NEW.email;
  EXCEPTION WHEN OTHERS THEN
    -- Log but never crash auth user creation
    RAISE WARNING 'handle_new_user failed for %: %', NEW.email, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
