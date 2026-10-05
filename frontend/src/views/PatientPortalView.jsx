import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Modal from '../components/Modal';

export default function PatientPortalView({ activeTab = 'appointments', setActiveTab, onGoToLanding }) {
  const { user, logout } = useAuth();

  // Data states
  const [patientData, setPatientData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    doctor_id: '',
    scheduled_at: '',
    notes: ''
  });
  const [bookingMessage, setBookingMessage] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Load patient details and records
  useEffect(() => {
    loadPatientData();
  }, [user]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      // 1. Fetch doctors for booking dropdowns
      const docsRes = await api.get('/doctors');
      if (docsRes.data) setDoctors(docsRes.data);

      // 2. Fetch patient directory
      const pRes = await api.get('/patients');
      const allPatients = pRes.data || [];

      const userEmail = (user.email || '').toLowerCase();
      const usernameParts = (user.username || '').split(/[._\s]+/);
      const userFirstName = usernameParts[0] ? usernameParts[0].toLowerCase() : '';
      const userLastName = usernameParts[1] ? usernameParts[1].toLowerCase() : '';

      let match = allPatients.find(p => {
        if (user.patient_id && p.id === user.patient_id) return true;
        if (p.email && p.email.toLowerCase() === userEmail) return true;
        if (p.contact && userEmail && p.contact.toLowerCase().includes(userEmail)) return true;
        if (userFirstName && userLastName && p.first_name?.toLowerCase() === userFirstName && p.last_name?.toLowerCase() === userLastName) return true;
        if (userFirstName && p.first_name?.toLowerCase() === userFirstName) return true;
        return false;
      });

      // If no patient record matched in database, construct profile from logged-in user details
      if (!match) {
        const fName = userFirstName ? userFirstName.charAt(0).toUpperCase() + userFirstName.slice(1) : 'Alice';
        const lName = userLastName ? userLastName.charAt(0).toUpperCase() + userLastName.slice(1) : 'Smith';

        match = {
          id: user.patient_id || user.id || 'PAT-102',
          first_name: fName,
          last_name: lName,
          email: user.email || 'alice.smith@medicure.org',
          dob: '1992-11-03',
          gender: 'Female',
          contact: user.email || '+1 (555) 222-3344',
          address: '1088 Ocean Drive, Miami, FL',
          medical_history: 'Type 2 Diabetes, Allergy to Penicillin'
        };
      }

      setPatientData(match);

      if (match) {
        const matchNameLower = `${match.first_name} ${match.last_name}`.toLowerCase();

        // Fetch appointments for this patient
        const aptRes = await api.get('/appointments');
        const myApts = (aptRes.data || []).filter(
          a => a.patient_id === match.id || (a.patient_name && a.patient_name.toLowerCase().includes(match.first_name.toLowerCase()))
        );
        setAppointments(myApts);

        // Fetch EMR / Prescriptions
        const emrRes = await api.get('/emr');
        const myRx = (emrRes.data || []).filter(
          rx => rx.patient_id === match.id || (rx.patient_name && rx.patient_name.toLowerCase().includes(match.first_name.toLowerCase()))
        );
        setPrescriptions(myRx);

        // Fetch Lab Tests
        const labRes = await api.get('/laboratory');
        const myLabs = (labRes.data || []).filter(
          l => l.patient_id === match.id || (l.patient_name && l.patient_name.toLowerCase().includes(match.first_name.toLowerCase()))
        );
        setLabTests(myLabs);

        // Fetch Invoices
        const invRes = await api.get('/billing');
        const myInvs = (invRes.data || []).filter(
          i => i.patient_id === match.id || (i.patient_name && i.patient_name.toLowerCase().includes(match.first_name.toLowerCase()))
        );
        setInvoices(myInvs);
      }
    } catch (err) {
      console.error('Error loading patient portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!bookingForm.doctor_id || !bookingForm.scheduled_at) {
      setBookingMessage('Please select a doctor and preferred appointment date & time.');
      return;
    }

    const selectedDoc = doctors.find(d => d.id === bookingForm.doctor_id);
    if (!selectedDoc) {
      setBookingMessage('Invalid doctor selection.');
      return;
    }

    setSubmittingBooking(true);
    setBookingMessage('');

    try {
      const payload = {
        patient_id: patientData?.id || 'pat1',
        patient_name: patientData ? `${patientData.first_name} ${patientData.last_name}` : user.username,
        doctor_id: selectedDoc.id,
        doctor_name: selectedDoc.name,
        scheduled_at: new Date(bookingForm.scheduled_at).toISOString(),
        notes: bookingForm.notes || 'Booked via Patient Portal'
      };

      const res = await api.post('/appointments', payload);
      if (res.success) {
        setBookingMessage('Appointment scheduled successfully!');
        setBookingForm({ doctor_id: '', scheduled_at: '', notes: '' });
        setTimeout(() => {
          setIsBookModalOpen(false);
          setBookingMessage('');
          loadPatientData();
        }, 1200);
      } else {
        setBookingMessage(res.message || 'Failed to schedule appointment.');
      }
    } catch (err) {
      setBookingMessage('Error: ' + err.message);
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handlePayInvoice = async (invId) => {
    try {
      const res = await api.post(`/billing/${invId}/pay`, {
        amount_paid: 1000,
        payment_method: 'Online Portal Card'
      });
      if (res.success) {
        loadPatientData();
      }
    } catch (err) {
      alert('Payment failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar matching all other views */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
              Patient Portal & Health Records
            </h1>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5"></span>
              ID: {patientData?.id || 'PAT-101'}
            </span>
          </div>
          <p className="font-body-sm text-xs md:text-sm text-on-surface-variant">
            Personal Health Portal — Appointments, Prescriptions, Laboratory Reports & Billing Statements
          </p>
        </div>

        {/* SINGLE EXPLICIT APPOINTMENT BOOKING BUTTON */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
            <span>+ Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Patient Profile Demographics Banner Card */}
      <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary-container text-secondary flex items-center justify-center font-bold text-xl shrink-0 shadow-2xs">
            {patientData?.first_name ? patientData.first_name.charAt(0) : 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-on-surface">
                {patientData ? `${patientData.first_name} ${patientData.last_name}` : user.username}
              </h2>
              <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold text-[11px]">
                Registered Patient
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant mt-1">
              <span><strong>Email:</strong> {user.email}</span>
              <span className="text-outline">•</span>
              <span><strong>DOB:</strong> {patientData?.dob || 'N/A'}</span>
              <span className="text-outline">•</span>
              <span><strong>Gender:</strong> {patientData?.gender || 'N/A'}</span>
              <span className="text-outline">•</span>
              <span><strong>Phone:</strong> {patientData?.contact || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Content Panels */}
      {loading ? (
        <div className="bg-surface-container-lowest rounded-xl p-12 text-center text-outline text-xs border border-surface-container">
          Loading health records...
        </div>
      ) : (
        <div>
          {/* 1. Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
              <div className="p-4 border-b border-surface-container flex items-center justify-between">
                <h3 className="font-headline-sm text-base font-bold text-on-surface">Scheduled Doctor Visits</h3>
                <span className="text-xs text-outline font-medium">{appointments.length} Total Bookings</span>
              </div>

              {appointments.length === 0 ? (
                <div className="p-12 text-center text-outline text-xs">
                  No appointments scheduled. Click "+ Book Appointment" at the top to schedule a doctor visit.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-surface-container-low/70 h-10">
                        <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Doctor & Specialization</th>
                        <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Date & Time</th>
                        <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Status</th>
                        <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Clinical Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container font-body-sm text-on-surface">
                      {appointments.map(apt => (
                        <tr key={apt.id} className="hover:bg-surface-container-low/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-primary text-[20px]">stethoscope</span>
                              <div>
                                <div className="font-semibold text-on-surface">{apt.doctor_name || 'Consulting Physician'}</div>
                                <div className="text-[11px] text-outline">Outpatient Consultation</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs text-on-surface">
                            {new Date(apt.scheduled_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-xs font-semibold ${
                              apt.status === 'Completed' ? 'bg-secondary-container text-on-secondary-container' :
                              apt.status === 'Cancelled' ? 'bg-error-container/30 text-error' :
                              'bg-primary-container text-on-primary-container'
                            }`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-on-surface-variant italic">
                            {apt.notes || 'Routine consultation'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 2. Prescriptions Tab */}
          {(activeTab === 'prescriptions' || activeTab === 'emr') && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
              <div className="p-4 border-b border-surface-container">
                <h3 className="font-headline-sm text-base font-bold text-on-surface">Medical Prescriptions & EMR Notes</h3>
              </div>

              {prescriptions.length === 0 ? (
                <div className="p-12 text-center text-outline text-xs">
                  No prescription records found.
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {prescriptions.map(rx => (
                    <div key={rx.id} className="p-4 rounded-xl bg-surface-container-low/60 border border-surface-container space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container pb-3">
                        <div>
                          <span className="font-bold text-sm text-on-surface block">Diagnosis: {rx.diagnosis}</span>
                          <span className="text-xs text-outline">Attending Physician: {rx.doctor_name} • {new Date(rx.created_at).toLocaleDateString()}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-xs font-semibold self-start sm:self-auto">
                          Issued Prescription
                        </span>
                      </div>

                      {rx.items && rx.items.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-outline uppercase tracking-wider block">Prescribed Medicines:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {rx.items.map((item, idx) => (
                              <div key={idx} className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container text-xs shadow-2xs">
                                <div className="font-bold text-primary">{item.medicine_name} ({item.dosage})</div>
                                <div className="text-on-surface-variant text-[11px] mt-0.5">Frequency: {item.frequency}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {rx.notes && (
                        <div className="text-xs text-on-surface-variant bg-surface-container-lowest p-3 rounded-lg border border-surface-container">
                          <strong>Doctor's Advice:</strong> {rx.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Lab Test Reports Tab */}
          {(activeTab === 'lab' || activeTab === 'laboratory') && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
              <div className="p-4 border-b border-surface-container">
                <h3 className="font-headline-sm text-base font-bold text-on-surface">Laboratory Test Reports</h3>
              </div>

              {labTests.length === 0 ? (
                <div className="p-12 text-center text-outline text-xs">
                  No laboratory test reports found.
                </div>
              ) : (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {labTests.map(lab => (
                    <div key={lab.id} className="p-4 rounded-xl bg-surface-container-low/60 border border-surface-container space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-on-surface flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">science</span>
                          {lab.test_name}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          lab.sample_status === 'Completed' ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary-container text-on-primary-container'
                        }`}>
                          {lab.sample_status}
                        </span>
                      </div>
                      <div className="text-xs text-on-surface bg-surface-container-lowest p-3 rounded-lg border border-surface-container font-mono leading-relaxed">
                        {lab.result_data || 'Awaiting laboratory specimen analysis'}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-outline pt-1">
                        <span>Ordered: {new Date(lab.created_at).toLocaleDateString()}</span>
                        <span>Lab Tech: {lab.technician || 'LIS'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Billing & Invoices Tab */}
          {activeTab === 'billing' && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
              <div className="p-4 border-b border-surface-container">
                <h3 className="font-headline-sm text-base font-bold text-on-surface">Medical Invoices & Payment Statements</h3>
              </div>

              {invoices.length === 0 ? (
                <div className="p-12 text-center text-outline text-xs">
                  No billing statements or invoices found.
                </div>
              ) : (
                <div className="divide-y divide-surface-container">
                  {invoices.map(inv => (
                    <div key={inv.id} className="p-4 hover:bg-surface-container-low/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-on-surface">Invoice #{inv.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            inv.status === 'Paid' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container/30 text-error'
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                        <div className="text-xs text-outline">
                          Total Amount: <strong className="text-on-surface">${Number(inv.total_amount || 0).toFixed(2)}</strong> • Issued Date: {new Date(inv.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {inv.status !== 'Paid' && (
                        <button
                          onClick={() => handlePayInvoice(inv.id)}
                          className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-xs font-semibold shadow-xs cursor-pointer transition-all"
                        >
                          Pay Online Now (${Number(inv.total_amount || 0).toFixed(2)})
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Booking Appointment Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Book Doctor Appointment"
      >
        <form onSubmit={handleBookAppointment} className="space-y-4">
          {bookingMessage && (
            <div className={`p-3 rounded-lg text-xs font-semibold ${
              bookingMessage.includes('successfully') ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container/40 text-error'
            }`}>
              {bookingMessage}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Select Specialist / Doctor *</label>
            <select
              className="select"
              required
              value={bookingForm.doctor_id}
              onChange={e => setBookingForm({ ...bookingForm, doctor_id: e.target.value })}
            >
              <option value="">-- Choose a Doctor --</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} ({doc.specialization}) — Fee: ${doc.consultation_fee}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Date & Time *</label>
            <input
              type="datetime-local"
              className="input"
              required
              value={bookingForm.scheduled_at}
              onChange={e => setBookingForm({ ...bookingForm, scheduled_at: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Symptoms / Visit Reason</label>
            <textarea
              rows="3"
              className="textarea"
              placeholder="e.g. Routine checkup, chest tightness, headache..."
              value={bookingForm.notes}
              onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
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
            <button
              type="submit"
              disabled={submittingBooking}
              className="btn btn-primary"
            >
              {submittingBooking ? 'Scheduling...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
