import express from 'express';
import { emrController } from '../controllers/emrController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const emrReadRoles = ['Administrator', 'Doctor', 'Nurse', 'Patient'];
const emrWriteRoles = ['Administrator', 'Doctor', 'Nurse'];

router.get('/prescriptions', authenticate, authorize(...emrReadRoles), emrController.getPrescriptions);
router.get('/patient/:patient_id', authenticate, authorize(...emrReadRoles), emrController.getPatientEMR);
router.post('/prescriptions', authenticate, authorize(...emrWriteRoles), emrController.createPrescription);
router.put('/patient/:patient_id/vitals', authenticate, authorize(...emrWriteRoles), emrController.updateVitals);

export default router;
