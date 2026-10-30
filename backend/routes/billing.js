import express from 'express';
import { billingController } from '../controllers/billingController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const billingReadRoles = ['Administrator', 'Accountant', 'Receptionist', 'Patient'];
const billingWriteRoles = ['Administrator', 'Accountant', 'Receptionist'];

router.get('/invoices', authenticate, authorize(...billingReadRoles), billingController.getInvoices);
router.get('/invoices/:id', authenticate, authorize(...billingReadRoles), billingController.getInvoiceById);
router.post('/invoices', authenticate, authorize(...billingWriteRoles), billingController.createInvoice);
router.post('/invoices/:id/payment', authenticate, authorize(...billingWriteRoles), billingController.recordPayment);

export default router;
