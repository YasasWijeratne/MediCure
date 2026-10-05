import { supabase } from '../config/supabase.js';
import { generateId } from '../utils/helpers.js';

export const patientModel = {
  async getAll(search) {
    if (supabase) {
      try {
        let query = supabase.from('patients').select('*').order('created_at', { ascending: false });
        if (search) {
          query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,contact.ilike.%${search}%`);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase patientModel.getAll error:', err.message);
      }
    }
    return [];
  },

  async getById(id) {
    if (!id) return null;
    if (supabase) {
      try {
        const { data: pData, error: pError } = await supabase.from('patients').select('*').eq('id', id).maybeSingle();
        if (!pError && pData) {
          const [appRes, prescRes, labRes, invRes, admRes, docRes] = await Promise.all([
            supabase.from('appointments').select('*').eq('patient_id', id),
            supabase.from('prescriptions').select('*').eq('patient_id', id),
            supabase.from('lab_tests').select('*').eq('patient_id', id),
            supabase.from('invoices').select('*').eq('patient_id', id),
            supabase.from('admissions').select('*').eq('patient_id', id),
            supabase.from('patient_documents').select('*').eq('patient_id', id)
          ]);

          return {
            ...pData,
            documents: docRes.data || [],
            appointments: appRes.data || [],
            prescriptions: prescRes.data || [],
            labTests: labRes.data || [],
            invoices: invRes.data || [],
            admissions: admRes.data || []
          };
        }
      } catch (err) {
        console.warn('Supabase patientModel.getById error:', err.message);
      }
    }
    return null;
  },

  async create(data) {
    const newPatient = {
      id: data.id || generateId('pat'),
      first_name: data.first_name,
      last_name: data.last_name,
      dob: data.dob || '1990-01-01',
      gender: data.gender || 'Unspecified',
      contact: data.contact,
      address: data.address || '',
      medical_history: data.medical_history || 'No prior recorded history'
    };

    if (supabase) {
      try {
        const { data: inserted, error } = await supabase.from('patients').insert([newPatient]).select().single();
        if (!error && inserted) {
          return { ...inserted, documents: [] };
        }
      } catch (err) {
        console.warn('Supabase patientModel.create error:', err.message);
      }
    }

    return { ...newPatient, documents: [] };
  },

  async update(id, updates) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase patientModel.update error:', err.message);
      }
    }
    return { ...updates, id };
  },

  async delete(id) {
    if (supabase) {
      try {
        const { error } = await supabase.from('patients').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase patientModel.delete error:', err.message);
      }
    }
    return false;
  },

  async addDocument(patientId, docData) {
    const newDoc = {
      id: docData.id || generateId('doc'),
      patient_id: patientId,
      title: docData.title,
      category: docData.category || 'General Medical Report',
      uploaded_at: new Date().toISOString().split('T')[0],
      url: docData.url || '#'
    };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('patient_documents').insert([newDoc]).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase patientModel.addDocument error:', err.message);
      }
    }
    return newDoc;
  }
};
