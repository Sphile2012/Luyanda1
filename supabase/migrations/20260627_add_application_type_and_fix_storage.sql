-- ============================================================
-- MIGRATION: Add application_type to client_documents
--            Fix storage RLS policies for client_documents
--            Fix storage RLS policies for agent_documents
-- ============================================================

-- 1. Add application_type column to client_documents
ALTER TABLE public.client_documents
  ADD COLUMN IF NOT EXISTS application_type text
    CHECK (application_type IN ('rent', 'own', 'finance'));

-- 2. Also ensure payslip is a valid document_type (add to CHECK constraint via recreate)
-- NOTE: PostgreSQL doesn't support ALTER on CHECK constraints directly.
-- The existing CHECK allows: id_document, proof_of_income, proof_of_address,
-- drivers_license, bank_statement, client_photo, payslip, other
-- The schema already includes 'payslip' so this is a no-op reminder comment.

-- 3. Storage policies for client_documents bucket
DROP POLICY IF EXISTS "agents_upload_client_docs" ON storage.objects;
CREATE POLICY "agents_upload_client_docs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'client_documents'
    AND (
      is_management()
      OR EXISTS (
        SELECT 1 FROM public.clients
        WHERE clients.id::text = (storage.foldername(name))[1]
          AND clients.agent_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "agents_read_client_docs" ON storage.objects;
CREATE POLICY "agents_read_client_docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'client_documents'
    AND (
      is_management()
      OR EXISTS (
        SELECT 1 FROM public.clients
        WHERE clients.id::text = (storage.foldername(name))[1]
          AND clients.agent_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "management_delete_client_docs" ON storage.objects;
CREATE POLICY "management_delete_client_docs" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'client_documents' AND is_management());

-- 4. Storage policies for agent_documents bucket
DROP POLICY IF EXISTS "agents_upload_own_docs" ON storage.objects;
CREATE POLICY "agents_upload_own_docs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'agent_documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "agents_read_own_docs" ON storage.objects;
CREATE POLICY "agents_read_own_docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'agent_documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR is_management()
    )
  );

DROP POLICY IF EXISTS "agents_delete_own_docs" ON storage.objects;
CREATE POLICY "agents_delete_own_docs" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'agent_documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR is_management()
    )
  );
