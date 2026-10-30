import express from 'express';
import { pharmacyController } from '../controllers/pharmacyController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const pharmacyRoles = ['Administrator', 'Pharmacist', 'Doctor', 'Nurse'];

router.get('/', authenticate, authorize(...pharmacyRoles), pharmacyController.getAll);
router.post('/', authenticate, authorize('Administrator', 'Pharmacist'), pharmacyController.create);
router.put('/:id', authenticate, authorize('Administrator', 'Pharmacist'), pharmacyController.update);
router.post('/dispense', authenticate, authorize(...pharmacyRoles), pharmacyController.dispense);

export default router;
