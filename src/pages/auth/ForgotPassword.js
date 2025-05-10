// src/pages/auth/ForgotPassword.js
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Box,
  Card, 
  CardContent,
  Typography, 
  TextField, 
  Button, 
  Link,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material';
import { 
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';

// Forgot Password page component
const ForgotPassword = () => {
  const theme = useTheme();
  const { requestPasswordReset } = useAuth();
  
  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('error');
  
  // Handle form submission
  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Attempt to request password reset
      const result = await requestPasswordReset(values.email);
      
      if (result.success) {
        setSuccess('Password reset instructions have been sent to your email address.');
        setAlertType('success');
        setShowAlert(true);
        formik.resetForm();
      } else {
        setError(result.error || 'Failed to send reset instructions. Please try again.');
        setAlertType('error');
        setShowAlert(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setAlertType('error');
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Form validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
  });
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema,
    onSubmit: handleSubmit
  });
  
  // Close alert
  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
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
              Reset Password
            </Typography>
            
            <Typography variant="body2" color="text.secondary" align="center" gutterBottom sx={{ mb: 3 }}>
              Enter your email address and we'll send you instructions to reset your password
            </Typography>
            
            <form onSubmit={formik.handleSubmit}>
              <TextField
                margin="normal"
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                autoComplete="email"
                autoFocus
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{ mb: 3 }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <EmailIcon />}
                sx={{ mt: 2, mb: 2, py: 1.5 }}
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
              </Button>
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  startIcon={<ArrowBackIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Back to Sign In
                </Button>
              </Box>
            </form>
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

export default ForgotPassword;