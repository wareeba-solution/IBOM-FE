// src/routes/PublicRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Component for routes that should be accessible only when not authenticated
const PublicRoute = ({ restricted = false }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // If route is restricted and user is authenticated, redirect to dashboard
  if (restricted && isAuthenticated && !loading) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Render the public component
  return <Outlet />;
};

export default PublicRoute;