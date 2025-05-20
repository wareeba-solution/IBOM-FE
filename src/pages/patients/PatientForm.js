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
import patientService, { createPatient, getPatientById, updatePatient } from '../../services/patientService';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import useAuth from '../../hooks/useAuth';

// Patient form validation schema
const patientValidationSchema = Yup.object({
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  gender: Yup.string()
    .required('Gender is required'),
  dateOfBirth: Yup.date()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future'),
  phoneNumber: Yup.string()
    .matches(/^[0-9+\s()-]{10,15}$/, 'Invalid phone number format')
    .nullable(),
  address: Yup.string()
    .required('Address is required'),
  city: Yup.string()
    .required('City is required'),
  state: Yup.string()
    .required('State is required'),
  lgaResidence: Yup.string()
    .required('Lga Residence is required'),
  lgaOrigin: Yup.string()
    .required('Lga Origin is required'),
  postalCode: Yup.string()
    .nullable(),
  email: Yup.string()
    .email('Invalid email format')
    .nullable(),
  bloodGroup: Yup.string()
    .nullable(),
  genotype: Yup.string()
    .nullable(),
  maritalStatus: Yup.string()
    .nullable(),
  occupation: Yup.string()
    .nullable(),
  emergencyContactRelationship: Yup.string()
    .nullable(),
  emergencyContactName: Yup.string()
    .nullable(),
 // emergencyContactAddress: Yup.string()
    //.nullable(),
  emergencyContactPhone: Yup.string()
    .matches(/^[0-9+\s()-]{10,15}$/, 'Invalid phone number format')
    .nullable(),
  registrationDate: Yup.date()
    .default(() => new Date())
});

// Patient form initial values
const initialPatientValues = {
  firstName: '',
  lastName: '',
  otherNames: '',
  gender: '',
  dateOfBirth: null,
  phoneNumber: '',
  address: '',
  lgaOrigin: '',
  lgaResidence: '',
  state: 'Akwa Ibom', // Default state
  postalCode: '',
  email: '',
  bloodGroup: '',
  genotype: '',
  maritalStatus: '',
  occupation: '',
 // emergencyContactName: '',
  //emergencyContactRelationship: '',
  //emergencyContactPhone: '',
  //emergencyContactAddress: '',
  registrationDate: new Date(),
  medicalNotes: '',
  facilityId: '',
  status: 'active'
};

// Patient Form component
const PatientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();
  const {facilities, roles} = useAuth();
  
  
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
      dateOfBirth: values.dateOfBirth ? format(new Date(values.dateOfBirth), 'yyyy-MM-dd') : null,
      registrationDate: format(new Date(values.registrationDate), 'yyyy-MM-dd')
    };

    try {
      if (isEditMode) {
        // Update existing patient
        await execute(
          /*patientService.updatePatient*/updatePatient,
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
          createPatient,
          [formattedValues],
          (response) => {
            setAlertMessage('Patient registered successfully');
            setAlertSeverity('success');
            setAlertOpen(true);
            
            // Navigate to the new patient's detail page
           /* setTimeout(() => {
              navigate(`/patients/${response.id}`);
            }, 1500);*/
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
          /*patientService.getPatientById*/ getPatientById,
          [id],
          (response) => {
            // Transform API response to form values format
            const patientData = {
              ...initialPatientValues,
              ...response,
              dateOfBirth: response.dateOfBirth ? new Date(response.dateOfBirth) : null,
              registrationDate: response.registrationDate ? new Date(response.registrationDate) : new Date()
            };
            
            setPatient(patientData);
            console.log('Patient data loaded:', patientData);
            
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
                id="firstName"
                name="firstName"
                label="First Name *"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="Last Name *"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="otherNames"
                name="otherNames"
                label="Other Names"
                value={formik.values.otherNames}
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
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
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
                  value={formik.values.dateOfBirth}
                  onChange={(date) => formik.setFieldValue('dateOfBirth', date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      name="dateOfBirth"
                      onBlur={formik.handleBlur}
                      error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                      helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
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
                  id="maritalStatus"
                  name="maritalStatus"
                  value={formik.values.maritalStatus}
                  onChange={formik.handleChange}
                  label="Marital Status"
                >
                  <MenuItem value="">
                    <em>Select Status</em>
                  </MenuItem>
                  <MenuItem value="single">Single</MenuItem>
                  <MenuItem value="married">Married</MenuItem>
                  <MenuItem value="divorced">Divorced</MenuItem>
                  <MenuItem value="widowed">Widowed</MenuItem>
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
                  value={formik.values.registrationDate}
                  onChange={(date) => formik.setFieldValue('registrationDate', date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      name="registrationDate"
                      onBlur={formik.handleBlur}
                      error={formik.touched.registrationDate && Boolean(formik.errors.registrationDate)}
                      helperText={formik.touched.registrationDate && formik.errors.registrationDate}
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
                id="phoneNumber"
                name="phoneNumber"
                label="Phone Number"
                value={formik.values.phoneNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
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
              <FormControl 
                fullWidth
                error={formik.touched.lgaOrigin && Boolean(formik.errors.lgaOrigin)}
              >
                <InputLabel id="state-label">LGA Origin *</InputLabel>
                <Select
                  labelId="state-label"
                  id="lgaOrigin"
                  name="lgaOrigin"
                  value={formik.values.lgaOrigin}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="LGA *"
                >
                  <MenuItem value="Okobo">Okobo</MenuItem>
                  <MenuItem value="Cross River">Cross River</MenuItem>
                  <MenuItem value="Rivers">Rivers</MenuItem>
                  <MenuItem value="Abia">Ukog</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {formik.touched.lgaOrigin && formik.errors.lgaOrigin && (
                  <FormHelperText>{formik.errors.lgaOrigin}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl 
                fullWidth
                error={formik.touched.lgaResidence && Boolean(formik.errors.lgaResidence)}
              >
                <InputLabel id="state-label">LGA Residence *</InputLabel>
                <Select
                  labelId="state-label"
                  id="lgaResidence"
                  name="lgaResidence"
                  value={formik.values.lgaResidence}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="LGA Residence *"
                >
                  <MenuItem value="Uyo">Uyo</MenuItem>
                  <MenuItem value="Cross River">Cross River</MenuItem>
                  <MenuItem value="Rivers">Rivers</MenuItem>
                  <MenuItem value="Abia">Ukog</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {formik.touched.lgaResidence && formik.errors.lgaResidence && (
                  <FormHelperText>{formik.errors.lgaResidence}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel id="facility-label">Facility</InputLabel>
              <Select
                labelId="facility-label"
                name="facilityId"
                value={formik.values.facilityId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Facility"
              >
                <MenuItem value="">All Facilities</MenuItem>
                {facilities.map((facility) => (
                  <MenuItem key={facility.id} value={facility.id}>
                    {facility.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.facilityId && formik.errors.facilityId && (
                <FormHelperText>{formik.errors.facilityId}</FormHelperText>
              )}
            </FormControl>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="postalCode"
                name="postalCode"
                label="Postal Code"
                value={formik.values.postalCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.postalCode && Boolean(formik.errors.postalCode)}
                helperText={formik.touched.postalCode && formik.errors.postalCode}
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
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formik.values.bloodGroup}
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
                id="medicalNotes"
                name="medicalNotes"
                label="Medical Notes"
                multiline
                rows={4}
                value={formik.values.medicalNotes}
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
                id="emergencyContactName"
                name="emergencyContactName"
                label="Next of Kin Name"
                value={formik.values.emergencyContactName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.emergencyContactName && Boolean(formik.errors.emergencyContactName)}
                helperText={formik.touched.emergencyContactName && formik.errors.emergencyContactName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="emergencyContactRelationship"
                name="emergencyContactRelationship"
                label="Relationship"
                value={formik.values.emergencyContactRelationship}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.emergencyContactRelationship && Boolean(formik.errors.emergencyContactRelationship)}
                helperText={formik.touched.emergencyContactRelationship && formik.errors.emergencyContactRelationship}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                label="Phone Number"
                value={formik.values.emergencyContactPhone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.emergencyContactPhone && Boolean(formik.errors.emergencyContactPhone)}
                helperText={formik.touched.emergencyContactPhone && formik.errors.emergencyContactPhone}
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
        formik.values.firstName &&
        formik.values.lastName &&
        formik.values.gender &&
        formik.values.dateOfBirth &&
        !formik.errors.firstName &&
        !formik.errors.lastName &&
        !formik.errors.gender &&
        !formik.errors.dateOfBirth
      );
    } else if (step === 1) {
      return (
        formik.values.address &&
        formik.values.city &&
        formik.values.state &&
        !formik.errors.address &&
        !formik.errors.city &&
        !formik.errors.state &&
        !formik.errors.phoneNumber &&
        !formik.errors.email
      );
    }
    
    return true;
  };

  // Determine if the form can be submitted
  const canSubmit = () => {
    return (
      formik.values.firstName &&
      formik.values.lastName &&
      formik.values.gender &&
      formik.values.dateOfBirth &&
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