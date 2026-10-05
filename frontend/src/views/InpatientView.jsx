import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';

export default function InpatientView() {
  const [admissions, setAdmissions] = useState([]);
  const [wardStats, setWardStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Admitted');
  const [selectedWard, setSelectedWard] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);

  const [admitForm, setAdmitForm] = useState({
    patient_id: '',
    ward_type: 'General Ward',
    room_no: 'WARD-105',
    bed_no: 'Bed-1',
    daily_rate: 80,
    attending_doctor: '',
    admission_notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [admRes, wardRes, patRes, docRes] = await Promise.all([
        api.get('/admissions', { status: statusFilter === 'all' ? '' : statusFilter }),
        api.get('/admissions/wards'),
        api.get('/patients'),
        api.get('/doctors')
      ]);

      if (admRes.success) setAdmissions(admRes.data);
      if (wardRes.success) setWardStats(wardRes);
      if (patRes.success) {
        setPatients(patRes.data);
        if (patRes.data.length > 0 && !admitForm.patient_id) {
          setAdmitForm(prev => ({ ...prev, patient_id: patRes.data[0].id }));
        }
      }
      if (docRes.success) {
        setDoctors(docRes.data);
        if (docRes.data.length > 0 && !admitForm.attending_doctor) {
          setAdmitForm(prev => ({ ...prev, attending_doctor: docRes.data[0].name }));
        }
      }
    } catch (err) {
      console.error('Error fetching admissions data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleWardChange = (ward) => {
    let rate = 80;
    let room = 'WARD-101';
    if (ward === 'ICU (Intensive Care Unit)') {
      rate = 250;
      room = 'ICU-01';
    } else if (ward === 'Pediatric Care') {
      rate = 110;
      room = 'PED-201';
    } else if (ward === 'Private Suites') {
      rate = 200;
      room = 'SUITE-401';
    }

    setAdmitForm(prev => ({
      ...prev,
      ward_type: ward,
      daily_rate: rate,
      room_no: room
    }));
  };

  const handleAdmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admissions', admitForm);
      if (res.success) {
        setIsAdmitModalOpen(false);
        setAdmitForm({
          patient_id: patients[0]?.id || '',
          ward_type: 'General Ward',
          room_no: 'WARD-105',
          bed_no: 'Bed-1',
          daily_rate: 80,
          attending_doctor: doctors[0]?.name || '',
          admission_notes: ''
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDischarge = async (admId, patientName) => {
    if (!window.confirm(`Confirm patient discharge for ${patientName}? This will calculate bed stay duration and generate final invoice.`)) return;
    try {
      const res = await api.put(`/admissions/${admId}/discharge`);
      if (res.success) {
        alert(res.message);
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const totalBeds = wardStats?.totalBeds || 67;
  const occupiedBeds = wardStats?.occupiedBeds || admissions.filter(a => a.status === 'Admitted').length;
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);
  const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : '0';

  // Filter admissions list
  const filteredAdmissions = admissions.filter(a => {
    const matchesSearch =
      (a.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.room_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.bed_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.attending_doctor || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesWard = selectedWard === 'all' || (a.ward_type || '').toLowerCase().includes(selectedWard.toLowerCase());

    return matchesSearch && matchesWard;
  });

  return (
    <div className="space-y-6">
      {/* Top Action / Context Header (from stitch inpatient_care_ward_occupancy) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-secondary font-label-md text-xs uppercase tracking-wider font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            Live Unit Telemetry • Real-Time Ward Census
          </div>
          <h1 className="font-headline-xl text-2xl md:text-3xl text-on-surface font-bold tracking-tight">
            Inpatient Care & Ward Occupancy
          </h1>
          <p className="font-body-md text-xs md:text-sm text-on-surface-variant">
            Central bed allocation matrix, continuous admission tracking, and discharge pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => setIsAdmitModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            + Admit New Patient
          </button>
        </div>
      </div>

      {/* Ward Occupancy KPI Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Beds */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                Total Hospital Beds
              </span>
              <div className="font-display-lg text-3xl font-bold text-on-surface mt-1">{totalBeds}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">hotel</span>
            </div>
          </div>
          <div className="mt-4 pt-2 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 font-label-sm text-secondary font-semibold">
              <span className="material-symbols-outlined text-[15px]">domain_verification</span>
              4 Active Wings
            </span>
            <span className="text-outline">• Full capacity rating</span>
          </div>
        </div>

        {/* Card 2: Currently Occupied */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                Currently Occupied
              </span>
              <div className="font-display-lg text-3xl font-bold text-secondary mt-1">{occupiedBeds}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[24px]">airline_seat_flat_angled</span>
            </div>
          </div>
          <div className="mt-4 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span>Occupancy load</span>
              <span className="font-label-sm font-semibold text-secondary">{occupancyRate}%</span>
            </div>
            <div className="w-full bg-surface-container-low rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-700"
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 3: Available Beds */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                Available Beds
              </span>
              <div className="font-display-lg text-3xl font-bold text-on-surface mt-1">{availableBeds}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-secondary-container/30 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[24px]">cleaning_services</span>
            </div>
          </div>
          <div className="mt-4 pt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              Ready for Intake
            </span>
            <span className="font-body-sm text-outline">Intake ready</span>
          </div>
        </div>

        {/* Card 4: Occupancy Rate */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                Occupancy Rate
              </span>
              <div className="font-display-lg text-3xl font-bold text-primary mt-1">{occupancyRate}%</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">show_chart</span>
            </div>
          </div>
          <div className="mt-4 pt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-label-sm text-secondary font-semibold">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              {parseFloat(occupancyRate) < 85 ? 'Optimal Range' : 'Surge Alert'}
            </span>
            <span className="font-body-sm text-outline">Threshold &lt; 85%</span>
          </div>
        </div>
      </div>

      {/* Departmental Ward Distribution Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-md text-base md:text-lg font-bold text-on-surface">
              Departmental Ward Distribution
            </h2>
            <p className="font-body-sm text-xs text-outline">
              Real-time availability mapped by specialized clinical wing
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-label-sm text-xs text-on-surface-variant bg-surface-container-lowest border border-surface-container px-2.5 py-1 rounded-lg shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-secondary"></span> Standard
            </span>
            <span className="inline-flex items-center gap-1.5 font-label-sm text-xs text-error bg-surface-container-lowest border border-surface-container px-2.5 py-1 rounded-lg shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-error animate-ping"></span> Critical Surge
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* General Ward */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-label-lg text-sm font-bold text-on-surface">General Ward</span>
                <span className="font-label-sm text-xs px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface font-semibold">
                  $80/day
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className="font-headline-lg text-xl font-bold text-on-surface">
                  {admissions.filter(a => a.ward_type?.toLowerCase().includes('general') && a.status === 'Admitted').length}{' '}
                  <span className="text-xs text-outline font-normal">/ 30 Beds</span>
                </div>
                <span className="font-label-sm text-xs font-semibold text-secondary">
                  {Math.round((admissions.filter(a => a.ward_type?.toLowerCase().includes('general') && a.status === 'Admitted').length / 30) * 100)}%
                </span>
              </div>
            </div>
            <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden mt-3">
              <div
                className="bg-primary h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.round((admissions.filter(a => a.ward_type?.toLowerCase().includes('general') && a.status === 'Admitted').length / 30) * 100))}%`
                }}
              ></div>
            </div>
          </div>

          {/* ICU */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-label-lg text-sm font-bold text-on-surface">ICU (Intensive Care)</span>
                <span className="font-label-sm text-xs px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface font-semibold">
                  $250/day
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className="font-headline-lg text-xl font-bold text-on-surface">
                  {admissions.filter(a => a.ward_type?.toLowerCase().includes('icu') && a.status === 'Admitted').length}{' '}
                  <span className="text-xs text-outline font-normal">/ 10 Beds</span>
                </div>
                <span className="font-label-sm text-xs font-semibold text-error">
                  {Math.round((admissions.filter(a => a.ward_type?.toLowerCase().includes('icu') && a.status === 'Admitted').length / 10) * 100)}%
                </span>
              </div>
            </div>
            <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden mt-3">
              <div
                className="bg-error h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.round((admissions.filter(a => a.ward_type?.toLowerCase().includes('icu') && a.status === 'Admitted').length / 10) * 100))}%`
                }}
              ></div>
            </div>
          </div>

          {/* Pediatric Care */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-label-lg text-sm font-bold text-on-surface">Pediatric Care</span>
                <span className="font-label-sm text-xs px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface font-semibold">
                  $110/day
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className="font-headline-lg text-xl font-bold text-on-surface">
                  {admissions.filter(a => a.ward_type?.toLowerCase().includes('pediatric') && a.status === 'Admitted').length}{' '}
                  <span className="text-xs text-outline font-normal">/ 15 Beds</span>
                </div>
                <span className="font-label-sm text-xs font-semibold text-secondary">
                  {Math.round((admissions.filter(a => a.ward_type?.toLowerCase().includes('pediatric') && a.status === 'Admitted').length / 15) * 100)}%
                </span>
              </div>
            </div>
            <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden mt-3">
              <div
                className="bg-secondary h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.round((admissions.filter(a => a.ward_type?.toLowerCase().includes('pediatric') && a.status === 'Admitted').length / 15) * 100))}%`
                }}
              ></div>
            </div>
          </div>

          {/* Private Suites */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-label-lg text-sm font-bold text-on-surface">Private Suites</span>
                <span className="font-label-sm text-xs px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface font-semibold">
                  $200/day
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className="font-headline-lg text-xl font-bold text-on-surface">
                  {admissions.filter(a => a.ward_type?.toLowerCase().includes('private') && a.status === 'Admitted').length}{' '}
                  <span className="text-xs text-outline font-normal">/ 12 Beds</span>
                </div>
                <span className="font-label-sm text-xs font-semibold text-primary">
                  {Math.round((admissions.filter(a => a.ward_type?.toLowerCase().includes('private') && a.status === 'Admitted').length / 12) * 100)}%
                </span>
              </div>
            </div>
            <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden mt-3">
              <div
                className="bg-primary-container h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.round((admissions.filter(a => a.ward_type?.toLowerCase().includes('private') && a.status === 'Admitted').length / 12) * 100))}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Admissions Worklist Container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
        {/* Controls / Filter Bar */}
        <div className="p-4 md:p-5 border-b border-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-low/30">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search inpatient by name, room, or bed (e.g. WARD-105)..."
              className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest rounded-lg font-body-sm text-xs md:text-sm text-on-surface placeholder:text-outline border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Status Tabs */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-surface-container-high/40">
              <button
                type="button"
                onClick={() => setStatusFilter('Admitted')}
                className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'Admitted'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Admitted
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Discharged')}
                className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'Discharged'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Discharged
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All Status
              </button>
            </div>

            {/* Ward Selector Dropdown */}
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="px-3 py-1.5 bg-surface-container-low rounded-lg font-label-sm text-xs font-semibold text-on-surface border border-surface-container-high/40 outline-none cursor-pointer"
            >
              <option value="all">All Ward Types</option>
              <option value="general">General Ward</option>
              <option value="icu">ICU</option>
              <option value="pediatric">Pediatric Care</option>
              <option value="private">Private Suites</option>
            </select>
          </div>
        </div>

        {/* Admissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-surface-container-low/70 h-10">
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Adm ID</th>
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Patient Information</th>
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Ward & Room</th>
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Attending Doctor</th>
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Admitted Date</th>
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Daily Rate</th>
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Status</th>
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container font-body-sm text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-outline">
                    Loading inpatient census and bed assignments...
                  </td>
                </tr>
              ) : filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-outline">
                    No inpatient admission records match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map(adm => (
                  <tr key={adm.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-primary">
                      Admission
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-secondary-container text-secondary flex items-center justify-center font-bold text-xs shrink-0">
                          {adm.patient_name ? adm.patient_name.charAt(0) : 'P'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface">{adm.patient_name}</span>
                          <span className="text-[11px] text-outline">{adm.admission_notes || 'Clinical observation'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{adm.ward_type}</span>
                        <span className="text-[11px] text-outline font-mono">
                          {adm.room_no} • {adm.bed_no}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-on-surface-variant font-medium">
                      {adm.attending_doctor || 'Attending Staff'}
                    </td>
                    <td className="px-4 py-3.5 text-outline text-xs whitespace-nowrap">
                      {new Date(adm.admitted_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-medium text-on-surface">
                      ${adm.daily_rate}/day
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          adm.status === 'Admitted'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            adm.status === 'Admitted' ? 'bg-secondary animate-pulse' : 'bg-outline'
                          }`}
                        ></span>
                        {adm.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {adm.status === 'Admitted' ? (
                        <button
                          onClick={() => handleDischarge(adm.id, adm.patient_name)}
                          className="px-3 py-1.5 rounded-lg bg-surface-container text-error hover:bg-error hover:text-on-error font-label-sm text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1 border border-error/20"
                          title="Discharge patient & finalize room billing"
                        >
                          <span className="material-symbols-outlined text-[15px]">logout</span>
                          Discharge
                        </button>
                      ) : (
                        <span className="text-outline text-xs italic">
                          Discharged {adm.discharged_at ? new Date(adm.discharged_at).toLocaleDateString() : ''}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admit Patient Modal */}
      <Modal
        isOpen={isAdmitModalOpen}
        onClose={() => setIsAdmitModalOpen(false)}
        title="Inpatient Ward Admission & Bed Allocation"
      >
        <form onSubmit={handleAdmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Select Patient</label>
            <select
              value={admitForm.patient_id}
              onChange={(e) => setAdmitForm({ ...admitForm, patient_id: e.target.value })}
              className="select"
              required
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} - {p.gender}, {p.contact}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ward Wing</label>
              <select
                value={admitForm.ward_type}
                onChange={(e) => handleWardChange(e.target.value)}
                className="select"
                required
              >
                <option value="General Ward">General Ward ($80/day)</option>
                <option value="ICU (Intensive Care Unit)">ICU (Intensive Care Unit) ($250/day)</option>
                <option value="Pediatric Care">Pediatric Care ($110/day)</option>
                <option value="Private Suites">Private Suites ($200/day)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Daily Bed Rate ($)</label>
              <input
                type="number"
                value={admitForm.daily_rate}
                onChange={(e) => setAdmitForm({ ...admitForm, daily_rate: parseFloat(e.target.value) || 0 })}
                className="input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Room Number</label>
              <input
                type="text"
                value={admitForm.room_no}
                onChange={(e) => setAdmitForm({ ...admitForm, room_no: e.target.value })}
                className="input"
                placeholder="e.g. WARD-105"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bed Identifier</label>
              <input
                type="text"
                value={admitForm.bed_no}
                onChange={(e) => setAdmitForm({ ...admitForm, bed_no: e.target.value })}
                className="input"
                placeholder="e.g. Bed-1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Attending Physician / Doctor</label>
            <select
              value={admitForm.attending_doctor}
              onChange={(e) => setAdmitForm({ ...admitForm, attending_doctor: e.target.value })}
              className="select"
            >
              {doctors.map(d => (
                <option key={d.id} value={d.name}>
                  {d.name} ({d.specialty})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Clinical Admission Notes</label>
            <textarea
              value={admitForm.admission_notes}
              onChange={(e) => setAdmitForm({ ...admitForm, admission_notes: e.target.value })}
              className="textarea"
              rows="3"
              placeholder="Diagnosis reason for admission, continuous monitoring parameters, allergy alerts..."
            ></textarea>
          </div>

          <div className="modal-footer px-0 pb-0">
            <button
              type="button"
              onClick={() => setIsAdmitModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Bed Allocation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
