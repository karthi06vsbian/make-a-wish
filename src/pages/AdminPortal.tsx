import React, { useState, useEffect } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';

export const AdminPortal: React.FC = () => {
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem('wishmaker_admin_token');
  });

  // Re-check session token on every route/state update
  useEffect(() => {
    const checkAuth = () => {
      setToken(sessionStorage.getItem('wishmaker_admin_token'));
    };
    checkAuth();

    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const currentToken = sessionStorage.getItem('wishmaker_admin_token');

  if (currentToken) {
    return <AdminDashboard />;
  }

  return <AdminLogin />;
};
