// src/pages/settings/index.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActionArea,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Tune as TuneIcon,
  Notifications as NotificationsIcon,
  VpnKey as VpnKeyIcon,
  Lock as LockIcon,
  Devices as DevicesIcon,
  PersonalVideo as PersonalVideoIcon,
  FormatColorFill as FormatColorFillIcon,
  Language as LanguageIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import MainLayout from '../../components/common/Layout/MainLayout';

// Settings Hub Page
const Settings = () => {
  const navigate = useNavigate();
  
  // Navigation handlers
  const handleNavigate = (path) => {
    navigate(path);
  };
  
  // Main setting categories
  const settingsCategories = [
    {
      id: 'profile',
      title: 'User Profile',
      description: 'Manage your personal information and account details',
      icon: <PersonIcon fontSize="large" color="primary" />,
      path: '/settings/profile',
      items: [
        { name: 'Personal Information', icon: <PersonIcon color="primary" /> },
        { name: 'Professional Details', icon: <PersonalVideoIcon color="primary" /> }
      ]
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Manage passwords, two-factor authentication, and login sessions',
      icon: <SecurityIcon fontSize="large" color="primary" />,
      path: '/settings/security',
      items: [
        { name: 'Password Management', icon: <VpnKeyIcon color="primary" /> },
        { name: 'Two-Factor Authentication', icon: <LockIcon color="primary" /> },
        { name: 'Active Sessions', icon: <DevicesIcon color="primary" /> }
      ]
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your application experience, theme, and notifications',
      icon: <TuneIcon fontSize="large" color="primary" />,
      path: '/settings/preferences',
      items: [
        { name: 'Appearance', icon: <FormatColorFillIcon color="primary" /> },
        { name: 'Localization', icon: <LanguageIcon color="primary" /> },
        { name: 'Notifications', icon: <NotificationsIcon color="primary" /> },
        { name: 'Data & Synchronization', icon: <StorageIcon color="primary" /> }
      ]
    }
  ];

  return (
    <MainLayout title="Settings">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {settingsCategories.map((category) => (
            <Grid item xs={12} md={4} key={category.id}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea onClick={() => handleNavigate(category.path)}>
                  <CardHeader
                    avatar={category.icon}
                    title={category.title}
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <Divider />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {category.description}
                    </Typography>
                    <List dense>
                      {category.items.map((item, index) => (
                        <ListItem key={index} disablePadding>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText primary={item.name} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </MainLayout>
  );
};

export default Settings;