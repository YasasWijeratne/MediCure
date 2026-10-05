import { emrModel } from '../models/emrModel.js';
import { patientModel } from '../models/patientModel.js';
import { doctorModel } from '../models/doctorModel.js';
import { appointmentModel } from '../models/appointmentModel.js';
import { pharmacyModel } from '../models/pharmacyModel.js';
import { dbStore, generateId } from '../db/store.js';

export const emrController = {
  async getPrescriptions(req, res) {
    try {
      const { patient_id, doctor_id } = req.query;
      const results = await emrModel.getPrescriptions({ patient_id, doctor_id });
      res.json({ success: true, count: results.length, data: results });
    } catch (err) {
      console.error('emrController.getPrescriptions error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve prescriptions' });
    }
  },

  async getPatientEMR(req, res) {
    try {
      const emr = await emrModel.getPatientEMR(req.params.patient_id);
      if (!emr) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }
      res.json({ success: true, data: emr });
    } catch (err) {
      console.error('emrController.getPatientEMR error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve patient medical record' });
    }
  },

  async createPrescription(req, res) {
    try {
      const { appointment_id, doctor_id, patient_id, diagnosis, notes, items } = req.body;

      if (!patient_id || !doctor_id || !diagnosis) {
        return res.status(400).json({ success: false, message: 'Patient ID, Doctor ID, and Diagnosis are required.' });
      }

      const patient = await patientModel.getById(patient_id);
      const doctor = await doctorModel.getById(doctor_id);

      const formattedItems = (items || []).map(item => {
        const med = dbStore.medicines.find(m => m.id === item.medicine_id);
        return {
          id: generateId('rxi'),
          medicine_id: item.medicine_id || 'med1',
          medicine_name: med ? med.name : (item.medicine_name || 'Generic Medicine'),
          dosage: item.dosage || '1 tablet',
          frequency: item.frequency || 'Twice daily'
        };
      });

      const newPrescription = await emrModel.createPrescription({
        appointment_id: appointment_id || null,
        doctor_id,
        doctor_name: doctor ? doctor.name : 'Attending Physician',
        patient_id,
        patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Patient',
        diagnosis,
        notes: notes || '',
        items: formattedItems
      });

      // Update appointment status to Completed if linked
      if (appointment_id) {
        await appointmentModel.update(appointment_id, { status: 'Completed' });
      }

      res.status(201).json({
        success: true,
        message: 'Prescription recorded successfully',
        data: newPrescription
      });
    } catch (err) {
      console.error('emrController.createPrescription error:', err);
      res.status(500).json({ success: false, message: 'Failed to create prescription' });
    }
  },

  async updateVitals(req, res) {
    try {
      const { patient_id } = req.params;
      const updated = await emrModel.updatePatientVitals(patient_id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }
      res.json({
        success: true,
        message: 'Patient clinical vitals updated successfully',
        data: updated.vitals
      });
    } catch (err) {
      console.error('emrController.updateVitals error:', err);
      res.status(500).json({ success: false, message: 'Failed to update vitals' });
    }
  }
};
