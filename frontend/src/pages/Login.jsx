import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';

export default function Login() {
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (currentUser) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = login(email, password);
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  const roleStyles = {
    clinician:       'bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200',
    admin:           'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
    records_officer: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
    billing:         'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200',
  };
  const roleLabels = {
    clinician: 'Clinician', admin: 'Admin',
    records_officer: 'Records Officer', billing: 'Billing',
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 mb-4">
            <Activity className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">NephroTrack</h1>
          <p className="text-brand-300 mt-1 text-sm">Kidney Disease Prediction Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-6">Sign in to your account to continue</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input-field" placeholder="you@nephrotrack.ng" required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-10" placeholder="Enter your password" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo quick-access   /* This section is for demonstration purposes only and would be removed before deployment. */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center mb-3 font-medium">Quick demo access</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map(({ role, email: demoEmail }) => (
                <button key={role} onClick={() => fillDemo(demoEmail)}
                  className={`text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${roleStyles[role]}`}>
                  {roleLabels[role]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-brand-400 text-xs mt-6">
          For clinical decision support only — not a diagnostic tool
        </p>
      </div>
    </div>
  );
}
