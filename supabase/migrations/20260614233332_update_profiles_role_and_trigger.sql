
-- Update profiles role constraint to include 'pending'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role = ANY (ARRAY['pending'::text, 'remote_agent'::text, 'inoffice_agent'::text, 'admin'::text]));

-- Update default role to pending
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'pending';

-- Create or replace handle_new_user trigger to check approved applications
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
BEGIN
  -- Check if there's an approved application for this email
  SELECT assigned_role INTO v_role
  FROM applications
  WHERE email = NEW.email AND status = 'approved'
  ORDER BY reviewed_at DESC
  LIMIT 1;

  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', '')),
    ''
  );

  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    COALESCE(v_role, 'pending')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure anon can insert applications (for public application form)
DROP POLICY IF EXISTS "insert_applications" ON applications;
CREATE POLICY "insert_applications" ON applications FOR INSERT WITH CHECK (true);

-- Ensure anon can insert buyer_leads
DROP POLICY IF EXISTS "insert_buyer_leads" ON buyer_leads;
CREATE POLICY "insert_buyer_leads" ON buyer_leads FOR INSERT WITH CHECK (true);

-- Ensure anon can insert dealer_enquiries
DROP POLICY IF EXISTS "insert_dealer_enquiries" ON dealer_enquiries;
CREATE POLICY "insert_dealer_enquiries" ON dealer_enquiries FOR INSERT WITH CHECK (true);
