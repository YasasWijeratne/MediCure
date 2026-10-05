import { systemModel } from '../models/systemModel.js';
import { logAuditEvent } from '../utils/helpers.js';

export const systemController = {
  async getAuditLogs(req, res) {
    try {
      const { action } = req.query;
      const logs = await systemModel.getAuditLogs(action);
      res.json({ success: true, count: logs.length, data: logs });
    } catch (err) {
      console.error('systemController.getAuditLogs error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve audit logs' });
    }
  },

  async downloadBackup(req, res) {
    try {
      const data = systemModel.getBackupData();
      const backupSnapshot = {
        exported_at: new Date().toISOString(),
        system: 'MediCure Hospital Management System',
        version: '1.0.0',
        data
      };

      logAuditEvent('SYSTEM_BACKUP', req.query.user_email || 'admin@medicure.org', 'Full system database backup snapshot generated');

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=medicure_backup_${Date.now()}.json`);
      res.json(backupSnapshot);
    } catch (err) {
      console.error('systemController.downloadBackup error:', err);
      res.status(500).json({ success: false, message: 'Failed to create backup snapshot' });
    }
  },

  async restoreBackup(req, res) {
    try {
      const { backupData, user_email } = req.body;

      if (!backupData || !backupData.data) {
        return res.status(400).json({ success: false, message: 'Invalid backup snapshot payload' });
      }

      systemModel.restoreData(backupData.data);
      logAuditEvent('SYSTEM_RESTORE', user_email || 'admin@medicure.org', 'System data restored from backup snapshot');

      res.json({
        success: true,
        message: 'System database successfully restored from snapshot'
      });
    } catch (err) {
      console.error('systemController.restoreBackup error:', err);
      res.status(500).json({ success: false, message: 'Restore failed: ' + err.message });
    }
  }
};
