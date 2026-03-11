import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// ========================================
// Login Page — Task 2.3
// Email + Password auth via Supabase
// ========================================

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Translate common errors to Romanian
      if (error.message.includes('Invalid login credentials')) {
        setError('Email sau parolă greșită.');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Contul nu a fost confirmat. Verifică email-ul.');
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    // Success → navigate to home
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo & Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary">🎵 MeelMusic</h1>
          <p className="mt-2 text-text-secondary">Muzica voastră, împreună.</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="rounded-2xl bg-bg-card p-6 shadow-xl"
        >
          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-text-secondary"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full rounded-lg border border-white/10 bg-bg-surface px-4 py-2.5 text-text-primary placeholder-text-secondary/50 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-text-secondary"
            >
              Parolă
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-white/10 bg-bg-surface px-4 py-2.5 text-text-primary placeholder-text-secondary/50 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Se conectează...' : 'Intră în cont'}
          </button>
        </form>
      </div>
    </div>
  );
}
