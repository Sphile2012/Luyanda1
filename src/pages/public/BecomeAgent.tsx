import { useState } from 'react';
import { supabase, supabaseUrl, supabaseAnonKey } from '../../lib/supabase';
import { ArrowRight, Check, DollarSign, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  motivation: string;
  how_heard: string;
  popia_consent: boolean;
};

const faqs = [
  { q: 'Do I need car sales experience?', a: 'No experience is required. We provide full training on our process, tools, and how to present vehicles to buyers. Drive experience helps but is not mandatory.' },
  { q: 'How much can I earn?', a: 'Your earnings depend on how many deals you close. Top agents earn between R20,000 to R50,000+ per month. Commission is paid on every approved deal.' },
  { q: 'Do agents get paid during training?', a: 'No. The training period is unpaid. Agents are commission-based, meaning you earn once you start closing deals. Training itself is provided at no cost to you, you simply do not receive a salary or commission while still in the training phase.' },
  { q: 'Can I work remotely?', a: 'Yes. Drive Agency offers both remote and in-office agent positions. Remote agents work from home and handle clients digitally.' },
  { q: 'What support do I get?', a: 'You receive full onboarding training, access to our CRM system, marketing materials, and ongoing support from your team lead.' },
  { q: 'How long does the interview process take?', a: 'Typically 1 to 2 weeks from application to offer, including a phone interview, skills assessment, and final interview.' },
  { q: 'Is there a contract or minimum commitment?', a: 'Standard contracts are 6-month minimum. We prefer agents who are serious about building a career with us.' },
];

const BecomeAgent = () => {
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    province: '',
    motivation: '',
    how_heard: '',
    popia_consent: false,
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!formData.popia_consent) throw new Error('Please consent to the POPIA policy');
      const { error: insertError } = await supabase.from('applications').insert([formData]);
      if (insertError) throw insertError;
      // Send confirmation email (non-blocking)
      fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseAnonKey}` },
        body: JSON.stringify({ type: 'agent_confirmation', to: formData.email, name: formData.first_name }),
      }).catch(() => {});
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-500 mb-8">
            Thank you for applying to become a Drive Agency agent. We'll review your application and contact you within 48 hours.
          </p>
          <button onClick={() => setSubmitted(false)} className="w-full btn-primary">
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section
        className="relative py-32 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1920)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-400 uppercase text-sm font-semibold tracking-widest mb-4">Career Opportunity</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight max-w-2xl">
            Become a Drive Agent
          </h1>
          <p className="text-xl text-gray-200 max-w-xl mb-8">
            Join a growing network of agents earning competitive commission across South Africa, remote or in-office.
          </p>
          <a
            href="#apply-form"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 text-white font-semibold rounded-full hover:bg-brand-600 transition-colors"
          >
            Apply Now <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand-500 uppercase text-sm font-semibold tracking-widest mb-3">Benefits</p>
            <h2 className="text-4xl font-bold text-gray-900">Why Join Our Team</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: DollarSign, title: 'Competitive Commission', desc: 'Earn attractive commission on every deal you close. No ceiling on earnings, the more deals, the more you make.' },
              { icon: Clock, title: 'Flexible Working', desc: 'Work remote or in one of our offices. Set your own schedule and create the work-life balance that suits you.' },
              { icon: MapPin, title: 'Nationwide Network', desc: 'Access training, marketing materials, CRM tools, and support from our dedicated agent success team.' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8 hover:shadow-md transition-shadow border-t-4 border-brand-500">
                <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center mb-6">
                  <item.icon className="w-7 h-7 text-brand-500" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply-form" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="text-brand-500 uppercase text-sm font-semibold tracking-widest mb-3">Apply Now</p>
              <h2 className="text-3xl font-bold mb-2 text-gray-900">Join Drive Agency</h2>
              <p className="text-gray-500 mb-8">Fill in your details and we'll review your application within 48 hours.</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">First Name *</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="input-field" placeholder="John" />
                  </div>
                  <div>
                    <label className="label">Last Name *</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="input-field" placeholder="Doe" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="label">Phone *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="input-field" placeholder="+27 123 456 7890" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">City *</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required className="input-field" placeholder="Johannesburg" />
                  </div>
                  <div>
                    <label className="label">Province *</label>
                    <select name="province" value={formData.province} onChange={handleChange} required className="input-field">
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
                  <label className="label">What motivates you to become an agent? *</label>
                  <textarea name="motivation" value={formData.motivation} onChange={handleChange} required rows={4} className="input-field" placeholder="Tell us why you want to join our team..." />
                </div>
                <div>
                  <label className="label">How did you hear about Drive Agency? *</label>
                  <select name="how_heard" value={formData.how_heard} onChange={handleChange} required className="input-field">
                    <option value="">Select an option</option>
                    <option value="website">Website</option>
                    <option value="social_media">Social Media</option>
                    <option value="friend_referral">Friend Referral</option>
                    <option value="job_board">Job Board</option>
                    <option value="google">Google Search</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" name="popia_consent" checked={formData.popia_consent} onChange={handleChange} className="mt-1 accent-brand-500" id="popia" />
                  <label htmlFor="popia" className="text-sm text-gray-500">
                    I consent to Drive Agency processing my personal information in accordance with POPIA. *
                  </label>
                </div>
                {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
                <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
                  {loading ? 'Submitting...' : <><span>Submit Application</span><ArrowRight size={18} /></>}
                </button>
              </form>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Requirements</h2>
                <div className="space-y-4">
                  {[
                    { title: 'South African Citizen', desc: 'Valid SA ID required for compliance and onboarding.' },
                    { title: '18+ Years Old', desc: 'Minimum age requirement for employment.' },
                    { title: 'Communication Skills', desc: 'Fluent in English; other South African languages are a plus.' },
                    { title: 'Basic Tech Skills', desc: 'Comfortable using a smartphone, email, and basic CRM software.' },
                    { title: 'Self-Motivated', desc: 'Commission-based work rewards drive and consistency.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">What Happens Next</h3>
                <ol className="space-y-3">
                  {[
                    'Application review (48 hours)',
                    'Phone interview with hiring manager',
                    'Skills assessment',
                    'Final interview and offer',
                    'Onboarding and training',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-600">
                      <span className="font-bold text-brand-500 flex-shrink-0">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand-500 uppercase text-sm font-semibold tracking-widest mb-3">Common Questions</p>
            <h2 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-brand-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default BecomeAgent;
