import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const ROLES = [
  'Administrator',
  'Doctor',
  'Nurse',
  'Receptionist',
  'Laboratory Staff',
  'Pharmacist',
  'Accountant'
];

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('medicure_auth') === 'true';
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('medicure_role') || 'Administrator';
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('medicure_user');
    return saved ? JSON.parse(saved) : {
      id: 'u1',
      username: 'admin',
      email: 'admin@medicure.org',
      role: 'Administrator'
    };
  });

  const login = async (email, password, role) => {
    try {
      const res = await api.post('/auth/login', { email, username: email, password, role });
      if (res.success) {
        setIsAuthenticated(true);
        setCurrentRole(res.user.role);
        setUser(res.user);
        localStorage.setItem('medicure_auth', 'true');
        localStorage.setItem('medicure_role', res.user.role);
        localStorage.setItem('medicure_user', JSON.stringify(res.user));
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentRole('Administrator');
    setUser({ id: '', username: '', email: '', role: '' });
    localStorage.removeItem('medicure_auth');
    localStorage.removeItem('medicure_role');
    localStorage.removeItem('medicure_user');
  };

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
    switch (moduleName) {
      case 'dashboard': return true;
      case 'patients': return ['Doctor', 'Nurse', 'Receptionist', 'Laboratory Staff'].includes(currentRole);
      case 'doctors': return ['Doctor', 'Receptionist'].includes(currentRole);
      case 'appointments': return ['Doctor', 'Nurse', 'Receptionist'].includes(currentRole);
      case 'inpatient': return ['Doctor', 'Nurse', 'Receptionist'].includes(currentRole);
      case 'emr': return ['Doctor', 'Nurse'].includes(currentRole);
      case 'laboratory': return ['Doctor', 'Laboratory Staff'].includes(currentRole);
      case 'pharmacy': return ['Pharmacist', 'Doctor'].includes(currentRole);
      case 'billing': return ['Accountant', 'Receptionist'].includes(currentRole);
      case 'staff': return ['Administrator'].includes(currentRole);
      case 'reports': return ['Administrator', 'Accountant'].includes(currentRole);
      case 'audit': return ['Administrator'].includes(currentRole);
      default: return true;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, currentRole, login, logout, switchRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
