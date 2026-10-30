import express from 'express';
import { appointmentController } from '../controllers/appointmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const appointmentRoles = ['Administrator', 'Doctor', 'Nurse', 'Receptionist', 'Patient'];

router.get('/', authenticate, authorize(...appointmentRoles), appointmentController.getAll);
router.post('/', authenticate, authorize(...appointmentRoles), appointmentController.create);
router.put('/:id/reschedule', authenticate, authorize(...appointmentRoles), appointmentController.reschedule);
router.put('/:id', authenticate, authorize(...appointmentRoles), appointmentController.update);
router.delete('/:id', authenticate, authorize('Administrator', 'Doctor', 'Receptionist', 'Patient'), appointmentController.cancel);

export default router;
