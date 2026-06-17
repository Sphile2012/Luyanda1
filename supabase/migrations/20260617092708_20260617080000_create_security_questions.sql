-- Security questions table for account recovery
CREATE TABLE IF NOT EXISTS public.security_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  question_1 text NOT NULL,
  answer_1_hash text NOT NULL,
  question_2 text NOT NULL,
  answer_2_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.security_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_security_questions" ON public.security_questions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_security_questions" ON public.security_questions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_security_questions" ON public.security_questions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_security_questions" ON public.security_questions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Function to return only questions (not answers) by email — used by unauthenticated recovery flow
CREATE OR REPLACE FUNCTION public.get_security_questions_for_email(p_email text)
RETURNS TABLE (question_1 text, question_2 text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT sq.question_1, sq.question_2
  FROM public.security_questions sq
  INNER JOIN auth.users u ON u.id = sq.user_id
  WHERE lower(u.email) = lower(p_email);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_security_questions_for_email(text) TO anon, authenticated;
