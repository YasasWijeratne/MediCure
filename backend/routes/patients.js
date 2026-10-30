import express from 'express';
import { patientController } from '../controllers/patientController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const clinicalRoles = ['Administrator', 'Doctor', 'Nurse', 'Receptionist', 'Laboratory Staff'];

router.get('/', authenticate, authorize(...clinicalRoles), patientController.getAll);
router.get('/:id', authenticate, authorize(...clinicalRoles, 'Patient'), patientController.getById);
router.post('/', authenticate, authorize(...clinicalRoles), patientController.create);
router.put('/:id', authenticate, authorize(...clinicalRoles), patientController.update);
router.post('/:id/documents', authenticate, authorize(...clinicalRoles), patientController.addDocument);
router.delete('/:id', authenticate, authorize('Administrator', 'Receptionist'), patientController.delete);

export default router;
