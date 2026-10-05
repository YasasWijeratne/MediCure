import { supabase } from '../config/supabase.js';
import { dbStore, generateId } from '../db/store.js';

export const labModel = {
  async getAll(filters = {}) {
    const { sample_status, patient_id } = filters;

    if (supabase) {
      try {
        let query = supabase.from('lab_tests').select('*').order('created_at', { ascending: false });
        if (sample_status) query = query.eq('sample_status', sample_status);
        if (patient_id) query = query.eq('patient_id', patient_id);

        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase labModel.getAll fallback:', err.message);
      }
    }

    let results = dbStore.lab_tests;
    if (sample_status) {
      results = results.filter(l => l.sample_status.toLowerCase() === sample_status.toLowerCase());
    }
    if (patient_id) {
      results = results.filter(l => l.patient_id === patient_id);
    }
    return results;
  },

  async getById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('lab_tests').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase labModel.getById fallback:', err.message);
      }
    }
    return dbStore.lab_tests.find(l => l.id === id) || null;
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
        if (!error && inserted) {
          dbStore.lab_tests.unshift(inserted);
          return inserted;
        }
      } catch (err) {
        console.warn('Supabase labModel.create fallback:', err.message);
      }
    }

    dbStore.lab_tests.unshift(newTest);
    return newTest;
  },

  async update(id, updates) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('lab_tests').update(updates).eq('id', id).select().single();
        if (!error && data) {
          const idx = dbStore.lab_tests.findIndex(l => l.id === id);
          if (idx !== -1) dbStore.lab_tests[idx] = { ...dbStore.lab_tests[idx], ...data };
          return data;
        }
      } catch (err) {
        console.warn('Supabase labModel.update fallback:', err.message);
      }
    }

    const idx = dbStore.lab_tests.findIndex(l => l.id === id);
    if (idx === -1) return null;
    const updated = { ...dbStore.lab_tests[idx], ...updates, id };
    dbStore.lab_tests[idx] = updated;
    return updated;
  },

  async delete(id) {
    if (supabase) {
      try {
        const { error } = await supabase.from('lab_tests').delete().eq('id', id);
        if (!error) {
          const idx = dbStore.lab_tests.findIndex(l => l.id === id);
          if (idx !== -1) dbStore.lab_tests.splice(idx, 1);
          return true;
        }
      } catch (err) {
        console.warn('Supabase labModel.delete fallback:', err.message);
      }
    }

    const idx = dbStore.lab_tests.findIndex(l => l.id === id);
    if (idx !== -1) {
      dbStore.lab_tests.splice(idx, 1);
      return true;
    }
    return false;
  }
};
