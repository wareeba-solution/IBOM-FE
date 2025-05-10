// src/pages/diseases/DiseaseForm.js
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
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Autocomplete,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';

// Mock disease service - replace with actual service when available
const diseaseService = {
  getDiseaseById: async (id) => {
    // Simulate API call for edit mode
    return new Promise((resolve) => {
      setTimeout(() => {
        if (id) {
          const reportDate = new Date(2023, (parseInt(id) % 12), parseInt(id) % 28 + 1);
          const onset = new Date(reportDate);
          onset.setDate(onset.getDate() - (parseInt(id) % 7 + 1));
          
          const diseaseTypes = [
            'Malaria',
            'Tuberculosis',
            'HIV/AIDS',
            'Cholera',
            'Typhoid',
            'Measles',
            'Meningitis',
            'Hepatitis',
            'Yellow Fever',
            'Lassa Fever',
            'Ebola',
            'COVID-19',
            'Other'
          ];
          
          const mockDisease = {
            id,
            case_id: `CDCS${10000 + parseInt(id)}`,
            patient_id: `PT${5000 + parseInt(id)}`,
            patient_name: `${parseInt(id) % 2 === 0 ? 'John' : 'Jane'} ${['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller'][parseInt(id) % 7]} ${id}`,
            disease_type: diseaseTypes[parseInt(id) % diseaseTypes.length],
            onset_date: onset.toISOString().split('T')[0],
            report_date: reportDate.toISOString().split('T')[0],
            location: `${['Uyo', 'Ikot Ekpene', 'Eket', 'Oron', 'Abak'][parseInt(id) % 5]}, Akwa Ibom`,
            status: parseInt(id) % 10 === 0 ? 'suspected' : (parseInt(id) % 10 === 1 ? 'probable' : (parseInt(id) % 5 === 0 ? 'confirmed' : 'ruled_out')),
            severity: parseInt(id) % 10 === 0 ? 'severe' : (parseInt(id) % 5 === 0 ? 'moderate' : 'mild'),
            outcome: parseInt(id) % 20 === 0 ? 'death' : (parseInt(id) % 10 === 0 ? 'hospitalized' : (parseInt(id) % 5 === 0 ? 'recovered' : 'under_treatment')),
            is_outbreak: parseInt(id) % 15 === 0,
            reported_by: `Staff ${parseInt(id) % 20 + 1}`,
            note: parseInt(id) % 8 === 0 ? 'Patient has travel history to affected region.' : '',
            symptoms: [
              'Fever',
              'Cough',
              'Headache',
              'Fatigue',
              'Body Aches',
              'Diarrhea',
              'Vomiting',
              'Rash',
              'Sore Throat'
            ].filter((_, i) => parseInt(id) % (i + 2) === 0),
            diagnosis_notes: parseInt(id) % 8 === 0 
              ? 'Patient presented with severe symptoms. Initial rapid diagnostic test positive. Confirmatory tests ordered.' 
              : 'Standard diagnostic protocol followed.',
            treatment: parseInt(id) % 20 === 0 
              ? 'No treatment administered due to patient death.' 
              : (parseInt(id) % 10 === 0 
                ? 'Hospitalized for intensive care and monitoring. IV fluids and antibiotics administered.' 
                : (parseInt(id) % 5 === 0 
                  ? 'Prescription medications and home care instructions provided. Follow-up scheduled.' 
                  : 'Medication prescribed. Patient advised to rest and maintain hydration.')),
            hospital_name: parseInt(id) % 10 === 0 ? `${['General', 'University', 'Community', 'Memorial', 'Regional'][parseInt(id) % 5]} Hospital` : '',
            admission_date: parseInt(id) % 10 === 0 ? reportDate.toISOString().split('T')[0] : '',
            discharge_date: parseInt(id) % 20 === 0 ? '' : (parseInt(id) % 10 === 0 ? new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate() + (parseInt(id) % 10 + 1)).toISOString().split('T')[0] : ''),
            lab_test_type: diseaseTypes[parseInt(id) % diseaseTypes.length] === 'Malaria' 
              ? 'Malaria Rapid Diagnostic Test' 
              : (diseaseTypes[parseInt(id) % diseaseTypes.length] === 'COVID-19' 
                ? 'COVID-19 PCR Test' 
                : 'Blood Culture'),
            lab_result: parseInt(id) % 5 === 0 ? 'Positive' : (parseInt(id) % 5 === 1 ? 'Negative' : 'Inconclusive'),
            lab_notes: parseInt(id) % 8 === 0 ? 'Sample quality was poor. Recommend retest.' : ''
          };
          resolve(mockDisease);
        } else {
          // New case with default values
          resolve({
            id: '',
            case_id: '',
            patient_id: '',
            patient_name: '',
            disease_type: '',
            onset_date: '',
            report_date: new Date().toISOString().split('T')[0],
            location: '',
            status: 'suspected',
            severity: 'moderate',
            outcome: 'under_treatment',
            is_outbreak: false,
            reported_by: '',
            note: '',
            symptoms: [],
            diagnosis_notes: '',
            treatment: '',
            hospital_name: '',
            admission_date: '',
            discharge_date: '',
            lab_test_type: '',
            lab_result: '',
            lab_notes: ''
          });
        }
      }, 500);
    });
  },
  saveDiseaseCase: async (diseaseData) => {
    // Simulate API call for save/update
    return new Promise((resolve) => {
      setTimeout(() => {
        const newId = diseaseData.id || Math.floor(Math.random() * 1000) + 50;
        resolve({
          success: true,
          id: newId,
          case_id: diseaseData.case_id || `CDCS${10000 + newId}`
        });
      }, 700);
    });
  },
  searchPatients: async (query) => {
    // Simulate patient search API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockPatients = Array.from({ length: 5 }, (_, i) => ({
          id: `PT${5000 + i}`,
          name: `${i % 2 === 0 ? 'John' : 'Jane'} ${['Doe', 'Smith', 'Johnson', 'Williams', 'Brown'][i % 5]} ${query || ''}`,
          age: 20 + i * 5,
          gender: i % 2 === 0 ? 'Male' : 'Female',
        }));
        resolve(mockPatients);
      }, 300);
    });
  },
};

// Common disease types
const diseaseTypes = [
  'Malaria',
  'Tuberculosis',
  'HIV/AIDS',
  'Cholera',
  'Typhoid',
  'Measles',
  'Meningitis',
  'Hepatitis',
  'Yellow Fever',
  'Lassa Fever',
  'Ebola',
  'COVID-19',
  'Other'
];

// Common symptoms
const commonSymptoms = [
  'Fever',
  'Cough',
  'Headache',
  'Fatigue',
  'Body Aches',
  'Diarrhea',
  'Vomiting',
  'Nausea',
  'Rash',
  'Sore Throat',
  'Shortness of Breath',
  'Chills',
  'Loss of Taste/Smell',
  'Congestion',
  'Abdominal Pain',
  'Jaundice',
  'Bleeding',
  'Confusion',
  'Seizures',
  'Swelling'
];

// Laboratory test types
const labTestTypes = [
  'Malaria Rapid Diagnostic Test',
  'COVID-19 PCR Test',
  'COVID-19 Antigen Test',
  'Blood Culture',
  'Complete Blood Count',
  'Liver Function Test',
  'Tuberculosis Skin Test',
  'HIV Test',
  'Hepatitis Panel',
  'Stool Culture',
  'Urinalysis',
  'Chest X-Ray',
  'Other'
];

// Status options
const statusOptions = [
  { value: 'suspected', label: 'Suspected' },
  { value: 'probable', label: 'Probable' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'ruled_out', label: 'Ruled Out' }
];

// Severity options
const severityOptions = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' }
];

// Outcome options
const outcomeOptions = [
  { value: 'under_treatment', label: 'Under Treatment' },
  { value: 'recovered', label: 'Recovered' },
  { value: 'hospitalized', label: 'Hospitalized' },
  { value: 'death', label: 'Death' }
];

// Form validation schema
const validationSchema = Yup.object({
  patient_id: Yup.string().required('Patient ID is required'),
  patient_name: Yup.string().required('Patient name is required'),
  disease_type: Yup.string().required('Disease type is required'),
  onset_date: Yup.date().nullable().required('Date of onset is required'),
  report_date: Yup.date().nullable().required('Report date is required'),
  location: Yup.string().required('Location is required'),
  status: Yup.string().required('Status is required'),
  severity: Yup.string().required('Severity is required'),
  outcome: Yup.string().required('Outcome is required'),
  reported_by: Yup.string().required('Reporter information is required'),
  symptoms: Yup.array().min(1, 'At least one symptom must be selected'),
  lab_test_type: Yup.string().when('status', {
    is: (status) => status === 'confirmed' || status === 'ruled_out',
    then: () => Yup.string().required('Lab test type is required for confirmed or ruled out cases')
  }),
  lab_result: Yup.string().when('lab_test_type', {
    is: (type) => !!type,
    then: () => Yup.string().required('Lab result is required when a test is performed')
  }),
  hospital_name: Yup.string().when('outcome', {
    is: 'hospitalized',
    then: () => Yup.string().required('Hospital name is required for hospitalized patients')
  }),
  admission_date: Yup.date().nullable().when('outcome', {
    is: 'hospitalized',
    then: () => Yup.date().nullable().required('Admission date is required for hospitalized patients')
  }),
  treatment: Yup.string().required('Treatment information is required'),
});

// Form steps
const steps = ['Patient Information', 'Disease Details', 'Clinical Information'];

// Main Disease Form Component
const DiseaseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [activeStep, setActiveStep] = useState(0);
  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);
  const [patientSelectOpen, setPatientSelectOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [savedCaseId, setSavedCaseId] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      id: '',
      case_id: '',
      patient_id: '',
      patient_name: '',
      disease_type: '',
      onset_date: null,
      report_date: new Date(),
      location: '',
      status: 'suspected',
      severity: 'moderate',
      outcome: 'under_treatment',
      is_outbreak: false,
      reported_by: '',
      note: '',
      symptoms: [],
      diagnosis_notes: '',
      treatment: '',
      hospital_name: '',
      admission_date: null,
      discharge_date: null,
      lab_test_type: '',
      lab_result: '',
      lab_notes: ''
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  // Load disease case data when editing
  useEffect(() => {
    const loadDiseaseCase = async () => {
      await execute(
        diseaseService.getDiseaseById,
        [id],
        (response) => {
          const formattedData = {
            ...response,
            onset_date: response.onset_date ? parseISO(response.onset_date) : null,
            report_date: response.report_date ? parseISO(response.report_date) : new Date(),
            admission_date: response.admission_date ? parseISO(response.admission_date) : null,
            discharge_date: response.discharge_date ? parseISO(response.discharge_date) : null,
          };
          formik.setValues(formattedData);
        }
      );
    };
    
    loadDiseaseCase();
  }, [id]);

  // Handle patient search
  useEffect(() => {
    if (patientSearchQuery) {
      const searchPatients = async () => {
        setIsSearchingPatient(true);
        try {
          const results = await diseaseService.searchPatients(patientSearchQuery);
          setPatientSearchResults(results);
        } catch (error) {
          console.error('Error searching patients:', error);
        } finally {
          setIsSearchingPatient(false);
        }
      };
      
      const debounce = setTimeout(() => {
        searchPatients();
      }, 300);
      
      return () => clearTimeout(debounce);
    } else {
      setPatientSearchResults([]);
    }
  }, [patientSearchQuery]);

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    if (patient) {
      formik.setFieldValue('patient_id', patient.id);
      formik.setFieldValue('patient_name', patient.name);
    }
    setPatientSelectOpen(false);
  };

  // Form submission handler
  async function handleSubmit(values) {
    try {
      await execute(
        diseaseService.saveDiseaseCase,
        [values],
        (response) => {
          setSavedCaseId(response.case_id);
          setSuccessDialogOpen(true);
        }
      );
    } catch (error) {
      console.error('Error saving disease case:', error);
    }
  }

  // Stepper navigation
  const handleNext = () => {
    let isStepValid = true;
    
    if (activeStep === 0) {
      const fields = ['patient_id', 'patient_name', 'disease_type', 'onset_date', 'report_date', 'location'];
      isStepValid = fields.every(field => !formik.errors[field] && formik.touched[field]);
      
      if (!formik.touched.patient_id) {
        formik.setFieldTouched('patient_id', true);
      }
      if (!formik.touched.patient_name) {
        formik.setFieldTouched('patient_name', true);
      }
      if (!formik.touched.disease_type) {
        formik.setFieldTouched('disease_type', true);
      }
      if (!formik.touched.onset_date) {
        formik.setFieldTouched('onset_date', true);
      }
      if (!formik.touched.report_date) {
        formik.setFieldTouched('report_date', true);
      }
      if (!formik.touched.location) {
        formik.setFieldTouched('location', true);
      }
    } else if (activeStep === 1) {
      const fields = ['status', 'severity', 'outcome', 'reported_by', 'symptoms'];
      isStepValid = fields.every(field => {
        if (field === 'symptoms') {
          return formik.values.symptoms.length > 0;
        }
        return !formik.errors[field] && formik.touched[field];
      });
      
      if (!formik.touched.status) {
        formik.setFieldTouched('status', true);
      }
      if (!formik.touched.severity) {
        formik.setFieldTouched('severity', true);
      }
      if (!formik.touched.outcome) {
        formik.setFieldTouched('outcome', true);
      }
      if (!formik.touched.reported_by) {
        formik.setFieldTouched('reported_by', true);
      }
      if (!formik.touched.symptoms) {
        formik.setFieldTouched('symptoms', true);
      }
    }
    
    if (isStepValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Cancel form handling
  const handleCancelClick = () => {
    if (formik.dirty) {
      setConfirmDialogOpen(true);
    } else {
      navigate('/diseases');
    }
  };

  const handleConfirmCancel = () => {
    setConfirmDialogOpen(false);
    navigate('/diseases');
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    navigate(`/diseases/${id || formik.values.id}`);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    try {
      return format(date, 'MMMM dd, yyyy');
    } catch (error) {
      return '';
    }
  };

  return (
    <MainLayout 
      title={id ? "Edit Disease Case" : "Register New Disease Case"}
      breadcrumbs={[
        { name: 'Diseases', path: '/diseases' },
        { name: id ? 'Edit Case' : 'New Case', active: true }
      ]}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            color="inherit"
            onClick={handleCancelClick}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            {id ? "Edit Disease Case" : "Register New Disease Case"}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ width: '100%', mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          {/* Step 1: Patient Information */}
          {activeStep === 0 && (
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Patient Information" />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="patient_id"
                      name="patient_id"
                      label="Patient ID"
                      value={formik.values.patient_id}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.patient_id && Boolean(formik.errors.patient_id)}
                      helperText={formik.touched.patient_id && formik.errors.patient_id}
                      disabled={loading}
                      required
                      InputProps={{
                        endAdornment: (
                          <IconButton 
                            size="small" 
                            onClick={() => setPatientSelectOpen(true)}
                            disabled={loading}
                          >
                            <SearchIcon />
                          </IconButton>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="patient_name"
                      name="patient_name"
                      label="Patient Name"
                      value={formik.values.patient_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.patient_name && Boolean(formik.errors.patient_name)}
                      helperText={formik.touched.patient_name && formik.errors.patient_name}
                      disabled={loading}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl 
                      fullWidth 
                      error={formik.touched.disease_type && Boolean(formik.errors.disease_type)}
                      disabled={loading}
                      required
                    >
                      <InputLabel id="disease-type-label">Disease Type</InputLabel>
                      <Select
                        labelId="disease-type-label"
                        id="disease_type"
                        name="disease_type"
                        value={formik.values.disease_type}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Disease Type"
                      >
                        {diseaseTypes.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                      {formik.touched.disease_type && formik.errors.disease_type && (
                        <FormHelperText>{formik.errors.disease_type}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="location"
                      name="location"
                      label="Location"
                      value={formik.values.location}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.location && Boolean(formik.errors.location)}
                      helperText={formik.touched.location && formik.errors.location}
                      disabled={loading}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Date of Onset *"
                        value={formik.values.onset_date}
                        onChange={(value) => formik.setFieldValue('onset_date', value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            id="onset_date"
                            name="onset_date"
                            onBlur={formik.handleBlur}
                            error={formik.touched.onset_date && Boolean(formik.errors.onset_date)}
                            helperText={formik.touched.onset_date && formik.errors.onset_date}
                            disabled={loading}
                            required
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Report Date *"
                        value={formik.values.report_date}
                        onChange={(value) => formik.setFieldValue('report_date', value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            id="report_date"
                            name="report_date"
                            onBlur={formik.handleBlur}
                            error={formik.touched.report_date && Boolean(formik.errors.report_date)}
                            helperText={formik.touched.report_date && formik.errors.report_date}
                            disabled={loading}
                            required
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Disease Details */}
          {activeStep === 1 && (
            <>
              <Card sx={{ mb: 3 }}>
                <CardHeader title="Disease Information" />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <FormControl 
                        fullWidth 
                        error={formik.touched.status && Boolean(formik.errors.status)}
                        disabled={loading}
                        required
                      >
                        <InputLabel id="status-label">Disease Status</InputLabel>
                        <Select
                          labelId="status-label"
                          id="status"
                          name="status"
                          value={formik.values.status}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          label="Disease Status"
                        >
                          {statusOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                          ))}
                        </Select>
                        {formik.touched.status && formik.errors.status && (
                          <FormHelperText>{formik.errors.status}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl 
                        fullWidth 
                        error={formik.touched.severity && Boolean(formik.errors.severity)}
                        disabled={loading}
                        required
                      >
                        <InputLabel id="severity-label">Severity</InputLabel>
                        <Select
                          labelId="severity-label"
                          id="severity"
                          name="severity"
                          value={formik.values.severity}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          label="Severity"
                        >
                          {severityOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                          ))}
                        </Select>
                        {formik.touched.severity && formik.errors.severity && (
                          <FormHelperText>{formik.errors.severity}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl 
                        fullWidth 
                        error={formik.touched.outcome && Boolean(formik.errors.outcome)}
                        disabled={loading}
                        required
                      >
                        <InputLabel id="outcome-label">Outcome</InputLabel>
                        <Select
                          labelId="outcome-label"
                          id="outcome"
                          name="outcome"
                          value={formik.values.outcome}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          label="Outcome"
                        >
                          {outcomeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                          ))}
                        </Select>
                        {formik.touched.outcome && formik.errors.outcome && (
                          <FormHelperText>{formik.errors.outcome}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="reported_by"
                        name="reported_by"
                        label="Reported By"
                        value={formik.values.reported_by}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.reported_by && Boolean(formik.errors.reported_by)}
                        helperText={formik.touched.reported_by && formik.errors.reported_by}
                        disabled={loading}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            id="is_outbreak"
                            name="is_outbreak"
                            checked={formik.values.is_outbreak}
                            onChange={formik.handleChange}
                            disabled={loading}
                          />
                        }
                        label="Part of Disease Outbreak"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Autocomplete
                        multiple
                        id="symptoms"
                        options={commonSymptoms}
                        value={formik.values.symptoms}
                        onChange={(_, newValue) => {
                          formik.setFieldValue('symptoms', newValue);
                        }}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              label={option}
                              {...getTagProps({ index })}
                              color="primary"
                              variant="outlined"
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Symptoms *"
                            placeholder="Select symptoms"
                            error={formik.touched.symptoms && Boolean(formik.errors.symptoms)}
                            helperText={formik.touched.symptoms && formik.errors.symptoms}
                            onBlur={() => formik.setFieldTouched('symptoms', true)}
                          />
                        )}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="note"
                        name="note"
                        label="Additional Notes"
                        multiline
                        rows={3}
                        value={formik.values.note}
                        onChange={formik.handleChange}
                        disabled={loading}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </>
          )}

          {/* Step 3: Clinical Information */}
          {activeStep === 2 && (
            <>
              <Card sx={{ mb: 3 }}>
                <CardHeader title="Laboratory Information" />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl 
                        fullWidth 
                        error={formik.touched.lab_test_type && Boolean(formik.errors.lab_test_type)}
                        disabled={loading}
                      >
                        <InputLabel id="lab-test-type-label">Lab Test Type</InputLabel>
                        <Select
                          labelId="lab-test-type-label"
                          id="lab_test_type"
                          name="lab_test_type"
                          value={formik.values.lab_test_type}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          label="Lab Test Type"
                        >
                          <MenuItem value="">None</MenuItem>
                          {labTestTypes.map((type) => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                          ))}
                        </Select>
                        {formik.touched.lab_test_type && formik.errors.lab_test_type && (
                          <FormHelperText>{formik.errors.lab_test_type}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl 
                        fullWidth 
                        error={formik.touched.lab_result && Boolean(formik.errors.lab_result)}
                        disabled={loading || !formik.values.lab_test_type}
                      >
                        <InputLabel id="lab-result-label">Test Result</InputLabel>
                        <Select
                          labelId="lab-result-label"
                          id="lab_result"
                          name="lab_result"
                          value={formik.values.lab_result}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          label="Test Result"
                        >
                          <MenuItem value="">Select Result</MenuItem>
                          <MenuItem value="Positive">Positive</MenuItem>
                          <MenuItem value="Negative">Negative</MenuItem>
                          <MenuItem value="Inconclusive">Inconclusive</MenuItem>
                        </Select>
                        {formik.touched.lab_result && formik.errors.lab_result && (
                          <FormHelperText>{formik.errors.lab_result}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="lab_notes"
                        name="lab_notes"
                        label="Laboratory Notes"
                        multiline
                        rows={2}
                        value={formik.values.lab_notes}
                        onChange={formik.handleChange}
                        disabled={loading || !formik.values.lab_test_type}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card sx={{ mb: 3 }}>
                <CardHeader title="Treatment Information" />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="treatment"
                        name="treatment"
                        label="Treatment Plan"
                        multiline
                        rows={3}
                        value={formik.values.treatment}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.treatment && Boolean(formik.errors.treatment)}
                        helperText={formik.touched.treatment && formik.errors.treatment}
                        disabled={loading}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="diagnosis_notes"
                        name="diagnosis_notes"
                        label="Diagnosis Notes"
                        multiline
                        rows={2}
                        value={formik.values.diagnosis_notes}
                        onChange={formik.handleChange}
                        disabled={loading}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {formik.values.outcome === 'hospitalized' && (
                <Card sx={{ mb: 3 }}>
                  <CardHeader title="Hospitalization Information" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          id="hospital_name"
                          name="hospital_name"
                          label="Hospital Name"
                          value={formik.values.hospital_name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.hospital_name && Boolean(formik.errors.hospital_name)}
                          helperText={formik.touched.hospital_name && formik.errors.hospital_name}
                          disabled={loading}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Admission Date *"
                            value={formik.values.admission_date}
                            onChange={(value) => formik.setFieldValue('admission_date', value)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                fullWidth
                                id="admission_date"
                                name="admission_date"
                                onBlur={formik.handleBlur}
                                error={formik.touched.admission_date && Boolean(formik.errors.admission_date)}
                                helperText={formik.touched.admission_date && formik.errors.admission_date}
                                disabled={loading}
                                required
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Discharge Date"
                            value={formik.values.discharge_date}
                            onChange={(value) => formik.setFieldValue('discharge_date', value)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                fullWidth
                                id="discharge_date"
                                name="discharge_date"
                                disabled={loading}
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleCancelClick}
              startIcon={<CloseIcon />}
              disabled={loading}
            >
              Cancel
            </Button>
            <Box>
              {activeStep > 0 && (
                <Button
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                  disabled={loading}
                >
                  Back
                </Button>
              )}
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Case'}
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>

      {/* Patient Search Dialog */}
      <Dialog
        open={patientSelectOpen}
        onClose={() => setPatientSelectOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Search Patient</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search by name or ID"
            fullWidth
            variant="outlined"
            value={patientSearchQuery}
            onChange={(e) => setPatientSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          {isSearchingPatient ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : patientSearchResults.length > 0 ? (
            <Box>
              {patientSearchResults.map((patient) => (
                <Box 
                  key={patient.id}
                  sx={{ 
                    p: 2, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1,
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                  onClick={() => handlePatientSelect(patient)}
                >
                  <Typography variant="subtitle1">{patient.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {patient.id} | Age: {patient.age} | Gender: {patient.gender}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : patientSearchQuery ? (
            <Alert severity="info">No patients found matching '{patientSearchQuery}'</Alert>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Enter a name or ID to search for patients
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPatientSelectOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => navigate('/patients/new')}
            startIcon={<AddIcon />}
          >
            New Patient
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Cancel Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes. Are you sure you want to leave this page? All changes will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Stay</Button>
          <Button onClick={handleConfirmCancel} color="error" autoFocus>
            Discard
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={handleSuccessDialogClose}
      >
        <DialogTitle>Disease Case Saved</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Disease case {savedCaseId} has been successfully {id ? 'updated' : 'recorded'}.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleSuccessDialogClose} 
            variant="contained" 
            color="primary" 
            autoFocus
          >
            View Case
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default DiseaseForm;