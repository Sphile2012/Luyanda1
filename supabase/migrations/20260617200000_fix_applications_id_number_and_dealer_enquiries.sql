-- Make id_number nullable on applications so agents can apply without providing it
ALTER TABLE applications ALTER COLUMN id_number DROP NOT NULL;
ALTER TABLE applications ALTER COLUMN id_number SET DEFAULT '';

-- Create dealer_enquiries table if it doesn't exist
CREATE TABLE IF NOT EXISTS dealer_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_name text NOT NULL,
  contact_person text NOT NULL,
  role_title text,
  phone text NOT NULL,
  email text NOT NULL,
  city text,
  province text,
  vehicle_types text,
  brands_stocked text,
  message text,
  popia_consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE dealer_enquiries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY IF NOT EXISTS "Anyone can submit dealer enquiry"
  ON dealer_enquiries FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated users (management) can read
CREATE POLICY IF NOT EXISTS "Authenticated can read dealer enquiries"
  ON dealer_enquiries FOR SELECT
  TO authenticated
  USING (true);
