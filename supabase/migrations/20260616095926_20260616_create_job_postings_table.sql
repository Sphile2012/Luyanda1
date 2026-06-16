CREATE TABLE job_postings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  salary_range TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_job_postings" ON job_postings FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "insert_job_postings" ON job_postings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "update_job_postings" ON job_postings FOR UPDATE
  TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "delete_job_postings" ON job_postings FOR DELETE
  TO authenticated USING (auth.uid() = created_by);
