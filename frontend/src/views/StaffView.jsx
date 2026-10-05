import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function StaffView() {
  const { currentRole, user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'attendance' | 'leaves'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [isAddEmpModalOpen, setIsAddEmpModalOpen] = useState(false);
  const [isAttModalOpen, setIsAttModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isRegUserModalOpen, setIsRegUserModalOpen] = useState(false);
  const [regUserForm, setRegUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role_name: 'Doctor'
  });
  const [regUserError, setRegUserError] = useState('');
  const [regUserSuccess, setRegUserSuccess] = useState('');
  const [systemUsers, setSystemUsers] = useState([]);

  const [empForm, setEmpForm] = useState({
    name: '',
    department_id: '',
    designation: '',
    joined_date: new Date().toISOString().split('T')[0]
  });

  const [attForm, setAttForm] = useState({
    employee_id: '',
    status: 'Present'
  });

  const [leaveForm, setLeaveForm] = useState({
    employee_id: '',
    leave_type: 'Casual Leave',
    start_date: '',
    end_date: '',
    days: 1,
    reason: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, attRes, leaveRes, deptRes] = await Promise.all([
        api.get('/staff/employees'),
        api.get('/staff/attendance'),
        api.get('/staff/leaves'),
        api.get('/doctors/departments')
      ]);

      if (empRes.success) {
        setEmployees(empRes.data);
        if (empRes.data.length > 0) {
          if (!attForm.employee_id) setAttForm(prev => ({ ...prev, employee_id: empRes.data[0].id }));
          if (!leaveForm.employee_id) setLeaveForm(prev => ({ ...prev, employee_id: empRes.data[0].id }));
        }
      }
      if (attRes.success) setAttendance(attRes.data);
      if (leaveRes.success) setLeaves(leaveRes.data);
      if (deptRes.success) {
        setDepartments(deptRes.data);
        if (deptRes.data.length > 0 && !empForm.department_id) {
          setEmpForm(prev => ({ ...prev, department_id: deptRes.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching staff records:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      if (res.success) {
        setSystemUsers(res.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchData();
    if (currentRole === 'Administrator') {
      fetchUsers();
    }
  }, [currentRole]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/staff/employees', empForm);
      if (res.success) {
        setIsAddEmpModalOpen(false);
        setEmpForm({
          name: '',
          department_id: departments[0]?.id || '',
          designation: '',
          joined_date: new Date().toISOString().split('T')[0]
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogAttendance = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/staff/attendance', attForm);
      if (res.success) {
        setIsAttModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/staff/leaves', leaveForm);
      if (res.success) {
        setIsLeaveModalOpen(false);
        setLeaveForm({
          employee_id: employees[0]?.id || '',
          leave_type: 'Casual Leave',
          start_date: '',
          end_date: '',
          days: 1,
          reason: ''
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLeaveStatus = async (leaveId, status) => {
    try {
      await api.put(`/staff/leaves/${leaveId}/status`, { status });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setRegUserError('');
    setRegUserSuccess('');
    try {
      const res = await api.post('/auth/register', {
        ...regUserForm,
        requesting_user_email: user?.email || 'admin@medicure.org'
      });
      if (res.success) {
        setRegUserSuccess(`Account created: ${regUserForm.username} (${regUserForm.role_name})`);
        setRegUserForm({ username: '', email: '', password: '', role_name: 'Doctor' });
        fetchUsers();
      }
    } catch (err) {
      setRegUserError(err.message || 'Failed to create user account.');
    }
  };

  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const pendingLeavesCount = leaves.filter(l => l.status === 'Pending').length;

  const filteredEmployees = employees.filter(e => {
    const q = searchTerm.toLowerCase();
    return (
      (e.name || '').toLowerCase().includes(q) ||
      (e.designation || '').toLowerCase().includes(q) ||
      (e.department_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Action & Statistics Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
              Hospital Staff & Human Resources
            </h1>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5"></span>
              {employees.length} Staff Members
            </span>
          </div>
          <p className="font-body-sm text-xs md:text-sm text-on-surface-variant">
            Healthcare Personnel Directory, Shift Attendance Tracking & Clinical Leave Management
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-xs font-semibold transition-all border border-surface-container-high/40 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            <span>Request Leave</span>
          </button>
          <button
            onClick={() => setIsAttModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-low text-primary hover:bg-surface-container font-label-md text-xs font-semibold transition-all border border-surface-container-high/40 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">fact_check</span>
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => setIsAddEmpModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-md text-xs font-semibold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Enroll Staff</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container flex items-center justify-between">
          <div>
            <span className="font-label-sm text-xs text-outline uppercase font-semibold">Active Staff Roster</span>
            <div className="font-headline-lg text-2xl font-bold text-on-surface mt-1">{employees.length}</div>
            <span className="text-xs text-primary font-medium">Full clinical & nursing team</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">badge</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container flex items-center justify-between">
          <div>
            <span className="font-label-sm text-xs text-outline uppercase font-semibold">On-Duty Today</span>
            <div className="font-headline-lg text-2xl font-bold text-secondary mt-1">{presentCount}</div>
            <span className="text-xs text-secondary font-medium">Logged present for shift</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container flex items-center justify-between">
          <div>
            <span className="font-label-sm text-xs text-outline uppercase font-semibold">Pending Leave Requests</span>
            <div className="font-headline-lg text-2xl font-bold text-on-surface mt-1">{pendingLeavesCount}</div>
            <span className="text-xs text-outline font-medium">Awaiting departmental sign-off</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-[24px]">pending_actions</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-surface-container-high/40 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Staff Directory ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Daily Attendance ({attendance.length})
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'leaves'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Leave Requests ({leaves.length})
          </button>
          {currentRole === 'Administrator' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded font-label-sm text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              System Accounts
            </button>
          )}
        </div>

        {activeTab === 'directory' && (
          <div className="relative w-full md:max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search staff by name or role..."
              className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low rounded-lg font-body-sm text-xs text-on-surface placeholder:text-outline border border-transparent focus:border-secondary focus:bg-surface-container-lowest focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Staff Directory */}
      {activeTab === 'directory' && (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-surface-container-low/70 h-10">
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Emp ID</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Staff Member</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Clinical Department</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Designation & Role</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Date Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-body-sm text-on-surface">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-outline">
                      Loading staff roster...
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-outline">
                      No staff records found.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-primary">
                        Staff
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-secondary-container text-secondary flex items-center justify-center font-bold text-xs shrink-0">
                            {emp.name ? emp.name.charAt(0) : 'S'}
                          </div>
                          <span className="font-semibold text-on-surface">{emp.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-on-surface-variant font-medium">
                        {emp.department_name}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded bg-surface-container text-on-surface font-label-sm text-xs">
                          {emp.designation}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-outline">
                        {emp.joined_date}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Daily Attendance */}
      {activeTab === 'attendance' && (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-surface-container-low/70 h-10">
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Staff Member</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Date</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Check-In Time</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Check-Out Time</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-body-sm text-on-surface">
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-outline">
                      No attendance logged for today.
                    </td>
                  </tr>
                ) : (
                  attendance.map(att => (
                    <tr key={att.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-on-surface">
                        {att.employee_name}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-outline">
                        {att.date}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-secondary font-semibold">
                        {att.check_in || '--:--'}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-outline">
                        {att.check_out || '--:--'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            att.status === 'Present'
                              ? 'bg-secondary-container text-on-secondary-container'
                              : 'bg-error-container text-on-error-container'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              att.status === 'Present' ? 'bg-secondary' : 'bg-error'
                            }`}
                          ></span>
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Leave Requests */}
      {activeTab === 'leaves' && (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-surface-container-low/70 h-10">
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Leave ID</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Staff Member</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Leave Type</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Duration (Dates)</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Days</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Reason</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Status</th>
                  <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-body-sm text-on-surface">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-outline">
                      No leave requests submitted.
                    </td>
                  </tr>
                ) : (
                  leaves.map(l => (
                    <tr key={l.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-primary">
                        Log
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-on-surface">
                        {l.employee_name}
                      </td>
                      <td className="px-4 py-3.5 text-on-surface-variant font-medium">
                        {l.leave_type}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-outline">
                        {l.start_date} to {l.end_date}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-semibold">
                        {l.days}d
                      </td>
                      <td className="px-4 py-3.5 text-xs text-outline max-w-[180px] truncate">
                        {l.reason || 'Personal'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            l.status === 'Approved'
                              ? 'bg-secondary-container text-on-secondary-container'
                              : l.status === 'Rejected'
                              ? 'bg-error-container text-on-error-container'
                              : 'bg-primary-container/20 text-primary'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {l.status === 'Pending' && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleLeaveStatus(l.id, 'Approved')}
                              className="px-2.5 py-1 rounded bg-secondary-container/40 text-secondary hover:bg-secondary-container font-label-sm text-xs font-semibold cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleLeaveStatus(l.id, 'Rejected')}
                              className="px-2.5 py-1 rounded bg-surface-container text-error hover:bg-error-container font-label-sm text-xs font-semibold cursor-pointer"
                            >
                              Reject
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

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddEmpModalOpen}
        onClose={() => setIsAddEmpModalOpen(false)}
        title="Enroll Healthcare Staff Member"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="input"
              required
              value={empForm.name}
              onChange={e => setEmpForm({ ...empForm, name: e.target.value })}
              placeholder="e.g. Sarah Connor, RN"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Assigned Department</label>
              <select
                className="select"
                value={empForm.department_id}
                onChange={e => setEmpForm({ ...empForm, department_id: e.target.value })}
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Designation / Role Title *</label>
              <input
                type="text"
                className="input"
                required
                value={empForm.designation}
                onChange={e => setEmpForm({ ...empForm, designation: e.target.value })}
                placeholder="e.g. Head Nurse, Phlebotomist, Lab Tech"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Joining Date</label>
            <input
              type="date"
              className="input"
              value={empForm.joined_date}
              onChange={e => setEmpForm({ ...empForm, joined_date: e.target.value })}
            />
          </div>

          <div className="modal-footer px-0 pb-0">
            <button
              type="button"
              onClick={() => setIsAddEmpModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Enroll Staff
            </button>
          </div>
        </form>
      </Modal>

      {/* Log Attendance Modal */}
      <Modal
        isOpen={isAttModalOpen}
        onClose={() => setIsAttModalOpen(false)}
        title="Log Staff Shift Attendance"
      >
        <form onSubmit={handleLogAttendance} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Staff Member</label>
            <select
              className="select"
              value={attForm.employee_id}
              onChange={e => setAttForm({ ...attForm, employee_id: e.target.value })}
              required
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.designation}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Attendance Status</label>
            <select
              className="select"
              value={attForm.status}
              onChange={e => setAttForm({ ...attForm, status: e.target.value })}
            >
              <option value="Present">Present (Checked In)</option>
              <option value="Late">Late Arrival</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div className="modal-footer px-0 pb-0">
            <button
              type="button"
              onClick={() => setIsAttModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Record Attendance
            </button>
          </div>
        </form>
      </Modal>

      {/* Leave Application Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Submit Staff Leave Request"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Staff Member</label>
            <select
              className="select"
              value={leaveForm.employee_id}
              onChange={e => setLeaveForm({ ...leaveForm, employee_id: e.target.value })}
              required
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.designation}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Leave Type</label>
              <select
                className="select"
                value={leaveForm.leave_type}
                onChange={e => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
              >
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Annual Vacation">Annual Vacation</option>
                <option value="Maternity / Paternity">Maternity / Paternity</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Number of Days</label>
              <input
                type="number"
                min="1"
                className="input"
                value={leaveForm.days}
                onChange={e => setLeaveForm({ ...leaveForm, days: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="input"
                required
                value={leaveForm.start_date}
                onChange={e => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="input"
                required
                value={leaveForm.end_date}
                onChange={e => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Absence</label>
            <textarea
              className="textarea"
              rows="2"
              value={leaveForm.reason}
              onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              placeholder="e.g. Family medical emergency, annual scheduled leave"
              required
            />
          </div>

          <div className="modal-footer px-0 pb-0">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
      {/* Tab 4: System User Accounts (Admin only) */}
      {activeTab === 'users' && currentRole === 'Administrator' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="font-headline-sm text-base font-bold text-on-surface">System User Accounts</h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Active authentication accounts and role assignments for clinical & administrative staff.
                </p>
              </div>
              <button
                onClick={() => { setRegUserError(''); setRegUserSuccess(''); setIsRegUserModalOpen(true); }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-md text-xs font-semibold transition-all shadow-sm active:scale-[0.98] cursor-pointer shrink-0"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>+ Register New Account</span>
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-on-surface-variant flex items-start gap-2.5 mb-5">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">verified_user</span>
              <div>
                <strong className="text-primary font-semibold">RBAC Security:</strong> Only Administrators can create or provision system user accounts. Password hashes are protected and accounts are granted access based on their assigned role.
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-low/60 h-9">
                    <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Account ID</th>
                    <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Username</th>
                    <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Email</th>
                    <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold">Role Context</th>
                    <th className="px-4 py-2 font-label-sm text-xs text-outline uppercase font-semibold text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-body-sm text-on-surface">
                  {systemUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-outline">
                        Loading system accounts...
                      </td>
                    </tr>
                  ) : (
                    systemUsers.map(u => (
                      <tr key={u.id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="px-4 py-3 font-mono text-primary font-semibold">User</td>
                        <td className="px-4 py-3 font-semibold text-on-surface">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-secondary-container/50 text-secondary flex items-center justify-center font-bold text-xs shrink-0">
                              {u.username ? u.username.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span>{u.username}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            u.role_name === 'Administrator'
                              ? 'bg-error-container text-on-error-container'
                              : u.role_name === 'Doctor'
                              ? 'bg-primary-container text-on-primary-container'
                              : 'bg-secondary-container text-on-secondary-container'
                          }`}>
                            {u.role_name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-outline text-xs">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Initial'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Register User Account Modal (Admin only) */}
      <Modal
        isOpen={isRegUserModalOpen}
        onClose={() => setIsRegUserModalOpen(false)}
        title="Register New System User Account"
      >
        <form onSubmit={handleRegisterUser} className="space-y-4">
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs text-on-surface-variant flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0">admin_panel_settings</span>
            <span>You are creating a new login account as <strong className="text-primary">Administrator ({user?.email})</strong>. This account will allow the user to log in to MediCure HMS.</span>
          </div>

          {regUserError && (
            <div className="p-3 bg-error-container/30 border border-error/20 rounded-lg text-xs text-error flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {regUserError}
            </div>
          )}
          {regUserSuccess && (
            <div className="p-3 bg-secondary-container/40 border border-secondary/20 rounded-lg text-xs text-on-secondary-container flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
              {regUserSuccess}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input
                type="text"
                className="input"
                required
                placeholder="e.g. dr.johnson"
                value={regUserForm.username}
                onChange={e => setRegUserForm({ ...regUserForm, username: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="input"
                required
                placeholder="e.g. dr.johnson@medicure.org"
                value={regUserForm.email}
                onChange={e => setRegUserForm({ ...regUserForm, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Initial Password *</label>
              <input
                type="password"
                className="input"
                required
                minLength="8"
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':&quot;\\|,.<>\/?~`]).{8,}"
                title="Min 8 characters, with at least one uppercase, one lowercase, one number, and one special character"
                placeholder="e.g. Pass123! (Aa + 1 + #)"
                value={regUserForm.password}
                onChange={e => setRegUserForm({ ...regUserForm, password: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Assign Role *</label>
              <select
                className="select"
                value={regUserForm.role_name}
                onChange={e => setRegUserForm({ ...regUserForm, role_name: e.target.value })}
              >
                <option value="Administrator">Administrator</option>
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Laboratory Staff">Laboratory Staff</option>
                <option value="Pharmacist">Pharmacist</option>
                <option value="Accountant">Accountant</option>
              </select>
            </div>
          </div>

          <div className="modal-footer px-0 pb-0">
            <button
              type="button"
              onClick={() => setIsRegUserModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create User Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
