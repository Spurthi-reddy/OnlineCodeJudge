import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, KeyRound, Mail, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Invalid email or password');
    }
  };

  return (
    <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-dark-950">
      <div class="w-full max-w-md space-y-8 glass-panel p-8 rounded-2xl border border-dark-800 shadow-2xl animate-fade-in">
        
        {/* Branding header */}
        <div class="flex flex-col items-center justify-center text-center space-y-2">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/20">
            <Terminal class="h-6 w-6 text-white" />
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
          <p class="text-xs text-slate-400">
            Securely access your coding dashboard and metrics.
          </p>
        </div>

        {/* Error Callout */}
        {error && (
          <div class="rounded-lg border border-red-500/10 bg-red-500/5 p-3.5 flex gap-2 text-xs text-red-400 items-center">
            <AlertCircle class="h-4.5 w-4.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} class="space-y-6">
          <div class="space-y-4">
            
            {/* Email field */}
            <div class="space-y-1">
              <label for="email" class="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div class="relative rounded-lg shadow-sm">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail class="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  class="block w-full rounded-lg bg-dark-900 border border-dark-800 py-2.5 pl-10 pr-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                  placeholder="user@example.com"
                />
              </div>
            </div>

            {/* Password field */}
            <div class="space-y-1">
              <label for="password" class="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <div class="relative rounded-lg shadow-sm">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyRound class="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  class="block w-full rounded-lg bg-dark-900 border border-dark-800 py-2.5 pl-10 pr-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-600/10 hover:shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 class="h-4 w-4 animate-spin" /> Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer actions */}
        <div class="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" class="font-semibold text-brand-400 hover:underline">
            Register for free
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
