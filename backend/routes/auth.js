import express from 'express';
import { authController } from '../controllers/authController.js';

const router = express.Router();

// Routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/patient-register', authController.patientRegister);
router.get('/users', authController.getUsers);
router.post('/change-password', authController.changePassword);
router.get('/roles', authController.getRoles);

export default router;
