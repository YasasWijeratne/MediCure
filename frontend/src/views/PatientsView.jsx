import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function PatientsView() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [historyModalData, setHistoryModalData] = useState(null);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const { currentRole } = useAuth();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    gender: 'Male',
    contact: '',
    address: '',
    medical_history: ''
  });

  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    gender: 'Male',
    contact: '',
    address: '',
    medical_history: ''
  });

  const [docFormData, setDocFormData] = useState({
    title: '',
    category: 'Lab Report'
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patients', { search });
      if (res.success) {
        setPatients(res.data);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/patients', formData);
      if (res.success) {
        setIsAddModalOpen(false);
        setFormData({
          first_name: '',
          last_name: '',
          dob: '',
          gender: 'Male',
          contact: '',
          address: '',
          medical_history: ''
        });
        fetchPatients();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/patients/${editingPatient.id}`, editFormData);
      if (res.success) {
        setEditingPatient(null);
        fetchPatients();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setEditFormData({
      first_name: patient.first_name,
      last_name: patient.last_name,
      dob: patient.dob,
      gender: patient.gender,
      contact: patient.contact,
      address: patient.address || '',
      medical_history: patient.medical_history || ''
    });
  };

  const handleViewHistory = async (patientId) => {
    try {
      const res = await api.get(`/patients/${patientId}`);
      if (res.success) {
        setHistoryModalData(res.data);
      }
    } catch (err) {
      console.error('Error loading patient detail:', err);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/patients/${historyModalData.id}/documents`, docFormData);
      if (res.success) {
        setIsUploadDocOpen(false);
        setDocFormData({ title: '', category: 'Lab Report' });
        handleViewHistory(historyModalData.id);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove the medical record for ${name}?`)) return;
    try {
      await api.delete(`/patients/${id}`);
      fetchPatients();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredPatients = patients.filter(p => {
    if (genderFilter === 'all') return true;
    return (p.gender || '').toLowerCase() === genderFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Top Action & Statistics Header Bar (from patient_management_emr) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
              Patient Directory & Profiles
            </h1>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5"></span>
              {patients.length} Registered Patients
            </span>
          </div>
          <p className="font-body-sm text-xs md:text-sm text-on-surface-variant">
            Centralized Patient Demographic Directory, Medical History & Clinical Documents
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {['Administrator', 'Receptionist'].includes(currentRole) && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span>+ Register New Patient</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Live Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-lg">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, contact number, or ID (e.g. PAT-1042)..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-lg font-body-sm text-xs md:text-sm text-on-surface placeholder:text-outline border border-transparent focus:border-secondary focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-surface-container-high/40">
            <button
              type="button"
              onClick={() => setGenderFilter('all')}
              className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all cursor-pointer ${
                genderFilter === 'all'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All Genders
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter('Male')}
              className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all cursor-pointer ${
                genderFilter === 'Male'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter('Female')}
              className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all cursor-pointer ${
                genderFilter === 'Female'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Female
            </button>
          </div>
        </div>
      </div>

      {/* Patients Data Table Container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-surface-container-low/70 h-10">
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Patient ID</th>
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Full Name & Location</th>
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Age / Sex</th>
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Contact</th>
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Clinical Alerts / Allergy</th>
                <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container font-body-sm text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-outline">
                    Loading registered patient directory...
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-outline">
                    No patient records found matching your query.
                  </td>
                </tr>
              ) : (
                filteredPatients.map(p => {
                  const birthYear = p.dob ? parseInt(p.dob.split('-')[0]) : 1985;
                  const approxAge = isNaN(birthYear) ? '' : `${new Date().getFullYear() - birthYear} yrs`;

                  return (
                    <tr key={p.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-primary">
                        Patient
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary-container text-secondary flex items-center justify-center font-bold text-xs shrink-0">
                            {p.first_name ? p.first_name.charAt(0) : 'P'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-on-surface">
                              {p.first_name} {p.last_name}
                            </span>
                            <span className="text-[11px] text-outline truncate max-w-[220px]">
                              {p.address || 'No residential address recorded'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-medium text-on-surface">{approxAge || 'N/A'}</span>
                        <span className="text-outline text-xs"> / {p.gender}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-on-surface">
                        {p.contact}
                      </td>
                      <td className="px-4 py-3.5">
                        {p.medical_history ? (
                          <div className="flex flex-wrap gap-1">
                            {p.medical_history.split(',').map((cond, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-[10px] font-semibold"
                              >
                                {cond.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-outline italic">No known allergies</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleViewHistory(p.id)}
                            className="p-1.5 rounded-lg bg-surface-container-low hover:bg-secondary-container hover:text-on-secondary-container text-on-surface-variant transition-all cursor-pointer"
                            title="Inspect Medical Dossier & Documents"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-all cursor-pointer"
                            title="Edit Patient Details"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, `${p.first_name} ${p.last_name}`)}
                            className="p-1.5 rounded-lg bg-surface-container-low hover:bg-error-container hover:text-on-error-container text-error transition-all cursor-pointer"
                            title="Delete Patient Record"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
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

      {/* Register New Patient Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Patient Profile"
      >
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="input"
                required
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="e.g. Eleanor"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="input"
                required
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="e.g. Vance"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input
                type="date"
                className="input"
                required
                value={formData.dob}
                onChange={e => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="select"
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contact Phone Number *</label>
            <input
              type="text"
              className="input"
              required
              value={formData.contact}
              onChange={e => setFormData({ ...formData, contact: e.target.value })}
              placeholder="+1 (555) 000-1234"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <input
              type="text"
              className="input"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 742 Evergreen Terr, Springfield"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Known Allergies & Pre-existing Conditions</label>
            <textarea
              className="textarea"
              rows="3"
              value={formData.medical_history}
              onChange={e => setFormData({ ...formData, medical_history: e.target.value })}
              placeholder="e.g. Asthma, Penicillin allergy, Hypertension (comma-separated)..."
            />
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
              Enroll Patient
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Patient Modal */}
      {editingPatient && (
        <Modal
          isOpen={!!editingPatient}
          onClose={() => setEditingPatient(null)}
          title={`Edit Patient — ${editingPatient.first_name} ${editingPatient.last_name}`}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={editFormData.first_name}
                  onChange={e => setEditFormData({ ...editFormData, first_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={editFormData.last_name}
                  onChange={e => setEditFormData({ ...editFormData, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="input"
                  value={editFormData.dob}
                  onChange={e => setEditFormData({ ...editFormData, dob: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="select"
                  value={editFormData.gender}
                  onChange={e => setEditFormData({ ...editFormData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="input"
                value={editFormData.contact}
                onChange={e => setEditFormData({ ...editFormData, contact: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="input"
                value={editFormData.address}
                onChange={e => setEditFormData({ ...editFormData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Medical History / Allergies</label>
              <textarea
                className="textarea"
                rows="3"
                value={editFormData.medical_history}
                onChange={e => setEditFormData({ ...editFormData, medical_history: e.target.value })}
              />
            </div>

            <div className="modal-footer px-0 pb-0">
              <button
                type="button"
                onClick={() => setEditingPatient(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update Record
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Patient Clinical Dossier & Document Modal */}
      {historyModalData && (
        <Modal
          isOpen={!!historyModalData}
          onClose={() => setHistoryModalData(null)}
          title={`Clinical Dossier — ${historyModalData.first_name} ${historyModalData.last_name}`}
        >
          <div className="space-y-4 text-xs md:text-sm">
            {/* Header Demographic Bar */}
            <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-high/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-sm">
                    {historyModalData.first_name ? historyModalData.first_name.charAt(0) : 'P'}
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface font-headline-sm text-base">
                      {historyModalData.first_name} {historyModalData.last_name}
                    </h3>
                    <span className="font-mono text-primary text-xs font-semibold">
                      Patient
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container font-semibold text-xs">
                  {historyModalData.gender} • {historyModalData.dob}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-surface-container">
                <div><strong>Contact:</strong> {historyModalData.contact}</div>
                <div><strong>Address:</strong> {historyModalData.address || 'N/A'}</div>
                <div className="col-span-2">
                  <strong>Clinical Alerts:</strong>{' '}
                  <span className="text-secondary font-medium">
                    {historyModalData.medical_history || 'No recorded chronic conditions'}
                  </span>
                </div>
              </div>
            </div>

            {/* Uploaded Clinical Documents */}
            <div className="p-4 bg-surface-container-lowest rounded-xl border border-surface-container space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase text-outline">Clinical Attached Documents</h4>
                <button
                  onClick={() => setIsUploadDocOpen(true)}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  + Attach Document
                </button>
              </div>

              {(!historyModalData.documents || historyModalData.documents.length === 0) ? (
                <p className="text-xs text-outline py-2">No clinical documents attached yet.</p>
              ) : (
                <div className="space-y-2">
                  {historyModalData.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low text-xs">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">description</span>
                        <div>
                          <div className="font-semibold text-on-surface">{doc.title}</div>
                          <div className="text-[10px] text-outline">{doc.category} • {new Date(doc.uploaded_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <span className="text-secondary font-semibold text-[11px]">Attached</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prescriptions History */}
            {historyModalData.prescriptions && historyModalData.prescriptions.length > 0 && (
              <div className="p-4 bg-surface-container-lowest rounded-xl border border-surface-container space-y-2">
                <h4 className="font-bold text-xs uppercase text-outline">Prescription Records</h4>
                <div className="space-y-2">
                  {historyModalData.prescriptions.map(pr => (
                    <div key={pr.id} className="p-2.5 rounded-lg bg-surface-container-low text-xs space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>{pr.diagnosis}</span>
                        <span className="text-outline text-[11px]">{new Date(pr.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-outline text-[11px]">Doctor: {pr.doctor_name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-footer px-0 pb-0">
              <button
                onClick={() => setHistoryModalData(null)}
                className="btn btn-secondary"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Document Modal */}
      {isUploadDocOpen && (
        <Modal
          isOpen={isUploadDocOpen}
          onClose={() => setIsUploadDocOpen(false)}
          title="Attach Clinical Document / Report"
        >
          <form onSubmit={handleUploadDocument} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Document Title</label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g. Abdominal Ultrasound Scan, Discharge Summary"
                value={docFormData.title}
                onChange={e => setDocFormData({ ...docFormData, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Document Category</label>
              <select
                className="select"
                value={docFormData.category}
                onChange={e => setDocFormData({ ...docFormData, category: e.target.value })}
              >
                <option value="Lab Report">Lab Report</option>
                <option value="Radiology & Imaging">Radiology & Imaging</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Referral Letter">Physician Referral Letter</option>
                <option value="Consent Form">Consent Form</option>
              </select>
            </div>

            <div className="modal-footer px-0 pb-0">
              <button
                type="button"
                onClick={() => setIsUploadDocOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save & Attach
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
