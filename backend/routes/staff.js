import express from 'express';
import { staffController } from '../controllers/staffController.js';

const router = express.Router();

router.get('/employees', staffController.getEmployees);
router.post('/employees', staffController.createEmployee);
router.get('/attendance', staffController.getAttendance);
router.post('/attendance', staffController.recordAttendance);
router.get('/leaves', staffController.getLeaves);
router.post('/leaves', staffController.applyLeave);
router.put('/leaves/:id/status', staffController.updateLeaveStatus);

export default router;
