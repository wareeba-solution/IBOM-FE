// src/routes/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { isAuthenticated, getUser } from '../utils/helpers';

// Component for routes that require authentication
const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated: authContextAuthenticated, user: authContextUser, loading } = useAuth();
  
  // Use helper functions as fallback if auth context is not available
  const userIsAuthenticated = authContextAuthenticated || isAuthenticated();
  const user = authContextUser || getUser();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  // Check if user is authenticated
  if (!userIsAuthenticated || !user) {
    console.log("User is not authenticated, redirecting to login");
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  // Check role if required
  if (requiredRole) {
    console.log("Checking user role...");
    console.log("Required role:", requiredRole);
    console.log("User role:", user?.role);
    if (!user || user.role !== requiredRole) {
      console.log("User doesn't have required role, redirecting to dashboard");
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  console.log("User has required role, rendering content");
  
  // Return children if provided, otherwise use Outlet
  // This allows both nested routes and component wrapper approaches
  return children ? (
    children
  ) : (
    <Outlet />
  );
};

export default PrivateRoute;
