import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';

export default function BillingView() {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [receiptInvoice, setReceiptInvoice] = useState(null);

  const [invoiceForm, setInvoiceForm] = useState({
    patient_id: '',
    items: [{ item_type: 'Consultation', description: 'Specialist Consultation Fee', amount: 100 }]
  });

  const [paymentForm, setPaymentForm] = useState({
    amount_paid: 0,
    payment_method: 'Credit Card'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, patRes] = await Promise.all([
        api.get('/invoices', { status: statusFilter }),
        api.get('/patients')
      ]);

      if (invRes.success) setInvoices(invRes.data);
      if (patRes.success) {
        setPatients(patRes.data);
        if (patRes.data.length > 0 && !invoiceForm.patient_id) {
          setInvoiceForm(prev => ({ ...prev, patient_id: patRes.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching billing records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/invoices', invoiceForm);
      if (res.success) {
        setIsInvoiceModalOpen(false);
        setInvoiceForm({
          patient_id: patients[0]?.id || '',
          items: [{ item_type: 'Consultation', description: 'Specialist Consultation Fee', amount: 100 }]
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/invoices/${payingInvoice.id}/payment`, paymentForm);
      if (res.success) {
        setPayingInvoice(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const openPaymentModal = (inv) => {
    setPayingInvoice(inv);
    setPaymentForm({
      amount_paid: inv.total_amount,
      payment_method: 'Credit Card'
    });
  };

  const totalCollected = invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, i) => sum + i.total_amount, 0);

  const pendingAmount = invoices
    .filter(i => i.status === 'Unpaid')
    .reduce((sum, i) => sum + i.total_amount, 0);

  const paidCount = invoices.filter(i => i.status === 'Paid').length;
  const unpaidCount = invoices.filter(i => i.status === 'Unpaid').length;

  const filteredInvoices = invoices.filter(inv => {
    const q = searchTerm.toLowerCase();
    return (
      (inv.patient_name || '').toLowerCase().includes(q) ||
      (inv.id || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Action & Statistics Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
              Billing & Financial Accounting
            </h1>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5"></span>
              {invoices.length} Invoices Issued
            </span>
          </div>
          <p className="font-body-sm text-xs md:text-sm text-on-surface-variant">
            Patient Hospital Invoices, Insurance Billing, Electronic Payments, and Printed Financial Receipts
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            <span>+ Generate Hospital Bill</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Cards (from stitch operations_command_dashboard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                Collected Revenue
              </span>
              <div className="font-headline-lg text-3xl font-bold text-on-surface mt-1">
                ${totalCollected.toLocaleString()}
              </div>
              <span className="font-body-sm text-xs text-secondary font-medium mt-0.5">
                {paidCount} Settled Invoices
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container">
          <div className="absolute top-0 left-0 right-0 h-1 bg-error"></div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                Outstanding Balance
              </span>
              <div className="font-headline-lg text-3xl font-bold text-error mt-1">
                ${pendingAmount.toLocaleString()}
              </div>
              <span className="font-body-sm text-xs text-error font-medium mt-0.5">
                {unpaidCount} Pending Settlement
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-error-container/30 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[24px]">hourglass_top</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container">
          <div className="absolute top-0 left-0 right-0 h-1 bg-secondary"></div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                Collection Ratio
              </span>
              <div className="font-headline-lg text-3xl font-bold text-on-surface mt-1">
                {invoices.length > 0 ? Math.round((paidCount / invoices.length) * 100) : 0}%
              </div>

            </div>
            <div className="w-11 h-11 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[24px]">trending_up</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container">
          <div className="absolute top-0 left-0 right-0 h-1 bg-outline"></div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                Payment Gateways
              </span>
              <div className="font-headline-lg text-3xl font-bold text-on-surface mt-1">
                Active
              </div>

            </div>
            <div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">credit_card</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-lg">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoice by patient name or invoice ID (INV-)..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-lg font-body-sm text-xs md:text-sm text-on-surface placeholder:text-outline border border-transparent focus:border-secondary focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
          />
        </div>

        <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-surface-container-high/40">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === ''
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            All Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setStatusFilter('Unpaid')}
            className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'Unpaid'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Unpaid ({unpaidCount})
          </button>
          <button
            onClick={() => setStatusFilter('Paid')}
            className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'Paid'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Paid ({paidCount})
          </button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-outline bg-surface-container-lowest rounded-xl p-6 border border-surface-container">
            Loading billing records and ledgers...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12 text-outline bg-surface-container-lowest rounded-xl p-6 border border-surface-container">
            No invoice records found matching your query.
          </div>
        ) : (
          filteredInvoices.map(inv => (
            <div
              key={inv.id}
              className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-secondary-container/40 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    <span className="material-symbols-outlined text-[22px]">receipt</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-primary">Bill</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          inv.status === 'Paid'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-error-container text-on-error-container'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            inv.status === 'Paid' ? 'bg-secondary' : 'bg-error'
                          }`}
                        ></span>
                        {inv.status}
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-base font-bold text-on-surface mt-1">
                      Patient: {inv.patient_name}
                    </h3>
                    <p className="text-xs text-outline font-mono">
                      Issued on {new Date(inv.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center md:items-end flex-col">
                  <div className="font-headline-lg text-2xl font-bold text-on-surface font-mono">
                    ${inv.total_amount.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {inv.status === 'Unpaid' ? (
                      <button
                        onClick={() => openPaymentModal(inv)}
                        className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">credit_card</span>
                        Record Payment
                      </button>
                    ) : (
                      <button
                        onClick={() => setReceiptInvoice(inv)}
                        className="px-3.5 py-2 rounded-lg bg-surface-container-low text-primary hover:bg-surface-container font-label-md text-xs font-semibold transition-all border border-surface-container-high/40 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">print</span>
                        Print Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Itemized Hospital Charges */}
              <div className="bg-surface-container-low/60 rounded-xl p-3.5 border border-surface-container-high/40">
                <div className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">
                  Itemized Hospital Tariff Breakdown
                </div>
                <div className="space-y-1.5 text-xs">
                  {inv.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-on-surface">
                      <span className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-primary font-semibold text-[10px] border border-surface-container-high">
                          {item.item_type}
                        </span>
                        <span>{item.description}</span>
                      </span>
                      <span className="font-mono font-semibold">${item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Generate Patient Hospital Bill"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Patient</label>
            <select
              className="select"
              required
              value={invoiceForm.patient_id}
              onChange={e => setInvoiceForm({ ...invoiceForm, patient_id: e.target.value })}
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Charge Category</label>
              <select
                className="select"
                value={invoiceForm.items[0].item_type}
                onChange={e => {
                  const updated = [...invoiceForm.items];
                  updated[0].item_type = e.target.value;
                  setInvoiceForm({ ...invoiceForm, items: updated });
                }}
              >
                <option value="Consultation">Consultation Charges</option>
                <option value="Laboratory">Laboratory Diagnostics</option>
                <option value="Pharmacy">Pharmacy Medication</option>
                <option value="Admission">Inpatient Bed Accommodation</option>
                <option value="Procedure">Surgical / Minor Procedure</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Charge Amount ($)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                required
                value={invoiceForm.items[0].amount}
                onChange={e => {
                  const updated = [...invoiceForm.items];
                  updated[0].amount = parseFloat(e.target.value) || 0;
                  setInvoiceForm({ ...invoiceForm, items: updated });
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Service Description</label>
            <input
              type="text"
              className="input"
              value={invoiceForm.items[0].description}
              onChange={e => {
                const updated = [...invoiceForm.items];
                updated[0].description = e.target.value;
                setInvoiceForm({ ...invoiceForm, items: updated });
              }}
              placeholder="e.g. Attending Physician Specialty Consult, Ward Stay"
              required
            />
          </div>

          <div className="modal-footer px-0 pb-0">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Issue Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Payment Processing Modal */}
      {payingInvoice && (
        <Modal
          isOpen={!!payingInvoice}
          onClose={() => setPayingInvoice(null)}
          title={`Receive Payment`}
        >
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="p-3.5 bg-surface-container-low rounded-xl text-xs space-y-1">
              <div><strong>Patient:</strong> {payingInvoice.patient_name}</div>
              <div><strong>Total Outstanding:</strong> <span className="font-mono font-bold text-primary">${payingInvoice.total_amount.toFixed(2)}</span></div>
            </div>

            <div className="form-group">
              <label className="form-label">Settlement Amount ($)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                required
                value={paymentForm.amount_paid}
                onChange={e => setPaymentForm({ ...paymentForm, amount_paid: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Channel</label>
              <select
                className="select"
                value={paymentForm.payment_method}
                onChange={e => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
              >
                <option value="Credit Card">Credit / Debit Card (Visa, MasterCard)</option>
                <option value="Insurance Claim">Direct Insurance Coverage (TPA / Payer)</option>
                <option value="Cash">Cash at Dispensary Counter</option>
                <option value="Bank Wire">Bank Wire Transfer</option>
              </select>
            </div>

            <div className="modal-footer px-0 pb-0">
              <button
                type="button"
                onClick={() => setPayingInvoice(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Confirm Settlement
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Payment Receipt Modal */}
      {receiptInvoice && (
        <Modal
          isOpen={!!receiptInvoice}
          onClose={() => setReceiptInvoice(null)}
          title="Official Hospital Payment Receipt"
        >
          <div className="space-y-4 text-xs md:text-sm">
            <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-high/60 space-y-3">
              <div className="flex justify-between items-center border-b border-surface-container pb-2">
                <div>
                  <h3 className="font-bold text-primary font-headline-sm text-base">MediCure HMS</h3>
                  <p className="text-[11px] text-outline">Hospital Financial Ledger & Accounts</p>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="font-bold text-on-surface">Invoice</div>
                  <div className="text-secondary font-semibold">PAID IN FULL</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><strong>Patient:</strong> {receiptInvoice.patient_name}</div>
                <div><strong>Date:</strong> {new Date(receiptInvoice.created_at).toLocaleDateString()}</div>
                <div><strong>Total Settled:</strong> <span className="font-mono font-bold text-primary">${receiptInvoice.total_amount.toFixed(2)}</span></div>
                <div><strong>Status:</strong> Completed Transaction</div>
              </div>
            </div>

            <div className="p-3 bg-surface-container-lowest rounded-xl border border-surface-container">
              <h4 className="font-bold text-xs uppercase text-outline mb-2">Itemized Breakdown</h4>
              <div className="space-y-1.5 text-xs">
                {receiptInvoice.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>[{item.item_type}] {item.description}</span>
                    <span className="font-mono font-semibold">${item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer px-0 pb-0">
              <button
                onClick={() => window.print()}
                className="btn btn-secondary flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Print Receipt
              </button>
              <button
                onClick={() => setReceiptInvoice(null)}
                className="btn btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
