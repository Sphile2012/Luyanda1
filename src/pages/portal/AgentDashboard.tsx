import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, supabaseUrl, supabaseAnonKey } from '../../lib/supabase';
import type { Profile, Application, Client, BuyerLead, Vehicle, ClientDocument, Dealership, Task, Message, AgentDocument } from '../../lib/supabase';
import {
  Car, Users, FileText, TrendingUp, LogOut, Search, CircleCheck as CheckCircle,
  Eye, MapPin, DollarSign, ChartBar as BarChart3, ListFilter as Filter,
  Clock, Target, Award, Building, Folder, ClipboardList, MessageSquare, AlertCircle, CheckSquare,
  Upload, FolderOpen, CheckCircle2, ShoppingCart, X, Plus, FileCheck,
} from 'lucide-react';

type Tab = 'overview' | 'tasks' | 'messages' | 'inventory' | 'applications' | 'leads' | 'clients' | 'apply_client' | 'my_sales' | 'client_folder' | 'commission' | 'reports' | 'management' | 'my_documents';

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const AgentDashboard = () => {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const mainRef = useRef<HTMLElement>(null);

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Existing state
  const [applications, setApplications] = useState<Application[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<BuyerLead[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [agents, setAgents] = useState<Profile[]>([]);
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<BuyerLead | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [notes, setNotes] = useState('');

  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [addClientForm, setAddClientForm] = useState({ first_name: '', last_name: '', phone: '', email: '', occupation: '', province: '', vehicle_condition: 'either' as 'new' | 'used' | 'either', vehicle_brand: '', vehicle_model: '', vehicle_colour: '', budget_range: '', finance_needed: true, notes: '' });
  const [addLeadForm, setAddLeadForm] = useState({ first_name: '', last_name: '', phone: '', email: '', car_type: '', employment_status: '' });
  const [addClientError, setAddClientError] = useState('');
  const [addLeadError, setAddLeadError] = useState('');
  const [addClientLoading, setAddClientLoading] = useState(false);
  const [addLeadLoading, setAddLeadLoading] = useState(false);

  // Tasks & Messages state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);

  // Agent documents state
  const [agentDocs, setAgentDocs] = useState<AgentDocument[]>([]);
  const [docUploading, setDocUploading] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);

  // Client document upload state
  const [showClientDocModal, setShowClientDocModal] = useState(false);
  const [clientDocClient, setClientDocClient] = useState<Client | null>(null);
  const [clientDocFile, setClientDocFile] = useState<File | null>(null);
  const [clientDocType, setClientDocType] = useState<ClientDocument['document_type']>('id_document');
  const [clientApplicationType, setClientApplicationType] = useState<'rent' | 'own' | 'finance'>('finance');
  const [clientDocUploading, setClientDocUploading] = useState(false);
  const [clientDocError, setClientDocError] = useState<string | null>(null);

  // ── Apply Client tab state ──────────────────────────────────────────
  type ApplicationType = 'finance' | 'rental';
  type ApplyStep = 'type' | 'details' | 'documents' | 'review';

  const [applyStep, setApplyStep] = useState<ApplyStep>('type');
  const [applyType, setApplyType] = useState<ApplicationType>('finance');
  const [applyClientId, setApplyClientId] = useState<string>('');          // existing client or new
  const [applyNewClient, setApplyNewClient] = useState({
    first_name: '', last_name: '', phone: '', email: '',
    id_number: '', occupation: '', province: '',
    vehicle_brand: '', vehicle_model: '', vehicle_colour: '',
    budget_range: '', vehicle_condition: 'either' as 'new' | 'used' | 'either',
    finance_needed: true, notes: '',
  });
  const [applyDocs, setApplyDocs] = useState<
    Array<{ docType: ClientDocument['document_type']; file: File; label: string }>
  >([]);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const FINANCE_DOCS: Array<{ type: ClientDocument['document_type']; label: string; required: boolean }> = [
    { type: 'id_document',       label: 'SA ID Document',         required: true },
    { type: 'proof_of_income',   label: 'Proof of Income / Payslip', required: true },
    { type: 'proof_of_address',  label: 'Proof of Address',        required: true },
    { type: 'bank_statement',    label: 'Bank Statement (3 months)', required: true },
    { type: 'drivers_license',   label: "Driver's License",        required: false },
    { type: 'client_photo',      label: 'Client Photo',            required: false },
  ];

  const RENTAL_DOCS: Array<{ type: ClientDocument['document_type']; label: string; required: boolean }> = [
    { type: 'id_document',       label: 'SA ID Document',         required: true },
    { type: 'proof_of_income',   label: 'Proof of Income / Payslip', required: true },
    { type: 'proof_of_address',  label: 'Proof of Address',        required: true },
    { type: 'bank_statement',    label: 'Bank Statement (3 months)', required: false },
    { type: 'client_photo',      label: 'Client Photo',            required: false },
  ];

  const currentDocList = applyType === 'finance' ? FINANCE_DOCS : RENTAL_DOCS;

  const resetApply = () => {
    setApplyStep('type');
    setApplyType('finance');
    setApplyClientId('');
    setApplyNewClient({ first_name: '', last_name: '', phone: '', email: '', id_number: '', occupation: '', province: '', vehicle_brand: '', vehicle_model: '', vehicle_colour: '', budget_range: '', vehicle_condition: 'either', finance_needed: true, notes: '' });
    setApplyDocs([]);
    setApplyError(null);
    setApplySuccess(false);
  };

  const handleApplyDocFile = (docType: ClientDocument['document_type'], label: string, file: File | null) => {
    if (!file) {
      setApplyDocs(prev => prev.filter(d => d.docType !== docType));
      return;
    }
    setApplyDocs(prev => {
      const filtered = prev.filter(d => d.docType !== docType);
      return [...filtered, { docType, file, label }];
    });
  };

  const handleApplySubmit = async () => {
    if (!user) return;
    setApplySubmitting(true);
    setApplyError(null);

    try {
      // 1. Create the client record
      const clientPayload = {
        ...applyNewClient,
        agent_id: user.id,
        status: 'pending' as const,
        finance_needed: applyType === 'finance',
        notes: applyNewClient.notes || `Application type: ${applyType}`,
      };
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert([clientPayload])
        .select()
        .single();

      if (clientError || !newClient) {
        setApplyError(clientError?.message || 'Failed to create client. Please try again.');
        setApplySubmitting(false);
        return;
      }

      // 2. Upload each document
      for (const doc of applyDocs) {
        const ext = doc.file.name.split('.').pop();
        const filePath = `${newClient.id}/${doc.docType}-${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('client_documents')
          .upload(filePath, doc.file);
        if (uploadErr) continue; // non-fatal — don't block the whole submission

        await supabase.from('client_documents').insert({
          client_id: newClient.id,
          uploaded_by: user.id,
          document_type: doc.docType,
          application_type: applyType === 'finance' ? 'finance' : 'rent',
          file_name: doc.file.name,
          file_path: filePath,
          file_size: doc.file.size,
          mime_type: doc.file.type,
          description: `${doc.label} — ${applyType}`,
        });
      }

      // 3. Send confirmation email if client has email
      if (applyNewClient.email) {
        fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseAnonKey}`, 'apikey': supabaseAnonKey },
          body: JSON.stringify({ type: 'client_signup', to: applyNewClient.email, name: applyNewClient.first_name }),
        }).catch(() => {});
      }

      await fetchData(isManagement);
      setApplySuccess(true);
      setApplyStep('review');
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setApplySubmitting(false);
    }
  };

  const isManagement = profile?.role === 'management' || profile?.role === 'admin';

  useEffect(() => {
    if (authLoading) return;
    if (!user || !profile) { navigate('/portal'); return; }
    if (!['remote_agent', 'inoffice_agent', 'management', 'admin'].includes(profile.role)) { navigate('/portal'); return; }
    fetchData(profile.role === 'management' || profile.role === 'admin');
  }, [user, profile, authLoading, navigate]);

  const fetchData = async (isMgmt: boolean) => {
    setLoading(true);

    const { data: vehiclesData } = await supabase.from('vehicles').select('*').eq('is_active', true).order('created_at', { ascending: false });
    const { data: dealershipsData } = await supabase.from('dealerships').select('*').eq('is_active', true);
    const { data: tasksData } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    const { data: messagesData } = await supabase.from('messages').select('*').order('created_at', { ascending: false });

    if (isMgmt) {
      const [{ data: applicationsData }, { data: clientsData }, { data: leadsData }, { data: agentsData }, { data: documentsData }] = await Promise.all([
        supabase.from('applications').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('buyer_leads').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: true }),
        supabase.from('client_documents').select('*').order('created_at', { ascending: false }),
      ]);
      if (applicationsData) setApplications(applicationsData as Application[]);
      if (clientsData) setClients(clientsData as Client[]);
      if (leadsData) setLeads(leadsData as BuyerLead[]);
      if (agentsData) setAgents(agentsData as Profile[]);
      if (documentsData) setDocuments(documentsData as ClientDocument[]);
    } else {
      const [{ data: clientsData }, { data: leadsData }, { data: documentsData }] = await Promise.all([
        supabase.from('clients').select('*').eq('agent_id', user?.id).order('created_at', { ascending: false }),
        supabase.from('buyer_leads').select('*').eq('assigned_agent_id', user?.id).order('created_at', { ascending: false }),
        supabase.from('client_documents').select('*').order('created_at', { ascending: false }),
      ]);
      if (clientsData) setClients(clientsData as Client[]);
      if (leadsData) setLeads(leadsData as BuyerLead[]);
      if (documentsData) setDocuments(documentsData as ClientDocument[]);
      const { data: applicationsData } = await supabase.from('applications').select('*').eq('email', profile?.email);
      if (applicationsData) setApplications(applicationsData as Application[]);
    }

    if (vehiclesData) setVehicles(vehiclesData as Vehicle[]);
    if (dealershipsData) setDealerships(dealershipsData as Dealership[]);
    if (tasksData) setTasks(tasksData as Task[]);
    if (messagesData) setMessages(messagesData as Message[]);

    if (user) {
      const { data: myDocs } = await supabase.from('agent_documents').select('*').eq('agent_id', user.id).order('created_at', { ascending: true });
      if (myDocs) setAgentDocs(myDocs as AgentDocument[]);
    }

    setLoading(false);
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const updateLeadStatus = async (leadId: string, status: 'new' | 'contacted' | 'qualified' | 'closed') => {
    const { error } = await supabase.from('buyer_leads').update({ status, notes: notes || undefined }).eq('id', leadId);
    if (!error) { setLeads(leads.map(l => l.id === leadId ? { ...l, status } : l)); setShowLeadModal(false); setNotes(''); }
  };

  const updateClientStatus = async (clientId: string, status: 'pending' | 'approved' | 'declined') => {
    const { error } = await supabase.from('clients').update({ status, updated_at: new Date().toISOString() }).eq('id', clientId);
    if (!error) { setClients(clients.map(c => c.id === clientId ? { ...c, status } : c)); setShowClientModal(false); }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddClientLoading(true);
    setAddClientError('');
    const { error } = await supabase.from('clients').insert([{ ...addClientForm, agent_id: user?.id, status: 'pending' }]);
    if (error) { setAddClientError(error.message); setAddClientLoading(false); return; }
    // Send signup confirmation email if client has an email address
    if (addClientForm.email) {
      fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseAnonKey}` },
        body: JSON.stringify({ type: 'client_signup', to: addClientForm.email, name: addClientForm.first_name }),
      }).catch(() => {});
    }
    await fetchData(isManagement);
    setShowAddClientModal(false);
    setAddClientForm({ first_name: '', last_name: '', phone: '', email: '', occupation: '', province: '', vehicle_condition: 'either', vehicle_brand: '', vehicle_model: '', vehicle_colour: '', budget_range: '', finance_needed: true, notes: '' });
    setAddClientLoading(false);
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLeadLoading(true);
    setAddLeadError('');
    const { error } = await supabase.from('buyer_leads').insert([{ ...addLeadForm, assigned_agent_id: user?.id, status: 'new', popia_consent: true }]);
    if (error) { setAddLeadError(error.message); setAddLeadLoading(false); return; }
    await fetchData(isManagement);
    setShowAddLeadModal(false);
    setAddLeadForm({ first_name: '', last_name: '', phone: '', email: '', car_type: '', employment_status: '' });
    setAddLeadLoading(false);
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === 'completed') updates.completed_at = new Date().toISOString();
    const { error } = await supabase.from('tasks').update(updates).eq('id', taskId);
    if (!error) setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
  };

  const markAsRead = async (msgId: string) => {
    const { error } = await supabase.from('messages').update({ is_read: true }).eq('id', msgId);
    if (!error) setMessages(messages.map(m => m.id === msgId ? { ...m, is_read: true } : m));
  };

  const uploadAgentDoc = async (
    docType: AgentDocument['document_type'],
    monthLabel: string | null,
    file: File
  ) => {
    if (!user) return;
    const key = monthLabel ? `${docType}-${monthLabel}` : docType;
    setDocUploading(key);
    setDocError(null);

    const ext = file.name.split('.').pop();
    const path = `${user.id}/${docType}${monthLabel ? `-${monthLabel}` : ''}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from('agent_documents').upload(path, file, { upsert: false });
    if (uploadError) {
      setDocError(`Upload failed: ${uploadError.message}`);
      setDocUploading(null);
      return;
    }

    // Remove previous record for same type+month if exists
    const existing = agentDocs.find(d => d.document_type === docType && d.month_label === monthLabel);
    if (existing) {
      await supabase.storage.from('agent_documents').remove([existing.file_path]);
      await supabase.from('agent_documents').delete().eq('id', existing.id);
    }

    const { data: newDoc, error: insertError } = await supabase.from('agent_documents').insert({
      agent_id: user.id,
      document_type: docType,
      month_label: monthLabel,
      file_name: file.name,
      file_path: path,
      file_size: file.size,
      mime_type: file.type,
    }).select().single();

    if (insertError) {
      setDocError(`Save failed: ${insertError.message}`);
    } else if (newDoc) {
      setAgentDocs(prev => {
        const filtered = prev.filter(d => !(d.document_type === docType && d.month_label === monthLabel));
        return [...filtered, newDoc as AgentDocument];
      });
    }
    setDocUploading(null);
  };

  const getSignedDocUrl = async (filePath: string) => {
    const { data } = await supabase.storage.from('agent_documents').createSignedUrl(filePath, 60);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  const handleClientDocUpload = async () => {
    if (!clientDocFile || !clientDocClient || !user) return;
    setClientDocUploading(true);
    setClientDocError(null);

    const fileExt = clientDocFile.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${clientDocClient.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('client_documents')
      .upload(filePath, clientDocFile);

    if (uploadError) {
      setClientDocError('Upload failed: ' + uploadError.message);
      setClientDocUploading(false);
      return;
    }

    const { error: dbError } = await supabase.from('client_documents').insert({
      client_id: clientDocClient.id,
      uploaded_by: user.id,
      document_type: clientDocType,
      application_type: clientApplicationType,
      file_name: clientDocFile.name,
      file_path: filePath,
      file_size: clientDocFile.size,
      mime_type: clientDocFile.type,
      description: `${clientDocType.replace(/_/g, ' ')} — ${clientApplicationType}`,
    });

    if (dbError) {
      setClientDocError('Failed to save document record: ' + dbError.message);
      setClientDocUploading(false);
      return;
    }

    await fetchData(isManagement);
    setShowClientDocModal(false);
    setClientDocFile(null);
    setClientDocType('id_document');
    setClientApplicationType('finance');
    setClientDocUploading(false);
  };

  const getStats = () => {
    const myClients = isManagement ? clients : clients.filter(c => c.agent_id === user?.id);
    const myLeads = isManagement ? leads : leads.filter(l => l.assigned_agent_id === user?.id);
    return {
      pendingDeals: myClients.filter(c => c.status === 'pending').length,
      closedDeals: myClients.filter(c => c.status === 'approved').length,
      totalCommission: myClients.filter(c => c.status === 'approved').reduce((sum, c) => sum + (c.commission_amount || 0), 0),
      activeLeads: myLeads.filter(l => l.status !== 'closed').length,
    };
  };

  const stats = getStats();
  const myTasks = isManagement ? tasks : tasks.filter(t => t.assigned_to === user?.id);
  const myMessages = messages.filter(m => m.to_user_id === user?.id || m.is_broadcast);
  const unreadCount = myMessages.filter(m => !m.is_read).length;
  const pendingTaskCount = myTasks.filter(t => t.status === 'pending').length;

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) || v.model?.toLowerCase().includes(searchTerm.toLowerCase()) || v.province?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.condition === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredLeads = leads.filter(l =>
    l.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const sidebarItems: Array<{ id: string; label: string; icon: React.ElementType; badge?: number }> = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'tasks', label: 'My Tasks', icon: ClipboardList, badge: pendingTaskCount },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount },
    { id: 'inventory', label: 'Inventory Browser', icon: Car },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'clients', label: 'My Clients', icon: Users },
    { id: 'apply_client', label: 'Apply for Client', icon: FileCheck },
    { id: 'my_sales', label: 'My Sales', icon: ShoppingCart },
    { id: 'client_folder', label: 'Client Folder', icon: Folder },
    { id: 'commission', label: 'Commission Tracker', icon: DollarSign },
  ];
  if (isManagement) sidebarItems.push({ id: 'management', label: 'Agent Management', icon: TrendingUp });
  sidebarItems.push({ id: 'reports', label: 'Reports & Analytics', icon: Target });
  sidebarItems.push({ id: 'my_documents', label: 'My Documents', icon: FolderOpen });

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-900 text-white flex flex-col overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-navy-700">
          <div className="flex items-center gap-2">
            <Car className="w-8 h-8 text-brand-400" />
            <span className="text-lg font-bold">Drive Agency</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{isManagement ? 'Management Portal' : 'Agent Portal'}</p>
        </div>
        <nav className="flex-1 py-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => switchTab(item.id as Tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === item.id ? 'bg-brand-500 text-white' : 'text-gray-300 hover:bg-navy-800 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-navy-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">
              {profile?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{profile?.full_name}</p>
              <p className="text-xs text-gray-400 truncate">{profile?.role}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 rounded bg-red-600 hover:bg-red-700 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main ref={mainRef} className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">{isManagement ? 'Agent Dashboard' : 'My Dashboard'}</h1>
            <p className="text-gray-600">Welcome back, {profile?.full_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Pending Deals', value: stats.pendingDeals, icon: Clock, bg: 'bg-yellow-100', color: 'text-yellow-600' },
                { label: 'Closed Deals', value: stats.closedDeals, icon: CheckCircle, bg: 'bg-green-100', color: 'text-green-600' },
                { label: 'Total Commission', value: `R ${stats.totalCommission.toLocaleString('en-ZA')}`, icon: DollarSign, bg: 'bg-brand-100', color: 'text-brand-600' },
                { label: 'Active Leads', value: stats.activeLeads, icon: Users, bg: 'bg-blue-100', color: 'text-blue-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${s.bg} flex items-center justify-center`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
                    <div><p className="text-sm text-gray-600">{s.label}</p><p className="text-2xl font-bold text-navy-900">{s.value}</p></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Open Tasks', value: myTasks.filter(t => t.status === 'pending').length, icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                { label: 'In Progress', value: myTasks.filter(t => t.status === 'in_progress').length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Unread Messages', value: unreadCount, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-xl p-4 flex items-center gap-3`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                  <div><p className="text-sm text-gray-600">{s.label}</p><p className="text-2xl font-bold text-navy-900">{s.value}</p></div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">My Tasks</h3>
                <div className="space-y-3">
                  {myTasks.filter(t => t.status !== 'completed').slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-navy-900 text-sm">{task.title}</p>
                        {task.due_date && <p className="text-xs text-gray-500">Due {new Date(task.due_date).toLocaleDateString()}</p>}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${priorityColors[task.priority]}`}>{task.priority}</span>
                    </div>
                  ))}
                  {myTasks.filter(t => t.status !== 'completed').length === 0 && <p className="text-sm text-gray-400 text-center py-4">No open tasks</p>}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">Recent Clients</h3>
                <div className="space-y-3">
                  {clients.slice(0, 5).map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-navy-900">{client.first_name} {client.last_name}</p>
                        <p className="text-sm text-gray-600">{client.vehicle_brand} {client.vehicle_model}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        client.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        client.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{client.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── My Tasks ── */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-navy-900">My Tasks</h2>
              <p className="text-gray-500 text-sm">Track and update your assigned tasks</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Pending', value: myTasks.filter(t => t.status === 'pending').length, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
                { label: 'In Progress', value: myTasks.filter(t => t.status === 'in_progress').length, icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
                { label: 'Completed', value: myTasks.filter(t => t.status === 'completed').length, icon: CheckSquare, color: 'text-green-600', bg: 'bg-green-100' },
                { label: 'Overdue', value: myTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                  <div><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {myTasks.length === 0 && (
                <div className="bg-white rounded-xl p-12 shadow-sm text-center text-gray-400">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No tasks assigned to you yet</p>
                </div>
              )}
              {myTasks.map((task) => {
                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
                return (
                  <div key={task.id} className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${
                    task.status === 'completed' ? 'border-green-400' :
                    isOverdue ? 'border-red-400' :
                    task.priority === 'urgent' ? 'border-red-400' :
                    task.priority === 'high' ? 'border-orange-400' :
                    'border-brand-400'
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-navy-900'}`}>{task.title}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${priorityColors[task.priority]}`}>{task.priority}</span>
                        </div>
                        {task.description && <p className="text-sm text-gray-600 mb-2">{task.description}</p>}
                        {task.due_date && (
                          <p className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {isOverdue ? '⚠ Overdue · ' : 'Due '}
                            {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Messages ── */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-navy-900">Messages</h2>
              <p className="text-gray-500 text-sm">{unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up'}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <p className="font-semibold text-navy-900">Inbox</p>
                </div>
                <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                  {myMessages.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No messages</div>}
                  {myMessages.map((msg) => {
                    const isUnread = !msg.is_read;
                    return (
                      <button
                        key={msg.id}
                        onClick={() => { setSelectedMsg(msg); if (isUnread) markAsRead(msg.id); }}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedMsg?.id === msg.id ? 'bg-brand-50' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {isUnread && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0"></span>}
                              <p className={`text-sm truncate ${isUnread ? 'font-bold text-navy-900' : 'font-medium text-gray-700'}`}>{msg.subject}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{msg.is_broadcast ? 'Announcement' : 'Management'}</p>
                          </div>
                          <p className="text-xs text-gray-400 flex-shrink-0">{new Date(msg.created_at).toLocaleDateString()}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
                {selectedMsg ? (
                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-navy-900">{selectedMsg.subject}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedMsg.is_broadcast ? 'Announcement to all agents' : 'From Management'} · {new Date(selectedMsg.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedMsg.content}</div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-8 text-gray-400">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Select a message to read</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Inventory ── */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="all">All Conditions</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by brand, model, or province..." className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => {
                const dealership = dealerships.find(d => d.id === vehicle.dealership_id);
                return (
                  <div key={vehicle.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                      {vehicle.photos?.[0] ? <img src={vehicle.photos[0]} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" /> : <Car className="w-16 h-16 text-gray-400" />}
                      <span className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-medium ${vehicle.condition === 'new' ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white'}`}>{vehicle.condition}</span>
                    </div>
                    <div className="p-5">
                      <h4 className="text-lg font-semibold text-navy-900">{vehicle.brand} {vehicle.model}</h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>{vehicle.year} | {vehicle.body_type}</p>
                        <p>{vehicle.colour} | {vehicle.mileage?.toLocaleString()} km</p>
                        <p className="flex items-center gap-1"><MapPin className="w-4 h-4" />{vehicle.province}</p>
                        {dealership && <p className="flex items-center gap-1"><Building className="w-4 h-4" />{dealership.name}</p>}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xl font-bold text-brand-500">R {vehicle.price.toLocaleString('en-ZA')}</p>
                        <button className="btn-primary text-sm px-4 py-2">View Details</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Applications ── */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-navy-900">{isManagement ? 'All Applications' : 'My Application'}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4"><p className="font-medium text-navy-900">{app.first_name} {app.last_name}</p><p className="text-sm text-gray-500">{app.email}</p></td>
                      <td className="px-4 py-4 text-gray-600">{app.city}, {app.province}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : app.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{app.status}</span>
                      </td>
                      <td className="px-4 py-4 text-gray-600 text-sm">{new Date(app.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-4"><button className="p-2 rounded hover:bg-gray-100 text-brand-600"><Eye className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Leads ── */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm flex gap-3 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search leads..." className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              {!isManagement && (
                <button onClick={() => setShowAddLeadModal(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
                  + Add Lead
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'New', value: leads.filter(l => l.status === 'new').length, color: 'text-blue-600' },
                { label: 'Contacted', value: leads.filter(l => l.status === 'contacted').length, color: 'text-yellow-600' },
                { label: 'Qualified', value: leads.filter(l => l.status === 'qualified').length, color: 'text-green-600' },
                { label: 'Closed', value: leads.filter(l => l.status === 'closed').length, color: 'text-gray-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label} Leads</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Car Interest</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4"><p className="font-medium text-navy-900">{lead.first_name} {lead.last_name}</p><p className="text-sm text-gray-500">{lead.email}</p></td>
                      <td className="px-4 py-4 text-gray-600">{lead.car_type}</td>
                      <td className="px-4 py-4 text-gray-600">{lead.employment_status}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${lead.status === 'new' ? 'bg-blue-100 text-blue-700' : lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' : lead.status === 'qualified' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{lead.status}</span>
                      </td>
                      <td className="px-4 py-4 text-gray-600 text-sm">{new Date(lead.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        <button onClick={() => { setSelectedLead(lead); setNotes(lead.notes || ''); setShowLeadModal(true); }} className="btn-secondary text-sm px-3 py-1">Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Clients ── */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-navy-900">{isManagement ? 'All Clients' : 'My Clients'}</h3>
              {!isManagement && (
                <button onClick={() => setShowAddClientModal(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors">
                  + Add Client
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4"><p className="font-medium text-navy-900">{client.first_name} {client.last_name}</p><p className="text-sm text-gray-500">{client.phone}</p></td>
                      <td className="px-4 py-4"><p className="text-navy-900">{client.vehicle_brand} {client.vehicle_model}</p><p className="text-sm text-gray-500">{client.vehicle_colour} | {client.vehicle_condition}</p></td>
                      <td className="px-4 py-4 text-gray-600">{client.budget_range}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${client.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : client.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{client.status}</span>
                      </td>
                      <td className="px-4 py-4">
                        <button onClick={() => { setSelectedClient(client); setShowClientModal(true); }} className="btn-secondary text-sm px-3 py-1">Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Apply for Client ── */}
        {activeTab === 'apply_client' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-navy-900">Apply for Client</h2>
                <p className="text-gray-500 text-sm mt-0.5">Submit a finance or rental application on behalf of a client</p>
              </div>
              {(applyStep !== 'type' && !applySuccess) && (
                <button onClick={resetApply} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
                  Start Over
                </button>
              )}
            </div>

            {/* Progress bar */}
            {!applySuccess && (
              <div className="flex items-center gap-2">
                {(['type', 'details', 'documents', 'review'] as ApplyStep[]).map((step, i) => {
                  const stepLabels: Record<ApplyStep, string> = { type: 'Application Type', details: 'Client Details', documents: 'Documents', review: 'Review & Submit' };
                  const stepIdx = ['type', 'details', 'documents', 'review'].indexOf(applyStep);
                  const done = i < stepIdx;
                  const active = step === applyStep;
                  return (
                    <div key={step} className="flex items-center gap-2 flex-1">
                      <div className={`flex items-center gap-2 flex-1 ${i > 0 ? 'pl-2' : ''}`}>
                        {i > 0 && <div className={`h-0.5 flex-1 ${done || active ? 'bg-brand-500' : 'bg-gray-200'}`} />}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          done ? 'bg-brand-500 text-white' : active ? 'bg-brand-500 text-white ring-4 ring-brand-100' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {done ? '✓' : i + 1}
                        </div>
                        <span className={`text-xs font-medium whitespace-nowrap ${active ? 'text-brand-600' : done ? 'text-gray-700' : 'text-gray-400'}`}>
                          {stepLabels[step]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Step 1: Application Type ── */}
            {applyStep === 'type' && (
              <div className="max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {([
                    {
                      value: 'finance' as ApplicationType,
                      label: 'Vehicle Finance',
                      desc: 'Client wants to purchase a vehicle through a bank or financial institution.',
                      icon: DollarSign,
                      color: 'brand',
                      docs: ['SA ID', 'Payslip', 'Bank Statements', 'Proof of Address'],
                    },
                    {
                      value: 'rental' as ApplicationType,
                      label: 'Vehicle Rental',
                      desc: 'Client wants to rent a vehicle on a monthly or fixed-term basis.',
                      icon: Car,
                      color: 'purple',
                      docs: ['SA ID', 'Payslip', 'Proof of Address'],
                    },
                  ]).map(({ value, label, desc, icon: Icon, color, docs }) => (
                    <button
                      key={value}
                      onClick={() => setApplyType(value)}
                      className={`p-6 rounded-2xl border-2 text-left transition-all hover:shadow-md ${
                        applyType === value
                          ? color === 'brand' ? 'border-brand-500 bg-brand-50' : 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
                        applyType === value
                          ? color === 'brand' ? 'bg-brand-500' : 'bg-purple-500'
                          : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${applyType === value ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <p className={`text-lg font-bold mb-1 ${applyType === value ? (color === 'brand' ? 'text-brand-700' : 'text-purple-700') : 'text-navy-900'}`}>{label}</p>
                      <p className="text-sm text-gray-500 mb-4">{desc}</p>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">Required documents:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {docs.map(d => (
                            <span key={d} className="px-2 py-0.5 bg-white border border-gray-200 text-xs text-gray-600 rounded-full">{d}</span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setApplyStep('details')}
                  className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors"
                >
                  Continue with {applyType === 'finance' ? 'Finance' : 'Rental'} →
                </button>
              </div>
            )}

            {/* ── Step 2: Client Details ── */}
            {applyStep === 'details' && (
              <div className="max-w-3xl bg-white rounded-2xl shadow-sm p-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-6 ${applyType === 'finance' ? 'bg-brand-100 text-brand-700' : 'bg-purple-100 text-purple-700'}`}>
                  {applyType === 'finance' ? <DollarSign className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                  {applyType === 'finance' ? 'Vehicle Finance Application' : 'Vehicle Rental Application'}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">First Name *</label>
                    <input className="input-field" placeholder="John" value={applyNewClient.first_name} onChange={e => setApplyNewClient(p => ({ ...p, first_name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label">Last Name *</label>
                    <input className="input-field" placeholder="Doe" value={applyNewClient.last_name} onChange={e => setApplyNewClient(p => ({ ...p, last_name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label">Phone Number *</label>
                    <input className="input-field" placeholder="071 234 5678" value={applyNewClient.phone} onChange={e => setApplyNewClient(p => ({ ...p, phone: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input className="input-field" type="email" placeholder="john@example.com" value={applyNewClient.email} onChange={e => setApplyNewClient(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">SA ID Number *</label>
                    <input className="input-field" placeholder="9001015009087" value={applyNewClient.id_number} onChange={e => setApplyNewClient(p => ({ ...p, id_number: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label">Occupation</label>
                    <input className="input-field" placeholder="e.g. Teacher" value={applyNewClient.occupation} onChange={e => setApplyNewClient(p => ({ ...p, occupation: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Province *</label>
                    <select className="input-field" value={applyNewClient.province} onChange={e => setApplyNewClient(p => ({ ...p, province: e.target.value }))}>
                      <option value="">Select province</option>
                      {['Gauteng','Western Cape','KwaZulu-Natal','Limpopo','Mpumalanga','North West','Northern Cape','Eastern Cape','Free State'].map(prov => (
                        <option key={prov} value={prov.toLowerCase().replace(/ /g,'_')}>{prov}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Budget Range *</label>
                    <select className="input-field" value={applyNewClient.budget_range} onChange={e => setApplyNewClient(p => ({ ...p, budget_range: e.target.value }))}>
                      <option value="">Select range</option>
                      {['Under R100k','R100k – R200k','R200k – R350k','R350k – R500k','R500k – R800k','R800k+'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Vehicle Brand</label>
                    <input className="input-field" placeholder="e.g. Toyota" value={applyNewClient.vehicle_brand} onChange={e => setApplyNewClient(p => ({ ...p, vehicle_brand: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Vehicle Model</label>
                    <input className="input-field" placeholder="e.g. Corolla" value={applyNewClient.vehicle_model} onChange={e => setApplyNewClient(p => ({ ...p, vehicle_model: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Preferred Colour</label>
                    <input className="input-field" placeholder="e.g. White" value={applyNewClient.vehicle_colour} onChange={e => setApplyNewClient(p => ({ ...p, vehicle_colour: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Condition Preference</label>
                    <select className="input-field" value={applyNewClient.vehicle_condition} onChange={e => setApplyNewClient(p => ({ ...p, vehicle_condition: e.target.value as 'new'|'used'|'either' }))}>
                      <option value="either">Either</option>
                      <option value="new">New</option>
                      <option value="used">Used</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Additional Notes</label>
                    <textarea className="input-field" rows={3} placeholder="Any extra details about this application…" value={applyNewClient.notes} onChange={e => setApplyNewClient(p => ({ ...p, notes: e.target.value }))} />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setApplyStep('type')} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors">← Back</button>
                  <button
                    onClick={() => {
                      if (!applyNewClient.first_name || !applyNewClient.last_name || !applyNewClient.phone || !applyNewClient.id_number || !applyNewClient.province || !applyNewClient.budget_range) {
                        setApplyError('Please fill in all required fields (*).');
                        return;
                      }
                      setApplyError(null);
                      setApplyStep('documents');
                    }}
                    className="px-8 py-2.5 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors"
                  >
                    Continue to Documents →
                  </button>
                </div>
                {applyError && <p className="mt-3 text-sm text-red-600">{applyError}</p>}
              </div>
            )}

            {/* ── Step 3: Documents ── */}
            {applyStep === 'documents' && (
              <div className="max-w-3xl">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-6 ${applyType === 'finance' ? 'bg-brand-100 text-brand-700' : 'bg-purple-100 text-purple-700'}`}>
                  {applyType === 'finance' ? <DollarSign className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                  {applyType === 'finance' ? 'Finance Documents' : 'Rental Documents'} — {applyNewClient.first_name} {applyNewClient.last_name}
                </div>

                <div className="space-y-3">
                  {currentDocList.map(({ type, label, required }) => {
                    const uploaded = applyDocs.find(d => d.docType === type);
                    return (
                      <div key={type} className={`bg-white rounded-xl p-4 border-2 transition-all ${uploaded ? 'border-green-400' : required ? 'border-dashed border-gray-300' : 'border-dashed border-gray-200'}`}>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${uploaded ? 'bg-green-100' : 'bg-gray-100'}`}>
                              {uploaded ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <FileText className="w-5 h-5 text-gray-400" />}
                            </div>
                            <div>
                              <p className="font-medium text-navy-900 text-sm">
                                {label}
                                {required && <span className="text-red-500 ml-1">*</span>}
                              </p>
                              {uploaded
                                ? <p className="text-xs text-green-600 mt-0.5">✓ {uploaded.file.name} ({(uploaded.file.size / 1024).toFixed(0)} KB)</p>
                                : <p className="text-xs text-gray-400 mt-0.5">{required ? 'Required' : 'Optional'} · PDF, JPG, PNG</p>
                              }
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              uploaded
                                ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                : 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200'
                            }`}>
                              <Upload className="w-3.5 h-3.5" />
                              {uploaded ? 'Replace' : 'Upload'}
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                className="hidden"
                                onChange={e => handleApplyDocFile(type, label, e.target.files?.[0] ?? null)}
                              />
                            </label>
                            {uploaded && (
                              <button onClick={() => handleApplyDocFile(type, label, null)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition-colors" title="Remove">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                  <strong>Tip:</strong> Upload at least all required (*) documents. You can still submit without optional documents and add them later via Client Folder.
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setApplyStep('details')} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors">← Back</button>
                  <button
                    onClick={() => {
                      const missingRequired = currentDocList.filter(d => d.required && !applyDocs.find(u => u.docType === d.type));
                      if (missingRequired.length > 0) {
                        setApplyError(`Please upload the following required documents: ${missingRequired.map(d => d.label).join(', ')}`);
                        return;
                      }
                      setApplyError(null);
                      setApplyStep('review');
                    }}
                    className="px-8 py-2.5 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors"
                  >
                    Review Application →
                  </button>
                </div>
                {applyError && <p className="mt-3 text-sm text-red-600">{applyError}</p>}
              </div>
            )}

            {/* ── Step 4: Review & Submit ── */}
            {applyStep === 'review' && !applySuccess && (
              <div className="max-w-3xl space-y-4">
                <div className={`p-4 rounded-xl flex items-center gap-3 font-semibold text-sm ${applyType === 'finance' ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                  {applyType === 'finance' ? <DollarSign className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                  Application Type: {applyType === 'finance' ? 'Vehicle Finance' : 'Vehicle Rental'}
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="font-bold text-navy-900 mb-4">Client Details</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    {[
                      ['Name', `${applyNewClient.first_name} ${applyNewClient.last_name}`],
                      ['Phone', applyNewClient.phone],
                      ['Email', applyNewClient.email || '—'],
                      ['ID Number', applyNewClient.id_number],
                      ['Occupation', applyNewClient.occupation || '—'],
                      ['Province', applyNewClient.province],
                      ['Budget', applyNewClient.budget_range],
                      ['Vehicle', `${applyNewClient.vehicle_brand} ${applyNewClient.vehicle_model}`.trim() || '—'],
                      ['Colour', applyNewClient.vehicle_colour || '—'],
                      ['Condition', applyNewClient.vehicle_condition],
                    ].map(([key, val]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-gray-500 w-28 flex-shrink-0">{key}</span>
                        <span className="font-medium text-navy-900">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="font-bold text-navy-900 mb-4">Documents ({applyDocs.length})</h3>
                  {applyDocs.length === 0
                    ? <p className="text-sm text-gray-400">No documents attached.</p>
                    : (
                      <div className="space-y-2">
                        {applyDocs.map(d => (
                          <div key={d.docType} className="flex items-center gap-3 p-2.5 bg-green-50 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm font-medium text-navy-900">{d.label}</span>
                            <span className="text-xs text-gray-500 ml-auto">{d.file.name}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }
                </div>

                {applyError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{applyError}</div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setApplyStep('documents')} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors">← Back</button>
                  <button
                    onClick={handleApplySubmit}
                    disabled={applySubmitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {applySubmitting ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                    ) : (
                      <><FileCheck className="w-5 h-5" /> Submit Application</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── Success ── */}
            {applySuccess && (
              <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm p-10 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-2">Application Submitted!</h3>
                <p className="text-gray-500 mb-2">
                  The {applyType === 'finance' ? 'finance' : 'rental'} application for <strong>{applyNewClient.first_name} {applyNewClient.last_name}</strong> has been submitted.
                </p>
                <p className="text-sm text-gray-400 mb-8">Management will review it and update the status. You can track it under <strong>My Clients</strong>.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={resetApply} className="px-6 py-2.5 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors">
                    Submit Another
                  </button>
                  <button onClick={() => switchTab('clients')} className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                    View My Clients
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── My Sales ── */}
        {activeTab === 'my_sales' && (() => {
          const myClients = isManagement ? clients : clients.filter(c => c.agent_id === user?.id);
          const approvedSales = myClients.filter(c => c.status === 'approved');

          const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          const currentYear = new Date().getFullYear();

          // Group approved sales by month
          const monthlySales = monthNames.map((month, idx) => {
            const salesInMonth = approvedSales.filter(c => {
              const d = new Date(c.updated_at || c.created_at);
              return d.getFullYear() === currentYear && d.getMonth() === idx;
            });
            return {
              month,
              count: salesInMonth.length,
              commission: salesInMonth.reduce((sum, c) => sum + (c.commission_amount || 0), 0),
              sales: salesInMonth,
            };
          });

          const maxCommission = Math.max(...monthlySales.map(m => m.commission), 1);
          const totalYearCommission = approvedSales.reduce((sum, c) => sum + (c.commission_amount || 0), 0);

          return (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-navy-900">My Sales</h2>
                <p className="text-gray-500 text-sm">Approved deals and commission breakdown by month — {currentYear}</p>
              </div>

              {/* Year summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Approved Sales', value: approvedSales.length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
                  { label: 'Total Commission', value: `R ${totalYearCommission.toLocaleString('en-ZA')}`, icon: DollarSign, color: 'text-brand-600', bg: 'bg-brand-100' },
                  { label: 'Pending', value: myClients.filter(c => c.status === 'pending').length, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
                  { label: 'Declined', value: myClients.filter(c => c.status === 'declined').length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                    <div><p className="text-xs text-gray-500">{s.label}</p><p className={`text-xl font-bold ${s.color}`}>{s.value}</p></div>
                  </div>
                ))}
              </div>

              {/* Monthly bar chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-navy-900 mb-6">Commission by Month ({currentYear})</h3>
                <div className="flex items-end gap-3 h-40">
                  {monthlySales.map(({ month, commission, count }) => {
                    const barH = Math.max(4, Math.round((commission / maxCommission) * 128));
                    const isCurrentMonth = monthNames[new Date().getMonth()] === month;
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-500 font-medium">
                          {commission > 0 ? `R ${(commission/1000).toFixed(0)}k` : ''}
                        </span>
                        <div
                          className={`w-full rounded-t transition-all ${isCurrentMonth ? 'bg-brand-500' : 'bg-brand-200'} hover:opacity-80`}
                          style={{ height: `${barH}px` }}
                          title={`${count} sale${count !== 1 ? 's' : ''} · R ${commission.toLocaleString('en-ZA')}`}
                        />
                        <span className="text-xs text-gray-500">{month}</span>
                        {count > 0 && <span className="text-xs font-bold text-brand-600">{count}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly breakdown tables */}
              {monthlySales.filter(m => m.count > 0).reverse().map(({ month, sales, commission }) => (
                <div key={month} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-navy-900">{month} {currentYear}</h3>
                      <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">{sales.length} deal{sales.length !== 1 ? 's' : ''}</span>
                    </div>
                    <span className="font-bold text-green-600">R {commission.toLocaleString('en-ZA')}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission (R)</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {sales.map(c => (
                          <tr key={c.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <p className="font-medium text-navy-900">{c.first_name} {c.last_name}</p>
                              <p className="text-xs text-gray-500">{c.phone}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-navy-900">{c.vehicle_brand} {c.vehicle_model}</p>
                              <p className="text-xs text-gray-500">{c.vehicle_colour}</p>
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-sm">{c.budget_range}</td>
                            <td className="px-4 py-3 font-bold text-green-600">R {(c.commission_amount || 0).toLocaleString('en-ZA')}</td>
                            <td className="px-4 py-3 text-gray-500 text-sm">{new Date(c.updated_at || c.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {approvedSales.length === 0 && (
                <div className="bg-white rounded-xl p-16 shadow-sm text-center text-gray-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No approved sales yet. Once management approves your submitted clients, they'll appear here.</p>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Client Folder ── */}
        {activeTab === 'client_folder' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Clients', value: clients.length },
                { label: 'Documents Uploaded', value: documents.length },
                { label: 'Clients with Docs', value: new Set(documents.map(d => d.client_id)).size },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm"><p className="text-sm text-gray-600">{s.label}</p><p className="text-3xl font-bold text-navy-900">{s.value}</p></div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-navy-900">Client Documents</h3>
                <p className="text-xs text-gray-400">Click "Upload Doc" to attach documents to a client</p>
              </div>
              <div className="divide-y divide-gray-100">
                {clients.map((client) => {
                  const clientDocs = documents.filter(d => d.client_id === client.id);
                  return (
                    <div key={client.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">{client.first_name?.charAt(0)}</div>
                          <div><p className="font-medium text-navy-900">{client.first_name} {client.last_name}</p><p className="text-sm text-gray-500">{client.phone}</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${client.status === 'approved' ? 'bg-green-100 text-green-700' : client.status === 'declined' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{client.status}</span>
                          <button
                            onClick={() => { setClientDocClient(client); setShowClientDocModal(true); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 text-white rounded-lg text-xs font-medium hover:bg-brand-600 transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" /> Upload Doc
                          </button>
                        </div>
                      </div>
                      {clientDocs.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {clientDocs.map((doc) => {
                            const appType = doc.application_type;
                            return (
                              <span key={doc.id} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                <Folder className="w-3 h-3" />
                                {doc.document_type.replace(/_/g, ' ')}
                                {appType && <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-semibold ${appType === 'finance' ? 'bg-blue-100 text-blue-700' : appType === 'rent' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{appType}</span>}
                              </span>
                            );
                          })}
                        </div>
                      ) : <p className="text-xs text-gray-400 mt-2">No documents uploaded</p>}
                    </div>
                  );
                })}
                {clients.length === 0 && (
                  <div className="p-12 text-center text-gray-400">
                    <Folder className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No clients yet. Add a client to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Commission ── */}
        {activeTab === 'commission' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Total Earned', value: `R ${stats.totalCommission.toLocaleString('en-ZA')}`, icon: DollarSign, bg: 'bg-green-100', color: 'text-green-600' },
                { label: 'Closed Deals', value: stats.closedDeals, icon: Award, bg: 'bg-brand-100', color: 'text-brand-600' },
                { label: 'Avg per Deal', value: `R ${stats.closedDeals > 0 ? Math.round(stats.totalCommission / stats.closedDeals).toLocaleString('en-ZA') : 0}`, icon: Target, bg: 'bg-blue-100', color: 'text-blue-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                    <p className="text-sm text-gray-600">{s.label}</p>
                  </div>
                  <p className="text-3xl font-bold text-navy-900">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200"><h3 className="text-lg font-semibold text-navy-900">Commission per Deal</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4"><p className="font-medium text-navy-900">{client.first_name} {client.last_name}</p><p className="text-xs text-gray-500">{client.province}</p></td>
                        <td className="px-4 py-4 text-gray-700">{client.vehicle_brand} {client.vehicle_model}</td>
                        <td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${client.status === 'approved' ? 'bg-green-100 text-green-700' : client.status === 'declined' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{client.status}</span></td>
                        <td className="px-4 py-4"><p className={`font-bold ${client.status === 'approved' ? 'text-green-600' : 'text-gray-400'}`}>{client.status === 'approved' ? `R ${(client.commission_amount || 0).toLocaleString('en-ZA')}` : '—'}</p></td>
                        <td className="px-4 py-4 text-sm text-gray-500">{new Date(client.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-navy-900 mb-4">Monthly Commission Trend</h3>
              <div className="flex items-end gap-3 h-40">
                {[0, 1, 2, 3, 4, 5].map((monthOffset) => {
                  const targetMonth = (new Date().getMonth() - (5 - monthOffset) + 12) % 12;
                  const monthCommission = clients.filter(c => new Date(c.created_at).getMonth() === targetMonth && c.status === 'approved').reduce((sum, c) => sum + (c.commission_amount || 0), 0);
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return (
                    <div key={monthOffset} className="flex-1 flex flex-col items-center gap-2">
                      <p className="text-xs text-gray-500">R{(monthCommission / 1000).toFixed(0)}k</p>
                      <div className="w-full bg-brand-500 rounded-t hover:bg-brand-600 transition-colors" style={{ height: `${Math.max(8, Math.min(120, monthCommission / 100))}px` }} />
                      <p className="text-xs text-gray-600">{monthNames[targetMonth]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Reports ── */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Total Deals', value: stats.closedDeals, icon: Award, bg: 'bg-green-100', color: 'text-green-600', bar: Math.min(100, stats.closedDeals * 5), barColor: 'bg-green-500' },
                { label: 'Total Revenue', value: `R ${stats.totalCommission.toLocaleString('en-ZA')}`, icon: DollarSign, bg: 'bg-brand-100', color: 'text-brand-600', bar: Math.min(100, stats.totalCommission / 100), barColor: 'bg-brand-500' },
                { label: 'Conversion Rate', value: `${clients.length > 0 ? Math.round((stats.closedDeals / clients.length) * 100) : 0}%`, icon: Target, bg: 'bg-blue-100', color: 'text-blue-600', bar: clients.length > 0 ? Math.round((stats.closedDeals / clients.length) * 100) : 0, barColor: 'bg-blue-500' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-lg ${s.bg} flex items-center justify-center`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
                    <div><p className="text-sm text-gray-600">{s.label}</p><p className="text-3xl font-bold text-navy-900">{s.value}</p></div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full"><div className={`h-2 ${s.barColor} rounded-full`} style={{ width: `${s.bar}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-navy-900 mb-6">Performance by Province</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State'].map((province) => {
                  const provinceClients = clients.filter(c => c.province === province);
                  const provinceRevenue = provinceClients.filter(c => c.status === 'approved').reduce((sum, c) => sum + (c.commission_amount || 0), 0);
                  return (
                    <div key={province} className="border rounded-lg p-4 text-center">
                      <p className="font-medium text-navy-900 text-sm">{province}</p>
                      <p className="text-sm text-gray-600">{provinceClients.length} clients</p>
                      <p className="text-lg font-bold text-brand-500 mt-2">R {provinceRevenue.toLocaleString('en-ZA')}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Management (for management roles) ── */}
        {activeTab === 'management' && isManagement && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200"><h3 className="text-lg font-semibold text-navy-900">Agent Management</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deals</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {agents.filter(a => a.role !== 'pending' && a.role !== 'admin').map((agent) => {
                    const agentClients = clients.filter(c => c.agent_id === agent.id);
                    const closedDeals = agentClients.filter(c => c.status === 'approved').length;
                    const totalCommission = agentClients.filter(c => c.status === 'approved').reduce((sum, c) => sum + (c.commission_amount || 0), 0);
                    return (
                      <tr key={agent.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">{agent.full_name?.charAt(0) || '?'}</div>
                            <div><p className="font-medium text-navy-900">{agent.full_name}</p><p className="text-sm text-gray-500">{agent.email}</p></div>
                          </div>
                        </td>
                        <td className="px-4 py-4"><span className="px-3 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700">{agent.role}</span></td>
                        <td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${agent.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{agent.status}</span></td>
                        <td className="px-4 py-4 text-navy-900 font-medium">{closedDeals}</td>
                        <td className="px-4 py-4 text-navy-900 font-medium">R {totalCommission.toLocaleString('en-ZA')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* ── My Documents ── */}
        {activeTab === 'my_documents' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-navy-900">My Documents</h2>
              <p className="text-gray-500 text-sm">Upload and manage your required agent documents</p>
            </div>

            {docError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{docError}</div>
            )}

            {/* Required single docs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {([
                { type: 'id_document' as const, label: 'SA ID Document', required: true },
                { type: 'drivers_license' as const, label: "Driver's License", required: true },
              ] as Array<{ type: AgentDocument['document_type']; label: string; required: boolean }>).map(({ type, label, required }) => {
                const uploaded = agentDocs.find(d => d.document_type === type && !d.month_label);
                const isLoading = docUploading === type;
                return (
                  <div key={type} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-navy-900">{label}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${required ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                          {required ? 'Required' : 'Optional'}
                        </span>
                      </div>
                      {uploaded ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-xs font-medium">Uploaded</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Not uploaded</span>
                      )}
                    </div>

                    {uploaded && (
                      <div className="mb-3 p-3 bg-green-50 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">{uploaded.file_name}</p>
                          <p className="text-xs text-green-600">{uploaded.file_size ? `${(uploaded.file_size / 1024).toFixed(1)} KB` : ''} · {new Date(uploaded.created_at).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => getSignedDocUrl(uploaded.file_path)} className="text-xs text-brand-600 hover:text-brand-700 font-medium underline">View</button>
                      </div>
                    )}

                    <label className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed border-gray-200' : 'border-brand-300 hover:border-brand-400 hover:bg-brand-50'}`}>
                      <Upload className="w-4 h-4 text-brand-500" />
                      <span className="text-sm font-medium text-brand-600">{isLoading ? 'Uploading…' : uploaded ? 'Replace' : 'Upload'}</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        disabled={isLoading}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadAgentDoc(type, null, f);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                );
              })}
            </div>

            {/* Bank Statements — 3 months required */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-navy-900">Bank Statements</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600">Required · 3 months</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <span>{agentDocs.filter(d => d.document_type === 'bank_statement').length}</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-500">3 uploaded</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(['Month 1', 'Month 2', 'Month 3'] as const).map((month) => {
                  const uploaded = agentDocs.find(d => d.document_type === 'bank_statement' && d.month_label === month);
                  const isLoading = docUploading === `bank_statement-${month}`;
                  return (
                    <div key={month} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-navy-900">{month}</p>
                        {uploaded ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <span className="w-4 h-4 rounded-full border-2 border-red-200 block"></span>}
                      </div>
                      {uploaded && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 truncate">{uploaded.file_name}</p>
                          <button onClick={() => getSignedDocUrl(uploaded.file_path)} className="text-xs text-brand-600 hover:text-brand-700 font-medium underline">View</button>
                        </div>
                      )}
                      <label className={`flex items-center justify-center gap-1 w-full px-3 py-2 rounded-lg border border-dashed cursor-pointer text-xs transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : 'border-gray-300 hover:bg-gray-50'}`}>
                        <Upload className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600 font-medium">{isLoading ? 'Uploading…' : uploaded ? 'Replace' : 'Upload'}</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          disabled={isLoading}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) uploadAgentDoc('bank_statement', month, f);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payslips — 3 months optional */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-navy-900">Payslips</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Optional · up to 3 months</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <span>{agentDocs.filter(d => d.document_type === 'payslip').length}</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-500">3 uploaded</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(['Month 1', 'Month 2', 'Month 3'] as const).map((month) => {
                  const uploaded = agentDocs.find(d => d.document_type === 'payslip' && d.month_label === month);
                  const isLoading = docUploading === `payslip-${month}`;
                  return (
                    <div key={month} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-navy-900">{month}</p>
                        {uploaded ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <span className="w-4 h-4 rounded-full border-2 border-gray-200 block"></span>}
                      </div>
                      {uploaded && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 truncate">{uploaded.file_name}</p>
                          <button onClick={() => getSignedDocUrl(uploaded.file_path)} className="text-xs text-brand-600 hover:text-brand-700 font-medium underline">View</button>
                        </div>
                      )}
                      <label className={`flex items-center justify-center gap-1 w-full px-3 py-2 rounded-lg border border-dashed cursor-pointer text-xs transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : 'border-gray-300 hover:bg-gray-50'}`}>
                        <Upload className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600 font-medium">{isLoading ? 'Uploading…' : uploaded ? 'Replace' : 'Upload'}</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          disabled={isLoading}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) uploadAgentDoc('payslip', month, f);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Completion summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-navy-900 mb-4">Submission Status</h3>
              <div className="space-y-3">
                {[
                  { label: 'SA ID Document', done: !!agentDocs.find(d => d.document_type === 'id_document'), required: true },
                  { label: "Driver's License", done: !!agentDocs.find(d => d.document_type === 'drivers_license'), required: true },
                  { label: 'Bank Statement Month 1', done: !!agentDocs.find(d => d.document_type === 'bank_statement' && d.month_label === 'Month 1'), required: true },
                  { label: 'Bank Statement Month 2', done: !!agentDocs.find(d => d.document_type === 'bank_statement' && d.month_label === 'Month 2'), required: true },
                  { label: 'Bank Statement Month 3', done: !!agentDocs.find(d => d.document_type === 'bank_statement' && d.month_label === 'Month 3'), required: true },
                  { label: 'Payslip Month 1', done: !!agentDocs.find(d => d.document_type === 'payslip' && d.month_label === 'Month 1'), required: false },
                  { label: 'Payslip Month 2', done: !!agentDocs.find(d => d.document_type === 'payslip' && d.month_label === 'Month 2'), required: false },
                  { label: 'Payslip Month 3', done: !!agentDocs.find(d => d.document_type === 'payslip' && d.month_label === 'Month 3'), required: false },
                ].map(({ label, done, required }) => (
                  <div key={label} className="flex items-center gap-3">
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${required ? 'border-red-300' : 'border-gray-300'}`} />
                    )}
                    <span className={`text-sm ${done ? 'text-gray-700' : required ? 'text-gray-500' : 'text-gray-400'}`}>{label}</span>
                    {!required && <span className="text-xs text-gray-400 ml-auto">optional</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Lead Modal ── */}
      {showLeadModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Manage Lead</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-navy-900">{selectedLead.first_name} {selectedLead.last_name}</p>
                <p className="text-sm text-gray-600">{selectedLead.email}</p>
                <p className="text-sm text-gray-600">{selectedLead.phone}</p>
                <p className="text-sm text-gray-500 mt-2">{selectedLead.car_type}</p>
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field min-h-[100px]" placeholder="Add notes about this lead..." />
              </div>
              <div className="flex flex-wrap gap-2">
                {['new', 'contacted', 'qualified', 'closed'].map((status) => (
                  <button key={status} onClick={() => updateLeadStatus(selectedLead.id, status as BuyerLead['status'])} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${selectedLead.status === status ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{status}</button>
                ))}
              </div>
              <button onClick={() => { setShowLeadModal(false); setNotes(''); }} className="w-full btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Client Modal ── */}
      {showClientModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Manage Client</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-navy-900">{selectedClient.first_name} {selectedClient.last_name}</p>
                <p className="text-sm text-gray-600">{selectedClient.phone} | {selectedClient.email}</p>
                <p className="text-sm text-navy-900 mt-2">{selectedClient.vehicle_brand} {selectedClient.vehicle_model}</p>
                <p className="text-sm text-gray-500">{selectedClient.vehicle_colour} | Budget: {selectedClient.budget_range}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['pending', 'approved', 'declined'].map((status) => (
                  <button key={status} onClick={() => updateClientStatus(selectedClient.id, status as Client['status'])} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${selectedClient.status === status ? status === 'approved' ? 'bg-green-500 text-white' : status === 'declined' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{status}</button>
                ))}
              </div>
              <button onClick={() => setShowClientModal(false)} className="w-full btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
      {/* ── Add Lead Modal ── */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Add New Lead</h3>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">First Name *</label>
                  <input required className="input-field" placeholder="John" value={addLeadForm.first_name} onChange={e => setAddLeadForm(p => ({ ...p, first_name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input required className="input-field" placeholder="Doe" value={addLeadForm.last_name} onChange={e => setAddLeadForm(p => ({ ...p, last_name: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Phone *</label>
                <input required className="input-field" placeholder="+27 123 456 7890" value={addLeadForm.phone} onChange={e => setAddLeadForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input-field" placeholder="john@example.com" value={addLeadForm.email} onChange={e => setAddLeadForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="label">Car Interest *</label>
                <input required className="input-field" placeholder="e.g. Toyota Corolla, SUV under R300k" value={addLeadForm.car_type} onChange={e => setAddLeadForm(p => ({ ...p, car_type: e.target.value }))} />
              </div>
              <div>
                <label className="label">Employment Status *</label>
                <select required className="input-field" value={addLeadForm.employment_status} onChange={e => setAddLeadForm(p => ({ ...p, employment_status: e.target.value }))}>
                  <option value="">Select status</option>
                  <option value="employed">Employed</option>
                  <option value="self_employed">Self-Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="student">Student</option>
                  <option value="pensioner">Pensioner</option>
                </select>
              </div>
              {addLeadError && <p className="text-sm text-red-600">{addLeadError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddLeadModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={addLeadLoading} className="flex-1 btn-primary disabled:opacity-50">{addLeadLoading ? 'Saving...' : 'Add Lead'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Client Modal ── */}
      {showAddClientModal && (        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Add New Client</h3>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">First Name *</label>
                  <input required className="input-field" placeholder="John" value={addClientForm.first_name} onChange={e => setAddClientForm(p => ({ ...p, first_name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input required className="input-field" placeholder="Doe" value={addClientForm.last_name} onChange={e => setAddClientForm(p => ({ ...p, last_name: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Phone *</label>
                  <input required className="input-field" placeholder="+27 123 456 7890" value={addClientForm.phone} onChange={e => setAddClientForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input-field" placeholder="john@example.com" value={addClientForm.email} onChange={e => setAddClientForm(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Occupation</label>
                  <input className="input-field" placeholder="e.g. Teacher" value={addClientForm.occupation} onChange={e => setAddClientForm(p => ({ ...p, occupation: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Province *</label>
                  <select required className="input-field" value={addClientForm.province} onChange={e => setAddClientForm(p => ({ ...p, province: e.target.value }))}>
                    <option value="">Select province</option>
                    {['Gauteng','Western Cape','KwaZulu-Natal','Limpopo','Mpumalanga','North West','Northern Cape','Eastern Cape','Free State'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Brand</label>
                  <input className="input-field" placeholder="Toyota" value={addClientForm.vehicle_brand} onChange={e => setAddClientForm(p => ({ ...p, vehicle_brand: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Model</label>
                  <input className="input-field" placeholder="Corolla" value={addClientForm.vehicle_model} onChange={e => setAddClientForm(p => ({ ...p, vehicle_model: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Colour</label>
                  <input className="input-field" placeholder="White" value={addClientForm.vehicle_colour} onChange={e => setAddClientForm(p => ({ ...p, vehicle_colour: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Condition</label>
                  <select className="input-field" value={addClientForm.vehicle_condition} onChange={e => setAddClientForm(p => ({ ...p, vehicle_condition: e.target.value as 'new' | 'used' | 'either' }))}>
                    <option value="either">Either</option>
                    <option value="new">New</option>
                    <option value="used">Used</option>
                  </select>
                </div>
                <div>
                  <label className="label">Budget Range *</label>
                  <input required className="input-field" placeholder="e.g. R150k - R250k" value={addClientForm.budget_range} onChange={e => setAddClientForm(p => ({ ...p, budget_range: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="finance_needed" checked={addClientForm.finance_needed} onChange={e => setAddClientForm(p => ({ ...p, finance_needed: e.target.checked }))} className="accent-brand-500" />
                <label htmlFor="finance_needed" className="text-sm text-gray-600">Finance needed</label>
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea rows={3} className="input-field" placeholder="Any additional notes..." value={addClientForm.notes} onChange={e => setAddClientForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              {addClientError && <p className="text-sm text-red-600">{addClientError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddClientModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={addClientLoading} className="flex-1 btn-primary disabled:opacity-50">{addClientLoading ? 'Saving...' : 'Add Client'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Upload Client Document Modal ── */}
      {showClientDocModal && clientDocClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-navy-900">Upload Client Document</h3>
              <button onClick={() => { setShowClientDocModal(false); setClientDocFile(null); setClientDocError(null); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client info */}
            <div className="bg-gray-50 rounded-lg p-3 mb-5">
              <p className="font-medium text-navy-900">{clientDocClient.first_name} {clientDocClient.last_name}</p>
              <p className="text-sm text-gray-500">{clientDocClient.phone}</p>
            </div>

            <div className="space-y-4">
              {/* Application Type — Rent / Own / Finance */}
              <div>
                <label className="label">Application Type <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'rent', label: 'Rent', color: 'purple' },
                    { value: 'own', label: 'Own', color: 'green' },
                    { value: 'finance', label: 'Finance', color: 'blue' },
                  ] as const).map(({ value, label, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setClientApplicationType(value)}
                      className={`py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                        clientApplicationType === value
                          ? color === 'purple' ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : color === 'green' ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Type */}
              <div>
                <label className="label">Document Type <span className="text-red-500">*</span></label>
                <select
                  value={clientDocType}
                  onChange={(e) => setClientDocType(e.target.value as ClientDocument['document_type'])}
                  className="input-field"
                >
                  <option value="id_document">SA ID Document</option>
                  <option value="proof_of_income">Proof of Income</option>
                  <option value="proof_of_address">Proof of Address</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="bank_statement">Bank Statement</option>
                  <option value="payslip">Payslip</option>
                  <option value="client_photo">Client Photo</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="label">Select File <span className="text-red-500">*</span></label>
                <label className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${clientDocFile ? 'border-green-400 bg-green-50' : 'border-brand-300 hover:border-brand-400 hover:bg-brand-50'}`}>
                  <Upload className={`w-4 h-4 ${clientDocFile ? 'text-green-600' : 'text-brand-500'}`} />
                  <span className={`text-sm font-medium ${clientDocFile ? 'text-green-700' : 'text-brand-600'}`}>
                    {clientDocFile ? clientDocFile.name : 'Choose file (PDF, JPG, PNG)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => { setClientDocFile(e.target.files?.[0] || null); setClientDocError(null); }}
                  />
                </label>
              </div>

              {clientDocError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{clientDocError}</div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleClientDocUpload}
                  disabled={clientDocUploading || !clientDocFile}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {clientDocUploading ? 'Uploading…' : 'Upload Document'}
                </button>
                <button
                  onClick={() => { setShowClientDocModal(false); setClientDocFile(null); setClientDocError(null); }}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AgentDashboard;
