// src/components/common/Layout/AdminLayout.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab
} from '@mui/material';
import {
  Person as PersonIcon,
  Shield as ShieldIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import MainLayout from './MainLayout';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Define admin tabs
  const adminTabs = [
    { path: '/admin', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/admin/users', label: 'User Management', icon: <PersonIcon /> },
    { path: '/admin/roles', label: 'Role Management', icon: <ShieldIcon /> },
    { path: '/admin/audit-logs', label: 'Audit Logs', icon: <HistoryIcon /> },
    { path: '/admin/settings', label: 'System Settings', icon: <SettingsIcon /> }
  ];
  
  // Determine which tab is active based on current path
  const getCurrentTabIndex = () => {
    const currentPath = location.pathname;
    
    if (currentPath === '/admin') {
      return 0; // Dashboard tab
    }
    
    const index = adminTabs.findIndex((tab, index) => 
      index > 0 && (currentPath === tab.path || currentPath.startsWith(`${tab.path}/`))
    );
    
    return index >= 0 ? index : 0;
  };
  
  const [tabIndex, setTabIndex] = useState(getCurrentTabIndex());
  
  // Update tab index when location changes
  useEffect(() => {
    setTabIndex(getCurrentTabIndex());
  }, [location.pathname]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    navigate(adminTabs[newValue].path);
  };

  return (
    <MainLayout title="Administration">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Administration
        </Typography>
        
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {adminTabs.map((tab) => (
            <Tab 
              key={tab.path} 
              label={tab.label} 
              icon={tab.icon} 
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>
      
      {/* This is where child routes will be rendered through Outlet */}
      <Box sx={{ mt: 3 }}>
        <Outlet />
      </Box>
    </MainLayout>
  );
};

export default AdminLayout;