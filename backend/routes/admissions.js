import express from 'express';
import { admissionController } from '../controllers/admissionController.js';

const router = express.Router();

router.get('/', admissionController.getAll);
router.get('/wards', admissionController.getWards);
router.post('/', admissionController.create);
router.put('/:id/discharge', admissionController.discharge);

export default router;
