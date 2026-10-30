import express from 'express';
import { systemController } from '../controllers/systemController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/audit-logs', authenticate, authorize('Administrator'), systemController.getAuditLogs);
router.get('/backup', authenticate, authorize('Administrator'), systemController.downloadBackup);
router.post('/restore', authenticate, authorize('Administrator'), systemController.restoreBackup);

export default router;
