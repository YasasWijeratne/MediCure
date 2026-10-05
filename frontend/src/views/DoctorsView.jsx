import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';

export default function DoctorsView() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    department_id: '',
    consultation_fee: 100,
    contact: '',
    availability: 'Mon - Fri, 09:00 - 17:00'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [docRes, deptRes] = await Promise.all([
        api.get('/doctors', { department_id: selectedDept }),
        api.get('/doctors/departments')
      ]);

      if (docRes.success) setDoctors(docRes.data);
      if (deptRes.success) {
        setDepartments(deptRes.data);
        if (deptRes.data.length > 0 && !formData.department_id) {
          setFormData(prev => ({ ...prev, department_id: deptRes.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching doctor records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept]);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/doctors', formData);
      if (res.success) {
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          specialty: '',
          department_id: departments[0]?.id || '',
          consultation_fee: 100,
          contact: '',
          availability: 'Mon - Fri, 09:00 - 17:00'
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const q = searchTerm.toLowerCase();
    return (
      (doc.name || '').toLowerCase().includes(q) ||
      (doc.specialty || '').toLowerCase().includes(q) ||
      (doc.department_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Action & Statistics Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
              Medical Specialists & Physicians
            </h1>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5"></span>
              {doctors.length} Attending Doctors
            </span>
          </div>
          <p className="font-body-sm text-xs md:text-sm text-on-surface-variant">
            Attending Clinicians, Specialized Departments, Consultation Tariffs, and Clinical Rotas
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            <span>+ Enroll Doctor Profile</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search physician by name, specialty, or department..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-lg font-body-sm text-xs md:text-sm text-on-surface placeholder:text-outline border border-transparent focus:border-secondary focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto p-1 bg-surface-container-low rounded-lg border border-surface-container-high/40">
          <button
            onClick={() => setSelectedDept('')}
            className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedDept === ''
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            All Departments
          </button>
          {departments.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDept(d.id)}
              className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedDept === d.id
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full text-center py-12 text-outline">
            Loading medical specialist rosters...
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="col-span-full text-center py-12 text-outline">
            No specialists found matching your search.
          </div>
        ) : (
          filteredDoctors.map(doc => (
            <div
              key={doc.id}
              className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>

              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary-container/40 text-primary flex items-center justify-center font-bold text-lg shadow-2xs">
                      {doc.name ? doc.name.replace('Dr. ', '').charAt(0) : 'D'}
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                        {doc.name}
                      </h3>
                      <span className="font-label-sm text-xs font-semibold text-secondary">
                        {doc.specialty}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-md bg-surface-container-low text-primary font-mono text-xs font-bold border border-surface-container-high/40 whitespace-nowrap">
                    ${doc.consultation_fee} / Consult
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-surface-container space-y-2 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-outline">domain</span>
                    <span>Department: <strong>{doc.department_name}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                    <span>Schedule: <strong>{doc.availability || 'Mon - Fri, 09:00 - 17:00'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-outline">call</span>
                    <span className="font-mono">{doc.contact}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 font-label-sm text-secondary font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                  Accepting Consults
                </span>
                <span className="font-mono text-[11px] text-outline"></span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Doctor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enroll Medical Specialist Profile"
      >
        <form onSubmit={handleAddDoctor} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Full Name & Title *</label>
            <input
              type="text"
              className="input"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Julian Croft, MD"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Clinical Specialty *</label>
              <input
                type="text"
                className="input"
                required
                value={formData.specialty}
                onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="e.g. Pediatric Cardiology"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Department</label>
              <select
                className="select"
                value={formData.department_id}
                onChange={e => setFormData({ ...formData, department_id: e.target.value })}
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Standard Consultation Fee ($) *</label>
              <input
                type="number"
                className="input"
                required
                value={formData.consultation_fee}
                onChange={e => setFormData({ ...formData, consultation_fee: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Telephone</label>
              <input
                type="text"
                className="input"
                value={formData.contact}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                placeholder="+1 (555) 987-6543"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Weekly Consultation Schedule Rota</label>
            <input
              type="text"
              className="input"
              value={formData.availability}
              onChange={e => setFormData({ ...formData, availability: e.target.value })}
              placeholder="e.g. Mon - Fri, 09:00 - 17:00"
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
              Enroll Specialist
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
