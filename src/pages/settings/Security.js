// src/pages/settings/Security.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  InputAdornment,
  IconButton,
  OutlinedInput,
  Select,
  MenuItem,
  Switch,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  AddAlert as AddAlertIcon,
  DevicesOther as DevicesOtherIcon,
  PhoneAndroid as PhoneAndroidIcon,
  DeleteForever as DeleteForeverIcon,
  VerifiedUser as VerifiedUserIcon,
  PermDeviceInformation as PermDeviceInformationIcon
} from '@mui/icons-material';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';

// Mock security service - replace with actual service when available
const securityService = {
  getSecuritySettings: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          password_last_changed: '2025-04-10T15:30:00Z',
          two_factor_auth: false,
          login_notifications: true,
          remember_devices: true,
          active_sessions: [
            {
              id: 'session-1',
              device: 'Chrome on Windows',
              ip_address: '192.168.1.101',
              location: 'Uyo, Nigeria',
              last_active: '2025-05-08T14:45:00Z',
              current: true
            },
            {
              id: 'session-2',
              device: 'Safari on iPhone',
              ip_address: '192.168.1.102',
              location: 'Uyo, Nigeria',
              last_active: '2025-05-07T10:20:00Z',
              current: false
            }
          ],
          login_history: [
            {
              id: 'login-1',
              device: 'Chrome on Windows',
              ip_address: '192.168.1.101',
              location: 'Uyo, Nigeria',
              timestamp: '2025-05-08T08:30:00Z',
              status: 'success'
            },
            {
              id: 'login-2',
              device: 'Safari on iPhone',
              ip_address: '192.168.1.102',
              location: 'Uyo, Nigeria',
              timestamp: '2025-05-07T10:15:00Z',
              status: 'success'
            },
            {
              id: 'login-3',
              device: 'Firefox on Windows',
              ip_address: '192.168.1.105',
              location: 'Uyo, Nigeria',
              timestamp: '2025-05-06T14:20:00Z',
              status: 'failed'
            }
          ],
          registered_devices: [
            {
              id: 'device-1',
              name: 'Work Laptop',
              last_used: '2025-05-08T14:45:00Z',
              trusted: true
            },
            {
              id: 'device-2',
              name: 'iPhone 15',
              last_used: '2025-05-07T10:20:00Z',
              trusted: true
            }
          ]
        });
      }, 500);
    });
  },
  updateSecuritySettings: async (settings) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Security settings updated successfully',
          settings
        });
      }, 700);
    });
  },
  changePassword: async (passwordData) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // For demo purposes, reject if current password is not "current123"
        if (passwordData.currentPassword !== 'current123') {
          reject({ message: 'Current password is incorrect' });
          return;
        }
        
        // For demo purposes, reject if new password is too simple
        if (passwordData.newPassword.length < 8) {
          reject({ message: 'New password must be at least 8 characters' });
          return;
        }
        
        resolve({
          success: true,
          message: 'Password changed successfully'
        });
      }, 700);
    });
  },
  toggleTwoFactorAuth: async (enabled) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: enabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled',
          two_factor_auth: enabled
        });
      }, 700);
    });
  },
  revokeSession: async (sessionId) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Session revoked successfully'
        });
      }, 700);
    });
  },
  removeDevice: async (deviceId) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Device removed successfully'
        });
      }, 700);
    });
  }
};

// Security Component
const Security = () => {
  const { loading, error, execute } = useApi();
  
  // State
  const [securitySettings, setSecuritySettings] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  
  // Password change state
  const [passwordValues, setPasswordValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  
  // Dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState(null);
  const [confirmDialogItem, setConfirmDialogItem] = useState(null);
  const [confirmDialogTitle, setConfirmDialogTitle] = useState('');
  const [confirmDialogContent, setConfirmDialogContent] = useState('');
  
  // Fetch security settings
  useEffect(() => {
    const loadSecuritySettings = async () => {
      await execute(
        securityService.getSecuritySettings,
        [],
        (response) => {
          setSecuritySettings(response);
        }
      );
    };
    
    loadSecuritySettings();
  }, []);
  
  // Handle setting change
  const handleSettingChange = (event) => {
    const { name, checked } = event.target;
    
    setSecuritySettings((prev) => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle save settings
  const handleSaveSettings = async () => {
    await execute(
      securityService.updateSecuritySettings,
      [securitySettings],
      (response) => {
        setAlertMessage(response.message);
        setAlertSeverity('success');
        setAlertOpen(true);
      }
    );
  };
  
  // Handle password field change
  const handlePasswordChange = (prop) => (event) => {
    setPasswordValues({ ...passwordValues, [prop]: event.target.value });
    
    // Clear errors when typing
    if (passwordErrors[prop]) {
      setPasswordErrors({
        ...passwordErrors,
        [prop]: ''
      });
    }
  };
  
  // Toggle password visibility
  const handleClickShowPassword = (field) => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };
  
  // Validate password change
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordValues.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordValues.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordValues.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!passwordValues.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordValues.newPassword !== passwordValues.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle password change submission
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      await execute(
        securityService.changePassword,
        [passwordValues],
        (response) => {
          setAlertMessage(response.message);
          setAlertSeverity('success');
          setAlertOpen(true);
          
          // Reset form
          setPasswordValues({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          
          // Update last changed date
          setSecuritySettings((prev) => ({
            ...prev,
            password_last_changed: new Date().toISOString()
          }));
        }
      );
    } catch (err) {
      setAlertMessage(err.message || 'Failed to change password');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };
  
  // Handle toggle two-factor auth
  const handleToggleTwoFactorAuth = async () => {
    const newState = !securitySettings.two_factor_auth;
    
    await execute(
      securityService.toggleTwoFactorAuth,
      [newState],
      (response) => {
        setSecuritySettings((prev) => ({
          ...prev,
          two_factor_auth: newState
        }));
        setAlertMessage(response.message);
        setAlertSeverity('success');
        setAlertOpen(true);
      }
    );
  };
  
  // Open confirmation dialog
  const openConfirmDialog = (action, item, title, content) => {
    setConfirmDialogAction(action);
    setConfirmDialogItem(item);
    setConfirmDialogTitle(title);
    setConfirmDialogContent(content);
    setConfirmDialogOpen(true);
  };
  
  // Handle revoke session
  const handleRevokeSession = (session) => {
    if (session.current) {
      setAlertMessage("You cannot revoke your current session");
      setAlertSeverity('warning');
      setAlertOpen(true);
      return;
    }
    
    openConfirmDialog(
      'revokeSession',
      session,
      'Revoke Session',
      `Are you sure you want to revoke this session on ${session.device}? This will log out that device.`
    );
  };
  
  // Handle remove device
  const handleRemoveDevice = (device) => {
    openConfirmDialog(
      'removeDevice',
      device,
      'Remove Device',
      `Are you sure you want to remove ${device.name} from your trusted devices?`
    );
  };
  
  // Handle confirmation dialog confirmation
  const handleConfirmDialogConfirm = async () => {
    setConfirmDialogOpen(false);
    
    switch (confirmDialogAction) {
      case 'revokeSession':
        await execute(
          securityService.revokeSession,
          [confirmDialogItem.id],
          (response) => {
            // Remove session from list
            setSecuritySettings((prev) => ({
              ...prev,
              active_sessions: prev.active_sessions.filter(
                (session) => session.id !== confirmDialogItem.id
              )
            }));
            
            setAlertMessage(response.message);
            setAlertSeverity('success');
            setAlertOpen(true);
          }
        );
        break;
        
      case 'removeDevice':
        await execute(
          securityService.removeDevice,
          [confirmDialogItem.id],
          (response) => {
            // Remove device from list
            setSecuritySettings((prev) => ({
              ...prev,
              registered_devices: prev.registered_devices.filter(
                (device) => device.id !== confirmDialogItem.id
              )
            }));
            
            setAlertMessage(response.message);
            setAlertSeverity('success');
            setAlertOpen(true);
          }
        );
        break;
        
      default:
        break;
    }
  };
  
  // Handle alert close
  const handleAlertClose = () => {
    setAlertOpen(false);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };
  
  // Calculate time since last activity
  const getTimeSince = (dateString) => {
    if (!dateString) return 'Unknown';
    
    try {
      const lastActivity = new Date(dateString);
      const now = new Date();
      const diffMs = now - lastActivity;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    } catch (error) {
      return 'Unknown';
    }
  };
  
  if (loading && !securitySettings) {
    return (
      <MainLayout title="Security">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout
      title="Security"
      breadcrumbs={[
        { name: 'Settings', path: '/settings' },
        { name: 'Security', active: true }
      ]}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Security & Privacy
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
            onClick={handleSaveSettings}
            disabled={loading}
          >
            Save Changes
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {securitySettings && (
          <Grid container spacing={3}>
            {/* Password Change Section */}
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 3 }}>
                <CardHeader
                  title="Password Management"
                  avatar={<LockIcon color="primary" />}
                  subheader={`Last changed: ${formatDate(securitySettings.password_last_changed)}`}
                />
                <Divider />
                <CardContent>
                  <Box component="form" noValidate autoComplete="off">
                    <FormControl 
                      fullWidth 
                      variant="outlined" 
                      margin="normal"
                      error={!!passwordErrors.currentPassword}
                    >
                      <InputLabel htmlFor="current-password">Current Password</InputLabel>
                      <OutlinedInput
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordValues.currentPassword}
                        onChange={handlePasswordChange('currentPassword')}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => handleClickShowPassword('current')}
                              edge="end"
                            >
                              {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Current Password"
                      />
                      {passwordErrors.currentPassword && (
                        <FormHelperText error>{passwordErrors.currentPassword}</FormHelperText>
                      )}
                    </FormControl>
                    
                    <FormControl 
                      fullWidth 
                      variant="outlined" 
                      margin="normal"
                      error={!!passwordErrors.newPassword}
                    >
                      <InputLabel htmlFor="new-password">New Password</InputLabel>
                      <OutlinedInput
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordValues.newPassword}
                        onChange={handlePasswordChange('newPassword')}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => handleClickShowPassword('new')}
                              edge="end"
                            >
                              {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="New Password"
                      />
                      {passwordErrors.newPassword && (
                        <FormHelperText error>{passwordErrors.newPassword}</FormHelperText>
                      )}
                    </FormControl>
                    
                    <FormControl 
                      fullWidth 
                      variant="outlined" 
                      margin="normal"
                      error={!!passwordErrors.confirmPassword}
                    >
                      <InputLabel htmlFor="confirm-password">Confirm New Password</InputLabel>
                      <OutlinedInput
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordValues.confirmPassword}
                        onChange={handlePasswordChange('confirmPassword')}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => handleClickShowPassword('confirm')}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Confirm New Password"
                      />
                      {passwordErrors.confirmPassword && (
                        <FormHelperText error>{passwordErrors.confirmPassword}</FormHelperText>
                      )}
                    </FormControl>
                    
                    <Box sx={{ mt: 3 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleChangePassword}
                        disabled={loading}
                        startIcon={<LockIcon />}
                      >
                        Change Password
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Authentication Settings */}
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 3 }}>
                <CardHeader
                  title="Authentication Settings"
                  avatar={<SecurityIcon color="primary" />}
                />
                <Divider />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <VerifiedUserIcon color={securitySettings.two_factor_auth ? "primary" : "disabled"} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Two-Factor Authentication"
                        secondary="Add an extra layer of security to your account"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          name="two_factor_auth"
                          checked={securitySettings.two_factor_auth}
                          onChange={handleToggleTwoFactorAuth}
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemIcon>
                        <AddAlertIcon color={securitySettings.login_notifications ? "primary" : "disabled"} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Login Notifications"
                        secondary="Receive email alerts for new sign-ins"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          name="login_notifications"
                          checked={securitySettings.login_notifications}
                          onChange={handleSettingChange}
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemIcon>
                        <DevicesOtherIcon color={securitySettings.remember_devices ? "primary" : "disabled"} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Remember Devices"
                        secondary="Trust devices you use regularly"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          name="remember_devices"
                          checked={securitySettings.remember_devices}
                          onChange={handleSettingChange}
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Active Sessions */}
            <Grid item xs={12}>
              <Card sx={{ mb: 3 }}>
                <CardHeader
                  title="Active Sessions"
                  avatar={<DevicesOtherIcon color="primary" />}
                />
                <Divider />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    These are the devices and locations currently logged into your account. You can revoke access for any session except your current one.
                  </Typography>
                  <Box sx={{ overflowX: 'auto' }}>
                    {securitySettings.active_sessions.length > 0 ? (
                      <Grid container spacing={2}>
                        {securitySettings.active_sessions.map((session) => (
                          <Grid item xs={12} md={6} key={session.id}>
                            <Card variant="outlined" sx={{ 
                              bgcolor: session.current ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                              position: 'relative'
                            }}>
                              {session.current && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    borderRadius: 1,
                                    px: 1,
                                    py: 0.5,
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  Current
                                </Box>
                              )}
                              <CardContent>
                                <Typography variant="h6" gutterBottom>
                                  {session.device}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                  <strong>IP:</strong> {session.ip_address}<br />
                                  <strong>Location:</strong> {session.location}<br />
                                  <strong>Last Active:</strong> {getTimeSince(session.last_active)}
                                </Typography>
                                {!session.current && (
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => handleRevokeSession(session)}
                                  >
                                    Revoke Session
                                  </Button>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography>No active sessions</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Registered Devices */}
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 3 }}>
                <CardHeader
                  title="Registered Devices"
                  avatar={<PhoneAndroidIcon color="primary" />}
                />
                <Divider />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    These are devices you've saved to your account for easier sign-in.
                  </Typography>
                  {securitySettings.registered_devices.length > 0 ? (
                    <List dense>
                      {securitySettings.registered_devices.map((device) => (
                        <ListItem key={device.id}>
                          <ListItemIcon>
                            <PermDeviceInformationIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={device.name}
                            secondary={`Last used: ${getTimeSince(device.last_used)}`}
                          />
                          <ListItemSecondaryAction>
                            <Tooltip title="Remove Device">
                              <IconButton
                                edge="end"
                                color="error"
                                onClick={() => handleRemoveDevice(device)}
                              >
                                <DeleteForeverIcon />
                              </IconButton>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography>No registered devices</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Login History */}
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 3 }}>
                <CardHeader
                  title="Login History"
                  avatar={<HistoryIcon color="primary" />}
                />
                <Divider />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Recent login activity for your account.
                  </Typography>
                  {securitySettings.login_history.length > 0 ? (
                    <List dense>
                      {securitySettings.login_history.map((login) => (
                        <ListItem key={login.id}>
                          <ListItemIcon>
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                bgcolor: login.status === 'success' ? 'success.light' : 'error.light'
                              }}
                            >
                              {login.status === 'success' ? 
                                <VerifiedUserIcon color="success" /> : 
                                <LockIcon color="error" />
                              }
                            </Box>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body1">
                                  {login.device}
                                </Typography>
                                <Box 
                                  sx={{
                                    ml: 1,
                                    bgcolor: login.status === 'success' ? 'success.main' : 'error.main',
                                    color: 'white',
                                    borderRadius: 1,
                                    px: 1,
                                    py: 0.5,
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  {login.status === 'success' ? 'Success' : 'Failed'}
                                </Box>
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" component="span">
                                  {formatDate(login.timestamp)}
                                </Typography>
                                <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                                  • {login.ip_address} • {login.location}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography>No login history</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Paper>
      
      {/* Alert Snackbar */}
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleAlertClose}>
        <Alert onClose={handleAlertClose} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>{confirmDialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialogContent}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDialogConfirm} color="error" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Security;