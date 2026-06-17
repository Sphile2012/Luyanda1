import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, LogIn, UserPlus, Shield, User, LogOut, ShieldCheck } from 'lucide-react';

type LoginTab = 'agent' | 'management';
type AuthMode = 'signin' | 'signup';

const SECURITY_QUESTIONS = [
  'What was the name of your first pet?',
  'What city were you born in?',
  'What was the name of your primary school?',
  "What is your mother's maiden name?",
  'What was the name of your childhood best friend?',
  'What was the make of your first car?',
  'What is the name of the street you grew up on?',
  'What was the name of your favourite childhood teacher?',
  'What is the name of the town where your parents met?',
  'What was your childhood nickname?',
];

async function hashAnswer(answer: string): Promise<string> {
  const data = new TextEncoder().encode(answer.toLowerCase().trim());
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const PortalEntry = () => {
  const [loginTab, setLoginTab] = useState<LoginTab>('agent');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Security questions
  const [secQ1, setSecQ1] = useState('');
  const [secA1, setSecA1] = useState('');
  const [secQ2, setSecQ2] = useState('');
  const [secA2, setSecA2] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { user, profile, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user || !profile) return;
    if (profile.role === 'management' || profile.role === 'admin') {
      navigate('/management-dashboard', { replace: true });
    } else if (profile.role === 'remote_agent' || profile.role === 'inoffice_agent') {
      navigate('/agent-dashboard', { replace: true });
    }
  }, [user, profile, authLoading, navigate]);

  const resetFields = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setSecQ1('');
    setSecA1('');
    setSecQ2('');
    setSecA2('');
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

    let data: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>['data'] | null = null;
    try {
      const res = await supabase.auth.signInWithPassword({ email, password });
      if (res.error) {
        setError(res.error.message === 'Failed to fetch'
          ? 'Cannot connect to the server. Please try again shortly.'
          : 'Invalid email or password. Please try again.');
        setLoading(false);
        return;
      }
      data = res.data;
    } catch {
      setError('Cannot connect to the server. Please try again shortly.');
      setLoading(false);
      return;
    }

    if (!data?.user) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }

    const signedInUser = data.user;

    const fetchRole = async () => {
      const { data: p, error: pErr } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', signedInUser.id)
        .maybeSingle();
      return { role: p?.role ?? null, status: p?.status ?? null, error: pErr };
    };

    let { role, status, error: profileError } = await fetchRole();

    if (!role && !profileError) {
      await new Promise(res => setTimeout(res, 1200));
      ({ role, status, error: profileError } = await fetchRole());
    }

    setLoading(false);

    if (profileError) {
      setError(`Sign-in error: ${profileError.message}`);
      return;
    }

    if (role === 'management' || role === 'admin') {
      navigate('/management-dashboard');
    } else if ((role === 'remote_agent' || role === 'inoffice_agent') && status === 'active') {
      navigate('/agent-dashboard');
    } else if ((role === 'remote_agent' || role === 'inoffice_agent') && status !== 'active') {
      await supabase.auth.signOut();
      setError('Your account has been suspended. Please contact management.');
    } else {
      await supabase.auth.signOut();
      setError('Your account is pending approval by management. You will be notified once activated.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (!secQ1) { setError('Please select your first security question.'); return; }
    if (!secA1.trim()) { setError('Please provide an answer to your first security question.'); return; }
    if (!secQ2) { setError('Please select your second security question.'); return; }
    if (!secA2.trim()) { setError('Please provide an answer to your second security question.'); return; }
    if (secQ1 === secQ2) { setError('Please choose two different security questions.'); return; }

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

      // Save security questions (hashed answers)
      try {
        const [hash1, hash2] = await Promise.all([hashAnswer(secA1), hashAnswer(secA2)]);
        await supabase.from('security_questions').insert({
          user_id: data.user.id,
          question_1: secQ1,
          answer_1_hash: hash1,
          question_2: secQ2,
          answer_2_hash: hash2,
        });
      } catch {
        // Non-fatal: security questions save failed, sign-in will still work
      }

      setLoading(false);
      setSuccess('Account created! Your application is pending review. Management will notify you once approved.');
      resetFields();
      setAuthMode('signin');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      setError(msg === 'Failed to fetch'
        ? 'Cannot connect to the server. Please try again shortly.'
        : 'Signup error: ' + msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Pending account banner */}
        {user && profile?.role === 'pending' && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-yellow-800">Signed in as {profile.full_name}</p>
              <p className="text-xs text-yellow-600">Account pending approval by management.</p>
            </div>
            <button
              onClick={async () => { await signOut(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        )}

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src="/icons/WhatsApp_Image_2026-06-13_at_15.08.17.jpeg" alt="Drive Agency" className="h-14 w-14 rounded-2xl object-cover shadow-md" />
            <span className="text-2xl font-bold text-navy-500 tracking-tight">Drive Agency</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Portal</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {authMode === 'signin' ? 'Sign in to access your dashboard' : 'Create your agent account'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => switchMode('signin')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${authMode === 'signin' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${authMode === 'signup' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <UserPlus className="w-4 h-4" /> Sign Up
            </button>
          </div>

          <div className="p-6">
            {/* Sign in sub-tabs */}
            {authMode === 'signin' && (
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => setLoginTab('agent')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${loginTab === 'agent' ? 'bg-brand-50 text-brand-600 border border-brand-200' : 'text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
                >
                  <User className="w-4 h-4" /> Agent
                </button>
                <button
                  onClick={() => setLoginTab('management')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${loginTab === 'management' ? 'bg-brand-50 text-brand-600 border border-brand-200' : 'text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
                >
                  <Shield className="w-4 h-4" /> Management
                </button>
              </div>
            )}

            {authMode === 'signup' && (
              <div className="mb-5 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
                New agent accounts are reviewed by management before activation. You'll be notified by email.
              </div>
            )}

            {success && (
              <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>
            )}

            {/* SIGN IN FORM */}
            {authMode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="Enter your email" required />
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
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">{error}</div>}
                <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
                  {loading ? 'Signing in…' : <><LogIn className="w-4 h-4" /> Sign In</>}
                </button>
                <div className="text-center">
                  <button type="button" onClick={() => navigate('/reset-password')} className="text-sm text-brand-500 hover:text-brand-600">
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
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" placeholder="Your full name" required />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="your@email.com" required />
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-10" placeholder="Min 8 characters" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field pr-10" placeholder="Repeat password" required />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Security questions section */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-brand-500" />
                    <p className="text-sm font-semibold text-gray-700">Account Recovery Questions</p>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">These are used to recover your account if you forget your password.</p>

                  <div className="space-y-3">
                    <div>
                      <label className="label">Security Question 1</label>
                      <select value={secQ1} onChange={(e) => setSecQ1(e.target.value)} className="input-field" required>
                        <option value="">Select a question…</option>
                        {SECURITY_QUESTIONS.filter(q => q !== secQ2).map(q => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Your Answer</label>
                      <input type="text" value={secA1} onChange={(e) => setSecA1(e.target.value)} className="input-field" placeholder="Your answer (not case-sensitive)" required />
                    </div>

                    <div className="pt-1">
                      <label className="label">Security Question 2</label>
                      <select value={secQ2} onChange={(e) => setSecQ2(e.target.value)} className="input-field" required>
                        <option value="">Select a different question…</option>
                        {SECURITY_QUESTIONS.filter(q => q !== secQ1).map(q => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Your Answer</label>
                      <input type="text" value={secA2} onChange={(e) => setSecA2(e.target.value)} className="input-field" placeholder="Your answer (not case-sensitive)" required />
                    </div>
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
