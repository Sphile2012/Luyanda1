CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  to_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_broadcast boolean DEFAULT false,
  subject text NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_messages" ON messages FOR SELECT TO authenticated USING (
  from_user_id = auth.uid()
  OR to_user_id = auth.uid()
  OR is_broadcast = true
);

CREATE POLICY "insert_messages" ON messages FOR INSERT TO authenticated WITH CHECK (
  from_user_id = auth.uid()
);

CREATE POLICY "update_messages" ON messages FOR UPDATE TO authenticated USING (
  to_user_id = auth.uid() OR (is_broadcast = true)
) WITH CHECK (
  to_user_id = auth.uid() OR (is_broadcast = true)
);

CREATE POLICY "delete_messages" ON messages FOR DELETE TO authenticated USING (
  from_user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('management', 'admin'))
);
