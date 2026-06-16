-- Add management to role check if constraint exists
DO $$
BEGIN
  -- Update profiles role column to include management
  ALTER TABLE profiles
    DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('pending', 'remote_agent', 'inoffice_agent', 'management', 'admin'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Update client_documents document_type to include client_photo
DO $$
BEGIN
  ALTER TABLE client_documents
    DROP CONSTRAINT IF EXISTS client_documents_document_type_check;
  ALTER TABLE client_documents
    ADD CONSTRAINT client_documents_document_type_check
    CHECK (document_type IN (
      'id_document', 'proof_of_income', 'proof_of_address',
      'drivers_license', 'bank_statement', 'client_photo', 'other'
    ));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
