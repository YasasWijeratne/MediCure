import { randomUUID } from 'crypto';
import { supabase } from '../config/supabase.js';

export const generateId = (prefix = 'id') => {
  return `${prefix}_${randomUUID().substring(0, 8)}`;
};

export const logAuditEvent = async (action, userEmail = 'system@medicure.org', details = '') => {
  const entry = {
    id: generateId('log'),
    action,
    user_email: userEmail,
    ip_address: '127.0.0.1',
    details: typeof details === 'object' ? JSON.stringify(details) : String(details),
    timestamp: new Date().toISOString()
  };

  if (supabase) {
    try {
      await supabase.from('audit_logs').insert([entry]);
    } catch (err) {
      // quiet fallback
    }
  }

  return entry;
};
