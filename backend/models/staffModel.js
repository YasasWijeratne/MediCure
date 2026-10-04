import { supabase } from '../config/supabase.js';
import { dbStore, generateId } from '../db/store.js';

export const staffModel = {
  async getEmployees() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('employees').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase staffModel.getEmployees fallback:', err.message);
      }
    }
    return dbStore.employees;
  },

  async createEmployee(data) {
    const newEmployee = {
      id: data.id || generateId('emp'),
      user_id: data.user_id || generateId('u'),
      name: data.name,
      department_id: data.department_id,
      department_name: data.department_name,
      designation: data.designation,
      joined_date: data.joined_date || new Date().toISOString().split('T')[0]
    };

    if (supabase) {
      try {
        const { data: inserted, error } = await supabase.from('employees').insert([newEmployee]).select().single();
        if (!error && inserted) {
          dbStore.employees.push(inserted);
          return inserted;
        }
      } catch (err) {
        console.warn('Supabase staffModel.createEmployee fallback:', err.message);
      }
    }

    dbStore.employees.push(newEmployee);
    return newEmployee;
  },

  async getAttendance() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('attendance').select('*').order('date', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase staffModel.getAttendance fallback:', err.message);
      }
    }
    return dbStore.attendance;
  },

  async recordAttendance(emp, status) {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let existing = dbStore.attendance.find(a => a.employee_id === emp.id && a.date === today);

    if (existing) {
      existing.status = status || existing.status;
      existing.check_out = nowTime;
      if (supabase) {
        try {
          await supabase.from('attendance').update({ status: existing.status, check_out: nowTime }).eq('id', existing.id);
        } catch (err) {
          console.warn('Supabase attendance update fallback:', err.message);
        }
      }
      return existing;
    }

    const record = {
      id: generateId('att'),
      employee_id: emp.id,
      employee_name: emp.name,
      date: today,
      status: status || 'Present',
      check_in: nowTime,
      check_out: '-'
    };

    if (supabase) {
      try {
        const { data: inserted, error } = await supabase.from('attendance').insert([record]).select().single();
        if (!error && inserted) {
          dbStore.attendance.unshift(inserted);
          return inserted;
        }
      } catch (err) {
        console.warn('Supabase recordAttendance fallback:', err.message);
      }
    }

    dbStore.attendance.unshift(record);
    return record;
  },

  async getLeaves() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('staff_leaves').select('*').order('applied_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase staffModel.getLeaves fallback:', err.message);
      }
    }
    return dbStore.staff_leaves;
  },

  async applyLeave(data) {
    const newLeave = {
      id: data.id || generateId('lev'),
      employee_id: data.employee_id,
      employee_name: data.employee_name,
      leave_type: data.leave_type || 'Casual Leave',
      start_date: data.start_date,
      end_date: data.end_date,
      days: parseInt(data.days) || 1,
      reason: data.reason || 'Personal / Medical Leave',
      status: 'Pending',
      applied_at: new Date().toISOString().split('T')[0]
    };

    if (supabase) {
      try {
        const { data: inserted, error } = await supabase.from('staff_leaves').insert([newLeave]).select().single();
        if (!error && inserted) {
          dbStore.staff_leaves.unshift(inserted);
          return inserted;
        }
      } catch (err) {
        console.warn('Supabase applyLeave fallback:', err.message);
      }
    }

    dbStore.staff_leaves.unshift(newLeave);
    return newLeave;
  },

  async updateLeaveStatus(id, status) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('staff_leaves').update({ status }).eq('id', id).select().single();
        if (!error && data) {
          const idx = dbStore.staff_leaves.findIndex(l => l.id === id);
          if (idx !== -1) dbStore.staff_leaves[idx] = data;
          return data;
        }
      } catch (err) {
        console.warn('Supabase updateLeaveStatus fallback:', err.message);
      }
    }

    const leave = dbStore.staff_leaves.find(l => l.id === id);
    if (!leave) return null;
    leave.status = status;
    return leave;
  }
};
