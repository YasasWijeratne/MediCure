import { supabase } from '../config/supabase.js';
import { dbStore, generateId } from '../db/store.js';

export const billingModel = {
  async getAll(filters = {}) {
    const { status, patient_id } = filters;

    if (supabase) {
      try {
        let query = supabase.from('invoices').select('*, items:invoice_items(*), payments(*)').order('created_at', { ascending: false });
        if (status) query = query.eq('status', status);
        if (patient_id) query = query.eq('patient_id', patient_id);

        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase billingModel.getAll fallback:', err.message);
      }
    }

    let results = dbStore.invoices;
    if (status) results = results.filter(i => i.status.toLowerCase() === status.toLowerCase());
    if (patient_id) results = results.filter(i => i.patient_id === patient_id);
    return results;
  },

  async getById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*, items:invoice_items(*), payments(*)')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase billingModel.getById fallback:', err.message);
      }
    }
    return dbStore.invoices.find(i => i.id === id) || null;
  },

  async create(invoiceData) {
    const newInvoice = {
      id: invoiceData.id || generateId('inv'),
      patient_id: invoiceData.patient_id,
      patient_name: invoiceData.patient_name || 'Patient',
      total_amount: invoiceData.total_amount,
      status: invoiceData.status || 'Unpaid',
      created_at: new Date().toISOString(),
      items: invoiceData.items || [],
      payments: []
    };

    if (supabase) {
      try {
        const { data: invData, error: invError } = await supabase.from('invoices').insert([{
          id: newInvoice.id,
          patient_id: newInvoice.patient_id,
          patient_name: newInvoice.patient_name,
          total_amount: newInvoice.total_amount,
          status: newInvoice.status
        }]).select().single();

        if (!invError && invData && newInvoice.items.length > 0) {
          const itemsToInsert = newInvoice.items.map(it => ({
            id: it.id || generateId('ii'),
            invoice_id: newInvoice.id,
            item_type: it.item_type,
            description: it.description,
            amount: it.amount
          }));
          await supabase.from('invoice_items').insert(itemsToInsert);
          dbStore.invoices.unshift(newInvoice);
          return newInvoice;
        }
      } catch (err) {
        console.warn('Supabase billingModel.create fallback:', err.message);
      }
    }

    dbStore.invoices.unshift(newInvoice);
    return newInvoice;
  },

  async recordPayment(invoiceId, paymentData) {
    const invoice = await this.getById(invoiceId);
    if (!invoice) return null;

    const paidVal = parseFloat(paymentData.amount_paid) || invoice.total_amount;
    const newPayment = {
      id: generateId('pay'),
      invoice_id: invoiceId,
      amount_paid: paidVal,
      payment_method: paymentData.payment_method || 'Credit Card',
      paid_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('payments').insert([newPayment]);
      } catch (err) {
        console.warn('Supabase billingModel.recordPayment fallback:', err.message);
      }
    }

    if (!invoice.payments) invoice.payments = [];
    invoice.payments.push(newPayment);

    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount_paid, 0);
    let newStatus = 'Unpaid';
    if (totalPaid >= invoice.total_amount) {
      newStatus = 'Paid';
    } else if (totalPaid > 0) {
      newStatus = 'Partially Paid';
    }

    invoice.status = newStatus;

    if (supabase) {
      try {
        await supabase.from('invoices').update({ status: newStatus }).eq('id', invoiceId);
      } catch (err) {
        console.warn('Supabase update invoice status fallback:', err.message);
      }
    }

    const localInv = dbStore.invoices.find(i => i.id === invoiceId);
    if (localInv) {
      if (!localInv.payments) localInv.payments = [];
      if (!localInv.payments.some(p => p.id === newPayment.id)) {
        localInv.payments.push(newPayment);
      }
      localInv.status = newStatus;
    }

    return invoice;
  }
};
