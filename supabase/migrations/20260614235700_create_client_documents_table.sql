-- Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('client_documents', 'client_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create client_documents table
CREATE TABLE IF NOT EXISTS client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('id_document', 'proof_of_income', 'proof_of_address', 'drivers_license', 'bank_statement', 'other')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for client_documents
CREATE POLICY "select_own_documents" ON client_documents FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = client_documents.client_id AND clients.agent_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "insert_own_documents" ON client_documents FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = client_documents.client_id AND clients.agent_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "update_own_documents" ON client_documents FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = client_documents.client_id AND clients.agent_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "delete_own_documents" ON client_documents FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = client_documents.client_id AND clients.agent_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Storage policies for client_documents bucket
CREATE POLICY "storage_select_own" ON storage.objects FOR SELECT
  TO authenticated USING (
    bucket_id = 'client_documents' AND (
      EXISTS (
        SELECT 1 FROM client_documents 
        WHERE client_documents.file_path = storage.objects.name 
        AND EXISTS (SELECT 1 FROM clients WHERE clients.id = client_documents.client_id AND clients.agent_id = auth.uid())
      )
      OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    )
  );

CREATE POLICY "storage_insert_own" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'client_documents' AND (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
    )
  );

CREATE POLICY "storage_update_own" ON storage.objects FOR UPDATE
  TO authenticated USING (
    bucket_id = 'client_documents' AND (
      EXISTS (
        SELECT 1 FROM client_documents 
        WHERE client_documents.file_path = storage.objects.name 
        AND EXISTS (SELECT 1 FROM clients WHERE clients.id = client_documents.client_id AND clients.agent_id = auth.uid())
      )
      OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    )
  );

CREATE POLICY "storage_delete_own" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'client_documents' AND (
      EXISTS (
        SELECT 1 FROM client_documents 
        WHERE client_documents.file_path = storage.objects.name 
        AND EXISTS (SELECT 1 FROM clients WHERE clients.id = client_documents.client_id AND clients.agent_id = auth.uid())
      )
      OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    )
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_documents_client ON client_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_uploaded_by ON client_documents(uploaded_by);