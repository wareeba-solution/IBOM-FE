// src/pages/settings/Preferences.js
import React, { useState, useEffect } from 'react';
import MailIcon from '@mui/icons-material/Mail';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  FormControl,
  FormControlLabel,
  InputLabel,
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
  Slider,
  Radio,
  RadioGroup,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Palette as PaletteIcon,
  FormatSize as FormatSizeIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  Language as LanguageIcon,
  Alarm as AlarmIcon,
  Info as InfoIcon,
  DataUsage as DataUsageIcon,
  Storage as StorageIcon,
  DeleteSweep as DeleteSweepIcon,
  Sync as SyncIcon,
  QueryBuilder as QueryBuilderIcon
} from '@mui/icons-material';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';

// Mock preferences service - replace with actual service when available
const preferencesService = {
  getUserPreferences: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          theme: 'light',
          color_scheme: 'blue',
          font_size: 'medium',
          language: 'en',
          date_format: 'DD/MM/YYYY',
          time_format: '24h',
          start_page: 'dashboard',
          records_per_page: 10,
          enable_notifications: true,
          email_notifications: true,
          sms_notifications: false,
          offline_mode: true,
          auto_sync: true,
          sync_frequency: 'hourly',
          auto_logout: true,
          session_timeout: 30,
          data_saving_mode: false
        });
      }, 500);
    });
  },
  saveUserPreferences: async (preferences) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Preferences saved successfully',
          preferences
        });
      }, 700);
    });
  },
  resetUserPreferences: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Preferences reset to defaults',
          preferences: {
            theme: 'light',
            color_scheme: 'blue',
            font_size: 'medium',
            language: 'en',
            date_format: 'DD/MM/YYYY',
            time_format: '24h',
            start_page: 'dashboard',
            records_per_page: 10,
            enable_notifications: true,
            email_notifications: true,
            sms_notifications: false,
            offline_mode: true,
            auto_sync: true,
            sync_frequency: 'hourly',
            auto_logout: true,
            session_timeout: 30,
            data_saving_mode: false
          }
        });
      }, 700);
    });
  },
  getCacheSize: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          cache_size: '24.5 MB'
        });
      }, 300);
    });
  },
  clearCache: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Cache cleared successfully'
        });
      }, 700);
    });
  }
};

// Available theme options
const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System Default' }
];

// Available color scheme options
const colorSchemeOptions = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' },
  { value: 'orange', label: 'Orange' },
  { value: 'teal', label: 'Teal' }
];

// Available font size options
const fontSizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' }
];

// Available language options
const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'ig', label: 'Igbo' },
  { value: 'yo', label: 'Yoruba' },
  { value: 'ha', label: 'Hausa' }
];

// Available date format options
const dateFormatOptions = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
];

// Available time format options
const timeFormatOptions = [
  { value: '12h', label: '12-hour (AM/PM)' },
  { value: '24h', label: '24-hour' }
];

// Available start page options
const startPageOptions = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'patients', label: 'Patients' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'births', label: 'Birth Records' },
  { value: 'family-planning', label: 'Family Planning' }
];

// Available sync frequency options
const syncFrequencyOptions = [
  { value: 'realtime', label: 'Real-time' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'manual', label: 'Manual only' }
];

// Preferences Component
const Preferences = () => {
  const { loading, error, execute } = useApi();
  
  // State
  const [preferences, setPreferences] = useState(null);
  const [cacheSize, setCacheSize] = useState(null);
  const [clearingCache, setClearingCache] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  
  // Fetch user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      await execute(
        preferencesService.getUserPreferences,
        [],
        (response) => {
          setPreferences(response);
        }
      );
      
      // Get cache size
      const cacheResponse = await preferencesService.getCacheSize();
      setCacheSize(cacheResponse.cache_size);
    };
    
    loadPreferences();
  }, []);
  
  // Handle preference change
  const handlePreferenceChange = (event) => {
    const { name, value, checked } = event.target;
    
    // For switches and checkboxes, use checked property
    const newValue = event.target.type === 'checkbox' ? checked : value;
    
    setPreferences((prev) => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  // Handle slider change for session timeout
  const handleSliderChange = (event, newValue) => {
    setPreferences((prev) => ({
      ...prev,
      session_timeout: newValue
    }));
  };
  
  // Handle save preferences
  const handleSavePreferences = async () => {
    await execute(
      preferencesService.saveUserPreferences,
      [preferences],
      (response) => {
        setAlertMessage(response.message);
        setAlertSeverity('success');
        setAlertOpen(true);
      }
    );
  };
  
  // Handle reset preferences
  const handleResetPreferences = async () => {
    await execute(
      preferencesService.resetUserPreferences,
      [],
      (response) => {
        setPreferences(response.preferences);
        setAlertMessage(response.message);
        setAlertSeverity('success');
        setAlertOpen(true);
      }
    );
  };
  
  // Handle clear cache
  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      const response = await preferencesService.clearCache();
      setAlertMessage(response.message);
      setAlertSeverity('success');
      setAlertOpen(true);
      
      // Update cache size
      const cacheResponse = await preferencesService.getCacheSize();
      setCacheSize(cacheResponse.cache_size);
    } catch (error) {
      setAlertMessage('Failed to clear cache');
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
      setClearingCache(false);
    }
  };
  
  // Handle alert close
  const handleAlertClose = () => {
    setAlertOpen(false);
  };
  
  if (loading && !preferences) {
    return (
      <MainLayout title="Preferences">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout
      title="Preferences"
      breadcrumbs={[
        { name: 'Settings', path: '/settings' },
        { name: 'Preferences', active: true }
      ]}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Application Preferences
          </Typography>
          <Box>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RefreshIcon />}
              onClick={handleResetPreferences}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              Reset to Defaults
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
              onClick={handleSavePreferences}
              disabled={loading}
            >
              Save Preferences
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {preferences && (
          <Grid container spacing={3}>
            {/* Appearance Settings */}
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 3, height: '100%' }}>
                <CardHeader
                  title="Appearance"
                  avatar={<PaletteIcon color="primary" />}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="theme-label">Theme</InputLabel>
                        <Select
                          labelId="theme-label"
                          id="theme"
                          name="theme"
                          value={preferences.theme}
                          onChange={handlePreferenceChange}
                          label="Theme"
                          startAdornment={
                            preferences.theme === 'dark' ? <DarkModeIcon sx={{ mr: 1 }} /> : <LightModeIcon sx={{ mr: 1 }} />
                          }
                        >
                          {themeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="color-scheme-label">Color Scheme</InputLabel>
                        <Select
                          labelId="color-scheme-label"
                          id="color_scheme"
                          name="color_scheme"
                          value={preferences.color_scheme}
                          onChange={handlePreferenceChange}
                          label="Color Scheme"
                        >
                          {colorSchemeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="font-size-label">Font Size</InputLabel>
                        <Select
                          labelId="font-size-label"
                          id="font_size"
                          name="font_size"
                          value={preferences.font_size}
                          onChange={handlePreferenceChange}
                          label="Font Size"
                          startAdornment={<FormatSizeIcon sx={{ mr: 1 }} />}
                        >
                          {fontSizeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Localization Settings */}
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 3, height: '100%' }}>
                <CardHeader
                  title="Localization"
                  avatar={<LanguageIcon color="primary" />}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="language-label">Language</InputLabel>
                        <Select
                          labelId="language-label"
                          id="language"
                          name="language"
                          value={preferences.language}
                          onChange={handlePreferenceChange}
                          label="Language"
                          startAdornment={<LanguageIcon sx={{ mr: 1 }} />}
                        >
                          {languageOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="date-format-label">Date Format</InputLabel>
                        <Select
                          labelId="date-format-label"
                          id="date_format"
                          name="date_format"
                          value={preferences.date_format}
                          onChange={handlePreferenceChange}
                          label="Date Format"
                        >
                          {dateFormatOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="time-format-label">Time Format</InputLabel>
                        <Select
                          labelId="time-format-label"
                          id="time_format"
                          name="time_format"
                          value={preferences.time_format}
                          onChange={handlePreferenceChange}
                          label="Time Format"
                        >
                          {timeFormatOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Behavior Settings */}
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 3 }}>
                <CardHeader
                  title="Application Behavior"
                  avatar={<DataUsageIcon color="primary" />}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="start-page-label">Start Page</InputLabel>
                        <Select
                          labelId="start-page-label"
                          id="start_page"
                          name="start_page"
                          value={preferences.start_page}
                          onChange={handlePreferenceChange}
                          label="Start Page"
                        >
                          {startPageOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="records-per-page-label">Records Per Page</InputLabel>
                        <Select
                          labelId="records-per-page-label"
                          id="records_per_page"
                          name="records_per_page"
                          value={preferences.records_per_page}
                          onChange={handlePreferenceChange}
                          label="Records Per Page"
                        >
                          <MenuItem value={5}>5</MenuItem>
                          <MenuItem value={10}>10</MenuItem>
                          <MenuItem value={25}>25</MenuItem>
                          <MenuItem value={50}>50</MenuItem>
                          <MenuItem value={100}>100</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Auto Logout</Typography>
                        <Switch
                          name="auto_logout"
                          checked={preferences.auto_logout}
                          onChange={handlePreferenceChange}
                          color="primary"
                        />
                      </Box>
                      {preferences.auto_logout && (
                        <Box sx={{ mt: 2 }}>
                          <Typography id="session-timeout-slider" gutterBottom>
                            Session Timeout: {preferences.session_timeout} minutes
                          </Typography>
                          <Slider
                            value={preferences.session_timeout}
                            onChange={handleSliderChange}
                            aria-labelledby="session-timeout-slider"
                            valueLabelDisplay="auto"
                            step={5}
                            marks
                            min={5}
                            max={120}
                          />
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Notification Settings */}
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 3 }}>
                <CardHeader
                  title="Notifications"
                  avatar={<NotificationsIcon color="primary" />}
                />
                <Divider />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        {preferences.enable_notifications ? <NotificationsActiveIcon color="primary" /> : <NotificationsOffIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary="Enable Notifications"
                        secondary="Receive system notifications and alerts"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          name="enable_notifications"
                          checked={preferences.enable_notifications}
                          onChange={handlePreferenceChange}
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem disabled={!preferences.enable_notifications}>
                      <ListItemIcon>
                        <MailIcon color={preferences.enable_notifications && preferences.email_notifications ? "primary" : "disabled"} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email Notifications"
                        secondary="Receive notifications via email"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          name="email_notifications"
                          checked={preferences.email_notifications}
                          onChange={handlePreferenceChange}
                          color="primary"
                          disabled={!preferences.enable_notifications}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem disabled={!preferences.enable_notifications}>
                      <ListItemIcon>
                        <SmsIcon color={preferences.enable_notifications && preferences.sms_notifications ? "primary" : "disabled"} />
                      </ListItemIcon>
                      <ListItemText
                        primary="SMS Notifications"
                        secondary="Receive notifications via SMS"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          name="sms_notifications"
                          checked={preferences.sms_notifications}
                          onChange={handlePreferenceChange}
                          color="primary"
                          disabled={!preferences.enable_notifications}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Data & Sync Settings */}
            <Grid item xs={12}>
              <Card sx={{ mb: 3 }}>
                <CardHeader
                  title="Data & Synchronization"
                  avatar={<SyncIcon color="primary" />}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <StorageIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Offline Mode"
                            secondary="Enable data collection when offline"
                          />
                          <ListItemSecondaryAction>
                            <Switch
                              name="offline_mode"
                              checked={preferences.offline_mode}
                              onChange={handlePreferenceChange}
                              color="primary"
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemIcon>
                            <SyncIcon color={preferences.auto_sync ? "primary" : "disabled"} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Auto Synchronization"
                            secondary="Automatically sync data when online"
                          />
                          <ListItemSecondaryAction>
                            <Switch
                              name="auto_sync"
                              checked={preferences.auto_sync}
                              onChange={handlePreferenceChange}
                              color="primary"
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem disabled={!preferences.auto_sync}>
                          <ListItemIcon>
                            <QueryBuilderIcon color={preferences.auto_sync ? "primary" : "disabled"} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Sync Frequency"
                            secondary="How often to synchronize data"
                          />
                          <ListItemSecondaryAction sx={{ width: '40%' }}>
                            <FormControl fullWidth size="small">
                              <Select
                                id="sync_frequency"
                                name="sync_frequency"
                                value={preferences.sync_frequency}
                                onChange={handlePreferenceChange}
                                disabled={!preferences.auto_sync}
                              >
                                {syncFrequencyOptions.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemIcon>
                            <DataUsageIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Data Saving Mode"
                            secondary="Reduce data usage when on mobile networks"
                          />
                          <ListItemSecondaryAction>
                            <Switch
                              name="data_saving_mode"
                              checked={preferences.data_saving_mode}
                              onChange={handlePreferenceChange}
                              color="primary"
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      </List>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardHeader
                          title="Cache Management"
                          subheader={`Current cache size: ${cacheSize || 'Calculating...'}`}
                          avatar={<StorageIcon color="primary" />}
                        />
                        <Divider />
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Clearing the cache will remove all temporarily stored data. This won't affect your saved records.
                          </Typography>
                          <Button
                            variant="outlined"
                            startIcon={clearingCache ? <CircularProgress size={24} /> : <DeleteSweepIcon />}
                            onClick={handleClearCache}
                            disabled={clearingCache}
                            color="error"
                          >
                            Clear Cache
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
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
    </MainLayout>
  );
};

// SMS Icon Component
const SmsIcon = (props) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      height="24px" 
      viewBox="0 0 24 24" 
      width="24px" 
      fill={props.color === 'primary' ? '#1976d2' : '#adadad'}>
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/>
    </svg>
  );
};

export default Preferences;