import { billingModel } from '../models/billingModel.js';
import { patientModel } from '../models/patientModel.js';
import { generateId } from '../db/store.js';

export const billingController = {
  async getInvoices(req, res) {
    try {
      const { status, patient_id } = req.query;
      const results = await billingModel.getAll({ status, patient_id });
      res.json({ success: true, count: results.length, data: results });
    } catch (err) {
      console.error('billingController.getInvoices error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve invoices' });
    }
  },

  async getInvoiceById(req, res) {
    try {
      const invoice = await billingModel.getById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }
      res.json({ success: true, data: invoice });
    } catch (err) {
      console.error('billingController.getInvoiceById error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve invoice' });
    }
  },

  async createInvoice(req, res) {
    try {
      const { patient_id, items } = req.body;

      if (!patient_id || !items || !Array.isArray(items)) {
        return res.status(400).json({ success: false, message: 'Patient ID and itemized list are required.' });
      }

      const patient = await patientModel.getById(patient_id);

      const formattedItems = items.map(item => ({
        id: generateId('ii'),
        item_type: item.item_type || 'Consultation',
        description: item.description || 'Medical Service',
        amount: parseFloat(item.amount) || 0
      }));

      const totalAmount = formattedItems.reduce((sum, item) => sum + item.amount, 0);

      const newInvoice = await billingModel.create({
        patient_id,
        patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Patient',
        total_amount: totalAmount,
        status: 'Unpaid',
        items: formattedItems
      });

      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: newInvoice
      });
    } catch (err) {
      console.error('billingController.createInvoice error:', err);
      res.status(500).json({ success: false, message: 'Failed to create invoice' });
    }
  },

  async recordPayment(req, res) {
    try {
      const { amount_paid, payment_method } = req.body;
      const updatedInvoice = await billingModel.recordPayment(req.params.id, { amount_paid, payment_method });

      if (!updatedInvoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }

      res.json({
        success: true,
        message: 'Payment recorded successfully',
        invoice: updatedInvoice
      });
    } catch (err) {
      console.error('billingController.recordPayment error:', err);
      res.status(500).json({ success: false, message: 'Failed to record payment' });
    }
  }
};
