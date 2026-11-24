import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const AdminGuard: React.FC = () => {
  const token = sessionStorage.getItem('wishmaker_admin_token');

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};
