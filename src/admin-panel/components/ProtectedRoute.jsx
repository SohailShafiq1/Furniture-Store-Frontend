import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { admin, token } = useAdminAuth();

  if (!token) {
    return <Navigate to="/admin/login" />;
  }

  if (role && admin?.role !== role) {
    return <Navigate to="/admin/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
