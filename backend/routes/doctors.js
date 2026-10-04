import express from 'express';
import { doctorController } from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', doctorController.getAll);
router.get('/departments', doctorController.getDepartments);
router.post('/', doctorController.create);
router.put('/:id', doctorController.update);

export default router;
