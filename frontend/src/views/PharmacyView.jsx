import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';

export default function PharmacyView() {
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDispenseModalOpen, setIsDispenseModalOpen] = useState(false);

  const [addForm, setAddForm] = useState({
    name: '',
    category: 'Cardiovascular',
    stock_qty: 100,
    unit_price: 1.50,
    expiry_date: '2027-12-31'
  });

  const [dispenseForm, setDispenseForm] = useState({
    patient_id: '',
    items: [{ medicine_id: '', quantity: 1 }]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [medRes, patRes] = await Promise.all([
        api.get('/medicines', { search, low_stock: lowStockFilter }),
        api.get('/patients')
      ]);

      if (medRes.success) setMedicines(medRes.data);
      if (patRes.success) {
        setPatients(patRes.data);
        if (patRes.data.length > 0 && !dispenseForm.patient_id) {
          setDispenseForm(prev => ({ ...prev, patient_id: patRes.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching pharmacy records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, lowStockFilter]);

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/medicines', addForm);
      if (res.success) {
        setIsAddModalOpen(false);
        setAddForm({
          name: '',
          category: 'Cardiovascular',
          stock_qty: 100,
          unit_price: 1.50,
          expiry_date: '2027-12-31'
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleQuickRestock = async (med, amount) => {
    try {
      const newQty = med.stock_qty + amount;
      const res = await api.put(`/medicines/${med.id}`, { stock_qty: newQty });
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      alert('Error restocking item: ' + err.message);
    }
  };

  const handleDispense = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/medicines/dispense', dispenseForm);
      if (res.success) {
        setIsDispenseModalOpen(false);
        alert(`Medication dispensed successfully! Total amount: $${res.total_cost.toFixed(2)}`);
        setDispenseForm({
          patient_id: patients[0]?.id || '',
          items: [{ medicine_id: medicines[0]?.id || '', quantity: 1 }]
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDispenseItemChange = (index, field, value) => {
    setDispenseForm(prev => {
      const updated = [...prev.items];
      updated[index][field] = value;
      return { ...prev, items: updated };
    });
  };

  const handleAddDispenseItem = () => {
    setDispenseForm(prev => ({
      ...prev,
      items: [...prev.items, { medicine_id: medicines[0]?.id || '', quantity: 1 }]
    }));
  };

  const handleRemoveDispenseItem = (index) => {
    setDispenseForm(prev => {
      const updated = [...prev.items];
      updated.splice(index, 1);
      return { ...prev, items: updated };
    });
  };

  const lowStockCount = medicines.filter(m => m.stock_qty <= 50).length;
  const criticalStockCount = medicines.filter(m => m.stock_qty <= 30).length;
  const totalValuation = medicines.reduce((sum, m) => sum + (m.stock_qty * m.unit_price), 0);

  const filteredMedicines = medicines.filter(m => {
    if (categoryFilter === 'all') return true;
    return (m.category || '').toLowerCase().includes(categoryFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Top KPI Telemetry Banner (from stitch laboratory_pharmacy_inventory) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container">
          <div className="absolute top-0 left-0 right-0 h-1 bg-secondary"></div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                Dispensary Fulfillment
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-lg text-3xl font-bold text-on-surface">96.8%</span>

              </div>

            </div>
            <div className="w-11 h-11 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container">
          <div className="absolute top-0 left-0 right-0 h-1 bg-error"></div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                Low Stock SKUs
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-lg text-3xl font-bold text-error">{lowStockCount}</span>
                <span className="font-label-sm text-xs text-error bg-error-container/50 px-2 py-0.5 rounded-full font-semibold">
                  {criticalStockCount} Critical
                </span>
              </div>

            </div>
            <div className="w-11 h-11 rounded-xl bg-error-container/30 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[24px]">inventory_2</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                Active Formularies
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-lg text-3xl font-bold text-on-surface">{medicines.length}</span>
                <span className="font-label-sm text-xs text-primary font-semibold">SKUs Tracked</span>
              </div>

            </div>
            <div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">medication</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container">
          <div className="absolute top-0 left-0 right-0 h-1 bg-outline"></div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                Total Valuation
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-lg text-3xl font-bold text-on-surface">
                  ${Math.round(totalValuation).toLocaleString()}
                </span>
              </div>

            </div>
            <div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Pharmacy Inventory & Dispensary */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-5 md:p-6 space-y-4">
        {/* Section Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined text-[24px]">local_pharmacy</span>
            </div>
            <div>
              <h2 className="font-headline-md text-xl md:text-2xl font-bold text-on-surface">
                Central Dispensary & Formulary Inventory
              </h2>
              <p className="font-body-sm text-xs md:text-sm text-outline">
                Real-time stock depletion tracking, batch expiry notifications, and automated replenishment
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsDispenseModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-low text-primary hover:bg-surface-container font-label-md text-sm font-semibold transition-all border border-surface-container-high/40 cursor-pointer shadow-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
              <span>Dispense Medicine</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-md text-sm font-semibold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>+ Add Stock Item</span>
            </button>
          </div>
        </div>

        {/* Controls: Search bar + Low Stock Alert Toggle + Category (from stitch) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-container-low/60 p-3 rounded-lg border border-surface-container-high/40">
          <div className="relative w-full md:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by drug name, code (MED-), category..."
              className="w-full pl-9 pr-3 py-1.5 bg-surface-container-lowest rounded-lg font-body-sm text-xs md:text-sm text-on-surface placeholder:text-outline border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-4 flex-wrap">
            {/* Category Select */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-surface-container-lowest rounded-lg font-label-sm text-xs font-semibold text-on-surface border border-surface-container-high outline-none cursor-pointer"
            >
              <option value="all">All Therapeutic Categories</option>
              <option value="cardio">Cardiovascular</option>
              <option value="antibiotic">Antibiotics</option>
              <option value="analgesic">Analgesics & Pain</option>
              <option value="diabetes">Endocrinology / Diabetes</option>
              <option value="respiratory">Respiratory</option>
            </select>

            {/* Low Stock Toggle Switch */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={lowStockFilter}
                onChange={(e) => setLowStockFilter(e.target.checked)}
                className="w-4 h-4 text-error rounded focus:ring-error"
              />
              <span className="font-label-sm text-xs text-on-surface font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-error text-[16px]">warning</span>
                Low Stock Alert Only (≤ 50 units)
              </span>
            </label>
          </div>
        </div>

        {/* Inventory Table (from stitch laboratory_pharmacy_inventory) */}
        <div className="overflow-x-auto rounded-lg border border-surface-container">
          <table className="w-full text-left font-body-sm text-xs md:text-sm">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant uppercase font-label-sm text-xs tracking-wider">
                <th className="py-3 px-4 font-semibold">Item Code</th>
                <th className="py-3 px-4 font-semibold">Medicine Name & Dosage</th>
                <th className="py-3 px-4 font-semibold">Therapeutic Category</th>
                <th className="py-3 px-4 font-semibold w-48">In Stock Quantity</th>
                <th className="py-3 px-4 font-semibold">Unit Price</th>
                <th className="py-3 px-4 font-semibold">Expiry Date</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container bg-surface-container-lowest">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-outline">
                    Loading formulary inventory...
                  </td>
                </tr>
              ) : filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-outline">
                    No medications match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredMedicines.map(med => {
                  const isCritical = med.stock_qty <= 30;
                  const isLow = med.stock_qty > 30 && med.stock_qty <= 50;
                  const percent = Math.min(100, Math.round((med.stock_qty / 200) * 100));

                  return (
                    <tr key={med.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-primary">
                        Medication
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-label-lg text-sm font-semibold text-on-surface">
                          {med.name}
                        </div>
                        <div className="text-outline text-xs">Standard therapeutic oral / injection form</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded bg-surface-container text-on-surface font-label-sm text-xs">
                          {med.category || 'General Medicine'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-between font-mono font-semibold text-xs mb-1">
                          <span className={isCritical ? 'text-error' : isLow ? 'text-amber-700' : 'text-primary'}>
                            {med.stock_qty} units
                          </span>
                          <span className="text-[11px] text-outline font-sans">Min: 50</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCritical ? 'bg-error' : isLow ? 'bg-amber-500' : 'bg-primary'
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-on-surface">
                        ${med.unit_price?.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-on-surface-variant text-xs">
                        {med.expiry_date}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isCritical
                              ? 'bg-error-container text-on-error-container'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-secondary-container text-on-secondary-container'
                          }`}
                        >
                          {isCritical ? 'Critical' : isLow ? 'Low Stock' : 'Optimal'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleQuickRestock(med, 100)}
                            className={`px-2.5 py-1 rounded font-label-sm text-xs font-semibold transition-all cursor-pointer ${
                              isCritical
                                ? 'bg-error-container/50 text-error hover:bg-error hover:text-on-error'
                                : 'bg-surface-container-low text-primary hover:bg-primary hover:text-on-primary'
                            }`}
                            title="Instantly reorder 100 units from central vendor"
                            type="button"
                          >
                            + Reorder 100
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Pharmaceutical Item to Central Inventory"
      >
        <form onSubmit={handleAddMedicine} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Drug / Formulation Name</label>
            <input
              type="text"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              className="input"
              placeholder="e.g. Atorvastatin 20mg, Amoxicillin 500mg, Ceftriaxone 1g"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Therapeutic Category</label>
              <select
                value={addForm.category}
                onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                className="select"
              >
                <option value="Cardiovascular">Cardiovascular / Statin</option>
                <option value="Antibiotics">Infectious Disease / Antibiotics</option>
                <option value="Analgesic">Analgesic / Anti-inflammatory</option>
                <option value="Endocrinology">Endocrinology / Diabetes</option>
                <option value="Respiratory">Pulmonology / Respiratory</option>
                <option value="Gastroenterology">Gastroenterology</option>
                <option value="General">General Medical Supply</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Initial Stock Quantity (Units)</label>
              <input
                type="number"
                value={addForm.stock_qty}
                onChange={(e) => setAddForm({ ...addForm, stock_qty: parseInt(e.target.value) || 0 })}
                className="input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={addForm.unit_price}
                onChange={(e) => setAddForm({ ...addForm, unit_price: parseFloat(e.target.value) || 0 })}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Batch Expiration Date</label>
              <input
                type="date"
                value={addForm.expiry_date}
                onChange={(e) => setAddForm({ ...addForm, expiry_date: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div className="modal-footer px-0 pb-0">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Enroll Item into Inventory
            </button>
          </div>
        </form>
      </Modal>

      {/* Dispense Medicine Modal */}
      <Modal
        isOpen={isDispenseModalOpen}
        onClose={() => setIsDispenseModalOpen(false)}
        title="Dispense Prescription Medications"
      >
        <form onSubmit={handleDispense} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Patient</label>
            <select
              value={dispenseForm.patient_id}
              onChange={(e) => setDispenseForm({ ...dispenseForm, patient_id: e.target.value })}
              className="select"
              required
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} ()
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 pt-2 border-t border-surface-container">
            <div className="flex items-center justify-between">
              <label className="form-label mb-0">Dispense Items</label>
              <button
                type="button"
                onClick={handleAddDispenseItem}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Item
              </button>
            </div>

            {dispenseForm.items.map((it, idx) => (
              <div key={idx} className="p-3 bg-surface-container-low rounded-lg flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[11px] text-outline block mb-1">Medication</label>
                  <select
                    value={it.medicine_id}
                    onChange={(e) => handleDispenseItemChange(idx, 'medicine_id', e.target.value)}
                    className="select text-xs py-1.5"
                    required
                  >
                    {medicines.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} (${m.unit_price?.toFixed(2)} | {m.stock_qty} left)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="text-[11px] text-outline block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={it.quantity}
                    onChange={(e) => handleDispenseItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                    className="input text-xs py-1.5"
                    required
                  />
                </div>
                {dispenseForm.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDispenseItem(idx)}
                    className="text-error text-xs hover:underline mt-4 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="modal-footer px-0 pb-0">
            <button
              type="button"
              onClick={() => setIsDispenseModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm & Dispense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
