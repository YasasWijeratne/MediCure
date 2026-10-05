import { supabase } from '../config/supabase.js';
import { generateId } from '../utils/helpers.js';

export const staffModel = {
  async getEmployees() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('employees').select('*');
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase staffModel.getEmployees error:', err.message);
      }
    }
    return [];
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
        if (!error && inserted) return inserted;
      } catch (err) {
        console.warn('Supabase staffModel.createEmployee error:', err.message);
      }
    }
    return newEmployee;
  },

  async getAttendance() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('attendance').select('*').order('date', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase staffModel.getAttendance error:', err.message);
      }
    }
    return [];
  },

  async recordAttendance(emp, status) {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (supabase) {
      try {
        const { data: existing } = await supabase.from('attendance')
          .select('*')
          .eq('employee_id', emp.id)
          .eq('date', today)
          .maybeSingle();

        if (existing) {
          const { data: updated } = await supabase.from('attendance')
            .update({ status: status || existing.status, check_out: nowTime })
            .eq('id', existing.id)
            .select()
            .single();
          return updated || existing;
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

        const { data: inserted } = await supabase.from('attendance').insert([record]).select().single();
        return inserted || record;
      } catch (err) {
        console.warn('Supabase recordAttendance error:', err.message);
      }
    }

    return {
      id: generateId('att'),
      employee_id: emp.id,
      employee_name: emp.name,
      date: today,
      status: status || 'Present',
      check_in: nowTime,
      check_out: '-'
    };
  },

  async getLeaves() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('staff_leaves').select('*').order('applied_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase staffModel.getLeaves error:', err.message);
      }
    }
    return [];
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
        if (!error && inserted) return inserted;
      } catch (err) {
        console.warn('Supabase applyLeave error:', err.message);
      }
    }
    return newLeave;
  },

  async updateLeaveStatus(id, status) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('staff_leaves').update({ status }).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase updateLeaveStatus error:', err.message);
      }
    }
    return { id, status };
  },

  async getDepartments() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('departments').select('*');
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase staffModel.getDepartments error:', err.message);
      }
    }
    return [];
  }
};
