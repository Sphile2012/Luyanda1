import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowRight, Check } from 'lucide-react';

type FormData = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  car_type: string;
  employment_status: string;
  popia_consent: boolean;
};

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
        .from('buyer_leads')
        .insert([formData]);

      if (insertError) throw insertError;

      setSubmitted(true);
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        car_type: '',
        employment_status: '',
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
            You're All Set!
          </h2>
          <p className="text-gray-600 mb-8">
            Thank you for submitting your details. Our team will review your
            information and match you with the perfect car within 24 hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="w-full px-6 py-3 bg-brand-400 text-white font-semibold rounded-lg hover:bg-brand-500 transition-colors"
          >
            Submit Another Lead
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
            'url(https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <p className="text-brand-300 uppercase text-sm font-semibold tracking-widest mb-4">
            For Buyers
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            Find Your Perfect Car
          </h1>
          <p className="text-xl text-gray-200">
            100% free, with personalized matches from trusted dealerships
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900">
              Tell Us About Your Perfect Car
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>

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
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What type of car are you looking for? *
                </label>
                <select
                  name="car_type"
                  value={formData.car_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                >
                  <option value="">Select car type</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV/Crossover</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="convertible">Convertible</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Employment Status *
                </label>
                <select
                  name="employment_status"
                  value={formData.employment_status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                >
                  <option value="">Select employment status</option>
                  <option value="employed">Employed</option>
                  <option value="self_employed">Self-Employed</option>
                  <option value="retired">Retired</option>
                  <option value="student">Student</option>
                  <option value="other">Other</option>
                </select>
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
                {loading ? 'Submitting...' : 'Find My Car'}
                {!loading && <ArrowRight size={20} />}
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Why Buy With Us</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-brand-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">100% Free</h3>
                  <p className="text-gray-600">
                    No hidden fees, no cost to you. We make money when dealerships
                    sell, not from buyers.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-brand-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Personalized Matches
                  </h3>
                  <p className="text-gray-600">
                    We use your preferences and budget to find cars perfect for you.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-brand-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Expert Guidance
                  </h3>
                  <p className="text-gray-600">
                    Our agents guide you through the entire financing and purchase
                    process.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-brand-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Trusted Dealerships
                  </h3>
                  <p className="text-gray-600">
                    We only partner with vetted, reputable dealerships across South
                    Africa.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-8 bg-brand-50 rounded-lg border border-brand-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <p className="font-semibold text-gray-900 mb-2">
                    How long does the process take?
                  </p>
                  <p>Most buyers get matched and approved within 24-48 hours.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-2">
                    What if I have bad credit?
                  </p>
                  <p>
                    We work with dealerships that specialize in various credit
                    profiles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Buyers;
