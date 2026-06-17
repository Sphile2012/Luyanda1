import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qiosqfnmdielzcmcmxpv.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpb3NxZm5tZGllbHpjbWNteHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NzE2MDcsImV4cCI6MjA5NzA0NzYwN30.ns2xq2pdagPIeIoJv13gge-arlebd_FANAYf_zoFfJQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  role: 'pending' | 'remote_agent' | 'inoffice_agent' | 'management' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  avatar_url: string;
  created_at: string;
  updated_at: string;
};

export type Application = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  id_number: string;
  motivation: string;
  how_heard: string;
  cv_url: string;
  popia_consent: boolean;
  status: 'pending' | 'approved' | 'declined';
  decline_reason: string;
  assigned_role: 'remote_agent' | 'inoffice_agent' | 'management' | 'admin';
  reviewed_by: string;
  reviewed_at: string;
  created_at: string;
};

export type Client = {
  id: string;
  agent_id: string;
  first_name: string;
  last_name: string;
  id_number: string;
  phone: string;
  email: string;
  occupation: string;
  province: string;
  vehicle_condition: 'new' | 'used' | 'either';
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_colour: string;
  budget_range: string;
  finance_needed: boolean;
  notes: string;
  status: 'pending' | 'approved' | 'declined';
  dealership_id: string;
  decline_reason: string;
  admin_notes: string;
  commission_amount: number;
  created_at: string;
  updated_at: string;
};

export type BuyerLead = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  car_type: string;
  employment_status: string;
  popia_consent: boolean;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  assigned_agent_id: string;
  notes: string;
  created_at: string;
};

export type Dealership = {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  province: string;
  commission_rate: number;
  is_active: boolean;
  total_deals_sent: number;
  total_deals_closed: number;
  created_at: string;
};

export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  colour: string;
  mileage: number;
  price: number;
  body_type: string;
  condition: 'new' | 'used';
  province: string;
  dealership_id: string;
  photos: string[];
  is_active: boolean;
  created_at: string;
};

export type ClientDocument = {
  id: string;
  client_id: string;
  uploaded_by: string;
  document_type: 'id_document' | 'proof_of_income' | 'proof_of_address' | 'drivers_license' | 'bank_statement' | 'client_photo' | 'other';
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  assigned_by: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  is_broadcast: boolean;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export type AgentDocument = {
  id: string;
  agent_id: string;
  document_type: 'id_document' | 'drivers_license' | 'bank_statement' | 'payslip';
  month_label: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
};
