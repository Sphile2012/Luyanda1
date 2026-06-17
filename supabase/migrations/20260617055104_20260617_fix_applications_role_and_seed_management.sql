
-- Allow management as an assignable role in applications
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_assigned_role_check;
ALTER TABLE applications ADD CONSTRAINT applications_assigned_role_check
  CHECK (assigned_role = ANY (ARRAY['remote_agent'::text, 'inoffice_agent'::text, 'management'::text, 'admin'::text]));

-- Pre-approve poomeigh503@gmail.com as management so trigger assigns role on signup
INSERT INTO applications (
  first_name, last_name, email, phone, city, province,
  id_number, motivation, how_heard, popia_consent,
  status, assigned_role, reviewed_at
) VALUES (
  'Admin', 'User', 'poomeigh503@gmail.com', '0664268711', 'Stellenbosch', 'western_cape',
  '0000000000000', 'Management account', 'internal', true,
  'approved', 'management', NOW()
)
ON CONFLICT DO NOTHING;
