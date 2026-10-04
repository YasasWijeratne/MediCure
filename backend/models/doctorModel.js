import { supabase } from '../config/supabase.js';
import { dbStore, generateId } from '../db/store.js';

export const doctorModel = {
  async getAll(departmentId) {
    if (supabase) {
      try {
        let query = supabase.from('doctors').select('*');
        if (departmentId) {
          query = query.eq('department_id', departmentId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase doctorModel.getAll fallback:', err.message);
      }
    }

    let results = dbStore.doctors;
    if (departmentId) {
      results = results.filter(d => d.department_id === departmentId);
    }
    return results;
  },

  async getDepartments() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('departments').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase doctorModel.getDepartments fallback:', err.message);
      }
    }
    return dbStore.departments;
  },

  async getById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('doctors').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase doctorModel.getById fallback:', err.message);
      }
    }
    return dbStore.doctors.find(d => d.id === id) || null;
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
        if (!error && inserted) {
          dbStore.doctors.push(inserted);
          return inserted;
        }
      } catch (err) {
        console.warn('Supabase doctorModel.create fallback:', err.message);
      }
    }

    dbStore.doctors.push(newDoctor);
    return newDoctor;
  },

  async update(id, updates) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('doctors').update(updates).eq('id', id).select().single();
        if (!error && data) {
          const idx = dbStore.doctors.findIndex(d => d.id === id);
          if (idx !== -1) dbStore.doctors[idx] = { ...dbStore.doctors[idx], ...data };
          return data;
        }
      } catch (err) {
        console.warn('Supabase doctorModel.update fallback:', err.message);
      }
    }

    const idx = dbStore.doctors.findIndex(d => d.id === id);
    if (idx === -1) return null;
    const updated = { ...dbStore.doctors[idx], ...updates, id };
    dbStore.doctors[idx] = updated;
    return updated;
  }
};
