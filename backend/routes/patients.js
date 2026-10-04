import express from 'express';
import { patientController } from '../controllers/patientController.js';

const router = express.Router();

router.get('/', patientController.getAll);
router.get('/:id', patientController.getById);
router.post('/', patientController.create);
router.put('/:id', patientController.update);
router.post('/:id/documents', patientController.addDocument);
router.delete('/:id', patientController.delete);

export default router;
