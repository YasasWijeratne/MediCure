import express from 'express';
import { billingController } from '../controllers/billingController.js';

const router = express.Router();

router.get('/invoices', billingController.getInvoices);
router.get('/invoices/:id', billingController.getInvoiceById);
router.post('/invoices', billingController.createInvoice);
router.post('/invoices/:id/payment', billingController.recordPayment);

export default router;
