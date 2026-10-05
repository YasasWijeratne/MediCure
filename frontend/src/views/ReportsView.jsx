import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function ReportsView() {
  const [activeReport, setActiveReport] = useState('patient'); // patient, appointment, revenue, pharmacy, laboratory, staff
  const [data, setData] = useState({
    patients: [],
    appointments: [],
    invoices: [],
    medicines: [],
    labTests: [],
    employees: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [pat, apt, inv, med, lab, emp] = await Promise.all([
        api.get('/patients'),
        api.get('/appointments'),
        api.get('/invoices'),
        api.get('/medicines'),
        api.get('/lab-tests'),
        api.get('/staff/employees')
      ]);

      setData({
        patients: pat.data || [],
        appointments: apt.data || [],
        invoices: inv.data || [],
        medicines: med.data || [],
        labTests: lab.data || [],
        employees: emp.data || []
      });
    } catch (err) {
      console.error('Error fetching reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const reportTabs = [
    { id: 'patient', label: '1. Patient Demographics', icon: 'group', count: data.patients.length },
    { id: 'revenue', label: '2. Financial Billing Ledger', icon: 'payments', count: data.invoices.length }
  ];

  const totalPaidRevenue = data.invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, i) => sum + i.total_amount, 0);

  const totalPendingRevenue = data.invoices
    .filter(i => i.status === 'Unpaid')
    .reduce((sum, i) => sum + i.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Action & Statistics Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
              Hospital Analytics & Regulatory Reports
            </h1>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5"></span>
              2 Regulatory Domains
            </span>
          </div>
          <p className="font-body-sm text-xs md:text-sm text-on-surface-variant">
            Comprehensive Clinical, Operational, Financial, and Human Resource Executive Summaries
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Print Executive Report</span>
          </button>
        </div>
      </div>

      {/* 2 Report Domain Selector Tabs */}
      <div className="bg-surface-container-lowest p-2 rounded-xl shadow-sm border border-surface-container flex items-center gap-2 overflow-x-auto">
        {reportTabs.map(tab => {
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`px-3.5 py-2 rounded-lg font-label-sm text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-container font-mono">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Domain 1: Patient Demographics Report */}
      {activeReport === 'patient' && (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-container pb-3">
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                Domain 1: Patient Demographics & Chronic History
              </h3>
              <p className="text-xs text-outline">Registered clinical cohort census</p>
            </div>
            <span className="font-mono text-xs text-secondary font-bold">Total: {data.patients.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-surface-container-low/70 h-9">
                  <th className="px-4 py-2 font-semibold">Patient ID</th>
                  <th className="px-4 py-2 font-semibold">Full Name</th>
                  <th className="px-4 py-2 font-semibold">Gender / DOB</th>
                  <th className="px-4 py-2 font-semibold">Contact</th>
                  <th className="px-4 py-2 font-semibold">Address</th>
                  <th className="px-4 py-2 font-semibold">Clinical Background</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-body-sm text-on-surface">
                {data.patients.map(p => (
                  <tr key={p.id} className="hover:bg-surface-container-low/40">
                    <td className="px-4 py-3 font-mono font-bold text-primary">Patient</td>
                    <td className="px-4 py-3 font-semibold">{p.first_name} {p.last_name}</td>
                    <td className="px-4 py-3">{p.gender} • {p.dob}</td>
                    <td className="px-4 py-3 font-mono">{p.contact}</td>
                    <td className="px-4 py-3 text-outline">{p.address || 'N/A'}</td>
                    <td className="px-4 py-3 text-secondary font-medium">{p.medical_history || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* Domain 3: Financial & Billing Revenue */}
      {activeReport === 'revenue' && (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-container pb-3">
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                Domain 2: Financial Revenue & Outstanding Accounts
              </h3>
              <p className="text-xs text-outline">Patient billing ledgers & settlement records</p>
            </div>
            <div className="flex gap-4 text-xs font-mono">
              <span className="text-secondary font-bold">Collected: ${totalPaidRevenue.toLocaleString()}</span>
              <span className="text-error font-bold">Outstanding: ${totalPendingRevenue.toLocaleString()}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-surface-container-low/70 h-9">
                  <th className="px-4 py-2 font-semibold">Invoice Ref</th>
                  <th className="px-4 py-2 font-semibold">Patient Name</th>
                  <th className="px-4 py-2 font-semibold">Generated Date</th>
                  <th className="px-4 py-2 font-semibold">Tariff Amount</th>
                  <th className="px-4 py-2 font-semibold text-right">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-body-sm text-on-surface">
                {data.invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-surface-container-low/40">
                    <td className="px-4 py-3 font-mono font-bold text-primary">Invoice</td>
                    <td className="px-4 py-3 font-semibold">{inv.patient_name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-mono font-bold">${inv.total_amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        inv.status === 'Paid' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


    </div>
  );
}
