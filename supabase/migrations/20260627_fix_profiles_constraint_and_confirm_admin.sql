-- ============================================================
-- MIGRATION: Fix profiles role/status check constraints
--            then confirm management account
-- Run in Supabase SQL Editor
-- ============================================================

-- Step 1: Drop the old restrictive check constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;

-- Step 2: Re-add with the correct full set of allowed values
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('pending','remote_agent','inoffice_agent','management','admin'));

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_status_check
    CHECK (status IN ('active','inactive','suspended'));

-- Step 3: Confirm the management account email
UPDATE auth.users
SET
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  confirmation_token  = '',
  updated_at          = now()
WHERE email = 'poomeigh503@gmail.com';

-- Step 4: Upsert management profile
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
  SET role       = 'management',
      status     = 'active',
      email      = 'poomeigh503@gmail.com',
      updated_at = now();
