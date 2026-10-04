import { supabase } from '../config/supabase.js';
import { dbStore, logAuditEvent, generateId } from '../db/store.js';

export const systemModel = {
  async getAuditLogs(action) {
    if (supabase) {
      try {
        let query = supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
        if (action) {
          query = query.ilike('action', `%${action}%`);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase systemModel.getAuditLogs fallback:', err.message);
      }
    }

    let results = dbStore.audit_logs;
    if (action) {
      results = results.filter(l => l.action.toLowerCase().includes(action.toLowerCase()));
    }
    return results;
  },

  async logAudit(action, userEmail = 'system@medicure.org', details = '') {
    const entry = {
      id: generateId('log'),
      action,
      user_email: userEmail,
      ip_address: '127.0.0.1',
      details,
      timestamp: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('audit_logs').insert([entry]);
      } catch (err) {
        // quiet fallback
      }
    }

    dbStore.audit_logs.unshift(entry);
    return entry;
  },

  getBackupData() {
    return dbStore;
  },

  restoreData(backupData) {
    Object.keys(backupData).forEach(key => {
      if (dbStore[key] !== undefined) {
        dbStore[key] = backupData[key];
      }
    });
    return true;
  }
};
