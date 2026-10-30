import express from 'express';
import { staffController } from '../controllers/staffController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const staffAdminRoles = ['Administrator'];
const staffReadRoles = ['Administrator', 'Doctor', 'Nurse', 'Receptionist'];

router.get('/employees', authenticate, authorize(...staffAdminRoles), staffController.getEmployees);
router.post('/employees', authenticate, authorize(...staffAdminRoles), staffController.createEmployee);
router.get('/attendance', authenticate, authorize(...staffReadRoles), staffController.getAttendance);
router.post('/attendance', authenticate, authorize(...staffReadRoles), staffController.recordAttendance);
router.get('/leaves', authenticate, authorize(...staffReadRoles), staffController.getLeaves);
router.post('/leaves', authenticate, authorize(...staffReadRoles), staffController.applyLeave);
router.put('/leaves/:id/status', authenticate, authorize(...staffAdminRoles), staffController.updateLeaveStatus);

export default router;
