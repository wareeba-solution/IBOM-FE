// src/pages/facilities/FacilityForm.js
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
  Chip,
  Autocomplete
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  DateRange as DateRangeIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';

// Mock facility service - replace with actual service when available
const facilityService = {
  getFacilityById: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockFacility = {
          id,
          facility_code: `FAC${10000 + parseInt(id)}`,
          name: `${parseInt(id) % 3 === 0 ? 'General Hospital' : (parseInt(id) % 3 === 1 ? 'Primary Health Center' : 'Medical Clinic')} ${id}`,
          type: parseInt(id) % 3 === 0 ? 'Hospital' : (parseInt(id) % 3 === 1 ? 'Primary Health Center' : 'Clinic'),
          level: parseInt(id) % 3 === 0 ? 'Secondary' : (parseInt(id) % 3 === 1 ? 'Primary' : 'Primary'),
          ownership: parseInt(id) % 4 === 0 ? 'Government' : (parseInt(id) % 4 === 1 ? 'Private' : (parseInt(id) % 4 === 2 ? 'Faith-based' : 'NGO')),
          address: `Address ${id}, Akwa Ibom`,
          city: parseInt(id) % 5 === 0 ? 'Uyo' : (parseInt(id) % 5 === 1 ? 'Ikot Ekpene' : (parseInt(id) % 5 === 2 ? 'Eket' : (parseInt(id) % 5 === 3 ? 'Oron' : 'Abak'))),
          local_govt: parseInt(id) % 5 === 0 ? 'Uyo' : (parseInt(id) % 5 === 1 ? 'Ikot Ekpene' : (parseInt(id) % 5 === 2 ? 'Eket' : (parseInt(id) % 5 === 3 ? 'Oron' : 'Abak'))),
          state: 'Akwa Ibom',
          postal_code: `5${id}${id}${id}${id}`,
          phone: `080${id}${id}${id}${id}${id}${id}${id}${id}`,
          email: `facility${id}@example.com`,
          website: parseInt(id) % 3 === 0 ? `www.facility${id}.com` : '',
          gps_coordinates: `${4 + Math.random() * 2}, ${7 + Math.random() * 2}`,
          services: [
            'Outpatient Services',
            parseInt(id) % 2 === 0 ? 'Surgery' : 'Laboratory Services',
            parseInt(id) % 3 === 0 ? 'Emergency Services' : 'Pharmacy',
            parseInt(id) % 4 === 0 ? 'Maternity' : 'Pediatrics'
          ],
          beds: parseInt(id) % 3 === 0 ? 50 + parseInt(id) : (parseInt(id) % 3 === 1 ? 20 + parseInt(id) : 10 + parseInt(id)),
          staff_count: parseInt(id) % 3 === 0 ? 100 + parseInt(id) : (parseInt(id) % 3 === 1 ? 30 + parseInt(id) : 15 + parseInt(id)),
          head_name: `Dr. ${parseInt(id) % 2 === 0 ? 'John' : 'Jane'} Smith ${id}`,
          head_title: parseInt(id) % 3 === 0 ? 'Medical Director' : (parseInt(id) % 3 === 1 ? 'Chief Medical Officer' : 'Head Doctor'),
          registration_date: new Date(2010 + (parseInt(id) % 12), (parseInt(id) % 12), parseInt(id) % 28 + 1).toISOString().split('T')[0],
          status: parseInt(id) % 10 === 0 ? 'Inactive' : 'Active',
          last_updated: new Date(2023, (parseInt(id) % 12), parseInt(id) % 28 + 1).toISOString()
        };
        resolve(mockFacility);
      }, 500);
    });
  },
  createFacility: async (data) => {
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
  updateFacility: async (id, data) => {
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

// List of available services
const availableServices = [
  "Outpatient Services",
  "Inpatient Services",
  "Emergency Services",
  "Laboratory Services",
  "Pharmacy",
  "Radiology/Imaging",
  "Surgery",
  "Maternity",
  "Pediatrics",
  "Dental Services",
  "Ophthalmology",
  "Orthopedics",
  "Geriatrics",
  "Mental Health Services",
  "Physiotherapy",
  "Family Planning",
  "Vaccination/Immunization",
  "HIV/AIDS Treatment",
  "Tuberculosis Treatment",
  "Nutrition Services",
  "Health Education",
  "Palliative Care"
];

// Form validation schema
const facilityValidationSchema = Yup.object({
  name: Yup.string()
    .required('Facility name is required')
    .min(3, 'Name must be at least 3 characters'),
  type: Yup.string()
    .required('Facility type is required'),
  level: Yup.string()
    .required('Facility level is required'),
  ownership: Yup.string()
    .required('Ownership type is required'),
  address: Yup.string()
    .required('Address is required'),
  city: Yup.string()
    .required('City is required'),
  local_govt: Yup.string()
    .required('Local Government Area is required'),
  state: Yup.string()
    .required('State is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9+\s()-]{10,15}$/, 'Invalid phone number format'),
  email: Yup.string()
    .email('Invalid email format'),
  beds: Yup.number()
    .positive('Number of beds must be positive')
    .integer('Number of beds must be a whole number'),
  staff_count: Yup.number()
    .positive('Staff count must be positive')
    .integer('Staff count must be a whole number'),
  head_name: Yup.string()
    .required('Head of facility name is required'),
  registration_date: Yup.date()
    .required('Registration date is required'),
  status: Yup.string()
    .required('Status is required')
});

// Initial values
const initialFacilityValues = {
  facility_code: '',
  name: '',
  type: '',
  level: '',
  ownership: '',
  address: '',
  city: '',
  local_govt: '',
  state: 'Akwa Ibom',
  postal_code: '',
  phone: '',
  email: '',
  website: '',
  gps_coordinates: '',
  services: [],
  beds: '',
  staff_count: '',
  head_name: '',
  head_title: '',
  registration_date: new Date(),
  status: 'Active',
  notes: ''
};

// Facility Form Component
const FacilityForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();
  
  // State
  const [facility, setFacility] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Steps for the form
  const steps = ['Basic Information', 'Location & Contact', 'Services & Capacity', 'Administration'];

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      // Format date values
      const formattedValues = {
        ...values,
        registration_date: format(new Date(values.registration_date), 'yyyy-MM-dd')
      };

      if (isEditMode) {
        // Update existing facility
        await execute(
          facilityService.updateFacility,
          [id, formattedValues],
          (response) => {
            setAlertMessage('Facility updated successfully');
            setAlertSeverity('success');
            setAlertOpen(true);
            
            // Navigate back to facility detail after a short delay
            setTimeout(() => {
              navigate(`/facilities/${id}`);
            }, 1500);
          }
        );
      } else {
        // Create new facility
        await execute(
          facilityService.createFacility,
          [formattedValues],
          (response) => {
            setAlertMessage('Facility created successfully');
            setAlertSeverity('success');
            setAlertOpen(true);
            
            // Navigate to the new facility's detail page
            setTimeout(() => {
              navigate(`/facilities/${response.id}`);
            }, 1500);
          }
        );
      }
    } catch (err) {
      setAlertMessage('Failed to save facility information');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  // Initialize formik
  const formik = useFormik({
    initialValues: initialFacilityValues,
    validationSchema: facilityValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true
  });

  // Load facility data if in edit mode
  useEffect(() => {
    const loadFacility = async () => {
      if (id && id !== 'new') {
        setIsEditMode(true);
        
        await execute(
          facilityService.getFacilityById,
          [id],
          (response) => {
            // Transform API response to form values format
            const facilityData = {
              ...initialFacilityValues,
              ...response,
              registration_date: response.registration_date ? new Date(response.registration_date) : new Date()
            };
            
            setFacility(facilityData);
            
            // Set formik values
            Object.keys(facilityData).forEach(key => {
              formik.setFieldValue(key, facilityData[key], false);
            });
          }
        );
      }
    };
    
    loadFacility();
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
      navigate(`/facilities/${id}`);
    } else {
      navigate('/facilities');
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
      case 0: // Basic Information
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Basic Facility Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={isEditMode ? 6 : 12}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Facility Name *"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            
            {isEditMode && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="facility_code"
                  name="facility_code"
                  label="Facility Code"
                  value={formik.values.facility_code}
                  disabled
                />
              </Grid>
            )}
            
            <Grid item xs={12} sm={4}>
              <FormControl 
                fullWidth
                error={formik.touched.type && Boolean(formik.errors.type)}
              >
                <InputLabel id="type-label">Facility Type *</InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Facility Type *"
                >
                  <MenuItem value="">
                    <em>Select Type</em>
                  </MenuItem>
                  <MenuItem value="Hospital">Hospital</MenuItem>
                  <MenuItem value="Primary Health Center">Primary Health Center</MenuItem>
                  <MenuItem value="Clinic">Clinic</MenuItem>
                  <MenuItem value="Dispensary">Dispensary</MenuItem>
                  <MenuItem value="Maternity Home">Maternity Home</MenuItem>
                  <MenuItem value="Medical Laboratory">Medical Laboratory</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {formik.touched.type && formik.errors.type && (
                  <FormHelperText>{formik.errors.type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl 
                fullWidth
                error={formik.touched.level && Boolean(formik.errors.level)}
              >
                <InputLabel id="level-label">Facility Level *</InputLabel>
                <Select
                  labelId="level-label"
                  id="level"
                  name="level"
                  value={formik.values.level}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Facility Level *"
                >
                  <MenuItem value="">
                    <em>Select Level</em>
                  </MenuItem>
                  <MenuItem value="Primary">Primary</MenuItem>
                  <MenuItem value="Secondary">Secondary</MenuItem>
                  <MenuItem value="Tertiary">Tertiary</MenuItem>
                </Select>
                {formik.touched.level && formik.errors.level && (
                  <FormHelperText>{formik.errors.level}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl 
                fullWidth
                error={formik.touched.ownership && Boolean(formik.errors.ownership)}
              >
                <InputLabel id="ownership-label">Ownership *</InputLabel>
                <Select
                  labelId="ownership-label"
                  id="ownership"
                  name="ownership"
                  value={formik.values.ownership}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Ownership *"
                >
                  <MenuItem value="">
                    <em>Select Ownership</em>
                  </MenuItem>
                  <MenuItem value="Government">Government</MenuItem>
                  <MenuItem value="Private">Private</MenuItem>
                  <MenuItem value="Faith-based">Faith-based</MenuItem>
                  <MenuItem value="NGO">NGO</MenuItem>
                  <MenuItem value="Community">Community</MenuItem>
                </Select>
                {formik.touched.ownership && formik.errors.ownership && (
                  <FormHelperText>{formik.errors.ownership}</FormHelperText>
                )}
              </FormControl>
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
            
            <Grid item xs={12}>
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
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Under Construction">Under Construction</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        );
      
      case 1: // Location & Contact
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Location Information
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
              <TextField
                fullWidth
                id="local_govt"
                name="local_govt"
                label="Local Government Area *"
                value={formik.values.local_govt}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.local_govt && Boolean(formik.errors.local_govt)}
                helperText={formik.touched.local_govt && formik.errors.local_govt}
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
            
            <Grid item xs={12} sm={6}>
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
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="gps_coordinates"
                name="gps_coordinates"
                label="GPS Coordinates"
                value={formik.values.gps_coordinates}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <MapIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                placeholder="Latitude, Longitude"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Contact Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Phone Number *"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email Address"
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
                id="website"
                name="website"
                label="Website"
                value={formik.values.website}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g., www.facilityname.com"
              />
            </Grid>
          </Grid>
        );
      
      case 2: // Services & Capacity
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Services Offered
              </Typography>
              
              <Autocomplete
                multiple
                id="services"
                options={availableServices}
                value={formik.values.services}
                onChange={(event, newValue) => {
                  formik.setFieldValue('services', newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Services"
                    placeholder="Select services offered"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      key={index}
                    />
                  ))
                }
                freeSolo
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Capacity
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="beds"
                name="beds"
                label="Number of Beds"
                type="number"
                InputProps={{
                  inputProps: { min: 0 }
                }}
                value={formik.values.beds}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.beds && Boolean(formik.errors.beds)}
                helperText={formik.touched.beds && formik.errors.beds}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="staff_count"
                name="staff_count"
                label="Total Staff Count"
                type="number"
                InputProps={{
                  inputProps: { min: 0 }
                }}
                value={formik.values.staff_count}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.staff_count && Boolean(formik.errors.staff_count)}
                helperText={formik.touched.staff_count && formik.errors.staff_count}
              />
            </Grid>
          </Grid>
        );
      
      case 3: // Administration
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Administrative Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="head_name"
                name="head_name"
                label="Head of Facility Name *"
                value={formik.values.head_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.head_name && Boolean(formik.errors.head_name)}
                helperText={formik.touched.head_name && formik.errors.head_name}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="head_title"
                name="head_title"
                label="Head of Facility Title"
                value={formik.values.head_title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g., Medical Director, Chief Medical Officer"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Additional Notes"
                multiline
                rows={4}
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
        formik.values.name &&
        formik.values.type &&
        formik.values.level &&
        formik.values.ownership &&
        formik.values.status &&
        !formik.errors.name &&
        !formik.errors.type &&
        !formik.errors.level &&
        !formik.errors.ownership &&
        !formik.errors.status
      );
    } else if (step === 1) {
      return (
        formik.values.address &&
        formik.values.city &&
        formik.values.local_govt &&
        formik.values.state &&
        formik.values.phone &&
        !formik.errors.address &&
        !formik.errors.city &&
        !formik.errors.local_govt &&
        !formik.errors.state &&
        !formik.errors.phone
      );
    } else if (step === 2) {
      return (
        !formik.errors.beds &&
        !formik.errors.staff_count
      );
    }
    
    // In step 3, check administrative information
    return (
      formik.values.head_name &&
      !formik.errors.head_name
    );
  };

  // Determine if the form can be submitted
  const canSubmit = () => {
    return (
      formik.values.name &&
      formik.values.type &&
      formik.values.level &&
      formik.values.ownership &&
      formik.values.address &&
      formik.values.city &&
      formik.values.local_govt &&
      formik.values.state &&
      formik.values.phone &&
      formik.values.head_name &&
      formik.values.status &&
      Object.keys(formik.errors).length === 0
    );
  };

  return (
    <MainLayout 
      title={isEditMode ? "Edit Facility" : "Add New Facility"}
      breadcrumbs={[
        { name: 'Facilities', path: '/facilities' },
        { name: isEditMode ? 'Edit Facility' : 'Add New Facility', active: true }
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
            {isEditMode ? 'Edit Facility Information' : 'Add New Facility'}
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
                    {isEditMode ? 'Update Facility' : 'Save Facility'}
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

export default FacilityForm;