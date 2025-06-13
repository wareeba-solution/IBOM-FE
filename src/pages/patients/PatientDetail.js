// src/pages/patients/PatientDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';
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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Snackbar
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  History as HistoryIcon,
  LocalHospital as MedicalIcon,
  Event as EventIcon,
  AssignmentInd as AssignmentIcon,
  MoreVert as MoreVertIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Healing as HealingIcon,
  MonitorWeight as MonitorWeightIcon,
  PregnantWoman as PregnantIcon,
  ChildCare as ChildCareIcon,
  Groups as GroupsIcon,
  Receipt as ReceiptIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { format, differenceInYears, parseISO } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import patientService, { getPatientById } from '../../services/patientService';
import { useApi } from '../../hooks/useApi';

// Import form components
import VisitForm from '../../components/patients/VisitForm';
import MedicalHistoryForm from '../../components/patients/MedicalHistoryForm';
import ImmunizationForm from '../../components/patients/ImmunizationForm';
import AntenatalForm from '../../components/patients/AntenatalForm';
import DocumentUploadForm from '../../components/patients/DocumentUploadForm';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
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

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [patient, setPatient] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [visits, setVisits] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [immunizations, setImmunizations] = useState([]);
  const [antenatalRecords, setAntenatalRecords] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [visitsError, setVisitsError] = useState(null);
  
  // Form dialog states
  const [visitFormOpen, setVisitFormOpen] = useState(false);
  const [medicalHistoryFormOpen, setMedicalHistoryFormOpen] = useState(false);
  const [immunizationFormOpen, setImmunizationFormOpen] = useState(false);
  const [antenatalFormOpen, setAntenatalFormOpen] = useState(false);
  const [documentUploadFormOpen, setDocumentUploadFormOpen] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });


  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);


  // Fetch patient data
  useEffect(() => {
    if (!id) return;
    const loadPatient = async () => {
      await execute(
        getPatientById,
        [id],
        (response) => {
          // The patient data is in response.data.data
          setPatient(response?.data?.data || null);
        }
      );
    };
    loadPatient();
  }, [id, execute]);

  // Create mock patient for development
  const createMockPatient = (patientId) => {
    // Convert id to number
    const numId = parseInt(patientId, 10);
    const year = 1980 + (numId % 40);
    const month = numId % 12;
    const day = (numId % 28) + 1;

    const dob = new Date(year, month, day);
    
    return {
      id: numId,
      registration_number: `PAT${1000 + numId}`,
      first_name: `First${numId}`,
      last_name: `Last${numId}`,
      other_names: numId % 3 === 0 ? `Middle${numId}` : '',
      gender: numId % 2 === 0 ? 'Male' : 'Female',
      date_of_birth: !isNaN(dob.getTime())
      ? dob.toISOString().split('T')[0]
      : "1990-01-01",
      phone_number: `080${numId}${numId}${numId}${numId}${numId}${numId}`,
      email: numId % 2 === 0 ? `patient${numId}@example.com` : '',
      address: `Address ${numId}, Akwa Ibom`,
      city: 'Uyo',
      state: 'Akwa Ibom',
      postal_code: `23${numId}${numId}${numId}`,
      blood_group: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][numId % 8],
      genotype: ['AA', 'AS', 'SS', 'AC'][numId % 4],
      marital_status: ['Single', 'Married', 'Divorced', 'Widowed'][numId % 4],
      next_of_kin_name: numId % 3 === 0 ? '' : `NOK ${numId}`,
      next_of_kin_relationship: numId % 3 === 0 ? '' : ['Spouse', 'Parent', 'Child', 'Sibling'][numId % 4],
      next_of_kin_phone: numId % 3 === 0 ? '' : `070${numId}${numId}${numId}${numId}${numId}${numId}`,
      notes: numId % 5 === 0 ? 'Patient has a history of hypertension. Regular checkups recommended.' : '',
      status: numId % 10 === 0 ? 'inactive' : 'active',
      //registration_date: new Date(2022, numId % 12, numId % 28 + 1).toISOString().split('T')[0]
    };
  };

  // Fetch visits when tab changes to visits
  useEffect(() => {
    if (tabValue === 1 && patient) {
      loadVisits();
    } else if (tabValue === 2 && patient) {
      loadMedicalHistory();
    } else if (tabValue === 3 && patient) {
      loadImmunizations();
    } else if (tabValue === 4 && patient && patient.gender === 'Female') {
      loadAntenatalRecords();
    } else if ((tabValue === 6 && patient && patient.gender === 'Female') || 
              (tabValue === 5 && patient && patient.gender !== 'Female')) {
      loadDocuments();
    }
  }, [tabValue, patient]);

  // Load patient visits
  const loadVisits = async () => {
    try {
      setVisitsLoading(true);
      setVisitsError(null);
      
      const response = await patientService.getPatientVisits(id);
      setVisits(response?.data || getMockVisits());
    } catch (err) {
      setVisitsError('Failed to load patient visits');
      // Mock data for development
      setVisits(getMockVisits());
    } finally {
      setVisitsLoading(false);
    }
  };

  // Load medical history
  const loadMedicalHistory = async () => {
    // In a real app, this would fetch from the API
    // Mock data for development
    setMedicalHistory([
      {
        id: 1,
        condition: 'Hypertension',
        diagnosis_date: '2019-06-12',
        status: 'Ongoing',
        notes: 'Managed with medication and lifestyle changes'
      },
      {
        id: 2,
        condition: 'Malaria',
        diagnosis_date: '2023-03-25',
        status: 'Resolved',
        notes: 'Treated with antimalarial medication'
      }
    ]);
  };

  // Load immunizations
  const loadImmunizations = async () => {
    // Mock data for development
    setImmunizations([
      {
        id: 1,
        vaccine: 'Tetanus Toxoid',
        date_administered: '2022-11-15',
        administered_by: 'Dr. Johnson',
        next_due_date: '2027-11-15',
        notes: 'No adverse reactions'
      },
      {
        id: 2,
        vaccine: 'Hepatitis B',
        date_administered: '2021-05-28',
        administered_by: 'Nurse Sarah',
        next_due_date: null,
        notes: 'Completed series'
      }
    ]);
  };

  // Load antenatal records
  const loadAntenatalRecords = async () => {
    // Mock data for development
    setAntenatalRecords([
      {
        id: 1,
        visit_date: '2023-04-15',
        gestational_age: '24 weeks',
        weight: '68 kg',
        blood_pressure: '110/70 mmHg',
        fetal_heart_rate: '148 bpm',
        notes: 'Normal pregnancy progression'
      },
      {
        id: 2,
        visit_date: '2023-03-18',
        gestational_age: '20 weeks',
        weight: '66 kg',
        blood_pressure: '115/75 mmHg',
        fetal_heart_rate: '146 bpm',
        notes: 'Ultrasound performed, no abnormalities detected'
      }
    ]);
  };
  
  // Load documents
  const loadDocuments = async () => {
    // Mock data for development
    setDocuments([]);
  };

  // Get mock visits data
  const getMockVisits = () => {
    return [
      {
        id: 1,
        visit_date: '2023-05-12',
        purpose: 'Routine Checkup',
        diagnosis: 'Healthy',
        treatment: 'None',
        notes: 'Patient is in good health',
        vital_signs: {
          temperature: '36.7°C',
          blood_pressure: '120/80 mmHg',
          pulse: '72 bpm',
          respiratory_rate: '16 breaths/min',
          weight: '65 kg',
          height: '175 cm'
        }
      },
      {
        id: 2,
        visit_date: '2023-03-25',
        purpose: 'Illness',
        diagnosis: 'Malaria',
        treatment: 'Prescribed antimalarial medication',
        notes: 'Patient presented with fever, headache, and fatigue',
        vital_signs: {
          temperature: '38.9°C',
          blood_pressure: '115/75 mmHg',
          pulse: '90 bpm',
          respiratory_rate: '18 breaths/min',
          weight: '64 kg',
          height: '175 cm'
        }
      }
    ];
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle menu open
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Navigation actions
  const handleEditPatient = () => {
    navigate(`/patients/${id}/edit`);
  };

  // Handle delete
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    await execute(
      patientService.deletePatient,
      [id],
      () => {
        navigate('/patients');
      }
    );
  };
  
  // Form dialog handlers
  const handleOpenVisitForm = () => {
    setVisitFormOpen(true);
    handleMenuClose();
  };
  
  const handleCloseVisitForm = () => {
    setVisitFormOpen(false);
  };
  
  const handleOpenMedicalHistoryForm = () => {
    setMedicalHistoryFormOpen(true);
  };
  
  const handleCloseMedicalHistoryForm = () => {
    setMedicalHistoryFormOpen(false);
  };
  
  const handleOpenImmunizationForm = () => {
    setImmunizationFormOpen(true);
  };
  
  const handleCloseImmunizationForm = () => {
    setImmunizationFormOpen(false);
  };
  
  const handleOpenAntenatalForm = () => {
    setAntenatalFormOpen(true);
  };
  
  const handleCloseAntenatalForm = () => {
    setAntenatalFormOpen(false);
  };
  
  const handleOpenDocumentUploadForm = () => {
    setDocumentUploadFormOpen(true);
  };
  
  const handleCloseDocumentUploadForm = () => {
    setDocumentUploadFormOpen(false);
  };
  
  // Handle form submissions
  const handleVisitSaved = (visitData) => {
    // Add the new visit to the visits array
    setVisits(prevVisits => [visitData, ...prevVisits]);
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Visit record saved successfully',
      severity: 'success'
    });
  };
  
  const handleMedicalHistorySaved = (historyData) => {
    // Add the new medical history to the array
    setMedicalHistory(prevHistory => [historyData, ...prevHistory]);
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Medical history record saved successfully',
      severity: 'success'
    });
  };
  
  const handleImmunizationSaved = (immunizationData) => {
    // Add the new immunization to the array
    setImmunizations(prevImmunizations => [immunizationData, ...prevImmunizations]);
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Immunization record saved successfully',
      severity: 'success'
    });
  };
  
  const handleAntenatalSaved = (antenatalData) => {
    // Add the new antenatal record to the array
    setAntenatalRecords(prevRecords => [antenatalData, ...prevRecords]);
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Antenatal visit record saved successfully',
      severity: 'success'
    });
  };
  
  const handleDocumentSaved = (documentData) => {
    // Add the new document to the array
    setDocuments(prevDocuments => [documentData, ...prevDocuments]);
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Document uploaded successfully',
      severity: 'success'
    });
  };
  
  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Unknown';
    
    try {
      const dob = parseISO(dateOfBirth);
      const age = differenceInYears(new Date(), dob);
      return `${age} years`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    try {
      return format(parseISO(date), 'MMM dd, yyyy');
    } catch (error) {
      return date;
    }
  };

  if (loading) {
    return (
      <MainLayout title="Patient Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Patient Details">
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

  if (!patient) {
    return (
      <MainLayout title="Patient Details">
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading patient information...
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={`Patient: ${patient.firstName} ${patient.lastName}`}
      breadcrumbs={[
        { name: 'Patients', path: '/patients' },
        { name: `${patient.firstName} ${patient.lastName}`, active: true }
      ]}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/patients"
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              Patient Details
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEditPatient}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <IconButton
              aria-label="more options"
              aria-controls="patient-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="patient-menu"
              anchorEl={menuAnchorEl}
              keepMounted
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleOpenVisitForm}>
                <ListItemIcon>
                  <AddCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Add Visit" />
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <PrintIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Print Details" />
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ShareIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Share Record" />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleDeleteClick}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText primary="Delete" primaryTypographyProps={{ color: 'error' }} />
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: patient.gender === 'Male' ? 'primary.main' : 'secondary.main' }}>
                    <PersonIcon />
                  </Avatar>
                }
                title={`${patient.firstName} ${patient.lastName} ${patient.otherNames || ''}`}
                subheader={`Registration No: ${patient.uniqueIdentifier || 'PAT' + patient.id}`}
                action={
                  <Chip 
                    label={patient.status} 
                    color={patient.status === 'active' ? 'success' : 'default'} 
                    size="small" 
                    variant="outlined" 
                  />
                }
              />
              <Divider />
              <CardContent>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Gender" 
                      secondary={patient.gender || 'Not specified'} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EventIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Date of Birth" 
                      secondary={`${formatDate(patient.dateOfBirth)} (${calculateAge(patient.dateOfBirth)})`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <MedicalIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Blood Group" 
                      secondary={patient.bloodGroup || 'Not available'} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <MedicalIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Genotype" 
                      secondary={patient.genotype || 'Not available'} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AssignmentIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Marital Status" 
                      secondary={patient.maritalStatus || 'Not specified'} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EventIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Registration Date" 
                      secondary={formatDate(patient.registrationDate)} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Card elevation={2}>
              <CardHeader
                title="Contact Information"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Phone Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {patient.phoneNumber || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {patient.email || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {patient.address || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      City/Town
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {patient.city || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      State
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {patient.state || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Postal Code
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {patient.postal_code || 'Not provided'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Card elevation={2} sx={{ mt: 2 }}>
              <CardHeader
                title="Emergency Contact"
              />
              <Divider />
              <CardContent>
                {patient.emergencyContactName ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Emergency Contact
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {patient.emergencyContactName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Relationship
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {patient.emergencyContactRelationship || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Phone Number
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {patient.emergencyContactPhone || 'Not provided'}
                      </Typography>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No emergency contact information provided
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="patient tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<HealingIcon />} label="Medical Notes" />
            <Tab icon={<HistoryIcon />} label="Visit History" />
            <Tab icon={<AssignmentIcon />} label="Medical History" />
            <Tab icon={<GroupsIcon />} label="Immunizations" />
            {patient.gender === 'Female' && <Tab icon={<PregnantIcon />} label="Antenatal Records" />}
            <Tab icon={<MonitorWeightIcon />} label="Vitals History" />
            <Tab icon={<ReceiptIcon />} label="Documents" />
          </Tabs>
        </Box>

        {/* Medical Notes Tab */}
        <TabPanel value={tabValue} index={0}>
          <Card elevation={1}>
            <CardContent>
              {patient.medicalNotes ? (
                <Typography variant="body1">
                  {patient.medicalNotes}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No medical notes available for this patient
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Visit History Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={handleOpenVisitForm}
            >
              Record New Visit
            </Button>
          </Box>
          
          {visitsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : visitsError ? (
            <Alert severity="error">{visitsError}</Alert>
          ) : visits.length === 0 ? (
            <Alert severity="info">No visit records found for this patient</Alert>
          ) : (
            <Grid container spacing={2}>
              {visits.map((visit) => (
                <Grid item xs={12} key={visit.id}>
                  <Card>
                    <CardHeader
                      title={`Visit on ${formatDate(visit.visit_date)}`}
                      subheader={`Purpose: ${visit.purpose}`}
                      action={
                        <IconButton aria-label="view visit">
                          <MoreVertIcon />
                        </IconButton>
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
        </TabPanel>

        {/* Medical History Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={handleOpenMedicalHistoryForm}
            >
              Add Medical History
            </Button>
          </Box>
          
          {medicalHistory.length === 0 ? (
            <Alert severity="info">No medical history records found for this patient</Alert>
          ) : (
            <Grid container spacing={2}>
              {medicalHistory.map((record) => (
                <Grid item xs={12} md={6} key={record.id}>
                  <Card>
                    <CardHeader
                      title={record.condition}
                      subheader={`Diagnosed: ${formatDate(record.diagnosis_date)}`}
                      action={
                        <Chip 
                          label={record.status} 
                          color={record.status === 'Resolved' ? 'success' : 'primary'} 
                          size="small" 
                        />
                      }
                    />
                    <CardContent>
                      <Typography variant="body2">
                        {record.notes}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Immunizations Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={handleOpenImmunizationForm}
            >
              Record Immunization
            </Button>
          </Box>
          
          {immunizations.length === 0 ? (
            <Alert severity="info">No immunization records found for this patient</Alert>
          ) : (
            <Grid container spacing={2}>
              {immunizations.map((record) => (
                <Grid item xs={12} md={6} key={record.id}>
                  <Card>
                    <CardHeader
                      title={record.vaccine}
                      subheader={`Administered: ${formatDate(record.date_administered)}`}
                    />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Administered By
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {record.administered_by}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Next Due Date
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {record.next_due_date ? formatDate(record.next_due_date) : 'N/A'}
                          </Typography>
                        </Grid>
                        {record.notes && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Notes
                            </Typography>
                            <Typography variant="body2">
                              {record.notes}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Antenatal Records Tab */}
        <TabPanel value={tabValue} index={4}>
          {patient.gender !== 'Female' ? (
            <Alert severity="info">Antenatal records are only applicable for female patients</Alert>
          ) : antenatalRecords.length === 0 ? (
            <Alert severity="info">No antenatal records found for this patient</Alert>
          ) : (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<AddCircleIcon />}
                  onClick={handleOpenAntenatalForm}
                >
                  Record Antenatal Visit
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                {antenatalRecords.map((record) => (
                  <Grid item xs={12} key={record.id}>
                    <Card>
                      <CardHeader
                        title={`Visit on ${formatDate(record.visit_date)}`}
                        subheader={`Gestational Age: ${record.gestational_age}`}
                      />
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Weight
                            </Typography>
                            <Typography variant="body2">
                              {record.weight}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Blood Pressure
                            </Typography>
                            <Typography variant="body2">
                              {record.blood_pressure}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Fetal Heart Rate
                            </Typography>
                            <Typography variant="body2">
                              {record.fetal_heart_rate}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Notes
                            </Typography>
                            <Typography variant="body2">
                              {record.notes || 'No notes recorded'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </TabPanel>

        {/* Vitals History Tab */}
        <TabPanel value={tabValue} index={patient.gender === 'Female' ? 5 : 4}>
          <Alert severity="info">
            Vital signs history is available in the visit records for this patient
          </Alert>
        </TabPanel>

        {/* Documents Tab */}
        <TabPanel value={tabValue} index={patient.gender === 'Female' ? 6 : 5}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={handleOpenDocumentUploadForm}
            >
              Upload Document
            </Button>
          </Box>
          
          {documents.length === 0 ? (
            <Alert severity="info">
              No documents have been uploaded for this patient
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {documents.map((doc) => (
                <Grid item xs={12} sm={6} md={4} key={doc.id}>
                  <Card>
                    <CardHeader
                      title={doc.title}
                      subheader={`${doc.document_type} - ${formatDate(doc.document_date)}`}
                    />
                    <CardContent>
                      <Typography variant="body2" paragraph>
                        {doc.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Source: {doc.source || 'Not specified'}
                      </Typography>
                      {doc.files && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2">Attached Files:</Typography>
                          <List dense>
                            {doc.files.map((file, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <DescriptionTwoToneIcon />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={file.name}
                                  secondary={`${formatDate(file.uploaded_at)}`} 
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Paper>

      {/* Form Dialogs */}
      <VisitForm
        open={visitFormOpen}
        onClose={handleCloseVisitForm}
        patientId={id}
        onSaved={handleVisitSaved}
      />
      
      <MedicalHistoryForm
        open={medicalHistoryFormOpen}
        onClose={handleCloseMedicalHistoryForm}
        patientId={id}
        onSaved={handleMedicalHistorySaved}
      />
      
      <ImmunizationForm
        open={immunizationFormOpen}
        onClose={handleCloseImmunizationForm}
        patientId={id}
        onSaved={handleImmunizationSaved}
      />
      
      <AntenatalForm
        open={antenatalFormOpen}
        onClose={handleCloseAntenatalForm}
        patientId={id}
        patient={patient}
        onSaved={handleAntenatalSaved}
      />
      
      <DocumentUploadForm
        open={documentUploadFormOpen}
        onClose={handleCloseDocumentUploadForm}
        patientId={id}
        onSaved={handleDocumentSaved}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this patient record? This action cannot be undone and will remove all associated data including visits, medical history, and documents.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          icon={snackbar.severity === 'success' ? <CheckIcon /> : undefined}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default PatientDetail;