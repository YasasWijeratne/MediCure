import { staffModel } from '../models/staffModel.js';
import { doctorModel } from '../models/doctorModel.js';
import { logAuditEvent } from '../db/store.js';

export const staffController = {
  async getEmployees(req, res) {
    try {
      const employees = await staffModel.getEmployees();
      res.json({ success: true, count: employees.length, data: employees });
    } catch (err) {
      console.error('staffController.getEmployees error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve employees' });
    }
  },

  async createEmployee(req, res) {
    try {
      const { name, department_id, designation, joined_date, user_email } = req.body;

      if (!name || !designation) {
        return res.status(400).json({ success: false, message: 'Name and designation are required.' });
      }

      const departments = await doctorModel.getDepartments();
      const dept = departments.find(d => d.id === department_id) || departments[0] || { id: 'dep1', name: 'General Medicine' };

      const newEmployee = await staffModel.createEmployee({
        name,
        department_id: dept.id,
        department_name: dept.name,
        designation,
        joined_date
      });

      logAuditEvent('EMPLOYEE_REGISTERED', user_email, `Registered employee ${newEmployee.name} (${newEmployee.designation})`);

      res.status(201).json({
        success: true,
        message: 'Employee registered',
        data: newEmployee
      });
    } catch (err) {
      console.error('staffController.createEmployee error:', err);
      res.status(500).json({ success: false, message: 'Failed to register employee' });
    }
  },

  async getAttendance(req, res) {
    try {
      const attendance = await staffModel.getAttendance();
      res.json({ success: true, count: attendance.length, data: attendance });
    } catch (err) {
      console.error('staffController.getAttendance error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve attendance records' });
    }
  },

  async recordAttendance(req, res) {
    try {
      const { employee_id, status, user_email } = req.body;
      const employees = await staffModel.getEmployees();
      const emp = employees.find(e => e.id === employee_id);

      if (!emp) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      const record = await staffModel.recordAttendance(emp, status);
      logAuditEvent('ATTENDANCE_LOGGED', user_email, `Attendance recorded for ${emp.name}: ${record.status}`);

      res.json({
        success: true,
        message: 'Attendance recorded',
        data: record
      });
    } catch (err) {
      console.error('staffController.recordAttendance error:', err);
      res.status(500).json({ success: false, message: 'Failed to record attendance' });
    }
  },

  async getLeaves(req, res) {
    try {
      const leaves = await staffModel.getLeaves();
      res.json({ success: true, count: leaves.length, data: leaves });
    } catch (err) {
      console.error('staffController.getLeaves error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve leave records' });
    }
  },

  async applyLeave(req, res) {
    try {
      const { employee_id, leave_type, start_date, end_date, days, reason, user_email } = req.body;
      const employees = await staffModel.getEmployees();
      const emp = employees.find(e => e.id === employee_id);

      if (!emp) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      const newLeave = await staffModel.applyLeave({
        employee_id,
        employee_name: emp.name,
        leave_type,
        start_date,
        end_date,
        days,
        reason
      });

      logAuditEvent('LEAVE_REQUESTED', user_email, `Leave requested by ${emp.name} (${newLeave.leave_type}, ${newLeave.days} days)`);

      res.status(201).json({
        success: true,
        message: 'Leave application submitted',
        data: newLeave
      });
    } catch (err) {
      console.error('staffController.applyLeave error:', err);
      res.status(500).json({ success: false, message: 'Failed to apply for leave' });
    }
  },

  async updateLeaveStatus(req, res) {
    try {
      const { status, user_email } = req.body;
      const updated = await staffModel.updateLeaveStatus(req.params.id, status);

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Leave record not found' });
      }

      logAuditEvent('LEAVE_STATUS_UPDATED', user_email, `Leave for ${updated.employee_name} marked as ${updated.status}`);

      res.json({
        success: true,
        message: `Leave status updated to ${updated.status}`,
        data: updated
      });
    } catch (err) {
      console.error('staffController.updateLeaveStatus error:', err);
      res.status(500).json({ success: false, message: 'Failed to update leave status' });
    }
  }
};
