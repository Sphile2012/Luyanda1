import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowRight, Check, MapPin, DollarSign, Clock } from 'lucide-react';

type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  id_number: string;
  motivation: string;
  how_heard: string;
  popia_consent: boolean;
};

const BecomeAgent = () => {
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    province: '',
    id_number: '',
    motivation: '',
    how_heard: '',
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
        .from('applications')
        .insert([formData]);

      if (insertError) throw insertError;

      setSubmitted(true);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        city: '',
        province: '',
        id_number: '',
        motivation: '',
        how_heard: '',
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
            Application Submitted!
          </h2>
          <p className="text-gray-600 mb-8">
            Thank you for applying to become a Drive Agency agent. We'll review your
            application and contact you within 48 hours to discuss next steps.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="w-full px-6 py-3 bg-brand-400 text-white font-semibold rounded-lg hover:bg-brand-500 transition-colors"
          >
            Submit Another Application
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
            Career Opportunity
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            Become a Drive Agent
          </h1>
          <p className="text-xl text-gray-200">
            Join a growing network of agents earning competitive commission across
            South Africa
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Why Join Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-brand-50 rounded-lg p-8 border-l-4 border-brand-400">
              <DollarSign className="w-12 h-12 text-brand-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Competitive Commission
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Earn attractive commission on every deal you close. The more you
                sell, the more you earn. Unlimited earning potential.
              </p>
            </div>

            <div className="bg-brand-50 rounded-lg p-8 border-l-4 border-brand-400">
              <Clock className="w-12 h-12 text-brand-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Flexible Work
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Work remote or in one of our offices. Set your own schedule and
                work-life balance that suits you.
              </p>
            </div>

            <div className="bg-brand-50 rounded-lg p-8 border-l-4 border-brand-400">
              <MapPin className="w-12 h-12 text-brand-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Support Network
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Access training, marketing materials, and 24/7 support from our
                dedicated agent success team.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900">
              Apply to Join Us
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
                    placeholder="john@example.com"
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
                  ID Number *
                </label>
                <input
                  type="text"
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                  placeholder="000000 000 00 0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What motivates you to become an agent? *
                </label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                  placeholder="Tell us why you want to join our team..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  How did you hear about Drive Agency? *
                </label>
                <select
                  name="how_heard"
                  value={formData.how_heard}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                >
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
                {loading ? 'Submitting...' : 'Submit Application'}
                {!loading && <ArrowRight size={20} />}
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900">
              Agent Requirements
            </h2>
            <div className="space-y-6 mb-12">
              <div className="flex gap-4">
                <Check className="w-6 h-6 text-brand-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    South African Citizen
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Valid SA ID required for compliance.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="w-6 h-6 text-brand-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    18+ Years Old
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Minimum age requirement for employment.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="w-6 h-6 text-brand-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Good Communication Skills
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Fluent in English, other languages a plus.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check className="w-6 h-6 text-brand-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Basic Technology Skills
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Comfortable using computers and CRM software.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-navy-50 rounded-lg border border-navy-100">
              <h3 className="font-bold text-gray-900 mb-4">What Happens Next</h3>
              <ol className="space-y-4 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="font-bold text-brand-400 flex-shrink-0">
                    1
                  </span>
                  <span>Application review (48 hours)</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-brand-400 flex-shrink-0">
                    2
                  </span>
                  <span>Phone interview with hiring manager</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-brand-400 flex-shrink-0">
                    3
                  </span>
                  <span>Skills assessment</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-brand-400 flex-shrink-0">
                    4
                  </span>
                  <span>Final interview and offer</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-brand-400 flex-shrink-0">
                    5
                  </span>
                  <span>Onboarding and training</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BecomeAgent;
