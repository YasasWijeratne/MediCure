import { labModel } from '../models/labModel.js';
import { patientModel } from '../models/patientModel.js';
import { billingModel } from '../models/billingModel.js';
import { generateId } from '../utils/helpers.js';

export const labController = {
  async getAll(req, res) {
    try {
      const { sample_status, patient_id } = req.query;
      const results = await labModel.getAll({ sample_status, patient_id });
      res.json({ success: true, count: results.length, data: results });
    } catch (err) {
      console.error('labController.getAll error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve lab tests' });
    }
  },

  async create(req, res) {
    try {
      const { patient_id, test_name, fee } = req.body;

      if (!patient_id || !test_name) {
        return res.status(400).json({ success: false, message: 'Patient ID and Test Name are required.' });
      }

      const patient = await patientModel.getById(patient_id);
      const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'Patient';

      const newTest = await labModel.create({
        patient_id,
        patient_name: patientName,
        test_name,
        sample_status: 'Requested',
        result_data: 'Pending sample collection and analysis',
        report_url: '#'
      });

      // Optional automatic invoice generation
      const testFee = parseFloat(fee) || 75.00;
      const existingInvoices = await billingModel.getAll({ patient_id, status: 'Unpaid' });
      const unpaidInvoice = existingInvoices.length > 0 ? existingInvoices[0] : null;

      const labItem = {
        id: generateId('ii'),
        item_type: 'Laboratory',
        description: `Lab Test: ${test_name}`,
        amount: testFee
      };

      if (unpaidInvoice) {
        const updatedItems = [...(unpaidInvoice.items || []), labItem];
        const newTotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
        await billingModel.create({
          ...unpaidInvoice,
          items: updatedItems,
          total_amount: newTotal
        });
      } else if (patient) {
        await billingModel.create({
          patient_id: patient.id,
          patient_name: patientName,
          total_amount: testFee,
          status: 'Unpaid',
          items: [labItem]
        });
      }

      res.status(201).json({
        success: true,
        message: 'Laboratory test requested',
        data: newTest
      });
    } catch (err) {
      console.error('labController.create error:', err);
      res.status(500).json({ success: false, message: 'Failed to request lab test' });
    }
  },

  async update(req, res) {
    try {
      const updated = await labModel.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Lab test not found' });
      }

      res.json({
        success: true,
        message: 'Lab test status and results updated',
        data: updated
      });
    } catch (err) {
      console.error('labController.update error:', err);
      res.status(500).json({ success: false, message: 'Failed to update lab test' });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await labModel.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Lab test not found' });
      }
      res.json({ success: true, message: 'Lab test order cancelled and removed' });
    } catch (err) {
      console.error('labController.delete error:', err);
      res.status(500).json({ success: false, message: 'Failed to delete lab test' });
    }
  }
};
