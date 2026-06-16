import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowRight, Check, ChevronDown, ChevronUp, Car, Shield, Zap, Users } from 'lucide-react';

const heroBg = new URL('../../assets/Screenshot_2026-06-16_104822.png', import.meta.url).href;

type FormData = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  car_type: string;
  employment_status: string;
  popia_consent: boolean;
};

const carBrands = ['Toyota', 'Volkswagen', 'Ford', 'BMW', 'Mercedes-Benz', 'Hyundai', 'Kia', 'Nissan', 'Audi', 'Honda', 'Mazda', 'Isuzu', 'Haval', 'Suzuki', 'Chevrolet', 'Jeep', 'Renault', 'Mitsubishi'];

const faqs = [
  { q: 'How long does the process take?', a: 'Most buyers get matched and approved within 24–48 hours. Our agents work quickly to find your ideal match.' },
  { q: 'Is it really free for buyers?', a: 'Yes, 100% free. We earn a commission from dealerships when deals close — buyers pay nothing.' },
  { q: 'What if I have bad credit?', a: 'We work with dealerships that specialise in various credit profiles, including lower credit scores. We find what works for you.' },
  { q: 'Do I need a deposit?', a: 'Not always. Depending on your credit profile and the vehicle, some deals require no deposit. Your agent will explain all options.' },
  { q: 'Can I choose any car brand?', a: 'Yes. We work with over 50 dealerships stocking all major brands across South Africa.' },
  { q: 'What happens after I submit the form?', a: 'A Drive Agent will contact you within 24 hours to discuss your preferences and present matching options.' },
];

const Buyers = () => {
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    car_type: '',
    employment_status: '',
    popia_consent: false,
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const { error: insertError } = await supabase.from('buyer_leads').insert([formData]);
      if (insertError) throw insertError;
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">You're All Set!</h2>
          <p className="text-gray-500 mb-8">
            Thank you for submitting your details. Our team will review your information and match you with the perfect car within 24 hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="w-full btn-primary"
          >
            Submit Another Lead
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
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-400 uppercase text-sm font-semibold tracking-widest mb-4">For Buyers</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight max-w-2xl">
            Find Your Perfect Car
          </h1>
          <p className="text-xl text-gray-200 max-w-xl mb-8">
            100% free, personalised matches from trusted dealerships across South Africa.
          </p>
          <a
            href="#lead-form"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 text-white font-semibold rounded-full hover:bg-brand-600 transition-colors"
          >
            Get Started Free <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* Why Buy With Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand-500 uppercase text-sm font-semibold tracking-widest mb-3">Why Choose Us</p>
            <h2 className="text-4xl font-bold text-gray-900">Why Buy With Drive Agency</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Check, title: '100% Free', desc: 'No hidden fees ever. We earn when dealerships sell, not from buyers.' },
              { icon: Users, title: 'Personal Agent', desc: 'A dedicated agent guides you from enquiry to driving away.' },
              { icon: Zap, title: '24hr Turnaround', desc: 'Get matched with perfect options within 24 hours of submission.' },
              { icon: Shield, title: 'Trusted Dealers', desc: 'Only vetted, reputable dealerships in our network.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-brand-500" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand-500 uppercase text-sm font-semibold tracking-widest mb-3">Process</p>
            <h2 className="text-4xl font-bold text-gray-900">How It Works for Buyers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Submit Form', desc: 'Tell us what car you want, your budget and employment status.' },
              { step: '2', title: 'Agent Contact', desc: 'A Drive Agent calls you within 24 hours to discuss your needs.' },
              { step: '3', title: 'Get Matches', desc: 'We present you with curated vehicle options from partner dealers.' },
              { step: '4', title: 'Drive Away', desc: 'Your agent handles all paperwork. You just sign and drive.' },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="w-14 h-14 bg-brand-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                {i < 3 && <div className="hidden md:block absolute top-7 left-[57%] w-[46%] h-0.5 bg-brand-100"></div>}
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Lead Form */}
      <section id="lead-form" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="text-brand-500 uppercase text-sm font-semibold tracking-widest mb-3">Free Service</p>
              <h2 className="text-3xl font-bold mb-2 text-gray-900">Find My Perfect Car</h2>
              <p className="text-gray-500 mb-8">Fill in the form and a Drive Agent will contact you within 24 hours.</p>
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
                <div>
                  <label className="label">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="label">Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="input-field" placeholder="+27 123 456 7890" />
                </div>
                <div>
                  <label className="label">What type of car are you looking for? *</label>
                  <select name="car_type" value={formData.car_type} onChange={handleChange} required className="input-field">
                    <option value="">Select car type</option>
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
                  <select name="employment_status" value={formData.employment_status} onChange={handleChange} required className="input-field">
                    <option value="">Select employment status</option>
                    <option value="employed">Employed (Permanent)</option>
                    <option value="employed_contract">Employed (Contract)</option>
                    <option value="self_employed">Self-Employed</option>
                    <option value="retired">Retired</option>
                    <option value="student">Student</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" name="popia_consent" checked={formData.popia_consent} onChange={handleChange} className="mt-1 accent-brand-500" id="popia" />
                  <label htmlFor="popia" className="text-sm text-gray-500">
                    I consent to Drive Agency processing my personal information in accordance with the POPIA. *
                  </label>
                </div>
                {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
                <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
                  {loading ? 'Submitting...' : <><span>Find My Car</span><ArrowRight size={18} /></>}
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-8 text-gray-900">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default Buyers;
