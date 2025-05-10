// src/pages/patients/PatientForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Camera as CameraIcon,
  FileUpload as FileUploadIcon,
  Add as AddIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/patientService';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';

// Patient form validation schema
const patientValidationSchema = Yup.object({
  first_name: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  last_name: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  gender: Yup.string()
    .required('Gender is required'),
  date_of_birth: Yup.date()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future'),
  phone_number: Yup.string()
    .matches(/^[0-9+\s()-]{10,15}$/, 'Invalid phone number format')
    .nullable(),
  address: Yup.string()
    .required('Address is required'),
  city: Yup.string()
    .required('City is required'),
  state: Yup.string()
    .required('State is required'),
  postal_code: Yup.string()
    .nullable(),
  email: Yup.string()
    .email('Invalid email format')
    .nullable(),
  blood_group: Yup.string()
    .nullable(),
  genotype: Yup.string()
    .nullable(),
  marital_status: Yup.string()
    .nullable(),
  occupation: Yup.string()
    .nullable(),
  next_of_kin_name: Yup.string()
    .nullable(),
  next_of_kin_relationship: Yup.string()
    .nullable(),
  next_of_kin_phone: Yup.string()
    .matches(/^[0-9+\s()-]{10,15}$/, 'Invalid phone number format')
    .nullable(),
  registration_date: Yup.date()
    .default(() => new Date())
});

// Patient form initial values
const initialPatientValues = {
  first_name: '',
  last_name: '',
  other_names: '',
  gender: '',
  date_of_birth: null,
  phone_number: '',
  address: '',
  city: '',
  state: 'Akwa Ibom', // Default state
  postal_code: '',
  email: '',
  blood_group: '',
  genotype: '',
  marital_status: '',
  occupation: '',
  next_of_kin_name: '',
  next_of_kin_relationship: '',
  next_of_kin_phone: '',
  registration_date: new Date(),
  notes: '',
  status: 'active'
};

// Patient Form component
const PatientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();
  
  // State
  const [patient, setPatient] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Steps for the form
  const steps = ['Personal Information', 'Contact Details', 'Medical Information', 'Emergency Contact'];

  // Handle form submission
  const handleSubmit = async (values) => {
    // Format date values
    const formattedValues = {
      ...values,
      date_of_birth: values.date_of_birth ? format(new Date(values.date_of_birth), 'yyyy-MM-dd') : null,
      registration_date: format(new Date(values.registration_date), 'yyyy-MM-dd')
    };

    try {
      if (isEditMode) {
        // Update existing patient
        await execute(
          patientService.updatePatient,
          [id, formattedValues],
          (response) => {
            setAlertMessage('Patient updated successfully');
            setAlertSeverity('success');
            setAlertOpen(true);
            
            // Navigate back to patient detail after a short delay
            setTimeout(() => {
              navigate(`/patients/${id}`);
            }, 1500);
          }
        );
      } else {
        // Create new patient
        await execute(
          patientService.createPatient,
          [formattedValues],
          (response) => {
            setAlertMessage('Patient registered successfully');
            setAlertSeverity('success');
            setAlertOpen(true);
            
            // Navigate to the new patient's detail page
            setTimeout(() => {
              navigate(`/patients/${response.id}`);
            }, 1500);
          }
        );
      }
    } catch (err) {
      setAlertMessage('Failed to save patient information');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  // Initialize formik
  const formik = useFormik({
    initialValues: initialPatientValues,
    validationSchema: patientValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true
  });

  // Load patient data if in edit mode
  useEffect(() => {
    const loadPatient = async () => {
      if (id && id !== 'new') {
        setIsEditMode(true);
        
        await execute(
          patientService.getPatientById,
          [id],
          (response) => {
            // Transform API response to form values format
            const patientData = {
              ...initialPatientValues,
              ...response,
              date_of_birth: response.date_of_birth ? new Date(response.date_of_birth) : null,
              registration_date: response.registration_date ? new Date(response.registration_date) : new Date()
            };
            
            setPatient(patientData);
            
            // Set formik values
            Object.keys(patientData).forEach(key => {
              formik.setFieldValue(key, patientData[key], false);
            });
          }
        );
      }
    };
    
    loadPatient();
  }, [id]);

  // Handle form cancellation
  const handleCancel = () => {
    // If form is dirty, show confirmation dialog
    if (formik.dirty) {
      setCancelDialogOpen(true);
    } else {
      navigateBack();
    }
  };

  // Navigate back to the previous page
  const navigateBack = () => {
    if (isEditMode) {
      navigate(`/patients/${id}`);
    } else {
      navigate('/patients');
    }
  };

  // Handle alert close
  const handleAlertClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertOpen(false);
  };

  // Handle form step navigation
  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  // Render current step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="first_name"
                name="first_name"
                label="First Name *"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                helperText={formik.touched.first_name && formik.errors.first_name}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="last_name"
                name="last_name"
                label="Last Name *"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                helperText={formik.touched.last_name && formik.errors.last_name}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="other_names"
                name="other_names"
                label="Other Names"
                value={formik.values.other_names}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                error={formik.touched.gender && Boolean(formik.errors.gender)}
              >
                <InputLabel id="gender-label">Gender *</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Gender *"
                >
                  <MenuItem value="">
                    <em>Select Gender</em>
                  </MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
                {formik.touched.gender && formik.errors.gender && (
                  <FormHelperText>{formik.errors.gender}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Birth *"
                  value={formik.values.date_of_birth}
                  onChange={(date) => formik.setFieldValue('date_of_birth', date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      name="date_of_birth"
                      onBlur={formik.handleBlur}
                      error={formik.touched.date_of_birth && Boolean(formik.errors.date_of_birth)}
                      helperText={formik.touched.date_of_birth && formik.errors.date_of_birth}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <DateRangeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="marital-status-label">Marital Status</InputLabel>
                <Select
                  labelId="marital-status-label"
                  id="marital_status"
                  name="marital_status"
                  value={formik.values.marital_status}
                  onChange={formik.handleChange}
                  label="Marital Status"
                >
                  <MenuItem value="">
                    <em>Select Status</em>
                  </MenuItem>
                  <MenuItem value="Single">Single</MenuItem>
                  <MenuItem value="Married">Married</MenuItem>
                  <MenuItem value="Divorced">Divorced</MenuItem>
                  <MenuItem value="Widowed">Widowed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="occupation"
                name="occupation"
                label="Occupation"
                value={formik.values.occupation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Registration Date *"
                  value={formik.values.registration_date}
                  onChange={(date) => formik.setFieldValue('registration_date', date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      name="registration_date"
                      onBlur={formik.handleBlur}
                      error={formik.touched.registration_date && Boolean(formik.errors.registration_date)}
                      helperText={formik.touched.registration_date && formik.errors.registration_date}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <DateRangeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="phone_number"
                name="phone_number"
                label="Phone Number"
                value={formik.values.phone_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
                helperText={formik.touched.phone_number && formik.errors.phone_number}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="address"
                name="address"
                label="Address *"
                multiline
                rows={2}
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="city"
                name="city"
                label="City/Town *"
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.city && Boolean(formik.errors.city)}
                helperText={formik.touched.city && formik.errors.city}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl 
                fullWidth
                error={formik.touched.state && Boolean(formik.errors.state)}
              >
                <InputLabel id="state-label">State *</InputLabel>
                <Select
                  labelId="state-label"
                  id="state"
                  name="state"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="State *"
                >
                  <MenuItem value="Akwa Ibom">Akwa Ibom</MenuItem>
                  <MenuItem value="Cross River">Cross River</MenuItem>
                  <MenuItem value="Rivers">Rivers</MenuItem>
                  <MenuItem value="Abia">Abia</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {formik.touched.state && formik.errors.state && (
                  <FormHelperText>{formik.errors.state}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="postal_code"
                name="postal_code"
                label="Postal Code"
                value={formik.values.postal_code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.postal_code && Boolean(formik.errors.postal_code)}
                helperText={formik.touched.postal_code && formik.errors.postal_code}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="blood-group-label">Blood Group</InputLabel>
                <Select
                  labelId="blood-group-label"
                  id="blood_group"
                  name="blood_group"
                  value={formik.values.blood_group}
                  onChange={formik.handleChange}
                  label="Blood Group"
                >
                  <MenuItem value="">
                    <em>Select Blood Group</em>
                  </MenuItem>
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="genotype-label">Genotype</InputLabel>
                <Select
                  labelId="genotype-label"
                  id="genotype"
                  name="genotype"
                  value={formik.values.genotype}
                  onChange={formik.handleChange}
                  label="Genotype"
                >
                  <MenuItem value="">
                    <em>Select Genotype</em>
                  </MenuItem>
                  <MenuItem value="AA">AA</MenuItem>
                  <MenuItem value="AS">AS</MenuItem>
                  <MenuItem value="SS">SS</MenuItem>
                  <MenuItem value="AC">AC</MenuItem>
                  <MenuItem value="SC">SC</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Medical Notes"
                multiline
                rows={4}
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter any relevant medical history, allergies, or chronic conditions"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl 
                fullWidth
                error={formik.touched.status && Boolean(formik.errors.status)}
              >
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="next_of_kin_name"
                name="next_of_kin_name"
                label="Next of Kin Name"
                value={formik.values.next_of_kin_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.next_of_kin_name && Boolean(formik.errors.next_of_kin_name)}
                helperText={formik.touched.next_of_kin_name && formik.errors.next_of_kin_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="next_of_kin_relationship"
                name="next_of_kin_relationship"
                label="Relationship"
                value={formik.values.next_of_kin_relationship}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.next_of_kin_relationship && Boolean(formik.errors.next_of_kin_relationship)}
                helperText={formik.touched.next_of_kin_relationship && formik.errors.next_of_kin_relationship}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="next_of_kin_phone"
                name="next_of_kin_phone"
                label="Phone Number"
                value={formik.values.next_of_kin_phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.next_of_kin_phone && Boolean(formik.errors.next_of_kin_phone)}
                helperText={formik.touched.next_of_kin_phone && formik.errors.next_of_kin_phone}
              />
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  // Check if a specific step is complete
  const isStepComplete = (step) => {
    if (step === 0) {
      return (
        formik.values.first_name &&
        formik.values.last_name &&
        formik.values.gender &&
        formik.values.date_of_birth &&
        !formik.errors.first_name &&
        !formik.errors.last_name &&
        !formik.errors.gender &&
        !formik.errors.date_of_birth
      );
    } else if (step === 1) {
      return (
        formik.values.address &&
        formik.values.city &&
        formik.values.state &&
        !formik.errors.address &&
        !formik.errors.city &&
        !formik.errors.state &&
        !formik.errors.phone_number &&
        !formik.errors.email
      );
    }
    
    return true;
  };

  // Determine if the form can be submitted
  const canSubmit = () => {
    return (
      formik.values.first_name &&
      formik.values.last_name &&
      formik.values.gender &&
      formik.values.date_of_birth &&
      formik.values.address &&
      formik.values.city &&
      formik.values.state &&
      Object.keys(formik.errors).length === 0
    );
  };

  return (
    <MainLayout 
      title={isEditMode ? "Edit Patient" : "Register New Patient"}
      breadcrumbs={[
        { name: 'Patients', path: '/patients' },
        { name: isEditMode ? 'Edit Patient' : 'Register New Patient', active: true }
      ]}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            color="inherit"
            onClick={handleCancel}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            {isEditMode ? 'Edit Patient Information' : 'Register New Patient'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label, index) => (
                <Step key={label} completed={isStepComplete(index)}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mb: 3 }}>
              {renderStepContent(activeStep)}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
              >
                Back
              </Button>
              <Box>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancel}
                  startIcon={<CancelIcon />}
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    disabled={!isStepComplete(activeStep)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={!canSubmit()}
                  >
                    {isEditMode ? 'Update Patient' : 'Register Patient'}
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        )}
      </Paper>

      {/* Cancellation Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes. Are you sure you want to discard these changes?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No, Continue Editing</Button>
          <Button onClick={navigateBack} color="error" autoFocus>
            Yes, Discard Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alertSeverity}
          sx={{ width: '100%' }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleAlertClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default PatientForm;