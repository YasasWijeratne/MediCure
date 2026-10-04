import { supabase } from '../config/supabase.js';
import { dbStore, generateId } from '../db/store.js';

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
        console.warn('Supabase patientModel.getAll fallback:', err.message);
      }
    }

    let results = dbStore.patients;
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
        p.contact.includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }
    return results;
  },

  async getById(id) {
    let patient = null;
    let appointments = [];
    let prescriptions = [];
    let labTests = [];
    let invoices = [];
    let admissions = [];
    let documents = [];

    if (supabase) {
      try {
        const { data: pData, error: pError } = await supabase.from('patients').select('*').eq('id', id).maybeSingle();
        if (!pError && pData) {
          patient = pData;
          const [appRes, prescRes, labRes, invRes, admRes, docRes] = await Promise.all([
            supabase.from('appointments').select('*').eq('patient_id', id),
            supabase.from('prescriptions').select('*').eq('patient_id', id),
            supabase.from('lab_tests').select('*').eq('patient_id', id),
            supabase.from('invoices').select('*').eq('patient_id', id),
            supabase.from('admissions').select('*').eq('patient_id', id),
            supabase.from('patient_documents').select('*').eq('patient_id', id)
          ]);
          appointments = appRes.data || [];
          prescriptions = prescRes.data || [];
          labTests = labRes.data || [];
          invoices = invRes.data || [];
          admissions = admRes.data || [];
          documents = docRes.data || [];

          return {
            ...patient,
            documents,
            appointments,
            prescriptions,
            labTests,
            invoices,
            admissions
          };
        }
      } catch (err) {
        console.warn('Supabase patientModel.getById fallback:', err.message);
      }
    }

    patient = dbStore.patients.find(p => p.id === id);
    if (!patient) return null;

    return {
      ...patient,
      documents: patient.documents || [],
      appointments: dbStore.appointments.filter(a => a.patient_id === id),
      prescriptions: dbStore.prescriptions.filter(pr => pr.patient_id === id),
      labTests: dbStore.lab_tests.filter(l => l.patient_id === id),
      invoices: dbStore.invoices.filter(i => i.patient_id === id),
      admissions: dbStore.admissions.filter(adm => adm.patient_id === id)
    };
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
      medical_history: data.medical_history || 'No prior recorded history',
      documents: [],
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data: inserted, error } = await supabase.from('patients').insert([{
          id: newPatient.id,
          first_name: newPatient.first_name,
          last_name: newPatient.last_name,
          dob: newPatient.dob,
          gender: newPatient.gender,
          contact: newPatient.contact,
          address: newPatient.address,
          medical_history: newPatient.medical_history
        }]).select().single();
        if (!error && inserted) {
          dbStore.patients.unshift({ ...inserted, documents: [] });
          return inserted;
        }
      } catch (err) {
        console.warn('Supabase patientModel.create fallback:', err.message);
      }
    }

    dbStore.patients.unshift(newPatient);
    return newPatient;
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
        if (!error && data) {
          const idx = dbStore.patients.findIndex(p => p.id === id);
          if (idx !== -1) dbStore.patients[idx] = { ...dbStore.patients[idx], ...data };
          return data;
        }
      } catch (err) {
        console.warn('Supabase patientModel.update fallback:', err.message);
      }
    }

    const idx = dbStore.patients.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const updated = { ...dbStore.patients[idx], ...updates, id };
    dbStore.patients[idx] = updated;
    return updated;
  },

  async delete(id) {
    if (supabase) {
      try {
        const { error } = await supabase.from('patients').delete().eq('id', id);
        if (!error) {
          const idx = dbStore.patients.findIndex(p => p.id === id);
          if (idx !== -1) dbStore.patients.splice(idx, 1);
          return true;
        }
      } catch (err) {
        console.warn('Supabase patientModel.delete fallback:', err.message);
      }
    }

    const idx = dbStore.patients.findIndex(p => p.id === id);
    if (idx === -1) return false;
    dbStore.patients.splice(idx, 1);
    return true;
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
        if (!error && data) {
          const patient = dbStore.patients.find(p => p.id === patientId);
          if (patient) {
            if (!patient.documents) patient.documents = [];
            patient.documents.unshift(data);
          }
          return data;
        }
      } catch (err) {
        console.warn('Supabase patientModel.addDocument fallback:', err.message);
      }
    }

    const patient = dbStore.patients.find(p => p.id === patientId);
    if (patient) {
      if (!patient.documents) patient.documents = [];
      patient.documents.unshift(newDoc);
    }
    return newDoc;
  }
};
