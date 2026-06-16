import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Car, Users, Building2, CheckCircle, Check, Briefcase, MapPin, DollarSign, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import heroBg from '../../assets/Screenshot_2026-06-16_110040.png';

const steps = [
  { step: '01', icon: Car, title: 'Tell Us What You Want', desc: 'Share your car preferences, budget, and financial situation in a few minutes.' },
  { step: '02', icon: Users, title: 'We Match You', desc: 'Our agents identify the best cars and dealerships that fit your exact needs.' },
  { step: '03', icon: CheckCircle, title: 'Drive Away', desc: 'We handle the paperwork and approval. You show up, sign, and drive.' },
];

const cards = [
  {
    icon: Car,
    title: 'Car Buyers',
    desc: "Find your perfect vehicle with financing that fits your budget. Our service is 100% free for buyers — always.",
    cta: 'Find My Car',
    link: '/buyers',
  },
  {
    icon: Building2,
    title: 'Dealerships',
    desc: 'Receive a steady stream of pre-screened, qualified buyers. You focus on closing — we handle the match.',
    cta: 'Partner With Us',
    link: '/dealerships',
  },
  {
    icon: Users,
    title: 'Become an Agent',
    desc: 'Build a rewarding career in vehicle finance. Earn competitive commission with full training and support.',
    cta: 'Apply Now',
    link: '/become-agent',
  },
];

const openRoles = [
  {
    title: 'Remote Finance Agent',
    type: 'Remote · Full-time',
    earning: 'R15,000 – R50,000/mo',
    desc: 'Work from anywhere in South Africa. Handle buyer enquiries, match clients to vehicles, and guide deals from enquiry to approval.',
    reqs: ['SA Citizen', 'Own smartphone & laptop', 'Strong communication skills', 'Self-motivated'],
  },
  {
    title: 'In-Office Finance Agent',
    type: 'Gauteng · Full-time',
    earning: 'R15,000 – R45,000/mo',
    desc: 'Based in our Gauteng office. Work alongside a team, receive hands-on coaching, and close deals in a structured environment.',
    reqs: ['SA Citizen', 'Gauteng based', 'Eager to learn', 'Team player'],
  },
  {
    title: 'Senior Agent / Team Lead',
    type: 'Hybrid · Full-time',
    earning: 'R40,000 – R80,000/mo',
    desc: 'Lead a team of junior agents, mentor performance, manage key dealership relationships, and drive team targets.',
    reqs: ['2+ years finance/sales', 'Leadership experience', 'CRM proficiency', 'SA Citizen'],
  },
];

type BuyerForm = {
  first_name: string; last_name: string; phone: string; email: string;
  car_type: string; employment_status: string; popia_consent: boolean;
};

type AgentForm = {
  first_name: string; last_name: string; email: string; phone: string;
  city: string; province: string; id_number: string; motivation: string;
  how_heard: string; popia_consent: boolean;
};

const defaultBuyer: BuyerForm = { first_name: '', last_name: '', phone: '', email: '', car_type: '', employment_status: '', popia_consent: false };
const defaultAgent: AgentForm = { first_name: '', last_name: '', email: '', phone: '', city: '', province: '', id_number: '', motivation: '', how_heard: '', popia_consent: false };

type Tab = 'car' | 'agent' | 'careers';

const Home = () => {
  const [activeTab, setActiveTab] = useState<Tab>('car');

  const [buyerData, setBuyerData] = useState<BuyerForm>(defaultBuyer);
  const [buyerLoading, setBuyerLoading] = useState(false);
  const [buyerSubmitted, setBuyerSubmitted] = useState(false);
  const [buyerError, setBuyerError] = useState('');

  const [agentData, setAgentData] = useState<AgentForm>(defaultAgent);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentSubmitted, setAgentSubmitted] = useState(false);
  const [agentError, setAgentError] = useState('');

  const handleBuyerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setBuyerData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleBuyerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerData.popia_consent) { setBuyerError('Please consent to the POPIA policy'); return; }
    setBuyerLoading(true);
    setBuyerError('');
    try {
      const { error } = await supabase.from('buyer_leads').insert([buyerData]);
      if (error) throw error;
      setBuyerSubmitted(true);
      setBuyerData(defaultBuyer);
    } catch (err) {
      setBuyerError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setBuyerLoading(false);
    }
  };

  const handleAgentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setAgentData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentData.popia_consent) { setAgentError('Please consent to the POPIA policy'); return; }
    setAgentLoading(true);
    setAgentError('');
    try {
      const { error } = await supabase.from('applications').insert([agentData]);
      if (error) throw error;
      setAgentSubmitted(true);
      setAgentData(defaultAgent);
    } catch (err) {
      setAgentError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setAgentLoading(false);
    }
  };

  return (
    <div className="w-full font-sans">

      {/* ── Hero ── */}
      <section
        className="relative min-h-screen"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      {/* ── How it works ── */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-20">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-500 mb-3 block">Simple Process</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-[17px] leading-relaxed">
              From first enquiry to driving away — three straightforward steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((item, i) => (
              <div key={i} className="group text-center">
                <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md group-hover:scale-105 transition-transform duration-200">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-xs font-bold text-brand-400 tracking-widest uppercase mb-2">{item.step}</p>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-[15px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who we serve ── */}
      <section className="bg-white py-24 pt-0">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-20">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-500 mb-3 block">For Everyone</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Who We Serve</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-[17px] leading-relaxed">
              Whether you're buying, selling, or building a career in car finance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cards.map((card, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-500 transition-colors duration-200">
                  <card.icon className="w-6 h-6 text-brand-500 group-hover:text-white transition-colors duration-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                <p className="text-gray-500 text-[15px] leading-relaxed mb-6">{card.desc}</p>
                <Link to={card.link} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-500 hover:text-brand-700 group/link">
                  {card.cta}
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tabbed Action Section ── */}
      <section className="bg-gray-950 py-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-20">

          {/* Tab header */}
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-400 mb-4 block">Get Started</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">What Would You Like to Do?</h2>
            <p className="text-gray-400 max-w-lg mx-auto text-[17px] leading-relaxed">
              Fill in the form below and we'll be in touch within 24 hours.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 bg-gray-900 rounded-2xl p-1.5 mb-10 max-w-xl mx-auto">
            {([
              { id: 'car' as Tab, label: 'Find Me a Car', icon: Car },
              { id: 'agent' as Tab, label: 'Become an Agent', icon: Users },
              { id: 'careers' as Tab, label: 'Careers', icon: Briefcase },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-900/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── Find Me a Car form ── */}
          {activeTab === 'car' && (
            <div className="bg-white rounded-2xl p-8 sm:p-10">
              {buyerSubmitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">You're All Set!</h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">A Drive Agent will contact you within 24 hours with matched vehicle options.</p>
                  <button onClick={() => setBuyerSubmitted(false)} className="btn-primary">Submit Another</button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Find My Perfect Car</h3>
                    <p className="text-gray-500 text-sm">100% free service. An agent will match you to the right vehicle within 24 hours.</p>
                  </div>
                  <form onSubmit={handleBuyerSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">First Name *</label>
                        <input type="text" name="first_name" value={buyerData.first_name} onChange={handleBuyerChange} required className="input-field" placeholder="John" />
                      </div>
                      <div>
                        <label className="label">Last Name *</label>
                        <input type="text" name="last_name" value={buyerData.last_name} onChange={handleBuyerChange} required className="input-field" placeholder="Doe" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Email *</label>
                        <input type="email" name="email" value={buyerData.email} onChange={handleBuyerChange} required className="input-field" placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="label">Phone *</label>
                        <input type="tel" name="phone" value={buyerData.phone} onChange={handleBuyerChange} required className="input-field" placeholder="+27 123 456 7890" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Car Type *</label>
                        <select name="car_type" value={buyerData.car_type} onChange={handleBuyerChange} required className="input-field">
                          <option value="">Select type</option>
                          <option value="sedan">Sedan</option>
                          <option value="suv">SUV / Crossover</option>
                          <option value="hatchback">Hatchback</option>
                          <option value="truck">Truck / Bakkie</option>
                          <option value="van">Van / MPV</option>
                          <option value="convertible">Convertible</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Employment Status *</label>
                        <select name="employment_status" value={buyerData.employment_status} onChange={handleBuyerChange} required className="input-field">
                          <option value="">Select status</option>
                          <option value="employed">Employed (Permanent)</option>
                          <option value="employed_contract">Employed (Contract)</option>
                          <option value="self_employed">Self-Employed</option>
                          <option value="retired">Retired</option>
                          <option value="student">Student</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" name="popia_consent" checked={buyerData.popia_consent} onChange={handleBuyerChange} className="mt-1 accent-brand-500" />
                      <span className="text-sm text-gray-500">I consent to Drive Agency processing my personal information in accordance with POPIA. *</span>
                    </label>
                    {buyerError && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{buyerError}</div>}
                    <button type="submit" disabled={buyerLoading} className="w-full btn-primary disabled:opacity-50">
                      {buyerLoading ? 'Submitting...' : <><span>Find My Car</span><ArrowRight size={18} /></>}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* ── Become an Agent form ── */}
          {activeTab === 'agent' && (
            <div className="bg-white rounded-2xl p-8 sm:p-10">
              {agentSubmitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">We'll review your application and contact you within 48 hours.</p>
                  <button onClick={() => setAgentSubmitted(false)} className="btn-primary">Submit Another</button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Apply to Join Drive Agency</h3>
                    <p className="text-gray-500 text-sm">We'll review your application and be in touch within 48 hours.</p>
                  </div>
                  <form onSubmit={handleAgentSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">First Name *</label>
                        <input type="text" name="first_name" value={agentData.first_name} onChange={handleAgentChange} required className="input-field" placeholder="John" />
                      </div>
                      <div>
                        <label className="label">Last Name *</label>
                        <input type="text" name="last_name" value={agentData.last_name} onChange={handleAgentChange} required className="input-field" placeholder="Doe" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Email *</label>
                        <input type="email" name="email" value={agentData.email} onChange={handleAgentChange} required className="input-field" placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="label">Phone *</label>
                        <input type="tel" name="phone" value={agentData.phone} onChange={handleAgentChange} required className="input-field" placeholder="+27 123 456 7890" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">City *</label>
                        <input type="text" name="city" value={agentData.city} onChange={handleAgentChange} required className="input-field" placeholder="Johannesburg" />
                      </div>
                      <div>
                        <label className="label">Province *</label>
                        <select name="province" value={agentData.province} onChange={handleAgentChange} required className="input-field">
                          <option value="">Select province</option>
                          <option value="gauteng">Gauteng</option>
                          <option value="western_cape">Western Cape</option>
                          <option value="kwazulu_natal">KwaZulu-Natal</option>
                          <option value="limpopo">Limpopo</option>
                          <option value="mpumalanga">Mpumalanga</option>
                          <option value="north_west">North West</option>
                          <option value="northern_cape">Northern Cape</option>
                          <option value="eastern_cape">Eastern Cape</option>
                          <option value="free_state">Free State</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label">SA ID Number *</label>
                      <input type="text" name="id_number" value={agentData.id_number} onChange={handleAgentChange} required className="input-field" placeholder="000000 000 00 0" />
                    </div>
                    <div>
                      <label className="label">What motivates you to become an agent? *</label>
                      <textarea name="motivation" value={agentData.motivation} onChange={handleAgentChange} required rows={3} className="input-field" placeholder="Tell us why you want to join our team..." />
                    </div>
                    <div>
                      <label className="label">How did you hear about us? *</label>
                      <select name="how_heard" value={agentData.how_heard} onChange={handleAgentChange} required className="input-field">
                        <option value="">Select an option</option>
                        <option value="website">Website</option>
                        <option value="social_media">Social Media</option>
                        <option value="friend_referral">Friend Referral</option>
                        <option value="job_board">Job Board</option>
                        <option value="google">Google Search</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" name="popia_consent" checked={agentData.popia_consent} onChange={handleAgentChange} className="mt-1 accent-brand-500" />
                      <span className="text-sm text-gray-500">I consent to Drive Agency processing my personal information in accordance with POPIA. *</span>
                    </label>
                    {agentError && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{agentError}</div>}
                    <button type="submit" disabled={agentLoading} className="w-full btn-primary disabled:opacity-50">
                      {agentLoading ? 'Submitting...' : <><span>Submit Application</span><ArrowRight size={18} /></>}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* ── Careers tab ── */}
          {activeTab === 'careers' && (
            <div className="space-y-5">
              {openRoles.map((role, i) => (
                <div key={i} className="bg-white rounded-2xl p-7 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{role.title}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand-500" />{role.type}</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-brand-500" />{role.earning}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-brand-500" />Commission-based</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('agent')}
                      className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors"
                    >
                      Apply Now <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-600 text-[15px] leading-relaxed mb-5">{role.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {role.reqs.map((r, j) => (
                      <span key={j} className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full">
                        <Check className="w-3 h-3" />{r}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <p className="text-center text-gray-500 text-sm pt-2">
                Don't see the right fit?{' '}
                <button onClick={() => setActiveTab('agent')} className="text-brand-400 font-semibold hover:text-brand-300 underline underline-offset-2">
                  Send a general application
                </button>
              </p>
            </div>
          )}

        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-navy-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-400/6 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
            Ready to Find Your Perfect Car?
          </h2>
          <p className="text-gray-400 text-[17px] leading-relaxed mb-10 max-w-xl mx-auto">
            Join thousands of South Africans who found their ideal vehicle through Drive Agency. Free, fast, and stress-free.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/buyers"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition-colors shadow-lg shadow-brand-900/40"
            >
              Get Started Today <ArrowRight size={17} />
            </Link>
            <Link
              to="/become-agent"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-white font-semibold rounded-lg border border-white/20 hover:bg-white/8 transition-colors"
            >
              Join as Agent
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
