import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Profile, Application, Client, BuyerLead, Vehicle, ClientDocument } from '../../lib/supabase';
import { Car, Users, FileText, TrendingUp, Settings, LogOut, Search, Eye, CircleCheck as CheckCircle, Circle as XCircle, Upload, ChevronDown, ChartBar as BarChart3, Download, Trash2, CreditCard as Edit, Image, Calendar, DollarSign, UserCheck, UserX, Folder } from 'lucide-react';

type Tab = 'overview' | 'agents' | 'applications' | 'clients' | 'inventory' | 'reports' | 'photos';

const ManagementDashboard = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [agents, setAgents] = useState<Profile[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<BuyerLead[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Profile | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user || !profile) {
      navigate('/portal');
      return;
    }

    const allowedRoles = ['management', 'admin'];
    if (!allowedRoles.includes(profile.role)) {
      navigate('/portal');
      return;
    }

    fetchData();
  }, [user, profile, navigate]);

  const fetchData = async () => {
    setLoading(true);
    const [
      { data: agentsData },
      { data: applicationsData },
      { data: clientsData },
      { data: leadsData },
      { data: vehiclesData },
      { data: documentsData },
    ] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: true }),
      supabase.from('applications').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('buyer_leads').select('*').order('created_at', { ascending: false }),
      supabase.from('vehicles').select('*').eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('client_documents').select('*').order('created_at', { ascending: false }),
    ]);

    if (agentsData) setAgents(agentsData as Profile[]);
    if (applicationsData) setApplications(applicationsData as Application[]);
    if (clientsData) setClients(clientsData as Client[]);
    if (leadsData) setLeads(leadsData as BuyerLead[]);
    if (vehiclesData) setVehicles(vehiclesData as Vehicle[]);
    if (documentsData) setDocuments(documentsData as ClientDocument[]);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const updateAgentStatus = async (agentId: string, status: 'active' | 'inactive') => {
    const { error } = await supabase
      .from('profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', agentId);

    if (!error) {
      setAgents(agents.map(a => a.id === agentId ? { ...a, status } : a));
    }
  };

  const activateAgent = async (agentId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'active', role: 'remote_agent' })
      .eq('id', agentId);

    if (!error) {
      refreshProfile();
      fetchData();
    }
  };

  const deleteAgent = async (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent? This cannot be undone.')) {
      const { error } = await supabase.from('profiles').delete().eq('id', agentId);
      if (!error) {
        setAgents(agents.filter(a => a.id !== agentId));
      }
    }
  };

  const updateApplicationStatus = async (
    appId: string,
    status: 'approved' | 'declined',
    assignedRole?: 'remote_agent' | 'inoffice_agent' | 'management',
    declineReason?: string
  ) => {
    const updates: Record<string, unknown> = {
      status,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    };
    if (assignedRole) updates.assigned_role = assignedRole;
    if (declineReason) updates.decline_reason = declineReason;

    const { error } = await supabase.from('applications').update(updates).eq('id', appId);
    if (!error) fetchData();
  };

  const handlePhotoUpload = async () => {
    if (!uploadFile || !selectedClient) return;

    const fileExt = uploadFile.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${selectedClient.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('client_documents')
      .upload(filePath, uploadFile);

    if (uploadError) {
      alert('Error uploading file: ' + uploadError.message);
      return;
    }

    const { error: dbError } = await supabase.from('client_documents').insert({
      client_id: selectedClient.id,
      uploaded_by: user?.id,
      document_type: 'client_photo',
      file_name: uploadFile.name,
      file_path: filePath,
      file_size: uploadFile.size,
      mime_type: uploadFile.type,
      description: 'Client photo uploaded by management',
    });

    if (!dbError) {
      setShowUploadModal(false);
      setUploadFile(null);
      fetchData();
    }
  };

  const getStats = () => {
    const activeAgents = agents.filter(a => a.status === 'active').length;
    const totalDeals = clients.filter(c => c.status === 'approved').length;
    const pendingApplications = applications.filter(a => a.status === 'pending').length;
    const totalCommission = clients
      .filter(c => c.status === 'approved')
      .reduce((sum, c) => sum + (c.commission_amount || 0), 0);

    return { activeAgents, totalDeals, pendingApplications, totalCommission };
  };

  const stats = getStats();

  const filteredAgents = agents.filter(
    a =>
      a.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApplications = applications.filter(
    a =>
      a.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'inventory', label: 'Inventory', icon: Car },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
    { id: 'photos', label: 'Photo Manager', icon: Image },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-navy-900 text-white flex flex-col">
        <div className="p-4 border-b border-navy-700">
          <div className="flex items-center gap-2">
            <Car className="w-8 h-8 text-brand-400" />
            <span className="text-lg font-bold">Drive Agency</span>
          </div>
        </div>

        <nav className="flex-1 py-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-300 hover:bg-navy-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-navy-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">
              {profile?.full_name?.charAt(0) || 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{profile?.full_name}</p>
              <p className="text-xs text-gray-400 truncate">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded bg-red-600 hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Management Dashboard</h1>
            <p className="text-gray-600">Manage agents, applications, and track performance</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Agents</p>
                    <p className="text-2xl font-bold text-navy-900">{stats.activeAgents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Deals</p>
                    <p className="text-2xl font-bold text-navy-900">{stats.totalDeals}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending Applications</p>
                    <p className="text-2xl font-bold text-navy-900">{stats.pendingApplications}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Commission</p>
                    <p className="text-2xl font-bold text-navy-900">R{stats.totalCommission.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">Recent Applications</h3>
                <div className="space-y-3">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-navy-900">{app.first_name} {app.last_name}</p>
                        <p className="text-sm text-gray-600">{app.email}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          app.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : app.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">Agent Performance</h3>
                <div className="space-y-3">
                  {agents
                    .filter(a => a.role !== 'pending' && a.role !== 'admin')
                    .slice(0, 5)
                    .map((agent) => {
                      const agentClients = clients.filter(c => c.agent_id === agent.id);
                      const approvedDeals = agentClients.filter(c => c.status === 'approved').length;

                      return (
                        <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
                              {agent.full_name?.charAt(0) || 'A'}
                            </div>
                            <div>
                              <p className="font-medium text-navy-900">{agent.full_name}</p>
                              <p className="text-sm text-gray-600">{agent.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-navy-900">{approvedDeals} deals</p>
                            <p className="text-sm text-gray-600">{agentClients.length} clients</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-navy-900">Agent Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deals</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAgents.map((agent) => {
                    const agentClients = clients.filter(c => c.agent_id === agent.id);
                    const approvedDeals = agentClients.filter(c => c.status === 'approved').length;

                    return (
                      <tr key={agent.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
                              {agent.full_name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-medium text-navy-900">{agent.full_name}</p>
                              <p className="text-sm text-gray-500">{agent.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700">
                            {agent.role}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              agent.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {agent.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-navy-900 font-medium">{approvedDeals}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {agent.status !== 'active' && (
                              <button
                                onClick={() => activateAgent(agent.id)}
                                className="p-2 rounded hover:bg-green-100 text-green-600"
                                title="Activate Agent"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            {agent.status === 'active' && (
                              <button
                                onClick={() => updateAgentStatus(agent.id, 'inactive')}
                                className="p-2 rounded hover:bg-yellow-100 text-yellow-600"
                                title="Deactivate Agent"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteAgent(agent.id)}
                              className="p-2 rounded hover:bg-red-100 text-red-600"
                              title="Delete Agent"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-navy-900">Agent Applications</h3>
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
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-navy-900">{app.first_name} {app.last_name}</p>
                          <p className="text-sm text-gray-500">{app.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{app.city}, {app.province}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            app.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : app.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-600 text-sm">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        {app.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateApplicationStatus(app.id, 'approved', 'remote_agent')}
                              className="px-3 py-1 rounded bg-green-600 text-white text-xs font-medium hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Enter decline reason:');
                                if (reason) updateApplicationStatus(app.id, 'declined', undefined, reason);
                              }}
                              className="px-3 py-1 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700"
                            >
                              Decline
                            </button>
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

        {activeTab === 'clients' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-navy-900">Client Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clients.map((client) => {
                    const agent = agents.find(a => a.id === client.agent_id);

                    return (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-navy-900">{client.first_name} {client.last_name}</p>
                            <p className="text-sm text-gray-500">{client.phone}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-navy-900">{client.vehicle_brand} {client.vehicle_model}</p>
                            <p className="text-sm text-gray-500">{client.vehicle_colour} | {client.budget_range}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              client.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : client.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {client.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-600">{agent?.full_name || 'Unassigned'}</td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setShowUploadModal(true);
                            }}
                            className="p-2 rounded hover:bg-gray-100 text-brand-600"
                            title="Upload Photo"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-navy-900">Vehicle Inventory</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-40 bg-gray-200 flex items-center justify-center">
                    {vehicle.photos?.[0] ? (
                      <img src={vehicle.photos[0]} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
                    ) : (
                      <Car className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-navy-900">{vehicle.brand} {vehicle.model}</h4>
                    <p className="text-sm text-gray-600">{vehicle.year} | {vehicle.body_type} | {vehicle.colour}</p>
                    <p className="text-lg font-bold text-brand-500 mt-2">R{vehicle.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{vehicle.mileage?.toLocaleString()} km | {vehicle.province}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-navy-900">Sales Report</h3>
                <button className="btn-secondary text-sm">
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-navy-900">
                    {clients.filter(c => {
                      const date = new Date(c.created_at);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    }).filter(c => c.status === 'approved').length}
                  </p>
                  <p className="text-xs text-gray-500">deals closed</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">This Year</p>
                  <p className="text-2xl font-bold text-navy-900">
                    {clients.filter(c => {
                      const date = new Date(c.created_at);
                      return date.getFullYear() === new Date().getFullYear();
                    }).filter(c => c.status === 'approved').length}
                  </p>
                  <p className="text-xs text-gray-500">deals closed</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-navy-900">
                    {clients.length > 0
                      ? Math.round((clients.filter(c => c.status === 'approved').length / clients.length) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-500">applicants to deals</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-navy-900 mb-4">Agent Leaderboard</h3>
              <div className="space-y-4">
                {agents
                  .filter(a => a.role !== 'pending' && a.role !== 'admin')
                  .map((agent) => {
                    const agentClients = clients.filter(c => c.agent_id === agent.id);
                    const approvedDeals = agentClients.filter(c => c.status === 'approved').length;
                    const totalCommission = agentClients
                      .filter(c => c.status === 'approved')
                      .reduce((sum, c) => sum + (c.commission_amount || 0), 0);

                    return (
                      <div key={agent.id} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
                          {agent.full_name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-navy-900">{agent.full_name}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-brand-500 h-2 rounded-full"
                              style={{
                                width: `${Math.max(0, Math.min(100, (approvedDeals / Math.max(1, stats.totalDeals)) * 100))}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-navy-900">{approvedDeals} deals</p>
                          <p className="text-sm text-gray-600">R{totalCommission.toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-navy-900">Photo Manager</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {documents.filter(d => d.document_type === 'client_photo').map((doc) => {
                const client = clients.find(c => c.id === doc.client_id);
                return (
                  <div key={doc.id} className="border rounded-lg overflow-hidden">
                    <div className="h-32 bg-gray-200 flex items-center justify-center">
                      {client ? (
                        <Image className="w-12 h-12 text-gray-400" />
                      ) : (
                        <Image className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm text-navy-900">{client?.first_name} {client?.last_name}</p>
                      <p className="text-xs text-gray-500">{doc.file_name}</p>
                      <p className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {showUploadModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Upload Photo for {selectedClient.first_name} {selectedClient.last_name}</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Select Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="input-field"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handlePhotoUpload}
                  disabled={!uploadFile}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  Upload
                </button>
                <button onClick={() => { setShowUploadModal(false); setUploadFile(null); }} className="btn-secondary">
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

export default ManagementDashboard;
