// src/pages/admin/AdminPage.js
import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  People as PeopleIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  History as HistoryIcon
} from '@mui/icons-material';

const AdminPage = () => {
  const navigate = useNavigate();
  
  // Admin sections with navigation
  const adminSections = [
    {
      title: 'User Management',
      description: 'Create, edit, and manage system users and their permissions',
      icon: <PeopleIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />,
      path: '/admin/users',
      color: 'primary.main'
    },
    {
      title: 'Role Management',
      description: 'Define and configure system roles and associated permissions',
      icon: <SecurityIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />,
      path: '/admin/roles',
      color: 'warning.main'
    },
    {
      title: 'Audit Logs',
      description: 'View system activity and user actions for security monitoring',
      icon: <HistoryIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />,
      path: '/admin/audit-logs',
      color: 'info.main'
    },
    {
      title: 'System Settings',
      description: 'Configure global system settings and preferences',
      icon: <SettingsIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />,
      path: '/admin/settings',
      color: 'success.main'
    }
  ];
  
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Administration Dashboard
        </Typography>
        <Typography variant="body1">
          Welcome to the administration area. From here you can manage users, roles, settings, and view audit logs.
        </Typography>
      </Paper>
      
      <Grid container spacing={3}>
        {adminSections.map((section) => (
          <Grid item xs={12} sm={6} md={3} key={section.path}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea 
                sx={{ height: '100%' }}
                onClick={() => handleNavigate(section.path)}
              >
                <CardContent sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%'
                }}>
                  {section.icon}
                  <Typography variant="h6" gutterBottom>
                    {section.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {section.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default AdminPage;