import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth.js';
import { assertPatientAccess, patientFilter } from '../middleware/patientAccess.js';
import { getJwtSecret } from '../config/security.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-that-is-at-least-32-characters';

const request = (port, path, options = {}) => new Promise((resolve, reject) => {
  const req = http.request({
    hostname: '127.0.0.1',
    port,
    method: options.method || 'GET',
    path,
    headers: options.headers || {}
  }, res => {
    let body = '';
    res.on('data', chunk => { body += chunk; });
    res.on('end', () => resolve({ status: res.statusCode, body: body ? JSON.parse(body) : null }));
  });
  req.on('error', reject);
  req.end();
});

const createServer = () => {
  const app = express();
  app.get('/patient/:id', authenticate, (req, res) => {
    if (!assertPatientAccess(req, res, req.params.id)) return;
    res.json({ success: true });
  });
  return http.createServer(app);
};

test('patient requests cannot access another patient record', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const token = jwt.sign({ id: 'user-1', role: 'Patient', patient_id: 'patient-1' }, process.env.JWT_SECRET);

  const response = await request(port, '/patient/patient-2', {
    headers: { Authorization: `Bearer ${token}` }
  });

  assert.equal(response.status, 403);
  server.close();
});

test('patient filters always use the patient ID from the token', () => {
  const req = { user: { role: 'Patient', patient_id: 'patient-1' } };
  assert.equal(patientFilter(req, 'patient-2'), 'patient-1');
});

test('patient accounts without a linked record cannot be treated as unfiltered', () => {
  const req = { user: { role: 'Patient' } };
  assert.equal(patientFilter(req, 'patient-2'), null);
});

test('JWT configuration rejects missing secrets', () => {
  const originalSecret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  assert.throws(() => getJwtSecret(), /JWT_SECRET must be configured/);
  process.env.JWT_SECRET = originalSecret;
});
