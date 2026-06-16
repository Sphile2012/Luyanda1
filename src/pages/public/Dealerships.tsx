import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowRight, Check, TrendingUp, Users, Zap } from 'lucide-react';

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.popia_consent) {
        throw new Error('Please consent to the POPIA policy');
      }

      const { error: insertError } = await supabase
        .from('dealer_enquiries')
        .insert([formData]);

      if (insertError) throw insertError;

      setSubmitted(true);
      setFormData({
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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Thank You!
          </h2>
          <p className="text-gray-600 mb-8">
            We've received your partnership inquiry. Our team will review your
            dealership details and contact you within 24 hours to discuss how we
            can grow your business together.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="w-full px-6 py-3 bg-brand-400 text-white font-semibold rounded-lg hover:bg-brand-500 transition-colors"
          >
            Submit Another Inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        className="relative py-20 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/3808517/pexels-photo-3808517.jpeg?auto=compress&cs=tinysrgb&w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <p className="text-brand-300 uppercase text-sm font-semibold tracking-widest mb-4">
            For Dealerships
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            Grow Your Sales
          </h1>
          <p className="text-xl text-gray-200">
            Partner with South Africa's leading car finance matchmaking platform
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Why Partner With Drive Agency
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-brand-50 rounded-lg p-8 border-l-4 border-brand-400">
              <TrendingUp className="w-12 h-12 text-brand-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Increase Sales
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Access a steady stream of pre-qualified buyers actively looking for
                vehicles. Boost your monthly sales figures without expensive
                advertising.
              </p>
            </div>

            <div className="bg-brand-50 rounded-lg p-8 border-l-4 border-brand-400">
              <Users className="w-12 h-12 text-brand-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Qualified Leads
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our buyers are serious and ready to purchase. You'll spend less
                time on follow-ups and more time closing deals.
              </p>
            </div>

            <div className="bg-brand-50 rounded-lg p-8 border-l-4 border-brand-400">
              <Zap className="w-12 h-12 text-brand-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Easy Integration
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Simple onboarding process. Upload your inventory, and we'll start
                sending you matched buyers within days.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900">
              Partnership Inquiry
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dealership Name *
                </label>
                <input
                  type="text"
                  name="dealership_name"
                  value={formData.dealership_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                  placeholder="Your Dealership Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role/Title *
                  </label>
                  <input
                    type="text"
                    name="role_title"
                    value={formData.role_title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                    placeholder="Manager"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                    placeholder="john@dealership.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                    placeholder="+27 123 456 7890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                    placeholder="Johannesburg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Province *
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                  >
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vehicle Types You Stock *
                </label>
                <input
                  type="text"
                  name="vehicle_types"
                  value={formData.vehicle_types}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                  placeholder="e.g., Sedans, SUVs, Trucks"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brands You Stock *
                </label>
                <input
                  type="text"
                  name="brands_stocked"
                  value={formData.brands_stocked}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                  placeholder="e.g., Toyota, Ford, BMW"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                  placeholder="Tell us more about your dealership..."
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="popia_consent"
                  checked={formData.popia_consent}
                  onChange={handleChange}
                  className="mt-1"
                  id="popia"
                />
                <label htmlFor="popia" className="text-sm text-gray-600">
                  I consent to Drive Agency using my personal information in
                  accordance with POPIA. *
                </label>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-brand-400 text-white font-semibold rounded-lg hover:bg-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting...' : 'Send Partnership Inquiry'}
                {!loading && <ArrowRight size={20} />}
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900">
              How It Works
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-brand-400 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Submit Your Details
                  </h3>
                  <p className="text-gray-600">
                    Tell us about your dealership, inventory, and sales goals.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-brand-400 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    We Review & Verify
                  </h3>
                  <p className="text-gray-600">
                    Our team verifies your dealership and reviews your inventory.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-brand-400 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Start Receiving Leads
                  </h3>
                  <p className="text-gray-600">
                    Get matched with qualified buyers ready to purchase.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-brand-400 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Close & Grow
                  </h3>
                  <p className="text-gray-600">
                    Close deals and grow your business with consistent leads.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-8 bg-navy-50 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-4">Partnership Benefits</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-brand-400 flex-shrink-0" />
                  <span>Consistent stream of qualified buyers</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-brand-400 flex-shrink-0" />
                  <span>No upfront fees</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-brand-400 flex-shrink-0" />
                  <span>Marketing support</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-brand-400 flex-shrink-0" />
                  <span>Dedicated account manager</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dealerships;
