// src/pages/auth/Register.js
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box,
  Card, 
  CardContent,
  Typography, 
  TextField, 
  Button, 
  Link, 
  Grid,
  InputAdornment, 
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
  FormControl,
  FormHelperText,
  useTheme,
  Divider
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  PersonAdd as RegisterIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import api from '../../services/api';

// Register page component
const Register = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { register, roles, facilities, isLoading } = useAuth();
  
  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('error');
  //const [facilities, setFacilities] = useState([]);
  //const [roles, setRoles] = useState([]);
  //const [isLoading, setIsLoading] = useState(true);
  
  // Fetch facilities and roles on component mount
  /*useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        //roles
        //facilities
        // Mock data for development
        /*setFacilities([
          { id: '1', name: 'Akwa Ibom State Health Department' },
          { id: '2', name: 'University of Uyo Teaching Hospital' },
          { id: '3', name: 'Ibom Specialist Hospital' },
          { id: '4', name: 'General Hospital Eket' },
          { id: '5', name: 'Primary Health Center Ikot Ekpene' }
        ]);
        
        setRoles([
          { id: '1', name: 'admin', displayName: 'Administrator' },
          { id: '2', name: 'doctor', displayName: 'Doctor' },
          { id: '3', name: 'nurse', displayName: 'Nurse' },
          { id: '4', name: 'data_entry', displayName: 'Data Entry Clerk' },
          { id: '5', name: 'health_worker', displayName: 'Health Worker' }
        ]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data. Please try again later.');
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []); */

  // Form validation schema
  const validationSchema = Yup.object({
    // Direct backend fields
    username: Yup.string()
      .required('Username is required')
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .matches(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, and ._-'),
    firstName: Yup.string()
      .required('First name is required')
      .min(2, 'First name must be at least 2 characters'),
    lastName: Yup.string()
      .required('Last name is required')
      .min(2, 'Last name must be at least 2 characters'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phoneNumber: Yup.string()
      .required('Phone number is required')
      .matches(/^[0-9+\s()-]{10,15}$/, 'Invalid phone number format'),
    facilityId: Yup.string()
      .required('Facility is required'),
    roleId: Yup.string()
      .required('Role is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
  });
  
  // Handle form submission
  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Prepare registration data in the format expected by the backend
      const registrationData = {
        username: values.username,
        email: values.email,
        password: values.password,
        password_confirmation: values.confirmPassword,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        facilityId: values.facilityId,
        roleId: values.roleId
      };
      
      console.log('Submitting registration data:', registrationData);
      
      // Submit registration request
      const response = await api.post('/auth/register', registrationData);
      
      // Handle successful registration
      if (response.data && response.data.status === 'success') {
        setSuccess('Registration successful! Your account request has been submitted for approval. You will receive an email when your account is activated.');
        setAlertType('success');
        setShowAlert(true);
        
        // Reset form
        formik.resetForm();
        
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } else {
        // Handle unexpected success response format
        setError(response.data?.message || 'Registration completed but with an unexpected response. Please contact support.');
        setAlertType('warning');
        setShowAlert(true);
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle validation errors
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.keys(errors).map(field => `${field}: ${errors[field]}`).join(', ');
        setError(`Validation error: ${errorMessages}`);
      } else {
        // Handle other error types
        setError(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
      }
      
      setAlertType('error');
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Initialize formik with all the required backend fields
  const formik = useFormik({
    initialValues: {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      facilityId: '',
      roleId: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: handleSubmit
  });
  
  // Username suggestion based on email
  useEffect(() => {
    if (formik.values.email && !formik.values.username) {
      const suggestedUsername = formik.values.email.split('@')[0].toLowerCase();
      formik.setFieldValue('username', suggestedUsername);
    }
  }, [formik.values.email]);
  
  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Toggle confirm password visibility
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Close alert
  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card 
          sx={{ 
            width: '100%', 
            boxShadow: 3,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'primary.contrastText', 
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Akwa Ibom Health
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" align="center" gutterBottom>
              Request Account Access
            </Typography>
            
            <Typography variant="body2" color="text.secondary" align="center" gutterBottom sx={{ mb: 3 }}>
              Fill in your details to request system access
            </Typography>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Personal Information
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="firstName"
                      name="firstName"
                      label="First Name"
                      autoComplete="given-name"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                      helperText={formik.touched.firstName && formik.errors.firstName}
                      placeholder="e.g. John"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="lastName"
                      name="lastName"
                      label="Last Name"
                      autoComplete="family-name"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                      helperText={formik.touched.lastName && formik.errors.lastName}
                      placeholder="e.g. Doe"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Email Address"
                      autoComplete="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      placeholder="e.g. john.doe@example.com"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="phoneNumber"
                      name="phoneNumber"
                      label="Phone Number"
                      autoComplete="tel"
                      value={formik.values.phoneNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                      helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                      placeholder="e.g. 08012345678"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="username"
                      name="username"
                      label="Username"
                      autoComplete="username"
                      value={formik.values.username}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.username && Boolean(formik.errors.username)}
                      helperText={formik.touched.username && formik.errors.username}
                      placeholder="e.g. johndoe"
                    />
                    <FormHelperText>
                      Your username will be auto-suggested from your email, but you can change it.
                    </FormHelperText>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="roleId"
                      name="roleId"
                      select
                      label="Role"
                      value={formik.values.roleId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.roleId && Boolean(formik.errors.roleId)}
                      helperText={formik.touched.roleId && formik.errors.roleId}
                    >
                      <MenuItem value="" disabled>
                        Select your role
                      </MenuItem>
                      {roles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="facilityId"
                      name="facilityId"
                      select
                      label="Facility"
                      value={formik.values.facilityId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.facilityId && Boolean(formik.errors.facilityId)}
                      helperText={formik.touched.facilityId && formik.errors.facilityId}
                    >
                      <MenuItem value="" disabled>
                        Select your facility
                      </MenuItem>
                      {facilities?.map((facility) => (
                        <MenuItem key={facility.id} value={facility.id}>
                          {facility.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Security Information
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="password"
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.password && Boolean(formik.errors.password)}
                      helperText={formik.touched.password && formik.errors.password}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleTogglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="confirmPassword"
                      name="confirmPassword"
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                      helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={handleToggleConfirmPasswordVisibility}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, mb: 2 }}>
                  <FormHelperText>
                    * Note: Account requests are subject to approval by the system administrator.
                    You will receive an email notification once your account is approved.
                  </FormHelperText>
                </Box>
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <RegisterIcon />}
                  sx={{ mt: 2, mb: 2, py: 1.5 }}
                >
                  {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
                </Button>
                
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2">
                    Already have an account?{' '}
                    <Link component={RouterLink} to="/login" variant="body2">
                      Sign In
                    </Link>
                  </Typography>
                </Box>
              </form>
            )}
          </CardContent>
        </Card>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} Akwa Ibom State Ministry of Health
          </Typography>
        </Box>
      </Box>
      
      <Snackbar 
        open={showAlert} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alertType} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alertType === 'success' ? success : error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Register;