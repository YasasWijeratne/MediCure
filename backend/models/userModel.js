import { supabase } from '../config/supabase.js';
import { dbStore, generateId } from '../db/store.js';

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
        console.warn('Supabase query error in userModel.findByUsernameOrEmail, falling back to local store:', err.message);
      }
    }

    return dbStore.users.find(u =>
      (u.username && u.username.toLowerCase() === lower) ||
      (u.email && u.email.toLowerCase() === lower)
    ) || null;
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
        console.warn('Supabase userModel.findById fallback:', err.message);
      }
    }
    return dbStore.users.find(u => u.id === id) || null;
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
          dbStore.users.push(data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase userModel.create fallback:', err.message);
      }
    }

    dbStore.users.push(newUser);
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
        console.warn('Supabase userModel.getAll fallback:', err.message);
      }
    }

    return dbStore.users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role_name: u.role_name,
      role_id: u.role_id,
      created_at: u.created_at
    }));
  },

  async updatePassword(idOrEmail, newPassword) {
    if (supabase) {
      try {
        const query = supabase.from('users').update({ password: newPassword });
        const { data, error } = await query
          .or(`id.eq.${idOrEmail},email.eq.${idOrEmail}`)
          .select();
        if (!error && data) {
          const user = dbStore.users.find(u => u.id === idOrEmail || u.email === idOrEmail);
          if (user) user.password = newPassword;
          return true;
        }
      } catch (err) {
        console.warn('Supabase userModel.updatePassword fallback:', err.message);
      }
    }

    const user = dbStore.users.find(u => u.id === idOrEmail || u.email === idOrEmail);
    if (user) {
      user.password = newPassword;
      return true;
    }
    return false;
  },

  async getRoles() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('roles').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase userModel.getRoles fallback:', err.message);
      }
    }
    return dbStore.roles;
  }
};
