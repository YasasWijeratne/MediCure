import express from 'express';
import { systemController } from '../controllers/systemController.js';

const router = express.Router();

router.get('/audit-logs', systemController.getAuditLogs);
router.get('/backup', systemController.downloadBackup);
router.post('/restore', systemController.restoreBackup);

export default router;
