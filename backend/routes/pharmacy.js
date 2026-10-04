import express from 'express';
import { pharmacyController } from '../controllers/pharmacyController.js';

const router = express.Router();

router.get('/', pharmacyController.getAll);
router.post('/', pharmacyController.create);
router.put('/:id', pharmacyController.update);
router.post('/dispense', pharmacyController.dispense);

export default router;
