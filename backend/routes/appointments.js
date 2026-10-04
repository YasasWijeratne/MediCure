import express from 'express';
import { appointmentController } from '../controllers/appointmentController.js';

const router = express.Router();

router.get('/', appointmentController.getAll);
router.post('/', appointmentController.create);
router.put('/:id/reschedule', appointmentController.reschedule);
router.put('/:id', appointmentController.update);
router.delete('/:id', appointmentController.cancel);

export default router;
