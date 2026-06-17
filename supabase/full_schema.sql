-- ============================================================
-- DRIVE AGENCY — FULL DATABASE SCHEMA
-- Run this once in Supabase SQL Editor
-- ============================================================

-- ── 1. PROFILES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  city text DEFAULT '',
  province text DEFAULT '',
  role text NOT NULL DEFAULT 'pending'
    CHECK (role IN ('pending','remote_agent','inoffice_agent','management','admin')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','inactive','suspended')),
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.is_management()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('management','admin'));
$$;

DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE TO authenticated USING (is_management()) WITH CHECK (is_management());

-- ── 2. APPLICATIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  city text,
  province text,
  id_number text DEFAULT '',
  motivation text,
  how_heard text,
  cv_url text,
  popia_consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','declined')),
  decline_reason text,
  assigned_role text CHECK (assigned_role IN ('remote_agent','inoffice_agent','management','admin')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_applications" ON public.applications;
CREATE POLICY "insert_applications" ON public.applications FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "select_applications" ON public.applications;
CREATE POLICY "select_applications" ON public.applications FOR SELECT TO authenticated USING (is_management() OR email = (SELECT email FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "update_applications" ON public.applications;
CREATE POLICY "update_applications" ON public.applications FOR UPDATE TO authenticated USING (is_management());

-- ── 3. DEALER ENQUIRIES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dealer_enquiries (
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.dealer_enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_dealer_enquiries" ON public.dealer_enquiries;
CREATE POLICY "insert_dealer_enquiries" ON public.dealer_enquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "select_dealer_enquiries" ON public.dealer_enquiries;
CREATE POLICY "select_dealer_enquiries" ON public.dealer_enquiries FOR SELECT TO authenticated USING (is_management());

-- ── 4. BUYER LEADS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.buyer_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  email text,
  car_type text,
  employment_status text,
  popia_consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','closed')),
  assigned_agent_id uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.buyer_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_buyer_leads" ON public.buyer_leads;
CREATE POLICY "insert_buyer_leads" ON public.buyer_leads FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "select_buyer_leads" ON public.buyer_leads;
CREATE POLICY "select_buyer_leads" ON public.buyer_leads FOR SELECT TO authenticated USING (
  is_management() OR assigned_agent_id = auth.uid()
);

DROP POLICY IF EXISTS "update_buyer_leads" ON public.buyer_leads;
CREATE POLICY "update_buyer_leads" ON public.buyer_leads FOR UPDATE TO authenticated USING (
  is_management() OR assigned_agent_id = auth.uid()
);

-- ── 5. DEALERSHIPS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dealerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  province text,
  commission_rate numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  total_deals_sent integer DEFAULT 0,
  total_deals_closed integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_dealerships" ON public.dealerships;
CREATE POLICY "select_dealerships" ON public.dealerships FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "manage_dealerships" ON public.dealerships;
CREATE POLICY "manage_dealerships" ON public.dealerships FOR ALL TO authenticated USING (is_management());

-- ── 6. VEHICLES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  model text NOT NULL,
  year integer,
  colour text,
  mileage integer DEFAULT 0,
  price numeric NOT NULL,
  body_type text,
  condition text CHECK (condition IN ('new','used')),
  province text,
  dealership_id uuid REFERENCES public.dealerships(id),
  photos text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active_vehicles" ON public.vehicles;
CREATE POLICY "public_read_active_vehicles" ON public.vehicles FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "manage_vehicles" ON public.vehicles;
CREATE POLICY "manage_vehicles" ON public.vehicles FOR ALL TO authenticated USING (is_management());

-- ── 7. CLIENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES auth.users(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  id_number text,
  phone text NOT NULL,
  email text,
  occupation text,
  province text,
  vehicle_condition text DEFAULT 'either' CHECK (vehicle_condition IN ('new','used','either')),
  vehicle_brand text,
  vehicle_model text,
  vehicle_colour text,
  budget_range text,
  finance_needed boolean DEFAULT true,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','declined')),
  dealership_id uuid REFERENCES public.dealerships(id),
  decline_reason text,
  admin_notes text,
  commission_amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agents_insert_own_clients" ON public.clients;
CREATE POLICY "agents_insert_own_clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "select_clients" ON public.clients;
CREATE POLICY "select_clients" ON public.clients FOR SELECT TO authenticated USING (
  is_management() OR agent_id = auth.uid()
);

DROP POLICY IF EXISTS "update_clients" ON public.clients;
CREATE POLICY "update_clients" ON public.clients FOR UPDATE TO authenticated USING (
  is_management() OR agent_id = auth.uid()
);

-- ── 8. CLIENT DOCUMENTS ──────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('client_documents','client_documents',false) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS public.client_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN (
    'id_document','proof_of_income','proof_of_address','drivers_license',
    'bank_statement','client_photo','payslip','other'
  )),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_client_docs" ON public.client_documents;
CREATE POLICY "select_client_docs" ON public.client_documents FOR SELECT TO authenticated USING (
  is_management() OR EXISTS (SELECT 1 FROM clients WHERE clients.id = client_id AND clients.agent_id = auth.uid())
);

DROP POLICY IF EXISTS "insert_client_docs" ON public.client_documents;
CREATE POLICY "insert_client_docs" ON public.client_documents FOR INSERT TO authenticated WITH CHECK (
  is_management() OR EXISTS (SELECT 1 FROM clients WHERE clients.id = client_id AND clients.agent_id = auth.uid())
);

-- ── 9. AGENT DOCUMENTS ───────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('agent_documents','agent_documents',false) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS public.agent_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('id_document','drivers_license','bank_statement','payslip')),
  month_label text,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.agent_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agent_docs_select" ON public.agent_documents;
CREATE POLICY "agent_docs_select" ON public.agent_documents FOR SELECT TO authenticated USING (agent_id = auth.uid() OR is_management());

DROP POLICY IF EXISTS "agent_docs_insert" ON public.agent_documents;
CREATE POLICY "agent_docs_insert" ON public.agent_documents FOR INSERT TO authenticated WITH CHECK (agent_id = auth.uid());

DROP POLICY IF EXISTS "agent_docs_delete" ON public.agent_documents;
CREATE POLICY "agent_docs_delete" ON public.agent_documents FOR DELETE TO authenticated USING (agent_id = auth.uid() OR is_management());

-- ── 10. TASKS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_tasks" ON public.tasks;
CREATE POLICY "select_tasks" ON public.tasks FOR SELECT TO authenticated USING (is_management() OR assigned_to = auth.uid());

DROP POLICY IF EXISTS "insert_tasks" ON public.tasks;
CREATE POLICY "insert_tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (is_management());

DROP POLICY IF EXISTS "update_tasks" ON public.tasks;
CREATE POLICY "update_tasks" ON public.tasks FOR UPDATE TO authenticated USING (is_management() OR assigned_to = auth.uid());

DROP POLICY IF EXISTS "delete_tasks" ON public.tasks;
CREATE POLICY "delete_tasks" ON public.tasks FOR DELETE TO authenticated USING (is_management());

-- ── 11. MESSAGES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  to_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_broadcast boolean DEFAULT false,
  subject text NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_messages" ON public.messages;
CREATE POLICY "select_messages" ON public.messages FOR SELECT TO authenticated USING (
  from_user_id = auth.uid() OR to_user_id = auth.uid() OR is_broadcast = true
);

DROP POLICY IF EXISTS "insert_messages" ON public.messages;
CREATE POLICY "insert_messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (from_user_id = auth.uid());

DROP POLICY IF EXISTS "update_messages" ON public.messages;
CREATE POLICY "update_messages" ON public.messages FOR UPDATE TO authenticated USING (to_user_id = auth.uid() OR is_broadcast = true);

-- ── 12. JOB POSTINGS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL,
  location text NOT NULL,
  salary_range text NOT NULL,
  description text NOT NULL,
  requirements text NOT NULL,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_job_postings" ON public.job_postings;
CREATE POLICY "select_job_postings" ON public.job_postings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "manage_job_postings" ON public.job_postings;
CREATE POLICY "manage_job_postings" ON public.job_postings FOR ALL TO authenticated USING (is_management());

-- ── 13. SECURITY QUESTIONS ───────────────────────────────────
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

DROP POLICY IF EXISTS "select_own_sq" ON public.security_questions;
CREATE POLICY "select_own_sq" ON public.security_questions FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_sq" ON public.security_questions;
CREATE POLICY "insert_own_sq" ON public.security_questions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_sq" ON public.security_questions;
CREATE POLICY "update_own_sq" ON public.security_questions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

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

-- ── 14. VEHICLE PHOTOS BUCKET ────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle_photos','vehicle_photos',true) ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "public_read_vehicle_photos" ON storage.objects;
CREATE POLICY "public_read_vehicle_photos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'vehicle_photos');

DROP POLICY IF EXISTS "management_upload_vehicle_photos" ON storage.objects;
CREATE POLICY "management_upload_vehicle_photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vehicle_photos' AND is_management());

DROP POLICY IF EXISTS "management_delete_vehicle_photos" ON storage.objects;
CREATE POLICY "management_delete_vehicle_photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'vehicle_photos' AND is_management());

-- ── 15. HANDLE NEW USER TRIGGER ──────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
BEGIN
  BEGIN
    SELECT assigned_role INTO v_role
    FROM public.applications
    WHERE email = NEW.email AND status = 'approved'
    ORDER BY reviewed_at DESC
    LIMIT 1;

    v_full_name := COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(
        COALESCE(NEW.raw_user_meta_data->>'first_name','') || ' ' ||
        COALESCE(NEW.raw_user_meta_data->>'last_name','')
      ), ''),
      ''
    );

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, v_full_name, COALESCE(v_role, 'pending'))
    ON CONFLICT (id) DO UPDATE
      SET role = COALESCE(v_role, profiles.role),
          full_name = CASE WHEN v_full_name != '' THEN v_full_name ELSE profiles.full_name END,
          email = NEW.email;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed for %: %', NEW.email, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 16. SEED MANAGEMENT ACCOUNT ──────────────────────────────
-- Pre-approve the management email so when they sign up they get management role
INSERT INTO public.applications (
  first_name, last_name, email, phone, city, province,
  id_number, motivation, how_heard, popia_consent,
  status, assigned_role, reviewed_at
) VALUES (
  'Admin', 'User', 'poomeigh503@gmail.com', '0664268711',
  'Stellenbosch', 'western_cape',
  '0000000000000', 'Management account', 'internal', true,
  'approved', 'management', NOW()
) ON CONFLICT DO NOTHING;
