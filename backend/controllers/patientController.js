import { patientModel } from '../models/patientModel.js';
import { logAuditEvent } from '../utils/helpers.js';

export const patientController = {
  async getAll(req, res) {
    try {
      const { search } = req.query;
      const results = await patientModel.getAll(search);
      res.json({ success: true, count: results.length, data: results });
    } catch (err) {
      console.error('patientController.getAll error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve patients' });
    }
  },

  async getById(req, res) {
    try {
      const patient = await patientModel.getById(req.params.id);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }
      res.json({ success: true, data: patient });
    } catch (err) {
      console.error('patientController.getById error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve patient profile' });
    }
  },

  async create(req, res) {
    try {
      const { first_name, last_name, dob, gender, contact, address, medical_history } = req.body;

      if (!first_name || !last_name || !contact) {
        return res.status(400).json({ success: false, message: 'First name, last name, and contact are required.' });
      }

      const newPatient = await patientModel.create({
        first_name,
        last_name,
        dob,
        gender,
        contact,
        address,
        medical_history
      });

      logAuditEvent('PATIENT_REGISTERED', req.body.user_email, `Registered patient ${newPatient.first_name} ${newPatient.last_name}`);

      res.status(201).json({
        success: true,
        message: 'Patient registered successfully',
        data: newPatient
      });
    } catch (err) {
      console.error('patientController.create error:', err);
      res.status(500).json({ success: false, message: 'Failed to register patient' });
    }
  },

  async update(req, res) {
    try {
      const updated = await patientModel.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      logAuditEvent('PATIENT_UPDATED', req.body.user_email, `Updated patient profile ${updated.first_name} ${updated.last_name}`);

      res.json({
        success: true,
        message: 'Patient profile updated',
        data: updated
      });
    } catch (err) {
      console.error('patientController.update error:', err);
      res.status(500).json({ success: false, message: 'Failed to update patient profile' });
    }
  },

  async addDocument(req, res) {
    try {
      const { title, category } = req.body;
      if (!title) {
        return res.status(400).json({ success: false, message: 'Document title is required.' });
      }

      const patient = await patientModel.getById(req.params.id);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      const newDoc = await patientModel.addDocument(req.params.id, { title, category });
      logAuditEvent('DOCUMENT_UPLOADED', req.body.user_email, `Uploaded document "${title}" for patient ${patient.first_name} ${patient.last_name}`);

      res.status(201).json({
        success: true,
        message: 'Document recorded successfully',
        data: newDoc
      });
    } catch (err) {
      console.error('patientController.addDocument error:', err);
      res.status(500).json({ success: false, message: 'Failed to upload patient document' });
    }
  },

  async delete(req, res) {
    try {
      const success = await patientModel.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      logAuditEvent('PATIENT_DELETED', req.body.user_email, `Deleted patient record ${req.params.id}`);
      res.json({ success: true, message: 'Patient deleted successfully' });
    } catch (err) {
      console.error('patientController.delete error:', err);
      res.status(500).json({ success: false, message: 'Failed to delete patient' });
    }
  }
};
