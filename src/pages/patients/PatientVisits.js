// src/pages/patients/PatientVisits.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Tab,
  Tabs,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  LocalHospital as LocalHospitalIcon,
  Healing as HealingIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  MonitorWeight as MonitorWeightIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import MainLayout from '../../components/common/Layout/MainLayout';
import patientService from '../../services/patientService';
import { useApi } from '../../hooks/useApi';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`visit-tabpanel-${index}`}
      aria-labelledby={`visit-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Visit validation schema
const visitValidationSchema = Yup.object({
  visit_date: Yup.date()
    .required('Visit date is required')
    .max(new Date(), 'Visit date cannot be in the future'),
  purpose: Yup.string()
    .required('Purpose of visit is required'),
  diagnosis: Yup.string(),
  treatment: Yup.string(),
  notes: Yup.string(),
  vital_signs: Yup.object({
    temperature: Yup.string(),
    blood_pressure: Yup.string(),
    pulse: Yup.string(),
    respiratory_rate: Yup.string(),
    weight: Yup.string(),
    height: Yup.string(),
  })
});

// Initial visit values
const initialVisitValues = {
  visit_date: new Date(),
  purpose: '',
  diagnosis: '',
  treatment: '',
  notes: '',
  vital_signs: {
    temperature: '',
    blood_pressure: '',
    pulse: '',
    respiratory_rate: '',
    weight: '',
    height: ''
  }
};

const PatientVisits = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formError, setFormError] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [filterType, setFilterType] = useState('all');

  // Fetch patient and visits data
  useEffect(() => {
    const loadPatientData = async () => {
      // Fetch patient details
      await execute(
        patientService.getPatientById,
        [id],
        (response) => {
          setPatient(response);
        }
      );

      // Fetch patient visits
      await execute(
        patientService.getPatientVisits,
        [id],
        (response) => {
          setVisits(response.data || []);
        }
      );
    };

    loadPatientData();
  }, [id]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle add visit
  const handleAddVisit = () => {
    setIsAddModalOpen(true);
  };

  // Handle edit visit
  const handleEditVisit = (visit) => {
    setSelectedVisit(visit);
    setIsEditModalOpen(true);
  };

  // Handle delete visit
  const handleDeleteVisit = (visit) => {
    setSelectedVisit(visit);
    setIsDeleteModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (selectedVisit) {
      // In a real app, this would call the API to delete the visit
      // For now, we'll just simulate it
      const updatedVisits = visits.filter(v => v.id !== selectedVisit.id);
      setVisits(updatedVisits);
      setIsDeleteModalOpen(false);
      setSelectedVisit(null);
      
      setAlertMessage('Visit record deleted successfully');
      setAlertSeverity('success');
      setAlertOpen(true);
    }
  };

  // Handle close modals
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    addFormik.resetForm();
    setFormError(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedVisit(null);
    editFormik.resetForm();
    setFormError(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedVisit(null);
  };

  // Handle alert close
  const handleAlertClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertOpen(false);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle sort change
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    try {
      return format(parseISO(date), 'MMM dd, yyyy');
    } catch (error) {
      return date;
    }
  };

  // Add visit form
  const addFormik = useFormik({
    initialValues: initialVisitValues,
    validationSchema: visitValidationSchema,
    onSubmit: async (values) => {
      setFormError(null);
      
      try {
        // Format the date
        const formattedValues = {
          ...values,
          visit_date: format(new Date(values.visit_date), 'yyyy-MM-dd'),
        };

        // In a real app, this would call the API to add the visit
        // For now, we'll just simulate it
        const newVisit = {
          id: Date.now(), // Simulate a unique ID
          ...formattedValues
        };
        
        setVisits([newVisit, ...visits]);
        setIsAddModalOpen(false);
        addFormik.resetForm();
        
        setAlertMessage('Visit record added successfully');
        setAlertSeverity('success');
        setAlertOpen(true);
      } catch (error) {
        setFormError('Failed to add visit record. Please try again.');
      }
    }
  });

  // Edit visit form
  const editFormik = useFormik({
    initialValues: initialVisitValues,
    validationSchema: visitValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setFormError(null);
      
      try {
        // Format the date
        const formattedValues = {
          ...values,
          visit_date: format(new Date(values.visit_date), 'yyyy-MM-dd'),
        };

        // In a real app, this would call the API to update the visit
        // For now, we'll just simulate it
        const updatedVisits = visits.map(visit => 
          visit.id === selectedVisit.id ? { ...visit, ...formattedValues } : visit
        );
        
        setVisits(updatedVisits);
        setIsEditModalOpen(false);
        setSelectedVisit(null);
        
        setAlertMessage('Visit record updated successfully');
        setAlertSeverity('success');
        setAlertOpen(true);
      } catch (error) {
        setFormError('Failed to update visit record. Please try again.');
      }
    }
  });

  // Update edit form when selecting a visit
  useEffect(() => {
    if (selectedVisit) {
      const visitData = {
        ...selectedVisit,
        visit_date: selectedVisit.visit_date ? new Date(selectedVisit.visit_date) : new Date(),
        vital_signs: selectedVisit.vital_signs || {
          temperature: '',
          blood_pressure: '',
          pulse: '',
          respiratory_rate: '',
          weight: '',
          height: ''
        }
      };
      
      // Set form values
      Object.keys(visitData).forEach(key => {
        editFormik.setFieldValue(key, visitData[key], false);
      });
    }
  }, [selectedVisit]);

  // Filter and sort visits
  const filteredAndSortedVisits = visits
    .filter(visit => {
      // Apply search filter
      const searchFields = [
        visit.purpose,
        visit.diagnosis,
        visit.treatment,
        visit.notes
      ].filter(Boolean).join(' ').toLowerCase();
      
      const matchesSearch = !searchTerm || searchFields.includes(searchTerm.toLowerCase());
      
      // Apply type filter
      let matchesType = true;
      if (filterType !== 'all') {
        matchesType = visit.purpose && visit.purpose.toLowerCase().includes(filterType.toLowerCase());
      }
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      // Apply sorting
      const dateA = new Date(a.visit_date).getTime();
      const dateB = new Date(b.visit_date).getTime();
      
      switch (sortBy) {
        case 'date_asc':
          return dateA - dateB;
        case 'date_desc':
        default:
          return dateB - dateA;
      }
    });

  // Render visit form (used in both add and edit modals)
  const renderVisitForm = (formik) => (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Visit Date *"
              value={formik.values.visit_date}
              onChange={(date) => formik.setFieldValue('visit_date', date)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  name="visit_date"
                  onBlur={formik.handleBlur}
                  error={formik.touched.visit_date && Boolean(formik.errors.visit_date)}
                  helperText={formik.touched.visit_date && formik.errors.visit_date}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl 
            fullWidth
            error={formik.touched.purpose && Boolean(formik.errors.purpose)}
          >
            <InputLabel id="purpose-label">Purpose of Visit *</InputLabel>
            <Select
              labelId="purpose-label"
              id="purpose"
              name="purpose"
              value={formik.values.purpose}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Purpose of Visit *"
            >
              <MenuItem value="">
                <em>Select Purpose</em>
              </MenuItem>
              <MenuItem value="Routine Checkup">Routine Checkup</MenuItem>
              <MenuItem value="Illness">Illness</MenuItem>
              <MenuItem value="Follow-up">Follow-up</MenuItem>
              <MenuItem value="Vaccination">Vaccination</MenuItem>
              <MenuItem value="Injury">Injury</MenuItem>
              <MenuItem value="Prenatal">Prenatal</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
            {formik.touched.purpose && formik.errors.purpose && (
              <Typography variant="caption" color="error">
                {formik.errors.purpose}
              </Typography>
            )}
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="diagnosis"
            name="diagnosis"
            label="Diagnosis"
            value={formik.values.diagnosis}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.diagnosis && Boolean(formik.errors.diagnosis)}
            helperText={formik.touched.diagnosis && formik.errors.diagnosis}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="treatment"
            name="treatment"
            label="Treatment"
            value={formik.values.treatment}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.treatment && Boolean(formik.errors.treatment)}
            helperText={formik.touched.treatment && formik.errors.treatment}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="notes"
            name="notes"
            label="Notes"
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
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Vital Signs
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            id="vital_signs.temperature"
            name="vital_signs.temperature"
            label="Temperature"
            placeholder="e.g., 36.5°C"
            value={formik.values.vital_signs.temperature}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            id="vital_signs.blood_pressure"
            name="vital_signs.blood_pressure"
            label="Blood Pressure"
            placeholder="e.g., 120/80 mmHg"
            value={formik.values.vital_signs.blood_pressure}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            id="vital_signs.pulse"
            name="vital_signs.pulse"
            label="Pulse"
            placeholder="e.g., 72 bpm"
            value={formik.values.vital_signs.pulse}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            id="vital_signs.respiratory_rate"
            name="vital_signs.respiratory_rate"
            label="Respiratory Rate"
            placeholder="e.g., 16 breaths/min"
            value={formik.values.vital_signs.respiratory_rate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            id="vital_signs.weight"
            name="vital_signs.weight"
            label="Weight"
            placeholder="e.g., 65 kg"
            value={formik.values.vital_signs.weight}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            id="vital_signs.height"
            name="vital_signs.height"
            label="Height"
            placeholder="e.g., 175 cm"
            value={formik.values.vital_signs.height}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Grid>
      </Grid>
    </>
  );

  if (loading && !patient) {
    return (
      <MainLayout title="Patient Visits">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error && !patient) {
    return (
      <MainLayout title="Patient Visits">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          component={RouterLink} 
          to="/patients" 
          variant="contained"
          startIcon={<ArrowBackIcon />}
        >
          Back to Patients
        </Button>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={patient ? `Visits: ${patient.first_name} ${patient.last_name}` : 'Patient Visits'}
      breadcrumbs={[
        { name: 'Patients', path: '/patients' },
        { name: patient ? `${patient.first_name} ${patient.last_name}` : 'Patient', path: `/patients/${id}` },
        { name: 'Visits', active: true }
      ]}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              component={RouterLink}
              to={`/patients/${id}`}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              Visit History
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddVisit}
          >
            Record New Visit
          </Button>
        </Box>

        {patient && (
          <Box sx={{ mb: 3 }}>
            <Card>
              <CardHeader
                title={`${patient.first_name} ${patient.last_name} ${patient.other_names || ''}`}
                subheader={`ID: ${patient.registration_number || 'PAT' + id} | Gender: ${patient.gender || 'Not specified'} | DOB: ${formatDate(patient.date_of_birth)}`}
              />
            </Card>
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="visit tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<LocalHospitalIcon />} label="All Visits" />
            <Tab icon={<HealingIcon />} label="Illness" />
            <Tab icon={<AssignmentIcon />} label="Checkups" />
            <Tab icon={<WarningIcon />} label="Emergency" />
            <Tab icon={<MonitorWeightIcon />} label="Vital Signs" />
          </Tabs>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder="Search visits..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ flexGrow: 1, maxWidth: { xs: '100%', sm: 300 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="sort-label">Sort By</InputLabel>
            <Select
              labelId="sort-label"
              id="sort-by"
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
              size="small"
              startAdornment={<SortIcon fontSize="small" sx={{ mr: 1 }} />}
            >
              <MenuItem value="date_desc">Latest First</MenuItem>
              <MenuItem value="date_asc">Oldest First</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="filter-label">Visit Type</InputLabel>
            <Select
              labelId="filter-label"
              id="filter-type"
              value={filterType}
              label="Visit Type"
              onChange={handleFilterChange}
              size="small"
              startAdornment={<FilterListIcon fontSize="small" sx={{ mr: 1 }} />}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="routine">Routine Checkup</MenuItem>
              <MenuItem value="illness">Illness</MenuItem>
              <MenuItem value="follow">Follow-up</MenuItem>
              <MenuItem value="vaccination">Vaccination</MenuItem>
              <MenuItem value="prenatal">Prenatal</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Visit list */}
        {filteredAndSortedVisits.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No visit records found. Click "Record New Visit" to add one.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {filteredAndSortedVisits.map((visit) => (
              <Grid item xs={12} key={visit.id}>
                <Card>
                  <CardHeader
                    title={`Visit on ${formatDate(visit.visit_date)}`}
                    subheader={`Purpose: ${visit.purpose}`}
                    action={
                      <Box>
                        <IconButton 
                          aria-label="edit visit"
                          onClick={() => handleEditVisit(visit)}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          aria-label="delete visit"
                          onClick={() => handleDeleteVisit(visit)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Diagnosis
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {visit.diagnosis || 'None recorded'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Treatment
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {visit.treatment || 'None recorded'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Notes
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {visit.notes || 'No notes recorded'}
                        </Typography>
                      </Grid>
                      {visit.vital_signs && (
                        <Grid item xs={12}>
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Vital Signs
                            </Typography>
                            <Grid container spacing={1} sx={{ mt: 1 }}>
                              {visit.vital_signs.temperature && (
                                <Grid item xs={6} sm={4} md={2}>
                                  <Chip 
                                    label={`Temp: ${visit.vital_signs.temperature}`} 
                                    size="small" 
                                    variant="outlined" 
                                  />
                                </Grid>
                              )}
                              {visit.vital_signs.blood_pressure && (
                                <Grid item xs={6} sm={4} md={2}>
                                  <Chip 
                                    label={`BP: ${visit.vital_signs.blood_pressure}`} 
                                    size="small" 
                                    variant="outlined" 
                                  />
                                </Grid>
                              )}
                              {visit.vital_signs.pulse && (
                                <Grid item xs={6} sm={4} md={2}>
                                  <Chip 
                                    label={`Pulse: ${visit.vital_signs.pulse}`} 
                                    size="small" 
                                    variant="outlined" 
                                  />
                                </Grid>
                              )}
                              {visit.vital_signs.weight && (
                                <Grid item xs={6} sm={4} md={2}>
                                  <Chip 
                                    label={`Weight: ${visit.vital_signs.weight}`} 
                                    size="small" 
                                    variant="outlined" 
                                  />
                                </Grid>
                              )}
                              {visit.vital_signs.height && (
                                <Grid item xs={6} sm={4} md={2}>
                                  <Chip 
                                    label={`Height: ${visit.vital_signs.height}`} 
                                    size="small" 
                                    variant="outlined" 
                                  />
                                </Grid>
                              )}
                            </Grid>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Add Visit Dialog */}
      <Dialog 
        open={isAddModalOpen} 
        onClose={handleCloseAddModal}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={addFormik.handleSubmit}>
          <DialogTitle>Record New Visit</DialogTitle>
          <DialogContent dividers>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            {renderVisitForm(addFormik)}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddModal}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={!addFormik.isValid || addFormik.isSubmitting}
            >
              Save Visit
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Visit Dialog */}
      <Dialog 
        open={isEditModalOpen} 
        onClose={handleCloseEditModal}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={editFormik.handleSubmit}>
          <DialogTitle>Edit Visit Record</DialogTitle>
          <DialogContent dividers>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            {renderVisitForm(editFormik)}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditModal}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={!editFormik.isValid || editFormik.isSubmitting}
            >
              Update Visit
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this visit record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
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
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default PatientVisits;