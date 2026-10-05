import { supabase } from '../config/supabase.js';
import { generateId } from '../utils/helpers.js';

export const appointmentModel = {
  async getAll(filters = {}) {
    const { status, doctor_id, patient_id } = filters;

    if (supabase) {
      try {
        let query = supabase.from('appointments').select('*').order('scheduled_at', { ascending: true });
        if (status) query = query.eq('status', status);
        if (doctor_id) query = query.eq('doctor_id', doctor_id);
        if (patient_id) query = query.eq('patient_id', patient_id);

        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase appointmentModel.getAll error:', err.message);
      }
    }
    return [];
  },

  async getById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('appointments').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase appointmentModel.getById error:', err.message);
      }
    }
    return null;
  },

  async create(appointmentData) {
    const newAppointment = {
      id: appointmentData.id || generateId('apt'),
      patient_id: appointmentData.patient_id,
      patient_name: appointmentData.patient_name,
      doctor_id: appointmentData.doctor_id,
      doctor_name: appointmentData.doctor_name,
      scheduled_at: appointmentData.scheduled_at,
      status: appointmentData.status || 'Scheduled',
      notes: appointmentData.notes || 'General Consultation'
    };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('appointments').insert([newAppointment]).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase appointmentModel.create error:', err.message);
      }
    }

    return newAppointment;
  },

  async update(id, updates) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('appointments').update(updates).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase appointmentModel.update error:', err.message);
      }
    }
    return { ...updates, id };
  },

  async cancel(id) {
    return this.update(id, { status: 'Cancelled' });
  }
};
