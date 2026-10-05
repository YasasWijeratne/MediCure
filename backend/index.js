import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/supabase.js';

import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import doctorRoutes from './routes/doctors.js';
import appointmentRoutes from './routes/appointments.js';
import emrRoutes from './routes/emr.js';
import labRoutes from './routes/laboratory.js';
import pharmacyRoutes from './routes/pharmacy.js';
import billingRoutes from './routes/billing.js';
import staffRoutes from './routes/staff.js';
import analyticsRoutes from './routes/analytics.js';
import admissionRoutes from './routes/admissions.js';
import systemRoutes from './routes/system.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
const configuredOrigin = process.env.CORS_ORIGIN;
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || !configuredOrigin || configuredOrigin === '*') {
      return callback(null, true);
    }
    const origins = configuredOrigin.split(',').map(o => o.trim().replace(/\/+$/, ''));
    if (origins.includes(origin.replace(/\/+$/, ''))) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Support requests with or without /api prefix (graceful handling of misconfigured frontend base URLs)
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && req.url !== '/') {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  next();
});

// Root & Health check endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'MediCure Hospital Management System Backend',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/emr', emrRoutes);
app.use('/api/lab-tests', labRoutes);
app.use('/api/medicines', pharmacyRoutes);
app.use('/api', billingRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/system', systemRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'MediCure Hospital Management System Backend',
    timestamp: new Date().toISOString()
  });
});

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Start server and initialize DB
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🏥 MediCure HMS Backend API Server running on port ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
});
