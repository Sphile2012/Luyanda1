import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, supabaseUrl, supabaseAnonKey } from '../../lib/supabase';
import { Car, Mail, ArrowLeft, ShieldCheck, Eye, EyeOff, CheckCircle, KeyRound } from 'lucide-react';

type Step = 'request' | 'security_questions' | 'set_password' | 'email_sent' | 'success';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('request');
  const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'security'>('email');

  // Step 1 — request
  const [email, setEmail] = useState('');

  // Step 2 — security questions
  const [secQ1, setSecQ1] = useState('');
  const [secQ2, setSecQ2] = useState('');
  const [secA1, setSecA1] = useState('');
  const [secA2, setSecA2] = useState('');

  // Step 2/3 — new password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect recovery token from email link (Supabase appends #type=recovery&access_token=...)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setStep('set_password');
    }
  }, []);

  // Step 1a — Send email reset link
  const handleEmailReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setStep('email_sent');
  };

  // Step 1b — Fetch security questions for email
  const handleFetchQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error: err } = await supabase.rpc('get_security_questions_for_email', { p_email: email.trim() });
    setLoading(false);
    if (err || !data?.length) {
      setError('No security questions found for that email. Try the email reset option instead.');
      return;
    }
    setSecQ1(data[0].question_1);
    setSecQ2(data[0].question_2);
    setStep('security_questions');
  };

  // Step 2 — Verify security answers + set new password via edge function
  const handleSecurityReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/recover-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ email: email.trim(), answer_1: secA1, answer_2: secA2, new_password: newPassword }),
      });
      const result = await res.json();
      setLoading(false);
      if (!res.ok) { setError(result.error || 'Verification failed. Please check your answers.'); return; }
      setStep('success');
    } catch {
      setLoading(false);
      setError('Could not connect to the server. Please try again.');
    }
  };

  // Set new password after email recovery link
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setStep('success');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Car className="w-10 h-10 text-brand-500" />
            <span className="text-2xl font-bold text-navy-500">Drive Agency</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">

          {/* ── Email sent ── */}
          {step === 'email_sent' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-600 mb-6">We sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.</p>
              <Link to="/portal" className="btn-secondary w-full inline-flex justify-center">Back to Login</Link>
            </div>
          )}

          {/* ── Success ── */}
          {step === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Password Updated</h2>
              <p className="text-gray-600 mb-6">Your password has been reset successfully. You can now sign in with your new password.</p>
              <button onClick={() => navigate('/portal')} className="btn-primary w-full">Go to Login</button>
            </div>
          )}

          {/* ── Set password (from email link) ── */}
          {step === 'set_password' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Set New Password</h2>
                  <p className="text-sm text-gray-500">Choose a strong password for your account</p>
                </div>
              </div>
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field pr-10" placeholder="Min 8 characters" required />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field pr-10" placeholder="Repeat password" required />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
                <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
                  {loading ? 'Updating…' : 'Set New Password'}
                </button>
              </form>
            </>
          )}

          {/* ── Request step ── */}
          {step === 'request' && (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">Reset Your Password</h2>
              <p className="text-gray-500 text-sm text-center mb-6">Choose how you'd like to recover your account</p>

              {/* Method selector */}
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => { setRecoveryMethod('email'); setError(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium border transition-colors ${recoveryMethod === 'email' ? 'bg-brand-50 border-brand-300 text-brand-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  <Mail className="w-4 h-4" /> Email Reset
                </button>
                <button
                  type="button"
                  onClick={() => { setRecoveryMethod('security'); setError(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium border transition-colors ${recoveryMethod === 'security' ? 'bg-brand-50 border-brand-300 text-brand-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  <ShieldCheck className="w-4 h-4" /> Security Questions
                </button>
              </div>

              {recoveryMethod === 'email' ? (
                <form onSubmit={handleEmailReset} className="space-y-4">
                  <p className="text-sm text-gray-600">Enter your email and we'll send you a reset link.</p>
                  <div>
                    <label className="label">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="Enter your email" required />
                  </div>
                  {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
                  <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleFetchQuestions} className="space-y-4">
                  <p className="text-sm text-gray-600">Enter your email to retrieve your security questions.</p>
                  <div>
                    <label className="label">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="Enter your email" required />
                  </div>
                  {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
                  <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
                    {loading ? 'Looking up…' : 'Continue'}
                  </button>
                </form>
              )}

              <Link to="/portal" className="flex items-center justify-center gap-2 mt-6 text-brand-500 hover:text-brand-600 text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </>
          )}

          {/* ── Security questions step ── */}
          {step === 'security_questions' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Verify Your Identity</h2>
                  <p className="text-sm text-gray-500">Answer your security questions to reset your password</p>
                </div>
              </div>

              <form onSubmit={handleSecurityReset} className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Question 1</p>
                  <p className="text-sm font-medium text-gray-800">{secQ1}</p>
                </div>
                <div>
                  <label className="label">Your Answer</label>
                  <input type="text" value={secA1} onChange={(e) => setSecA1(e.target.value)} className="input-field" placeholder="Not case-sensitive" required />
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Question 2</p>
                  <p className="text-sm font-medium text-gray-800">{secQ2}</p>
                </div>
                <div>
                  <label className="label">Your Answer</label>
                  <input type="text" value={secA2} onChange={(e) => setSecA2(e.target.value)} className="input-field" placeholder="Not case-sensitive" required />
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Set New Password</p>
                  <div className="space-y-3">
                    <div>
                      <label className="label">New Password</label>
                      <div className="relative">
                        <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field pr-10" placeholder="Min 8 characters" required />
                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="label">Confirm New Password</label>
                      <div className="relative">
                        <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field pr-10" placeholder="Repeat password" required />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
                <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
                  {loading ? 'Verifying…' : 'Verify & Reset Password'}
                </button>
                <button type="button" onClick={() => { setStep('request'); setError(null); }} className="w-full text-sm text-gray-500 hover:text-gray-700">
                  ← Try a different method
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
