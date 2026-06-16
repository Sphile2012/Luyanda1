import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowRight, Check, TrendingUp, Users, Zap, Star } from 'lucide-react';

type FormData = {
  dealership_name: string;
  contact_person: string;
  role_title: string;
  phone: string;
  email: string;
  city: string;
  province: string;
  vehicle_types: string;
  brands_stocked: string;
  message: string;
  popia_consent: boolean;
};

const testimonials = [
  {
    text: "Since partnering with Drive Agency, our monthly sales have increased by 40%. The leads are serious buyers ready to purchase.",
    author: "Deon Pretorius",
    role: "GM, Pretorius Motors — Johannesburg",
    rating: 5,
  },
  {
    text: "The quality of buyers coming through Drive Agency is exceptional. Less time wasted, more deals closed. Highly recommend.",
    author: "Naledi Sithole",
    role: "Sales Manager, Cape Motors — Cape Town",
    rating: 5,
  },
  {
    text: "Onboarding was simple and we started receiving quality leads within a week. Drive Agency is a game changer for our dealership.",
    author: "Kobus van Zyl",
    role: "Owner, Van Zyl Autos — Durban",
    rating: 5,
  },
];

const Dealerships = () => {
  const [formData, setFormData] = useState<FormData>({
    dealership_name: '',
    contact_person: '',
    role_title: '',
    phone: '',
    email: '',
    city: '',
    province: '',
    vehicle_types: '',
    brands_stocked: '',
    message: '',
    popia_consent: false,
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [activeTestimonial, setActiveTestimonial] = useState(0);

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
      const { error: insertError } = await supabase.from('dealer_enquiries').insert([formData]);
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-gray-500 mb-8">
            We've received your partnership inquiry. Our team will contact you within 24 hours to discuss how we can grow your business together.
          </p>
          <button onClick={() => setSubmitted(false)} className="w-full btn-primary">
            Submit Another Inquiry
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
        style={{ backgroundImage: 'url(https://images.pexels.com/photos/1595838/pexels-photo-1595838.jpeg?auto=compress&cs=tinysrgb&w=1920)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-400 uppercase text-sm font-semibold tracking-widest mb-4">For Dealerships</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight max-w-2xl">
            Grow Your Sales Pipeline
          </h1>
          <p className="text-xl text-gray-200 max-w-xl mb-8">
            Partner with South Africa's leading car matchmaking platform and receive a steady stream of qualified buyers.
          </p>
          <a
            href="#enquiry-form"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 text-white font-semibold rounded-full hover:bg-brand-600 transition-colors"
          >
            Partner With Us <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand-500 uppercase text-sm font-semibold tracking-widest mb-3">Why Partner</p>
            <h2 className="text-4xl font-bold text-gray-900">Why Partner With Drive Agency</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: TrendingUp, title: 'Increase Sales', desc: 'Access a steady stream of pre-qualified buyers actively looking for vehicles. Boost your monthly sales without expensive advertising.' },
              { icon: Users, title: 'Qualified Leads', desc: 'Our buyers are serious and pre-screened. You spend less time on tyre-kickers and more time closing deals.' },
              { icon: Zap, title: 'Easy Integration', desc: 'Simple onboarding process. Our team will set you up and start sending matched buyers within days.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border-t-4 border-brand-500">
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

      {/* Stats */}
      <section className="py-16 bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '50+', label: 'Partner Dealerships' },
              { value: '350+', label: 'Deals Facilitated' },
              { value: '68%', label: 'Average Conversion Rate' },
              { value: '24hrs', label: 'Average Lead Delivery' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-4xl font-bold text-brand-400 mb-2">{stat.value}</p>
                <p className="text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry Form */}
      <section id="enquiry-form" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="text-brand-500 uppercase text-sm font-semibold tracking-widest mb-3">Get Started</p>
              <h2 className="text-3xl font-bold mb-2 text-gray-900">Partnership Enquiry</h2>
              <p className="text-gray-500 mb-8">Tell us about your dealership and we'll be in touch within 24 hours.</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">Dealership Name *</label>
                  <input type="text" name="dealership_name" value={formData.dealership_name} onChange={handleChange} required className="input-field" placeholder="Your Dealership Name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Contact Person *</label>
                    <input type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} required className="input-field" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="label">Role / Title *</label>
                    <input type="text" name="role_title" value={formData.role_title} onChange={handleChange} required className="input-field" placeholder="Sales Manager" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" placeholder="john@dealer.com" />
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
                  <label className="label">Vehicle Types You Stock *</label>
                  <input type="text" name="vehicle_types" value={formData.vehicle_types} onChange={handleChange} required className="input-field" placeholder="e.g., Sedans, SUVs, Bakkies" />
                </div>
                <div>
                  <label className="label">Brands You Stock *</label>
                  <input type="text" name="brands_stocked" value={formData.brands_stocked} onChange={handleChange} required className="input-field" placeholder="e.g., Toyota, Ford, BMW" />
                </div>
                <div>
                  <label className="label">Additional Message</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} rows={3} className="input-field" placeholder="Tell us more about your dealership..." />
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" name="popia_consent" checked={formData.popia_consent} onChange={handleChange} className="mt-1 accent-brand-500" id="popia" />
                  <label htmlFor="popia" className="text-sm text-gray-500">
                    I consent to Drive Agency processing my information in accordance with POPIA. *
                  </label>
                </div>
                {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
                <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
                  {loading ? 'Submitting...' : <><span>Send Partnership Enquiry</span><ArrowRight size={18} /></>}
                </button>
              </form>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-900">How It Works for Dealerships</h2>
                <div className="space-y-5">
                  {[
                    { step: '1', title: 'Submit Your Details', desc: 'Tell us about your dealership, inventory, and sales goals.' },
                    { step: '2', title: 'We Review & Verify', desc: 'Our team verifies your dealership and reviews your inventory profile.' },
                    { step: '3', title: 'Start Receiving Leads', desc: 'Get matched with qualified buyers who are ready to purchase.' },
                    { step: '4', title: 'Close & Grow', desc: 'Close deals and scale your business with a consistent pipeline.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 bg-brand-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-gray-500 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Partnership Benefits</h3>
                <ul className="space-y-3">
                  {[
                    'Consistent qualified buyer stream',
                    'No upfront fees — commission only',
                    'Marketing and promotional support',
                    'Dedicated account manager',
                    'Performance analytics dashboard',
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                      <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand-500 uppercase text-sm font-semibold tracking-widest mb-3">Partner Stories</p>
            <h2 className="text-4xl font-bold text-gray-900">What Our Partners Say</h2>
          </div>
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
            <div className="flex justify-center gap-1 mb-5">
              {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-xl text-gray-700 italic leading-relaxed mb-6">
              "{testimonials[activeTestimonial].text}"
            </p>
            <p className="font-bold text-gray-900">{testimonials[activeTestimonial].author}</p>
            <p className="text-gray-500 text-sm">{testimonials[activeTestimonial].role}</p>
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'bg-brand-500 w-8' : 'bg-gray-300 w-2'}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dealerships;
