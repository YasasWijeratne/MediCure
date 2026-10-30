import express from 'express';
import { admissionController } from '../controllers/admissionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const admissionRoles = ['Administrator', 'Doctor', 'Nurse', 'Receptionist'];

router.get('/', authenticate, authorize(...admissionRoles), admissionController.getAll);
router.get('/wards', authenticate, authorize(...admissionRoles), admissionController.getWards);
router.post('/', authenticate, authorize(...admissionRoles), admissionController.create);
router.put('/:id/discharge', authenticate, authorize('Administrator', 'Doctor', 'Nurse'), admissionController.discharge);

export default router;
