// src/pages/familyPlanning/FamilyPlanningForm.js
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
  RadioGroup,
  Radio,
  Autocomplete,
  FormLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stepper,
  Step,
  StepLabel
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
import { format, parseISO, addMonths, isValid } from 'date-fns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import familyPlanningService from '../../services/familyPlanningService';
import patientService from '../../services/patientService';

// Utility function to calculate age from date of birth
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return '';
  const dob = new Date(dateOfBirth);
  if (isNaN(dob)) return '';
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

// Contraceptive methods
const contraceptiveMethods = [
  'Oral Contraceptives',
  'Injectable Contraceptives',
  'Intrauterine Device (IUD)',
  'Implant',
  'Condoms',
  'Female Sterilization',
  'Male Sterilization',
  'Natural Family Planning',
  'Emergency Contraception',
  'Other'
];

// Visit types
const visitTypes = [
  'Initial Consultation',
  'Follow-up',
  'Method Change',
  'Method Renewal',
  'Side Effects Consultation',
  'Counseling Only',
  'Removal',
  'Other'
];

// Marital status options
const maritalStatusOptions = [
  'Single',
  'Married',
  'Divorced',
  'Widowed'
];

// Education level options
const educationLevelOptions = [
  'None',
  'Primary',
  'Secondary',
  'Tertiary'
];

// Partner support options
const partnerSupportOptions = [
  'Supportive',
  'Unsupportive',
  'Unaware',
  'N/A'
];

// Form validation schema
const validationSchema = Yup.object({
  patient_id: Yup.string().required('Patient ID is required'),
  patient_name: Yup.string().required('Patient name is required'),
  gender: Yup.string().required('Gender is required'),
  age: Yup.number().required('Age is required').min(12, 'Age must be at least 12').max(100, 'Age must be under 100'),
  visit_date: Yup.date().nullable().required('Visit date is required'),
  visit_type: Yup.string().required('Visit type is required'),
  method: Yup.string(), // Remove .required('Method is required')
  location: Yup.string().required('Location is required'),
  provider: Yup.string(), // Remove .required('Provider is required')
  marital_status: Yup.string().required('Marital status is required'),
  quantity_provided: Yup.number().min(0, 'Quantity cannot be negative'),
  counseling_provided: Yup.boolean(),
  counseling_notes: Yup.string().when('counseling_provided', {
    is: true,
    then: () => Yup.string(), // Remove .required('Counseling notes are required when counseling is provided')
    otherwise: () => Yup.string()
  }),
  side_effects: Yup.string().when('has_side_effects', {
    is: true,
    then: () => Yup.string().required('Side effects description is required when side effects are reported')
  }),
});

// Step titles
const steps = [
  'Patient Information',
  'Visit Information',
  'Method and Counseling',
  'Side Effects and Notes'
];

// Family Planning Form Component
const FamilyPlanningForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);
  const [patientSelectOpen, setPatientSelectOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      id: '',
      record_id: '',
      patient_id: '',
      patient_name: '',
      age: '',
      gender: 'Female',
      visit_date: new Date(),
      next_visit_date: addMonths(new Date(), 3),
      visit_type: 'Initial Consultation',
      method: '',
      quantity_provided: 0,
      location: '',
      provider: '',
      has_side_effects: false,
      side_effects: '',
      is_new_acceptor: true,
      parity: 0,
      marital_status: '',
      education_level: '',
      partner_support: '',
      reason_for_visit: '',
      counseling_provided: true,
      counseling_notes: '',
      follow_up_plan: '',
      notes: ''
    },
    validationSchema,
    onSubmit: handleSubmit,
  });


  // Load family planning record when editing
  useEffect(() => {
    const loadRecord = async () => {
      await execute(
        familyPlanningService.getFamilyPlanningClientById,
        [id],        async (response) => {
          
          // Map API response to form fields
          const clientData = response.data || response;
          
          // Get patient details - handle nested patient object or fetch separately
          let patientData = {};
          let patientName = 'Unknown Client';
          
          // Check if patient data is nested in the response
          if (clientData.patient) {
            const patient = clientData.patient;
            patientName = [patient.firstName, patient.lastName, patient.otherNames]
              .filter(name => name && name.trim()) // Remove empty/null values
              .join(' ') || 'Unknown Client';
            
            patientData = {
              patient_name: patientName,
              age: patient.age || calculateAge(patient.dateOfBirth),
              gender: patient.gender
            };
          } else if (clientData.patientId && patientService) {
            // Fetch patient data separately
            try {
              const patient = await patientService.getPatientById(clientData.patientId);
              if (patient) {
                patientName = [patient.firstName, patient.lastName, patient.otherNames]
                  .filter(name => name && name.trim()) // Remove empty/null values
                  .join(' ') || 'Unknown Client';
                
                patientData = {
                  patient_name: patientName,
                  age: patient.age || calculateAge(patient.dateOfBirth),
                  gender: patient.gender
                };
              }
            } catch (error) {
              console.warn('Could not load patient data:', error);
              patientName = `Client ${clientData.patientId ? clientData.patientId.substring(0, 8) : 'Unknown'}`;
            }
          }
          
          // Parse dates safely
          const parseDate = (dateValue) => {
            if (!dateValue) return new Date();
            try {
              const parsed = parseISO(dateValue);
              return isValid(parsed) ? parsed : new Date();
            } catch (error) {
              console.warn('Invalid date:', dateValue);
              return new Date();
            }
          };

          // Map the API data to form structure
          const formattedData = {
            id: clientData.id,
            record_id: `FPC${clientData.id ? clientData.id.substring(0, 8) : ''}`,
            patient_id: clientData.patientId,
            patient_name: patientName, // Use the properly formatted name
            age: patientData.age || '',
            gender: patientData.gender || 'Female',
            
            // Use current date for visit_date since it's not in the client data
            visit_date: new Date(),
            next_visit_date: clientData.nextAppointment ? parseDate(clientData.nextAppointment) : addMonths(new Date(), 3),
            
            // Map client data to form fields
            visit_type: 'Follow-up',
            method: '',
            quantity_provided: 0,
            location: clientData.facility?.name || '',
            provider: '',
            
            // Client information
            marital_status: clientData.maritalStatus || '',
            education_level: clientData.educationLevel || '',
            parity: clientData.numberOfChildren || 0,
            
            // Health information
            has_side_effects: false,
            side_effects: '',
            is_new_acceptor: clientData.clientType === 'New Acceptor',
            
            // Contact and notes
            partner_support: '',
            reason_for_visit: 'Routine follow-up',
            counseling_provided: true,
            counseling_notes: clientData.notes || '',
            follow_up_plan: '',
            notes: clientData.medicalHistory || ''          };
          
          formik.setValues(formattedData);
        }
      );
    };
    
    if (id) {
      loadRecord();
    }
  }, [id, execute]);

  // Handle patient search
  useEffect(() => {
    const searchPatients = async () => {
      if (patientSearchQuery.length >= 2) {
        try {
          const results = await patientService.searchPatients(patientSearchQuery);
          const formattedResults = results.map(patient => {
            // Properly format patient name
            const name = [patient.firstName, patient.lastName, patient.otherNames]
              .filter(name => name && name.trim())
              .join(' ') || 'Unknown Patient';
            
            return {
              id: patient.id,
              name: name,
              age: patient.age || calculateAge(patient.dateOfBirth),
              gender: patient.gender,
              phone: patient.phoneNumber
            };
          });
          setPatientSearchResults(formattedResults);
        } catch (error) {
          console.error('Error searching patients:', error);
          setPatientSearchResults([]);
        }
      } else {
        setPatientSearchResults([]);
      }
    };
    
    const debounce = setTimeout(() => {
      searchPatients();
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [patientSearchQuery]);

  // Handle patient selection
  const handlePatientSelect = async (patient) => {
    try {
      // Get full patient details
      const fullPatientData = await patientService.getPatientById(patient.id);
      
      // Format the name properly
      const patientName = [fullPatientData.firstName, fullPatientData.lastName, fullPatientData.otherNames]
        .filter(name => name && name.trim())
        .join(' ') || 'Unknown Patient';
    
      formik.setValues({
        ...formik.values,
        patient_id: patient.id,
        patient_name: patientName,
        age: fullPatientData.age || calculateAge(fullPatientData.dateOfBirth),
        gender: fullPatientData.gender,
      });
      
      setPatientSearchQuery('');
      setPatientSearchResults([]);
      setPatientSelectOpen(false);
    } catch (error) {
      console.error('Error loading patient details:', error);
      // Still set basic info even if full details fail
      formik.setValues({
        ...formik.values,
        patient_id: patient.id,
        patient_name: patient.name, // Use the already formatted name from search
        age: patient.age,
        gender: patient.gender,
      });
      
      setPatientSearchQuery('');
      setPatientSearchResults([]);
      setPatientSelectOpen(false);
    }
  };

  // Handle next visit date update based on method
  useEffect(() => {
    if (formik.values.method && formik.values.visit_date) {
      // Ensure visit_date is a valid Date object
      let visitDate = formik.values.visit_date;
      if (!(visitDate instanceof Date) || !isValid(visitDate)) {
        visitDate = new Date();
      }
      
      let months = 3; // Default follow-up period
      
      // Adjust based on method
      switch(formik.values.method) {
        case 'Oral Contraceptives':
          months = 3;
          break;
        case 'Injectable Contraceptives':
          months = 3;
          break;
        case 'Intrauterine Device (IUD)':
          months = 6;
          break;
        case 'Implant':
          months = 12;
          break;
        case 'Condoms':
          months = 3;
          break;
        case 'Female Sterilization':
        case 'Male Sterilization':
          months = 3; // Initial follow-up
          break;
        default:
          months = 3;
      }
      
      // Only update if the field hasn't been manually changed
      if (!formik.touched.next_visit_date || id === undefined) {
        try {
          const nextDate = addMonths(visitDate, months);
          if (isValid(nextDate)) {
            formik.setFieldValue('next_visit_date', nextDate);
          }
        } catch (error) {
          console.warn('Error calculating next visit date:', error);
          // Fallback to 3 months from now
          formik.setFieldValue('next_visit_date', addMonths(new Date(), 3));
        }
      }
    }
  }, [formik.values.method, formik.values.visit_date, id, formik.touched.next_visit_date]);

  // Stepper navigation
  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  // Render each section as a step
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Patient Information" />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
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
                          disabled={loading || !!id} // Disable if editing
                        >
                          <SearchIcon />
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
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
                    disabled={true} // Make uneditable
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: 'gray', // Keep text black when disabled
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl 
                    fullWidth 
                    error={formik.touched.gender && Boolean(formik.errors.gender)}
                    disabled={true}
                    required
                  >
                    <InputLabel id="gender-label">Gender</InputLabel>
                    <Select
                      labelId="gender-label"
                      id="gender"
                      name="gender"
                      value={formik.values.gender}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Gender"
                      disabled={true} // Make uneditable
                    >
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Male">Male</MenuItem>
                    </Select>
                    {formik.touched.gender && formik.errors.gender && (
                      <FormHelperText>{formik.errors.gender}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    id="age"
                    name="age"
                    label="Age"
                    type="number"
                    value={formik.values.age}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.age && Boolean(formik.errors.age)}
                    helperText={formik.touched.age && formik.errors.age}
                    disabled={true} // Make uneditable
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: 'gray',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl 
                    fullWidth 
                    error={formik.touched.marital_status && Boolean(formik.errors.marital_status)}
                    disabled={loading}
                    required
                  >
                    <InputLabel id="marital-status-label">Marital Status</InputLabel>
                    <Select
                      labelId="marital-status-label"
                      id="marital_status"
                      name="marital_status"
                      value={formik.values.marital_status}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Marital Status"
                    >
                      {maritalStatusOptions.map((status) => (
                        <MenuItem key={status} value={status}>{status}</MenuItem>
                      ))}
                    </Select>
                    {formik.touched.marital_status && formik.errors.marital_status && (
                      <FormHelperText>{formik.errors.marital_status}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="education-level-label">Education Level</InputLabel>
                    <Select
                      labelId="education-level-label"
                      id="education_level"
                      name="education_level"
                      value={formik.values.education_level}
                      onChange={formik.handleChange}
                      label="Education Level"
                    >
                      {educationLevelOptions.map((level) => (
                        <MenuItem key={level} value={level}>{level}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    id="parity"
                    name="parity"
                    label="Parity"
                    type="number"
                    value={formik.values.parity}
                    onChange={formik.handleChange}
                    disabled={loading || formik.values.gender === 'Male'}
                    inputProps={{ min: 0 }}
                    helperText={formik.values.gender === 'Male' ? 'Not applicable for male patients' : ''}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="partner-support-label">Partner Support</InputLabel>
                    <Select
                      labelId="partner-support-label"
                      id="partner_support"
                      name="partner_support"
                      value={formik.values.partner_support}
                      onChange={formik.handleChange}
                      label="Partner Support"
                    >
                      {partnerSupportOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      case 1:
        return (
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Visit Information" />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Visit Date *"
                      value={formik.values.visit_date}
                      onChange={(value) => formik.setFieldValue('visit_date', value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={formik.touched.visit_date && Boolean(formik.errors.visit_date)}
                          helperText={formik.touched.visit_date && formik.errors.visit_date}
                          onBlur={() => formik.setFieldTouched('visit_date', true)}
                          required
                        />
                      )}
                      disabled={loading}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Next Visit Date"
                      value={formik.values.next_visit_date}
                      onChange={(value) => {
                        formik.setFieldValue('next_visit_date', value);
                        formik.setFieldTouched('next_visit_date', true);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                        />
                      )}
                      disabled={loading}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl 
                    fullWidth 
                    error={formik.touched.visit_type && Boolean(formik.errors.visit_type)}
                    disabled={loading}
                    required
                  >
                    <InputLabel id="visit-type-label">Visit Type</InputLabel>
                    <Select
                      labelId="visit-type-label"
                      id="visit_type"
                      name="visit_type"
                      value={formik.values.visit_type}
                      onChange={(e) => {
                        formik.handleChange(e);
                        // Set new acceptor based on visit type
                        if (e.target.value === 'Initial Consultation') {
                          formik.setFieldValue('is_new_acceptor', true);
                        }
                      }}
                      onBlur={formik.handleBlur}
                      label="Visit Type"
                    >
                      {visitTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                    {formik.touched.visit_type && formik.errors.visit_type && (
                      <FormHelperText>{formik.errors.visit_type}</FormHelperText>
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
                  <TextField
                    fullWidth
                    id="provider"
                    name="provider"
                    label="Provider"
                    value={formik.values.provider}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.provider && Boolean(formik.errors.provider)}
                    helperText={formik.touched.provider && formik.errors.provider}
                    disabled={loading}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="reason_for_visit"
                    name="reason_for_visit"
                    label="Reason for Visit"
                    multiline
                    rows={2}
                    value={formik.values.reason_for_visit}
                    onChange={formik.handleChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="is_new_acceptor"
                        name="is_new_acceptor"
                        checked={formik.values.is_new_acceptor}
                        onChange={formik.handleChange}
                        disabled={loading}
                      />
                    }
                    label="New Acceptor (First time using family planning)"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Method and Counseling" />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl 
                    fullWidth 
                    error={formik.touched.method && Boolean(formik.errors.method)}
                    disabled={loading}
                    required
                  >
                    <InputLabel id="method-label">Contraceptive Method</InputLabel>
                    <Select
                      labelId="method-label"
                      id="method"
                      name="method"
                      value={formik.values.method}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Contraceptive Method"
                    >
                      {formik.values.gender === 'Male' ? (
                        // Only show male-appropriate methods
                        contraceptiveMethods
                          .filter(method => method === 'Condoms' || method === 'Male Sterilization' || method === 'Other')
                          .map((method) => (
                            <MenuItem key={method} value={method}>{method}</MenuItem>
                          ))
                      ) : (
                        // Show all methods except male sterilization for females
                        contraceptiveMethods
                          .filter(method => method !== 'Male Sterilization')
                          .map((method) => (
                            <MenuItem key={method} value={method}>{method}</MenuItem>
                          ))
                      )}
                    </Select>
                    {formik.touched.method && formik.errors.method && (
                      <FormHelperText>{formik.errors.method}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="quantity_provided"
                    name="quantity_provided"
                    label="Quantity Provided"
                    type="number"
                    value={formik.values.quantity_provided}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.quantity_provided && Boolean(formik.errors.quantity_provided)}
                    helperText={(formik.touched.quantity_provided && formik.errors.quantity_provided) || 
                      (['Intrauterine Device (IUD)', 'Implant', 'Female Sterilization', 'Male Sterilization'].includes(formik.values.method) ? 
                        'Not applicable for this method' : '')}
                    disabled={loading || 
                      ['Intrauterine Device (IUD)', 'Implant', 'Female Sterilization', 'Male Sterilization'].includes(formik.values.method)}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="counseling_provided"
                        name="counseling_provided"
                        checked={formik.values.counseling_provided}
                        onChange={formik.handleChange}
                        disabled={loading}
                      />
                    }
                    label="Counseling Provided"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="counseling_notes"
                    name="counseling_notes"
                    label="Counseling Notes"
                    multiline
                    rows={3}
                    value={formik.values.counseling_notes}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.counseling_notes && Boolean(formik.errors.counseling_notes)}
                    helperText={formik.touched.counseling_notes && formik.errors.counseling_notes}
                    disabled={loading || !formik.values.counseling_provided}
                    required={formik.values.counseling_provided}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="follow_up_plan"
                    name="follow_up_plan"
                    label="Follow-up Plan"
                    multiline
                    rows={2}
                    value={formik.values.follow_up_plan}
                    onChange={formik.handleChange}
                    disabled={loading}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      case 3:
        return (
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Side Effects and Notes" />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="has_side_effects"
                        name="has_side_effects"
                        checked={formik.values.has_side_effects}
                        onChange={formik.handleChange}
                        disabled={loading}
                      />
                    }
                    label="Side Effects Reported"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="side_effects"
                    name="side_effects"
                    label="Side Effects Description"
                    multiline
                    rows={3}
                    value={formik.values.side_effects}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.side_effects && Boolean(formik.errors.side_effects)}
                    helperText={formik.touched.side_effects && formik.errors.side_effects}
                    disabled={loading || !formik.values.has_side_effects}
                    required={formik.values.has_side_effects}
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
                    disabled={loading}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  // Only show submit on last step
  const isLastStep = activeStep === steps.length - 1;
  // Form submission handler
  async function handleSubmit(values) {
    
    // Clear validation errors for fields we'll provide defaults for
    if (!values.method) {
      formik.setFieldError('method', undefined);
    }
    if (!values.provider) {
      formik.setFieldError('provider', undefined);
    }
    if (values.counseling_provided && !values.counseling_notes) {
      formik.setFieldError('counseling_notes', undefined);
    }
    
    // Provide default values for missing required fields
    const submissionValues = {
      ...values,
      method: values.method || 'Not specified',
      provider: values.provider || 'Default Provider',      counseling_notes: values.counseling_notes || 'Standard counseling provided'
    };
    
    try {
      const apiData = {
        patientId: submissionValues.patient_id,
        facilityId: 'a67c1c4d-ce75-4713-a87c-ab3d7a2444f0',
        registrationDate: format(new Date(), 'yyyy-MM-dd'),
        clientType: submissionValues.is_new_acceptor ? 'New Acceptor' : 'Continuing User',
        maritalStatus: submissionValues.marital_status || 'Single',
        numberOfChildren: parseInt(submissionValues.parity) || 0,
        desiredNumberOfChildren: parseInt(submissionValues.parity) + 1 || 1,
        educationLevel: submissionValues.education_level || 'Secondary',
        occupation: 'Not specified',
        primaryContact: {
          name: 'Emergency Contact',
          relationship: 'Family',
          phoneNumber: '+234-000-000-0000',
          address: 'Not provided'
        },
        medicalHistory: submissionValues.notes || 'No significant medical history',
        allergyHistory: submissionValues.has_side_effects ? submissionValues.side_effects : null,
        reproductiveHistory: `Parity: ${submissionValues.parity || 0}`,
        menstrualHistory: 'Regular cycles',
        referredBy: submissionValues.provider || 'Self-referred',
        notes: submissionValues.follow_up_plan || submissionValues.reason_for_visit || null,
        status: 'Active'
      };      
      if (id) {
        // Update existing record
        await execute(
          familyPlanningService.updateFamilyPlanningClient,
          [id, apiData],
          (response) => {
            setSavedRecordId(response.id || id);
            setSuccessDialogOpen(true);
          }
        );      } else {
        // Create new record
        await execute(
          familyPlanningService.createFamilyPlanningClient,
          [apiData],
          (response) => {
            setSavedRecordId(response.id);
            setSuccessDialogOpen(true);
          }
        );
      }
    } catch (error) {
      console.error("❌ Error saving record:", error);
    }
  }

  // Cancel form handling
  const handleCancelClick = () => {
    if (formik.dirty) {
      setConfirmDialogOpen(true);
    } else {
      navigate('/family-planning');
    }
  };

  const handleConfirmCancel = () => {
    setConfirmDialogOpen(false);
    navigate('/family-planning');
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    navigate(`/family-planning/${id || formik.values.id}`);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    
    try {
      // Ensure it's a valid Date object
      let dateObj = date;
      if (!(date instanceof Date)) {
        dateObj = parseISO(date);
      }
      
      if (!isValid(dateObj)) {
        return '';
      }
      
      return format(dateObj, 'MMMM dd, yyyy');
    } catch (error) {
      console.warn('Error formatting date:', date, error);
      return '';    }
  };

  return (
    <MainLayout 
      title={id ? "Edit Family Planning Record" : "New Family Planning Record"}
      breadcrumbs={[
        { name: 'Family Planning', path: '/family-planning' },
        { name: id ? 'Edit Record' : 'New Record', active: true }
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
            {id ? "Edit Family Planning Record" : "New Family Planning Record"}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={formik.handleSubmit}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            
            {isLastStep ? (
              <Box>
                {/* Show validation errors if form is invalid */}
                {!formik.isValid && Object.keys(formik.errors).length > 0 && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="error.contrastText">
                      Please fix the following errors:
                    </Typography>
                    {Object.entries(formik.errors).map(([field, error]) => (
                      <Typography key={field} variant="body2" color="error.contrastText">
                        • {error}
                      </Typography>
                    ))}
                  </Box>
                )}
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                  disabled={loading}
                >
                  {id ? 'Update Record' : 'Save Record'}
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
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
        <DialogTitle>Record Saved</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Family planning record {savedRecordId} has been successfully {id ? 'updated' : 'recorded'}.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleSuccessDialogClose} 
            variant="contained" 
            color="primary" 
            autoFocus
          >
            View Record
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default FamilyPlanningForm;

// Update the FamilyPlanningList mapping to handle patient names:
// In your FamilyPlanningList.js, update the mapping:

// Make sure 'clients' is defined or imported before this mapping.
// Example placeholder (replace with actual data source as needed):
const clients = []; // <-- Add this line or import clients from the correct module

const mappedClients = clients.map((clientItem) => {
  const patient = clientItem.patient || {};
  const facility = clientItem.facility || {};
  const primaryContact = clientItem.primaryContact || {};
  
  // Format patient name properly
  const patientName = [patient.firstName, patient.lastName, patient.otherNames]
    .filter(name => name && name.trim())
    .join(' ') || 'Unknown Client';
  
  return {
    id: clientItem.id,
    patient_id: clientItem.patientId,
    // ... other fields ...
    patient_name: patientName, // Use properly formatted name
    // ... rest of mapping ...
  };
});