import { admissionModel } from '../models/admissionModel.js';
import { patientModel } from '../models/patientModel.js';
import { billingModel } from '../models/billingModel.js';
import { dbStore, generateId, logAuditEvent } from '../db/store.js';

export const admissionController = {
  async getAll(req, res) {
    try {
      const { status, patient_id } = req.query;
      const results = await admissionModel.getAll({ status, patient_id });
      res.json({ success: true, count: results.length, data: results });
    } catch (err) {
      console.error('admissionController.getAll error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve admissions' });
    }
  },

  async getWards(req, res) {
    try {
      const wards = [
        { name: 'ICU (Intensive Care Unit)', total_beds: 10, daily_rate: 250 },
        { name: 'General Ward', total_beds: 30, daily_rate: 80 },
        { name: 'Pediatric Care', total_beds: 15, daily_rate: 110 },
        { name: 'Private Suites', total_beds: 12, daily_rate: 200 }
      ];

      const allAdmissions = await admissionModel.getAll();
      const activeAdmissions = allAdmissions.filter(a => a.status === 'Admitted');
      const occupiedBeds = activeAdmissions.length;
      const totalBeds = wards.reduce((sum, w) => sum + w.total_beds, 0);

      res.json({
        success: true,
        totalBeds,
        occupiedBeds,
        availableBeds: totalBeds - occupiedBeds,
        wards,
        activeAdmissions
      });
    } catch (err) {
      console.error('admissionController.getWards error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve ward occupancy' });
    }
  },

  async create(req, res) {
    try {
      const { patient_id, ward_type, room_no, bed_no, daily_rate, attending_doctor, admission_notes, user_email } = req.body;

      if (!patient_id || !room_no) {
        return res.status(400).json({ success: false, message: 'Patient ID and Room/Bed are required.' });
      }

      const patient = await patientModel.getById(patient_id);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      const patientName = `${patient.first_name} ${patient.last_name}`;
      const newAdmission = await admissionModel.create({
        patient_id,
        patient_name: patientName,
        ward_type: ward_type || 'General Ward',
        room_no,
        bed_no: bed_no || 'Bed-1',
        daily_rate: parseFloat(daily_rate) || 100.00,
        attending_doctor: attending_doctor || 'Attending Staff',
        admission_notes: admission_notes || 'Inpatient admission for clinical monitoring'
      });

      logAuditEvent('PATIENT_ADMITTED', user_email || 'staff@medicure.org', `Patient ${patientName} admitted to ${newAdmission.room_no}`);

      res.status(201).json({
        success: true,
        message: 'Patient admitted successfully',
        data: newAdmission
      });
    } catch (err) {
      console.error('admissionController.create error:', err);
      res.status(500).json({ success: false, message: 'Failed to admit patient' });
    }
  },

  async discharge(req, res) {
    try {
      const admission = await admissionModel.getById(req.params.id);
      if (!admission) {
        return res.status(404).json({ success: false, message: 'Admission record not found' });
      }

      if (admission.status === 'Discharged') {
        return res.status(400).json({ success: false, message: 'Patient is already discharged' });
      }

      const dischargeDate = new Date();
      const updatedAdmission = await admissionModel.discharge(req.params.id, dischargeDate);

      // Calculate days spent
      const admitDate = new Date(admission.admitted_at);
      const diffTime = Math.abs(dischargeDate - admitDate);
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const totalAdmissionFee = diffDays * admission.daily_rate;

      // Append or generate admission invoice
      const existingInvoices = await billingModel.getAll({ patient_id: admission.patient_id, status: 'Unpaid' });
      const unpaidInvoice = existingInvoices.length > 0 ? existingInvoices[0] : null;

      const itemDesc = `Room Admission (${admission.ward_type} - ${admission.room_no}) for ${diffDays} day(s)`;
      const admissionItem = {
        id: generateId('ii'),
        item_type: 'Admission',
        description: itemDesc,
        amount: totalAdmissionFee
      };

      let invoice = null;
      if (unpaidInvoice) {
        const updatedItems = [...(unpaidInvoice.items || []), admissionItem];
        const newTotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
        invoice = await billingModel.create({
          ...unpaidInvoice,
          items: updatedItems,
          total_amount: newTotal
        });
      } else {
        invoice = await billingModel.create({
          patient_id: admission.patient_id,
          patient_name: admission.patient_name,
          total_amount: totalAdmissionFee,
          status: 'Unpaid',
          items: [admissionItem]
        });
      }

      logAuditEvent('PATIENT_DISCHARGED', req.body.user_email || 'staff@medicure.org', `Patient ${admission.patient_name} discharged from ${admission.room_no}. Fee: $${totalAdmissionFee}`);

      res.json({
        success: true,
        message: `Patient discharged. ${diffDays} day(s) calculated for a total of $${totalAdmissionFee.toFixed(2)}`,
        data: updatedAdmission,
        invoice
      });
    } catch (err) {
      console.error('admissionController.discharge error:', err);
      res.status(500).json({ success: false, message: 'Failed to discharge patient' });
    }
  }
};
