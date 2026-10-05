import { supabase } from '../config/supabase.js';
import { logAuditEvent, generateId } from '../utils/helpers.js';

export const systemModel = {
  async getAuditLogs(action) {
    if (supabase) {
      try {
        let query = supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
        if (action) {
          query = query.ilike('action', `%${action}%`);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase systemModel.getAuditLogs error:', err.message);
      }
    }
    return [];
  },

  async logAudit(action, userEmail = 'system@medicure.org', details = '') {
    return await logAuditEvent(action, userEmail, details);
  },

  getBackupData() {
    return { status: 'Supabase Cloud Managed' };
  },

  restoreData(backupData) {
    return true;
  }
};
