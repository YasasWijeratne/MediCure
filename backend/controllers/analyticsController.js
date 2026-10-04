import { analyticsModel } from '../models/analyticsModel.js';

export const analyticsController = {
  async getSummary(req, res) {
    try {
      const summary = await analyticsModel.getSummary();
      res.json({
        success: true,
        data: summary
      });
    } catch (err) {
      console.error('analyticsController.getSummary error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve analytics summary' });
    }
  }
};
