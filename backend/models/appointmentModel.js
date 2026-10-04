import { supabase } from '../config/supabase.js';
import { dbStore, generateId } from '../db/store.js';

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
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase appointmentModel.getAll fallback:', err.message);
      }
    }

    let results = dbStore.appointments;
    if (status) results = results.filter(a => a.status.toLowerCase() === status.toLowerCase());
    if (doctor_id) results = results.filter(a => a.doctor_id === doctor_id);
    if (patient_id) results = results.filter(a => a.patient_id === patient_id);
    return results;
  },

  async getById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('appointments').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase appointmentModel.getById fallback:', err.message);
      }
    }
    return dbStore.appointments.find(a => a.id === id) || null;
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
        if (!error && data) {
          dbStore.appointments.unshift(data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase appointmentModel.create fallback:', err.message);
      }
    }

    dbStore.appointments.unshift(newAppointment);
    return newAppointment;
  },

  async update(id, updates) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('appointments').update(updates).eq('id', id).select().single();
        if (!error && data) {
          const idx = dbStore.appointments.findIndex(a => a.id === id);
          if (idx !== -1) dbStore.appointments[idx] = { ...dbStore.appointments[idx], ...data };
          return data;
        }
      } catch (err) {
        console.warn('Supabase appointmentModel.update fallback:', err.message);
      }
    }

    const idx = dbStore.appointments.findIndex(a => a.id === id);
    if (idx === -1) return null;
    const updated = { ...dbStore.appointments[idx], ...updates, id };
    dbStore.appointments[idx] = updated;
    return updated;
  },

  async cancel(id) {
    return this.update(id, { status: 'Cancelled' });
  }
};
