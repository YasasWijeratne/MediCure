import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ArrowRight, Lock, Mail, User, Calendar, Phone, MapPin } from 'lucide-react';

export default function PatientLoginPage({ onBackToLanding, onGoToStaffLogin }) {
  const { login, patientRegister } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [registerForm, setRegisterForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact: '',
    dob: '1995-05-15',
    gender: 'Male',
    address: '',
    password: '',
    confirm_password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(loginEmail.trim(), loginPassword);
    setLoading(false);

    if (!result.success) {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!registerForm.first_name.trim() || !registerForm.last_name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!registerForm.email.trim() || !registerForm.password) {
      setError('Please provide email and password.');
      return;
    }
    if (registerForm.password !== registerForm.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await patientRegister(registerForm);
    setLoading(false);

    if (!result.success) {
      setError(result.message || 'Registration failed. Please try again.');
    }
  };

  const setDemoPatient = (email) => {
    setLoginEmail(email);
    setLoginPassword('Password123!');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-10 relative selection:bg-primary-container selection:text-on-primary-container">
      {/* Back to landing button */}
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-lowest text-primary font-semibold text-sm border border-surface-container hover:bg-surface-container-low shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>
      )}

      <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl border border-surface-container shadow-lg p-6 sm:p-8">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 bg-primary rounded-2xl flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[32px]">clinical_notes</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight font-headline-sm">MediCure Patient Portal</h1>
          <p className="text-outline text-xs mt-1">
            Access appointments, medical records, prescriptions, lab results & bills
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-surface-container-low rounded-xl mb-6 border border-surface-container">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Patient Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('signup'); setError(''); }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Register / Sign Up
          </button>
        </div>

        {error && (
          <div className="bg-error-container/30 border border-error/30 text-error px-4 py-3 rounded-lg text-xs mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Tab Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Patient Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  type="email"
                  className="w-full pl-10 pr-3 py-2.5 bg-surface-container-low rounded-lg text-sm text-on-surface border border-surface-container focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
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
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  type="password"
                  className="w-full pl-10 pr-3 py-2.5 bg-surface-container-low rounded-lg text-sm text-on-surface border border-surface-container focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Patient Portal'} <ArrowRight size={16} />
            </button>

          </form>
        )}

        {/* Signup Tab Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-sm text-on-surface border border-surface-container focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                  value={registerForm.first_name}
                  onChange={e => setRegisterForm({ ...registerForm, first_name: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-sm text-on-surface border border-surface-container focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                  value={registerForm.last_name}
                  onChange={e => setRegisterForm({ ...registerForm, last_name: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-sm text-on-surface border border-surface-container focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary/20"
                required
                value={registerForm.email}
                onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                placeholder="your.email@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                  Phone Contact
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-sm text-on-surface border border-surface-container focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary/20"
                  value={registerForm.contact}
                  onChange={e => setRegisterForm({ ...registerForm, contact: e.target.value })}
                  placeholder="+1 (555) 000-1122"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                  Gender
                </label>
                <select
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-sm text-on-surface border border-surface-container focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary/20"
                  value={registerForm.gender}
                  onChange={e => setRegisterForm({ ...registerForm, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-sm text-on-surface border border-surface-container focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary/20"
                  value={registerForm.dob}
                  onChange={e => setRegisterForm({ ...registerForm, dob: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                  City / Address
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-sm text-on-surface border border-surface-container focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary/20"
                  value={registerForm.address}
                  onChange={e => setRegisterForm({ ...registerForm, address: e.target.value })}
                  placeholder="123 Main St, City"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-sm text-on-surface border border-surface-container focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                  value={registerForm.password}
                  onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-sm text-on-surface border border-surface-container focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                  value={registerForm.confirm_password}
                  onChange={e => setRegisterForm({ ...registerForm, confirm_password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 py-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register & Enter Patient Portal'} <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="mt-6 pt-4 border-t border-surface-container text-center">
          {onGoToStaffLogin && (
            <button
              type="button"
              onClick={onGoToStaffLogin}
              className="text-xs text-outline hover:text-on-surface font-semibold transition-colors cursor-pointer"
            >
              Hospital Employee / Clinical Staff Sign In →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
