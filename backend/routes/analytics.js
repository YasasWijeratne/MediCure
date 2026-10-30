import express from 'express';
import { analyticsController } from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', authenticate, authorize('Administrator', 'Doctor', 'Accountant', 'Laboratory Staff', 'Pharmacist'), analyticsController.getSummary);

export default router;
