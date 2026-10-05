import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function AuditView() {
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [restoreStatus, setRestoreStatus] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/system/audit-logs', { action: actionFilter });
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const handleDownloadBackup = () => {
    window.open('http://localhost:5000/api/system/backup', '_blank');
  };

  const handleFileRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backupData = JSON.parse(event.target.result);
        const res = await api.post('/system/restore', { backupData });
        if (res.success) {
          setRestoreStatus('Database successfully restored from snapshot!');
          fetchLogs();
        }
      } catch (err) {
        setRestoreStatus('Failed to restore backup: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const filteredLogs = logs.filter(l => {
    const q = searchTerm.toLowerCase();
    return (
      (l.action || '').toLowerCase().includes(q) ||
      (l.user_email || '').toLowerCase().includes(q) ||
      (l.details || '').toLowerCase().includes(q) ||
      (l.id || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Action & Statistics Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
              Security, Audit Trail & Disaster Recovery
            </h1>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5"></span>
              HIPAA & Regulatory Compliant
            </span>
          </div>
          <p className="font-body-sm text-xs md:text-sm text-on-surface-variant">
            Immutable Audit Event Tracking, Role-Based Access Enforcement & Point-in-Time Database Snapshots
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleDownloadBackup}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span>Download DB Snapshot</span>
          </button>
        </div>
      </div>

      {/* Backup & Disaster Recovery Card */}
      <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container relative overflow-hidden space-y-3">
        <div className="absolute top-0 left-0 right-0 h-1 bg-secondary"></div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[22px]">database</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-base font-bold text-on-surface">
              High-Availability Database Backup & Point-in-Time Restore
            </h3>
            <p className="text-xs text-outline">
              Automatic incremental snapshots safeguard patient health records, laboratory orders, and financial receipts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-xs font-semibold transition-all border border-surface-container-high/40 cursor-pointer shadow-xs">
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>Restore from JSON Snapshot</span>
            <input type="file" accept=".json" onChange={handleFileRestore} className="hidden" />
          </label>
          {restoreStatus && (
            <span className="text-xs font-semibold text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              {restoreStatus}
            </span>
          )}
        </div>
      </div>

      {/* Audit Trail Container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 md:p-5 border-b border-surface-container flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-container-low/30">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-secondary text-[20px]">verified_user</span>
            <h2 className="font-headline-sm text-sm md:text-base font-bold text-on-surface">
              System Operations & Access Log Audit Trail
            </h2>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search audit events..."
                className="w-full pl-8 pr-3 py-1.5 bg-surface-container-lowest rounded-lg font-body-sm text-xs text-on-surface border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>

            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="px-3 py-1.5 bg-surface-container-lowest rounded-lg font-label-sm text-xs font-semibold text-on-surface border border-surface-container-high outline-none cursor-pointer"
            >
              <option value="">All Event Categories</option>
              <option value="USER_LOGIN">User Authentications</option>
              <option value="PATIENT">Patient Profile Operations</option>
              <option value="APPOINTMENT">Appointment Schedules</option>
              <option value="LAB">Pathology Laboratory LIS</option>
              <option value="MEDICINE">Pharmacy Dispensary</option>
              <option value="PAYMENT">Financial Billing</option>
              <option value="SYSTEM">System Snapshots</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-surface-container-low/70 h-10">
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Event ID</th>
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Action Type</th>
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Operator / User</th>
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">IP Address</th>
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Operation Details</th>
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container font-body-sm text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-outline">
                    Loading security audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-outline">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-primary">
                      Log
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container font-mono text-[11px] font-semibold">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-on-surface">
                      {log.user_email}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-outline">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-on-surface-variant max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-outline text-right whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
