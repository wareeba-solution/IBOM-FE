// src/pages/antenatal/AntenatalForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClearIcon from '@mui/icons-material/Clear';
//import CloseIcon from '@mui/icons-material/Close';
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
  Checkbox,
  FormGroup,
  Autocomplete,
  CardContent,
  Card,
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  DateRange as DateRangeIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, differenceInWeeks, addDays, parseISO } from 'date-fns';

// Mock antenatal service - replace with actual service when available
const antenatalService = {
  getAntenatalRecordById: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const lmpDate = new Date(2023 - (parseInt(id) % 2), (parseInt(id) % 12), parseInt(id) % 28 + 1);
        const registrationDate = new Date(lmpDate);
        registrationDate.setDate(registrationDate.getDate() + (parseInt(id) % 30) + 10);
        
        const currentDate = new Date();
        const gestationalAge = differenceInWeeks(currentDate, lmpDate);
        
        // Calculate EDD (Estimated Due Date): LMP + 280 days
        const edd = new Date(lmpDate);
        edd.setDate(edd.getDate() + 280);
        
        const mockAntenatalRecord = {
          id,
          registration_number: `ANC${10000 + parseInt(id)}`,
          patient_name: `${parseInt(id) % 2 === 0 ? 'Mary' : 'Sarah'} ${['Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis'][parseInt(id) % 7]} ${id}`,
          patient_id: `PT${5000 + parseInt(id)}`,
          age: 20 + (parseInt(id) % 15),
          date_of_birth: new Date(currentDate.getFullYear() - (20 + (parseInt(id) % 15)), (parseInt(id) % 12), parseInt(id) % 28 + 1).toISOString().split('T')[0],
          lmp: lmpDate.toISOString().split('T')[0],
          edd: edd.toISOString().split('T')[0],
          gestational_age: gestationalAge > 0 ? gestationalAge : 4,
          gravida: 1 + (parseInt(id) % 4),
          parity: parseInt(id) % 3,
          phone_number: `080${id}${id}${id}${id}${id}${id}`,
          address: `Address ${id}, Akwa Ibom`,
          risk_level: parseInt(id) % 10 === 0 ? 'high' : (parseInt(id) % 5 === 0 ? 'medium' : 'low'),
          risk_factors: parseInt(id) % 10 === 0 ? ['Previous C-section', 'Hypertension'] : 
                        (parseInt(id) % 5 === 0 ? ['Advanced maternal age'] : []),
          registration_date: registrationDate.toISOString().split('T')[0],
          next_appointment: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (parseInt(id) % 14) + 1).toISOString().split('T')[0],
          visit_count: parseInt(id) % 8,
          blood_type: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][parseInt(id) % 8],
          status: parseInt(id) % 20 === 0 ? 'delivered' : (parseInt(id) % 15 === 0 ? 'transferred' : (parseInt(id) % 10 === 0 ? 'inactive' : 'active')),
          created_at: registrationDate.toISOString(),
          
          // Additional fields for detail view
          height_cm: 150 + (parseInt(id) % 30),
          weight_kg: 50 + (parseInt(id) % 30),
          bmi: ((50 + (parseInt(id) % 30)) / Math.pow((150 + (parseInt(id) % 30))/100, 2)).toFixed(1),
          blood_pressure: `${110 + (parseInt(id) % 30)}/${70 + (parseInt(id) % 20)}`,
          hiv_status: 'Negative',
          syphilis_status: 'Negative',
          hepatitis_b_status: 'Negative',
          hemoglobin: (10 + (parseInt(id) % 4)).toFixed(1),
          urinalysis: 'Normal',
          tetanus_vaccination: parseInt(id) % 3 === 0 ? 'Complete' : 'Incomplete',
          malaria_prophylaxis: parseInt(id) % 4 === 0 ? 'Not received' : 'Received',
          iron_folate_supplementation: parseInt(id) % 5 === 0 ? 'Not received' : 'Received',
          husband_name: `John ${['Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis'][parseInt(id) % 7]}`,
          husband_contact: `070${id}${id}${id}${id}${id}${id}`,
          nearest_health_facility: `Health Center ${parseInt(id) % 5 + 1}`,
          emergency_contact_name: `${['Alice', 'Jane', 'Emily', 'Susan', 'Margaret'][parseInt(id) % 5]} ${['Johnson', 'Smith', 'Williams', 'Brown', 'Jones'][parseInt(id) % 5]}`,
          emergency_contact_phone: `090${id}${id}${id}${id}${id}${id}`,
          emergency_contact_relationship: ['Mother', 'Sister', 'Friend', 'Aunt', 'Mother-in-law'][parseInt(id) % 5],
          notes: parseInt(id) % 10 === 0 ? 'Patient has a history of hypertension. Monitor BP closely.' : ''
        };
        resolve(mockAntenatalRecord);
      }, 500);
    });
  },
  createAntenatalRecord: async (data) => {
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
  updateAntenatalRecord: async (id, data) => {
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
          gender: 'Female',
          date_of_birth: new Date(2000 - (i % 15), (i % 12), i % 28 + 1).toISOString().split('T')[0],
        }));
        resolve(mockPatients);
      }, 300);
    });
  }
};

// Blood type options
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Risk factors options
const riskFactorOptions = [
  'Previous C-section',
  'Multiple gestation',
  'Hypertension',
  'Diabetes',
  'Cardiac disease',
  'Renal disease',
  'Autoimmune disorder',
  'Advanced maternal age',
  'Previous preterm birth',
  'Previous stillbirth',
  'HIV positive',
  'Malnutrition',
  'Smoking',
  'Alcohol use',
  'Substance abuse',
  'Other'
];

// Health facilities
const healthFacilities = [
  'Health Center 1',
  'Health Center 2',
  'Health Center 3',
  'Health Center 4',
  'Health Center 5',
  'General Hospital Uyo',
  'University of Uyo Teaching Hospital',
  'Private Clinic'
];

// Form validation schema
const antenatalValidationSchema = Yup.object({
  // Patient information
  patient_id: Yup.string()
    .required('Patient ID is required'),
  patient_name: Yup.string()
    .required('Patient name is required'),
  date_of_birth: Yup.date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .required('Date of birth is required'),
  age: Yup.number()
    .min(10, 'Age must be at least 10')
    .max(60, 'Age must be at most 60')
    .required('Age is required'),
  phone_number: Yup.string()
    .matches(/^[0-9+\s-]{8,15}$/, 'Invalid phone number format')
    .required('Phone number is required'),
  address: Yup.string()
    .required('Address is required'),
  
  // Pregnancy information
  lmp: Yup.date()
    .max(new Date(), 'Last menstrual period cannot be in the future')
    .required('Last menstrual period is required'),
  gravida: Yup.number()
    .min(1, 'Gravida must be at least 1')
    .required('Gravida is required'),
  parity: Yup.number()
    .min(0, 'Parity must be at least 0')
    .required('Parity is required'),
  
  // Medical information
  blood_type: Yup.string()
    .required('Blood type is required'),
  height_cm: Yup.number()
    .min(100, 'Height must be at least 100 cm')
    .max(250, 'Height must be at most 250 cm')
    .required('Height is required'),
  weight_kg: Yup.number()
    .min(30, 'Weight must be at least 30 kg')
    .max(200, 'Weight must be at most 200 kg')
    .required('Weight is required'),
  
  // Emergency contact
  husband_name: Yup.string()
    .nullable(),
  emergency_contact_name: Yup.string()
    .required('Emergency contact name is required'),
  emergency_contact_phone: Yup.string()
    .matches(/^[0-9+\s-]{8,15}$/, 'Invalid phone number format')
    .required('Emergency contact phone is required'),
  emergency_contact_relationship: Yup.string()
    .required('Relationship is required'),
  
  // Other fields
  status: Yup.string()
    .required('Status is required')
});

// Initial values
const initialAntenatalValues = {
  // Patient information
  patient_id: '',
  patient_name: '',
  date_of_birth: null,
  age: '',
  phone_number: '',
  address: '',
  
  // Pregnancy information
  lmp: new Date(),
  edd: null,
  gestational_age: '',
  gravida: 1,
  parity: 0,
  risk_level: 'low',
  risk_factors: [],
  
  // Medical information
  blood_type: '',
  height_cm: '',
  weight_kg: '',
  bmi: '',
  blood_pressure: '',
  hiv_status: 'Unknown',
  syphilis_status: 'Unknown',
  hepatitis_b_status: 'Unknown',
  hemoglobin: '',
  urinalysis: 'Normal',
  
  // Preventive measures
  tetanus_vaccination: 'Incomplete',
  malaria_prophylaxis: 'Not received',
  iron_folate_supplementation: 'Not received',
  
  // Emergency contact
  husband_name: '',
  husband_contact: '',
  nearest_health_facility: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: '',
  
  // Additional information
  registration_date: new Date(),
  next_appointment: addDays(new Date(), 14),
  status: 'active',
  notes: ''
};

// Antenatal Form Component
const AntenatalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();
  
  // State
  const [antenatalRecord, setAntenatalRecord] = useState(null);
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

  // Steps for the form
  const steps = ['Patient Information', 'Pregnancy Details', 'Medical Information', 'Emergency Contacts'];

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      // Format date values
      const formattedValues = {
        ...values,
        date_of_birth: values.date_of_birth ? format(new Date(values.date_of_birth), 'yyyy-MM-dd') : null,
        lmp: format(new Date(values.lmp), 'yyyy-MM-dd'),
        edd: values.edd ? format(new Date(values.edd), 'yyyy-MM-dd') : null,
        registration_date: format(new Date(values.registration_date), 'yyyy-MM-dd'),
        next_appointment: format(new Date(values.next_appointment), 'yyyy-MM-dd')
      };

      if (isEditMode) {
        // Update existing antenatal record
        await execute(
          antenatalService.updateAntenatalRecord,
          [id, formattedValues],
          (response) => {
            setAlertMessage('Antenatal record updated successfully');
            setAlertSeverity('success');
            setAlertOpen(true);
            
            // Navigate back to antenatal detail after a short delay
            setTimeout(() => {
              navigate(`/antenatal/${id}`);
            }, 1500);
          }
        );
      } else {
        // Create new antenatal record
        await execute(
          antenatalService.createAntenatalRecord,
          [formattedValues],
          (response) => {
            setAlertMessage('Antenatal record registered successfully');
            setAlertSeverity('success');
            setAlertOpen(true);
            
            // Navigate to the new record's detail page
            setTimeout(() => {
              navigate(`/antenatal/${response.id}`);
            }, 1500);
          }
        );
      }
    } catch (err) {
      setAlertMessage('Failed to save antenatal record information');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  // Initialize formik
  const formik = useFormik({
    initialValues: initialAntenatalValues,
    validationSchema: antenatalValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true
  });

  // Calculate BMI when weight or height changes
  useEffect(() => {
    if (formik.values.weight_kg && formik.values.height_cm) {
      const heightInMeters = formik.values.height_cm / 100;
      const bmi = (formik.values.weight_kg / (heightInMeters * heightInMeters)).toFixed(1);
      
      formik.setFieldValue('bmi', bmi, false);
    }
  }, [formik.values.weight_kg, formik.values.height_cm]);

  // Calculate EDD when LMP changes
  useEffect(() => {
    if (formik.values.lmp) {
      // EDD = LMP + 280 days
      const edd = new Date(formik.values.lmp);
      edd.setDate(edd.getDate() + 280);
      
      formik.setFieldValue('edd', edd, false);
      
      // Calculate gestational age
      const today = new Date();
      const gestationalAge = differenceInWeeks(today, new Date(formik.values.lmp));
      
      if (gestationalAge >= 0) {
        formik.setFieldValue('gestational_age', gestationalAge, false);
      } else {
        formik.setFieldValue('gestational_age', 0, false);
      }
    }
  }, [formik.values.lmp]);

  // Update risk level when risk factors change
  useEffect(() => {
    const highRiskFactors = [
      'Previous C-section',
      'Multiple gestation',
      'Hypertension',
      'Diabetes',
      'Cardiac disease',
      'Renal disease',
      'Autoimmune disorder',
      'Previous stillbirth',
      'HIV positive'
    ];
    
    const mediumRiskFactors = [
      'Advanced maternal age',
      'Previous preterm birth',
      'Malnutrition',
      'Smoking',
      'Alcohol use',
      'Substance abuse'
    ];
    
    if (formik.values.risk_factors.some(factor => highRiskFactors.includes(factor))) {
      formik.setFieldValue('risk_level', 'high', false);
    } else if (formik.values.risk_factors.some(factor => mediumRiskFactors.includes(factor))) {
      formik.setFieldValue('risk_level', 'medium', false);
    } else {
      formik.setFieldValue('risk_level', 'low', false);
    }
  }, [formik.values.risk_factors]);

  // Load antenatal data if in edit mode
  useEffect(() => {
    const loadAntenatalRecord = async () => {
      if (id && id !== 'new') {
        setIsEditMode(true);
        
        await execute(
          antenatalService.getAntenatalRecordById,
          [id],
          (response) => {
            // Transform API response to form values format
            const antenatalData = {
              ...initialAntenatalValues,
              ...response,
              date_of_birth: response.date_of_birth ? new Date(response.date_of_birth) : null,
              lmp: response.lmp ? new Date(response.lmp) : new Date(),
              edd: response.edd ? new Date(response.edd) : null,
              registration_date: response.registration_date ? new Date(response.registration_date) : new Date(),
              next_appointment: response.next_appointment ? new Date(response.next_appointment) : addDays(new Date(), 14)
            };
            
            setAntenatalRecord(antenatalData);
            
            // Set formik values
            Object.keys(antenatalData).forEach(key => {
              formik.setFieldValue(key, antenatalData[key], false);
            });
          }
        );
      }
    };
    
    loadAntenatalRecord();
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
      navigate(`/antenatal/${id}`);
    } else {
      navigate('/antenatal');
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
      const results = await antenatalService.searchPatients(patientSearchTerm);
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
    
    // Calculate age from DOB
    const dob = new Date(patient.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    formik.setFieldValue('date_of_birth', new Date(patient.date_of_birth), false);
    formik.setFieldValue('age', age, false);
    
    setPatientSearchOpen(false);
    setPatientSearchTerm('');
    setSearchResults([]);
  };

  // Handle risk factor selection
  const handleRiskFactorChange = (event, factor) => {
    const isChecked = event.target.checked;
    const currentFactors = [...formik.values.risk_factors];
    
    if (isChecked) {
      // Add to risk factors if not already present
      if (!currentFactors.includes(factor)) {
        formik.setFieldValue('risk_factors', [...currentFactors, factor], false);
      }
    } else {
      // Remove from risk factors
      formik.setFieldValue(
        'risk_factors', 
        currentFactors.filter(f => f !== factor),
        false
      );
    }
  };

  // Update age when date of birth changes
  const handleDateOfBirthChange = (date) => {
    formik.setFieldValue('date_of_birth', date);
    
    if (date) {
      // Calculate age from DOB
      const dob = new Date(date);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      formik.setFieldValue('age', age);
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
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Birth *"
                  value={formik.values.date_of_birth}
                  onChange={handleDateOfBirthChange}
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
                id="age"
                name="age"
                label="Age *"
                type="number"
                value={formik.values.age}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.age && Boolean(formik.errors.age)}
                helperText={
                  (formik.touched.age && formik.errors.age) ||
                  (formik.values.date_of_birth ? 'Calculated from date of birth' : '')
                }
                InputProps={{
                  readOnly: Boolean(formik.values.date_of_birth),
                  inputProps: { min: 10, max: 60 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="phone_number"
                name="phone_number"
                label="Phone Number *"
                value={formik.values.phone_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
                helperText={formik.touched.phone_number && formik.errors.phone_number}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="blood-type-label">Blood Type *</InputLabel>
                <Select
                  labelId="blood-type-label"
                  id="blood_type"
                  name="blood_type"
                  label="Blood Type *"
                  value={formik.values.blood_type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.blood_type && Boolean(formik.errors.blood_type)}
                >
                  <MenuItem value=""><em>Select Blood Type</em></MenuItem>
                  {bloodTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
                {formik.touched.blood_type && formik.errors.blood_type && (
                  <FormHelperText error>{formik.errors.blood_type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="address"
                name="address"
                label="Address *"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        );
      
      case 1: // Pregnancy Details
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Pregnancy Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Last Menstrual Period (LMP) *"
                  value={formik.values.lmp}
                  onChange={(date) => formik.setFieldValue('lmp', date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      name="lmp"
                      onBlur={formik.handleBlur}
                      error={formik.touched.lmp && Boolean(formik.errors.lmp)}
                      helperText={formik.touched.lmp && formik.errors.lmp}
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
                  label="Expected Delivery Date (EDD)"
                  value={formik.values.edd}
                  readOnly
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      name="edd"
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position="end">
                            <DateRangeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Calculated as LMP + 280 days"
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="gestational_age"
                name="gestational_age"
                label="Gestational Age (Weeks)"
                type="number"
                value={formik.values.gestational_age}
                InputProps={{
                  readOnly: true,
                }}
                helperText="Calculated from LMP to current date"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Pregnancy Status *</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  label="Pregnancy Status *"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="transferred">Transferred</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText error>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="gravida"
                name="gravida"
                label="Gravida (Total Pregnancies) *"
                type="number"
                value={formik.values.gravida}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.gravida && Boolean(formik.errors.gravida)}
                helperText={formik.touched.gravida && formik.errors.gravida}
                InputProps={{
                  inputProps: { min: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="parity"
                name="parity"
                label="Parity (Previous Births) *"
                type="number"
                value={formik.values.parity}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.parity && Boolean(formik.errors.parity)}
                helperText={formik.touched.parity && formik.errors.parity}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Risk Assessment
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="risk-level-label">Risk Level</InputLabel>
                <Select
                  labelId="risk-level-label"
                  id="risk_level"
                  name="risk_level"
                  label="Risk Level"
                  value={formik.values.risk_level}
                  InputProps={{
                    readOnly: true,
                  }}
                >
                  <MenuItem value="low">Low Risk</MenuItem>
                  <MenuItem value="medium">Medium Risk</MenuItem>
                  <MenuItem value="high">High Risk</MenuItem>
                </Select>
                <FormHelperText>Automatically determined based on risk factors</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={8}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">Risk Factors</FormLabel>
                <FormGroup row>
                  {riskFactorOptions.map((factor) => (
                    <FormControlLabel
                      key={factor}
                      control={
                        <Checkbox
                          checked={formik.values.risk_factors.includes(factor)}
                          onChange={(e) => handleRiskFactorChange(e, factor)}
                          name={`risk_factor_${factor}`}
                        />
                      }
                      label={factor}
                      sx={{ width: { xs: '100%', sm: '50%', md: '33%' } }}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        );
      
      case 2: // Medical Information
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Physical Measurements
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="height_cm"
                name="height_cm"
                label="Height (cm) *"
                type="number"
                value={formik.values.height_cm}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.height_cm && Boolean(formik.errors.height_cm)}
                helperText={formik.touched.height_cm && formik.errors.height_cm}
                InputProps={{
                  inputProps: { min: 100, max: 250 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="weight_kg"
                name="weight_kg"
                label="Weight (kg) *"
                type="number"
                value={formik.values.weight_kg}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.weight_kg && Boolean(formik.errors.weight_kg)}
                helperText={formik.touched.weight_kg && formik.errors.weight_kg}
                InputProps={{
                  inputProps: { min: 30, max: 200, step: 0.1 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="bmi"
                name="bmi"
                label="BMI"
                value={formik.values.bmi}
                InputProps={{
                  readOnly: true,
                }}
                helperText="Calculated from height and weight"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="blood_pressure"
                name="blood_pressure"
                label="Blood Pressure (mmHg)"
                placeholder="e.g. 120/80"
                value={formik.values.blood_pressure}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="hemoglobin"
                name="hemoglobin"
                label="Hemoglobin (g/dL)"
                type="number"
                value={formik.values.hemoglobin}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                InputProps={{
                  inputProps: { min: 0, max: 20, step: 0.1 }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Laboratory Tests
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="hiv-status-label">HIV Status</InputLabel>
                <Select
                  labelId="hiv-status-label"
                  id="hiv_status"
                  name="hiv_status"
                  label="HIV Status"
                  value={formik.values.hiv_status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="Unknown">Unknown</MenuItem>
                  <MenuItem value="Negative">Negative</MenuItem>
                  <MenuItem value="Positive">Positive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="syphilis-status-label">Syphilis Status</InputLabel>
                <Select
                  labelId="syphilis-status-label"
                  id="syphilis_status"
                  name="syphilis_status"
                  label="Syphilis Status"
                  value={formik.values.syphilis_status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="Unknown">Unknown</MenuItem>
                  <MenuItem value="Negative">Negative</MenuItem>
                  <MenuItem value="Positive">Positive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="hepatitis-b-status-label">Hepatitis B Status</InputLabel>
                <Select
                  labelId="hepatitis-b-status-label"
                  id="hepatitis_b_status"
                  name="hepatitis_b_status"
                  label="Hepatitis B Status"
                  value={formik.values.hepatitis_b_status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="Unknown">Unknown</MenuItem>
                  <MenuItem value="Negative">Negative</MenuItem>
                  <MenuItem value="Positive">Positive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="urinalysis-label">Urinalysis</InputLabel>
                <Select
                  labelId="urinalysis-label"
                  id="urinalysis"
                  name="urinalysis"
                  label="Urinalysis"
                  value={formik.values.urinalysis}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="Normal">Normal</MenuItem>
                  <MenuItem value="Protein +">Protein +</MenuItem>
                  <MenuItem value="Protein ++">Protein ++</MenuItem>
                  <MenuItem value="Glucose +">Glucose +</MenuItem>
                  <MenuItem value="Glucose ++">Glucose ++</MenuItem>
                  <MenuItem value="Protein and Glucose">Protein and Glucose</MenuItem>
                  <MenuItem value="Abnormal">Other Abnormal Result</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Preventive Measures
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="tetanus-vaccination-label">Tetanus Vaccination</InputLabel>
                <Select
                  labelId="tetanus-vaccination-label"
                  id="tetanus_vaccination"
                  name="tetanus_vaccination"
                  label="Tetanus Vaccination"
                  value={formik.values.tetanus_vaccination}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="Complete">Complete</MenuItem>
                  <MenuItem value="Incomplete">Incomplete</MenuItem>
                  <MenuItem value="Not received">Not received</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="malaria-prophylaxis-label">Malaria Prophylaxis</InputLabel>
                <Select
                  labelId="malaria-prophylaxis-label"
                  id="malaria_prophylaxis"
                  name="malaria_prophylaxis"
                  label="Malaria Prophylaxis"
                  value={formik.values.malaria_prophylaxis}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="Received">Received</MenuItem>
                  <MenuItem value="Not received">Not received</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="iron-folate-label">Iron/Folate Supplementation</InputLabel>
                <Select
                  labelId="iron-folate-label"
                  id="iron_folate_supplementation"
                  name="iron_folate_supplementation"
                  label="Iron/Folate Supplementation"
                  value={formik.values.iron_folate_supplementation}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="Received">Received</MenuItem>
                  <MenuItem value="Not received">Not received</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      
      case 3: // Emergency Contacts
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Husband/Partner Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="husband_name"
                name="husband_name"
                label="Husband/Partner Name"
                value={formik.values.husband_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="husband_contact"
                name="husband_contact"
                label="Husband/Partner Contact"
                value={formik.values.husband_contact}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Emergency Contact
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="emergency_contact_name"
                name="emergency_contact_name"
                label="Emergency Contact Name *"
                value={formik.values.emergency_contact_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.emergency_contact_name && Boolean(formik.errors.emergency_contact_name)}
                helperText={formik.touched.emergency_contact_name && formik.errors.emergency_contact_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="emergency_contact_phone"
                name="emergency_contact_phone"
                label="Emergency Contact Phone *"
                value={formik.values.emergency_contact_phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.emergency_contact_phone && Boolean(formik.errors.emergency_contact_phone)}
                helperText={formik.touched.emergency_contact_phone && formik.errors.emergency_contact_phone}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="emergency_contact_relationship"
                name="emergency_contact_relationship"
                label="Relationship to Patient *"
                value={formik.values.emergency_contact_relationship}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.emergency_contact_relationship && Boolean(formik.errors.emergency_contact_relationship)}
                helperText={formik.touched.emergency_contact_relationship && formik.errors.emergency_contact_relationship}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Healthcare Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Autocomplete
                id="nearest_health_facility"
                options={healthFacilities}
                value={formik.values.nearest_health_facility}
                onChange={(event, newValue) => {
                  formik.setFieldValue('nearest_health_facility', newValue);
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Nearest Health Facility" 
                    fullWidth
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Next Appointment Date"
                  value={formik.values.next_appointment}
                  onChange={(date) => formik.setFieldValue('next_appointment', date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      name="next_appointment"
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
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Registration Date"
                  value={formik.values.registration_date}
                  onChange={(date) => formik.setFieldValue('registration_date', date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      name="registration_date"
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
        formik.values.age &&
        formik.values.phone_number &&
        formik.values.address &&
        !formik.errors.patient_id &&
        !formik.errors.patient_name &&
        !formik.errors.age &&
        !formik.errors.phone_number &&
        !formik.errors.address
      );
    } else if (step === 1) {
      return (
        formik.values.lmp &&
        formik.values.gravida &&
        formik.values.parity &&
        !formik.errors.lmp &&
        !formik.errors.gravida &&
        !formik.errors.parity
      );
    } else if (step === 2) {
      return (
        formik.values.height_cm &&
        formik.values.weight_kg &&
        !formik.errors.height_cm &&
        !formik.errors.weight_kg
      );
    }
    
    // In step 3, check emergency contact information
    return (
      formik.values.emergency_contact_name &&
      formik.values.emergency_contact_phone &&
      formik.values.emergency_contact_relationship &&
      !formik.errors.emergency_contact_name &&
      !formik.errors.emergency_contact_phone &&
      !formik.errors.emergency_contact_relationship
    );
  };

  // Determine if the form can be submitted
  const canSubmit = () => {
    return (
      formik.values.patient_id &&
      formik.values.patient_name &&
      formik.values.lmp &&
      formik.values.height_cm &&
      formik.values.weight_kg &&
      formik.values.emergency_contact_name &&
      formik.values.emergency_contact_phone &&
      Object.keys(formik.errors).length === 0
    );
  };

  return (
    <MainLayout 
      title={isEditMode ? "Edit Antenatal Record" : "Register New Antenatal Patient"}
      breadcrumbs={[
        { name: 'Antenatal', path: '/antenatal' },
        { name: isEditMode ? 'Edit Antenatal Record' : 'Register New Antenatal Patient', active: true }
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
            {isEditMode ? 'Edit Antenatal Record' : 'Register New Antenatal Patient'}
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
                    {isEditMode ? 'Update Record' : 'Register Patient'}
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
              No female patients found matching your search criteria.
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

export default AntenatalForm;