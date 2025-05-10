// src/pages/admin/SystemSettings.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  FormHelperText,
  Checkbox,
  FormGroup,
  Snackbar,
  SnackbarContent
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Backup as BackupIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Done as DoneIcon,
  History as HistoryIcon,
  Language as LanguageIcon,
  FormatListNumbered as ListIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { format, parseISO, subDays } from 'date-fns';
import { useApi } from '../../hooks/useApi';

// Mock system settings service - replace with actual service when available
const systemSettingsService = {
  getSettings: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockSystemSettings);
      }, 500);
    });
  },
  
  updateSettings: async (settings) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Update mock settings
        Object.assign(mockSystemSettings, settings);
        resolve({ 
          success: true, 
          message: 'Settings updated successfully.' 
        });
      }, 700);
    });
  },
  
  testEmailSettings: async (settings) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          message: 'Test email sent successfully. Please check your inbox.' 
        });
      }, 1500);
    });
  },
  
  backupDatabase: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        mockBackupHistory.unshift({
          id: mockBackupHistory.length + 1,
          name: `db-backup-${timestamp}`,
          size: '4.2 MB',
          timestamp: new Date().toISOString(),
          type: 'Manual',
          status: 'Completed',
          user: 'Admin User'
        });
        
        resolve({ 
          success: true, 
          message: 'Database backup completed successfully.' 
        });
      }, 2000);
    });
  },
  
  restoreBackup: async (backupId) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          message: 'Database restored successfully.' 
        });
      }, 3000);
    });
  },
  
  deleteBackup: async (backupId) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockBackupHistory.findIndex(b => b.id === backupId);
        if (index !== -1) {
          mockBackupHistory.splice(index, 1);
        }
        resolve({ 
          success: true, 
          message: 'Backup deleted successfully.' 
        });
      }, 800);
    });
  },
  
  getBackupHistory: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockBackupHistory);
      }, 500);
    });
  }
};

// Mock system settings
const mockSystemSettings = {
  general: {
    siteName: 'Akwa Ibom Health Data Collection System',
    organizationName: 'Akwa Ibom State Ministry of Health',
    contactEmail: 'info@akwaibomhealth.gov.ng',
    contactPhone: '+234-80-1234-5678',
    defaultLanguage: 'en',
    timezone: 'Africa/Lagos',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  },
  security: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiry: 90
    },
    loginAttempts: 5,
    sessionTimeout: 30,
    twoFactorAuth: false,
    allowedIpRanges: [],
    enforcePasswordHistory: 3
  },
  email: {
    smtpServer: 'smtp.akwaibomhealth.gov.ng',
    smtpPort: 587,
    smtpUsername: 'notifications@akwaibomhealth.gov.ng',
    smtpPassword: 'p@$$w0rd123',
    senderName: 'Akwa Ibom Health System',
    senderEmail: 'notifications@akwaibomhealth.gov.ng',
    enableSSL: true,
    emailNotifications: true
  },
  backup: {
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '01:00',
    retentionPeriod: 30,
    backupLocation: 'cloud',
    cloudSettings: {
      provider: 'aws',
      bucketName: 'akwaibom-health-backups',
      region: 'eu-west-1'
    }
  },
  notifications: {
    enabledChannels: {
      email: true,
      sms: true,
      inApp: true
    },
    events: {
      userRegistration: true,
      passwordReset: true,
      dataImport: true,
      systemBackup: true,
      securityAlert: true
    },
    digestFrequency: 'daily'
  },
  localization: {
    enabledLanguages: ['en', 'ibibio', 'efik'],
    defaultCurrency: 'NGN',
    defaultMeasurementUnit: 'metric'
  },
  storage: {
    uploadSizeLimit: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv'],
    compressionEnabled: true,
    imageResizeEnabled: true,
    imageMaxDimension: 1024
  }
};

// Mock backup history
const mockBackupHistory = [
  {
    id: 1,
    name: 'db-backup-2023-05-31T01-00-00',
    size: '4.1 MB',
    timestamp: '2023-05-31T01:00:00Z',
    type: 'Automatic',
    status: 'Completed',
    user: 'System'
  },
  {
    id: 2,
    name: 'db-backup-2023-05-30T01-00-00',
    size: '4.0 MB',
    timestamp: '2023-05-30T01:00:00Z',
    type: 'Automatic',
    status: 'Completed',
    user: 'System'
  },
  {
    id: 3,
    name: 'db-backup-2023-05-29T01-00-00',
    size: '3.9 MB',
    timestamp: '2023-05-29T01:00:00Z',
    type: 'Automatic',
    status: 'Completed',
    user: 'System'
  },
  {
    id: 4,
    name: 'db-backup-2023-05-28T01-00-00',
    size: '3.9 MB',
    timestamp: '2023-05-28T01:00:00Z',
    type: 'Automatic',
    status: 'Completed',
    user: 'System'
  },
  {
    id: 5,
    name: 'db-backup-2023-05-27T01-00-00',
    size: '3.8 MB',
    timestamp: '2023-05-27T01:00:00Z',
    type: 'Automatic',
    status: 'Completed',
    user: 'System'
  },
  {
    id: 6,
    name: 'db-backup-2023-05-26T15-30-45',
    size: '3.8 MB',
    timestamp: '2023-05-26T15:30:45Z',
    type: 'Manual',
    status: 'Completed',
    user: 'Admin User'
  }
];

// SystemSettings Component
const SystemSettings = () => {
  const { loading, error, execute } = useApi();

  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Settings state
  const [settings, setSettings] = useState(null);
  const [backupHistory, setBackupHistory] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState(null);
  const [backupStatus, setBackupStatus] = useState(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Fetch settings and backup history
  const fetchSettings = async () => {
    await execute(
      systemSettingsService.getSettings,
      [],
      (response) => {
        setSettings({...response});
      }
    );
  };

  const fetchBackupHistory = async () => {
    await execute(
      systemSettingsService.getBackupHistory,
      [],
      (response) => {
        setBackupHistory(response);
      }
    );
  };

  // Initial data loading
  useEffect(() => {
    fetchSettings();
    fetchBackupHistory();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle setting change
  const handleSettingChange = (section, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    });
  };

  // Handle nested setting change
  const handleNestedSettingChange = (section, parent, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [parent]: {
          ...settings[section][parent],
          [field]: value
        }
      }
    });
  };

  // Handle array toggle (for enabledLanguages, allowedFileTypes)
  const handleArrayToggle = (section, field, value) => {
    const currentArray = settings[section][field];
    let newArray;
    
    if (currentArray.includes(value)) {
      // Remove the value
      newArray = currentArray.filter(item => item !== value);
    } else {
      // Add the value
      newArray = [...currentArray, value];
    }
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: newArray
      }
    });
  };

  // Handle switch/boolean change
  const handleSwitchChange = (section, field, event) => {
    handleSettingChange(section, field, event.target.checked);
  };

  // Handle nested switch/boolean change
  const handleNestedSwitchChange = (section, parent, field, event) => {
    handleNestedSettingChange(section, parent, field, event.target.checked);
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Save settings
  const handleSaveSettings = async () => {
    await execute(
      systemSettingsService.updateSettings,
      [settings],
      (response) => {
        setActionSuccess(response.message);
        setTimeout(() => setActionSuccess(''), 5000);
      }
    );
  };

  // Test email settings
  const handleTestEmail = async () => {
    setTestEmailStatus('testing');
    
    await execute(
      systemSettingsService.testEmailSettings,
      [settings.email],
      (response) => {
        setTestEmailStatus('success');
        setTimeout(() => setTestEmailStatus(null), 5000);
      },
      (error) => {
        setTestEmailStatus('error');
        setTimeout(() => setTestEmailStatus(null), 5000);
      }
    );
  };

  // Manual database backup
  const handleManualBackup = async () => {
    setBackupStatus('inProgress');
    
    await execute(
      systemSettingsService.backupDatabase,
      [],
      (response) => {
        setBackupStatus('success');
        setActionSuccess(response.message);
        setTimeout(() => {
          setBackupStatus(null);
          setActionSuccess('');
        }, 5000);
        fetchBackupHistory();
      },
      (error) => {
        setBackupStatus('error');
        setActionError('Backup failed: ' + error.message);
        setTimeout(() => {
          setBackupStatus(null);
          setActionError('');
        }, 5000);
      }
    );
  };

  // Open restore backup dialog
  const handleOpenRestoreDialog = (backup) => {
    setSelectedBackup(backup);
    setRestoreDialogOpen(true);
  };

  // Restore backup
  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;
    
    await execute(
      systemSettingsService.restoreBackup,
      [selectedBackup.id],
      (response) => {
        setRestoreDialogOpen(false);
        setActionSuccess(response.message);
        setTimeout(() => setActionSuccess(''), 5000);
      }
    );
  };

  // Delete backup
  const handleDeleteBackup = async (backupId) => {
    await execute(
      systemSettingsService.deleteBackup,
      [backupId],
      (response) => {
        setActionSuccess(response.message);
        setTimeout(() => setActionSuccess(''), 5000);
        fetchBackupHistory();
      }
    );
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // If settings are still loading, show loading indicator
  if (loading && !settings) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">System Settings</Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          disabled={loading || !settings}
        >
          Save All Settings
        </Button>
      </Box>
      
      {actionSuccess && (
        <Alert 
          severity="success" 
          onClose={() => setActionSuccess('')}
          sx={{ mb: 2 }}
        >
          {actionSuccess}
        </Alert>
      )}
      
      {actionError && (
        <Alert 
          severity="error" 
          onClose={() => setActionError('')}
          sx={{ mb: 2 }}
        >
          {actionError}
        </Alert>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          onClose={() => execute(null)}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}
      
      {settings && (
        <>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab icon={<SettingsIcon />} label="General" />
            <Tab icon={<SecurityIcon />} label="Security" />
            <Tab icon={<EmailIcon />} label="Email" />
            <Tab icon={<BackupIcon />} label="Backup & Restore" />
            <Tab icon={<NotificationsIcon />} label="Notifications" />
            <Tab icon={<LanguageIcon />} label="Localization" />
            <Tab icon={<StorageIcon />} label="Storage" />
          </Tabs>
          
          {/* General Settings */}
          {activeTab === 0 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  General Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Site Name"
                      value={settings.general.siteName}
                      onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Organization Name"
                      value={settings.general.organizationName}
                      onChange={(e) => handleSettingChange('general', 'organizationName', e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contact Email"
                      type="email"
                      value={settings.general.contactEmail}
                      onChange={(e) => handleSettingChange('general', 'contactEmail', e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contact Phone"
                      value={settings.general.contactPhone}
                      onChange={(e) => handleSettingChange('general', 'contactPhone', e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="default-language-label">Default Language</InputLabel>
                      <Select
                        labelId="default-language-label"
                        value={settings.general.defaultLanguage}
                        onChange={(e) => handleSettingChange('general', 'defaultLanguage', e.target.value)}
                        label="Default Language"
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="ibibio">Ibibio</MenuItem>
                        <MenuItem value="efik">Efik</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="timezone-label">Timezone</InputLabel>
                      <Select
                        labelId="timezone-label"
                        value={settings.general.timezone}
                        onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                        label="Timezone"
                      >
                        <MenuItem value="Africa/Lagos">Africa/Lagos (GMT+1)</MenuItem>
                        <MenuItem value="UTC">UTC</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="date-format-label">Date Format</InputLabel>
                      <Select
                        labelId="date-format-label"
                        value={settings.general.dateFormat}
                        onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                        label="Date Format"
                      >
                        <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                        <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="time-format-label">Time Format</InputLabel>
                      <Select
                        labelId="time-format-label"
                        value={settings.general.timeFormat}
                        onChange={(e) => handleSettingChange('general', 'timeFormat', e.target.value)}
                        label="Time Format"
                      >
                        <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                        <MenuItem value="24h">24-hour</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
          
          {/* Security Settings */}
          {activeTab === 1 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Security Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Password Policy
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Minimum Password Length"
                      value={settings.security.passwordPolicy.minLength}
                      onChange={(e) => handleNestedSettingChange('security', 'passwordPolicy', 'minLength', parseInt(e.target.value, 10))}
                      InputProps={{ inputProps: { min: 6, max: 30 } }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Password Expiry (days)"
                      value={settings.security.passwordPolicy.passwordExpiry}
                      onChange={(e) => handleNestedSettingChange('security', 'passwordPolicy', 'passwordExpiry', parseInt(e.target.value, 10))}
                      InputProps={{ inputProps: { min: 0, max: 365 } }}
                      margin="normal"
                      helperText="0 = never expires"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Password History (prevent reuse)"
                      value={settings.security.enforcePasswordHistory}
                      onChange={(e) => handleSettingChange('security', 'enforcePasswordHistory', parseInt(e.target.value, 10))}
                      InputProps={{ inputProps: { min: 0, max: 24 } }}
                      margin="normal"
                      helperText="How many previous passwords to remember (0 = disabled)"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Max Failed Login Attempts"
                      value={settings.security.loginAttempts}
                      onChange={(e) => handleSettingChange('security', 'loginAttempts', parseInt(e.target.value, 10))}
                      InputProps={{ inputProps: { min: 1, max: 10 } }}
                      margin="normal"
                      helperText="Account will be locked after this many failed attempts"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.security.passwordPolicy.requireUppercase}
                          onChange={(e) => handleNestedSwitchChange('security', 'passwordPolicy', 'requireUppercase', e)}
                        />
                      }
                      label="Require Uppercase Letters"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.security.passwordPolicy.requireLowercase}
                          onChange={(e) => handleNestedSwitchChange('security', 'passwordPolicy', 'requireLowercase', e)}
                        />
                      }
                      label="Require Lowercase Letters"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.security.passwordPolicy.requireNumbers}
                          onChange={(e) => handleNestedSwitchChange('security', 'passwordPolicy', 'requireNumbers', e)}
                        />
                      }
                      label="Require Numbers"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.security.passwordPolicy.requireSpecialChars}
                          onChange={(e) => handleNestedSwitchChange('security', 'passwordPolicy', 'requireSpecialChars', e)}
                        />
                      }
                      label="Require Special Characters"
                    />
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Login & Access Settings
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Session Timeout (minutes)"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value, 10))}
                      InputProps={{ inputProps: { min: 5, max: 1440 } }}
                      margin="normal"
                      helperText="Time after which inactive users will be logged out"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.security.twoFactorAuth}
                          onChange={(e) => handleSwitchChange('security', 'twoFactorAuth', e)}
                        />
                      }
                      label="Enable Two-Factor Authentication"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
          
          {/* Email Settings */}
          {activeTab === 2 && (
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Email Configuration
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={testEmailStatus === 'testing' ? <CircularProgress size={20} /> : <EmailIcon />}
                    onClick={handleTestEmail}
                    disabled={testEmailStatus === 'testing' || loading}
                    color={testEmailStatus === 'success' ? 'success' : testEmailStatus === 'error' ? 'error' : 'primary'}
                  >
                    {testEmailStatus === 'success' ? 'Email Sent' : 
                      testEmailStatus === 'error' ? 'Failed' : 
                      testEmailStatus === 'testing' ? 'Sending...' : 'Test Email Settings'}
                  </Button>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Server"
                      value={settings.email.smtpServer}
                      onChange={(e) => handleSettingChange('email', 'smtpServer', e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="SMTP Port"
                      value={settings.email.smtpPort}
                      onChange={(e) => handleSettingChange('email', 'smtpPort', parseInt(e.target.value, 10))}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Username"
                      value={settings.email.smtpUsername}
                      onChange={(e) => handleSettingChange('email', 'smtpUsername', e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Password"
                      type={showPassword ? 'text' : 'password'}
                      value={settings.email.smtpPassword}
                      onChange={(e) => handleSettingChange('email', 'smtpPassword', e.target.value)}
                      margin="normal"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleTogglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Sender Name"
                      value={settings.email.senderName}
                      onChange={(e) => handleSettingChange('email', 'senderName', e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Sender Email"
                      type="email"
                      value={settings.email.senderEmail}
                      onChange={(e) => handleSettingChange('email', 'senderEmail', e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.email.enableSSL}
                          onChange={(e) => handleSwitchChange('email', 'enableSSL', e)}
                        />
                      }
                      label="Enable SSL/TLS"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.email.emailNotifications}
                          onChange={(e) => handleSwitchChange('email', 'emailNotifications', e)}
                        />
                      }
                      label="Enable Email Notifications"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
          
          {/* Backup & Restore Settings */}
          {activeTab === 3 && (
            <>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Backup Configuration
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={backupStatus === 'inProgress' ? <CircularProgress size={20} /> : <BackupIcon />}
                      onClick={handleManualBackup}
                      disabled={backupStatus === 'inProgress' || loading}
                      color={backupStatus === 'success' ? 'success' : 'primary'}
                    >
                      {backupStatus === 'success' ? 'Backup Completed' : 
                        backupStatus === 'error' ? 'Backup Failed' : 
                        backupStatus === 'inProgress' ? 'Backing Up...' : 'Backup Now'}
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.backup.autoBackup}
                            onChange={(e) => handleSwitchChange('backup', 'autoBackup', e)}
                          />
                        }
                        label="Enable Automatic Backups"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel id="backup-frequency-label">Backup Frequency</InputLabel>
                        <Select
                          labelId="backup-frequency-label"
                          value={settings.backup.backupFrequency}
                          onChange={(e) => handleSettingChange('backup', 'backupFrequency', e.target.value)}
                          label="Backup Frequency"
                          disabled={!settings.backup.autoBackup}
                        >
                          <MenuItem value="daily">Daily</MenuItem>
                          <MenuItem value="weekly">Weekly</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="time"
                        label="Backup Time"
                        value={settings.backup.backupTime}
                        onChange={(e) => handleSettingChange('backup', 'backupTime', e.target.value)}
                        margin="normal"
                        disabled={!settings.backup.autoBackup}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Retention Period (days)"
                        value={settings.backup.retentionPeriod}
                        onChange={(e) => handleSettingChange('backup', 'retentionPeriod', parseInt(e.target.value, 10))}
                        margin="normal"
                        InputProps={{ inputProps: { min: 1, max: 365 } }}
                        helperText="Number of days to keep backups"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel id="backup-location-label">Backup Location</InputLabel>
                        <Select
                          labelId="backup-location-label"
                          value={settings.backup.backupLocation}
                          onChange={(e) => handleSettingChange('backup', 'backupLocation', e.target.value)}
                          label="Backup Location"
                        >
                          <MenuItem value="local">Local Storage</MenuItem>
                          <MenuItem value="cloud">Cloud Storage</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  
                  {settings.backup.backupLocation === 'cloud' && (
                    <>
                      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                        Cloud Storage Settings
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth margin="normal">
                            <InputLabel id="cloud-provider-label">Cloud Provider</InputLabel>
                            <Select
                              labelId="cloud-provider-label"
                              value={settings.backup.cloudSettings.provider}
                              onChange={(e) => handleNestedSettingChange('backup', 'cloudSettings', 'provider', e.target.value)}
                              label="Cloud Provider"
                            >
                              <MenuItem value="aws">Amazon S3</MenuItem>
                              <MenuItem value="gcp">Google Cloud Storage</MenuItem>
                              <MenuItem value="azure">Azure Blob Storage</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Bucket Name"
                            value={settings.backup.cloudSettings.bucketName}
                            onChange={(e) => handleNestedSettingChange('backup', 'cloudSettings', 'bucketName', e.target.value)}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Region"
                            value={settings.backup.cloudSettings.region}
                            onChange={(e) => handleNestedSettingChange('backup', 'cloudSettings', 'region', e.target.value)}
                            margin="normal"
                          />
                        </Grid>
                      </Grid>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Backup History
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  {backupHistory.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                      No backup history found.
                    </Typography>
                  ) : (
                    <List>
                      {backupHistory.map((backup) => (
                        <React.Fragment key={backup.id}>
                          <ListItem
                            secondaryAction={
                              <Box>
                                <Tooltip title="Restore from this backup">
                                  <IconButton 
                                    edge="end" 
                                    onClick={() => handleOpenRestoreDialog(backup)}
                                    sx={{ mr: 1 }}
                                  >
                                    <CloudUploadIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete this backup">
                                  <IconButton 
                                    edge="end" 
                                    onClick={() => handleDeleteBackup(backup.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            }
                          >
                            <ListItemIcon>
                              <BackupIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={backup.name}
                              secondary={
                                <>
                                  {formatDate(backup.timestamp)} • {backup.size} • {backup.type} • Created by {backup.user}
                                </>
                              }
                            />
                          </ListItem>
                          <Divider component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </>
          )}
          
          {/* Notification Settings */}
          {activeTab === 4 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Notification Channels
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.enabledChannels.email}
                          onChange={(e) => handleNestedSwitchChange('notifications', 'enabledChannels', 'email', e)}
                        />
                      }
                      label="Email Notifications"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.enabledChannels.sms}
                          onChange={(e) => handleNestedSwitchChange('notifications', 'enabledChannels', 'sms', e)}
                        />
                      }
                      label="SMS Notifications"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.enabledChannels.inApp}
                          onChange={(e) => handleNestedSwitchChange('notifications', 'enabledChannels', 'inApp', e)}
                        />
                      }
                      label="In-App Notifications"
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                  Notification Events
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.events.userRegistration}
                          onChange={(e) => handleNestedSwitchChange('notifications', 'events', 'userRegistration', e)}
                        />
                      }
                      label="User Registration"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.events.passwordReset}
                          onChange={(e) => handleNestedSwitchChange('notifications', 'events', 'passwordReset', e)}
                        />
                      }
                      label="Password Reset"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.events.dataImport}
                          onChange={(e) => handleNestedSwitchChange('notifications', 'events', 'dataImport', e)}
                        />
                      }
                      label="Data Import/Export"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.events.systemBackup}
                          onChange={(e) => handleNestedSwitchChange('notifications', 'events', 'systemBackup', e)}
                        />
                      }
                      label="System Backup"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.events.securityAlert}
                          onChange={(e) => handleNestedSwitchChange('notifications', 'events', 'securityAlert', e)}
                        />
                      }
                      label="Security Alerts"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="digest-frequency-label">Digest Frequency</InputLabel>
                      <Select
                        labelId="digest-frequency-label"
                        value={settings.notifications.digestFrequency}
                        onChange={(e) => handleSettingChange('notifications', 'digestFrequency', e.target.value)}
                        label="Digest Frequency"
                      >
                        <MenuItem value="realtime">Real-time</MenuItem>
                        <MenuItem value="daily">Daily Digest</MenuItem>
                        <MenuItem value="weekly">Weekly Digest</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
          
          {/* Localization Settings */}
          {activeTab === 5 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Localization Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Languages
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="default-language-label">Default Language</InputLabel>
                      <Select
                        labelId="default-language-label"
                        value={settings.localization.defaultLanguage}
                        onChange={(e) => handleSettingChange('localization', 'defaultLanguage', e.target.value)}
                        label="Default Language"
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="ibibio">Ibibio</MenuItem>
                        <MenuItem value="efik">Efik</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Enabled Languages
                    </Typography>
                    <FormGroup row>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={settings.localization.enabledLanguages.includes('en')}
                            onChange={() => handleArrayToggle('localization', 'enabledLanguages', 'en')}
                            disabled={settings.localization.defaultLanguage === 'en'}
                          />
                        }
                        label="English"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={settings.localization.enabledLanguages.includes('ibibio')}
                            onChange={() => handleArrayToggle('localization', 'enabledLanguages', 'ibibio')}
                            disabled={settings.localization.defaultLanguage === 'ibibio'}
                          />
                        }
                        label="Ibibio"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={settings.localization.enabledLanguages.includes('efik')}
                            onChange={() => handleArrayToggle('localization', 'enabledLanguages', 'efik')}
                            disabled={settings.localization.defaultLanguage === 'efik'}
                          />
                        }
                        label="Efik"
                      />
                    </FormGroup>
                  </Grid>
                </Grid>
                
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                  Regional Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="default-currency-label">Default Currency</InputLabel>
                      <Select
                        labelId="default-currency-label"
                        value={settings.localization.defaultCurrency}
                        onChange={(e) => handleSettingChange('localization', 'defaultCurrency', e.target.value)}
                        label="Default Currency"
                      >
                        <MenuItem value="NGN">Nigerian Naira (₦)</MenuItem>
                        <MenuItem value="USD">US Dollar ($)</MenuItem>
                        <MenuItem value="EUR">Euro (€)</MenuItem>
                        <MenuItem value="GBP">British Pound (£)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="measurement-unit-label">Measurement Units</InputLabel>
                      <Select
                        labelId="measurement-unit-label"
                        value={settings.localization.defaultMeasurementUnit}
                        onChange={(e) => handleSettingChange('localization', 'defaultMeasurementUnit', e.target.value)}
                        label="Measurement Units"
                      >
                        <MenuItem value="metric">Metric (kg, cm)</MenuItem>
                        <MenuItem value="imperial">Imperial (lb, in)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
          
          {/* Storage Settings */}
          {activeTab === 6 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Storage Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Maximum Upload Size (MB)"
                      value={settings.storage.uploadSizeLimit}
                      onChange={(e) => handleSettingChange('storage', 'uploadSizeLimit', parseInt(e.target.value, 10))}
                      InputProps={{ inputProps: { min: 1, max: 100 } }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.storage.compressionEnabled}
                          onChange={(e) => handleSwitchChange('storage', 'compressionEnabled', e)}
                        />
                      }
                      label="Enable File Compression"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.storage.imageResizeEnabled}
                          onChange={(e) => handleSwitchChange('storage', 'imageResizeEnabled', e)}
                        />
                      }
                      label="Enable Image Resizing"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Maximum Image Dimension (px)"
                      value={settings.storage.imageMaxDimension}
                      onChange={(e) => handleSettingChange('storage', 'imageMaxDimension', parseInt(e.target.value, 10))}
                      InputProps={{ inputProps: { min: 512, max: 4096, step: 512 } }}
                      margin="normal"
                      disabled={!settings.storage.imageResizeEnabled}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Allowed File Types
                    </Typography>
                    <FormGroup row>
                      {['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv'].map((fileType) => (
                        <FormControlLabel
                          key={fileType}
                          control={
                            <Checkbox
                              checked={settings.storage.allowedFileTypes.includes(fileType)}
                              onChange={() => handleArrayToggle('storage', 'allowedFileTypes', fileType)}
                            />
                          }
                          label={fileType.toUpperCase()}
                        />
                      ))}
                    </FormGroup>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </>
      )}
      
      {/* Restore Backup Dialog */}
      <Dialog
        open={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
      >
        <DialogTitle>Confirm Restore</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to restore from the following backup?
          </Typography>
          {selectedBackup && (
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                {selectedBackup.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created on {formatDate(selectedBackup.timestamp)} ({selectedBackup.size})
              </Typography>
            </Box>
          )}
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" component="div">Warning:</Typography>
            <Typography variant="body2">
              This will replace all current data with the data from this backup.
              This operation cannot be undone.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRestoreBackup} 
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Restore Backup'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Snackbar */}
      <Snackbar
        open={Boolean(actionSuccess)}
        autoHideDuration={5000}
        onClose={() => setActionSuccess('')}
      >
        <SnackbarContent
          sx={{ bgcolor: 'success.main' }}
          message={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DoneIcon sx={{ mr: 1 }} />
              {actionSuccess}
            </Box>
          }
          action={
            <IconButton size="small" color="inherit" onClick={() => setActionSuccess('')}>
              <ClearIcon fontSize="small" />
            </IconButton>
          }
        />
      </Snackbar>
    </Paper>
  );
};

export default SystemSettings;