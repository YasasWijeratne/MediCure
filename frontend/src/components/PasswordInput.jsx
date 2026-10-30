import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * PasswordInput — shared input with show/hide toggle.
 * Props match standard <input> props + className overrides.
 */
export default function PasswordInput({ id, value, onChange, placeholder = 'Enter password', autoComplete = 'current-password', className = '' }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">lock</span>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        className={`w-full pl-10 pr-10 py-2.5 bg-surface-container-low rounded-lg text-sm text-on-surface border border-surface-container focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${className}`}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

/**
 * PasswordStrengthMeter — shows strength score bar below a password field.
 * Exported for use in registration forms.
 */
const criteria = [
  { label: 'At least 8 characters', test: p => p.length >= 8 },
  { label: 'Uppercase letter (A-Z)', test: p => /[A-Z]/.test(p) },
  { label: 'Lowercase letter (a-z)', test: p => /[a-z]/.test(p) },
  { label: 'Number (0-9)', test: p => /[0-9]/.test(p) },
  { label: 'Special character (!@#$...)', test: p => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`§±]/.test(p) },
];

export function PasswordStrengthMeter({ password }) {
  if (!password) return null;

  const passed = criteria.filter(c => c.test(password)).length;
  const strength = passed <= 1 ? 'weak' : passed <= 3 ? 'fair' : passed === 4 ? 'good' : 'strong';
  const colors = { weak: '#ef4444', fair: '#f97316', good: '#eab308', strong: '#22c55e' };
  const labels = { weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' };
  const barColor = colors[strength];

  return (
    <div className="mt-2 space-y-1.5">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ backgroundColor: i <= passed ? barColor : 'var(--color-surface-container)' }}
            />
          ))}
        </div>
        <span className="text-[11px] font-semibold" style={{ color: barColor }}>
          {labels[strength]}
        </span>
      </div>
      {/* Criteria checklist */}
      <div className="grid grid-cols-1 gap-0.5">
        {criteria.map(c => {
          const ok = c.test(password);
          return (
            <div key={c.label} className="flex items-center gap-1.5">
              <span className={`text-[12px] transition-colors ${ok ? 'text-green-500' : 'text-outline'}`}>
                {ok ? '✓' : '○'}
              </span>
              <span className={`text-[11px] transition-colors ${ok ? 'text-on-surface-variant' : 'text-outline'}`}>
                {c.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
