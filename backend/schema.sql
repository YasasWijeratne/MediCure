-- MediCure Hospital Management System (HMS)
-- PostgreSQL Database Schema (Compatible with Supabase)
-- Run this ONCE in Supabase SQL Editor to create all tables

-- 1. Roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    role_name VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Departments
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Employees
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    department_name VARCHAR(100),
    designation VARCHAR(100) NOT NULL,
    joined_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Doctors
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    department_name VARCHAR(100),
    consultation_fee DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
    contact VARCHAR(50),
    availability VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Patients
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL DEFAULT '1990-01-01',
    gender VARCHAR(20) NOT NULL DEFAULT 'Unspecified',
    contact VARCHAR(50) NOT NULL,
    address TEXT,
    medical_history TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Patient Documents
CREATE TABLE IF NOT EXISTS patient_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General Medical Report',
    url VARCHAR(255) DEFAULT '#',
    uploaded_at DATE DEFAULT CURRENT_DATE
);

-- 8. Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    patient_name VARCHAR(200),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    doctor_name VARCHAR(150),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(30) DEFAULT 'Scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Admissions
CREATE TABLE IF NOT EXISTS admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    patient_name VARCHAR(200),
    ward_type VARCHAR(100) NOT NULL DEFAULT 'General Ward',
    room_no VARCHAR(20) NOT NULL,
    bed_no VARCHAR(20) NOT NULL DEFAULT 'Bed-1',
    daily_rate DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
    admitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    discharged_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) DEFAULT 'Admitted',
    attending_doctor VARCHAR(100),
    admission_notes TEXT
);

-- 10. Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    doctor_name VARCHAR(150),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    patient_name VARCHAR(200),
    diagnosis TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Medicines
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    stock_qty INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    expiry_date DATE NOT NULL DEFAULT '2027-12-31',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Prescription Items
CREATE TABLE IF NOT EXISTS prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
    medicine_name VARCHAR(150),
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL
);

-- 13. Lab Tests
CREATE TABLE IF NOT EXISTS lab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    patient_name VARCHAR(200),
    test_name VARCHAR(150) NOT NULL,
    sample_status VARCHAR(50) DEFAULT 'Requested',
    result_data TEXT,
    report_url VARCHAR(255) DEFAULT '#',
    technician VARCHAR(100),
    clinical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    patient_name VARCHAR(200),
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'Unpaid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL
);

-- 16. Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Credit Card',
    reference_code VARCHAR(50),
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Attendance
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(150),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(30) DEFAULT 'Present',
    check_in VARCHAR(20),
    check_out VARCHAR(20) DEFAULT '-'
);

-- 18. Staff Leaves
CREATE TABLE IF NOT EXISTS staff_leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(150),
    leave_type VARCHAR(50) NOT NULL DEFAULT 'Casual Leave',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INT NOT NULL DEFAULT 1,
    reason TEXT,
    status VARCHAR(30) DEFAULT 'Pending',
    applied_at DATE DEFAULT CURRENT_DATE
);

-- 19. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL,
    user_email VARCHAR(255) NOT NULL DEFAULT 'system@medicure.org',
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Roles
INSERT INTO roles (name, permissions) VALUES
('Administrator', '{"all"}'),
('Doctor', '{"patients.view", "appointments.manage", "emr.manage", "prescriptions.manage", "lab.view", "admissions.view"}'),
('Nurse', '{"patients.view", "appointments.view", "admissions.manage", "emr.view"}'),
('Receptionist', '{"patients.manage", "appointments.manage", "invoices.view", "admissions.manage"}'),
('Laboratory Staff', '{"lab.manage", "patients.view"}'),
('Pharmacist', '{"pharmacy.manage", "prescriptions.view"}'),
('Accountant', '{"billing.manage", "invoices.manage", "reports.financial"}')
ON CONFLICT (name) DO NOTHING;

-- Seed Default Admin User (default password: Password123! — hashed on first login)
INSERT INTO users (username, email, password, role_name)
SELECT 'admin', 'admin@medicure.org', 'password123', 'Administrator'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- Seed Default Departments
INSERT INTO departments (name, description) VALUES
('Cardiology', 'Heart and cardiovascular system disorders'),
('Neurology', 'Brain, spinal cord, and nervous system care'),
('Pediatrics', 'Infant, child, and adolescent medicine'),
('Orthopedics', 'Bones, joints, ligaments, and tendons'),
('General Medicine', 'Primary healthcare and internal medicine'),
('Emergency Care', '24/7 Acute critical care and trauma service')
ON CONFLICT DO NOTHING;
