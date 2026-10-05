import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function AppointmentsView() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { currentRole } = useAuth();
  const canBook = ['Administrator', 'Receptionist'].includes(currentRole);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [reschedulingApt, setReschedulingApt] = useState(null);

  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    scheduled_at: '',
    notes: ''
  });

  const [rescheduleData, setRescheduleData] = useState({
    scheduled_at: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aptRes, patRes, docRes] = await Promise.all([
        api.get('/appointments', { status: statusFilter }),
        api.get('/patients'),
        api.get('/doctors')
      ]);

      if (aptRes.success) setAppointments(aptRes.data);
      if (patRes.success) {
        setPatients(patRes.data);
        if (patRes.data.length > 0 && !formData.patient_id) {
          setFormData(prev => ({ ...prev, patient_id: patRes.data[0].id }));
        }
      }
      if (docRes.success) {
        setDoctors(docRes.data);
        if (docRes.data.length > 0 && !formData.doctor_id) {
          setFormData(prev => ({ ...prev, doctor_id: docRes.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/appointments', formData);
      if (res.success) {
        setIsBookModalOpen(false);
        setFormData({
          patient_id: patients[0]?.id || '',
          doctor_id: doctors[0]?.id || '',
          scheduled_at: '',
          notes: ''
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/appointments/${reschedulingApt.id}/reschedule`, rescheduleData);
      if (res.success) {
        setReschedulingApt(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const openRescheduleModal = (apt) => {
    setReschedulingApt(apt);
    setRescheduleData({
      scheduled_at: apt.scheduled_at ? apt.scheduled_at.slice(0, 16) : '',
      notes: apt.notes || ''
    });
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/appointments/${id}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const scheduledCount = appointments.filter(a => a.status === 'Scheduled').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'Cancelled').length;

  const filteredAppointments = appointments.filter(a => {
    const q = searchTerm.toLowerCase();
    return (
      (a.patient_name || '').toLowerCase().includes(q) ||
      (a.doctor_name || '').toLowerCase().includes(q) ||
      (a.id || '').toLowerCase().includes(q) ||
      (a.notes || '').toLowerCase().includes(q)
    );
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      {/* Top Action & Statistics Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
              Appointment Scheduling Desk
            </h1>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5"></span>
              {scheduledCount} Active Bookings
            </span>
          </div>
          <p className="font-body-sm text-xs md:text-sm text-on-surface-variant">
            Outpatient & Inpatient Specialist Consultations, Clinic Availability & Slot Booking
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* List vs Calendar Toggle */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-surface-container-high/40">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">view_list</span>
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
              Calendar Rota
            </button>
          </div>

          {canBook && (
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
              <span>+ Book Consultation</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container relative overflow-hidden flex items-center justify-between">
          <div>
            <span className="font-label-sm text-xs text-outline uppercase font-semibold">Scheduled Appointments</span>
            <div className="font-headline-lg text-2xl font-bold text-on-surface mt-1">{scheduledCount}</div>
            <span className="text-xs text-primary font-medium">Awaiting consultation</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">event_available</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container relative overflow-hidden flex items-center justify-between">
          <div>
            <span className="font-label-sm text-xs text-outline uppercase font-semibold">Completed Consults</span>
            <div className="font-headline-lg text-2xl font-bold text-secondary mt-1">{completedCount}</div>
            <span className="text-xs text-secondary font-medium">Discharged / Prescribed</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container relative overflow-hidden flex items-center justify-between">
          <div>
            <span className="font-label-sm text-xs text-outline uppercase font-semibold">Cancelled / No-Show</span>
            <div className="font-headline-lg text-2xl font-bold text-error mt-1">{cancelledCount}</div>
            <span className="text-xs text-outline font-medium">Available for slot re-booking</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-error-container/30 flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-[24px]">event_busy</span>
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
            placeholder="Search appointments by patient, doctor, or ID..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-lg font-body-sm text-xs md:text-sm text-on-surface placeholder:text-outline border border-transparent focus:border-secondary focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
          />
        </div>

        <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-surface-container-high/40 w-full md:w-auto overflow-x-auto">
          {['', 'Scheduled', 'Completed', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {st === '' ? 'All Appointments' : st}
            </button>
          ))}
        </div>
      </div>

      {/* View Mode 1: Calendar Rota */}
      {viewMode === 'calendar' && (
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container space-y-4">
          <div className="flex items-center justify-between border-b border-surface-container pb-3">
            <h3 className="font-headline-sm text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
              Weekly Consultation Calendar Rota
            </h3>
            <span className="text-xs text-outline">Clinical schedule by day</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {daysOfWeek.map((day, idx) => {
              const dayApts = appointments.filter((_, i) => i % 7 === idx);
              return (
                <div
                  key={day}
                  className="bg-surface-container-low/60 rounded-xl p-3 border border-surface-container-high/40 flex flex-col min-h-[180px]"
                >
                  <div className="font-bold text-xs text-primary mb-2 border-b border-surface-container-high/40 pb-1 flex items-center justify-between">
                    <span>{day.slice(0, 3)}</span>
                    <span className="text-[10px] text-outline">{dayApts.length} consults</span>
                  </div>
                  <div className="space-y-2 flex-1">
                    {dayApts.map(apt => (
                      <div
                        key={apt.id}
                        className="bg-surface-container-lowest p-2 rounded-lg border border-surface-container text-xs shadow-2xs space-y-1"
                      >
                        <div className="font-semibold text-on-surface truncate">{apt.patient_name}</div>
                        <div className="text-[11px] text-outline truncate">{apt.doctor_name}</div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-secondary font-mono">
                            {new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[9px] font-semibold ${
                              apt.status === 'Completed'
                                ? 'bg-secondary-container text-on-secondary-container'
                                : apt.status === 'Cancelled'
                                ? 'bg-error-container text-on-error-container'
                                : 'bg-primary-container/20 text-primary'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {dayApts.length === 0 && (
                      <div className="text-center py-6 text-outline text-[11px]">
                        No bookings
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View Mode 2: List View Table */}
      {viewMode === 'list' && (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-surface-container-low/70 h-10">
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Apt ID</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Patient Information</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Assigned Physician</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Scheduled Date & Time</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Consultation Reason</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Status</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-body-sm text-on-surface">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-outline">
                      Loading scheduled consultations...
                    </td>
                  </tr>
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-outline">
                      No appointments recorded under this view filter.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map(apt => (
                    <tr key={apt.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-primary">
                        Appt
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-secondary-container text-secondary flex items-center justify-center font-bold text-xs shrink-0">
                            {apt.patient_name ? apt.patient_name.charAt(0) : 'P'}
                          </div>
                          <span className="font-semibold text-on-surface">{apt.patient_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-on-surface-variant font-medium">
                        {apt.doctor_name}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-outline whitespace-nowrap">
                        {new Date(apt.scheduled_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-on-surface-variant max-w-[200px] truncate">
                        {apt.notes || 'Routine Clinical Follow-up'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            apt.status === 'Completed'
                              ? 'bg-secondary-container text-on-secondary-container'
                              : apt.status === 'Cancelled'
                              ? 'bg-error-container text-on-error-container'
                              : 'bg-primary-container/20 text-primary'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              apt.status === 'Completed'
                                ? 'bg-secondary'
                                : apt.status === 'Cancelled'
                                ? 'bg-error'
                                : 'bg-primary animate-pulse'
                            }`}
                          ></span>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {apt.status === 'Scheduled' && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleStatusChange(apt.id, 'Completed')}
                              className="px-2.5 py-1 rounded-md bg-secondary-container/40 text-secondary hover:bg-secondary-container font-label-sm text-xs font-semibold transition-all cursor-pointer"
                              title="Mark Consult Completed"
                            >
                              Done
                            </button>
                            <button
                              onClick={() => openRescheduleModal(apt)}
                              className="px-2.5 py-1 rounded-md bg-surface-container-low text-primary hover:bg-surface-container font-label-sm text-xs font-semibold transition-all border border-surface-container-high/40 cursor-pointer"
                              title="Reschedule"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleStatusChange(apt.id, 'Cancelled')}
                              className="p-1 rounded-md bg-surface-container-low text-error hover:bg-error-container transition-all cursor-pointer"
                              title="Cancel Appointment"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule Patient Consultation"
      >
        <form onSubmit={handleBook} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Select Patient</label>
            <select
              className="select"
              required
              value={formData.patient_id}
              onChange={e => setFormData({ ...formData, patient_id: e.target.value })}
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} ({p.contact})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Specialist / Doctor</label>
            <select
              className="select"
              required
              value={formData.doctor_id}
              onChange={e => setFormData({ ...formData, doctor_id: e.target.value })}
            >
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialty} (${d.consultation_fee})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Consultation Date & Time</label>
            <input
              type="datetime-local"
              className="input"
              required
              value={formData.scheduled_at}
              onChange={e => setFormData({ ...formData, scheduled_at: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Consultation Reason / Chief Complaint</label>
            <textarea
              className="textarea"
              rows="3"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Follow-up regarding blood pressure medication, chest tightness review..."
            />
          </div>

          <div className="modal-footer px-0 pb-0">
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Booking
            </button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      {reschedulingApt && (
        <Modal
          isOpen={!!reschedulingApt}
          onClose={() => setReschedulingApt(null)}
          title={`Reschedule Appointment — ${reschedulingApt.patient_name}`}
        >
          <form onSubmit={handleRescheduleSubmit} className="space-y-4">
            <div className="p-3 bg-surface-container-low rounded-lg text-xs space-y-1">
              <div><strong>Doctor:</strong> {reschedulingApt.doctor_name}</div>
              <div><strong>Current Slot:</strong> {reschedulingApt.scheduled_at ? new Date(reschedulingApt.scheduled_at).toLocaleString() : ''}</div>
            </div>

            <div className="form-group">
              <label className="form-label">New Appointment Slot</label>
              <input
                type="datetime-local"
                className="input"
                required
                value={rescheduleData.scheduled_at}
                onChange={e => setRescheduleData({ ...rescheduleData, scheduled_at: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rescheduling Reason / Notes</label>
              <textarea
                className="textarea"
                rows="2"
                value={rescheduleData.notes}
                onChange={e => setRescheduleData({ ...rescheduleData, notes: e.target.value })}
                placeholder="Reason for slot shift"
              />
            </div>

            <div className="modal-footer px-0 pb-0">
              <button
                type="button"
                onClick={() => setReschedulingApt(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update Schedule
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
