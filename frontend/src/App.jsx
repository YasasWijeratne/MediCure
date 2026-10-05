import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginPage from './views/LoginPage';
import PatientLoginPage from './views/PatientLoginPage';
import PatientPortalView from './views/PatientPortalView';
import AdminLoginPage from './views/AdminLoginPage';
import LandingPageView from './views/LandingPageView';

import DashboardView from './views/DashboardView';
import PatientsView from './views/PatientsView';
import DoctorsView from './views/DoctorsView';
import AppointmentsView from './views/AppointmentsView';
import InpatientView from './views/InpatientView';
import EMRView from './views/EMRView';
import LaboratoryView from './views/LaboratoryView';
import PharmacyView from './views/PharmacyView';
import BillingView from './views/BillingView';
import StaffView from './views/StaffView';
import ReportsView from './views/ReportsView';
import AuditView from './views/AuditView';

function MainApp() {
  const { isAuthenticated, currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  const [viewMode, setViewMode] = useState('landing'); // 'landing' | 'staff-login' | 'patient-login' | 'admin-login'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (currentRole === 'Patient' && !['appointments', 'emr', 'laboratory', 'billing'].includes(activeTab)) {
      setActiveTab('appointments');
    }
  }, [currentRole]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 1. If in public landing page mode, render LandingPageView
  if (!isAuthenticated && viewMode === 'landing') {
    return (
      <LandingPageView
        onEnterPatientLogin={() => setViewMode('patient-login')}
        onEnterStaffLogin={() => setViewMode('staff-login')}
        onEnterAdminLogin={() => setViewMode('admin-login')}
        onEnterPortal={() => setViewMode('patient-login')}
      />
    );
  }

  // 2. If entering patient login / signup page
  if (!isAuthenticated && viewMode === 'patient-login') {
    return (
      <PatientLoginPage
        onBackToLanding={() => setViewMode('landing')}
        onGoToStaffLogin={() => setViewMode('staff-login')}
      />
    );
  }

  // 3. If entering dedicated admin login portal and not authenticated
  if (!isAuthenticated && viewMode === 'admin-login') {
    return (
      <AdminLoginPage
        onBackToLanding={() => setViewMode('landing')}
        onGoToStaffLogin={() => setViewMode('staff-login')}
      />
    );
  }

  // 4. If entering clinical staff login page and not authenticated
  if (!isAuthenticated) {
    return (
      <LoginPage
        onBackToLanding={() => setViewMode('landing')}
        onGoToAdminLogin={() => setViewMode('admin-login')}
        onGoToPatientLogin={() => setViewMode('patient-login')}
      />
    );
  }

  // 5. Render authenticated app layout (Both Patient and Staff use standard layout with Sidebar)
  const renderView = () => {
    if (currentRole === 'Patient') {
      return (
        <PatientPortalView
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onGoToLanding={() => setViewMode('landing')}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'patients':
        return <PatientsView />;
      case 'doctors':
        return <DoctorsView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'inpatient':
        return <InpatientView />;
      case 'emr':
        return <EMRView />;
      case 'laboratory':
        return <LaboratoryView />;
      case 'pharmacy':
        return <PharmacyView />;
      case 'billing':
        return <BillingView />;
      case 'staff':
        return <StaffView />;
      case 'reports':
        return <ReportsView />;
      case 'audit':
        return <AuditView />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onGoToLanding={() => setViewMode('landing')}
      />
      <div className="main-content">
        <Header theme={theme} toggleTheme={toggleTheme} />
        <main className="page-wrapper">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

