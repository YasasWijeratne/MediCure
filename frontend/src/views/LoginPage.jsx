import React, { useState } from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';

export default function LoginPage({ onBackToLanding, onGoToAdminLogin }) {
  const { login } = useAuth();
  const staffRoles = ROLES.filter(r => r !== 'Administrator');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('Doctor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password, selectedRole);
    setLoading(false);
    if (!result.success) {
      setError(result.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8 relative">
      {/* Back to landing button */}
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-lowest text-primary font-semibold text-sm border border-surface-container hover:bg-surface-container-low shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Public Website</span>
        </button>
      )}

      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-surface-container shadow-md p-8">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-3 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[32px]">health_and_safety</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight font-headline-sm">MediCure</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-bold">HMS</span>
          </div>
          <p className="text-outline text-xs">
            Hospital Management System • Clinical Staff Portal
          </p>
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
              Staff Email Address
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">mail</span>
              <input
                type="email"
                className="w-full pl-10 pr-3 py-2.5 bg-surface-container-low rounded-lg text-sm text-on-surface border border-surface-container focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. dr.sarah@medicure.org"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
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

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Clinical Role Context
            </label>
            <select
              className="w-full px-3 py-2.5 bg-surface-container-low rounded-lg text-sm text-on-surface border border-surface-container focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
            >
              {staffRoles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Clinical Portal'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Dedicated Admin Portal Navigation */}
        {onGoToAdminLogin && (
          <div className="mt-6 pt-5 border-t border-surface-container text-center">
            <p className="text-xs text-outline mb-2">
              System Administrator?
            </p>
            <button
              type="button"
              onClick={onGoToAdminLogin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low text-primary hover:bg-surface-container font-semibold text-xs border border-surface-container transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              <span>Open Restricted Admin Portal</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
