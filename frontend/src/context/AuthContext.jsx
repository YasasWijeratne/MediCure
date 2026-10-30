import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const ROLES = [
  'Administrator',
  'Doctor',
  'Nurse',
  'Receptionist',
  'Laboratory Staff',
  'Pharmacist',
  'Accountant',
  'Patient'
];

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('medicure_access_token') && localStorage.getItem('medicure_auth') === 'true';
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('medicure_role') || '';
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('medicure_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Listen for global session-expired event dispatched by api.js when refresh fails
  const forceLogout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentRole('');
    setUser(null);
    api.clearTokens();
  }, []);

  useEffect(() => {
    window.addEventListener('auth:session-expired', forceLogout);
    return () => window.removeEventListener('auth:session-expired', forceLogout);
  }, [forceLogout]);

  const _persistSession = (userData, accessToken, refreshToken) => {
    setIsAuthenticated(true);
    setCurrentRole(userData.role);
    setUser(userData);
    api.setTokens(accessToken, refreshToken);
    localStorage.setItem('medicure_auth', 'true');
    localStorage.setItem('medicure_role', userData.role);
    localStorage.setItem('medicure_user', JSON.stringify(userData));
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, username: email, password });
      if (res.success) {
        _persistSession(res.user, res.accessToken, res.refreshToken);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const patientRegister = async (patientData) => {
    try {
      const res = await api.post('/auth/patient-register', patientData);
      if (res.success) {
        _persistSession(res.user, res.accessToken, res.refreshToken);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentRole('');
    setUser(null);
    api.clearTokens();
  };

  // switchRole is kept for demo/dev purposes only — in production this would be removed
  const switchRole = (newRole) => {
    setCurrentRole(newRole);
    const updatedUser = {
      id: `u_${newRole.toLowerCase().replace(/\s+/g, '_')}`,
      username: newRole.toLowerCase().replace(/\s+/g, '_'),
      email: `${newRole.toLowerCase().replace(/\s+/g, '.')}@medicure.org`,
      role: newRole
    };
    setUser(updatedUser);
    localStorage.setItem('medicure_role', newRole);
    localStorage.setItem('medicure_user', JSON.stringify(updatedUser));
  };

  const hasPermission = (moduleName) => {
    if (currentRole === 'Administrator') return true;
    if (currentRole === 'Patient') {
      return ['patient_portal', 'dashboard', 'appointments', 'emr', 'laboratory', 'billing'].includes(moduleName);
    }
    switch (moduleName) {
      case 'dashboard': return true;
      case 'patients': return ['Doctor', 'Nurse', 'Receptionist', 'Laboratory Staff'].includes(currentRole);
      case 'doctors': return ['Doctor', 'Receptionist'].includes(currentRole);
      case 'appointments': return ['Doctor', 'Nurse', 'Receptionist'].includes(currentRole);
      case 'inpatient': return ['Doctor', 'Nurse', 'Receptionist'].includes(currentRole);
      case 'emr': return ['Doctor', 'Nurse'].includes(currentRole);
      case 'laboratory': return ['Doctor', 'Laboratory Staff', 'Nurse'].includes(currentRole);
      case 'pharmacy': return ['Pharmacist', 'Doctor', 'Nurse'].includes(currentRole);
      case 'billing': return ['Accountant', 'Receptionist'].includes(currentRole);
      case 'staff': return ['Administrator'].includes(currentRole);
      case 'reports': return ['Administrator', 'Accountant', 'Doctor', 'Laboratory Staff', 'Pharmacist'].includes(currentRole);
      case 'audit': return ['Administrator'].includes(currentRole);
      default: return true;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, currentRole, login, patientRegister, logout, switchRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
