import express from 'express';
import { labController } from '../controllers/labController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const labReadRoles = ['Administrator', 'Doctor', 'Nurse', 'Laboratory Staff', 'Patient'];
const labWriteRoles = ['Administrator', 'Doctor', 'Laboratory Staff'];

router.get('/', authenticate, authorize(...labReadRoles), labController.getAll);
router.post('/', authenticate, authorize(...labWriteRoles), labController.create);
router.put('/:id', authenticate, authorize(...labWriteRoles), labController.update);
router.delete('/:id', authenticate, authorize('Administrator', 'Laboratory Staff'), labController.delete);

export default router;
