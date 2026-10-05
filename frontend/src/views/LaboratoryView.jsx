import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const LAB_PRESETS = [
  { name: 'Complete Blood Count (CBC)', fee: 45.00 },
  { name: 'Lipid Panel Profile', fee: 85.00 },
  { name: 'HbA1c Glycated Hemoglobin', fee: 65.00 },
  { name: 'Troponin-I STAT Cardiac Marker', fee: 120.00 },
  { name: 'Comprehensive Metabolic Panel (CMP)', fee: 95.00 },
  { name: 'Thyroid Function Panel (TSH, Free T4)', fee: 90.00 },
  { name: 'Urinalysis & Microscopy', fee: 50.00 },
  { name: 'Vitamin D & B12 Screening', fee: 75.00 }
];

export default function LaboratoryView() {
  const { user } = useAuth();
  const [labTests, setLabTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [reportModalTest, setReportModalTest] = useState(null);
  const [lastSynced, setLastSynced] = useState('');

  const [requestData, setRequestData] = useState({
    patient_id: '',
    test_name: '',
    fee: 75.00
  });

  const [updateData, setUpdateData] = useState({
    sample_status: 'Sample Collected',
    result_data: '',
    clinical_notes: '',
    technician: user?.username || 'Lab Specialist'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [labRes, patRes] = await Promise.all([
        api.get('/lab-tests'),
        api.get('/patients')
      ]);

      if (labRes.success) {
        setLabTests(labRes.data || []);
      }
      if (patRes.success) {
        setPatients(patRes.data || []);
        if (patRes.data && patRes.data.length > 0 && !requestData.patient_id) {
          setRequestData(prev => ({ ...prev, patient_id: patRes.data[0].id }));
        }
      }
      setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Error fetching lab tests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePresetSelect = (e) => {
    const selectedName = e.target.value;
    const preset = LAB_PRESETS.find(p => p.name === selectedName);
    if (preset) {
      setRequestData(prev => ({ ...prev, test_name: preset.name, fee: preset.fee }));
    } else {
      setRequestData(prev => ({ ...prev, test_name: selectedName }));
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!requestData.patient_id || !requestData.test_name) {
      alert('Please select a patient and provide a test name.');
      return;
    }
    try {
      const res = await api.post('/lab-tests', requestData);
      if (res.success) {
        setIsAddModalOpen(false);
        setRequestData({ patient_id: patients[0]?.id || '', test_name: '', fee: 75.00 });
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/lab-tests/${editingTest.id}`, updateData);
      if (res.success) {
        setEditingTest(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and delete this lab test order?')) return;
    try {
      const res = await api.delete(`/lab-tests/${id}`);
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const openUpdateModal = (test) => {
    setEditingTest(test);
    setUpdateData({
      sample_status: test.sample_status || 'Requested',
      result_data: test.result_data || '',
      clinical_notes: test.clinical_notes || '',
      technician: test.technician || user?.username || 'Lab Specialist'
    });
  };

  const completedCount = labTests.filter(t => t.sample_status === 'Completed').length;
  const inTestingCount = labTests.filter(t => t.sample_status === 'In Testing').length;
  const requestedCount = labTests.filter(t => t.sample_status === 'Requested').length;
  const sampleCollectedCount = labTests.filter(t => t.sample_status === 'Sample Collected').length;

  const filteredTests = labTests.filter(t => {
    const matchesStatus = !statusFilter || (t.sample_status || '').toLowerCase() === statusFilter.toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = (
      (t.test_name || '').toLowerCase().includes(q) ||
      (t.patient_name || '').toLowerCase().includes(q) ||
      (t.id || '').toLowerCase().includes(q)
    );
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top KPI Telemetry Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                LIS Test Volume
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-lg text-3xl font-bold text-on-surface">{labTests.length}</span>
                <span className="font-label-sm text-xs text-primary flex items-center font-semibold">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span> Active
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">biotech</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container">
          <div className="absolute top-0 left-0 right-0 h-1 bg-error"></div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                Awaiting Phlebotomy
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-lg text-3xl font-bold text-error">{requestedCount}</span>
                <span className="font-label-sm text-xs text-error font-semibold">Orders Queued</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-error-container/30 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[24px]">hourglass_top</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary-container"></div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                In Analysis / Testing
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-lg text-3xl font-bold text-primary">{inTestingCount + sampleCollectedCount}</span>
                <span className="font-label-sm text-xs text-primary font-semibold">In Active Pipeline</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">sync</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container">
          <div className="absolute top-0 left-0 right-0 h-1 bg-secondary"></div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                Completed & Verified
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-lg text-3xl font-bold text-secondary">{completedCount}</span>
                <span className="font-label-sm text-xs text-secondary font-semibold">Verified Pathology</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: LIS (Laboratory Information System) */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-5 md:p-6 space-y-4">
        {/* Section Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-secondary-container/40 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[24px]">science</span>
            </div>
            <div>
              <h2 className="font-headline-md text-xl md:text-2xl font-bold text-on-surface">
                Pathology & Diagnostic Laboratory
              </h2>
              <p className="font-body-sm text-xs md:text-sm text-outline">
                Clinical specimen triage, automated analyzer pipelines, and verified pathology reports
              </p>
            </div>
          </div>

          {/* Filter Pills & Action Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-surface-container-high/40">
              <button
                type="button"
                onClick={() => setStatusFilter('')}
                className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === ''
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All Tests ({labTests.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Requested')}
                className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'Requested'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Requested ({requestedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Sample Collected')}
                className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'Sample Collected'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Collected ({sampleCollectedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('In Testing')}
                className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'In Testing'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                In Testing ({inTestingCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Completed')}
                className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'Completed'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Completed ({completedCount})
              </button>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-md text-sm font-semibold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>+ Order Lab Test</span>
            </button>
          </div>
        </div>

        {/* Quick Triage Metric Ribbon */}
        <div className="bg-surface-container-low/70 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 border border-surface-container-high/40">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-label-sm text-xs text-outline font-semibold">
              STAT Urgency: <strong className="text-on-surface ml-1">{requestedCount} Queued</strong>
            </span>
            <span className="h-3 w-px bg-surface-container-high hidden sm:block"></span>
            <span className="flex items-center gap-1.5 font-label-sm text-xs text-outline font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              LIS System Status: <strong className="text-primary ml-1">Active & Calibrated</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search test, patient..."
                className="pl-8 pr-3 py-1 bg-surface-container-lowest rounded-md text-xs border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>
            <span className="font-label-sm text-outline hidden md:inline">LIS Sync:</span>
            <span className="font-mono text-primary font-semibold hidden md:inline">{lastSynced || 'Live'}</span>
          </div>
        </div>

        {/* LIS Worklist Table */}
        <div className="overflow-x-auto rounded-lg border border-surface-container">
          <table className="w-full text-left font-body-sm text-xs md:text-sm">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant uppercase font-label-sm text-xs tracking-wider">
                <th className="py-3 px-4 font-semibold">Test Ref ID</th>
                <th className="py-3 px-4 font-semibold">Patient Information</th>
                <th className="py-3 px-4 font-semibold">Investigation Test</th>
                <th className="py-3 px-4 font-semibold">Specimen Status</th>
                <th className="py-3 px-4 font-semibold">Result Summary</th>
                <th className="py-3 px-4 font-semibold">Ordered Timestamp</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container bg-surface-container-lowest">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-outline">
                    Loading specimen pipeline...
                  </td>
                </tr>
              ) : filteredTests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-outline">
                    No laboratory tests found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTests.map(test => (
                  <tr key={test.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">
                      {test.id ? test.id.toUpperCase() : 'LAB-001'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary-container text-secondary flex items-center justify-center font-bold text-xs shrink-0">
                          {test.patient_name ? test.patient_name.charAt(0) : 'P'}
                        </div>
                        <span className="font-semibold text-on-surface">{test.patient_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-on-surface">
                      {test.test_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          test.sample_status === 'Completed'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : test.sample_status === 'In Testing'
                            ? 'bg-primary-container/20 text-primary'
                            : test.sample_status === 'Sample Collected'
                            ? 'bg-secondary-fixed/40 text-on-secondary-fixed'
                            : 'bg-error-container/40 text-on-error-container'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            test.sample_status === 'Completed'
                              ? 'bg-secondary'
                              : test.sample_status === 'In Testing'
                              ? 'bg-primary animate-pulse'
                              : test.sample_status === 'Sample Collected'
                              ? 'bg-secondary'
                              : 'bg-error'
                          }`}
                        ></span>
                        {test.sample_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-outline max-w-[200px] truncate">
                      {test.result_data || 'Pending diagnostic analysis'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-outline text-xs whitespace-nowrap">
                      {test.created_at ? new Date(test.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openUpdateModal(test)}
                          className="px-2.5 py-1 rounded-md bg-surface-container-low hover:bg-surface-container text-primary font-label-sm text-xs font-semibold transition-all border border-surface-container-high/40 cursor-pointer"
                          title="Update status & pathology findings"
                        >
                          Process
                        </button>
                        {test.sample_status === 'Completed' && (
                          <button
                            onClick={() => setReportModalTest(test)}
                            className="p-1.5 rounded-md bg-secondary-container/40 hover:bg-secondary-container text-secondary transition-all cursor-pointer"
                            title="View Formal Report"
                          >
                            <span className="material-symbols-outlined text-[18px]">description</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTest(test.id)}
                          className="p-1.5 rounded-md bg-error-container/20 hover:bg-error-container/50 text-error transition-all cursor-pointer"
                          title="Cancel & Delete Lab Order"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Lab Test Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Order Clinical Diagnostic Investigation"
      >
        <form onSubmit={handleRequest} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Patient</label>
            <select
              value={requestData.patient_id}
              onChange={(e) => setRequestData({ ...requestData, patient_id: e.target.value })}
              className="select"
              required
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} ({p.id?.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Investigation Preset (Optional Quick Select)</label>
            <select
              onChange={handlePresetSelect}
              className="select"
              defaultValue=""
            >
              <option value="" disabled>-- Select a standard diagnostic preset --</option>
              {LAB_PRESETS.map(p => (
                <option key={p.name} value={p.name}>
                  {p.name} (${p.fee.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Investigation Test Name</label>
            <input
              type="text"
              value={requestData.test_name}
              onChange={(e) => setRequestData({ ...requestData, test_name: e.target.value })}
              className="input"
              placeholder="e.g. Complete Blood Count (CBC), Lipid Panel, Troponin-I STAT"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Standard Laboratory Diagnostic Fee ($)</label>
            <input
              type="number"
              step="0.01"
              value={requestData.fee}
              onChange={(e) => setRequestData({ ...requestData, fee: parseFloat(e.target.value) || 0 })}
              className="input"
              required
            />
            <p className="text-[11px] text-outline mt-1">
              Test charge is automatically invoiced to patient billing ledger.
            </p>
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
              Submit Lab Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Specimen Status / Enter Findings Modal */}
      {editingTest && (
        <Modal
          isOpen={!!editingTest}
          onClose={() => setEditingTest(null)}
          title={`Process Test — ${editingTest.test_name}`}
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="p-3 bg-surface-container-low rounded-lg text-xs space-y-1">
              <div><strong>Patient:</strong> {editingTest.patient_name}</div>
              <div><strong>Test Ref ID:</strong> <span className="font-mono text-primary font-bold">{editingTest.id ? editingTest.id.toUpperCase() : 'LAB-001'}</span></div>
            </div>

            <div className="form-group">
              <label className="form-label">Specimen Pipeline Status</label>
              <select
                value={updateData.sample_status}
                onChange={(e) => setUpdateData({ ...updateData, sample_status: e.target.value })}
                className="select"
              >
                <option value="Requested">Requested (Awaiting Phlebotomy)</option>
                <option value="Sample Collected">Sample Collected (In Transit)</option>
                <option value="In Testing">In Testing (Automated Analyzer Processing)</option>
                <option value="Completed">Completed & Verified</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Pathology Findings & Diagnostic Results</label>
              <textarea
                value={updateData.result_data}
                onChange={(e) => setUpdateData({ ...updateData, result_data: e.target.value })}
                className="textarea"
                rows="3"
                placeholder="Enter quantitative values, reference ranges, abnormal flags (e.g. WBC: 6.8 x10^3/uL normal)..."
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Observations / Physician Notes</label>
              <textarea
                value={updateData.clinical_notes}
                onChange={(e) => setUpdateData({ ...updateData, clinical_notes: e.target.value })}
                className="textarea"
                rows="2"
                placeholder="Diagnostic notes or clinical follow-up recommendations..."
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Medical Laboratory Scientist</label>
              <input
                type="text"
                value={updateData.technician}
                onChange={(e) => setUpdateData({ ...updateData, technician: e.target.value })}
                className="input"
              />
            </div>

            <div className="modal-footer px-0 pb-0">
              <button
                type="button"
                onClick={() => setEditingTest(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Diagnostic Results
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Formal Diagnostic Report Certificate Modal */}
      {reportModalTest && (
        <Modal
          isOpen={!!reportModalTest}
          onClose={() => setReportModalTest(null)}
          title="Clinical Diagnostic Laboratory Certificate"
        >
          <div className="space-y-4 text-xs md:text-sm">
            <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-high/60 space-y-2">
              <div className="flex justify-between items-start border-b border-surface-container pb-2">
                <div>
                  <h3 className="font-bold text-primary font-headline-sm text-base">MediCure Central Pathology</h3>
                  <p className="text-[11px] text-outline">CAP / CLIA Accredited Diagnostic Facility</p>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="font-bold text-on-surface">REF: {reportModalTest.id ? reportModalTest.id.toUpperCase() : 'LAB-001'}</div>
                  <div className="text-secondary font-semibold text-[11px] flex items-center justify-end gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">verified</span> VERIFIED REPORT
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div><strong>Patient Name:</strong> {reportModalTest.patient_name}</div>
                <div><strong>Date Ordered:</strong> {reportModalTest.created_at ? new Date(reportModalTest.created_at).toLocaleDateString() : 'Recent'}</div>
                <div><strong>Investigation:</strong> {reportModalTest.test_name}</div>
                <div><strong>Certifying Scientist:</strong> {reportModalTest.technician || user?.username || 'Lab Specialist'}</div>
              </div>
            </div>

            <div className="p-4 bg-surface-container-lowest rounded-xl border border-surface-container space-y-2">
              <h4 className="font-bold text-xs uppercase text-outline">Laboratory Findings & Result Data</h4>
              <p className="p-3 bg-surface-container-low/60 rounded-lg text-on-surface font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {reportModalTest.result_data || 'Normal physiological reference metrics verified.'}
              </p>
              {reportModalTest.clinical_notes && (
                <div className="pt-2 border-t border-surface-container">
                  <span className="font-bold text-[11px] text-outline block mb-0.5">Clinical Remarks:</span>
                  <p className="text-on-surface-variant italic text-xs">{reportModalTest.clinical_notes}</p>
                </div>
              )}
            </div>

            <div className="modal-footer px-0 pb-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-secondary flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Print Report
              </button>
              <button
                type="button"
                onClick={() => setReportModalTest(null)}
                className="btn btn-primary cursor-pointer"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
