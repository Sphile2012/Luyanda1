
-- Agent personal documents (ID, driver's license, bank statements, payslips)
CREATE TABLE IF NOT EXISTS agent_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('id_document', 'drivers_license', 'bank_statement', 'payslip')),
  month_label TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE agent_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_docs_select" ON agent_documents FOR SELECT
  TO authenticated USING (agent_id = auth.uid() OR is_management());

CREATE POLICY "agent_docs_insert" ON agent_documents FOR INSERT
  TO authenticated WITH CHECK (agent_id = auth.uid());

CREATE POLICY "agent_docs_update" ON agent_documents FOR UPDATE
  TO authenticated USING (agent_id = auth.uid()) WITH CHECK (agent_id = auth.uid());

CREATE POLICY "agent_docs_delete" ON agent_documents FOR DELETE
  TO authenticated USING (agent_id = auth.uid() OR is_management());

-- Storage bucket for agent documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent_documents', 'agent_documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "agent_docs_storage_select" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'agent_documents' AND (
    (storage.foldername(name))[1] = auth.uid()::text OR is_management()
  ));

CREATE POLICY "agent_docs_storage_insert" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'agent_documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "agent_docs_storage_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'agent_documents' AND (storage.foldername(name))[1] = auth.uid()::text);
