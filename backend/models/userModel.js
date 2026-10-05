import { supabase } from '../config/supabase.js';
import { generateId } from '../utils/helpers.js';

const DEFAULT_ROLES = [
  { id: 'r1', name: 'Administrator', permissions: ['all'] },
  { id: 'r2', name: 'Doctor', permissions: ['patients.view', 'appointments.manage', 'emr.manage', 'prescriptions.manage', 'lab.view', 'admissions.view'] },
  { id: 'r3', name: 'Nurse', permissions: ['patients.view', 'appointments.view', 'admissions.manage', 'emr.view'] },
  { id: 'r4', name: 'Receptionist', permissions: ['patients.manage', 'appointments.manage', 'invoices.view', 'admissions.manage'] },
  { id: 'r5', name: 'Laboratory Staff', permissions: ['lab.manage', 'patients.view'] },
  { id: 'r6', name: 'Pharmacist', permissions: ['pharmacy.manage', 'prescriptions.view'] },
  { id: 'r7', name: 'Accountant', permissions: ['billing.manage', 'invoices.manage', 'reports.financial'] },
  { id: 'r_patient', name: 'Patient', permissions: ['patient_portal'] }
];

export const userModel = {
  async findByUsernameOrEmail(identifier) {
    if (!identifier) return null;
    const lower = identifier.toLowerCase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .or(`username.ilike.${lower},email.ilike.${lower}`)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase query error in userModel.findByUsernameOrEmail:', err.message);
      }
    }
    return null;
  },

  async findById(id) {
    if (!id) return null;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase userModel.findById error:', err.message);
      }
    }
    return null;
  },

  async create(userData) {
    const newUser = {
      id: userData.id || generateId('u'),
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role_id: userData.role_id,
      role_name: userData.role_name,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();
        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase userModel.create error:', err.message);
      }
    }

    return newUser;
  },

  async getAll() {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, username, email, role_name, role_id, created_at');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase userModel.getAll error:', err.message);
      }
    }
    return [];
  },

  async updatePassword(idOrEmail, newPassword) {
    if (supabase) {
      try {
        const query = supabase.from('users').update({ password: newPassword });
        const { data, error } = await query
          .or(`id.eq.${idOrEmail},email.eq.${idOrEmail}`)
          .select();
        if (!error && data) {
          return true;
        }
      } catch (err) {
        console.warn('Supabase userModel.updatePassword error:', err.message);
      }
    }
    return false;
  },

  async getRoles() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('roles').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase userModel.getRoles error:', err.message);
      }
    }
    return DEFAULT_ROLES;
  }
};
