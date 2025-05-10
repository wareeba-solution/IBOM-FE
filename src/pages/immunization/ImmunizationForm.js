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
import { format, differenceInMonths, addMonths, parseISO } from 'date-fns';

// Mock immunization service - replace with actual service when available
const immunizationService = {
  getImmunizationById: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockImmunization = {
          id,
          registration_number: `IM${10000 + parseInt(id)}`,
          patient_name: `${parseInt(id) % 2 === 0 ? 'John' : 'Jane'} Doe ${id}`,
          patient_id: `PT${5000 + parseInt(id)}`,
          gender: parseInt(id) % 2 === 0 ? 'Male' : 'Female',
          date_of_birth: new Date(2020 - (parseInt(id) % 5), (parseInt(id) % 12), parseInt(id) % 28 + 1).toISOString().split('T')[0],
          age_months: 12 + (parseInt(id) % 48),
          vaccine_type: ['BCG', 'Hepatitis B', 'OPV', 'Pentavalent', 'Pneumococcal', 'Rotavirus', 'Measles', 'Yellow Fever'][parseInt(id) % 8],
          dose_number: (parseInt(id) % 3) + 1,
          lot_number: `LOT${100 + parseInt(id)}`,
          vaccination_date: new Date(2023, (parseInt(id) % 12), parseInt(id) % 28 + 1).toISOString().split('T')[0],
          next_due_date: parseInt(id) % 3 === 2 ? null : new Date(2023, (parseInt(id) % 12) + 2, parseInt(id) % 28 + 1).toISOString().split('T')[0],
          healthcare_provider: `Nurse ${parseInt(id) % 10 + 1}`,
          provider_id: `NUR${1000 + parseInt(id) % 20}`,
          facility: `Health Center ${parseInt(id) % 5 + 1}`,
          facility_id: `FAC${parseInt(id) % 5 + 1}`,
          status: parseInt(id) % 10 === 0 ? 'pending' : (parseInt(id) % 10 === 1 ? 'missed' : 'completed'),
          side_effects: parseInt(id) % 15 === 0 ? 'Mild fever' : (parseInt(id) % 20 === 0 ? 'Swelling at injection site' : null),
          notes: parseInt(id) % 8 === 0 ? 'Follow up required due to previous adverse reaction' : null,
          weight_kg: 5 + (parseInt(id) % 20),
          height_cm: 50 + (parseInt(id) % 30),
          site_of_administration: parseInt(id) % 2 === 0 ? 'Left Arm' : 'Right Thigh',
          route_of_administration: parseInt(id) % 3 === 0 ? 'Intramuscular' : (parseInt(id) % 3 === 1 ? 'Subcutaneous' : 'Oral')
        };
        resolve(mockImmunization);
      }, 500);
    });
  },
  createImmunization: async (data) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          id: Math.floor(Math.random() * 1000),
          ...data
        });
      }, 500);
    });
  },
  updateImmunization: async (id, data) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          id,
          ...data
        });
      }, 500);
    });
  },
  searchPatients: async (searchTerm) => {
    // Simulate API call to search patients
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate mock patients based on search term
        const mockPatients = Array.from({ length: 5 }, (_, i) => ({
          id: `PT${5000 + i}`,
          name: `${searchTerm} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][i]}`,
          gender: i % 2 === 0 ? 'Male' : 'Female',
          date_of_birth: new Date(2020 - (i % 5), (i % 12), i % 28 + 1).toISOString().split('T')[0],
        }));
        resolve(mockPatients);
      }, 300);
    });
  },
  getVaccineSchedule: async (vaccineType, doseNumber) => {
    // Simulate API call to get vaccine schedule information
    return new Promise((resolve) => {
      setTimeout(() => {
        // Default interval (in months) between doses for different vaccines
        const scheduleIntervals = {
          'BCG': 0, // One time only
          'Hepatitis B': 2,
          'OPV': 2,
          'Pentavalent': 2,
          'Pneumococcal': 2,
          'Rotavirus': 2,
          'Measles': 6,
          'Yellow Fever': 0, // One time only
          'Meningitis': 0, // One time only
          'Tetanus Toxoid': 1,
          'HPV': 6,
          'COVID-19': 1,
          'Other': 1
        };
        
        // Max doses for each vaccine
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
        
        // Determine if next dose is needed
        const interval = scheduleIntervals[vaccineType] || 1;
        const isLastDose = doseNumber >= (maxDoses[vaccineType] || 1);
        
        resolve({
          interval: interval,
          isLastDose: isLastDose,
          maxDoses: maxDoses[vaccineType] || 1
        });
      }, 200);
    });
  }
};

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

// Facilities list
const facilities = [
  { id: 'FAC1', name: 'Health Center 1' },
  { id: 'FAC2', name: 'Health Center 2' },
  { id: 'FAC3', name: 'Health Center 3' },
  { id: 'FAC4', name: 'Health Center 4' },
  { id: 'FAC5', name: 'Health Center 5' }
];

// Healthcare providers list
const healthcareProviders = [
  { id: 'NUR1001', name: 'Nurse 1' },
  { id: 'NUR1002', name: 'Nurse 2' },
  { id: 'NUR1003', name: 'Nurse 3' },
  { id: 'NUR1004', name: 'Nurse 4' },
  { id: 'NUR1005', name: 'Nurse 5' },
  { id: 'DOC1001', name: 'Doctor 1' },
  { id: 'DOC1002', name: 'Doctor 2' }
];

// Form validation schema
const immunizationValidationSchema = Yup.object({
  // Patient information
  patient_id: Yup.string()
    .required('Patient ID is required'),
  patient_name: Yup.string()
    .required('Patient name is required'),
  date_of_birth: Yup.date()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future'),
  gender: Yup.string()
    .required('Gender is required'),
  
  // Vaccination details
  vaccine_type: Yup.string()
    .required('Vaccine type is required'),
  dose_number: Yup.number()
    .required('Dose number is required')
    .positive('Dose number must be positive')
    .integer('Dose number must be an integer'),
  lot_number: Yup.string()
    .required('Lot number is required'),
  vaccination_date: Yup.date()
    .required('Vaccination date is required')
    .max(new Date(), 'Vaccination date cannot be in the future'),
  
  // Administration details
  site_of_administration: Yup.string()
    .required('Site of administration is required'),
  route_of_administration: Yup.string()
    .required('Route of administration is required'),
  healthcare_provider: Yup.string()
    .required('Healthcare provider is required'),
  facility: Yup.string()
    .required('Facility is required'),
  
  // Other details (optional)
  weight_kg: Yup.number()
    .positive('Weight must be positive')
    .nullable(),
  height_cm: Yup.number()
    .positive('Height must be positive')
    .nullable(),
  side_effects: Yup.string()
    .nullable(),
  notes: Yup.string()
    .nullable(),
  status: Yup.string()
    .required('Status is required')
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
  dose_number: 1,
  lot_number: '',
  vaccination_date: new Date(),
  next_due_date: null,
  
  // Administration details
  site_of_administration: '',
  route_of_administration: '',
  healthcare_provider: '',
  provider_id: '',
  facility: '',
  facility_id: '',
  
  // Other details
  weight_kg: '',
  height_cm: '',
  side_effects: '',
  notes: '',
  status: 'completed'
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

  // Steps for the form
  const steps = ['Patient Information', 'Vaccination Details', 'Administration Details', 'Additional Information'];

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      // Format date values
      const formattedValues = {
        ...values,
        date_of_birth: values.date_of_birth ? format(new Date(values.date_of_birth), 'yyyy-MM-dd') : null,
        vaccination_date: format(new Date(values.vaccination_date), 'yyyy-MM-dd'),
        next_due_date: values.next_due_date ? format(new Date(values.next_due_date), 'yyyy-MM-dd') : null
      };

      if (isEditMode) {
        // Update existing immunization record
        await execute(
          immunizationService.updateImmunization,
          [id, formattedValues],
          (response) => {
            setAlertMessage('Immunization record updated successfully');
            setAlertSeverity('success');
            setAlertOpen(true);
            
            // Navigate back to immunization detail after a short delay
            setTimeout(() => {
              navigate(`/immunization/${id}`);
            }, 1500);
          }
        );
      } else {
        // Create new immunization record
        await execute(
          immunizationService.createImmunization,
          [formattedValues],
          (response) => {
            setAlertMessage('Immunization record registered successfully');
            setAlertSeverity('success');
            setAlertOpen(true);
            
            // Navigate to the new immunization's detail page
            setTimeout(() => {
              navigate(`/immunization/${response.id}`);
            }, 1500);
          }
        );
      }
    } catch (err) {
      setAlertMessage('Failed to save immunization record information');
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
    if (formik.values.date_of_birth) {
      const birthDate = new Date(formik.values.date_of_birth);
      const vaccDate = formik.values.vaccination_date 
        ? new Date(formik.values.vaccination_date) 
        : new Date();
      
      const ageMonths = differenceInMonths(vaccDate, birthDate);
      formik.setFieldValue('age_months', ageMonths, false);
    }
  }, [formik.values.date_of_birth, formik.values.vaccination_date]);

  // Update next due date when vaccine type or dose number changes
  useEffect(() => {
    const updateNextDueDate = async () => {
      if (formik.values.vaccine_type && formik.values.dose_number && formik.values.vaccination_date) {
        const scheduleInfo = await immunizationService.getVaccineSchedule(
          formik.values.vaccine_type,
          formik.values.dose_number
        );
        
        setVaccineScheduleInfo(scheduleInfo);
        
        if (scheduleInfo.isLastDose) {
          // Last dose, no next due date
          formik.setFieldValue('next_due_date', null, false);
        } else {
          // Calculate next due date based on interval
          const nextDate = addMonths(
            new Date(formik.values.vaccination_date),
            scheduleInfo.interval
          );
          formik.setFieldValue('next_due_date', nextDate, false);
        }
      }
    };
    
    updateNextDueDate();
  }, [formik.values.vaccine_type, formik.values.dose_number, formik.values.vaccination_date]);

  // Load immunization data if in edit mode
  useEffect(() => {
    const loadImmunization = async () => {
      if (id && id !== 'new') {
        setIsEditMode(true);
        
        await execute(
          immunizationService.getImmunizationById,
          [id],
          (response) => {
            // Transform API response to form values format
            const immunizationData = {
              ...initialImmunizationValues,
              ...response,
              date_of_birth: response.date_of_birth ? new Date(response.date_of_birth) : null,
              vaccination_date: response.vaccination_date ? new Date(response.vaccination_date) : new Date(),
              next_due_date: response.next_due_date ? new Date(response.next_due_date) : null
            };
            
            setImmunization(immunizationData);
            
            // Set formik values
            Object.keys(immunizationData).forEach(key => {
              formik.setFieldValue(key, immunizationData[key], false);
            });
          }
        );
      }
    };
    
    loadImmunization();
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
      navigate(`/immunizations/${id}`);  // Changed from '/immunization/${id}' to '/immunizations/${id}'
    } else {
      navigate('/immunizations');  // Changed from '/immunization' to '/immunizations'
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
      const results = await immunizationService.searchPatients(patientSearchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching for patients:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    formik.setFieldValue('patient_id', patient.id, false);
    formik.setFieldValue('patient_name', patient.name, false);
    formik.setFieldValue('gender', patient.gender, false);
    formik.setFieldValue('date_of_birth', new Date(patient.date_of_birth), false);
    
    setPatientSearchOpen(false);
    setPatientSearchTerm('');
    setSearchResults([]);
  };

  // Set default site and route based on vaccine
  const handleVaccineTypeChange = (event) => {
    const vaccineType = event.target.value;
    formik.setFieldValue('vaccine_type', vaccineType, false);
    
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

  // Handle facility selection
  const handleFacilityChange = (event) => {
    const facilityId = event.target.value;
    formik.setFieldValue('facility_id', facilityId, false);
    
    // Set facility name
    const facilityObj = facilities.find(f => f.id === facilityId);
    if (facilityObj) {
      formik.setFieldValue('facility', facilityObj.name, false);
    }
  };

  // Handle provider selection
  const handleProviderChange = (event) => {
    const providerId = event.target.value;
    formik.setFieldValue('provider_id', providerId, false);
    
    // Set provider name
    const providerObj = healthcareProviders.find(p => p.id === providerId);
    if (providerObj) {
      formik.setFieldValue('healthcare_provider', providerObj.name, false);
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
                disabled={isEditMode}
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
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      name="vaccination_date"
                      onBlur={formik.handleBlur}
                      error={formik.touched.vaccination_date && Boolean(formik.errors.vaccination_date)}
                      helperText={formik.touched.vaccination_date && formik.errors.vaccination_date}
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
                label="Lot Number *"
                value={formik.values.lot_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lot_number && Boolean(formik.errors.lot_number)}
                helperText={formik.touched.lot_number && formik.errors.lot_number}
              />
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
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="missed">Missed</MenuItem>
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
                  onChange={handleFacilityChange}
                  onBlur={formik.handleBlur}
                  label="Facility *"
                >
                  <MenuItem value="">
                    <em>Select Facility</em>
                  </MenuItem>
                  {facilities.map((facility) => (
                    <MenuItem key={facility.id} value={facility.id}>{facility.name}</MenuItem>
                  ))}
                </Select>
                {formik.touched.facility_id && formik.errors.facility_id && (
                  <FormHelperText>{formik.errors.facility_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                error={formik.touched.provider_id && Boolean(formik.errors.provider_id)}
              >
                <InputLabel id="provider-label">Healthcare Provider *</InputLabel>
                <Select
                  labelId="provider-label"
                  id="provider_id"
                  name="provider_id"
                  value={formik.values.provider_id}
                  onChange={handleProviderChange}
                  onBlur={formik.handleBlur}
                  label="Healthcare Provider *"
                >
                  <MenuItem value="">
                    <em>Select Provider</em>
                  </MenuItem>
                  {healthcareProviders.map((provider) => (
                    <MenuItem key={provider.id} value={provider.id}>{provider.name}</MenuItem>
                  ))}
                </Select>
                {formik.touched.provider_id && formik.errors.provider_id && (
                  <FormHelperText>{formik.errors.provider_id}</FormHelperText>
                )}
              </FormControl>
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
        formik.values.dose_number &&
        formik.values.vaccination_date &&
        formik.values.lot_number &&
        !formik.errors.vaccine_type &&
        !formik.errors.dose_number &&
        !formik.errors.vaccination_date &&
        !formik.errors.lot_number
      );
    } else if (step === 2) {
      return (
        formik.values.site_of_administration &&
        formik.values.route_of_administration &&
        formik.values.facility &&
        formik.values.healthcare_provider &&
        !formik.errors.site_of_administration &&
        !formik.errors.route_of_administration &&
        !formik.errors.facility &&
        !formik.errors.healthcare_provider
      );
    }
    
    // In step 3, check additional information
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
      formik.values.dose_number &&
      formik.values.vaccination_date &&
      formik.values.lot_number &&
      formik.values.site_of_administration &&
      formik.values.route_of_administration &&
      formik.values.facility &&
      formik.values.healthcare_provider &&
      Object.keys(formik.errors).length === 0
    );
  };

  return (
    <MainLayout 
      title={isEditMode ? "Edit Immunization Record" : "Register New Immunization"}
      breadcrumbs={[
        { name: 'Immunization', path: '/immunization' },
        { name: isEditMode ? 'Edit Immunization Record' : 'Register New Immunization', active: true }
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
            {isEditMode ? 'Edit Immunization Record' : 'Register New Immunization'}
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
                    {isEditMode ? 'Update Record' : 'Register Immunization'}
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        )}
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
                  disabled={patientSearchTerm.trim().length < 2}
                  sx={{ height: '100%' }}
                >
                  Search
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
                              ID: {patient.id}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2" color="text.secondary">
                              {patient.gender}
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography variant="body2" color="text.secondary">
                              DOB: {format(new Date(patient.date_of_birth), 'dd/MM/yyyy')}
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