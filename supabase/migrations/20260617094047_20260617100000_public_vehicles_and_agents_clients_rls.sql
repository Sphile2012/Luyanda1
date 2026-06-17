-- Allow public (anon) to read active vehicles for the Cars page
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'vehicles' AND policyname = 'public_read_active_vehicles'
  ) THEN
    CREATE POLICY "public_read_active_vehicles" ON public.vehicles
      FOR SELECT TO anon, authenticated USING (is_active = true);
  END IF;
END $$;

-- Allow agents to insert their own clients
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'agents_insert_own_clients'
  ) THEN
    CREATE POLICY "agents_insert_own_clients" ON public.clients
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = agent_id);
  END IF;
END $$;

-- Allow agents to insert buyer_leads
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'buyer_leads' AND policyname = 'agents_insert_buyer_leads'
  ) THEN
    CREATE POLICY "agents_insert_buyer_leads" ON public.buyer_leads
      FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;
