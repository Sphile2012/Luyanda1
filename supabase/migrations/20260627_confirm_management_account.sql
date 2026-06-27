-- ============================================================
-- MIGRATION: Confirm management account email + ensure role
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Step 1: Confirm the email address so login works immediately
UPDATE auth.users
SET
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  confirmation_token  = '',
  updated_at          = now()
WHERE email = 'poomeigh503@gmail.com';

-- Step 2: Ensure the profile exists with management role and active status
INSERT INTO public.profiles (id, email, full_name, role, status)
SELECT
  id,
  'poomeigh503@gmail.com',
  COALESCE(NULLIF(TRIM(raw_user_meta_data->>'full_name'), ''), 'Admin User'),
  'management',
  'active'
FROM auth.users
WHERE email = 'poomeigh503@gmail.com'
ON CONFLICT (id) DO UPDATE
  SET role   = 'management',
      status = 'active',
      email  = 'poomeigh503@gmail.com',
      updated_at = now();

-- Step 3: Ensure the pre-approval application record exists
INSERT INTO public.applications (
  first_name, last_name, email, phone, city, province,
  id_number, motivation, how_heard, popia_consent,
  status, assigned_role, reviewed_at
) VALUES (
  'Admin', 'User', 'poomeigh503@gmail.com', '0664268711',
  'Stellenbosch', 'western_cape',
  '0000000000000', 'Management account', 'internal', true,
  'approved', 'management', now()
) ON CONFLICT DO NOTHING;
