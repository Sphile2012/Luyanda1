import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, LogIn, UserPlus, Shield, User } from 'lucide-react';

type LoginTab = 'agent' | 'management';
type AuthMode = 'signin' | 'signup';

const PortalEntry = () => {
  const [loginTab, setLoginTab] = useState<LoginTab>('agent');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const resetFields = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setError(null);
    setSuccess(null);
  };

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    resetFields();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.user) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }

    // Fetch role — retry once in case of brief timing delay
    const fetchRole = async () => {
      const { data: p, error: pErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();
      return { role: p?.role ?? null, error: pErr };
    };

    let { role, error: profileError } = await fetchRole();

    if (!role && !profileError) {
      // Profile not ready yet — wait briefly and retry
      await new Promise(res => setTimeout(res, 1200));
      ({ role, error: profileError } = await fetchRole());
    }

    setLoading(false);

    if (role === 'management' || role === 'admin') {
      navigate('/management-dashboard');
    } else if (role === 'remote_agent' || role === 'inoffice_agent') {
      navigate('/agent-dashboard');
    } else if (profileError) {
      setError(`Sign-in error: ${profileError.message}`);
    } else {
      await supabase.auth.signOut();
      setError('Your account is pending approval by management. You will be notified once activated.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName.trim() } },
      });

      if (signUpError) {
        setError(signUpError.message || JSON.stringify(signUpError));
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError('Could not create account. Please try again.');
        setLoading(false);
        return;
      }

      setLoading(false);
      setSuccess('Account created! Your application is pending review. You will be notified once approved.');
      resetFields();
      setAuthMode('signin');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      setError('Signup error: ' + msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img
              src="/image.png"
              alt="Drive Agency"
              className="h-14 w-14 rounded-2xl object-cover shadow-md"
            />
            <span className="text-2xl font-bold text-navy-500 tracking-tight">Drive Agency</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Portal</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {authMode === 'signin' ? 'Sign in to access your dashboard' : 'Create your agent account'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Auth mode tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => switchMode('signin')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
                authMode === 'signin' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
                authMode === 'signup' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </button>
          </div>

          <div className="p-6">
            {/* Sign In: agent / management sub-tabs */}
            {authMode === 'signin' && (
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => setLoginTab('agent')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    loginTab === 'agent'
                      ? 'bg-brand-50 text-brand-600 border border-brand-200'
                      : 'text-gray-500 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Agent
                </button>
                <button
                  onClick={() => setLoginTab('management')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    loginTab === 'management'
                      ? 'bg-brand-50 text-brand-600 border border-brand-200'
                      : 'text-gray-500 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Management
                </button>
              </div>
            )}

            {/* Sign Up note */}
            {authMode === 'signup' && (
              <div className="mb-5 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
                New agent accounts are reviewed by management before activation. You'll be notified by email.
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                {success}
              </div>
            )}

            {/* SIGN IN FORM */}
            {authMode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
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
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">{error}</div>}
                <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
                  {loading ? 'Signing in…' : <><LogIn className="w-4 h-4" /> Sign In</>}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/reset-password')}
                    className="text-sm text-brand-500 hover:text-brand-600"
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>
            )}

            {/* SIGN UP FORM */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pr-10"
                      placeholder="Min 8 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field pr-10"
                      placeholder="Repeat password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">{error}</div>}
                <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
                  {loading ? 'Creating account…' : <><UserPlus className="w-4 h-4" /> Create Account</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalEntry;
