import { supabase } from '../config/supabase.js';
import { generateId } from '../utils/helpers.js';

export const labModel = {
  async getAll(filters = {}) {
    const { sample_status, patient_id } = filters;

    if (supabase) {
      try {
        let query = supabase.from('lab_tests').select('*').order('created_at', { ascending: false });
        if (sample_status) query = query.eq('sample_status', sample_status);
        if (patient_id) query = query.eq('patient_id', patient_id);

        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase labModel.getAll error:', err.message);
      }
    }
    return [];
  },

  async getById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('lab_tests').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase labModel.getById error:', err.message);
      }
    }
    return null;
  },

  async create(data) {
    const newTest = {
      id: data.id || generateId('lab'),
      patient_id: data.patient_id,
      patient_name: data.patient_name || 'Patient',
      test_name: data.test_name,
      sample_status: data.sample_status || 'Requested',
      result_data: data.result_data || 'Pending sample collection and analysis',
      report_url: data.report_url || '#',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data: inserted, error } = await supabase.from('lab_tests').insert([newTest]).select().single();
        if (!error && inserted) return inserted;
      } catch (err) {
        console.warn('Supabase labModel.create error:', err.message);
      }
    }
    return newTest;
  },

  async update(id, updates) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('lab_tests').update(updates).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase labModel.update error:', err.message);
      }
    }
    return { ...updates, id };
  },

  async delete(id) {
    if (supabase) {
      try {
        const { error } = await supabase.from('lab_tests').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase labModel.delete error:', err.message);
      }
    }
    return false;
  }
};
