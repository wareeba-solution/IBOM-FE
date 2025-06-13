// src/pages/deaths/DeathForm.js
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
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, differenceInYears } from 'date-fns';
import deathService from '../../services/deathService'; // Import real service

// UUID validation helper
const isValidUUID = (str) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// Form validation schema
const deathValidationSchema = Yup.object({
  // Deceased information
  deceased_name: Yup.string()
    .required('Deceased name is required'),
  gender: Yup.string()
    .required('Gender is required'),
  date_of_birth: Yup.date()
    .max(new Date(), 'Date of birth cannot be in the future'),
  date_of_death: Yup.date()
    .required('Date of death is required')
    .max(new Date(), 'Date of death cannot be in the future'),
  
  // Death details
  place_of_death: Yup.string()
    .required('Place of death is required'),
  cause_of_death: Yup.string()
    .required('Cause of death is required'),
  manner_of_death: Yup.string()
    .required('Manner of death is required'),
  
  // Informant information
  informant_name: Yup.string()
    .required('Informant name is required'),
  informant_relationship: Yup.string()
    .required('Relationship to deceased is required'),
  
  // Registration information
  city: Yup.string()
    .required('City is required'),
  state: Yup.string()
    .required('State is required'),
  registration_date: Yup.date()
    .required('Registration date is required')
});

// Initial values
const initialDeathValues = {
  // Deceased information
  deceased_name: '',
  gender: '',
  date_of_birth: null,
  date_of_death: new Date(),
  age_at_death: '',
  
  // Death details
  place_of_death: '',
  hospital_name: '',
  cause_of_death: '',
  secondary_causes: '',
  manner_of_death: '',
  
  // Informant information
  informant_name: '',
  informant_relationship: '',
  informant_phone: '',
  informant_address: '',
  
  // Medical certification
  doctor_name: '',
  doctor_id: '',
  
  // Registration information
  city: '',
  state: 'Akwa Ibom',
  registration_date: new Date(),
  status: 'registered',
  notes: ''
};

// Death Form Component
const DeathForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();
  
  // State
  const [death, setDeath] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Steps for the form
  const steps = ['Deceased Information', 'Death Details', 'Informant Information', 'Registration'];

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      // Map form values to API payload according to Swagger docs
      const payload = {
        deceased_name: values.deceased_name,
        gender: values.gender,
        date_of_birth: values.date_of_birth ? format(new Date(values.date_of_birth), 'yyyy-MM-dd') : undefined,
        date_of_death: format(new Date(values.date_of_death), 'yyyy-MM-dd'),
        age_at_death: values.age_at_death ? Number(values.age_at_death) : undefined,
        place_of_death: values.place_of_death,
        hospital_name: values.hospital_name || undefined,
        cause_of_death: values.cause_of_death,
        manner_of_death: values.manner_of_death,
        informant_name: values.informant_name,
        informant_relationship: values.informant_relationship,
        informant_phone: values.informant_phone || undefined,
        city: values.city,
        state: values.state,
        registration_date: format(new Date(values.registration_date), 'yyyy-MM-dd'),
        status: values.status,
        // Additional fields that might be needed
        secondary_causes: values.secondary_causes || undefined,
        doctor_name: values.doctor_name || undefined,
        doctor_id: values.doctor_id || undefined,
        informant_address: values.informant_address || undefined,
        notes: values.notes || undefined,
      };

      // Remove undefined fields
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

      if (isEditMode) {
        // Update existing death record
        await execute(
          deathService.updateDeath,
          [id, payload],
          (response) => {
            setAlertMessage('Death record updated successfully');
            setAlertSeverity('success');
            setAlertOpen(true);

            setTimeout(() => {
              navigate(`/deaths/${id}`);
            }, 1500);
          }
        );
      } else {
        // Create new death record
        await execute(
          deathService.createDeath,
          [payload],
          (response) => {
            setAlertMessage('Death record registered successfully');
            setAlertSeverity('success');
            setAlertOpen(true);

            setTimeout(() => {
              navigate(`/deaths/${response.id || response.data?.id}`);
            }, 1500);
          }
        );
      }
    } catch (err) {
      setAlertMessage(`Failed to ${isEditMode ? 'update' : 'save'} death record information`);
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  // Initialize formik
  const formik = useFormik({
    initialValues: initialDeathValues,
    validationSchema: deathValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true
  });

  // Calculate age when date of birth or date of death changes
  useEffect(() => {
    if (formik.values.date_of_birth && formik.values.date_of_death) {
      const age = differenceInYears(
        new Date(formik.values.date_of_death),
        new Date(formik.values.date_of_birth)
      );
      formik.setFieldValue('age_at_death', age, false);
    }
  }, [formik.values.date_of_birth, formik.values.date_of_death]);

  // Load death data if in edit mode
  useEffect(() => {
    const loadDeath = async () => {
      if (id && id !== 'new' && isValidUUID(id)) {
        setIsEditMode(true);
        
        await execute(
          deathService.getDeathById,
          [id],
          (response) => {
            const deathData = response.data || response;
            
            // Map API response fields to form field names
            const mappedData = {
              deceased_name: deathData.deceased_name || '',
              gender: deathData.gender || '',
              date_of_birth: deathData.date_of_birth ? new Date(deathData.date_of_birth) : null,
              date_of_death: deathData.date_of_death ? new Date(deathData.date_of_death) : new Date(),
              age_at_death: deathData.age_at_death || '',
              place_of_death: deathData.place_of_death || '',
              hospital_name: deathData.hospital_name || '',
              cause_of_death: deathData.cause_of_death || '',
              secondary_causes: deathData.secondary_causes || '',
              manner_of_death: deathData.manner_of_death || '',
              informant_name: deathData.informant_name || '',
              informant_relationship: deathData.informant_relationship || '',
              informant_phone: deathData.informant_phone || '',
              informant_address: deathData.informant_address || '',
              doctor_name: deathData.doctor_name || '',
              doctor_id: deathData.doctor_id || '',
              city: deathData.city || '',
              state: deathData.state || 'Akwa Ibom',
              registration_date: deathData.registration_date ? new Date(deathData.registration_date) : new Date(),
              status: deathData.status || 'registered',
              notes: deathData.notes || '',
            };
            
            setDeath(deathData);
            
            // Set formik values to prefill the form
            formik.setValues(mappedData);
          }
        );
      } else if (id && id !== 'new' && !isValidUUID(id)) {
        // Handle case where ID is not a valid UUID
        console.error('Invalid death ID format');
        navigate('/deaths');
      }
    };
    
    loadDeath();
  }, [id, execute, navigate]);

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
      navigate(`/deaths/${id}`);
    } else {
      navigate('/deaths');
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
      case 0: // Deceased Information
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Deceased Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="deceased_name"
                name="deceased_name"
                label="Deceased Name *"
                value={formik.values.deceased_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.deceased_name && Boolean(formik.errors.deceased_name)}
                helperText={formik.touched.deceased_name && formik.errors.deceased_name}
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
                  label="Date of Birth"
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
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Death *"
                  value={formik.values.date_of_death}
                  onChange={(date) => formik.setFieldValue('date_of_death', date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      name="date_of_death"
                      onBlur={formik.handleBlur}
                      error={formik.touched.date_of_death && Boolean(formik.errors.date_of_death)}
                      helperText={formik.touched.date_of_death && formik.errors.date_of_death}
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
              <TextField
                fullWidth
                id="age_at_death"
                name="age_at_death"
                label="Age at Death"
                type="number"
                InputProps={{
                  inputProps: { min: 0 }
                }}
                value={formik.values.age_at_death}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.values.date_of_birth && formik.values.date_of_death}
                helperText={formik.values.date_of_birth && formik.values.date_of_death ? "Calculated from dates" : ""}
              />
            </Grid>
          </Grid>
        );
      
      case 1: // Death Details
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Death Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                error={formik.touched.place_of_death && Boolean(formik.errors.place_of_death)}
              >
                <InputLabel id="place-of-death-label">Place of Death *</InputLabel>
                <Select
                  labelId="place-of-death-label"
                  id="place_of_death"
                  name="place_of_death"
                  value={formik.values.place_of_death}
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (e.target.value !== 'Hospital') {
                      formik.setFieldValue('hospital_name', '');
                    }
                  }}
                  onBlur={formik.handleBlur}
                  label="Place of Death *"
                >
                  <MenuItem value="">
                    <em>Select Place</em>
                  </MenuItem>
                  <MenuItem value="Hospital">Hospital</MenuItem>
                  <MenuItem value="Home">Home</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {formik.touched.place_of_death && formik.errors.place_of_death && (
                  <FormHelperText>{formik.errors.place_of_death}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {formik.values.place_of_death === 'Hospital' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="hospital_name"
                  name="hospital_name"
                  label="Hospital Name"
                  value={formik.values.hospital_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </Grid>
            )}
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                error={formik.touched.cause_of_death && Boolean(formik.errors.cause_of_death)}
              >
                <InputLabel id="cause-of-death-label">Primary Cause of Death *</InputLabel>
                <Select
                  labelId="cause-of-death-label"
                  id="cause_of_death"
                  name="cause_of_death"
                  value={formik.values.cause_of_death}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Primary Cause of Death *"
                >
                  <MenuItem value="">
                    <em>Select Cause</em>
                  </MenuItem>
                  <MenuItem value="Natural Causes">Natural Causes</MenuItem>
                  <MenuItem value="Heart Disease">Heart Disease</MenuItem>
                  <MenuItem value="Cancer">Cancer</MenuItem>
                  <MenuItem value="Respiratory Disease">Respiratory Disease</MenuItem>
                  <MenuItem value="Stroke">Stroke</MenuItem>
                  <MenuItem value="Accident">Accident</MenuItem>
                  <MenuItem value="Infection">Infection</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {formik.touched.cause_of_death && formik.errors.cause_of_death && (
                  <FormHelperText>{formik.errors.cause_of_death}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="secondary_causes"
                name="secondary_causes"
                label="Secondary Causes (if any)"
                value={formik.values.secondary_causes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                error={formik.touched.manner_of_death && Boolean(formik.errors.manner_of_death)}
              >
                <InputLabel id="manner-of-death-label">Manner of Death *</InputLabel>
                <Select
                  labelId="manner-of-death-label"
                  id="manner_of_death"
                  name="manner_of_death"
                  value={formik.values.manner_of_death}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Manner of Death *"
                >
                  <MenuItem value="">
                    <em>Select Manner</em>
                  </MenuItem>
                  <MenuItem value="Natural">Natural</MenuItem>
                  <MenuItem value="Accident">Accident</MenuItem>
                  <MenuItem value="Suicide">Suicide</MenuItem>
                  <MenuItem value="Homicide">Homicide</MenuItem>
                  <MenuItem value="Undetermined">Undetermined</MenuItem>
                </Select>
                {formik.touched.manner_of_death && formik.errors.manner_of_death && (
                  <FormHelperText>{formik.errors.manner_of_death}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Medical Certification (if applicable)
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="doctor_name"
                name="doctor_name"
                label="Certifying Doctor's Name"
                value={formik.values.doctor_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="doctor_id"
                name="doctor_id"
                label="Doctor's ID/License Number"
                value={formik.values.doctor_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
          </Grid>
        );
      
      case 2: // Informant Information
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Informant Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="informant_name"
                name="informant_name"
                label="Informant's Name *"
                value={formik.values.informant_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.informant_name && Boolean(formik.errors.informant_name)}
                helperText={formik.touched.informant_name && formik.errors.informant_name}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                error={formik.touched.informant_relationship && Boolean(formik.errors.informant_relationship)}
              >
                <InputLabel id="informant-relationship-label">Relationship to Deceased *</InputLabel>
                <Select
                  labelId="informant-relationship-label"
                  id="informant_relationship"
                  name="informant_relationship"
                  value={formik.values.informant_relationship}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Relationship to Deceased *"
                >
                  <MenuItem value="">
                    <em>Select Relationship</em>
                  </MenuItem>
                  <MenuItem value="Spouse">Spouse</MenuItem>
                  <MenuItem value="Son">Son</MenuItem>
                  <MenuItem value="Daughter">Daughter</MenuItem>
                  <MenuItem value="Parent">Parent</MenuItem>
                  <MenuItem value="Sibling">Sibling</MenuItem>
                  <MenuItem value="Other Family">Other Family</MenuItem>
                  <MenuItem value="Friend">Friend</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {formik.touched.informant_relationship && formik.errors.informant_relationship && (
                  <FormHelperText>{formik.errors.informant_relationship}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="informant_phone"
                name="informant_phone"
                label="Phone Number"
                value={formik.values.informant_phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="informant_address"
                name="informant_address"
                label="Address"
                multiline
                rows={2}
                value={formik.values.informant_address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
          </Grid>
        );
      
      case 3: // Registration
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Registration Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
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
            
            <Grid item xs={12} sm={6}>
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
            
            <Grid item xs={12} sm={6}>
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
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Additional Notes"
                multiline
                rows={3}
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                Please verify all information before submission. Once submitted, a death certificate can be printed from the death record details page.
              </Alert>
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
        formik.values.deceased_name &&
        formik.values.gender &&
        formik.values.date_of_death &&
        !formik.errors.deceased_name &&
        !formik.errors.gender &&
        !formik.errors.date_of_death
      );
    } else if (step === 1) {
      return (
        formik.values.place_of_death &&
        formik.values.cause_of_death &&
        formik.values.manner_of_death &&
        !formik.errors.place_of_death &&
        !formik.errors.cause_of_death &&
        !formik.errors.manner_of_death
      );
    } else if (step === 2) {
      return (
        formik.values.informant_name &&
        formik.values.informant_relationship &&
        !formik.errors.informant_name &&
        !formik.errors.informant_relationship
      );
    }
    
    // In step 3, check registration information
    return (
      formik.values.city &&
      formik.values.state &&
      formik.values.registration_date &&
      formik.values.status &&
      !formik.errors.city &&
      !formik.errors.state &&
      !formik.errors.registration_date &&
      !formik.errors.status
    );
  };

  // Determine if the form can be submitted
  const canSubmit = () => {
    return (
      formik.values.deceased_name &&
      formik.values.gender &&
      formik.values.date_of_death &&
      formik.values.place_of_death &&
      formik.values.cause_of_death &&
      formik.values.manner_of_death &&
      formik.values.informant_name &&
      formik.values.informant_relationship &&
      formik.values.city &&
      formik.values.state &&
      formik.values.registration_date &&
      formik.values.status &&
      Object.keys(formik.errors).length === 0
    );
  };

  return (
    <MainLayout 
      title={isEditMode ? "Edit Death Record" : "Register New Death"}
      breadcrumbs={[
        { name: 'Deaths', path: '/deaths' },
        { name: isEditMode ? 'Edit Death Record' : 'Register New Death', active: true }
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
            {isEditMode ? 'Edit Death Record' : 'Register New Death'}
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
                    {isEditMode ? 'Update Record' : 'Register Death'}
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

export default DeathForm;