import { supabase } from '../config/supabase.js';
import { generateId } from '../utils/helpers.js';

export const pharmacyModel = {
  async getAll(filters = {}) {
    const { search, low_stock } = filters;

    if (supabase) {
      try {
        let query = supabase.from('medicines').select('*').order('name', { ascending: true });
        if (search) {
          query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%`);
        }
        if (low_stock === 'true') {
          query = query.lte('stock_qty', 50);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase pharmacyModel.getAll error:', err.message);
      }
    }
    return [];
  },

  async getById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('medicines').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase pharmacyModel.getById error:', err.message);
      }
    }
    return null;
  },

  async create(data) {
    const newMedicine = {
      id: data.id || generateId('med'),
      name: data.name,
      category: data.category || 'General',
      stock_qty: parseInt(data.stock_qty),
      unit_price: parseFloat(data.unit_price),
      expiry_date: data.expiry_date || '2027-12-31',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data: inserted, error } = await supabase.from('medicines').insert([newMedicine]).select().single();
        if (!error && inserted) return inserted;
      } catch (err) {
        console.warn('Supabase pharmacyModel.create error:', err.message);
      }
    }
    return newMedicine;
  },

  async update(id, updates) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('medicines').update(updates).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase pharmacyModel.update error:', err.message);
      }
    }
    return { ...updates, id };
  },

  async dispense(patientId, items) {
    let totalCost = 0;
    const dispensedList = [];

    for (const item of items) {
      const med = await this.getById(item.medicine_id);
      if (med) {
        const qty = parseInt(item.quantity) || 1;
        const newStock = Math.max(0, med.stock_qty - qty);
        await this.update(med.id, { stock_qty: newStock });
        const cost = med.unit_price * qty;
        totalCost += cost;
        dispensedList.push({
          medicine_id: med.id,
          name: med.name,
          qty,
          unit_price: med.unit_price,
          cost
        });
      }
    }

    return { dispensedList, totalCost };
  }
};
