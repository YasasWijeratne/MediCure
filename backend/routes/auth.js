import express from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// --- Public routes (no token required) ---
router.post('/login', authController.login);
router.post('/patient-register', authController.patientRegister);
router.post('/refresh', authController.refresh);

// --- Protected routes (token required) ---
router.post('/register', authenticate, authorize('Administrator'), authController.register);
router.get('/users', authenticate, authorize('Administrator'), authController.getUsers);
router.post('/change-password', authenticate, authController.changePassword);
router.get('/roles', authenticate, authController.getRoles);

export default router;
