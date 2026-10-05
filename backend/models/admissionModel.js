import { supabase } from '../config/supabase.js';
import { generateId } from '../utils/helpers.js';

export const admissionModel = {
  async getAll(filters = {}) {
    const { status, patient_id } = filters;

    if (supabase) {
      try {
        let query = supabase.from('admissions').select('*').order('admitted_at', { ascending: false });
        if (status) query = query.eq('status', status);
        if (patient_id) query = query.eq('patient_id', patient_id);

        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase admissionModel.getAll error:', err.message);
      }
    }
    return [];
  },

  async getById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('admissions').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase admissionModel.getById error:', err.message);
      }
    }
    return null;
  },

  async create(data) {
    const newAdmission = {
      id: data.id || generateId('adm'),
      patient_id: data.patient_id,
      patient_name: data.patient_name || 'Patient',
      ward_type: data.ward_type || 'General Ward',
      room_no: data.room_no,
      bed_no: data.bed_no || 'Bed-1',
      daily_rate: parseFloat(data.daily_rate) || 100.00,
      admitted_at: new Date().toISOString(),
      discharged_at: null,
      status: 'Admitted',
      attending_doctor: data.attending_doctor || 'Attending Staff',
      admission_notes: data.admission_notes || 'Inpatient admission for clinical monitoring'
    };

    if (supabase) {
      try {
        const { data: inserted, error } = await supabase.from('admissions').insert([newAdmission]).select().single();
        if (!error && inserted) return inserted;
      } catch (err) {
        console.warn('Supabase admissionModel.create error:', err.message);
      }
    }

    return newAdmission;
  },

  async discharge(id, dischargeDate = new Date()) {
    const dischargeIso = dischargeDate.toISOString();
    const updates = {
      discharged_at: dischargeIso,
      status: 'Discharged'
    };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('admissions').update(updates).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase admissionModel.discharge error:', err.message);
      }
    }

    return { id, ...updates };
  }
};
