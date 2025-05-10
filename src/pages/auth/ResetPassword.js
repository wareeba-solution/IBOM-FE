// src/pages/auth/ResetPassword.js
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { 
  Container, 
  Box,
  Card, 
  CardContent,
  Typography, 
  TextField, 
  Button, 
  Link,
  InputAdornment, 
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  LockReset as LockResetIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';

// Reset Password page component
const ResetPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { token } = useParams();
  const { resetPassword } = useAuth();
  
  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      // Attempt to reset password
      const result = await resetPassword({
        token: token,
        password: values.password,
        password_confirmation: values.confirmPassword
      });
      
      if (result.success) {
        setSuccess('Your password has been reset successfully.');
        setAlertType('success');
        setShowAlert(true);
        
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.error || 'Failed to reset password. Please try again.');
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
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: handleSubmit
  });
  
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
              Create New Password
            </Typography>
            
            <Typography variant="body2" color="text.secondary" align="center" gutterBottom sx={{ mb: 3 }}>
              Enter your new password below
            </Typography>
            
            <form onSubmit={formik.handleSubmit}>
              <TextField
                margin="normal"
                fullWidth
                id="password"
                name="password"
                label="New Password"
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
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm New Password"
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
                sx={{ mb: 3 }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <LockResetIcon />}
                sx={{ mt: 2, mb: 2, py: 1.5 }}
              >
                {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
              </Button>
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2">
                  Remember your password?{' '}
                  <Link component={RouterLink} to="/login" variant="body2">
                    Sign In
                  </Link>
                </Typography>
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

export default ResetPassword;