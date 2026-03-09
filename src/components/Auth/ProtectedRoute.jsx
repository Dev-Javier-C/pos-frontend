import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { state: { isAuthenticated, user }, hasPermission } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is required and user doesn't have permission, redirect to unauthorized
  if (requiredRole && !hasPermission(requiredRole)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Render children if all checks pass
  return children;
} 