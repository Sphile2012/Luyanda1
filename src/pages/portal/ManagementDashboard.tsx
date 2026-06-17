import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Profile, Application, Client, ClientDocument, Task, Message, AgentDocument } from '../../lib/supabase';
import {
  Car, Users, FileText, TrendingUp, LogOut, Search, CircleCheck as CheckCircle,
  Upload, ChartBar as BarChart3, Download, Trash2, Image, DollarSign, UserCheck, UserX,
  ClipboardList, MessageSquare, Send, Plus, X, AlertCircle, Clock, CheckSquare, Briefcase,
  FolderOpen, ShoppingCart, MapPin,
} from 'lucide-react';

type Tab = 'overview' | 'tasks' | 'messages' | 'agents' | 'applications' | 'sales' | 'agent_docs' | 'clients' | 'inventory' | 'reports' | 'photos' | 'job_postings';

type JobPosting = {
  id: string;
  title: string;
  type: string;
  location: string;
  salary_range: string;
  description: string;
  requirements: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  colour: string;
  mileage: number;
  price: number;
  body_type: string;
  condition: string;
  province: string;
  photos: string[];
  is_active: boolean;
  created_at: string;
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const DOC_LABELS: Record<string, string> = {
  id_document: 'SA ID Document',
  drivers_license: "Driver's License",
  bank_statement: 'Bank Statement',
  payslip: 'Payslip',
};

const ManagementDashboard = () => {
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const mainRef = useRef<HTMLElement>(null);

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  };

  const [agents, setAgents] = useState<Profile[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [agentDocuments, setAgentDocuments] = useState<AgentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskFilter, setTaskFilter] = useState('all');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '' });
  const [submittingTask, setSubmittingTask] = useState(false);

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgTab, setMsgTab] = useState<'inbox' | 'compose'>('inbox');
  const [newMsg, setNewMsg] = useState({ to_user_id: '', is_broadcast: false, subject: '', content: '' });
  const [sendingMsg, setSendingMsg] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);

  // Job postings state
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [submittingJob, setSubmittingJob] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', type: 'remote', location: '', salary_range: '', description: '', requirements: '' });

  // Sales approve/decline modals
  const [showSaleApproveModal, setShowSaleApproveModal] = useState(false);
  const [showSaleDeclineModal, setShowSaleDeclineModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Client | null>(null);
  const [saleCommission, setSaleCommission] = useState('');
  const [saleDeclineReason, setSaleDeclineReason] = useState('');

  // Agent approve modal
  const [showApproveAgentModal, setShowApproveAgentModal] = useState(false);
  const [selectedPendingAgent, setSelectedPendingAgent] = useState<Profile | null>(null);
  const [approveAgentRole, setApproveAgentRole] = useState<'remote_agent' | 'inoffice_agent'>('remote_agent');

  // Agent docs viewer
  const [selectedDocAgent, setSelectedDocAgent] = useState<Profile | null>(null);

  // Vehicle management state
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [submittingVehicle, setSubmittingVehicle] = useState(false);
  const [vehiclePhotoFile, setVehiclePhotoFile] = useState<File | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    brand: '', model: '', year: new Date().getFullYear(), colour: '', mileage: 0,
    price: 0, body_type: '', condition: 'used', province: '',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || !profile) { navigate('/portal'); return; }
    if (!['management', 'admin'].includes(profile.role)) { navigate('/portal'); return; }
    fetchData();
  }, [user, profile, authLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    const [
      { data: agentsData },
      { data: applicationsData },
      { data: clientsData },
      { data: vehiclesData },
      { data: documentsData },
      { data: tasksData },
      { data: messagesData },
      { data: jobsData },
      { data: agentDocsData },
    ] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: true }),
      supabase.from('applications').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('vehicles').select('*').order('created_at', { ascending: false }),
      supabase.from('client_documents').select('*').order('created_at', { ascending: false }),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('messages').select('*').order('created_at', { ascending: false }),
      supabase.from('job_postings').select('*').order('created_at', { ascending: false }),
      supabase.from('agent_documents').select('*').order('created_at', { ascending: false }),
    ]);

    if (agentsData) setAgents(agentsData as Profile[]);
    if (applicationsData) setApplications(applicationsData as Application[]);
    if (clientsData) setClients(clientsData as Client[]);
    if (vehiclesData) setVehicles(vehiclesData as Vehicle[]);
    if (documentsData) setDocuments(documentsData as ClientDocument[]);
    if (tasksData) setTasks(tasksData as Task[]);
    if (messagesData) setMessages(messagesData as Message[]);
    if (jobsData) setJobPostings(jobsData as JobPosting[]);
    if (agentDocsData) setAgentDocuments(agentDocsData as AgentDocument[]);
    setLoading(false);
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  // Agent management
  const updateAgentStatus = async (agentId: string, status: 'active' | 'inactive') => {
    const { error } = await supabase.from('profiles').update({ status, updated_at: new Date().toISOString() }).eq('id', agentId);
    if (!error) setAgents(agents.map(a => a.id === agentId ? { ...a, status } : a));
  };

  const approveAgentWithRole = async () => {
    if (!selectedPendingAgent) return;
    const { error } = await supabase.from('profiles').update({
      status: 'active',
      role: approveAgentRole,
      updated_at: new Date().toISOString(),
    }).eq('id', selectedPendingAgent.id);
    if (!error) {
      refreshProfile();
      fetchData();
      setShowApproveAgentModal(false);
      setSelectedPendingAgent(null);
    }
  };

  const declineAgent = async (agentId: string) => {
    if (confirm('Decline this agent application? Their account will be removed.')) {
      const { error } = await supabase.from('profiles').delete().eq('id', agentId);
      if (!error) setAgents(agents.filter(a => a.id !== agentId));
    }
  };

  const deleteAgent = async (agentId: string) => {
    if (confirm('Delete this agent? This cannot be undone.')) {
      const { error } = await supabase.from('profiles').delete().eq('id', agentId);
      if (!error) setAgents(agents.filter(a => a.id !== agentId));
    }
  };

  // Applications
  const updateApplicationStatus = async (
    appId: string, status: 'approved' | 'declined',
    assignedRole?: 'remote_agent' | 'inoffice_agent' | 'management', declineReason?: string
  ) => {
    const updates: Record<string, unknown> = { status, reviewed_by: user?.id, reviewed_at: new Date().toISOString() };
    if (assignedRole) updates.assigned_role = assignedRole;
    if (declineReason) updates.decline_reason = declineReason;
    const { error } = await supabase.from('applications').update(updates).eq('id', appId);
    if (!error) fetchData();
  };

  // Sales (clients)
  const approveSale = async () => {
    if (!selectedSale) return;
    const commission = parseFloat(saleCommission) || 0;
    const { error } = await supabase.from('clients').update({
      status: 'approved',
      commission_amount: commission,
      updated_at: new Date().toISOString(),
    }).eq('id', selectedSale.id);
    if (!error) {
      setClients(clients.map(c => c.id === selectedSale.id ? { ...c, status: 'approved', commission_amount: commission } : c));
      setShowSaleApproveModal(false);
      setSelectedSale(null);
      setSaleCommission('');
    }
  };

  const declineSale = async () => {
    if (!selectedSale) return;
    const { error } = await supabase.from('clients').update({
      status: 'declined',
      decline_reason: saleDeclineReason,
      updated_at: new Date().toISOString(),
    }).eq('id', selectedSale.id);
    if (!error) {
      setClients(clients.map(c => c.id === selectedSale.id ? { ...c, status: 'declined' } : c));
      setShowSaleDeclineModal(false);
      setSelectedSale(null);
      setSaleDeclineReason('');
    }
  };

  // Photo upload
  const handlePhotoUpload = async () => {
    if (!uploadFile || !selectedClient) return;
    const fileExt = uploadFile.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${selectedClient.id}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('client_documents').upload(filePath, uploadFile);
    if (uploadError) { alert('Error uploading file: ' + uploadError.message); return; }
    const { error: dbError } = await supabase.from('client_documents').insert({
      client_id: selectedClient.id, uploaded_by: user?.id, document_type: 'client_photo',
      file_name: uploadFile.name, file_path: filePath, file_size: uploadFile.size,
      mime_type: uploadFile.type, description: 'Client photo uploaded by management',
    });
    if (!dbError) { setShowUploadModal(false); setUploadFile(null); fetchData(); }
  };

  // View agent document
  const viewAgentDoc = async (filePath: string) => {
    const { data, error } = await supabase.storage.from('agent_documents').createSignedUrl(filePath, 3600);
    if (error) { alert('Could not load document: ' + error.message); return; }
    window.open(data.signedUrl, '_blank');
  };

  // Tasks
  const createTask = async () => {
    if (!newTask.title || !newTask.assigned_to) return;
    setSubmittingTask(true);
    const { data, error } = await supabase.from('tasks').insert({
      title: newTask.title, description: newTask.description,
      assigned_to: newTask.assigned_to, assigned_by: user?.id,
      priority: newTask.priority, due_date: newTask.due_date || null,
    }).select().single();
    if (!error && data) {
      setTasks([data as Task, ...tasks]);
      setNewTask({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '' });
      setShowCreateTask(false);
    }
    setSubmittingTask(false);
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === 'completed') updates.completed_at = new Date().toISOString();
    const { error } = await supabase.from('tasks').update(updates).eq('id', taskId);
    if (!error) setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (!error) setTasks(tasks.filter(t => t.id !== taskId));
  };

  // Messages
  const sendMessage = async () => {
    if (!newMsg.subject || !newMsg.content) return;
    if (!newMsg.is_broadcast && !newMsg.to_user_id) return;
    setSendingMsg(true);
    const { data, error } = await supabase.from('messages').insert({
      from_user_id: user?.id, to_user_id: newMsg.is_broadcast ? null : newMsg.to_user_id,
      is_broadcast: newMsg.is_broadcast, subject: newMsg.subject, content: newMsg.content,
    }).select().single();
    if (!error && data) {
      setMessages([data as Message, ...messages]);
      setNewMsg({ to_user_id: '', is_broadcast: false, subject: '', content: '' });
      setMsgTab('inbox');
    }
    setSendingMsg(false);
  };

  const markAsRead = async (msgId: string) => {
    const { error } = await supabase.from('messages').update({ is_read: true }).eq('id', msgId);
    if (!error) setMessages(messages.map(m => m.id === msgId ? { ...m, is_read: true } : m));
  };

  // Job postings
  const createJobPosting = async () => {
    if (!newJob.title || !newJob.location || !newJob.description || !newJob.requirements || !newJob.salary_range) return;
    setSubmittingJob(true);
    const { data, error } = await supabase.from('job_postings').insert({ ...newJob, created_by: user?.id }).select().single();
    if (!error && data) {
      setJobPostings([data as JobPosting, ...jobPostings]);
      setNewJob({ title: '', type: 'remote', location: '', salary_range: '', description: '', requirements: '' });
      setShowJobForm(false);
    }
    setSubmittingJob(false);
  };

  const toggleJobPosting = async (jobId: string, is_active: boolean) => {
    const { error } = await supabase.from('job_postings').update({ is_active, updated_at: new Date().toISOString() }).eq('id', jobId);
    if (!error) setJobPostings(jobPostings.map(j => j.id === jobId ? { ...j, is_active } : j));
  };

  const deleteJobPosting = async (jobId: string) => {
    if (!confirm('Delete this job posting?')) return;
    const { error } = await supabase.from('job_postings').delete().eq('id', jobId);
    if (!error) setJobPostings(jobPostings.filter(j => j.id !== jobId));
  };

  // Vehicle management
  const addVehicle = async () => {
    if (!newVehicle.brand || !newVehicle.model || !newVehicle.price) return;
    setSubmittingVehicle(true);
    let photoUrls: string[] = [];

    if (vehiclePhotoFile) {
      const ext = vehiclePhotoFile.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('vehicle_photos').upload(path, vehiclePhotoFile);
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('vehicle_photos').getPublicUrl(path);
        if (urlData.publicUrl) photoUrls = [urlData.publicUrl];
      }
    }

    const { data, error } = await supabase.from('vehicles').insert({
      ...newVehicle,
      photos: photoUrls,
      is_active: true,
    }).select().single();

    if (!error && data) {
      setVehicles([data as Vehicle, ...vehicles]);
      setNewVehicle({ brand: '', model: '', year: new Date().getFullYear(), colour: '', mileage: 0, price: 0, body_type: '', condition: 'used', province: '' });
      setVehiclePhotoFile(null);
      setShowVehicleForm(false);
    }
    setSubmittingVehicle(false);
  };

  const toggleVehicleActive = async (vehicleId: string, is_active: boolean) => {
    const { error } = await supabase.from('vehicles').update({ is_active }).eq('id', vehicleId);
    if (!error) setVehicles(vehicles.map(v => v.id === vehicleId ? { ...v, is_active } : v));
  };

  const deleteVehicle = async (vehicleId: string) => {
    if (!confirm('Delete this vehicle listing?')) return;
    const { error } = await supabase.from('vehicles').delete().eq('id', vehicleId);
    if (!error) setVehicles(vehicles.filter(v => v.id !== vehicleId));
  };

  // CSV export
  const exportCSV = () => {
    const rows = [
      ['Date', 'Client', 'Phone', 'Vehicle', 'Budget', 'Agent', 'Commission (R)', 'Status'],
      ...clients.map(c => {
        const agent = agents.find(a => a.id === c.agent_id);
        return [
          new Date(c.created_at).toLocaleDateString(),
          `${c.first_name} ${c.last_name}`,
          c.phone || '',
          `${c.vehicle_brand} ${c.vehicle_model}`,
          c.budget_range || '',
          agent?.full_name || 'Unassigned',
          c.status === 'approved' ? String(c.commission_amount || 0) : '0',
          c.status,
        ];
      }),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStats = () => {
    const activeAgents = agents.filter(a => a.status === 'active').length;
    const totalDeals = clients.filter(c => c.status === 'approved').length;
    const pendingApplications = applications.filter(a => a.status === 'pending').length;
    const totalCommission = clients.filter(c => c.status === 'approved').reduce((sum, c) => sum + (c.commission_amount || 0), 0);
    return { activeAgents, totalDeals, pendingApplications, totalCommission };
  };

  const stats = getStats();

  const filteredAgents = agents.filter(a =>
    a.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredApplications = applications.filter(a =>
    a.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredSales = clients.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredTasks = tasks.filter(t => taskFilter === 'all' || t.status === taskFilter);
  const unreadCount = messages.filter(m => !m.is_read && (m.to_user_id === user?.id || m.is_broadcast)).length;
  const pendingTaskCount = tasks.filter(t => t.status === 'pending').length;
  const pendingAgents = agents.filter(a => a.role === 'pending');
  const activeAgentList = agents.filter(a => ['remote_agent', 'inoffice_agent', 'management'].includes(a.role));
  const agentList = agents.filter(a => ['remote_agent', 'inoffice_agent', 'management'].includes(a.role));

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

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'tasks', label: 'Task Manager', icon: ClipboardList, badge: pendingTaskCount },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount },
    { id: 'agents', label: 'Agents', icon: Users, badge: pendingAgents.length },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'agent_docs', label: 'Agent Documents', icon: FolderOpen },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'inventory', label: 'Inventory', icon: Car },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
    { id: 'photos', label: 'Photo Manager', icon: Image },
    { id: 'job_postings', label: 'Job Postings', icon: Briefcase },
  ];

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-900 text-white flex flex-col overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-navy-700">
          <div className="flex items-center gap-2">
            <Car className="w-8 h-8 text-brand-400" />
            <span className="text-lg font-bold">Drive Agency</span>
          </div>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => switchTab(item.id as Tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                activeTab === item.id ? 'bg-brand-500 text-white' : 'text-gray-300 hover:bg-navy-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-sm">{item.label}</span>
              {item.badge ? (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-navy-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold flex-shrink-0">
              {profile?.full_name?.charAt(0) || 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm">{profile?.full_name}</p>
              <p className="text-xs text-gray-400 truncate">{profile?.role}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 rounded bg-red-600 hover:bg-red-700 transition-colors text-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main ref={mainRef} className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Management Dashboard</h1>
            <p className="text-gray-600">Manage agents, sales, and track performance</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..." className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Active Agents', value: stats.activeAgents, icon: Users, bg: 'bg-brand-100', color: 'text-brand-600' },
                { label: 'Total Deals', value: stats.totalDeals, icon: CheckCircle, bg: 'bg-green-100', color: 'text-green-600' },
                { label: 'Pending Applications', value: stats.pendingApplications, icon: FileText, bg: 'bg-yellow-100', color: 'text-yellow-600' },
                { label: 'Total Commission', value: `R ${stats.totalCommission.toLocaleString('en-ZA')}`, icon: DollarSign, bg: 'bg-emerald-100', color: 'text-emerald-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${s.bg} flex items-center justify-center`}>
                      <s.icon className={`w-6 h-6 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{s.label}</p>
                      <p className="text-2xl font-bold text-navy-900">{s.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Open Tasks', value: tasks.filter(t => t.status === 'pending').length, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
                { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
                { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length, icon: CheckSquare, color: 'text-green-600', bg: 'bg-green-100' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div><p className="text-sm text-gray-500">{s.label}</p><p className="text-2xl font-bold text-navy-900">{s.value}</p></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">Recent Applications</h3>
                <div className="space-y-3">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div><p className="font-medium text-navy-900">{app.first_name} {app.last_name}</p><p className="text-sm text-gray-600">{app.email}</p></div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : app.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{app.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">Agent Performance</h3>
                <div className="space-y-3">
                  {agentList.slice(0, 5).map((agent) => {
                    const approvedDeals = clients.filter(c => c.agent_id === agent.id && c.status === 'approved').length;
                    return (
                      <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">{agent.full_name?.charAt(0) || 'A'}</div>
                          <div><p className="font-medium text-navy-900">{agent.full_name}</p><p className="text-sm text-gray-600">{agent.role}</p></div>
                        </div>
                        <div className="text-right"><p className="font-bold text-navy-900">{approvedDeals} deals</p></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tasks ── */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><h2 className="text-xl font-bold text-navy-900">Task Manager</h2><p className="text-gray-500 text-sm mt-0.5">Assign and track tasks</p></div>
              <button onClick={() => setShowCreateTask(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition-colors">
                <Plus className="w-4 h-4" /> Create Task
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: 'text-yellow-600' },
                { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: 'text-blue-600' },
                { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: 'text-green-600' },
                { label: 'Overdue', value: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length, color: 'text-red-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm text-center">
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'in_progress', 'completed', 'cancelled'].map((f) => (
                <button key={f} onClick={() => setTaskFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${taskFilter === f ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'}`}>
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Task', 'Assigned To', 'Priority', 'Due Date', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTasks.map((task) => {
                    const assignee = agents.find(a => a.id === task.assigned_to);
                    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
                    return (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4"><p className="font-medium text-navy-900">{task.title}</p>{task.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>}</td>
                        <td className="px-4 py-4">{assignee ? <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold">{assignee.full_name?.charAt(0)}</div><span className="text-sm text-gray-700">{assignee.full_name}</span></div> : <span className="text-gray-400 text-sm">Unassigned</span>}</td>
                        <td className="px-4 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${priorityColors[task.priority]}`}>{task.priority}</span></td>
                        <td className="px-4 py-4">{task.due_date ? <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>{isOverdue ? '⚠ ' : ''}{new Date(task.due_date).toLocaleDateString()}</span> : <span className="text-gray-400 text-sm">—</span>}</td>
                        <td className="px-4 py-4">
                          <select value={task.status} onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])} className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer ${statusColors[task.status]}`}>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 py-4"><button onClick={() => deleteTask(task.id)} className="p-2 rounded hover:bg-red-100 text-red-500 transition-colors"><X className="w-4 h-4" /></button></td>
                      </tr>
                    );
                  })}
                  {filteredTasks.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No tasks found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Messages ── */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><h2 className="text-xl font-bold text-navy-900">Messages</h2><p className="text-gray-500 text-sm">Communicate with your team</p></div>
              <div className="flex gap-2">
                {(['inbox', 'compose'] as const).map((t) => (
                  <button key={t} onClick={() => setMsgTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${msgTab === t ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'}`}>
                    {t === 'inbox' ? `Inbox${unreadCount > 0 ? ` (${unreadCount})` : ''}` : 'Compose'}
                  </button>
                ))}
              </div>
            </div>
            {msgTab === 'inbox' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100"><p className="font-semibold text-navy-900">All Messages</p></div>
                  <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                    {messages.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No messages yet</div>}
                    {messages.map((msg) => {
                      const sender = agents.find(a => a.id === msg.from_user_id);
                      const isUnread = !msg.is_read && (msg.to_user_id === user?.id || msg.is_broadcast);
                      return (
                        <button key={msg.id} onClick={() => { setSelectedMsg(msg); if (isUnread) markAsRead(msg.id); }} className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedMsg?.id === msg.id ? 'bg-brand-50' : ''}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">{isUnread && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0"></span>}<p className={`text-sm truncate ${isUnread ? 'font-bold text-navy-900' : 'font-medium text-gray-700'}`}>{msg.subject}</p></div>
                              <p className="text-xs text-gray-500 mt-0.5 truncate">{msg.is_broadcast ? 'Broadcast' : sender?.full_name || 'Unknown'}</p>
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
                      <h3 className="text-lg font-bold text-navy-900">{selectedMsg.subject}</h3>
                      <p className="text-sm text-gray-500 mt-1 mb-6">From: {agents.find(a => a.id === selectedMsg.from_user_id)?.full_name || 'Unknown'} · {new Date(selectedMsg.created_at).toLocaleString()}</p>
                      <div className="prose prose-sm text-gray-700 whitespace-pre-wrap">{selectedMsg.content}</div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center p-8 text-gray-400">
                      <div className="text-center"><MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Select a message to read</p></div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {msgTab === 'compose' && (
              <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
                <h3 className="text-lg font-semibold text-navy-900 mb-5">New Message</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="broadcast" checked={newMsg.is_broadcast} onChange={(e) => setNewMsg({ ...newMsg, is_broadcast: e.target.checked, to_user_id: '' })} className="w-4 h-4 accent-brand-500" />
                    <label htmlFor="broadcast" className="text-sm font-medium text-gray-700">Send to all agents (announcement)</label>
                  </div>
                  {!newMsg.is_broadcast && (
                    <div><label className="label">Recipient</label><select value={newMsg.to_user_id} onChange={(e) => setNewMsg({ ...newMsg, to_user_id: e.target.value })} className="input-field"><option value="">Select an agent...</option>{agentList.map(a => <option key={a.id} value={a.id}>{a.full_name} ({a.role})</option>)}</select></div>
                  )}
                  <div><label className="label">Subject</label><input type="text" value={newMsg.subject} onChange={(e) => setNewMsg({ ...newMsg, subject: e.target.value })} className="input-field" placeholder="Message subject..." /></div>
                  <div><label className="label">Message</label><textarea value={newMsg.content} onChange={(e) => setNewMsg({ ...newMsg, content: e.target.value })} className="input-field min-h-[150px]" placeholder="Write your message..." /></div>
                  <button onClick={sendMessage} disabled={sendingMsg} className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors">
                    <Send className="w-4 h-4" />{sendingMsg ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Agents ── */}
        {activeTab === 'agents' && (
          <div className="space-y-6">
            {/* Pending Approval Section */}
            {pendingAgents.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-amber-200 bg-amber-50 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-amber-900">Pending Approval ({pendingAgents.length})</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {pendingAgents.filter(a =>
                    a.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((agent) => (
                    <div key={agent.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">{agent.full_name?.charAt(0) || '?'}</div>
                        <div>
                          <p className="font-medium text-navy-900">{agent.full_name}</p>
                          <p className="text-sm text-gray-500">{agent.email}</p>
                          <p className="text-xs text-gray-400">Registered {new Date(agent.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedPendingAgent(agent); setShowApproveAgentModal(true); }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          <UserCheck className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => declineAgent(agent.id)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
                          <UserX className="w-4 h-4" /> Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Agents */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200"><h3 className="text-lg font-semibold text-navy-900">Active Agents ({activeAgentList.length})</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>{['Agent', 'Role', 'Status', 'Deals', 'Open Tasks', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAgents.filter(a => ['remote_agent', 'inoffice_agent', 'management'].includes(a.role)).map((agent) => {
                      const approvedDeals = clients.filter(c => c.agent_id === agent.id && c.status === 'approved').length;
                      const openTasks = tasks.filter(t => t.assigned_to === agent.id && t.status !== 'completed' && t.status !== 'cancelled').length;
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
                          <td className="px-4 py-4 text-navy-900 font-medium">{approvedDeals}</td>
                          <td className="px-4 py-4 text-navy-900">{openTasks}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              {agent.status !== 'active' && <button onClick={() => { setSelectedPendingAgent(agent); setShowApproveAgentModal(true); }} className="p-2 rounded hover:bg-green-100 text-green-600" title="Activate"><UserCheck className="w-4 h-4" /></button>}
                              {agent.status === 'active' && <button onClick={() => updateAgentStatus(agent.id, 'inactive')} className="p-2 rounded hover:bg-yellow-100 text-yellow-600" title="Deactivate"><UserX className="w-4 h-4" /></button>}
                              <button onClick={() => deleteAgent(agent.id)} className="p-2 rounded hover:bg-red-100 text-red-600" title="Delete"><X className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Applications ── */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200"><h3 className="text-lg font-semibold text-navy-900">Agent Applications</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>{['Applicant', 'Location', 'Status', 'Applied', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4"><p className="font-medium text-navy-900">{app.first_name} {app.last_name}</p><p className="text-sm text-gray-500">{app.email}</p></td>
                      <td className="px-4 py-4 text-gray-600">{app.city}, {app.province}</td>
                      <td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : app.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{app.status}</span></td>
                      <td className="px-4 py-4 text-gray-600 text-sm">{new Date(app.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        {app.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateApplicationStatus(app.id, 'approved', 'remote_agent')} className="px-3 py-1 rounded bg-green-600 text-white text-xs font-medium hover:bg-green-700">Approve</button>
                            <button onClick={() => { const r = prompt('Decline reason:'); if (r) updateApplicationStatus(app.id, 'declined', undefined, r); }} className="px-3 py-1 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700">Decline</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Sales ── */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><h2 className="text-xl font-bold text-navy-900">Sales Management</h2><p className="text-gray-500 text-sm">Approve or decline client sales</p></div>
              <div className="flex gap-3">
                {[
                  { label: 'Total', value: clients.length, color: 'text-navy-900' },
                  { label: 'Pending', value: clients.filter(c => c.status === 'pending').length, color: 'text-yellow-600' },
                  { label: 'Approved', value: clients.filter(c => c.status === 'approved').length, color: 'text-green-600' },
                  { label: 'Declined', value: clients.filter(c => c.status === 'declined').length, color: 'text-red-600' },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-lg px-4 py-2 shadow-sm text-center">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>{['Client', 'Vehicle', 'Budget', 'Agent', 'Status', 'Commission', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSales.map((client) => {
                    const agent = agents.find(a => a.id === client.agent_id);
                    return (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4"><p className="font-medium text-navy-900">{client.first_name} {client.last_name}</p><p className="text-sm text-gray-500">{client.phone}</p></td>
                        <td className="px-4 py-4"><p className="text-navy-900">{client.vehicle_brand} {client.vehicle_model}</p><p className="text-xs text-gray-500">{client.vehicle_colour}</p></td>
                        <td className="px-4 py-4 text-gray-600 text-sm">{client.budget_range}</td>
                        <td className="px-4 py-4 text-gray-600 text-sm">{agent?.full_name || 'Unassigned'}</td>
                        <td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${client.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : client.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{client.status}</span></td>
                        <td className="px-4 py-4 text-sm font-medium text-green-600">{client.status === 'approved' ? `R ${(client.commission_amount || 0).toLocaleString('en-ZA')}` : '—'}</td>
                        <td className="px-4 py-4">
                          {client.status === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => { setSelectedSale(client); setSaleCommission(''); setShowSaleApproveModal(true); }} className="px-3 py-1 rounded bg-green-600 text-white text-xs font-semibold hover:bg-green-700">Approve</button>
                              <button onClick={() => { setSelectedSale(client); setSaleDeclineReason(''); setShowSaleDeclineModal(true); }} className="px-3 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700">Decline</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredSales.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No sales found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Agent Documents ── */}
        {activeTab === 'agent_docs' && (
          <div className="space-y-6">
            <div><h2 className="text-xl font-bold text-navy-900">Agent Documents</h2><p className="text-gray-500 text-sm">View compliance documents uploaded by agents</p></div>

            {selectedDocAgent ? (
              <div className="space-y-4">
                <button onClick={() => setSelectedDocAgent(null)} className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
                  ← Back to all agents
                </button>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                    <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xl font-bold">{selectedDocAgent.full_name?.charAt(0)}</div>
                    <div><p className="text-lg font-bold text-navy-900">{selectedDocAgent.full_name}</p><p className="text-sm text-gray-500">{selectedDocAgent.email} · {selectedDocAgent.role}</p></div>
                  </div>
                  <div className="space-y-3">
                    {agentDocuments.filter(d => d.agent_id === selectedDocAgent.id).length === 0 ? (
                      <div className="text-center py-10 text-gray-400">
                        <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No documents uploaded yet</p>
                      </div>
                    ) : (
                      agentDocuments.filter(d => d.agent_id === selectedDocAgent.id).map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center"><FileText className="w-5 h-5 text-brand-600" /></div>
                            <div>
                              <p className="font-medium text-navy-900">{DOC_LABELS[doc.document_type] || doc.document_type}{doc.month_label ? ` — ${doc.month_label}` : ''}</p>
                              <p className="text-xs text-gray-500">{doc.file_name} · {new Date(doc.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <button onClick={() => viewAgentDoc(doc.file_path)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 text-white rounded-lg text-xs font-medium hover:bg-brand-600 transition-colors">
                            <Download className="w-3.5 h-3.5" /> View
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <p className="font-semibold text-navy-900">All Agents — Document Status</p>
                  <p className="text-sm text-gray-500">{agentList.length} agents</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {agentList.map((agent) => {
                    const docs = agentDocuments.filter(d => d.agent_id === agent.id);
                    const hasId = docs.some(d => d.document_type === 'id_document');
                    const hasLicense = docs.some(d => d.document_type === 'drivers_license');
                    const bankCount = docs.filter(d => d.document_type === 'bank_statement').length;
                    const payslipCount = docs.filter(d => d.document_type === 'payslip').length;
                    const complete = hasId && hasLicense && bankCount >= 3;
                    return (
                      <div key={agent.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedDocAgent(agent)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">{agent.full_name?.charAt(0)}</div>
                            <div>
                              <p className="font-medium text-navy-900">{agent.full_name}</p>
                              <p className="text-xs text-gray-500">{agent.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-xs">
                              {[
                                { label: 'ID', ok: hasId },
                                { label: 'License', ok: hasLicense },
                                { label: `Bank (${bankCount}/3)`, ok: bankCount >= 3 },
                                { label: `Payslip (${payslipCount})`, ok: payslipCount > 0, optional: true },
                              ].map((item, i) => (
                                <span key={i} className={`px-2 py-1 rounded-full font-medium ${item.ok ? 'bg-green-100 text-green-700' : item.optional ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-600'}`}>
                                  {item.ok ? '✓' : item.optional ? '–' : '✗'} {item.label}
                                </span>
                              ))}
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${complete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {complete ? 'Complete' : 'Incomplete'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {agentList.length === 0 && <div className="p-12 text-center text-gray-400"><p>No agents yet</p></div>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Clients ── */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200"><h3 className="text-lg font-semibold text-navy-900">Client Management</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>{['Client', 'Vehicle', 'Status', 'Agent', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clients.map((client) => {
                    const agent = agents.find(a => a.id === client.agent_id);
                    return (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4"><p className="font-medium text-navy-900">{client.first_name} {client.last_name}</p><p className="text-sm text-gray-500">{client.phone}</p></td>
                        <td className="px-4 py-4"><p className="text-navy-900">{client.vehicle_brand} {client.vehicle_model}</p><p className="text-sm text-gray-500">{client.vehicle_colour} | {client.budget_range}</p></td>
                        <td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${client.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : client.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{client.status}</span></td>
                        <td className="px-4 py-4 text-gray-600">{agent?.full_name || 'Unassigned'}</td>
                        <td className="px-4 py-4"><button onClick={() => { setSelectedClient(client); setShowUploadModal(true); }} className="p-2 rounded hover:bg-gray-100 text-brand-600" title="Upload Photo"><Upload className="w-4 h-4" /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Inventory ── */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-navy-900">Vehicle Inventory</h2>
                <p className="text-gray-500 text-sm">Add and manage available cars visible to agents</p>
              </div>
              <button
                onClick={() => setShowVehicleForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Vehicle
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Listings', value: vehicles.length, color: 'text-navy-900' },
                { label: 'Active', value: vehicles.filter(v => v.is_active).length, color: 'text-green-600' },
                { label: 'Inactive', value: vehicles.filter(v => !v.is_active).length, color: 'text-gray-500' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm text-center">
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className={`bg-white rounded-xl shadow-sm overflow-hidden border ${vehicle.is_active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
                  <div className="relative h-44 bg-gray-100 flex items-center justify-center">
                    {vehicle.photos?.[0]
                      ? <img src={vehicle.photos[0]} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
                      : <Car className="w-14 h-14 text-gray-300" />
                    }
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${vehicle.condition === 'new' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'}`}>
                        {vehicle.condition}
                      </span>
                      {!vehicle.is_active && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-700 text-white">Inactive</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-navy-900">{vehicle.brand} {vehicle.model}</h4>
                    <p className="text-sm text-gray-500 mt-0.5">{vehicle.year} · {vehicle.body_type} · {vehicle.colour}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" />{vehicle.province}
                      {vehicle.mileage > 0 && <span className="ml-2">{vehicle.mileage.toLocaleString()} km</span>}
                    </div>
                    <p className="text-xl font-bold text-brand-500 mt-3">R {vehicle.price.toLocaleString('en-ZA')}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => toggleVehicleActive(vehicle.id, !vehicle.is_active)}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${vehicle.is_active ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                      >
                        {vehicle.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteVehicle(vehicle.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {vehicles.length === 0 && (
                <div className="col-span-3 bg-white rounded-xl p-16 shadow-sm text-center text-gray-400">
                  <Car className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No vehicles added yet. Click "Add Vehicle" to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Reports ── */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-navy-900">Sales Report</h3>
                <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-semibold hover:bg-brand-600 transition-colors">
                  <Download className="w-4 h-4" /> Download CSV
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'This Month', value: clients.filter(c => { const d = new Date(c.created_at); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() && c.status === 'approved'; }).length, sub: 'deals closed' },
                  { label: 'This Year', value: clients.filter(c => new Date(c.created_at).getFullYear() === new Date().getFullYear() && c.status === 'approved').length, sub: 'deals closed' },
                  { label: 'Conversion Rate', value: `${clients.length > 0 ? Math.round((clients.filter(c => c.status === 'approved').length / clients.length) * 100) : 0}%`, sub: 'leads to deals' },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">{s.label}</p>
                    <p className="text-2xl font-bold text-navy-900">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-navy-900 mb-4">Agent Leaderboard</h3>
              <div className="space-y-4">
                {agentList.map((agent) => {
                  const agentClients = clients.filter(c => c.agent_id === agent.id);
                  const approvedDeals = agentClients.filter(c => c.status === 'approved').length;
                  const totalCommission = agentClients.filter(c => c.status === 'approved').reduce((sum, c) => sum + (c.commission_amount || 0), 0);
                  return (
                    <div key={agent.id} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">{agent.full_name?.charAt(0) || 'A'}</div>
                      <div className="flex-1">
                        <p className="font-medium text-navy-900">{agent.full_name}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1"><div className="bg-brand-500 h-2 rounded-full" style={{ width: `${Math.max(0, Math.min(100, (approvedDeals / Math.max(1, stats.totalDeals)) * 100))}%` }} /></div>
                      </div>
                      <div className="text-right"><p className="font-bold text-navy-900">{approvedDeals} deals</p><p className="text-sm text-gray-600">R {totalCommission.toLocaleString('en-ZA')}</p></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Photos ── */}
        {activeTab === 'photos' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-200"><h3 className="text-lg font-semibold text-navy-900">Photo Manager</h3></div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {documents.filter(d => d.document_type === 'client_photo').map((doc) => {
                const client = clients.find(c => c.id === doc.client_id);
                return (
                  <div key={doc.id} className="border rounded-lg overflow-hidden">
                    <div className="h-32 bg-gray-200 flex items-center justify-center"><Image className="w-12 h-12 text-gray-400" /></div>
                    <div className="p-3"><p className="font-medium text-sm text-navy-900">{client?.first_name} {client?.last_name}</p><p className="text-xs text-gray-500">{doc.file_name}</p><p className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</p></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Job Postings ── */}
        {activeTab === 'job_postings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><h2 className="text-xl font-bold text-navy-900">Job Postings</h2><p className="text-gray-500 text-sm mt-0.5">Manage open positions</p></div>
              <button onClick={() => setShowJobForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition-colors"><Plus className="w-4 h-4" /> Post a Job</button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total', value: jobPostings.length, color: 'text-navy-900' },
                { label: 'Active', value: jobPostings.filter(j => j.is_active).length, color: 'text-green-600' },
                { label: 'Inactive', value: jobPostings.filter(j => !j.is_active).length, color: 'text-gray-500' },
              ].map((s, i) => <div key={i} className="bg-white rounded-xl p-5 shadow-sm text-center"><p className={`text-3xl font-bold ${s.color}`}>{s.value}</p><p className="text-sm text-gray-500 mt-1">{s.label}</p></div>)}
            </div>
            <div className="space-y-4">
              {jobPostings.length === 0 && <div className="bg-white rounded-xl p-12 shadow-sm text-center text-gray-400"><Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No job postings yet</p></div>}
              {jobPostings.map((job) => (
                <div key={job.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="text-lg font-bold text-navy-900">{job.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${job.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{job.is_active ? 'Active' : 'Inactive'}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3"><span className="capitalize">{job.type.replace('_', '-')}</span><span>·</span><span>{job.location}</span><span>·</span><span>{job.salary_range}</span></div>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{job.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => toggleJobPosting(job.id, !job.is_active)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${job.is_active ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>{job.is_active ? 'Deactivate' : 'Activate'}</button>
                      <button onClick={() => deleteJobPosting(job.id)} className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Approve Agent Modal ── */}
      {showApproveAgentModal && selectedPendingAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-navy-900">Approve Agent</h3>
              <button onClick={() => { setShowApproveAgentModal(false); setSelectedPendingAgent(null); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-navy-900">{selectedPendingAgent.full_name}</p>
                <p className="text-sm text-gray-600">{selectedPendingAgent.email}</p>
              </div>
              <div>
                <label className="label">Assign Role</label>
                <select value={approveAgentRole} onChange={(e) => setApproveAgentRole(e.target.value as 'remote_agent' | 'inoffice_agent')} className="input-field">
                  <option value="remote_agent">Remote Agent</option>
                  <option value="inoffice_agent">In-Office Agent</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={approveAgentWithRole} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                  <UserCheck className="w-4 h-4" /> Approve Agent
                </button>
                <button onClick={() => { setShowApproveAgentModal(false); setSelectedPendingAgent(null); }} className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Approve Sale Modal ── */}
      {showSaleApproveModal && selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-navy-900">Approve Sale</h3>
              <button onClick={() => setShowSaleApproveModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-navy-900">{selectedSale.first_name} {selectedSale.last_name}</p>
                <p className="text-sm text-gray-600">{selectedSale.vehicle_brand} {selectedSale.vehicle_model} · {selectedSale.vehicle_colour}</p>
                <p className="text-sm text-gray-500">Budget: {selectedSale.budget_range}</p>
              </div>
              <div>
                <label className="label">Commission Amount (R)</label>
                <input type="number" value={saleCommission} onChange={(e) => setSaleCommission(e.target.value)} className="input-field" placeholder="e.g. 5000" min="0" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={approveSale} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                  <CheckCircle className="w-4 h-4" /> Approve Sale
                </button>
                <button onClick={() => setShowSaleApproveModal(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Decline Sale Modal ── */}
      {showSaleDeclineModal && selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-navy-900">Decline Sale</h3>
              <button onClick={() => setShowSaleDeclineModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-navy-900">{selectedSale.first_name} {selectedSale.last_name}</p>
                <p className="text-sm text-gray-600">{selectedSale.vehicle_brand} {selectedSale.vehicle_model}</p>
              </div>
              <div>
                <label className="label">Decline Reason</label>
                <textarea value={saleDeclineReason} onChange={(e) => setSaleDeclineReason(e.target.value)} className="input-field min-h-[90px]" placeholder="Reason for declining this sale..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={declineSale} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                  <X className="w-4 h-4" /> Decline Sale
                </button>
                <button onClick={() => setShowSaleDeclineModal(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Task Modal ── */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-navy-900">Create New Task</h3>
              <button onClick={() => setShowCreateTask(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="label">Task Title <span className="text-red-500">*</span></label><input type="text" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="input-field" placeholder="Enter task title..." /></div>
              <div><label className="label">Description</label><textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className="input-field min-h-[80px]" placeholder="Task details..." /></div>
              <div><label className="label">Assign To <span className="text-red-500">*</span></label><select value={newTask.assigned_to} onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })} className="input-field"><option value="">Select agent...</option>{agentList.map(a => <option key={a.id} value={a.id}>{a.full_name} ({a.role})</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Priority</label><select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} className="input-field"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
                <div><label className="label">Due Date</label><input type="date" value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} className="input-field" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={createTask} disabled={submittingTask || !newTask.title || !newTask.assigned_to} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors">
                  <ClipboardList className="w-4 h-4" />{submittingTask ? 'Creating...' : 'Create Task'}
                </button>
                <button onClick={() => setShowCreateTask(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Post Job Modal ── */}
      {showJobForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-navy-900">Post a New Job</h3>
              <button onClick={() => setShowJobForm(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="label">Job Title <span className="text-red-500">*</span></label><input type="text" value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} className="input-field" placeholder="e.g. Remote Finance Agent" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Type</label><select value={newJob.type} onChange={(e) => setNewJob({ ...newJob, type: e.target.value })} className="input-field"><option value="remote">Remote</option><option value="in_office">In-Office</option><option value="hybrid">Hybrid</option></select></div>
                <div><label className="label">Location <span className="text-red-500">*</span></label><input type="text" value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} className="input-field" placeholder="e.g. Gauteng" /></div>
              </div>
              <div><label className="label">Salary Range <span className="text-red-500">*</span></label><input type="text" value={newJob.salary_range} onChange={(e) => setNewJob({ ...newJob, salary_range: e.target.value })} className="input-field" placeholder="e.g. R15,000 – R50,000/mo" /></div>
              <div><label className="label">Job Description <span className="text-red-500">*</span></label><textarea value={newJob.description} onChange={(e) => setNewJob({ ...newJob, description: e.target.value })} className="input-field min-h-[90px]" placeholder="Describe the role..." /></div>
              <div><label className="label">Requirements <span className="text-red-500">*</span></label><textarea value={newJob.requirements} onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })} className="input-field min-h-[80px]" placeholder="List requirements..." /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={createJobPosting} disabled={submittingJob || !newJob.title || !newJob.location || !newJob.description || !newJob.requirements || !newJob.salary_range} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors">
                  <Briefcase className="w-4 h-4" />{submittingJob ? 'Posting...' : 'Post Job'}
                </button>
                <button onClick={() => setShowJobForm(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Vehicle Modal ── */}
      {showVehicleForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-navy-900">Add Vehicle Listing</h3>
              <button onClick={() => setShowVehicleForm(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Brand <span className="text-red-500">*</span></label><input type="text" value={newVehicle.brand} onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })} className="input-field" placeholder="e.g. Toyota" /></div>
                <div><label className="label">Model <span className="text-red-500">*</span></label><input type="text" value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} className="input-field" placeholder="e.g. Corolla" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Year</label><input type="number" value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) || new Date().getFullYear() })} className="input-field" min="1990" max={new Date().getFullYear() + 1} /></div>
                <div><label className="label">Colour</label><input type="text" value={newVehicle.colour} onChange={(e) => setNewVehicle({ ...newVehicle, colour: e.target.value })} className="input-field" placeholder="e.g. White" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Condition</label><select value={newVehicle.condition} onChange={(e) => setNewVehicle({ ...newVehicle, condition: e.target.value })} className="input-field"><option value="new">New</option><option value="used">Used</option></select></div>
                <div><label className="label">Body Type</label><input type="text" value={newVehicle.body_type} onChange={(e) => setNewVehicle({ ...newVehicle, body_type: e.target.value })} className="input-field" placeholder="e.g. Sedan" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price (R) <span className="text-red-500">*</span></label>
                  <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R</span><input type="number" value={newVehicle.price || ''} onChange={(e) => setNewVehicle({ ...newVehicle, price: parseFloat(e.target.value) || 0 })} className="input-field pl-7" placeholder="250000" min="0" /></div>
                </div>
                <div><label className="label">Mileage (km)</label><input type="number" value={newVehicle.mileage || ''} onChange={(e) => setNewVehicle({ ...newVehicle, mileage: parseInt(e.target.value) || 0 })} className="input-field" placeholder="0" min="0" /></div>
              </div>
              <div><label className="label">Province</label><select value={newVehicle.province} onChange={(e) => setNewVehicle({ ...newVehicle, province: e.target.value })} className="input-field"><option value="">Select province...</option>{['Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape','Free State','Limpopo','Mpumalanga','North West','Northern Cape'].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              <div>
                <label className="label">Photo (optional)</label>
                <label className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{vehiclePhotoFile ? vehiclePhotoFile.name : 'Choose image...'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setVehiclePhotoFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={addVehicle}
                  disabled={submittingVehicle || !newVehicle.brand || !newVehicle.model || !newVehicle.price}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
                >
                  <Car className="w-4 h-4" />{submittingVehicle ? 'Adding...' : 'Add Vehicle'}
                </button>
                <button onClick={() => setShowVehicleForm(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Photo Modal ── */}
      {showUploadModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Upload Photo — {selectedClient.first_name} {selectedClient.last_name}</h3>
            <div className="space-y-4">
              <div><label className="label">Select Photo</label><input type="file" accept="image/*" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="input-field" /></div>
              <div className="flex gap-4">
                <button onClick={handlePhotoUpload} disabled={!uploadFile} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"><Upload className="w-4 h-4" /> Upload</button>
                <button onClick={() => { setShowUploadModal(false); setUploadFile(null); }} className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementDashboard;
