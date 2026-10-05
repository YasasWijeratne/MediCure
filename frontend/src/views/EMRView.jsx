import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';

export default function EMRView() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientDossier, setPatientDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    diagnosis: '',
    notes: '',
    items: [{ medicine_id: '', dosage: '1 tablet', frequency: 'Twice daily' }]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rxRes, patRes, docRes, medRes] = await Promise.all([
        api.get('/emr/prescriptions'),
        api.get('/patients'),
        api.get('/doctors'),
        api.get('/medicines')
      ]);

      if (rxRes.success) {
        setPrescriptions(rxRes.data);
      }
      if (patRes.success) {
        setPatients(patRes.data);
        if (patRes.data.length > 0 && !selectedPatientId) {
          setSelectedPatientId(patRes.data[0].id);
        }
      }
      if (docRes.success) setDoctors(docRes.data);
      if (medRes.success) {
        setMedicines(medRes.data);
        if (medRes.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            items: [{ medicine_id: medRes.data[0].id, dosage: '1 tablet', frequency: 'Twice daily' }]
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching EMR records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch single patient dossier whenever selectedPatientId changes
  useEffect(() => {
    if (!selectedPatientId) return;
    const fetchDossier = async () => {
      try {
        setDossierLoading(true);
        const res = await api.get(`/emr/patient/${selectedPatientId}`);
        if (res.success) {
          setPatientDossier(res.data);
        }
      } catch (err) {
        console.error('Error fetching patient dossier:', err);
      } finally {
        setDossierLoading(false);
      }
    };
    fetchDossier();
  }, [selectedPatientId]);

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { medicine_id: medicines[0]?.id || '', dosage: '1 tablet', frequency: 'Twice daily' }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => {
      const updated = [...prev.items];
      updated.splice(index, 1);
      return { ...prev, items: updated };
    });
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.items];
      updated[index][field] = value;
      return { ...prev, items: updated };
    });
  };

  const openPrescribeForPatient = (patId) => {
    const defaultDoc = doctors[0]?.id || '';
    setFormData({
      patient_id: patId || selectedPatientId || (patients[0]?.id || ''),
      doctor_id: defaultDoc,
      diagnosis: '',
      notes: '',
      items: [{ medicine_id: medicines[0]?.id || '', dosage: '1 tablet', frequency: 'Twice daily' }]
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/emr/prescriptions', formData);
      if (res.success) {
        setIsAddModalOpen(false);
        setFormData({
          patient_id: patients[0]?.id || '',
          doctor_id: doctors[0]?.id || '',
          diagnosis: '',
          notes: '',
          items: [{ medicine_id: medicines[0]?.id || '', dosage: '1 tablet', frequency: 'Twice daily' }]
        });
        fetchData();
        if (formData.patient_id === selectedPatientId) {
          const dosRes = await api.get(`/emr/patient/${selectedPatientId}`);
          if (dosRes.success) setPatientDossier(dosRes.data);
        }
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredPrescriptions = prescriptions.filter(rx => {
    const q = searchTerm.toLowerCase();
    return (
      (rx.patient_name || '').toLowerCase().includes(q) ||
      (rx.doctor_name || '').toLowerCase().includes(q) ||
      (rx.diagnosis || '').toLowerCase().includes(q) ||
      (rx.id || '').toLowerCase().includes(q)
    );
  });

  const activePatient = patientDossier?.patient || patients.find(p => p.id === selectedPatientId);

  return (
    <div className="space-y-6">
      {/* Top Action & Statistics Header Bar (from patient_management_emr) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
              Patient Directory & EMR Records
            </h1>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5"></span>
              {patients.length} Registered Patients
            </span>
          </div>
          <p className="font-body-sm text-xs md:text-sm text-on-surface-variant">
            Centralized Electronic Medical Records, Continuous Inpatient Monitoring & Digital Prescriptions
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => openPrescribeForPatient()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">clinical_notes</span>
            <span>+ Create Clinical Prescription</span>
          </button>
        </div>
      </div>

      {/* Quick Vital KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1">
            <span className="font-label-sm text-xs uppercase tracking-wider text-outline font-semibold">
              Active Prescriptions
            </span>
            <div className="font-headline-md text-2xl font-bold text-on-surface">
              {prescriptions.length} <span className="text-secondary text-xs font-normal">Recorded</span>
            </div>
            <span className="font-body-sm text-xs text-secondary font-medium">100% Digital Formulary</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">description</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1">
            <span className="font-label-sm text-xs uppercase tracking-wider text-outline font-semibold">
              Clinical Telemetry
            </span>
            <div className="font-headline-md text-2xl font-bold text-on-surface">
              Vitals Tracking
            </div>

          </div>
          <div className="w-11 h-11 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[24px]">ecg_heart</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1">
            <span className="font-label-sm text-xs uppercase tracking-wider text-outline font-semibold">
              Available Formularies
            </span>
            <div className="font-headline-md text-2xl font-bold text-on-surface">
              {medicines.length} <span className="text-primary text-xs font-normal">SKUs</span>
            </div>
            <span className="font-body-sm text-xs text-primary font-medium">Auto-Dispense Synced</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">medication</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1">
            <span className="font-label-sm text-xs uppercase tracking-wider text-outline font-semibold">
              Attending Physicians
            </span>
            <div className="font-headline-md text-2xl font-bold text-on-surface">
              {doctors.length} <span className="text-outline text-xs font-normal">Specialists</span>
            </div>
            <span className="font-body-sm text-xs text-secondary font-medium">On-Duty Teleconsult</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[24px]">stethoscope</span>
          </div>
        </div>
      </div>

      {/* Main Workspace (Split Layout: Prescriptions Table & Active Patient Dossier) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Side: Prescriptions & EMR Consultations List (7 Cols) */}
        <div className="xl:col-span-7 space-y-4">
          {/* Live Search Bar */}
          <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm border border-surface-container flex items-center gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by patient name, doctor, or diagnosis (e.g. Hypertension)..."
                className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-lg font-body-sm text-xs md:text-sm text-on-surface placeholder:text-outline border border-transparent focus:border-secondary focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-surface-container-low/70 h-10">
                    <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Rx ID</th>
                    <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Patient</th>
                    <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Attending Doctor</th>
                    <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Clinical Diagnosis</th>
                    <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Medications</th>
                    <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-body-sm text-on-surface">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-outline">
                        Loading electronic prescriptions...
                      </td>
                    </tr>
                  ) : filteredPrescriptions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-outline">
                        No prescriptions found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredPrescriptions.map(rx => {
                      const isSelected = rx.patient_id === selectedPatientId;
                      return (
                        <tr
                          key={rx.id}
                          onClick={() => setSelectedPatientId(rx.patient_id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-secondary-container/25 hover:bg-secondary-container/35'
                              : 'hover:bg-surface-container-low/40'
                          }`}
                        >
                          <td className="px-4 py-3 font-mono text-xs font-bold text-primary">
                            <div className="font-mono text-[10px] text-outline font-semibold">Rx</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-secondary-container text-secondary flex items-center justify-center font-bold text-xs shrink-0">
                                {rx.patient_name ? rx.patient_name.charAt(0) : 'P'}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-on-surface">{rx.patient_name}</span>
                                <span className="text-[11px] text-outline">
                                  {new Date(rx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-on-surface-variant font-medium whitespace-nowrap">
                            {rx.doctor_name}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-on-surface">{rx.diagnosis}</span>
                            {rx.notes && (
                              <p className="text-[11px] text-outline truncate max-w-[180px]">{rx.notes}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {(rx.items || []).map((it, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-medium"
                                >
                                  {it.medicine_name} ({it.dosage})
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPatientId(rx.patient_id);
                              }}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-primary text-on-primary'
                                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                              }`}
                              title="Inspect Clinical Dossier"
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Active Clinical EMR Preview Drawer / Dossier (5 Cols) */}
        <div className="xl:col-span-5 space-y-4">
          {dossierLoading ? (
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-surface-container text-center text-outline">
              <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading patient clinical dossier & telemetry...
            </div>
          ) : activePatient ? (
            <div className="space-y-4">
              {/* Patient Dossier Header Card */}
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-13 h-13 rounded-xl bg-primary text-on-primary font-bold text-xl flex items-center justify-center shadow-xs">
                      {activePatient.first_name ? activePatient.first_name.charAt(0) : 'P'}
                    </div>
                    <div>
                      <h2 className="font-headline-md text-lg font-bold text-on-surface">
                        {activePatient.first_name} {activePatient.last_name}
                      </h2>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-on-surface-variant">
                        <span className="font-mono text-primary font-bold">{activePatient.id?.toUpperCase()}</span>
                        <span className="text-outline">•</span>
                        <span>{activePatient.gender}</span>
                        <span className="text-outline">•</span>
                        <span>DOB: {activePatient.dob || '1975-06-12'}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-secondary-container text-on-secondary-container font-label-sm text-xs font-bold">
                    Blood: O+
                  </span>
                </div>

                {/* Patient Biometrics Bar */}
                <div className="grid grid-cols-3 gap-2 py-1 bg-surface-container-low rounded-lg p-2.5 text-center text-xs">
                  <div>
                    <span className="block text-[10px] text-outline uppercase font-semibold">Height</span>
                    <span className="font-bold text-on-surface">172 cm</span>
                  </div>
                  <div className="border-x border-surface-container-high">
                    <span className="block text-[10px] text-outline uppercase font-semibold">Weight</span>
                    <span className="font-bold text-on-surface">68.5 kg</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-outline uppercase font-semibold">BMI</span>
                    <span className="font-bold text-secondary">23.2 (Norm)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openPrescribeForPatient(activePatient.id)}
                    className="flex-1 py-2 px-3 bg-primary text-on-primary hover:bg-primary-container rounded-lg font-label-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    <span>+ New Prescription</span>
                  </button>
                  <button
                    onClick={() => alert(`Medical Contact: ${activePatient.contact}\nAddress: ${activePatient.address}\nMedical History: ${activePatient.medical_history || 'None recorded'}`)}
                    className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer"
                    title="View Patient Info Summary"
                  >
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                  </button>
                </div>
              </div>

              {/* Real-Time Telemetry & Vitals Monitor Card (from patient_management_emr) */}
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[22px]">ecg_heart</span>
                    <div>
                      <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                        Continuous Bed Telemetry
                      </h3>
                      <p className="font-body-sm text-[11px] text-outline">
                        Real-time synchronized vital telemetry
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1"></span> Recording
                  </span>
                </div>

                {/* 4 Telemetry Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface-container-low rounded-lg space-y-0.5">
                    <span className="font-label-sm text-[10px] text-outline uppercase font-semibold">Heart Rate</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-headline-lg text-xl font-bold text-on-surface">74</span>
                      <span className="font-label-sm text-[10px] text-outline">bpm</span>
                    </div>
                    <span className="font-label-sm text-[11px] text-secondary font-medium flex items-center">
                      <span className="material-symbols-outlined text-[13px] mr-0.5">check_circle</span> Normal Sinus
                    </span>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-lg space-y-0.5">
                    <span className="font-label-sm text-[10px] text-outline uppercase font-semibold">Blood Pressure</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-headline-lg text-xl font-bold text-on-surface">124/82</span>
                      <span className="font-label-sm text-[10px] text-outline">mmHg</span>
                    </div>
                    <span className="font-label-sm text-[11px] text-primary font-medium flex items-center">
                      <span className="material-symbols-outlined text-[13px] mr-0.5">trending_flat</span> Controlled
                    </span>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-lg space-y-0.5">
                    <span className="font-label-sm text-[10px] text-outline uppercase font-semibold">SpO2 Oxygen</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-headline-lg text-xl font-bold text-on-surface">98</span>
                      <span className="font-label-sm text-[10px] text-outline">%</span>
                    </div>
                    <span className="font-label-sm text-[11px] text-secondary font-medium flex items-center">
                      <span className="material-symbols-outlined text-[13px] mr-0.5">air</span> Room Air
                    </span>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-lg space-y-0.5">
                    <span className="font-label-sm text-[10px] text-outline uppercase font-semibold">Temperature</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-headline-lg text-xl font-bold text-on-surface">98.4</span>
                      <span className="font-label-sm text-[10px] text-outline">°F</span>
                    </div>
                    <span className="font-label-sm text-[11px] text-secondary font-medium flex items-center">
                      <span className="material-symbols-outlined text-[13px] mr-0.5">thermostat</span> Afebrile
                    </span>
                  </div>
                </div>

                {/* Synthetic Animated ECG Waveform */}
                <div className="w-full h-14 bg-surface-container-low/70 rounded-lg p-1.5 overflow-hidden flex items-center border border-surface-container-high/40">
                  <svg
                    className="w-full h-full text-secondary stroke-current"
                    fill="none"
                    viewBox="0 0 800 60"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 30 L100 30 L110 24 L120 30 L130 30 L138 6 L148 54 L158 14 L168 36 L178 30 L200 30 L220 30 L300 30 L310 24 L320 30 L330 30 L338 6 L348 54 L358 14 L368 36 L378 30 L400 30 L500 30 L510 24 L520 30 L530 30 L538 6 L548 54 L558 14 L568 36 L578 30 L600 30 L700 30 L710 24 L720 30 L730 30 L738 6 L748 54 L758 14 L768 36 L778 30 L800 30"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                    ></path>
                  </svg>
                </div>
              </div>

              {/* Patient EMR Prescriptions History */}
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container space-y-3">
                <div className="flex items-center justify-between border-b border-surface-container pb-2">
                  <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                    Patient Prescription History
                  </h3>
                  <span className="text-xs text-outline font-semibold">
                    {patientDossier?.prescriptions?.length || 0} Records
                  </span>
                </div>

                {(!patientDossier?.prescriptions || patientDossier.prescriptions.length === 0) ? (
                  <p className="text-xs text-outline py-2">No prescriptions recorded for this patient yet.</p>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {patientDossier.prescriptions.map(p => (
                      <div key={p.id} className="p-3 bg-surface-container-low/60 rounded-lg text-xs space-y-1.5 border border-surface-container-high/30">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-on-surface">{p.diagnosis}</span>
                          <span className="text-outline text-[11px]">
                            {new Date(p.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-on-surface-variant font-medium">Attending: {p.doctor_name}</p>
                        {p.notes && <p className="text-outline text-[11px] italic">"{p.notes}"</p>}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {(p.items || []).map((it, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-secondary-container/50 text-on-secondary-container text-[10px] font-semibold">
                              {it.medicine_name} - {it.dosage} ({it.frequency})
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Patient Lab Investigations */}
              {patientDossier?.labTests && patientDossier.labTests.length > 0 && (
                <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container space-y-3">
                  <div className="flex items-center justify-between border-b border-surface-container pb-2">
                    <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                      Laboratory Diagnostics
                    </h3>
                    <span className="text-xs text-secondary font-semibold">
                      {patientDossier.labTests.length} Tests
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {patientDossier.labTests.map(l => (
                      <div key={l.id} className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                        <div>
                          <div className="font-semibold text-on-surface">{l.test_name}</div>
                          <div className="text-[11px] text-outline font-mono">Test</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          l.sample_status === 'Completed'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-primary-container/20 text-primary'
                        }`}>
                          {l.sample_status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-surface-container text-center text-outline">
              Select a patient from the list to display their clinical EMR dossier & continuous telemetry.
            </div>
          )}
        </div>
      </div>

      {/* Create Prescription Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Digital Clinical Prescription"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Patient</label>
            <select
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
              className="select"
              required
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Attending Doctor</label>
            <select
              value={formData.doctor_id}
              onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
              className="select"
              required
            >
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialty})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Diagnosis</label>
            <input
              type="text"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="input"
              placeholder="e.g. Type 2 Diabetes, Acute Bronchitis, Essential Hypertension"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Clinical Observations & Physician Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="textarea"
              rows="2"
              placeholder="Dosage instructions, diet recommendations, follow-up timeline..."
            ></textarea>
          </div>

          {/* Dynamic Medicines Rows */}
          <div className="space-y-3 pt-2 border-t border-surface-container">
            <div className="flex items-center justify-between">
              <label className="form-label mb-0">Prescribed Medications</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Drug
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="p-3 bg-surface-container-low rounded-lg space-y-2 border border-surface-container-high/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-on-surface">Medication #{index + 1}</span>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-error text-xs hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-outline block mb-1">Select Medicine</label>
                    <select
                      value={item.medicine_id}
                      onChange={(e) => handleItemChange(index, 'medicine_id', e.target.value)}
                      className="select text-xs py-1.5"
                      required
                    >
                      {medicines.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.stock_qty} in stock)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-outline block mb-1">Dosage</label>
                    <input
                      type="text"
                      value={item.dosage}
                      onChange={(e) => handleItemChange(index, 'dosage', e.target.value)}
                      className="input text-xs py-1.5"
                      placeholder="e.g. 500mg, 1 tablet"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-outline block mb-1">Frequency</label>
                    <input
                      type="text"
                      value={item.frequency}
                      onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                      className="input text-xs py-1.5"
                      placeholder="e.g. Twice daily after meals"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
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
              Issue Prescription
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
