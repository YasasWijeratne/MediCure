# MediCure HMS — Hospital Management & Electronic Medical Records System

MediCure HMS is a modern, web-based Hospital Management and Electronic Medical Records (EMR) system designed to streamline clinical workflows, inpatient monitoring, laboratory investigations, pharmacy inventory, and patient billing.

---

## 🌟 Key Features & Modules

### 🏥 Clinical Operations & EMR
- **Patient Directory**: Centralized electronic medical records, demographic details, contact info, and medical history.
- **Dynamic Vitals & Telemetry**: Continuous bed telemetry tracking heart rate, blood pressure, SpO2, temperature, and automatic BMI calculations with edit modals.
- **Digital Prescriptions**: Issue multi-drug clinical prescriptions linked directly to active hospital pharmacy stock.

### 🧪 Laboratory Information System (LIS)
- **Specimen Triage & Pipeline**: Track test lifecycle (`Requested` ➔ `Sample Collected` ➔ `In Testing` ➔ `Completed`).
- **Pathology Diagnostic Certificates**: Generate and print CAP/CLIA compliant lab report certificates.
- **Diagnostic Presets**: Quick ordering of standard lab panels (CBC, Lipid Profile, HbA1c, Troponin-I, CMP, TSH).

### 💊 Pharmacy & Inventory Management
- **Medication Stock Control**: Real-time stock level tracking, low stock alerts, and automated reorder triggers.
- **Dispensing Pipeline**: Sync prescribed medications directly with patient billing ledgers.

### 🏨 Inpatient Admissions & Bed Management
- **Ward & Bed Occupancy**: Live bed status tracking (Occupied, Available, Maintenance, Cleaning).
- **Admissions Management**: Process patient admissions, ward assignments, attending physicians, and discharge summaries.

### 📅 Appointments & Scheduling
- **Doctor Consultation Booking**: Manage specialist clinic slots, appointment statuses, and daily consultation queues.

### 💳 Billing & Financial Ledger
- **Patient Invoices**: Automatic invoicing for doctor consultations, laboratory investigations, and pharmacy prescriptions.
- **Payment Processing**: Multi-method payments (Cash, Credit Card, Insurance) with transaction reference codes.

### 🛡️ Role-Based Access Control (RBAC)
Dedicated user permissions tailored for:
- **Administrator**: Complete system administration, staff roster management, and financial audit logs.
- **Doctor & Nurse**: Clinical EMR, patient dossiers, digital prescriptions, and bed monitoring.
- **Laboratory Staff**: LIS worklist triage, analyzer specimen processing, and pathology reporting.
- **Pharmacist**: Inventory control and prescription dispensing.
- **Receptionist**: Patient registration, appointment scheduling, and front-desk billing.
- **Accountant**: Financial ledgers, revenue reports, and unpaid invoice management.
- **Patient**: Self-service portal for appointments, lab results, prescriptions, and billing statements.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TailwindCSS, Lucide Icons, Material Symbols
- **Backend**: Node.js, Express.js, In-Memory Data Store (with optional Supabase DB connection)
- **Authentication**: Role-aware session & JSON authentication with encrypted credentials

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation & Running Locally

1. **Backend Server**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:5000`*

2. **Frontend Application**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:5173`*

---

## 📁 Project Structure

```
MediCure/
├── backend/
│   ├── config/         # Database & environment configurations
│   ├── controllers/    # API request handlers
│   ├── db/             # Data store & initial seed records
│   ├── models/         # Business logic & data access models
│   ├── routes/         # Express API routes
│   └── server.js       # Main server entrypoint
│
└── frontend/
    ├── src/
    │   ├── components/ # Reusable UI components (Sidebar, Header, Modal)
    │   ├── context/    # Auth & global state providers
    │   ├── services/   # API client service layer
    │   └── views/      # Page views (EMR, Lab, Pharmacy, Patients, Billing, etc.)
    └── index.html
```
