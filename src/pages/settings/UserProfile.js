// src/pages/settings/UserProfile.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  Avatar,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';

// Mock user service - replace with actual service when available
const userService = {
  getUserProfile: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'USR1001',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+234 800 123 4567',
          role: 'Administrator',
          job_title: 'Medical Director',
          facility: 'Uyo General Hospital',
          department: 'Administration',
          profile_image: null,
          address: 'Uyo, Akwa Ibom',
          date_joined: '2023-01-15',
          last_login: '2025-05-08T08:30:00Z',
          last_activity: '2025-05-08T14:45:00Z',
          supervisor: 'Dr. Michael Okon',
          bio: 'Medical doctor with over 10 years of experience in healthcare administration and public health.',
          specialization: 'Public Health'
        });
      }, 500);
    });
  },
  updateUserProfile: async (userData) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Profile updated successfully',
          user: userData
        });
      }, 700);
    });
  },
  uploadProfileImage: async (file) => {
    // Simulate API call for image upload
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate image URL
        const imageUrl = 'https://example.com/profile-image.jpg';
        resolve({
          success: true,
          url: imageUrl
        });
      }, 1000);
    });
  }
};

// Available roles
const roleOptions = [
  'Administrator',
  'Doctor',
  'Nurse',
  'Midwife',
  'Health Officer',
  'Data Entry Clerk',
  'Supervisor',
  'Read-Only User'
];

// Available departments
const departmentOptions = [
  'Administration',
  'General Practice',
  'Pediatrics',
  'Obstetrics & Gynecology',
  'Surgery',
  'Internal Medicine',
  'Public Health',
  'Immunization',
  'Family Planning',
  'Laboratory',
  'Pharmacy',
  'Statistics'
];

// User Profile Component
const UserProfile = () => {
  const { loading, error, execute } = useApi();
  
  // State
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Fetch user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      await execute(
        userService.getUserProfile,
        [],
        (response) => {
          setProfile(response);
          setFormValues(response);
        }
      );
    };
    
    loadUserProfile();
  }, []);
  
  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form field changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Toggle edit mode
  const handleToggleEdit = () => {
    setEditMode(!editMode);
    
    // Reset form values when canceling edit
    if (editMode) {
      setFormValues(profile);
      setImagePreview(null);
      setImageFile(null);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      // Upload image if selected
      let updatedProfile = { ...formValues };
      
      if (imageFile) {
        setUploadingImage(true);
        const imageUploadResult = await userService.uploadProfileImage(imageFile);
        if (imageUploadResult.success) {
          updatedProfile.profile_image = imageUploadResult.url;
        }
        setUploadingImage(false);
      }
      
      // Update profile
      await execute(
        userService.updateUserProfile,
        [updatedProfile],
        (response) => {
          setProfile(response.user);
          setAlertMessage(response.message);
          setAlertSeverity('success');
          setAlertOpen(true);
          setEditMode(false);
        }
      );
    } catch (error) {
      setAlertMessage('Failed to update profile');
      setAlertSeverity('error');
      setAlertOpen(true);
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
  const getTimeSinceLastActivity = (dateString) => {
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
  
  if (loading && !profile) {
    return (
      <MainLayout title="User Profile">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout
      title="User Profile"
      breadcrumbs={[
        { name: 'Settings', path: '/settings' },
        { name: 'Profile', active: true }
      ]}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            My Profile
          </Typography>
          <Button
            variant={editMode ? "outlined" : "contained"}
            color={editMode ? "error" : "primary"}
            startIcon={editMode ? null : <EditIcon />}
            onClick={handleToggleEdit}
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {profile && (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Profile Image Section */}
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      editMode ? (
                        <label htmlFor="profile-image-input">
                          <input
                            accept="image/*"
                            id="profile-image-input"
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                          />
                          <IconButton component="span" color="primary" sx={{ bgcolor: 'white' }}>
                            <PhotoCameraIcon />
                          </IconButton>
                        </label>
                      ) : null
                    }
                  >
                    <Avatar
                      src={imagePreview || profile.profile_image}
                      alt={profile.name}
                      sx={{ width: 160, height: 160, mb: 2 }}
                    >
                      {profile.name?.charAt(0)}
                    </Avatar>
                  </Badge>
                  
                  <Typography variant="h6" align="center" gutterBottom>
                    {profile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                    {profile.job_title} • {profile.role}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {profile.facility}
                  </Typography>
                </Box>
              </Grid>
              
              {/* Profile Details */}
              <Grid item xs={12} md={9}>
                <Card sx={{ mb: 3 }}>
                  <CardHeader title="Personal Information" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          name="name"
                          value={formValues.name || ''}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          required
                          variant={editMode ? "outlined" : "filled"}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={formValues.email || ''}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          required
                          variant={editMode ? "outlined" : "filled"}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="phone"
                          value={formValues.phone || ''}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          variant={editMode ? "outlined" : "filled"}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Address"
                          name="address"
                          value={formValues.address || ''}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          variant={editMode ? "outlined" : "filled"}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Bio"
                          name="bio"
                          value={formValues.bio || ''}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          multiline
                          rows={3}
                          variant={editMode ? "outlined" : "filled"}
                          margin="normal"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                <Card sx={{ mb: 3 }}>
                  <CardHeader title="Professional Information" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Job Title"
                          name="job_title"
                          value={formValues.job_title || ''}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          variant={editMode ? "outlined" : "filled"}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl 
                          fullWidth 
                          variant={editMode ? "outlined" : "filled"}
                          margin="normal"
                          disabled={!editMode || loading}
                        >
                          <InputLabel id="role-label">Role</InputLabel>
                          <Select
                            labelId="role-label"
                            id="role"
                            name="role"
                            value={formValues.role || ''}
                            onChange={handleChange}
                            label="Role"
                          >
                            {roleOptions.map((role) => (
                              <MenuItem key={role} value={role}>{role}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl 
                          fullWidth 
                          variant={editMode ? "outlined" : "filled"}
                          margin="normal"
                          disabled={!editMode || loading}
                        >
                          <InputLabel id="department-label">Department</InputLabel>
                          <Select
                            labelId="department-label"
                            id="department"
                            name="department"
                            value={formValues.department || ''}
                            onChange={handleChange}
                            label="Department"
                          >
                            {departmentOptions.map((dept) => (
                              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Facility"
                          name="facility"
                          value={formValues.facility || ''}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          variant={editMode ? "outlined" : "filled"}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Specialization"
                          name="specialization"
                          value={formValues.specialization || ''}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          variant={editMode ? "outlined" : "filled"}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Supervisor"
                          name="supervisor"
                          value={formValues.supervisor || ''}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          variant={editMode ? "outlined" : "filled"}
                          margin="normal"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                {!editMode && (
                  <Card>
                    <CardHeader title="Account Information" />
                    <Divider />
                    <CardContent>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <PersonIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="User ID"
                            secondary={profile.id}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <AccessTimeIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Date Joined"
                            secondary={formatDate(profile.date_joined)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <AccessTimeIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Last Login"
                            secondary={formatDate(profile.last_login)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <AccessTimeIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Last Activity"
                            secondary={getTimeSinceLastActivity(profile.last_activity)}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                )}
              </Grid>
              
              {/* Submit Button */}
              {editMode && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={loading || uploadingImage}
                      startIcon={loading || uploadingImage ? <CircularProgress size={24} /> : <SaveIcon />}
                    >
                      {uploadingImage ? 'Uploading Image...' : (loading ? 'Saving...' : 'Save Changes')}
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </form>
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

export default UserProfile;