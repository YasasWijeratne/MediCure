import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminLoginPage({ onBackToLanding, onGoToStaffLogin }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both administrator email and password.');
      return;
    }

    setLoading(true);

    // Force Administrator role for admin login
    const result = await login(email.trim(), password, 'Administrator');
    setLoading(false);

    if (!result?.success) {
      setError(result?.message || 'Authentication failed. Verify your administrator credentials.');
      return;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8 relative">
      {/* Back button */}
      <button
        onClick={onBackToLanding}
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-lowest text-primary font-semibold text-sm border border-surface-container hover:bg-surface-container-low shadow-xs transition-all cursor-pointer"
        type="button"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        <span>Back</span>
      </button>

      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-surface-container shadow-md p-8">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-3 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight font-headline-sm">Administrator Access</h1>
          </div>
          <p className="text-outline text-xs">
            Restricted portal — MediCure HMS System Administration
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-error-container/30 border border-error/20">
            <span className="material-symbols-outlined text-error text-[16px]">security</span>
            <span className="text-[11px] text-error font-semibold">Administrator credentials required</span>
          </div>
        </div>

        {error && (
          <div className="bg-error-container/30 border border-error/30 text-error px-4 py-3 rounded-lg text-xs mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">mail</span>
              <input
                type="email"
                className="w-full pl-10 pr-3 py-2.5 bg-surface-container-low rounded-lg text-sm text-on-surface border border-surface-container focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">lock</span>
              <input
                type="password"
                className="w-full pl-10 pr-3 py-2.5 bg-surface-container-low rounded-lg text-sm text-on-surface border border-surface-container focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            disabled={loading}
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            {loading ? 'Verifying credentials...' : 'Authenticate as Administrator'}
          </button>
        </form>

        {/* Separator */}
        <div className="mt-4 pt-4 border-t border-surface-container text-center">
          <p className="text-[11px] text-outline">
            Not an administrator?{' '}
            <button
              type="button"
              onClick={onGoToStaffLogin || onBackToLanding}
              className="text-primary font-semibold hover:underline cursor-pointer"
            >
              Go to Staff Portal Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
