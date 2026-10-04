import { supabase } from '../config/supabase.js';
import { dbStore, generateId } from '../db/store.js';

export const emrModel = {
  async getPrescriptions(filters = {}) {
    const { patient_id, doctor_id } = filters;

    if (supabase) {
      try {
        let query = supabase.from('prescriptions').select('*, items:prescription_items(*)').order('created_at', { ascending: false });
        if (patient_id) query = query.eq('patient_id', patient_id);
        if (doctor_id) query = query.eq('doctor_id', doctor_id);

        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase emrModel.getPrescriptions fallback:', err.message);
      }
    }

    let results = dbStore.prescriptions;
    if (patient_id) results = results.filter(p => p.patient_id === patient_id);
    if (doctor_id) results = results.filter(p => p.doctor_id === doctor_id);
    return results;
  },

  async getPatientEMR(patientId) {
    if (supabase) {
      try {
        const { data: patient, error: pError } = await supabase.from('patients').select('*').eq('id', patientId).maybeSingle();
        if (!pError && patient) {
          const [prescRes, labRes, aptRes] = await Promise.all([
            supabase.from('prescriptions').select('*, items:prescription_items(*)').eq('patient_id', patientId),
            supabase.from('lab_tests').select('*').eq('patient_id', patientId),
            supabase.from('appointments').select('*').eq('patient_id', patientId)
          ]);
          return {
            patient,
            prescriptions: prescRes.data || [],
            labTests: labRes.data || [],
            appointments: aptRes.data || []
          };
        }
      } catch (err) {
        console.warn('Supabase emrModel.getPatientEMR fallback:', err.message);
      }
    }

    const patient = dbStore.patients.find(p => p.id === patientId);
    if (!patient) return null;

    return {
      patient,
      prescriptions: dbStore.prescriptions.filter(pr => pr.patient_id === patientId),
      labTests: dbStore.lab_tests.filter(l => l.patient_id === patientId),
      appointments: dbStore.appointments.filter(a => a.patient_id === patientId)
    };
  },

  async createPrescription(prescData) {
    const newPrescription = {
      id: prescData.id || generateId('rx'),
      appointment_id: prescData.appointment_id || null,
      doctor_id: prescData.doctor_id,
      doctor_name: prescData.doctor_name || 'Attending Physician',
      patient_id: prescData.patient_id,
      patient_name: prescData.patient_name || 'Patient',
      diagnosis: prescData.diagnosis,
      notes: prescData.notes || '',
      created_at: new Date().toISOString(),
      items: prescData.items || []
    };

    if (supabase) {
      try {
        const { data: inserted, error: prescError } = await supabase.from('prescriptions').insert([{
          id: newPrescription.id,
          appointment_id: newPrescription.appointment_id,
          doctor_id: newPrescription.doctor_id,
          doctor_name: newPrescription.doctor_name,
          patient_id: newPrescription.patient_id,
          patient_name: newPrescription.patient_name,
          diagnosis: newPrescription.diagnosis,
          notes: newPrescription.notes
        }]).select().single();

        if (!prescError && inserted && newPrescription.items.length > 0) {
          const itemsToInsert = newPrescription.items.map(it => ({
            id: it.id || generateId('rxi'),
            prescription_id: newPrescription.id,
            medicine_id: it.medicine_id,
            medicine_name: it.medicine_name,
            dosage: it.dosage,
            frequency: it.frequency
          }));
          await supabase.from('prescription_items').insert(itemsToInsert);
          dbStore.prescriptions.unshift(newPrescription);
          return newPrescription;
        }
      } catch (err) {
        console.warn('Supabase emrModel.createPrescription fallback:', err.message);
      }
    }

    dbStore.prescriptions.unshift(newPrescription);
    return newPrescription;
  }
};
