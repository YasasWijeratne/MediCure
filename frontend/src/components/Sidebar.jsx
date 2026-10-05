import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, onGoToLanding }) {
  const { hasPermission, currentRole } = useAuth();

    const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'doctors', label: 'Doctors', icon: 'stethoscope' },
    { id: 'emr', label: 'EMR Records', icon: 'description' },
    { id: 'billing', label: 'Billing & Invoices', icon: 'receipt_long' },
    { id: 'reports', label: 'Reports & Analytics', icon: 'monitoring' }
  ];

  return (
    <aside className="w-64 bg-surface-container-lowest shrink-0 flex flex-col border-r border-surface-container shadow-sm min-h-screen z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 px-space-md flex items-center justify-between border-b border-surface-container-low/80">
        <div className="flex items-center gap-space-sm cursor-pointer" onClick={() => setActiveTab('dashboard')}>

          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-headline-sm text-headline-sm font-bold text-primary leading-none">MediCure</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-secondary-container text-on-secondary-container font-semibold">HMS</span>
            </div>
            <span className="font-label-sm text-[11px] text-outline tracking-wider uppercase mt-0.5">Clinical Operations</span>
          </div>
        </div>
      </div>



      {/* Navigation List */}
      <nav className="flex-1 px-space-sm py-1 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const permitted = hasPermission(item.id);
          if (!permitted) return null;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-all gap-space-sm cursor-pointer ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-primary' : 'text-outline'}`}>
                {item.icon}
              </span>
              <span className="font-label-lg text-sm tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>


    </aside>
  );
}

