-- Drop all self-referencing SELECT policies on profiles (they cause infinite recursion)
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "management_select_profiles" ON profiles;
-- Keep only the non-recursive ones: profiles_select (qual:true) and profiles_select_own

-- Fix is_management() to use SECURITY DEFINER so it bypasses RLS when querying profiles
CREATE OR REPLACE FUNCTION is_management()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('management', 'admin')
  );
$$;

-- Also fix profiles_update_admin — it queries profiles inside a profiles policy
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;

-- Recreate it using the safe is_management() function
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE
  TO authenticated
  USING (is_management())
  WITH CHECK (is_management());
