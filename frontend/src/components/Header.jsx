import React, { useState } from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import Modal from './Modal';
import { api } from '../services/api';

export default function Header({ theme, toggleTheme }) {
  const { currentRole, switchRole, user, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordMessage, setPasswordMessage] = useState('');

  // Password strength validation
  const getPasswordStrength = (pwd) => {
    const checks = [
      { label: 'At least 8 characters', pass: pwd.length >= 8 },
      { label: 'One uppercase letter', pass: /[A-Z]/.test(pwd) },
      { label: 'One lowercase letter', pass: /[a-z]/.test(pwd) },
      { label: 'One number', pass: /[0-9]/.test(pwd) },
    ];
    return checks;
  };

  const [notifications] = useState([
    'New lab result submitted for Alice Smith',
    'Low stock alert: Amoxicillin 500mg (45 left)',
    'Appointment booked: John Doe with Dr. Sarah'
  ]);
  const [showNotifs, setShowNotifs] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMessage('Error: New passwords do not match.');
      return;
    }

    const strength = getPasswordStrength(passwordForm.new_password);
    const failedCheck = strength.find(c => !c.pass);
    if (failedCheck) {
      setPasswordMessage(`Error: ${failedCheck.label} is required.`);
      return;
    }

    try {
      const res = await api.post('/auth/change-password', {
        user_id: user.id,
        email: user.email,
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });

      if (res.success) {
        setPasswordMessage('Success: Password updated successfully.');
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setPasswordMessage('');
          setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        }, 1500);
      }
    } catch (err) {
      setPasswordMessage('Error: ' + err.message);
    }
  };

  return (
    <header className="h-16 bg-surface-container-lowest/95 backdrop-blur-md border-b border-surface-container px-space-lg flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left Spacer */}
      <div className="flex-1"></div>

      {/* Right Actions: Role Selector, Notifications, Theme, Profile */}
      <div className="flex items-center gap-3">



        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container-low transition-colors flex items-center justify-center"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <div className="h-6 w-px bg-surface-container-high mx-1"></div>

        {/* User Profile Chip & Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-space-sm pl-1 py-1 rounded-lg hover:bg-surface-container-low transition-colors text-left"
            type="button"
          >
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="font-label-lg text-sm text-on-surface leading-tight font-semibold">
                {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1).replace(/[._]/g, ' ') : 'Staff User'}
              </span>
            </div>

            <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
          </button>

          {showUserMenu && (
            <div className="absolute top-full right-0 mt-2 w-60 bg-surface-container-lowest border border-surface-container rounded-xl shadow-lg p-2 z-50">
              <div className="px-3 py-2 border-b border-surface-container mb-1">
                <div className="font-semibold text-sm text-on-surface">{user?.username || 'Staff'}</div>
                <div className="text-xs text-outline truncate">{user?.email}</div>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  setIsPasswordModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-surface-container-low transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[18px] text-outline">key</span>
                <span>Change Password</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-error hover:bg-error-container/30 transition-colors text-left mt-1"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Password Management Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Security & Password Management"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm font-semibold hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePasswordSubmit}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container shadow-sm transition-colors"
            >
              Update Password
            </button>
          </div>
        }
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          {passwordMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-medium ${
                passwordMessage.startsWith('Success')
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-error-container text-on-error-container'
              }`}
            >
              {passwordMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-1">
              Current Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high text-sm focus:outline-none focus:border-secondary"
              required
              value={passwordForm.current_password}
              onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-1">
              New Password (min 6 characters)
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high text-sm focus:outline-none focus:border-secondary"
              required
              value={passwordForm.new_password}
              onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              placeholder="Enter new password"
            />
            {/* Real-time password strength indicators */}
            {passwordForm.new_password && (
              <div className="mt-2 space-y-1">
                {getPasswordStrength(passwordForm.new_password).map((check, i) => (
                  <div key={i} className={`flex items-center gap-1.5 text-[11px] ${
                    check.pass ? 'text-secondary' : 'text-outline'
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {check.pass ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span>{check.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high text-sm focus:outline-none focus:border-secondary"
              required
              value={passwordForm.confirm_password}
              onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
              placeholder="Re-type new password"
            />
          </div>
        </form>
      </Modal>
    </header>
  );
}

