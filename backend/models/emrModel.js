import { supabase } from '../config/supabase.js';
import { generateId } from '../utils/helpers.js';

export const emrModel = {
  async getPrescriptions(filters = {}) {
    const { patient_id, doctor_id } = filters;

    if (supabase) {
      try {
        let query = supabase.from('prescriptions').select('*, items:prescription_items(*)').order('created_at', { ascending: false });
        if (patient_id) query = query.eq('patient_id', patient_id);
        if (doctor_id) query = query.eq('doctor_id', doctor_id);

        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase emrModel.getPrescriptions error:', err.message);
      }
    }
    return [];
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
        console.warn('Supabase emrModel.getPatientEMR error:', err.message);
      }
    }
    return null;
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
          return newPrescription;
        }
      } catch (err) {
        console.warn('Supabase emrModel.createPrescription error:', err.message);
      }
    }

    return newPrescription;
  },

  async updatePatientVitals(patientId, vitalsData) {
    const height = parseFloat(vitalsData.height_cm || 170);
    const weight = parseFloat(vitalsData.weight_kg || 70);
    const bmiVal = (weight / Math.pow(height / 100, 2)).toFixed(1);

    const vitals = {
      blood_group: vitalsData.blood_group || 'O+',
      height_cm: height,
      weight_kg: weight,
      bmi: bmiVal,
      bmi_status: parseFloat(bmiVal) < 18.5 ? 'Underweight' : parseFloat(bmiVal) <= 24.9 ? 'Normal' : 'Elevated',
      heart_rate: parseInt(vitalsData.heart_rate || 72),
      hr_status: vitalsData.hr_status || 'Normal Sinus',
      bp_systolic: parseInt(vitalsData.bp_systolic || 120),
      bp_diastolic: parseInt(vitalsData.bp_diastolic || 80),
      bp_status: vitalsData.bp_status || 'Controlled',
      spo2: parseInt(vitalsData.spo2 || 98),
      spo2_status: vitalsData.spo2_status || 'Room Air',
      temperature: parseFloat(vitalsData.temperature || 98.4),
      temp_status: vitalsData.temp_status || 'Afebrile',
      last_updated: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('patients').update({ vitals }).eq('id', patientId);
      } catch (err) {
        // quiet fallback
      }
    }

    return { id: patientId, vitals };
  }
};
