import express from 'express';
import { emrController } from '../controllers/emrController.js';

const router = express.Router();

router.get('/prescriptions', emrController.getPrescriptions);
router.get('/patient/:patient_id', emrController.getPatientEMR);
router.post('/prescriptions', emrController.createPrescription);
router.put('/patient/:patient_id/vitals', emrController.updateVitals);

export default router;
