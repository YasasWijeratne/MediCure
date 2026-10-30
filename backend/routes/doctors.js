import express from 'express';
import { doctorController } from '../controllers/doctorController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, doctorController.getAll);
router.get('/departments', authenticate, doctorController.getDepartments);
router.post('/', authenticate, authorize('Administrator', 'Receptionist'), doctorController.create);
router.put('/:id', authenticate, authorize('Administrator', 'Receptionist', 'Doctor'), doctorController.update);

export default router;
