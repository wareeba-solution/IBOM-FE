// src/pages/births/BirthForm.js
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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';

// Mock birth service - replace with actual service when available
const birthService = {
  getBirthById: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockBirth = {
          id,
          registration_number: `BR${10000 + parseInt(id)}`,
          child_name: `Baby ${parseInt(id) % 2 === 0 ? 'Boy' : 'Girl'} ${id}`,
          gender: parseInt(id) % 2 === 0 ? 'Male' : 'Female',
          date_of_birth: new Date(2023, (parseInt(id) % 12), parseInt(id) % 28 + 1).toISOString().split('T')[0],
          place_of_birth: parseInt(id) % 3 === 0 ? 'Home' : 'Hospital',
          birth_weight: (2.5 + Math.random() * 2).toFixed(2),
          birth_length: (45 + Math.random() * 10).toFixed(1),
          head_circumference: (30 + Math.random() * 5).toFixed(1),
          hospital_name: parseInt(id) % 3 === 0 ? '' : `Hospital ${id}`,
          mother_name: `Mother ${id}`,
          mother_age: 20 + (parseInt(id) % 20),
          mother_occupation: 'Teacher',
          mother_id_number: `M${100000 + parseInt(id)}`,
          mother_phone: `080${id}${id}${id}${id}${id}${id}${id}`,
          father_name: `Father ${id}`,
          father_age: 25 + (parseInt(id) % 20),
          father_occupation: 'Engineer',
          father_id_number: `F${100000 + parseInt(id)}`,
          father_phone: `070${id}${id}${id}${id}${id}${id}${id}`,
          address: `Address ${id}, Akwa Ibom`,
          city: 'Uyo',
          state: 'Akwa Ibom',
          complications: parseInt(id) % 5 === 0 ? 'None' : '',
          birth_attendant: parseInt(id) % 3 === 0 ? 'Midwife' : 'Doctor',
          delivery_type: parseInt(id) % 4 === 0 ? 'Caesarean Section' : 'Normal',
          status: parseInt(id) % 10 === 0 ? 'pending' : 'registered',
          registration_date: new Date().toISOString().split('T')[0],
          notes: parseInt(id) % 7 === 0 ? 'Special notes about this birth' : ''
        };
        resolve(mockBirth);
      }, 500);
    });
  },
  createBirth: async (data) => {
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
  updateBirth: async (id, data) => {
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
  }
};

// Form validation schema
const birthValidationSchema = Yup.object({
  // Child information
  child_name: Yup.string()
    .required('Child name is required'),
  gender: Yup.string()
    .required('Gender is required'),
  date_of_birth: Yup.date()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future'),
  place_of_birth: Yup.string()
    .required('Place of birth is required'),
  birth_weight: Yup.number()
    .positive('Birth weight must be positive')
    .required('Birth weight is required'),
  birth_length: Yup.number()
    .positive('Birth length must be positive'),
  head_circumference: Yup.number()
    .positive('Head circumference must be positive'),
  
  // Mother information
  mother_name: Yup.string()
    .required('Mother\'s name is required'),
  mother_age: Yup.number()
    .positive('Mother\'s age must be positive')
    .integer('Mother\'s age must be a whole number'),
  
  // Father information
  father_name: Yup.string(),
  father_age: Yup.number()
    .positive('Father\'s age must be positive')
    .integer('Father\'s age must be a whole number'),
  
  // Address information
  address: Yup.string()
    .required('Address is required'),
  city: Yup.string()
    .required('City is required'),
  state: Yup.string()
    .required('State is required'),
  
  // Birth details
  delivery_type: Yup.string(),
  birth_attendant: Yup.string(),
  
  // Registration information
  registration_date: Yup.date()
    .required('Registration date is required'),
  status: Yup.string()
    .required('Status is required')
});

// Initial values
const initialBirthValues = {
  // Child information
  child_name: '',
  gender: '',
  date_of_birth: new Date(),
  place_of_birth: '',
  birth_weight: '',
  birth_length: '',
  head_circumference: '',
  hospital_name: '',
  
  // Mother information
  mother_name: '',
  mother_age: '',
  mother_occupation: '',
  mother_id_number: '',
  mother_phone: '',
  
  // Father information
  father_name: '',
  father_age: '',
  father_occupation: '',
  father_id_number: '',
  father_phone: '',
  
  // Address information
  address: '',
  city: '',
  state: 'Akwa Ibom',
  
  // Birth details
  complications: '',
  delivery_type: 'Normal',
  birth_attendant: '',
  
  // Registration information
  registration_date: new Date(),
  status: 'registered',
  notes: ''
};

// Birth Form Component
const BirthForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();
  
  // State
  const [birth, setBirth] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Steps for the form
  const steps = ['Child Information', 'Parents Information', 'Birth Details', 'Registration'];

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      // Format date values
      const formattedValues = {
        ...values,
        date_of_birth: format(new Date(values.date_of_birth), 'yyyy-MM-dd'),
        registration_date: format(new Date(values.registration_date), 'yyyy-MM-dd')
      };

      if (isEditMode) {
        // Update existing birth record
        await execute(
          birthService.updateBirth,
          [id, formattedValues],
          (response) => {
            setAlertMessage('Birth record updated successfully');
            setAlertSeverity('success');
            setAlertOpen(true);
            
            // Navigate back to birth detail after a short delay
            setTimeout(() => {
              navigate(`/births/${id}`);
            }, 1500);
          }
        );
      } else {
        // Create new birth record
        await execute(
          birthService.createBirth,
          [formattedValues],
          (response) => {
            setAlertMessage('Birth record registered successfully');
            setAlertSeverity('success');
            setAlertOpen(true);
            
            // Navigate to the new birth's detail page
            setTimeout(() => {
              navigate(`/births/${response.id}`);
            }, 1500);
          }
        );
      }
    } catch (err) {
      setAlertMessage('Failed to save birth record information');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  // Initialize formik
  const formik = useFormik({
    initialValues: initialBirthValues,
    validationSchema: birthValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true
  });

  // Load birth data if in edit mode
  useEffect(() => {
    const loadBirth = async () => {
      if (id && id !== 'new') {
        setIsEditMode(true);
        
        await execute(
          birthService.getBirthById,
          [id],
          (response) => {
            // Transform API response to form values format
            const birthData = {
              ...initialBirthValues,
              ...response,
              date_of_birth: response.date_of_birth ? new Date(response.date_of_birth) : new Date(),
              registration_date: response.registration_date ? new Date(response.registration_date) : new Date()
            };
            
            setBirth(birthData);
            
            // Set formik values
            Object.keys(birthData).forEach(key => {
              formik.setFieldValue(key, birthData[key], false);
            });
          }
        );
      }
    };
    
    loadBirth();
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
      navigate(`/births/${id}`);
    } else {
      navigate('/births');
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
      case 0: // Child Information
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Child Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="child_name"
                name="child_name"
                label="Child's Name *"
                value={formik.values.child_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.child_name && Boolean(formik.errors.child_name)}
                helperText={formik.touched.child_name && formik.errors.child_name}
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
              <FormControl 
                fullWidth
                error={formik.touched.place_of_birth && Boolean(formik.errors.place_of_birth)}
              >
                <InputLabel id="place-of-birth-label">Place of Birth *</InputLabel>
                <Select
                  labelId="place-of-birth-label"
                  id="place_of_birth"
                  name="place_of_birth"
                  value={formik.values.place_of_birth}
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (e.target.value !== 'Hospital') {
                      formik.setFieldValue('hospital_name', '');
                    }
                  }}
                  onBlur={formik.handleBlur}
                  label="Place of Birth *"
                >
                  <MenuItem value="">
                    <em>Select Place</em>
                  </MenuItem>
                  <MenuItem value="Hospital">Hospital</MenuItem>
                  <MenuItem value="Home">Home</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {formik.touched.place_of_birth && formik.errors.place_of_birth && (
                  <FormHelperText>{formik.errors.place_of_birth}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {formik.values.place_of_birth === 'Hospital' && (
              <Grid item xs={12}>
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
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="birth_weight"
                name="birth_weight"
                label="Birth Weight (kg) *"
                type="number"
                InputProps={{
                  inputProps: { min: 0, step: 0.01 }
                }}
                value={formik.values.birth_weight}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.birth_weight && Boolean(formik.errors.birth_weight)}
                helperText={formik.touched.birth_weight && formik.errors.birth_weight}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="birth_length"
                name="birth_length"
                label="Birth Length (cm)"
                type="number"
                InputProps={{
                  inputProps: { min: 0, step: 0.1 }
                }}
                value={formik.values.birth_length}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.birth_length && Boolean(formik.errors.birth_length)}
                helperText={formik.touched.birth_length && formik.errors.birth_length}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="head_circumference"
                name="head_circumference"
                label="Head Circumference (cm)"
                type="number"
                InputProps={{
                  inputProps: { min: 0, step: 0.1 }
                }}
                value={formik.values.head_circumference}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.head_circumference && Boolean(formik.errors.head_circumference)}
                helperText={formik.touched.head_circumference && formik.errors.head_circumference}
              />
            </Grid>
          </Grid>
        );
      
      case 1: // Parents Information
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Mother's Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="mother_name"
                name="mother_name"
                label="Mother's Name *"
                value={formik.values.mother_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.mother_name && Boolean(formik.errors.mother_name)}
                helperText={formik.touched.mother_name && formik.errors.mother_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="mother_age"
                name="mother_age"
                label="Mother's Age"
                type="number"
                InputProps={{
                  inputProps: { min: 0 }
                }}
                value={formik.values.mother_age}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.mother_age && Boolean(formik.errors.mother_age)}
                helperText={formik.touched.mother_age && formik.errors.mother_age}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="mother_occupation"
                name="mother_occupation"
                label="Mother's Occupation"
                value={formik.values.mother_occupation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="mother_id_number"
                name="mother_id_number"
                label="Mother's ID Number"
                value={formik.values.mother_id_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="mother_phone"
                name="mother_phone"
                label="Mother's Phone Number"
                value={formik.values.mother_phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Father's Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="father_name"
                name="father_name"
                label="Father's Name"
                value={formik.values.father_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="father_age"
                name="father_age"
                label="Father's Age"
                type="number"
                InputProps={{
                  inputProps: { min: 0 }
                }}
                value={formik.values.father_age}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.father_age && Boolean(formik.errors.father_age)}
                helperText={formik.touched.father_age && formik.errors.father_age}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="father_occupation"
                name="father_occupation"
                label="Father's Occupation"
                value={formik.values.father_occupation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="father_id_number"
                name="father_id_number"
                label="Father's ID Number"
                value={formik.values.father_id_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="father_phone"
                name="father_phone"
                label="Father's Phone Number"
                value={formik.values.father_phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Address Information
              </Typography>
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
          </Grid>
        );
      
      case 2: // Birth Details
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Birth Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="delivery-type-label">Delivery Type</InputLabel>
                <Select
                  labelId="delivery-type-label"
                  id="delivery_type"
                  name="delivery_type"
                  value={formik.values.delivery_type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Delivery Type"
                >
                  <MenuItem value="Normal">Normal</MenuItem>
                  <MenuItem value="Caesarean Section">Caesarean Section</MenuItem>
                  <MenuItem value="Assisted">Assisted</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="birth-attendant-label">Birth Attendant</InputLabel>
                <Select
                  labelId="birth-attendant-label"
                  id="birth_attendant"
                  name="birth_attendant"
                  value={formik.values.birth_attendant}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Birth Attendant"
                >
                  <MenuItem value="">
                    <em>Select Attendant</em>
                  </MenuItem>
                  <MenuItem value="Doctor">Doctor</MenuItem>
                  <MenuItem value="Nurse">Nurse</MenuItem>
                  <MenuItem value="Midwife">Midwife</MenuItem>
                  <MenuItem value="Traditional Birth Attendant">Traditional Birth Attendant</MenuItem>
                  <MenuItem value="Family Member">Family Member</MenuItem>
                  <MenuItem value="None">None</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="complications"
                name="complications"
                label="Complications (if any)"
                multiline
                rows={2}
                value={formik.values.complications}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                error={formik.touched.status && Boolean(formik.errors.status)}
              >
                <InputLabel id="status-label">Registration Status *</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Registration Status *"
                >
                  <MenuItem value="registered">Registered</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                Please verify all information before submission. Once submitted, a birth certificate can be printed from the birth record details page.
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
        formik.values.child_name &&
        formik.values.gender &&
        formik.values.date_of_birth &&
        formik.values.place_of_birth &&
        formik.values.birth_weight &&
        !formik.errors.child_name &&
        !formik.errors.gender &&
        !formik.errors.date_of_birth &&
        !formik.errors.place_of_birth &&
        !formik.errors.birth_weight
      );
    } else if (step === 1) {
      return (
        formik.values.mother_name &&
        formik.values.address &&
        formik.values.city &&
        formik.values.state &&
        !formik.errors.mother_name &&
        !formik.errors.address &&
        !formik.errors.city &&
        !formik.errors.state
      );
    } else if (step === 2) {
      return true; // No required fields in this step
    }
    
    // In step 3, check registration information
    return (
      formik.values.registration_date &&
      formik.values.status &&
      !formik.errors.registration_date &&
      !formik.errors.status
    );
  };

  // Determine if the form can be submitted
  const canSubmit = () => {
    return (
      formik.values.child_name &&
      formik.values.gender &&
      formik.values.date_of_birth &&
      formik.values.place_of_birth &&
      formik.values.birth_weight &&
      formik.values.mother_name &&
      formik.values.address &&
      formik.values.city &&
      formik.values.state &&
      formik.values.registration_date &&
      formik.values.status &&
      Object.keys(formik.errors).length === 0
    );
  };

  return (
    <MainLayout 
      title={isEditMode ? "Edit Birth Record" : "Register New Birth"}
      breadcrumbs={[
        { name: 'Births', path: '/births' },
        { name: isEditMode ? 'Edit Birth Record' : 'Register New Birth', active: true }
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
            {isEditMode ? 'Edit Birth Record' : 'Register New Birth'}
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
                    {isEditMode ? 'Update Record' : 'Register Birth'}
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

export default BirthForm;