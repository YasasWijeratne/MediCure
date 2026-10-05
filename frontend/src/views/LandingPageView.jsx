import React from 'react';

export default function LandingPageView({ onEnterPortal, onEnterAdminLogin }) {
  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-md shadow-xs border-b border-surface-container-high/40">
        <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[24px]">health_and_safety</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-lg font-bold text-on-surface leading-none">MediCure</span>
              <span className="font-label-sm text-[11px] text-outline tracking-wider uppercase mt-0.5">Hospital Management System</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden xl:flex items-center gap-7">
            <a className="font-label-lg text-sm text-primary font-semibold transition-colors" href="#overview">Overview</a>
            <a className="font-label-lg text-sm text-on-surface-variant hover:text-primary transition-colors" href="#modules">Clinical Modules</a>
            <a className="font-label-lg text-sm text-on-surface-variant hover:text-primary transition-colors" href="#roles">Roles & Access</a>
            <a className="font-label-lg text-sm text-on-surface-variant hover:text-primary transition-colors" href="#security">Security & Audit</a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {onEnterAdminLogin && (
              <button
                onClick={onEnterAdminLogin}
                className="hidden md:inline-flex items-center gap-1.5 font-label-lg text-xs text-error/90 hover:text-error bg-error-container/20 hover:bg-error-container/40 border border-error/30 px-3 py-2 rounded-lg transition-all cursor-pointer font-semibold"
                type="button"
                title="Restricted Administrator Access"
              >
                <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                <span>Admin Login</span>
              </button>
            )}
            <button
              onClick={onEnterPortal}
              className="hidden sm:inline-flex items-center justify-center font-label-lg text-sm text-primary hover:bg-surface-container-low px-4 py-2.5 rounded-lg transition-all cursor-pointer font-semibold"
              type="button"
            >
              Staff Login
            </button>
            <button
              onClick={onEnterPortal}
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-label-lg text-sm px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer font-semibold active:scale-[0.98]"
              type="button"
            >
              <span>Clinical Portal</span>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center ml-1">
                <span className="material-symbols-outlined text-on-primary text-[16px]">arrow_forward</span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="w-full pt-20 bg-background flex-1">
        <div className="flex flex-col w-full">

          {/* Hero Section */}
          <section className="relative w-full overflow-hidden px-6 lg:px-12 pt-16 pb-20" id="overview">
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-secondary-fixed/25 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute top-48 right-10 w-96 h-96 bg-primary-fixed/20 rounded-full blur-2xl pointer-events-none -z-10"></div>

            <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
              {/* System Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface-container shadow-xs mb-6 border border-surface-container-high/60">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="font-label-md text-xs text-primary font-semibold tracking-wide uppercase">MediCure HMS</span>
                <span className="h-3 w-px bg-outline-variant/60"></span>
                <span className="font-label-sm text-xs text-on-surface-variant">Node.js + React • REST API</span>
              </div>

              {/* Hero Heading */}
              <h1 className="font-display-lg text-3xl sm:text-5xl lg:text-6xl font-bold text-on-surface tracking-tight max-w-4xl leading-tight">
                Integrated Hospital Management for Modern Clinical Teams
              </h1>

              <p className="font-body-lg text-base sm:text-lg text-on-surface-variant max-w-2xl mt-5">
                A unified clinical system covering patient records, appointments, inpatient admissions, laboratory workflow, pharmacy inventory, billing, staff management, and security audit — all in one portal.
              </p>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                <button
                  onClick={onEnterPortal}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-primary text-on-primary font-label-lg text-sm font-semibold shadow-md hover:bg-primary-container transition-all cursor-pointer active:scale-[0.98]"
                  type="button"
                >
                  <span>Enter Clinical Portal</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
                <a
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-surface-container-lowest text-primary font-label-lg text-sm font-semibold shadow-xs hover:bg-surface-container transition-all border border-surface-container-high/60"
                  href="#modules"
                >
                  <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
                  <span>View Clinical Modules</span>
                </a>
              </div>

              {/* 4 Actual System Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl mt-14">
                <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col items-center text-center">
                  <span className="font-headline-lg text-2xl md:text-3xl font-bold text-primary">12</span>
                  <span className="font-label-sm text-xs text-on-surface-variant mt-1">Clinical Modules</span>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col items-center text-center">
                  <span className="font-headline-lg text-2xl md:text-3xl font-bold text-primary">7</span>
                  <span className="font-label-sm text-xs text-on-surface-variant mt-1">Staff Role Levels</span>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col items-center text-center">
                  <span className="font-headline-lg text-2xl md:text-3xl font-bold text-primary">67</span>
                  <span className="font-label-sm text-xs text-on-surface-variant mt-1">Hospital Beds (4 Ward Types)</span>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col items-center text-center">
                  <span className="font-headline-lg text-2xl md:text-3xl font-bold text-primary">Real-Time</span>
                  <span className="font-label-sm text-xs text-on-surface-variant mt-1">Live Analytics & Audit Trail</span>
                </div>
              </div>

              {/* Live System Console Mockup */}
              <div className="w-full max-w-6xl mt-12 rounded-2xl bg-surface-container-lowest shadow-xl border border-surface-container-high/70 p-4 sm:p-6 text-left relative">
                <div className="absolute -top-3.5 left-8 px-3.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-xs font-bold shadow-xs flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                  MediCure HMS • Operations Console
                </div>

                {/* Window Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-surface-container mt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-error/70"></span>
                      <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                      <span className="w-3 h-3 rounded-full bg-secondary"></span>
                    </div>
                    <span className="font-label-md text-sm font-semibold text-on-surface ml-2">Dashboard • Live System View</span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-xs">Backend Connected</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-body-sm text-xs text-on-surface-variant">Node.js REST API</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-xs font-semibold">
                      <span className="material-symbols-outlined text-[16px]">sync</span> Live
                    </span>
                  </div>
                </div>

                {/* Dashboard Preview Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left: Ward Summary */}
                  <div className="lg:col-span-5 bg-surface-container-low rounded-xl p-4 flex flex-col justify-between border border-surface-container-high/40">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-headline-sm text-sm font-bold text-on-surface">Ward Occupancy</span>
                        <span className="font-label-sm text-xs text-primary font-bold">67 Total Beds</span>
                      </div>
                      <p className="font-body-sm text-xs text-on-surface-variant mb-3">4 ward types: General Ward, ICU, Pediatric Care, Private Suites.</p>

                      <div className="space-y-2.5">
                        {[
                          { name: 'General Ward', beds: 30, rate: '$80/day', color: 'bg-primary' },
                          { name: 'ICU (Intensive Care)', beds: 12, rate: '$250/day', color: 'bg-error' },
                          { name: 'Pediatric Care', beds: 15, rate: '$110/day', color: 'bg-secondary' },
                          { name: 'Private Suites', beds: 10, rate: '$200/day', color: 'bg-outline' },
                        ].map(ward => (
                          <div key={ward.name} className="p-2.5 rounded-lg bg-surface-container-lowest shadow-2xs border border-surface-container">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-on-surface">{ward.name}</span>
                              <span className="text-outline">{ward.beds} beds · {ward.rate}</span>
                            </div>
                            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-1.5 overflow-hidden">
                              <div className={`${ward.color} h-full rounded-full`} style={{ width: `${(ward.beds / 67) * 100}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-surface-container">
                      <span className="text-on-surface-variant">Manage admissions & discharge</span>
                      <button onClick={onEnterPortal} className="text-primary font-bold hover:underline cursor-pointer">
                        Open Inpatient →
                      </button>
                    </div>
                  </div>

                  {/* Middle: EMR Prescriptions */}
                  <div className="lg:col-span-4 bg-surface-container-low rounded-xl p-4 flex flex-col justify-between border border-surface-container-high/40">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-headline-sm text-sm font-bold text-on-surface">EMR & Prescriptions</span>
                        <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-[10px] font-bold">Clinical Records</span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant">Prescription-driven patient records linked to appointments, lab tests, and billing.</span>

                      <div className="space-y-2 mt-3 text-xs">
                        <div className="p-2.5 bg-surface-container-lowest rounded-lg shadow-2xs border border-surface-container">
                          <div className="flex items-center justify-between font-semibold">
                            <span>Diagnosis → Prescription</span>
                            <span className="text-primary">Linked</span>
                          </div>
                          <span className="text-[10px] text-outline block mt-1">ICD diagnosis, physician notes, medicine dosage & frequency</span>
                        </div>
                        <div className="p-2.5 bg-surface-container-lowest rounded-lg shadow-2xs border border-surface-container">
                          <div className="flex items-center justify-between font-semibold">
                            <span>Lab Test Orders</span>
                            <span className="text-secondary">Auto-Billed</span>
                          </div>
                          <span className="text-[10px] text-outline block mt-1">Orders create invoice line items automatically</span>
                        </div>
                        <div className="p-2.5 bg-surface-container-lowest rounded-lg shadow-2xs border border-surface-container">
                          <div className="flex items-center justify-between font-semibold">
                            <span>Patient Document Vault</span>
                            <span className="text-outline">Attached</span>
                          </div>
                          <span className="text-[10px] text-outline block mt-1">Lab reports, radiology scans, insurance, prior hospital discharge</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-surface-container">
                      <span className="text-primary font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> Full EMR Records
                      </span>
                      <button onClick={onEnterPortal} className="text-primary font-bold hover:underline cursor-pointer">Open EMR →</button>
                    </div>
                  </div>

                  {/* Right: Lab Queue */}
                  <div className="lg:col-span-3 bg-surface-container-low rounded-xl p-4 flex flex-col justify-between border border-surface-container-high/40">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-headline-sm text-sm font-bold text-on-surface">Lab Pipeline</span>
                        <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed rounded-full font-bold text-[10px]">LIS</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        {[
                          { label: 'Requested', color: 'bg-outline', desc: 'Awaiting sample collection' },
                          { label: 'Sample Collected', color: 'bg-secondary-container', desc: 'At phlebotomy desk' },
                          { label: 'In Testing', color: 'bg-primary', desc: 'Analyzer running assay' },
                          { label: 'Completed', color: 'bg-secondary', desc: 'Results signed & filed' },
                        ].map(stage => (
                          <div key={stage.label} className="p-2.5 bg-surface-container-lowest rounded-lg shadow-2xs border border-surface-container">
                            <div className="flex items-center gap-2 font-semibold">
                              <span className={`w-2 h-2 rounded-full ${stage.color} shrink-0`}></span>
                              <span>{stage.label}</span>
                            </div>
                            <span className="text-[10px] text-outline block mt-0.5 ml-4">{stage.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-surface-container">
                      <span className="text-primary font-semibold">4-Stage Pipeline</span>
                      <span className="material-symbols-outlined text-primary text-[18px]">biotech</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* What This System Does */}
          <section className="w-full bg-surface-container-lowest py-16 px-6 lg:px-12 border-y border-surface-container">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 relative">
                <div className="relative w-full h-[380px] rounded-2xl overflow-hidden shadow-xl border border-surface-container">
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 via-surface-container to-secondary/15 flex items-center justify-center p-8">
                    <div className="text-center space-y-3">
                      <div className="w-20 h-20 rounded-2xl bg-primary text-on-primary flex items-center justify-center mx-auto shadow-md">
                        <span className="material-symbols-outlined text-[44px]">vital_signs</span>
                      </div>
                      <h3 className="font-headline-md text-xl font-bold text-on-surface">End-to-End Clinical Workflows</h3>
                      <p className="font-body-sm text-xs text-on-surface-variant max-w-sm">
                        From patient registration through appointments, admissions, prescriptions, laboratory tests, pharmacy dispensing, and invoice settlement — all connected in one system.
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-surface-container-lowest/95 backdrop-blur-md shadow-md border border-surface-container">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0">
                        <span className="material-symbols-outlined text-[20px]">account_tree</span>
                      </div>
                      <div>
                        <span className="font-headline-sm text-sm font-bold text-on-surface">Interconnected Data</span>
                        <p className="font-body-sm text-xs text-on-surface-variant">Appointments auto-create invoices. Lab orders auto-bill patients. Admissions calculate room charges on discharge.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-xs font-semibold">
                  HOW IT WORKS
                </div>
                <h2 className="font-headline-xl text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
                  All hospital workflows connected through a single REST API.
                </h2>
                <p className="font-body-lg text-sm md:text-base text-on-surface-variant leading-relaxed">
                  MediCure HMS uses a Node.js + Express backend with an in-memory data store to link every clinical action. Booking an appointment automatically generates an invoice. Ordering a lab test appends a billing line item. Discharging a patient calculates and bills the daily bed rate. Every action is logged to the security audit trail.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/40">
                    <span className="font-headline-md text-xl md:text-2xl font-bold text-primary">Auto-Invoice</span>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1">Appointments, lab orders & admissions automatically generate billing records.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/40">
                    <span className="font-headline-md text-xl md:text-2xl font-bold text-secondary">Role-Based Access</span>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1">7 roles with granular permissions control exactly what each staff member sees.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 12 Clinical Modules */}
          <section className="w-full py-20 px-6 lg:px-12 bg-background" id="modules">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-14">
                <span className="font-label-lg text-xs font-bold text-primary uppercase tracking-wider">System Modules</span>
                <h2 className="font-headline-xl text-3xl md:text-4xl font-bold text-on-surface mt-2">
                  12 Integrated Clinical & Administrative Modules
                </h2>
                <p className="font-body-lg text-sm text-on-surface-variant mt-3">
                  Every module connects to the backend REST API with real CRUD operations and live data from the in-memory store.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: 'dashboard', color: 'bg-primary-fixed', iconColor: 'text-primary',
                    title: 'Operations Dashboard',
                    desc: 'Live KPI cards for total patients, scheduled appointments, active inpatient admissions, and collected vs. pending revenue. Pharmacy stock and lab queue alerts.',
                    tags: ['Live Analytics', 'KPI Cards', 'Quick Actions']
                  },
                  {
                    icon: 'group', color: 'bg-secondary-fixed', iconColor: 'text-secondary',
                    title: 'Patient Management',
                    desc: 'Register, search, update, and delete patient records. View full clinical history: appointments, prescriptions, lab tests, admissions, invoices. Upload and manage clinical documents.',
                    tags: ['CRUD Operations', 'Document Vault', 'Clinical Timeline']
                  },
                  {
                    icon: 'stethoscope', color: 'bg-secondary-container/60', iconColor: 'text-secondary',
                    title: 'Doctors & Departments',
                    desc: 'Manage specialist profiles with consultation fees, availability schedules, and department assignments. Filter by the 6 clinical departments in the system.',
                    tags: ['6 Departments', 'Fee Management', 'Availability']
                  },
                  {
                    icon: 'calendar_today', color: 'bg-primary-fixed-dim', iconColor: 'text-primary',
                    title: 'Appointment Booking',
                    desc: 'Schedule, reschedule, complete or cancel appointments. List and calendar views. Booking automatically creates a consultation invoice.',
                    tags: ['Auto-Invoice', 'List & Calendar View', 'Status Management']
                  },
                  {
                    icon: 'bed', color: 'bg-primary-fixed', iconColor: 'text-primary',
                    title: 'Inpatient & Ward Management',
                    desc: 'Admit patients to General Ward ($80/day), ICU ($250/day), Pediatric Care ($110/day), or Private Suites ($200/day). Discharge calculates and bills days × daily rate.',
                    tags: ['4 Ward Types', '67 Total Beds', 'Discharge Billing']
                  },
                  {
                    icon: 'description', color: 'bg-secondary-fixed', iconColor: 'text-secondary',
                    title: 'Electronic Medical Records',
                    desc: 'Create clinical prescriptions linked to patients and doctors. Medicine selection from live pharmacy stock with dosage and frequency. Completing EMR marks the appointment done.',
                    tags: ['Prescriptions', 'Diagnosis Notes', 'Medicine Builder']
                  },
                  {
                    icon: 'science', color: 'bg-secondary-container/60', iconColor: 'text-secondary',
                    title: 'Laboratory Information System',
                    desc: 'Order lab tests with a 4-stage pipeline: Requested → Sample Collected → In Testing → Completed. Update results and generate printable diagnostic reports.',
                    tags: ['4-Stage Pipeline', 'Printable Reports', 'Auto-Billing']
                  },
                  {
                    icon: 'medication', color: 'bg-primary-fixed-dim', iconColor: 'text-primary',
                    title: 'Pharmacy & Inventory',
                    desc: 'Track medicines with stock quantity, unit price, and expiry dates. Low stock alert at ≤ 50 units. Dispense medicines to patients and deduct from stock with automatic invoice creation.',
                    tags: ['Stock Tracking', 'Low Stock Alerts', 'Dispense & Bill']
                  },
                  {
                    icon: 'receipt_long', color: 'bg-primary-fixed', iconColor: 'text-primary',
                    title: 'Billing & Invoices',
                    desc: 'View and manage all invoices by status (Unpaid, Paid, Partially Paid). Accept payments by Cash, Credit Card, Insurance, or Online. Print official hospital receipts.',
                    tags: ['Payment Processing', 'Receipt Printing', 'Financial Summary']
                  },
                  {
                    icon: 'badge', color: 'bg-secondary-fixed', iconColor: 'text-secondary',
                    title: 'Staff & HR Management',
                    desc: 'Employee directory, daily attendance logging, leave requests with approval workflow. Admin-only: create system user accounts with role assignments.',
                    tags: ['Leave Approval', 'Attendance Logs', 'User Accounts (Admin)']
                  },
                  {
                    icon: 'monitoring', color: 'bg-secondary-container/60', iconColor: 'text-secondary',
                    title: 'Reports & Analytics',
                    desc: 'Six reporting domains: Patients, Appointments, Revenue & Billing, Pharmacy Inventory, Laboratory, and Staff HR. Printable report views.',
                    tags: ['6 Report Types', 'Revenue KPIs', 'Print Reports']
                  },
                  {
                    icon: 'verified_user', color: 'bg-primary-fixed-dim', iconColor: 'text-primary',
                    title: 'Security & Audit Trail',
                    desc: 'Every system action is logged with user, timestamp, and details. Filter by event category. Full database backup (JSON export) and restore functionality.',
                    tags: ['Audit Logs', 'DB Backup/Restore', 'Event Filtering']
                  },
                ].map(mod => (
                  <div key={mod.title} className="rounded-xl p-6 bg-surface-container-lowest shadow-sm border border-surface-container hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className={`w-12 h-12 rounded-xl ${mod.color} flex items-center justify-center ${mod.iconColor} mb-4`}>
                        <span className="material-symbols-outlined text-[26px]">{mod.icon}</span>
                      </div>
                      <h3 className="font-headline-sm text-base font-bold text-on-surface mb-2">{mod.title}</h3>
                      <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">{mod.desc}</p>
                    </div>
                    <div className="mt-5 pt-3 flex flex-wrap gap-1.5 border-t border-surface-container">
                      {mod.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px]">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Roles & Access Control */}
          <section className="w-full py-20 px-6 lg:px-12 bg-surface-container-lowest border-t border-surface-container" id="roles">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-14">
                <span className="font-label-lg text-xs font-bold text-primary uppercase tracking-wider">Access Control</span>
                <h2 className="font-headline-xl text-3xl md:text-4xl font-bold text-on-surface mt-2">
                  7 Role Levels — Each with Specific Module Permissions
                </h2>
                <p className="font-body-lg text-sm text-on-surface-variant mt-3">
                  Role-based access control (RBAC) ensures every staff member only sees what they are authorized to access.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[
                  {
                    role: 'Administrator',
                    access: 'Full access to all 12 modules. Only role that can register new user accounts and view the Security & Audit Trail.',
                    icon: 'admin_panel_settings', color: 'bg-primary text-on-primary'
                  },
                  {
                    role: 'Doctor',
                    access: 'Patients, Appointments, Inpatient, EMR Records, Laboratory, Pharmacy access. Can create prescriptions and order lab tests.',
                    icon: 'stethoscope', color: 'bg-secondary text-on-primary'
                  },
                  {
                    role: 'Nurse',
                    access: 'Patients (view), Appointments (view), Inpatient Care, EMR Records (view). Manages admissions and patient care.',
                    icon: 'medication', color: 'bg-surface-container-high text-on-surface'
                  },
                  {
                    role: 'Receptionist',
                    access: 'Manages Patients, Appointments, and Inpatient admissions. Can view Billing & Invoices. Front-desk operations.',
                    icon: 'person_pin', color: 'bg-surface-container-high text-on-surface'
                  },
                  {
                    role: 'Laboratory Staff',
                    access: 'Full Laboratory module access plus patient viewing. Updates specimen pipeline stages and enters test results.',
                    icon: 'science', color: 'bg-surface-container-high text-on-surface'
                  },
                  {
                    role: 'Pharmacist',
                    access: 'Full Pharmacy & Inventory management. Can view prescriptions to process dispensing. Manages stock and dispenses medicines.',
                    icon: 'vaccines', color: 'bg-surface-container-high text-on-surface'
                  },
                  {
                    role: 'Accountant',
                    access: 'Billing & Invoices management, Reports & Analytics access. Processes payments and generates financial reports.',
                    icon: 'account_balance', color: 'bg-surface-container-high text-on-surface'
                  },
                ].map(r => (
                  <div key={r.role} className="p-5 rounded-xl bg-surface-container-low border border-surface-container-high/40 hover:shadow-sm transition-all">
                    <div className={`w-10 h-10 rounded-lg ${r.color} flex items-center justify-center mb-3 shadow-xs`}>
                      <span className="material-symbols-outlined text-[22px]">{r.icon}</span>
                    </div>
                    <h3 className="font-headline-sm text-sm font-bold text-on-surface mb-1.5">{r.role}</h3>
                    <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">{r.access}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Security & Audit Section */}
          <section className="w-full py-20 px-6 lg:px-12 bg-background" id="security">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <span className="font-label-lg text-xs font-bold text-primary uppercase tracking-wider">Security & Compliance</span>
                <h2 className="font-headline-xl text-3xl md:text-4xl font-bold text-on-surface mt-2">
                  Complete Security Audit Trail & Data Recovery
                </h2>
                <p className="font-body-lg text-sm text-on-surface-variant mt-3">
                  Every action in the system is automatically logged with user, timestamp, and details. Admins can export a full database backup or restore from a JSON snapshot.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: 'history',
                    title: 'Audit Trail',
                    desc: 'Every login, patient action, appointment, lab order, payment, and system event is recorded. Filter by category: User Logins, Patient Actions, Billing, Lab, Pharmacy, System Snapshots.',
                    tag: 'Real-Time Logging'
                  },
                  {
                    icon: 'backup',
                    title: 'Database Backup',
                    desc: 'Administrators can export the complete system data as a JSON snapshot at any time via the Audit view. File is served as a downloadable attachment.',
                    tag: 'JSON Export'
                  },
                  {
                    icon: 'settings_backup_restore',
                    title: 'Data Restore',
                    desc: 'Upload a previously exported backup JSON file to restore the system data. All collections are replaced from the backup snapshot with full audit logging of the restore event.',
                    tag: 'Disaster Recovery'
                  }
                ].map(item => (
                  <div key={item.title} className="p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary mb-4">
                      <span className="material-symbols-outlined text-[26px]">{item.icon}</span>
                    </div>
                    <h3 className="font-headline-sm text-base font-bold text-on-surface mb-2">{item.title}</h3>
                    <p className="font-body-md text-xs text-on-surface-variant leading-relaxed mb-4">{item.desc}</p>
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold">{item.tag}</span>
                  </div>
                ))}
              </div>

              {/* Audit Event Types */}
              <div className="mt-10 p-6 rounded-2xl bg-surface-container-low border border-surface-container">
                <h3 className="font-headline-sm text-sm font-bold text-on-surface mb-4">Logged Audit Event Types</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    'USER_LOGIN', 'USER_REGISTERED', 'PATIENT_REGISTERED', 'PATIENT_UPDATED', 'PATIENT_DELETED',
                    'APPOINTMENT_BOOKED', 'APPOINTMENT_RESCHEDULED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_STATUS_UPDATE',
                    'PATIENT_ADMITTED', 'PATIENT_DISCHARGED', 'LAB_TEST_ORDERED', 'MEDICINE_DISPENSED',
                    'PAYMENT_RECORDED', 'LEAVE_REQUESTED', 'LEAVE_STATUS_UPDATED', 'ATTENDANCE_LOGGED',
                    'SYSTEM_BACKUP', 'SYSTEM_RESTORE', 'PASSWORD_CHANGED'
                  ].map(event => (
                    <span key={event} className="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-on-surface-variant font-mono text-[10px] border border-surface-container shadow-xs">
                      {event}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA Banner */}
          <section className="w-full py-16 px-6 lg:px-12 bg-surface-container-lowest border-t border-surface-container">
            <div className="max-w-7xl mx-auto rounded-3xl bg-inverse-surface text-inverse-on-surface p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xl">
              <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 max-w-3xl space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-xs font-semibold">
                  DEMO ACCESS AVAILABLE
                </div>
                <h2 className="font-headline-xl text-2xl sm:text-4xl font-bold tracking-tight text-inverse-on-surface">
                  Ready to explore the MediCure clinical portal?
                </h2>
                <p className="font-body-lg text-sm sm:text-base text-surface-container leading-relaxed">
                  Sign in with the demo credentials to experience all 12 modules. Use the role switcher to see what each staff role can access. The backend is running locally at port 5000.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <button
                    onClick={onEnterPortal}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary-fixed text-on-primary-fixed font-label-lg text-xs sm:text-sm font-bold shadow-md hover:bg-secondary-fixed transition-all cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    <span>Access Clinical Portal</span>
                  </button>
                  <button
                    onClick={onEnterPortal}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-inverse-surface text-inverse-on-surface hover:bg-surface-container-highest/20 font-label-lg text-xs sm:text-sm font-semibold transition-all border border-surface-container-high cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                    <span>Try Demo Mode</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-4 text-surface-container text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary-fixed text-[16px]">verified</span> Secure Role-Based Access
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary-fixed text-[16px]">verified</span> 7 Role Contexts Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary-fixed text-[16px]">verified</span> HIPAA Compliant Design
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest border-t border-surface-container py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-sm">
                  <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
                </div>
                <span className="font-headline-sm text-base font-bold text-on-surface">MediCure HMS</span>
              </div>
              <p className="text-xs text-on-surface-variant max-w-sm">
                A full-stack hospital management system built with Node.js (Express) backend and React frontend. Covers all core hospital workflows: patients, appointments, admissions, EMR, laboratory, pharmacy, billing, staff, and audit.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant text-[10px] font-semibold border border-surface-container">Node.js + Express</span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant text-[10px] font-semibold border border-surface-container">React 19 + Vite</span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant text-[10px] font-semibold border border-surface-container">REST API</span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant text-[10px] font-semibold border border-surface-container">RBAC Security</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <h4 className="font-label-lg font-bold text-on-surface uppercase tracking-wider text-[11px]">Clinical Modules</h4>
              <ul className="space-y-1.5 text-on-surface-variant">
                <li><button onClick={onEnterPortal} className="hover:text-primary cursor-pointer">Patient Management</button></li>
                <li><button onClick={onEnterPortal} className="hover:text-primary cursor-pointer">Appointments & Scheduling</button></li>
                <li><button onClick={onEnterPortal} className="hover:text-primary cursor-pointer">Inpatient & Ward Care</button></li>
                <li><button onClick={onEnterPortal} className="hover:text-primary cursor-pointer">EMR & Prescriptions</button></li>
                <li><button onClick={onEnterPortal} className="hover:text-primary cursor-pointer">Laboratory LIS</button></li>
                <li><button onClick={onEnterPortal} className="hover:text-primary cursor-pointer">Pharmacy & Inventory</button></li>
              </ul>
            </div>

            <div className="space-y-2.5 text-xs">
              <h4 className="font-label-lg font-bold text-on-surface uppercase tracking-wider text-[11px]">System</h4>
              <ul className="space-y-1.5 text-on-surface-variant">
                <li><a href="#overview" className="hover:text-primary">System Overview</a></li>
                <li><a href="#modules" className="hover:text-primary">All Modules</a></li>
                <li><a href="#roles" className="hover:text-primary">Roles & Access</a></li>
                <li><a href="#security" className="hover:text-primary">Security & Audit</a></li>
                <li><button onClick={onEnterPortal} className="hover:text-primary cursor-pointer">Billing & Reports</button></li>
                <li><button onClick={onEnterPortal} className="hover:text-primary cursor-pointer">Staff Management</button></li>
                {onEnterAdminLogin && (
                  <li>
                    <button
                      onClick={onEnterAdminLogin}
                      className="text-error font-semibold hover:underline cursor-pointer flex items-center gap-1 mt-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">shield</span>
                      <span>Admin Login (Restricted)</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-outline">
            <p>© 2026 MediCure Hospital Management System. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Backend: localhost:5000/api</span>
              <span>Frontend: localhost:5173</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
