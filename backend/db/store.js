import { randomUUID } from 'crypto';

// In-Memory Data Store seeded with realistic hospital data for MediCure HMS

export const dbStore = {
  roles: [
    { id: 'r1', name: 'Administrator', permissions: ['all'] },
    { id: 'r2', name: 'Doctor', permissions: ['patients.view', 'appointments.manage', 'emr.manage', 'prescriptions.manage', 'lab.view', 'admissions.view'] },
    { id: 'r3', name: 'Nurse', permissions: ['patients.view', 'appointments.view', 'admissions.manage', 'emr.view'] },
    { id: 'r4', name: 'Receptionist', permissions: ['patients.manage', 'appointments.manage', 'invoices.view', 'admissions.manage'] },
    { id: 'r5', name: 'Laboratory Staff', permissions: ['lab.manage', 'patients.view'] },
    { id: 'r6', name: 'Pharmacist', permissions: ['pharmacy.manage', 'prescriptions.view'] },
    { id: 'r7', name: 'Accountant', permissions: ['billing.manage', 'invoices.manage', 'reports.financial'] },
    { id: 'r_patient', name: 'Patient', permissions: ['patient_portal'] },
  ],

  users: [
    { id: 'u1', username: 'admin', email: 'admin@medicure.org', password: 'scrypt:ac0b6be444ec43f3156e9637bbe564f8:cb6c876a5d170db42b62ce2eea1320a76911a08c1a2e7d5346bde24f88f75aa50877108a2898d154fdc26317a549663956c4ed596c3b365888c3fa7fface97e7', role_id: 'r1', role_name: 'Administrator', created_at: '2026-01-10T08:00:00Z' },
    { id: 'u2', username: 'dr.sarah', email: 'dr.sarah@medicure.org', password: 'scrypt:ac0b6be444ec43f3156e9637bbe564f8:cb6c876a5d170db42b62ce2eea1320a76911a08c1a2e7d5346bde24f88f75aa50877108a2898d154fdc26317a549663956c4ed596c3b365888c3fa7fface97e7', role_id: 'r2', role_name: 'Doctor', created_at: '2026-01-11T09:30:00Z' },
    { id: 'u3', username: 'dr.marcus', email: 'dr.marcus@medicure.org', password: 'scrypt:ac0b6be444ec43f3156e9637bbe564f8:cb6c876a5d170db42b62ce2eea1320a76911a08c1a2e7d5346bde24f88f75aa50877108a2898d154fdc26317a549663956c4ed596c3b365888c3fa7fface97e7', role_id: 'r2', role_name: 'Doctor', created_at: '2026-01-12T10:15:00Z' },
    { id: 'u4', username: 'nurse.elena', email: 'nurse.elena@medicure.org', password: 'scrypt:ac0b6be444ec43f3156e9637bbe564f8:cb6c876a5d170db42b62ce2eea1320a76911a08c1a2e7d5346bde24f88f75aa50877108a2898d154fdc26317a549663956c4ed596c3b365888c3fa7fface97e7', role_id: 'r3', role_name: 'Nurse', created_at: '2026-01-14T07:45:00Z' },
    { id: 'u5', username: 'reception', email: 'reception@medicure.org', password: 'scrypt:ac0b6be444ec43f3156e9637bbe564f8:cb6c876a5d170db42b62ce2eea1320a76911a08c1a2e7d5346bde24f88f75aa50877108a2898d154fdc26317a549663956c4ed596c3b365888c3fa7fface97e7', role_id: 'r4', role_name: 'Receptionist', created_at: '2026-01-15T08:30:00Z' },
    { id: 'u6', username: 'lab.tech', email: 'lab.tech@medicure.org', password: 'scrypt:ac0b6be444ec43f3156e9637bbe564f8:cb6c876a5d170db42b62ce2eea1320a76911a08c1a2e7d5346bde24f88f75aa50877108a2898d154fdc26317a549663956c4ed596c3b365888c3fa7fface97e7', role_id: 'r5', role_name: 'Laboratory Staff', created_at: '2026-01-16T09:00:00Z' },
    { id: 'u7', username: 'pharmacy', email: 'pharmacy@medicure.org', password: 'scrypt:ac0b6be444ec43f3156e9637bbe564f8:cb6c876a5d170db42b62ce2eea1320a76911a08c1a2e7d5346bde24f88f75aa50877108a2898d154fdc26317a549663956c4ed596c3b365888c3fa7fface97e7', role_id: 'r6', role_name: 'Pharmacist', created_at: '2026-01-17T08:15:00Z' },
    { id: 'u8', username: 'billing', email: 'billing@medicure.org', password: 'scrypt:ac0b6be444ec43f3156e9637bbe564f8:cb6c876a5d170db42b62ce2eea1320a76911a08c1a2e7d5346bde24f88f75aa50877108a2898d154fdc26317a549663956c4ed596c3b365888c3fa7fface97e7', role_id: 'r7', role_name: 'Accountant', created_at: '2026-01-18T11:00:00Z' },
    { id: 'u_pat1', username: 'john.doe', email: 'john.doe@medicure.org', password: 'scrypt:ac0b6be444ec43f3156e9637bbe564f8:cb6c876a5d170db42b62ce2eea1320a76911a08c1a2e7d5346bde24f88f75aa50877108a2898d154fdc26317a549663956c4ed596c3b365888c3fa7fface97e7', role_id: 'r_patient', role_name: 'Patient', patient_id: 'pat1', created_at: '2026-01-20T10:00:00Z' },
    { id: 'u_pat2', username: 'alice.smith', email: 'alice.smith@medicure.org', password: 'scrypt:ac0b6be444ec43f3156e9637bbe564f8:cb6c876a5d170db42b62ce2eea1320a76911a08c1a2e7d5346bde24f88f75aa50877108a2898d154fdc26317a549663956c4ed596c3b365888c3fa7fface97e7', role_id: 'r_patient', role_name: 'Patient', patient_id: 'pat2', created_at: '2026-01-21T10:00:00Z' },
  ],

  departments: [
    { id: 'dep1', name: 'Cardiology', description: 'Heart and cardiovascular system disorders' },
    { id: 'dep2', name: 'Neurology', description: 'Brain, spinal cord, and nervous system care' },
    { id: 'dep3', name: 'Pediatrics', description: 'Infant, child, and adolescent medicine' },
    { id: 'dep4', name: 'Orthopedics', description: 'Bones, joints, ligaments, and tendons' },
    { id: 'dep5', name: 'General Medicine', description: 'Primary healthcare and internal medicine' },
    { id: 'dep6', name: 'Emergency Care', description: '24/7 Acute critical care and trauma service' },
  ],

  employees: [
    { id: 'emp1', user_id: 'u2', name: 'Dr. Sarah Jenkins', department_id: 'dep1', department_name: 'Cardiology', designation: 'Senior Cardiologist', joined_date: '2022-03-15' },
    { id: 'emp2', user_id: 'u3', name: 'Dr. Marcus Vance', department_id: 'dep2', department_name: 'Neurology', designation: 'Lead Neurologist', joined_date: '2021-08-01' },
    { id: 'emp3', user_id: 'u4', name: 'Elena Rostova', department_id: 'dep6', department_name: 'Emergency Care', designation: 'Head Nurse', joined_date: '2023-01-10' },
    { id: 'emp4', user_id: 'u5', name: 'James Carter', department_id: 'dep5', department_name: 'General Medicine', designation: 'Lead Receptionist', joined_date: '2023-05-20' },
    { id: 'emp5', user_id: 'u6', name: 'Maya Lin', department_id: 'dep5', department_name: 'General Medicine', designation: 'Chief Lab Officer', joined_date: '2022-11-12' },
  ],

  doctors: [
    { id: 'doc1', employee_id: 'emp1', name: 'Dr. Sarah Jenkins', specialization: 'Cardiology', department_id: 'dep1', department_name: 'Cardiology', consultation_fee: 120.00, contact: '+1 (555) 234-5678', availability: 'Mon - Fri, 09:00 - 16:00' },
    { id: 'doc2', employee_id: 'emp2', name: 'Dr. Marcus Vance', specialization: 'Neurology', department_id: 'dep2', department_name: 'Neurology', consultation_fee: 150.00, contact: '+1 (555) 345-6789', availability: 'Tue - Sat, 10:00 - 17:00' },
    { id: 'doc3', employee_id: 'emp3', name: 'Dr. Aris Thorne', specialization: 'Pediatrics', department_id: 'dep3', department_name: 'Pediatrics', consultation_fee: 95.00, contact: '+1 (555) 456-7890', availability: 'Mon - Thu, 08:30 - 15:30' },
    { id: 'doc4', employee_id: 'emp4', name: 'Dr. Sophia Reyes', specialization: 'Orthopedics', department_id: 'dep4', department_name: 'Orthopedics', consultation_fee: 140.00, contact: '+1 (555) 567-8901', availability: 'Wed - Sun, 09:00 - 17:00' },
  ],

  patients: [
    {
      id: 'pat1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@medicure.org',
      dob: '1985-06-14',
      gender: 'Male',
      contact: '+1 (555) 111-2233',
      address: '742 Evergreen Terrace, Springfield',
      medical_history: 'Hypertension, Mild Asthma',
      vitals: {
        blood_group: 'A+',
        height_cm: 178,
        weight_kg: 74.5,
        bmi: '23.5',
        bmi_status: 'Normal',
        heart_rate: 72,
        hr_status: 'Normal Sinus',
        bp_systolic: 128,
        bp_diastolic: 82,
        bp_status: 'Controlled',
        spo2: 97,
        spo2_status: 'Room Air',
        temperature: 98.6,
        temp_status: 'Afebrile',
        last_updated: '2026-10-04T08:00:00Z'
      },
      documents: [
        { id: 'doc_1', title: 'Chest X-Ray Digital Scan', category: 'Radiology', uploaded_at: '2026-09-22', url: '#' },
        { id: 'doc_2', title: 'Primary Health Insurance Card', category: 'Insurance', uploaded_at: '2026-09-20', url: '#' }
      ]
    },
    {
      id: 'pat2',
      first_name: 'Alice',
      last_name: 'Smith',
      email: 'alice.smith@medicure.org',
      dob: '1992-11-03',
      gender: 'Female',
      contact: '+1 (555) 222-3344',
      address: '1088 Ocean Drive, Miami, FL',
      medical_history: 'Type 2 Diabetes, Allergy to Penicillin',
      vitals: {
        blood_group: 'O+',
        height_cm: 165,
        weight_kg: 58.0,
        bmi: '21.3',
        bmi_status: 'Normal',
        heart_rate: 76,
        hr_status: 'Normal Sinus',
        bp_systolic: 118,
        bp_diastolic: 76,
        bp_status: 'Optimal',
        spo2: 99,
        spo2_status: 'Room Air',
        temperature: 98.2,
        temp_status: 'Afebrile',
        last_updated: '2026-10-04T09:30:00Z'
      },
      documents: [
        { id: 'doc_3', title: 'Endocrinology Prior Labs', category: 'Lab Report', uploaded_at: '2026-10-01', url: '#' }
      ]
    },
    {
      id: 'pat3',
      first_name: 'Robert',
      last_name: 'Johnson',
      dob: '1974-02-28',
      gender: 'Male',
      contact: '+1 (555) 333-4455',
      address: '42 Wallaby Way, Sydney',
      medical_history: 'Coronary Artery Stent (2023)',
      vitals: {
        blood_group: 'O-',
        height_cm: 182,
        weight_kg: 85.0,
        bmi: '25.7',
        bmi_status: 'Slightly Elevated',
        heart_rate: 82,
        hr_status: 'Cardiac Telemetry Monitored',
        bp_systolic: 135,
        bp_diastolic: 88,
        bp_status: 'Stage 1 Elevated',
        spo2: 96,
        spo2_status: 'Room Air',
        temperature: 99.1,
        temp_status: 'Low Grade Temp',
        last_updated: '2026-10-03T10:45:00Z'
      },
      documents: []
    },
    {
      id: 'pat4',
      first_name: 'Emily',
      last_name: 'Davis',
      dob: '2001-08-19',
      gender: 'Female',
      contact: '+1 (555) 444-5566',
      address: '15 Baker Street, London',
      medical_history: 'Migraine episodes',
      vitals: {
        blood_group: 'B+',
        height_cm: 168,
        weight_kg: 62.0,
        bmi: '22.0',
        bmi_status: 'Normal',
        heart_rate: 68,
        hr_status: 'Normal Sinus',
        bp_systolic: 115,
        bp_diastolic: 72,
        bp_status: 'Optimal',
        spo2: 99,
        spo2_status: 'Room Air',
        temperature: 98.4,
        temp_status: 'Afebrile',
        last_updated: '2026-10-02T11:00:00Z'
      },
      documents: []
    },
  ],

  appointments: [
    { id: 'apt1', patient_id: 'pat1', patient_name: 'John Doe', doctor_id: 'doc1', doctor_name: 'Dr. Sarah Jenkins', scheduled_at: '2026-10-04T10:00:00Z', status: 'Scheduled', notes: 'Routine ECG & Blood Pressure evaluation' },
    { id: 'apt2', patient_id: 'pat2', patient_name: 'Alice Smith', doctor_id: 'doc2', doctor_name: 'Dr. Marcus Vance', scheduled_at: '2026-10-04T11:30:00Z', status: 'Scheduled', notes: 'Chronic headache consultation' },
    { id: 'apt3', patient_id: 'pat3', patient_name: 'Robert Johnson', doctor_id: 'doc1', doctor_name: 'Dr. Sarah Jenkins', scheduled_at: '2026-10-03T09:00:00Z', status: 'Completed', notes: 'Post-surgery cardiac checkup' },
    { id: 'apt4', patient_id: 'pat4', patient_name: 'Emily Davis', doctor_id: 'doc3', doctor_name: 'Dr. Aris Thorne', scheduled_at: '2026-10-02T14:00:00Z', status: 'Cancelled', notes: 'Patient requested cancellation' },
  ],

  // Inpatient & Outpatient Admissions
  admissions: [
    {
      id: 'adm1',
      patient_id: 'pat3',
      patient_name: 'Robert Johnson',
      ward_type: 'ICU',
      room_no: 'ICU-302',
      bed_no: 'Bed-A',
      daily_rate: 250.00,
      admitted_at: '2026-10-01T14:20:00Z',
      discharged_at: null,
      status: 'Admitted',
      attending_doctor: 'Dr. Sarah Jenkins',
      admission_notes: 'Acute cardiac monitoring post-procedure'
    },
    {
      id: 'adm2',
      patient_id: 'pat1',
      patient_name: 'John Doe',
      ward_type: 'General Ward',
      room_no: 'WARD-104',
      bed_no: 'Bed-3',
      daily_rate: 80.00,
      admitted_at: '2026-09-20T10:00:00Z',
      discharged_at: '2026-09-24T11:00:00Z',
      status: 'Discharged',
      attending_doctor: 'Dr. Sarah Jenkins',
      admission_notes: 'Observation for severe respiratory distress'
    }
  ],

  prescriptions: [
    {
      id: 'rx1',
      appointment_id: 'apt3',
      doctor_id: 'doc1',
      doctor_name: 'Dr. Sarah Jenkins',
      patient_id: 'pat3',
      patient_name: 'Robert Johnson',
      diagnosis: 'Stable Angina Pectoris',
      notes: 'Maintain low-sodium diet and daily exercise regimen.',
      created_at: '2026-10-03T09:30:00Z',
      items: [
        { id: 'rxi1', medicine_id: 'med1', medicine_name: 'Atorvastatin 20mg', dosage: '20mg', frequency: 'Once daily at bedtime' },
        { id: 'rxi2', medicine_id: 'med2', medicine_name: 'Aspirin 81mg', dosage: '81mg', frequency: 'Once daily after breakfast' }
      ]
    }
  ],

  medicines: [
    { id: 'med1', name: 'Atorvastatin 20mg', category: 'Cardiovascular', stock_qty: 320, unit_price: 1.25, expiry_date: '2027-08-30' },
    { id: 'med2', name: 'Aspirin 81mg', category: 'Analgesic', stock_qty: 550, unit_price: 0.35, expiry_date: '2028-02-15' },
    { id: 'med3', name: 'Metformin 500mg', category: 'Antidiabetic', stock_qty: 180, unit_price: 0.85, expiry_date: '2026-12-10' },
    { id: 'med4', name: 'Amoxicillin 500mg', category: 'Antibiotic', stock_qty: 45, unit_price: 2.10, expiry_date: '2026-11-20' }, // Low stock & expiring soon!
    { id: 'med5', name: 'Lisinopril 10mg', category: 'Antihypertensive', stock_qty: 240, unit_price: 0.95, expiry_date: '2027-05-01' },
    { id: 'med6', name: 'Paracetamol 500mg', category: 'Analgesic', stock_qty: 800, unit_price: 0.20, expiry_date: '2027-09-15' },
    { id: 'med7', name: 'Omeprazole 20mg', category: 'Gastrointestinal', stock_qty: 310, unit_price: 0.75, expiry_date: '2026-11-05' } // Expiring soon!
  ],

  lab_tests: [
    {
      id: 'lab1',
      patient_id: 'pat1',
      patient_name: 'John Doe',
      test_name: 'Lipid Panel Profile',
      sample_status: 'Completed',
      result_data: 'Total Cholesterol: 210 mg/dL (Normal < 200), HDL: 45 mg/dL (Normal > 40), LDL: 135 mg/dL (Normal < 100), Triglycerides: 150 mg/dL',
      report_url: '#',
      created_at: '2026-10-02T08:30:00Z',
      technician: 'Maya Lin',
      clinical_notes: 'Elevated LDL noted. Recommend lifestyle modifications and dietary control.'
    },
    {
      id: 'lab2',
      patient_id: 'pat2',
      patient_name: 'Alice Smith',
      test_name: 'HbA1c Glycated Hemoglobin',
      sample_status: 'In Testing',
      result_data: 'Automated analyzer running assay...',
      report_url: '#',
      created_at: '2026-10-03T09:15:00Z',
      technician: 'Maya Lin',
      clinical_notes: 'Follow-up diabetic glucose marker check.'
    },
    {
      id: 'lab3',
      patient_id: 'pat3',
      patient_name: 'Robert Johnson',
      test_name: 'Troponin I & Cardiac Enzymes',
      sample_status: 'Sample Collected',
      result_data: 'Awaiting lab equipment analysis',
      report_url: '#',
      created_at: '2026-10-03T10:45:00Z',
      technician: 'Maya Lin',
      clinical_notes: 'Urgent STAT requested by Cardiology.'
    },
    {
      id: 'lab4',
      patient_id: 'pat4',
      patient_name: 'Emily Davis',
      test_name: 'Complete Blood Count (CBC)',
      sample_status: 'Requested',
      result_data: 'Pending sample collection at phlebotomy desk',
      report_url: '#',
      created_at: '2026-10-03T11:00:00Z',
      technician: 'Pending',
      clinical_notes: 'Evaluate recurrent headache and fatigue.'
    },
  ],

  invoices: [
    {
      id: 'inv1',
      patient_id: 'pat3',
      patient_name: 'Robert Johnson',
      total_amount: 320.00,
      status: 'Paid',
      created_at: '2026-10-03T09:40:00Z',
      items: [
        { id: 'ii1', item_type: 'Consultation', description: 'Specialist Cardiology Visit', amount: 120.00 },
        { id: 'ii2', item_type: 'Laboratory', description: 'Troponin & ECG Diagnostics', amount: 150.00 },
        { id: 'ii3', item_type: 'Pharmacy', description: 'Prescription Medications', amount: 50.00 }
      ],
      payments: [
        { id: 'pay1', amount_paid: 320.00, payment_method: 'Credit Card', paid_at: '2026-10-03T09:45:00Z', reference_code: 'TXN-98412' }
      ]
    },
    {
      id: 'inv2',
      patient_id: 'pat2',
      patient_name: 'Alice Smith',
      total_amount: 235.00,
      status: 'Unpaid',
      created_at: '2026-10-03T11:15:00Z',
      items: [
        { id: 'ii4', item_type: 'Consultation', description: 'Neurology Consultation', amount: 150.00 },
        { id: 'ii5', item_type: 'Laboratory', description: 'HbA1c Blood Test', amount: 85.00 }
      ],
      payments: []
    }
  ],

  attendance: [
    { id: 'att1', employee_id: 'emp1', employee_name: 'Dr. Sarah Jenkins', date: '2026-10-03', status: 'Present', check_in: '08:45 AM', check_out: '05:00 PM' },
    { id: 'att2', employee_id: 'emp2', employee_name: 'Dr. Marcus Vance', date: '2026-10-03', status: 'Present', check_in: '09:15 AM', check_out: '05:30 PM' },
    { id: 'att3', employee_id: 'emp3', employee_name: 'Elena Rostova', date: '2026-10-03', status: 'Present', check_in: '07:30 AM', check_out: '04:00 PM' },
    { id: 'att4', employee_id: 'emp4', employee_name: 'James Carter', date: '2026-10-03', status: 'On Leave', check_in: '-', check_out: '-' },
  ],

  // Staff Leave Records (Section 3.9 & 5 in Document)
  staff_leaves: [
    {
      id: 'lev1',
      employee_id: 'emp4',
      employee_name: 'James Carter',
      leave_type: 'Annual Leave',
      start_date: '2026-10-03',
      end_date: '2026-10-05',
      days: 3,
      reason: 'Family event and personal travel',
      status: 'Approved',
      applied_at: '2026-09-28'
    },
    {
      id: 'lev2',
      employee_id: 'emp3',
      employee_name: 'Elena Rostova',
      leave_type: 'Sick Leave',
      start_date: '2026-10-10',
      end_date: '2026-10-11',
      days: 2,
      reason: 'Medical checkup and recovery',
      status: 'Pending',
      applied_at: '2026-10-02'
    }
  ],

  // Security Audit Trail (Section 4 Non-Functional Requirements)
  audit_logs: [
    { id: 'log1', action: 'USER_LOGIN', user_email: 'admin@medicure.org', ip_address: '127.0.0.1', details: 'Successful Administrator login', timestamp: '2026-10-03T08:00:00Z' },
    { id: 'log2', action: 'APPOINTMENT_BOOKED', user_email: 'reception@medicure.org', ip_address: '127.0.0.1', details: 'Appointment apt1 booked for John Doe', timestamp: '2026-10-03T08:35:00Z' },
    { id: 'log3', action: 'PAYMENT_RECORDED', user_email: 'billing@medicure.org', ip_address: '127.0.0.1', details: 'Payment $320.00 recorded for invoice inv1', timestamp: '2026-10-03T09:45:00Z' },
    { id: 'log4', action: 'LAB_TEST_ORDERED', user_email: 'dr.sarah@medicure.org', ip_address: '127.0.0.1', details: 'Ordered Troponin I for Robert Johnson', timestamp: '2026-10-03T10:45:00Z' },
    { id: 'log5', action: 'MEDICINE_DISPENSED', user_email: 'pharmacy@medicure.org', ip_address: '127.0.0.1', details: 'Dispensed Atorvastatin & Aspirin to Robert Johnson', timestamp: '2026-10-03T11:00:00Z' }
  ]
};

// Helper function to log audit trail events
export const logAuditEvent = (action, user_email, details) => {
  const newLog = {
    id: `log_${randomUUID().slice(0, 8)}`,
    action,
    user_email: user_email || 'system@medicure.org',
    ip_address: '127.0.0.1',
    details,
    timestamp: new Date().toISOString()
  };
  dbStore.audit_logs.unshift(newLog);
  // Keep last 100 logs
  if (dbStore.audit_logs.length > 100) dbStore.audit_logs.pop();
  return newLog;
};

// Helper function to generate IDs
export const generateId = (prefix = 'id') => `${prefix}_${randomUUID().slice(0, 8)}`;
