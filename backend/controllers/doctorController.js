import { doctorModel } from '../models/doctorModel.js';

export const doctorController = {
  async getAll(req, res) {
    try {
      const { department_id } = req.query;
      const results = await doctorModel.getAll(department_id);
      res.json({ success: true, count: results.length, data: results });
    } catch (err) {
      console.error('doctorController.getAll error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve doctors' });
    }
  },

  async getDepartments(req, res) {
    try {
      const departments = await doctorModel.getDepartments();
      res.json({ success: true, data: departments });
    } catch (err) {
      console.error('doctorController.getDepartments error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve departments' });
    }
  },

  async create(req, res) {
    try {
      const { name, specialization, department_id, consultation_fee, contact, availability } = req.body;

      if (!name || !specialization) {
        return res.status(400).json({ success: false, message: 'Doctor name and specialization are required.' });
      }

      const newDoctor = await doctorModel.create({
        name,
        specialization,
        department_id,
        consultation_fee,
        contact,
        availability
      });

      res.status(201).json({
        success: true,
        message: 'Doctor profile created',
        data: newDoctor
      });
    } catch (err) {
      console.error('doctorController.create error:', err);
      res.status(500).json({ success: false, message: 'Failed to create doctor profile' });
    }
  },

  async update(req, res) {
    try {
      const updated = await doctorModel.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }

      res.json({
        success: true,
        message: 'Doctor profile updated',
        data: updated
      });
    } catch (err) {
      console.error('doctorController.update error:', err);
      res.status(500).json({ success: false, message: 'Failed to update doctor profile' });
    }
  }
};
