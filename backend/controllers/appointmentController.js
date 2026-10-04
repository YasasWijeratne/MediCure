import { appointmentModel } from '../models/appointmentModel.js';
import { patientModel } from '../models/patientModel.js';
import { doctorModel } from '../models/doctorModel.js';
import { billingModel } from '../models/billingModel.js';
import { generateId, logAuditEvent } from '../db/store.js';

export const appointmentController = {
  async getAll(req, res) {
    try {
      const { status, doctor_id, patient_id } = req.query;
      const results = await appointmentModel.getAll({ status, doctor_id, patient_id });
      res.json({ success: true, count: results.length, data: results });
    } catch (err) {
      console.error('appointmentController.getAll error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve appointments' });
    }
  },

  async getById(req, res) {
    try {
      const appointment = await appointmentModel.getById(req.params.id);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
      res.json({ success: true, data: appointment });
    } catch (err) {
      console.error('appointmentController.getById error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve appointment' });
    }
  },

  async create(req, res) {
    try {
      const { patient_id, doctor_id, scheduled_at, notes, user_email } = req.body;

      if (!patient_id || !doctor_id || !scheduled_at) {
        return res.status(400).json({ success: false, message: 'Patient, Doctor, and Appointment Date/Time are required.' });
      }

      const patient = await patientModel.getById(patient_id);
      const doctor = await doctorModel.getById(doctor_id);

      if (!patient || !doctor) {
        return res.status(404).json({ success: false, message: 'Specified patient or doctor not found.' });
      }

      const patientName = `${patient.first_name} ${patient.last_name}`;
      const newAppointment = await appointmentModel.create({
        patient_id: patient.id,
        patient_name: patientName,
        doctor_id: doctor.id,
        doctor_name: doctor.name,
        scheduled_at,
        status: 'Scheduled',
        notes: notes || 'General Consultation'
      });

      // Automatically generate an unpaid invoice for consultation fee
      const newInvoice = await billingModel.create({
        patient_id: patient.id,
        patient_name: patientName,
        total_amount: doctor.consultation_fee,
        status: 'Unpaid',
        items: [
          {
            id: generateId('ii'),
            item_type: 'Consultation',
            description: `Consultation Fee - ${doctor.name} (${doctor.specialization})`,
            amount: doctor.consultation_fee
          }
        ]
      });

      logAuditEvent('APPOINTMENT_BOOKED', user_email, `Appointment scheduled for ${patientName} with ${doctor.name}`);

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        data: newAppointment,
        invoice: newInvoice
      });
    } catch (err) {
      console.error('appointmentController.create error:', err);
      res.status(500).json({ success: false, message: 'Failed to book appointment' });
    }
  },

  async reschedule(req, res) {
    try {
      const { scheduled_at, notes, user_email } = req.body;
      if (!scheduled_at) {
        return res.status(400).json({ success: false, message: 'New date and time required' });
      }

      const existing = await appointmentModel.getById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      const updated = await appointmentModel.update(req.params.id, {
        scheduled_at,
        notes: notes || existing.notes,
        status: 'Scheduled'
      });

      logAuditEvent('APPOINTMENT_RESCHEDULED', user_email, `Rescheduled appointment ${existing.id} for ${existing.patient_name} to ${scheduled_at}`);

      res.json({
        success: true,
        message: 'Appointment successfully rescheduled',
        data: updated
      });
    } catch (err) {
      console.error('appointmentController.reschedule error:', err);
      res.status(500).json({ success: false, message: 'Failed to reschedule appointment' });
    }
  },

  async update(req, res) {
    try {
      const existing = await appointmentModel.getById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      const updated = await appointmentModel.update(req.params.id, req.body);
      logAuditEvent('APPOINTMENT_STATUS_UPDATE', req.body.user_email, `Appointment ${existing.id} status changed to ${updated.status}`);

      res.json({
        success: true,
        message: 'Appointment updated successfully',
        data: updated
      });
    } catch (err) {
      console.error('appointmentController.update error:', err);
      res.status(500).json({ success: false, message: 'Failed to update appointment' });
    }
  },

  async cancel(req, res) {
    try {
      const existing = await appointmentModel.getById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      await appointmentModel.cancel(req.params.id);
      logAuditEvent('APPOINTMENT_CANCELLED', req.body?.user_email, `Appointment ${existing.id} marked as cancelled`);

      res.json({ success: true, message: 'Appointment marked as cancelled' });
    } catch (err) {
      console.error('appointmentController.cancel error:', err);
      res.status(500).json({ success: false, message: 'Failed to cancel appointment' });
    }
  }
};
