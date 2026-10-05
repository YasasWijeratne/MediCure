import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardView({ onNavigate }) {
  const { user, currentRole } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/summary');
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-on-surface-variant min-h-[50vh]">
        <div className="w-10 h-10 border-3 border-secondary/30 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="font-label-lg text-sm text-outline">Synchronizing clinical telemetry & hospital metrics...</p>
      </div>
    );
  }

  const totalBeds = 67;
  const occupiedBeds = stats?.activeAdmissions || 0;
  const bedOccupancyRate = Math.min(100, Math.round((occupiedBeds / totalBeds) * 100));

  return (
    <div className="space-y-6">
      {/* Top Action / Clinical Status Banner (from operations_command_dashboard) */}
      <div className="bg-surface-container-lowest rounded-xl p-5 md:p-6 shadow-sm border border-surface-container flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-xl bg-secondary-container/40 flex items-center justify-center text-primary shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              ecg_heart
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-headline-lg text-xl md:text-2xl font-bold text-on-surface tracking-tight">
                Welcome back, {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1).replace(/[._]/g, ' ') : 'Staff'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-xs font-semibold">
                {currentRole}
              </span>
            </div>
            <p className="font-body-sm text-xs md:text-sm text-on-surface-variant flex items-center gap-2 mt-1">
              <span className="h-2 w-2 rounded-full bg-primary-container animate-pulse"></span>
              MediCure HMS • Hospital Operations & Clinical Workflows
            </p>
          </div>
        </div>

        {['Administrator', 'Receptionist'].includes(currentRole) && (
          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
            <button
              onClick={() => onNavigate('appointments')}
              className="px-4 py-2.5 rounded-lg bg-surface-container-low text-primary hover:bg-surface-container font-label-md text-sm font-semibold transition-all flex items-center gap-1.5 shadow-xs border border-surface-container-high/40 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
              Book Appointment
            </button>
            <button
              onClick={() => onNavigate('patients')}
              className="px-4 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              + Register Patient
            </button>
          </div>
        )}
      </div>

      {/* 4 Main Clinical KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Registered Patients */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                Registered Patients
              </span>
              <div className="font-display-lg text-3xl font-bold text-on-surface tracking-tight">
                {stats?.totalPatients?.toLocaleString() || 0}
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-secondary-container/40 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">group</span>
            </div>
          </div>
          <div className="mt-4 pt-2 flex items-center justify-between text-on-surface-variant bg-surface-container-low/50 rounded-lg px-2.5 py-1.5 text-xs">
            <span className="font-label-sm text-primary flex items-center gap-0.5 font-semibold">
              <span className="material-symbols-outlined text-[16px]">person_add</span> {stats?.totalPatients || 0} registered
            </span>

          </div>
        </div>

        {/* KPI 2: Today's Appointments */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-secondary"></div>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                Active Appointments
              </span>
              <div className="font-headline-xl text-3xl font-bold text-on-surface tracking-tight">
                {stats?.scheduledAppointments || 0}{' '}
                <span className="font-headline-sm text-sm text-outline font-normal">
                  / {stats?.totalAppointments || 0} Total
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-surface-container-high text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">event_available</span>
            </div>
          </div>
          <div className="mt-4 pt-2 flex items-center justify-between bg-surface-container-low/50 rounded-lg px-2.5 py-1.5 text-xs">
            <span className="text-primary font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              {Math.max(0, (stats?.totalAppointments || 0) - (stats?.scheduledAppointments || 0))} Completed
            </span>
            <span className="text-secondary font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              {stats?.scheduledAppointments || 0} In Queue
            </span>
          </div>
        </div>

        {/* KPI 3: Inpatient Admissions */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary-container"></div>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                Inpatient Admissions
              </span>
              <div className="font-headline-xl text-3xl font-bold text-on-surface tracking-tight">
                {occupiedBeds}{' '}
                <span className="font-headline-sm text-sm text-outline font-normal">
                  / {totalBeds} Beds
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-secondary-container/40 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">bed</span>
            </div>
          </div>
          <div className="mt-4 pt-2 flex items-center justify-between bg-surface-container-low/50 rounded-lg px-2.5 py-1.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${bedOccupancyRate}%` }}
                ></div>
              </div>
              <span className="font-label-sm text-on-surface font-semibold">{bedOccupancyRate}%</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-secondary-container/60 text-on-secondary-container font-label-sm text-[11px] font-semibold">
              {bedOccupancyRate > 85 ? 'High Surge' : 'Optimal Capacity'}
            </span>
          </div>
        </div>

        {/* KPI 4: Collected Revenue */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-outline"></div>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                Collected Revenue
              </span>
              <div className="font-headline-xl text-3xl font-bold text-on-surface tracking-tight">
                ${(stats?.totalRevenue || 0).toLocaleString()}
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-surface-container-high text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
          </div>
          <div className="mt-4 pt-2 flex items-center justify-between text-on-surface-variant bg-surface-container-low/50 rounded-lg px-2.5 py-1.5 text-xs">
            <span className="text-error font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">hourglass_top</span>
              ${(stats?.pendingRevenue || 0).toLocaleString()} pending
            </span>

          </div>
        </div>
      </div>

      {/* Removed Quick Alerts (Pharmacy, Lab) */}

      {/* Main Tables Row (Removed Appointments & Lab Queue for simplicity) */}
    </div>
  );
}
