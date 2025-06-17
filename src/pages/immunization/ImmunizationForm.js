// src/pages/immunization/ImmunizationForm.js
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
  StepLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  Autocomplete,
  CardContent,
  Card
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  DateRange as DateRangeIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Card as CardIcon,
  CardContent as CardContentIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, differenceInMonths, addMonths, parseISO, isValid } from 'date-fns';
import immunizationService from '../../services/immunizationService';
import patientService from '../../services/patientService';

// Vaccine types
const vaccineTypes = [
  'BCG',
  'Hepatitis B',
  'OPV',
  'Pentavalent',
  'Pneumococcal',
  'Rotavirus',
  'Measles',
  'Yellow Fever',
  'Meningitis',
  'Tetanus Toxoid',
  'HPV',
  'COVID-19',
  'Other'
];

// Helper function to safely parse dates
const safeParseDate = (dateValue) => {
  if (!dateValue) return null;
  
  try {
    // Handle different date formats
    let date;
    if (typeof dateValue === 'string') {
      date = parseISO(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return null;
    }
    
    // Check if the date is valid
    return isValid(date) ? date : null;
  } catch (error) {
    console.warn('Invalid date value:', dateValue, error);
    return null;
  }
};

// Helper function to safely format dates for API
const safeDateFormat = (dateValue, fallback = null) => {
  if (!dateValue) return fallback;
  
  try {
    const date = safeParseDate(dateValue);
    return date ? format(date, 'yyyy-MM-dd') : fallback;
  } catch (error) {
    console.warn('Error formatting date:', dateValue, error);
    return fallback;
  }
};

// Vaccine schedule information
const getVaccineScheduleInfo = (vaccineType, doseNumber) => {
  const scheduleIntervals = {
    'BCG': 0,
    'Hepatitis B': 2,
    'OPV': 2,
    'Pentavalent': 2,
    'Pneumococcal': 2,
    'Rotavirus': 2,
    'Measles': 6,
    'Yellow Fever': 0,
    'Meningitis': 0,
    'Tetanus Toxoid': 1,
    'HPV': 6,
    'COVID-19': 1,
    'Other': 1
  };
  
  const maxDoses = {
    'BCG': 1,
    'Hepatitis B': 3,
    'OPV': 4,
    'Pentavalent': 3,
    'Pneumococcal': 3,
    'Rotavirus': 2,
    'Measles': 2,
    'Yellow Fever': 1,
    'Meningitis': 1,
    'Tetanus Toxoid': 5,
    'HPV': 2,
    'COVID-19': 2,
    'Other': 3
  };
  
  const interval = scheduleIntervals[vaccineType] || 1;
  const isLastDose = doseNumber >= (maxDoses[vaccineType] || 1);
  
  return {
    interval: interval,
    isLastDose: isLastDose,
    maxDoses: maxDoses[vaccineType] || 1
  };
};

// Form validation schema
const immunizationValidationSchema = Yup.object({
  // Patient information
  patient_id: Yup.string().required('Patient ID is required'),
  patient_name: Yup.string().required('Patient name is required'),
  date_of_birth: Yup.date().required('Date of birth is required').max(new Date(), 'Date of birth cannot be in the future'),
  gender: Yup.string().required('Gender is required'),
  
  // Vaccination details
  vaccine_type: Yup.string().required('Vaccine type is required'),
  vaccine_name: Yup.string().required('Vaccine name is required'),
  dose_number: Yup.number().required('Dose number is required').positive('Dose number must be positive').integer('Dose number must be an integer'),
  lot_number: Yup.string().required('Batch/Lot number is required'),
  vaccination_date: Yup.date().required('Vaccination date is required').max(new Date(), 'Vaccination date cannot be in the future'),
  
  // Administration details
  site_of_administration: Yup.string().required('Site of administration is required'),
  route_of_administration: Yup.string().required('Route of administration is required'),
  healthcare_provider: Yup.string().required('Healthcare provider is required'),
  facility_id: Yup.string().required('Facility is required'),
  
  // Optional fields
  weight_kg: Yup.number().positive('Weight must be positive').nullable(),
  height_cm: Yup.number().positive('Height must be positive').nullable(),
  side_effects: Yup.string().nullable(),
  notes: Yup.string().nullable(),
  status: Yup.string().required('Status is required')
});

// Initial values
const initialImmunizationValues = {
  // Patient information
  patient_id: '',
  patient_name: '',
  date_of_birth: null,
  gender: '',
  age_months: '',
  
  // Vaccination details
  vaccine_type: '',
  vaccine_name: '',
  dose_number: 1,
  lot_number: '',
  vaccination_date: new Date(),
  next_due_date: null,
  expiry_date: null,
  
  // Administration details
  site_of_administration: '',
  route_of_administration: '',
  dosage: '',
  healthcare_provider: '',
  provider_id: '',
  facility_id: '',
  
  // Other details
  weight_kg: '',
  height_cm: '',
  side_effects: '',
  notes: '',
  status: 'Administered'
};

// Immunization Form Component
const ImmunizationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();
  
  // State
  const [immunization, setImmunization] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [vaccineScheduleInfo, setVaccineScheduleInfo] = useState(null);
  const [facilities, setFacilities] = useState([]); // Initialize as empty array

  // Steps for the form
  const steps = ['Patient Information', 'Vaccination Details', 'Administration Details', 'Additional Information'];

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      // Format the data for API submission
      const apiData = {
        patientId: values.patient_id,
        facilityId: values.facility_id || 'a67c1c4d-ce75-4713-a87c-ab3d7a2444f0', // Default facility
        vaccineType: values.vaccine_type,
        vaccineName: values.vaccine_name || values.vaccine_type,
        doseNumber: parseInt(values.dose_number) || 1,
        batchNumber: values.lot_number,
        administrationDate: safeDateFormat(values.vaccination_date),
        expiryDate: safeDateFormat(values.expiry_date),
        administeredBy: values.healthcare_provider,
        administrationSite: values.site_of_administration,
        administrationRoute: values.route_of_administration,
        dosage: values.dosage || '0.5 mL',
        sideEffects: values.side_effects || null,
        nextDoseDate: safeDateFormat(values.next_due_date),
        status: values.status,
        notes: values.notes || null,
        providerId: values.provider_id || null,
        weightKg: values.weight_kg ? parseFloat(values.weight_kg) : null,
        heightCm: values.height_cm ? parseFloat(values.height_cm) : null,
        ageMonths: values.age_months ? parseInt(values.age_months) : null
      };

      if (isEditMode && id) {
        // Update existing immunization record
        await execute(
          immunizationService.updateImmunization,
          [id, apiData],
          (response) => {
            setAlertMessage('Immunization record updated successfully');
            setAlertSeverity('success');
            setAlertOpen(true);
            
            setTimeout(() => {
              navigate(`/immunization/${id}`);
            }, 1500);
          }
        );
      } else {
        // Create new immunization record
        await execute(
          immunizationService.createImmunization,
          [apiData],
          (response) => {
            setAlertMessage('Immunization record created successfully');
            setAlertSeverity('success');
            setAlertOpen(true);
            
            setTimeout(() => {
              navigate(`/immunization/${response.id || response.data?.id}`);
            }, 1500);
          }
        );
      }
    } catch (err) {
      setAlertMessage('Failed to save immunization record');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  // Initialize formik
  const formik = useFormik({
    initialValues: initialImmunizationValues,
    validationSchema: immunizationValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true
  });

  // Calculate age in months when date of birth changes
  useEffect(() => {
    if (formik.values.date_of_birth && formik.values.vaccination_date) {
      try {
        const birthDate = safeParseDate(formik.values.date_of_birth);
        const vaccDate = safeParseDate(formik.values.vaccination_date);
        
        if (birthDate && vaccDate) {
          const ageMonths = differenceInMonths(vaccDate, birthDate);
          formik.setFieldValue('age_months', ageMonths, false);
        }
      } catch (error) {
        console.warn('Error calculating age:', error);
      }
    }
  }, [formik.values.date_of_birth, formik.values.vaccination_date]);

  // Update next due date when vaccine type or dose number changes
  useEffect(() => {
    if (formik.values.vaccine_type && formik.values.dose_number && formik.values.vaccination_date) {
      const scheduleInfo = getVaccineScheduleInfo(
        formik.values.vaccine_type,
        formik.values.dose_number
      );
      
      setVaccineScheduleInfo(scheduleInfo);
      
      if (scheduleInfo.isLastDose) {
        formik.setFieldValue('next_due_date', null, false);
      } else {
        try {
          const vaccDate = safeParseDate(formik.values.vaccination_date);
          if (vaccDate) {
            const nextDate = addMonths(vaccDate, scheduleInfo.interval);
            formik.setFieldValue('next_due_date', nextDate, false);
          }
        } catch (error) {
          console.warn('Error calculating next due date:', error);
        }
      }
    }
  }, [formik.values.vaccine_type, formik.values.dose_number, formik.values.vaccination_date]);

  // Load facilities
  useEffect(() => {
    const loadFacilities = async () => {
      try {
        console.log('Calling immunizationService.getFacilities()...');
        const response = await immunizationService.getFacilities();
        console.log('Raw facilities response:', response);
        
        // Handle different possible response structures
        let facilitiesData = [];
        
        if (response) {
          if (Array.isArray(response)) {
            // Response is directly an array
            facilitiesData = response;
          } else if (response.data) {
            if (Array.isArray(response.data)) {
              // Response.data is an array
              facilitiesData = response.data;
            } else if (response.data.data && Array.isArray(response.data.data)) {
              // Nested data structure
              facilitiesData = response.data.data;
            } else if (response.data.facilities && Array.isArray(response.data.facilities)) {
              // Facilities property
              facilitiesData = response.data.facilities;
            }
          }
        }
        
        console.log('Processed facilities data:', facilitiesData);
        console.log('Is array?', Array.isArray(facilitiesData));
        
        // Ensure we always set an array
        setFacilities(Array.isArray(facilitiesData) ? facilitiesData : []);
        
        // If no facilities found, set default
        if (!Array.isArray(facilitiesData) || facilitiesData.length === 0) {
          console.warn('No facilities found, using default');
          setFacilities([
            { id: 'a67c1c4d-ce75-4713-a87c-ab3d7a2444f0', name: 'Default Facility' }
          ]);
        }
      } catch (error) {
        console.error('Error loading facilities:', error);
        // Always set default facility on error
        setFacilities([
          { id: 'a67c1c4d-ce75-4713-a87c-ab3d7a2444f0', name: 'Default Facility' }
        ]);
      }
    };
    
    loadFacilities();
  }, []);

  // Load immunization data if in edit mode
  useEffect(() => {
    const loadImmunization = async () => {
      if (id && id !== 'new') {
        setIsEditMode(true);
        
        await execute(
          immunizationService.getImmunizationById,
          [id],
          (response) => {
            const immunizationData = response.data || response;
            const patient = immunizationData.patient || {};
            const facility = immunizationData.facility || {};
            
            // Map API response to form values
            const formValues = {
              // Patient information
              patient_id: immunizationData.patientId || '',
              patient_name: patient.firstName && patient.lastName ? 
                `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
              date_of_birth: safeParseDate(patient.dateOfBirth),
              gender: patient.gender || '',
              age_months: immunizationData.ageMonths || '',
              
              // Vaccination details
              vaccine_type: immunizationData.vaccineType || '',
              vaccine_name: immunizationData.vaccineName || immunizationData.vaccineType || '',
              dose_number: immunizationData.doseNumber || 1,
              lot_number: immunizationData.batchNumber || '',
              vaccination_date: safeParseDate(immunizationData.administrationDate) || new Date(),
              next_due_date: safeParseDate(immunizationData.nextDoseDate),
              expiry_date: safeParseDate(immunizationData.expiryDate),
              
              // Administration details
              site_of_administration: immunizationData.administrationSite || '',
              route_of_administration: immunizationData.administrationRoute || '',
              dosage: immunizationData.dosage || '',
              healthcare_provider: immunizationData.administeredBy || '',
              provider_id: immunizationData.providerId || '',
              facility_id: immunizationData.facilityId || '',
              
              // Other details
              weight_kg: immunizationData.weightKg || '',
              height_cm: immunizationData.heightCm || '',
              side_effects: immunizationData.sideEffects || '',
              notes: immunizationData.notes || '',
              status: immunizationData.status || 'Administered'
            };
            
            setImmunization(formValues);
            
            // Set formik values
            Object.keys(formValues).forEach(key => {
              formik.setFieldValue(key, formValues[key], false);
            });
          }
        );
      }
    };
    
    loadImmunization();
  }, [id, execute]);

  // Handle form cancellation
  const handleCancel = () => {
    if (formik.dirty) {
      setCancelDialogOpen(true);
    } else {
      navigateBack();
    }
  };

  // Navigate back to the previous page
  const navigateBack = () => {
    if (isEditMode) {
      navigate(`/immunization/${id}`);
    } else {
      navigate('/immunization');
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

  // Handle patient search
  const handlePatientSearch = async () => {
    if (patientSearchTerm.trim().length < 2) {
      return;
    }
    
    setSearchLoading(true);
    
    try {
      const response = await patientService.searchPatients(patientSearchTerm);
      const patients = response.data || response || [];
      
      const formattedResults = patients.map(patient => ({
        id: patient.id,
        name: `${patient.firstName} ${patient.lastName}${patient.otherNames ? ' ' + patient.otherNames : ''}`,
        gender: patient.gender,
        date_of_birth: patient.dateOfBirth
      }));
      
      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Error searching for patients:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    formik.setFieldValue('patient_id', patient.id, false);
    formik.setFieldValue('patient_name', patient.name, false);
    formik.setFieldValue('gender', patient.gender, false);
    formik.setFieldValue('date_of_birth', safeParseDate(patient.date_of_birth), false);
    
    setPatientSearchOpen(false);
    setPatientSearchTerm('');
    setSearchResults([]);
  };

  // Set default site and route based on vaccine
  const handleVaccineTypeChange = (event) => {
    const vaccineType = event.target.value;
    formik.setFieldValue('vaccine_type', vaccineType, false);
    formik.setFieldValue('vaccine_name', vaccineType, false);
    
    // Set default administration details based on vaccine type
    switch (vaccineType) {
      case 'BCG':
        formik.setFieldValue('site_of_administration', 'Right Upper Arm', false);
        formik.setFieldValue('route_of_administration', 'Intradermal', false);
        break;
      case 'Hepatitis B':
      case 'Pentavalent':
      case 'COVID-19':
        formik.setFieldValue('site_of_administration', 'Left Thigh', false);
        formik.setFieldValue('route_of_administration', 'Intramuscular', false);
        break;
      case 'OPV':
      case 'Rotavirus':
        formik.setFieldValue('site_of_administration', 'Mouth', false);
        formik.setFieldValue('route_of_administration', 'Oral', false);
        break;
      case 'Measles':
      case 'Yellow Fever':
        formik.setFieldValue('site_of_administration', 'Left Upper Arm', false);
        formik.setFieldValue('route_of_administration', 'Subcutaneous', false);
        break;
      default:
        // Keep current values
        break;
    }
  };

  // Render current step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Patient Information
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Patient Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<SearchIcon />}
                  onClick={() => setPatientSearchOpen(true)}
                  disabled={isEditMode} // Disable patient search in edit mode
                >
                  Search Patient
                </Button>
                {formik.values.patient_id && (
                  <Button
                    variant="outlined"
                    component="a"
                    href={`/patients/${formik.values.patient_id}`}
                    target="_blank"
                  >
                    View Patient Profile
                  </Button>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="patient_id"
                name="patient_id"
                label="Patient ID *"
                value={formik.values.patient_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.patient_id && Boolean(formik.errors.patient_id)}
                helperText={formik.touched.patient_id && formik.errors.patient_id}
                disabled={isEditMode} // Patient cannot be changed in edit mode
                InputProps={{
                  readOnly: isEditMode
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="patient_name"
                name="patient_name"
                label="Patient Name *"
                value={formik.values.patient_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.patient_name && Boolean(formik.errors.patient_name)}
                helperText={formik.touched.patient_name && formik.errors.patient_name}
                disabled={isEditMode} // Patient cannot be changed in edit mode
                InputProps={{
                  readOnly: isEditMode
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                error={formik.touched.gender && Boolean(formik.errors.gender)}
                disabled={isEditMode}
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
                  disabled={isEditMode} // Patient cannot be changed in edit mode
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
                  value={formik.values.date_of_birth}
                  onChange={(date) => formik.setFieldValue('date_of_birth', date)}
                  disabled={isEditMode} // Patient cannot be changed in edit mode
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      name="date_of_birth"
                      onBlur={formik.handleBlur}
                      error={formik.touched.date_of_birth && Boolean(formik.errors.date_of_birth)}
                      helperText={formik.touched.date_of_birth && formik.errors.date_of_birth}
                      disabled={isEditMode}
                      InputProps={{
                        ...params.InputProps,
                        readOnly: isEditMode,
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
                id="age_months"
                name="age_months"
                label="Age (Months)"
                type="number"
                InputProps={{
                  readOnly: true,
                }}
                value={formik.values.age_months}
                helperText="Calculated from date of birth and vaccination date"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="weight_kg"
                name="weight_kg"
                label="Weight (kg)"
                type="number"
                InputProps={{
                  inputProps: { min: 0, step: 0.1 }
                }}
                value={formik.values.weight_kg}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.weight_kg && Boolean(formik.errors.weight_kg)}
                helperText={formik.touched.weight_kg && formik.errors.weight_kg}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="height_cm"
                name="height_cm"
                label="Height (cm)"
                type="number"
                InputProps={{
                  inputProps: { min: 0, step: 0.1 }
                }}
                value={formik.values.height_cm}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.height_cm && Boolean(formik.errors.height_cm)}
                helperText={formik.touched.height_cm && formik.errors.height_cm}
              />
            </Grid>
          </Grid>
        );
      
      case 1: // Vaccination Details
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Vaccination Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                error={formik.touched.vaccine_type && Boolean(formik.errors.vaccine_type)}
              >
                <InputLabel id="vaccine-type-label">Vaccine Type *</InputLabel>
                <Select
                  labelId="vaccine-type-label"
                  id="vaccine_type"
                  name="vaccine_type"
                  value={formik.values.vaccine_type}
                  onChange={handleVaccineTypeChange}
                  onBlur={formik.handleBlur}
                  label="Vaccine Type *"
                >
                  <MenuItem value="">
                    <em>Select Vaccine</em>
                  </MenuItem>
                  {vaccineTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
                {formik.touched.vaccine_type && formik.errors.vaccine_type && (
                  <FormHelperText>{formik.errors.vaccine_type}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="vaccine_name"
                name="vaccine_name"
                label="Vaccine Name *"
                value={formik.values.vaccine_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.vaccine_name && Boolean(formik.errors.vaccine_name)}
                helperText={formik.touched.vaccine_name && formik.errors.vaccine_name}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                error={formik.touched.dose_number && Boolean(formik.errors.dose_number)}
              >
                <InputLabel id="dose-number-label">Dose Number *</InputLabel>
                <Select
                  labelId="dose-number-label"
                  id="dose_number"
                  name="dose_number"
                  value={formik.values.dose_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Dose Number *"
                  disabled={!formik.values.vaccine_type}
                >
                  {vaccineScheduleInfo && Array.from({ length: vaccineScheduleInfo.maxDoses }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>Dose {i + 1}</MenuItem>
                  ))}
                  {!vaccineScheduleInfo && [1, 2, 3, 4, 5].map((dose) => (
                    <MenuItem key={dose} value={dose}>Dose {dose}</MenuItem>
                  ))}
                </Select>
                {formik.touched.dose_number && formik.errors.dose_number && (
                  <FormHelperText>{formik.errors.dose_number}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Vaccination Date *"
                  value={formik.values.vaccination_date}
                  onChange={(date) => formik.setFieldValue('vaccination_date', date)}
                  maxDate={new Date()}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      name="vaccination_date"
                      onBlur={formik.handleBlur}
                      error={formik.touched.vaccination_date && Boolean(formik.errors.vaccination_date)}
                      helperText={formik.touched.vaccination_date && formik.errors.vaccination_date}
                      InputProps={{
                        ...params.InputProps,
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
                  label="Next Due Date"
                  value={formik.values.next_due_date}
                  onChange={(date) => formik.setFieldValue('next_due_date', date)}
                  disabled={vaccineScheduleInfo?.isLastDose}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      name="next_due_date"
                      onBlur={formik.handleBlur}
                      error={formik.touched.next_due_date && Boolean(formik.errors.next_due_date)}
                      helperText={
                        (formik.touched.next_due_date && formik.errors.next_due_date) ||
                        (vaccineScheduleInfo?.isLastDose ? 'Last dose in series - no next dose required' : 'Calculated based on vaccine schedule')
                      }
                      InputProps={{
                        ...params.InputProps,
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
                id="lot_number"
                name="lot_number"
                label="Batch/Lot Number *"
                value={formik.values.lot_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lot_number && Boolean(formik.errors.lot_number)}
                helperText={formik.touched.lot_number && formik.errors.lot_number}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Expiry Date"
                  value={formik.values.expiry_date}
                  onChange={(date) => formik.setFieldValue('expiry_date', date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      name="expiry_date"
                      onBlur={formik.handleBlur}
                      InputProps={{
                        ...params.InputProps,
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
              <FormControl 
                fullWidth
                error={formik.touched.status && Boolean(formik.errors.status)}
              >
                <InputLabel id="status-label">Status *</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Status *"
                >
                  <MenuItem value="Administered">Administered</MenuItem>
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                  <MenuItem value="Missed">Missed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        );
      
      case 2: // Administration Details
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Administration Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                error={formik.touched.site_of_administration && Boolean(formik.errors.site_of_administration)}
              >
                <InputLabel id="site-of-administration-label">Site of Administration *</InputLabel>
                <Select
                  labelId="site-of-administration-label"
                  id="site_of_administration"
                  name="site_of_administration"
                  value={formik.values.site_of_administration}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Site of Administration *"
                >
                  <MenuItem value="">
                    <em>Select Site</em>
                  </MenuItem>
                  <MenuItem value="Left Upper Arm">Left Upper Arm</MenuItem>
                  <MenuItem value="Right Upper Arm">Right Upper Arm</MenuItem>
                  <MenuItem value="Left Thigh">Left Thigh</MenuItem>
                  <MenuItem value="Right Thigh">Right Thigh</MenuItem>
                  <MenuItem value="Left Arm">Left Arm</MenuItem>
                  <MenuItem value="Right Arm">Right Arm</MenuItem>
                  <MenuItem value="Buttocks">Buttocks</MenuItem>
                  <MenuItem value="Mouth">Mouth</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {formik.touched.site_of_administration && formik.errors.site_of_administration && (
                  <FormHelperText>{formik.errors.site_of_administration}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                error={formik.touched.route_of_administration && Boolean(formik.errors.route_of_administration)}
              >
                <InputLabel id="route-of-administration-label">Route of Administration *</InputLabel>
                <Select
                  labelId="route-of-administration-label"
                  id="route_of_administration"
                  name="route_of_administration"
                  value={formik.values.route_of_administration}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Route of Administration *"
                >
                  <MenuItem value="">
                    <em>Select Route</em>
                  </MenuItem>
                  <MenuItem value="Intramuscular">Intramuscular</MenuItem>
                  <MenuItem value="Subcutaneous">Subcutaneous</MenuItem>
                  <MenuItem value="Intradermal">Intradermal</MenuItem>
                  <MenuItem value="Oral">Oral</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {formik.touched.route_of_administration && formik.errors.route_of_administration && (
                  <FormHelperText>{formik.errors.route_of_administration}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="dosage"
                name="dosage"
                label="Dosage"
                value={formik.values.dosage}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g., 0.5 mL"
                helperText="Enter the dosage amount and unit"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                error={formik.touched.facility_id && Boolean(formik.errors.facility_id)}
              >
                <InputLabel id="facility-label">Facility *</InputLabel>
                <Select
                  labelId="facility-label"
                  id="facility_id"
                  name="facility_id"
                  value={formik.values.facility_id}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Facility *"
                >
                  <MenuItem value="">
                    <em>Select Facility</em>
                  </MenuItem>
                  {Array.isArray(facilities) && facilities.length > 0 ? (
                    facilities.map((facility) => (
                      <MenuItem key={facility.id} value={facility.id}>
                        {facility.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="a67c1c4d-ce75-4713-a87c-ab3d7a2444f0">
                      Default Facility
                    </MenuItem>
                  )}
                </Select>
                {formik.touched.facility_id && formik.errors.facility_id && (
                  <FormHelperText>{formik.errors.facility_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="healthcare_provider"
                name="healthcare_provider"
                label="Healthcare Provider *"
                value={formik.values.healthcare_provider}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.healthcare_provider && Boolean(formik.errors.healthcare_provider)}
                helperText={formik.touched.healthcare_provider && formik.errors.healthcare_provider}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="provider_id"
                name="provider_id"
                label="Provider ID"
                value={formik.values.provider_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                helperText="Optional provider identification number"
              />
            </Grid>
          </Grid>
        );
      
      case 3: // Additional Information
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Additional Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="side_effects"
                name="side_effects"
                label="Side Effects/Adverse Events"
                multiline
                rows={2}
                value={formik.values.side_effects}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.side_effects && Boolean(formik.errors.side_effects)}
                helperText={formik.touched.side_effects && formik.errors.side_effects}
                placeholder="Describe any side effects or adverse reactions observed"
              />
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
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
                placeholder="Any additional notes or observations"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                Please verify all information before submission. Once submitted, an immunization certificate can be printed from the immunization record details page.
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
        formik.values.patient_id &&
        formik.values.patient_name &&
        formik.values.gender &&
        formik.values.date_of_birth &&
        !formik.errors.patient_id &&
        !formik.errors.patient_name &&
        !formik.errors.gender &&
        !formik.errors.date_of_birth
      );
    } else if (step === 1) {
      return (
        formik.values.vaccine_type &&
        formik.values.vaccine_name &&
        formik.values.dose_number &&
        formik.values.vaccination_date &&
        formik.values.lot_number &&
        !formik.errors.vaccine_type &&
        !formik.errors.vaccine_name &&
        !formik.errors.dose_number &&
        !formik.errors.vaccination_date &&
        !formik.errors.lot_number
      );
    } else if (step === 2) {
      return (
        formik.values.site_of_administration &&
        formik.values.route_of_administration &&
        formik.values.facility_id &&
        formik.values.healthcare_provider &&
        !formik.errors.site_of_administration &&
        !formik.errors.route_of_administration &&
        !formik.errors.facility_id &&
        !formik.errors.healthcare_provider
      );
    }
    
    return true; // Optional step
  };

  // Determine if the form can be submitted
  const canSubmit = () => {
    return (
      formik.values.patient_id &&
      formik.values.patient_name &&
      formik.values.gender &&
      formik.values.date_of_birth &&
      formik.values.vaccine_type &&
      formik.values.vaccine_name &&
      formik.values.dose_number &&
      formik.values.vaccination_date &&
      formik.values.lot_number &&
      formik.values.site_of_administration &&
      formik.values.route_of_administration &&
      formik.values.facility_id &&
      formik.values.healthcare_provider &&
      Object.keys(formik.errors).length === 0
    );
  };

  if (loading && !immunization && isEditMode) {
    return (
      <MainLayout title="Loading...">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={isEditMode ? "Edit Immunization Record" : "New Immunization Record"}
      breadcrumbs={[
        { name: 'Immunization', path: '/immunization' },
        { name: isEditMode ? 'Edit Record' : 'New Record', active: true }
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
            {isEditMode ? 'Edit Immunization Record' : 'New Immunization Record'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

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
                  startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                  disabled={loading || !canSubmit()}
                >
                  {isEditMode ? 'Update Record' : 'Save Record'}
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>

      {/* Patient Search Dialog */}
      <Dialog
        open={patientSearchOpen}
        onClose={() => setPatientSearchOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Search Patient</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={9}>
                <TextField
                  fullWidth
                  label="Search by Name or ID"
                  value={patientSearchTerm}
                  onChange={(e) => setPatientSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handlePatientSearch();
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() => setPatientSearchTerm('')}
                          sx={{ visibility: patientSearchTerm ? 'visible' : 'hidden' }}
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handlePatientSearch}
                  disabled={patientSearchTerm.trim().length < 2 || searchLoading}
                  sx={{ height: '100%' }}
                >
                  {searchLoading ? <CircularProgress size={24} /> : 'Search'}
                </Button>
              </Grid>
            </Grid>
          </Box>

          {searchLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : searchResults.length > 0 ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Search Results:
              </Typography>
              <Grid container spacing={1}>
                {searchResults.map((patient) => (
                  <Grid item xs={12} key={patient.id}>
                    <Card
                      sx={{ 
                        cursor: 'pointer', 
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' } 
                      }}
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <CardContent sx={{ py: 1 }}>
                        <Grid container alignItems="center">
                          <Grid item xs={1}>
                            <PersonIcon />
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="subtitle2">
                              {patient.name}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2" color="text.secondary">
                              ID: {patient.id.substring(0, 8)}...
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2" color="text.secondary">
                              {patient.gender}
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography variant="body2" color="text.secondary">
                              DOB: {patient.date_of_birth ? format(new Date(patient.date_of_birth), 'dd/MM/yyyy') : 'N/A'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : patientSearchTerm.trim().length >= 2 ? (
            <Alert severity="info">
              No patients found matching your search criteria.
            </Alert>
          ) : (
            <Alert severity="info">
              Enter a patient name or ID to search. Minimum 2 characters required.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPatientSearchOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            component="a" 
            href="/patients/new" 
            target="_blank"
          >
            Register New Patient
          </Button>
        </DialogActions>
      </Dialog>

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

export default ImmunizationForm;