import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Car, Eye, EyeOff, LogIn, User, Shield } from 'lucide-react';

const PortalEntry = () => {
  const [activeTab, setActiveTab] = useState<'agent' | 'management'>('agent');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Car className="w-10 h-10 text-brand-500" />
              <span className="text-2xl font-bold text-navy-500">Drive Agency</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Portal</h1>
            <p className="text-gray-600 mt-1">Sign in to access your dashboard</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('agent')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-medium transition-colors ${
                  activeTab === 'agent'
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
                Agent Login
              </button>
              <button
                onClick={() => setActiveTab('management')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-medium transition-colors ${
                  activeTab === 'management'
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Shield className="w-5 h-5" />
                Management Login
              </button>
            </div>

            <div className="p-6">
              <div className={`mb-6 p-4 rounded-lg ${
                activeTab === 'agent' ? 'bg-brand-50' : 'bg-navy-50'
              }`}>
                <p className={`text-sm ${
                  activeTab === 'agent' ? 'text-brand-700' : 'text-navy-700'
                }`}>
                  {activeTab === 'agent'
                    ? 'Remote and in-office agents can access client management and deal tracking.'
                    : 'Management can view all agent activity, manage applications, and access analytics.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="label">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pr-10"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    'Signing in...'
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/reset-password')}
                  className="text-sm text-brand-500 hover:text-brand-600"
                >
                  Forgot your password?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalEntry;
