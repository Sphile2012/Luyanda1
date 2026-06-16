import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Profile, Application, Client, BuyerLead, Vehicle, ClientDocument, Dealership } from '../../lib/supabase';
import { Car, Users, FileText, TrendingUp, LogOut, Search, CircleCheck as CheckCircle, Upload, Eye, MapPin, DollarSign, ChartBar as BarChart3, ListFilter as Filter, Clock, Target, Award, Building, Image, Folder } from 'lucide-react';

type Tab = 'overview' | 'inventory' | 'applications' | 'leads' | 'clients' | 'client_folder' | 'commission' | 'management' | 'reports';

const AgentDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
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

  const isManagement = profile?.role === 'management' || profile?.role === 'admin';

  useEffect(() => {
    if (!user || !profile) {
      navigate('/portal');
      return;
    }

    const allowedRoles = ['remote_agent', 'inoffice_agent', 'management', 'admin'];
    if (!allowedRoles.includes(profile.role)) {
      navigate('/portal');
      return;
    }

    fetchData();
  }, [user, profile, navigate]);

  const fetchData = async () => {
    setLoading(true);

    const { data: vehiclesData } = await supabase
      .from('vehicles')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    const { data: dealershipsData } = await supabase
      .from('dealerships')
      .select('*')
      .eq('is_active', true);

    if (isManagement) {
      const [
        { data: applicationsData },
        { data: clientsData },
        { data: leadsData },
        { data: agentsData },
        { data: documentsData },
      ] = await Promise.all([
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
      const [
        { data: clientsData },
        { data: leadsData },
        { data: documentsData },
      ] = await Promise.all([
        supabase.from('clients').select('*').eq('agent_id', user?.id).order('created_at', { ascending: false }),
        supabase.from('buyer_leads').select('*').eq('assigned_agent_id', user?.id).order('created_at', { ascending: false }),
        supabase.from('client_documents').select('*').order('created_at', { ascending: false }),
      ]);

      if (clientsData) setClients(clientsData as Client[]);
      if (leadsData) setLeads(leadsData as BuyerLead[]);
      if (documentsData) setDocuments(documentsData as ClientDocument[]);

      const { data: applicationsData } = await supabase
        .from('applications')
        .select('*')
        .eq('email', profile?.email);

      if (applicationsData) setApplications(applicationsData as Application[]);
    }

    if (vehiclesData) setVehicles(vehiclesData as Vehicle[]);
    if (dealershipsData) setDealerships(dealershipsData as Dealership[]);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const updateLeadStatus = async (leadId: string, status: 'new' | 'contacted' | 'qualified' | 'closed') => {
    const { error } = await supabase
      .from('buyer_leads')
      .update({ status, notes: notes || undefined })
      .eq('id', leadId);

    if (!error) {
      setLeads(leads.map(l => l.id === leadId ? { ...l, status } : l));
      setShowLeadModal(false);
      setNotes('');
    }
  };

  const updateClientStatus = async (clientId: string, status: 'pending' | 'approved' | 'declined') => {
    const { error } = await supabase
      .from('clients')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', clientId);

    if (!error) {
      setClients(clients.map(c => c.id === clientId ? { ...c, status } : c));
      setShowClientModal(false);
    }
  };

  const getStats = () => {
    const myClients = isManagement ? clients : clients.filter(c => c.agent_id === user?.id);
    const myLeads = isManagement ? leads : leads.filter(l => l.assigned_agent_id === user?.id);

    const pendingDeals = myClients.filter(c => c.status === 'pending').length;
    const closedDeals = myClients.filter(c => c.status === 'approved').length;
    const totalCommission = myClients
      .filter(c => c.status === 'approved')
      .reduce((sum, c) => sum + (c.commission_amount || 0), 0);
    const activeLeads = myLeads.filter(l => l.status !== 'closed').length;

    return { pendingDeals, closedDeals, totalCommission, activeLeads };
  };

  const stats = getStats();

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch =
      v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.province?.toLowerCase().includes(searchTerm.toLowerCase());
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

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'inventory', label: 'Inventory Browser', icon: Car },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'leads', label: 'Leads Management', icon: Users },
    { id: 'clients', label: 'My Clients', icon: Users },
    { id: 'client_folder', label: 'Client Folder', icon: Folder },
    { id: 'commission', label: 'Commission Tracker', icon: DollarSign },
  ];

  if (isManagement) {
    sidebarItems.push({ id: 'management', label: 'Agent Management', icon: TrendingUp });
  }
  sidebarItems.push({ id: 'reports', label: 'Reports & Analytics', icon: Target });

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-navy-900 text-white flex flex-col">
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
              {profile?.full_name?.charAt(0) || 'A'}
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
            <h1 className="text-2xl font-bold text-navy-900">
              {isManagement ? 'Agent Dashboard' : 'My Dashboard'}
            </h1>
            <p className="text-gray-600">Welcome back, {profile?.full_name}</p>
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
                  <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending Deals</p>
                    <p className="text-2xl font-bold text-navy-900">{stats.pendingDeals}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Closed Deals</p>
                    <p className="text-2xl font-bold text-navy-900">{stats.closedDeals}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Commission</p>
                    <p className="text-2xl font-bold text-navy-900">R{stats.totalCommission.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Leads</p>
                    <p className="text-2xl font-bold text-navy-900">{stats.activeLeads}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">Recent Leads</h3>
                <div className="space-y-3">
                  {leads.slice(0, 5).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-navy-900">{lead.first_name} {lead.last_name}</p>
                        <p className="text-sm text-gray-600">{lead.car_type}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          lead.status === 'new'
                            ? 'bg-blue-100 text-blue-700'
                            : lead.status === 'contacted'
                            ? 'bg-yellow-100 text-yellow-700'
                            : lead.status === 'qualified'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </div>
                  ))}
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">All Conditions</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by brand, model, or province..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => {
                const dealership = dealerships.find(d => d.id === vehicle.dealership_id);

                return (
                  <div key={vehicle.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                      {vehicle.photos?.[0] ? (
                        <img
                          src={vehicle.photos[0]}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Car className="w-16 h-16 text-gray-400" />
                      )}
                      <span
                        className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-medium ${
                          vehicle.condition === 'new'
                            ? 'bg-blue-600 text-white'
                            : 'bg-orange-600 text-white'
                        }`}
                      >
                        {vehicle.condition}
                      </span>
                    </div>
                    <div className="p-5">
                      <h4 className="text-lg font-semibold text-navy-900">
                        {vehicle.brand} {vehicle.model}
                      </h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>{vehicle.year} | {vehicle.body_type}</p>
                        <p>{vehicle.colour} | {vehicle.mileage?.toLocaleString()} km</p>
                        <p className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {vehicle.province}
                        </p>
                        {dealership && (
                          <p className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {dealership.name}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xl font-bold text-brand-500">R{vehicle.price.toLocaleString()}</p>
                        <button className="btn-primary text-sm px-4 py-2">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-navy-900">
                {isManagement ? 'All Applications' : 'My Application'}
              </h3>
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
                        <button className="p-2 rounded hover:bg-gray-100 text-brand-600">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search leads..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <button className="bg-white rounded-xl p-4 shadow-sm border-2 border-transparent hover:border-brand-500 transition-colors">
                <p className="text-sm text-gray-600">New Leads</p>
                <p className="text-2xl font-bold text-blue-600">{leads.filter(l => l.status === 'new').length}</p>
              </button>
              <button className="bg-white rounded-xl p-4 shadow-sm border-2 border-transparent hover:border-brand-500 transition-colors">
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-yellow-600">{leads.filter(l => l.status === 'contacted').length}</p>
              </button>
              <button className="bg-white rounded-xl p-4 shadow-sm border-2 border-transparent hover:border-brand-500 transition-colors">
                <p className="text-sm text-gray-600">Qualified</p>
                <p className="text-2xl font-bold text-green-600">{leads.filter(l => l.status === 'qualified').length}</p>
              </button>
              <button className="bg-white rounded-xl p-4 shadow-sm border-2 border-transparent hover:border-brand-500 transition-colors">
                <p className="text-sm text-gray-600">Closed</p>
                <p className="text-2xl font-bold text-gray-600">{leads.filter(l => l.status === 'closed').length}</p>
              </button>
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
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-navy-900">{lead.first_name} {lead.last_name}</p>
                          <p className="text-sm text-gray-500">{lead.email}</p>
                          <p className="text-sm text-gray-400">{lead.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{lead.car_type}</td>
                      <td className="px-4 py-4 text-gray-600">{lead.employment_status}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            lead.status === 'new'
                              ? 'bg-blue-100 text-blue-700'
                              : lead.status === 'contacted'
                              ? 'bg-yellow-100 text-yellow-700'
                              : lead.status === 'qualified'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-600 text-sm">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setNotes(lead.notes || '');
                            setShowLeadModal(true);
                          }}
                          className="btn-secondary text-sm px-3 py-1"
                        >
                          Manage
                        </button>
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
              <h3 className="text-lg font-semibold text-navy-900">
                {isManagement ? 'All Clients' : 'My Clients'}
              </h3>
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
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-navy-900">{client.first_name} {client.last_name}</p>
                          <p className="text-sm text-gray-500">{client.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-navy-900">{client.vehicle_brand} {client.vehicle_model}</p>
                          <p className="text-sm text-gray-500">{client.vehicle_colour} | {client.vehicle_condition}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{client.budget_range}</td>
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
                      <td className="px-4 py-4">
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setShowClientModal(true);
                          }}
                          className="btn-secondary text-sm px-3 py-1"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'management' && isManagement && (
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {agents.filter(a => a.role !== 'pending' && a.role !== 'admin').map((agent) => {
                    const agentClients = clients.filter(c => c.agent_id === agent.id);
                    const closedDeals = agentClients.filter(c => c.status === 'approved').length;
                    const totalCommission = agentClients
                      .filter(c => c.status === 'approved')
                      .reduce((sum, c) => sum + (c.commission_amount || 0), 0);

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
                        <td className="px-4 py-4 text-navy-900 font-medium">{closedDeals}</td>
                        <td className="px-4 py-4 text-navy-900 font-medium">R{totalCommission.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Deals</p>
                    <p className="text-3xl font-bold text-navy-900">{stats.closedDeals}</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-green-500 rounded-full" style={{ width: `${Math.min(100, stats.closedDeals * 5)}%` }}></div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-navy-900">R{stats.totalCommission.toLocaleString()}</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-brand-500 rounded-full" style={{ width: `${Math.min(100, stats.totalCommission / 100)}%` }}></div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Conversion Rate</p>
                    <p className="text-3xl font-bold text-navy-900">
                      {clients.length > 0
                        ? Math.round((stats.closedDeals / clients.length) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${clients.length > 0 ? Math.round((stats.closedDeals / clients.length) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-navy-900 mb-6">Performance by Province</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State'].map((province) => {
                  const provinceClients = clients.filter(c => c.province === province);
                  const provinceRevenue = provinceClients
                    .filter(c => c.status === 'approved')
                    .reduce((sum, c) => sum + (c.commission_amount || 0), 0);

                  return (
                    <div key={province} className="border rounded-lg p-4 text-center">
                      <p className="font-medium text-navy-900">{province}</p>
                      <p className="text-sm text-gray-600">{provinceClients.length} clients</p>
                      <p className="text-lg font-bold text-brand-500 mt-2">R{provinceRevenue.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-navy-900 mb-6">Monthly Trend</h3>
              <div className="flex items-end gap-2 h-40">
                {[1, 2, 3, 4, 5, 6].map((month) => {
                  const monthClients = clients.filter(c => {
                    const date = new Date(c.created_at);
                    return date.getMonth() === month;
                  }).filter(c => c.status === 'approved').length;

                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-brand-500 rounded-t"
                        style={{ height: `${Math.max(10, monthClients * 20)}px` }}
                      ></div>
                      <p className="text-xs text-gray-600">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][month - 1]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'client_folder' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-navy-900">{clients.length}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <p className="text-sm text-gray-600">Documents Uploaded</p>
                <p className="text-3xl font-bold text-navy-900">{documents.length}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <p className="text-sm text-gray-600">Clients with Docs</p>
                <p className="text-3xl font-bold text-navy-900">
                  {new Set(documents.map(d => d.client_id)).size}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-navy-900">Client Documents</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {clients.map((client) => {
                  const clientDocs = documents.filter(d => d.client_id === client.id);
                  return (
                    <div key={client.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
                            {client.first_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-navy-900">{client.first_name} {client.last_name}</p>
                            <p className="text-sm text-gray-500">{client.phone}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          client.status === 'approved' ? 'bg-green-100 text-green-700' :
                          client.status === 'declined' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {client.status}
                        </span>
                      </div>
                      {clientDocs.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {clientDocs.map((doc) => (
                            <span key={doc.id} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              <Folder className="w-3 h-3" />
                              {doc.document_type.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 mt-2">No documents uploaded</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'commission' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600">Total Earned</p>
                </div>
                <p className="text-3xl font-bold text-navy-900">R{stats.totalCommission.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                    <Award className="w-5 h-5 text-brand-600" />
                  </div>
                  <p className="text-sm text-gray-600">Closed Deals</p>
                </div>
                <p className="text-3xl font-bold text-navy-900">{stats.closedDeals}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600">Avg per Deal</p>
                </div>
                <p className="text-3xl font-bold text-navy-900">
                  R{stats.closedDeals > 0 ? Math.round(stats.totalCommission / stats.closedDeals).toLocaleString() : 0}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-navy-900">Commission per Deal</h3>
              </div>
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
                        <td className="px-4 py-4">
                          <p className="font-medium text-navy-900">{client.first_name} {client.last_name}</p>
                          <p className="text-xs text-gray-500">{client.province}</p>
                        </td>
                        <td className="px-4 py-4 text-gray-700">
                          {client.vehicle_brand} {client.vehicle_model}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            client.status === 'approved' ? 'bg-green-100 text-green-700' :
                            client.status === 'declined' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {client.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className={`font-bold ${client.status === 'approved' ? 'text-green-600' : 'text-gray-400'}`}>
                            {client.status === 'approved' ? `R${(client.commission_amount || 0).toLocaleString()}` : '—'}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {new Date(client.created_at).toLocaleDateString()}
                        </td>
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
                  const monthCommission = clients
                    .filter(c => {
                      const date = new Date(c.created_at);
                      return date.getMonth() === targetMonth && c.status === 'approved';
                    })
                    .reduce((sum, c) => sum + (c.commission_amount || 0), 0);

                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return (
                    <div key={monthOffset} className="flex-1 flex flex-col items-center gap-2">
                      <p className="text-xs text-gray-500">R{(monthCommission / 1000).toFixed(0)}k</p>
                      <div
                        className="w-full bg-brand-500 rounded-t hover:bg-brand-600 transition-colors cursor-default"
                        style={{ height: `${Math.max(8, Math.min(120, monthCommission / 100))}px` }}
                      ></div>
                      <p className="text-xs text-gray-600">{monthNames[targetMonth]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {showLeadModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
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
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field min-h-[100px]"
                  placeholder="Add notes about this lead..."
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {['new', 'contacted', 'qualified', 'closed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateLeadStatus(selectedLead.id, status as BuyerLead['status'])}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                      selectedLead.status === status
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <button onClick={() => { setShowLeadModal(false); setNotes(''); }} className="w-full btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showClientModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
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
                  <button
                    key={status}
                    onClick={() => updateClientStatus(selectedClient.id, status as Client['status'])}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                      selectedClient.status === status
                        ? status === 'approved'
                          ? 'bg-green-500 text-white'
                          : status === 'declined'
                          ? 'bg-red-500 text-white'
                          : 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowClientModal(false)} className="w-full btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
