import { pharmacyModel } from '../models/pharmacyModel.js';
import { patientModel } from '../models/patientModel.js';
import { billingModel } from '../models/billingModel.js';
import { generateId } from '../utils/helpers.js';

export const pharmacyController = {
  async getAll(req, res) {
    try {
      const { search, low_stock } = req.query;
      const results = await pharmacyModel.getAll({ search, low_stock });
      res.json({ success: true, count: results.length, data: results });
    } catch (err) {
      console.error('pharmacyController.getAll error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve medicines' });
    }
  },

  async create(req, res) {
    try {
      const { name, category, stock_qty, unit_price, expiry_date } = req.body;

      if (!name || !stock_qty || !unit_price) {
        return res.status(400).json({ success: false, message: 'Name, stock quantity, and unit price are required.' });
      }

      const newMedicine = await pharmacyModel.create({
        name,
        category,
        stock_qty,
        unit_price,
        expiry_date
      });

      res.status(201).json({
        success: true,
        message: 'Medicine added to inventory',
        data: newMedicine
      });
    } catch (err) {
      console.error('pharmacyController.create error:', err);
      res.status(500).json({ success: false, message: 'Failed to add medicine' });
    }
  },

  async update(req, res) {
    try {
      const updated = await pharmacyModel.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Medicine not found' });
      }

      res.json({
        success: true,
        message: 'Medicine updated successfully',
        data: updated
      });
    } catch (err) {
      console.error('pharmacyController.update error:', err);
      res.status(500).json({ success: false, message: 'Failed to update medicine' });
    }
  },

  async dispense(req, res) {
    try {
      const { patient_id, items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'No items specified for dispensing.' });
      }

      const { dispensedList, totalCost } = await pharmacyModel.dispense(patient_id, items);

      // Create or update invoice for patient
      if (patient_id && totalCost > 0) {
        const patient = await patientModel.getById(patient_id);
        const existingInvoices = await billingModel.getAll({ patient_id, status: 'Unpaid' });
        const unpaidInvoice = existingInvoices.length > 0 ? existingInvoices[0] : null;

        const pharmacyItems = dispensedList.map(d => ({
          id: generateId('ii'),
          item_type: 'Pharmacy',
          description: `Dispensed: ${d.name} x${d.qty}`,
          amount: d.cost
        }));

        if (unpaidInvoice) {
          const updatedItems = [...(unpaidInvoice.items || []), ...pharmacyItems];
          const newTotal = updatedItems.reduce((sum, it) => sum + it.amount, 0);
          await billingModel.create({
            ...unpaidInvoice,
            items: updatedItems,
            total_amount: newTotal
          });
        } else if (patient) {
          await billingModel.create({
            patient_id: patient.id,
            patient_name: `${patient.first_name} ${patient.last_name}`,
            total_amount: totalCost,
            status: 'Unpaid',
            items: pharmacyItems
          });
        }
      }

      res.json({
        success: true,
        message: 'Prescription medicines dispensed and inventory updated',
        dispensed: dispensedList,
        total_cost: totalCost
      });
    } catch (err) {
      console.error('pharmacyController.dispense error:', err);
      res.status(500).json({ success: false, message: 'Failed to dispense medicines' });
    }
  }
};
