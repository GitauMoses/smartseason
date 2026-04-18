import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiError } from '../../api/client.js';
import ErrorMessage from '../../components/ErrorMessage.jsx';

export default function Login() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard'} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const signedIn = await signIn(email, password);
      navigate(signedIn.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard', { replace: true });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white text-lg font-bold shadow-sm">
            SS
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Welcome to SmartSeason</h1>
          <p className="mt-1 text-sm text-slate-500">
            Field monitoring for Kenya's progressive farms
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@smartseason.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <ErrorMessage message={error} />
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white/80 p-4 text-xs text-slate-600">
          <p className="mb-2 font-semibold text-slate-700">Demo credentials</p>
          <ul className="space-y-1 font-mono">
            <li>admin@smartseason.com / Admin1234</li>
            <li>aisha@smartseason.com / Agent1234</li>
            <li>brian@smartseason.com / Agent1234</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
