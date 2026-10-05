import express from 'express';
import { labController } from '../controllers/labController.js';

const router = express.Router();

router.get('/', labController.getAll);
router.post('/', labController.create);
router.put('/:id', labController.update);
router.delete('/:id', labController.delete);

export default router;
