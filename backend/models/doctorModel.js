import { supabase } from '../config/supabase.js';
import { generateId } from '../utils/helpers.js';

export const doctorModel = {
  async getAll(departmentId) {
    if (supabase) {
      try {
        let query = supabase.from('doctors').select('*');
        if (departmentId) {
          query = query.eq('department_id', departmentId);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase doctorModel.getAll error:', err.message);
      }
    }
    return [];
  },

  async getDepartments() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('departments').select('*');
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase doctorModel.getDepartments error:', err.message);
      }
    }
    return [];
  },

  async getById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('doctors').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase doctorModel.getById error:', err.message);
      }
    }
    return null;
  },

  async create(data) {
    const departments = await this.getDepartments();
    const dept = departments.find(d => d.id === data.department_id) || departments[0] || { id: 'dep1', name: 'General Medicine' };

    const newDoctor = {
      id: data.id || generateId('doc'),
      employee_id: data.employee_id || generateId('emp'),
      name: data.name,
      specialization: data.specialization,
      department_id: dept.id,
      department_name: dept.name,
      consultation_fee: parseFloat(data.consultation_fee) || 100.00,
      contact: data.contact || '+1 (555) 000-0000',
      availability: data.availability || 'Mon - Fri, 09:00 - 17:00'
    };

    if (supabase) {
      try {
        const { data: inserted, error } = await supabase.from('doctors').insert([newDoctor]).select().single();
        if (!error && inserted) return inserted;
      } catch (err) {
        console.warn('Supabase doctorModel.create error:', err.message);
      }
    }

    return newDoctor;
  },

  async update(id, updates) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('doctors').update(updates).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase doctorModel.update error:', err.message);
      }
    }
    return { ...updates, id };
  }
};
