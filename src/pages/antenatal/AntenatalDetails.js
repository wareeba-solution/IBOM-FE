// src/pages/antenatal/AntenatalDetail.js
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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  GetApp as DownloadIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  MedicalServices as MedicalIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  PregnantWoman as PregnantWomanIcon,
  ChildCare as ChildCareIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  DateRange as DateRangeIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { format, parseISO, differenceInWeeks, addWeeks } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Helper function to create valid date strings in YYYY-MM-DD format
function createValidDateString(year, month, day) {
  // Ensure month is between 0-11
  month = Math.max(0, Math.min(11, month));

  // Get the last day of the month
  const lastDay = new Date(year, month + 1, 0).getDate();

  // Ensure day is valid for the month (between 1 and lastDay)
  day = Math.max(1, Math.min(lastDay, day));

  // Create date and format as YYYY-MM-DD
  const date = new Date(year, month, day);
  return date.toISOString().split('T')[0];
}

// Helper function to safely add days to a date string
function addDaysToDateString(dateString, daysToAdd) {
  try {
    const date = new Date(dateString);
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error adding days to date:', error);
    return dateString; // Return original if error
  }
}

// Helper function to safely add weeks to a date string
function addWeeksToDateString(dateString, weeksToAdd) {
  try {
    const date = new Date(dateString);
    date.setDate(date.getDate() + (weeksToAdd * 7));
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error adding weeks to date:', error);
    return dateString; // Return original if error
  }
}

// Helper function to safely calculate weeks between dates
function calculateWeeksBetween(startDateString, endDateString) {
  try {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  } catch (error) {
    console.error('Error calculating weeks between dates:', error);
    return 0; // Return 0 if error
  }
}

// Mock antenatal service - replace with actual service when available
const antenatalService = {
  getAntenatalRecordById: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const parsedId = parseInt(id) || 1; // Default to 1 if parsing fails

          // Base year and safe month/day calculations
          const baseYear = 2023;
          const month = parsedId % 12;
          const day = (parsedId % 20) + 1; // Keep day between 1-21 to avoid month boundary issues

          // Create LMP date as a string (Last Menstrual Period)
          const lmpDateString = createValidDateString(baseYear - (parsedId % 2), month, day);

          // Create registration date (10-40 days after LMP)
          const registrationDateString = addDaysToDateString(lmpDateString, (parsedId % 30) + 10);

          // Get current date
          const currentDateString = new Date().toISOString().split('T')[0];

          // Calculate gestational age in weeks
          const gestationalAge = calculateWeeksBetween(lmpDateString, currentDateString);

          // Calculate EDD (Estimated Due Date): LMP + 280 days (40 weeks)
          const eddDateString = addDaysToDateString(lmpDateString, 280);

          // Calculate age and date of birth
          const age = 20 + (parsedId % 15);
          const dobString = createValidDateString(
            new Date().getFullYear() - age,
            month,
            day
          );

          // Calculate next appointment date (1-14 days from current date)
          const nextAppointmentString = addDaysToDateString(
            currentDateString,
            (parsedId % 14) + 1
          );

          const mockAntenatalRecord = {
            id,
            registration_number: `ANC${10000 + parsedId}`,
            patient_name: `${parsedId % 2 === 0 ? 'Mary' : 'Sarah'} ${['Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis'][parsedId % 7]} ${id}`,
            patient_id: `PT${5000 + parsedId}`,
            age: age,
            date_of_birth: dobString,
            lmp: lmpDateString,
            edd: eddDateString,
            gestational_age: gestationalAge > 0 ? gestationalAge : 4,
            gravida: 1 + (parsedId % 4),
            parity: parsedId % 3,
            phone_number: `080${id}${id}${id}${id}${id}${id}`,
            address: `Address ${id}, Akwa Ibom`,
            risk_level: parsedId % 10 === 0 ? 'high' : (parsedId % 5 === 0 ? 'medium' : 'low'),
            risk_factors: parsedId % 10 === 0 ? ['Previous C-section', 'Hypertension'] :
              (parsedId % 5 === 0 ? ['Advanced maternal age'] : []),
            registration_date: registrationDateString,
            next_appointment: nextAppointmentString,
            visit_count: parsedId % 8,
            blood_type: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][parsedId % 8],
            status: parsedId % 20 === 0 ? 'delivered' : (parsedId % 15 === 0 ? 'transferred' : (parsedId % 10 === 0 ? 'inactive' : 'active')),
            created_at: registrationDateString,

            // Additional fields for detail view
            height_cm: 150 + (parsedId % 30),
            weight_kg: 50 + (parsedId % 30),
            bmi: ((50 + (parsedId % 30)) / Math.pow((150 + (parsedId % 30)) / 100, 2)).toFixed(1),
            blood_pressure: `${110 + (parsedId % 30)}/${70 + (parsedId % 20)}`,
            hiv_status: 'Negative',
            syphilis_status: 'Negative',
            hepatitis_b_status: 'Negative',
            hemoglobin: (10 + (parsedId % 4)).toFixed(1),
            urinalysis: 'Normal',
            tetanus_vaccination: parsedId % 3 === 0 ? 'Complete' : 'Incomplete',
            malaria_prophylaxis: parsedId % 4 === 0 ? 'Not received' : 'Received',
            iron_folate_supplementation: parsedId % 5 === 0 ? 'Not received' : 'Received',
            husband_name: `John ${['Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis'][parsedId % 7]}`,
            husband_contact: `070${id}${id}${id}${id}${id}${id}`,
            nearest_health_facility: `Health Center ${parsedId % 5 + 1}`,
            emergency_contact_name: `${['Alice', 'Jane', 'Emily', 'Susan', 'Margaret'][parsedId % 5]} ${['Johnson', 'Smith', 'Williams', 'Brown', 'Jones'][parsedId % 5]}`,
            emergency_contact_phone: `090${id}${id}${id}${id}${id}${id}`,
            emergency_contact_relationship: ['Mother', 'Sister', 'Friend', 'Aunt', 'Mother-in-law'][parsedId % 5],
            notes: parsedId % 10 === 0 ? 'Patient has a history of hypertension. Monitor BP closely.' : ''
          };

          resolve(mockAntenatalRecord);
        } catch (error) {
          console.error('Error generating mock antenatal data:', error);
          // Return a minimal object if there's an error
          resolve({
            id,
            registration_number: `ANC${10000 + parseInt(id)}`,
            patient_name: "Unknown Patient",
            lmp: new Date().toISOString().split('T')[0],
            edd: new Date().toISOString().split('T')[0],
            gestational_age: 0,
            risk_level: "unknown",
            status: "unknown"
          });
        }
      }, 500);
    });
  },
  getAntenatalVisits: async (antenatalId) => {
    // Simulate API call to get visit history
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const parsedId = parseInt(antenatalId) || 1;
          const visitCount = parsedId % 8;

          // First get the antenatal record to get the LMP date
          antenatalService.getAntenatalRecordById(antenatalId)
            .then(record => {
              const lmpDateString = record.lmp;

              // Generate visits
              const visits = [];
              for (let i = 0; i < visitCount; i++) {
                // First visit at week 4, then every 4 weeks
                const gestationalAge = 4 + i * 4;
                const visitDateString = addWeeksToDateString(lmpDateString, gestationalAge);
                const nextAppointmentString = addWeeksToDateString(visitDateString, 4);

                visits.push({
                  id: i + 1,
                  visit_number: i + 1,
                  visit_date: visitDateString,
                  gestational_age: gestationalAge,
                  weight_kg: 50 + (parsedId % 30) + (i * 0.5),
                  blood_pressure: `${110 + (parsedId % 30) + (i % 3 === 0 ? i * 2 : 0)}/${70 + (parsedId % 20) + (i % 3 === 0 ? i : 0)}`,
                  fundal_height_cm: gestationalAge < 20 ? null : gestationalAge - 2 + (i % 2),
                  fetal_heart_rate: gestationalAge < 12 ? null : 140 + (i * 2 % 10),
                  fetal_movement: gestationalAge < 20 ? null : 'Present',
                  urine_test: ['Normal', 'Trace protein', 'Normal', 'Normal', 'Glucose +'][i % 5],
                  hemoglobin: (10 + (parsedId % 4) + (i * 0.2)).toFixed(1),
                  complaints: i % 3 === 0 ? ['Fatigue', 'Nausea'][i % 2] : null,
                  interventions: i % 4 === 0 ? 'Iron supplementation increased' : 'Routine care',
                  next_appointment: nextAppointmentString,
                  notes: i % 5 === 0 ? 'Patient reports improved sleep.' : '',
                  provider: `Nurse ${i % 5 + 1}`
                });
              }

              resolve(visits);
            })
            .catch(error => {
              console.error('Error fetching antenatal record for visits:', error);
              resolve([]);
            });
        } catch (error) {
          console.error('Error generating mock antenatal visits:', error);
          resolve([]);
        }
      }, 300);
    });
  },
  deleteAntenatalRecord: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  },
  saveAntenatalVisit: async (antenatalId, visitData) => {
    // Simulate API call to save a new visit
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true,
          id: Math.floor(Math.random() * 1000),
          visit_number: visitData.visit_number || 1,
          ...visitData
        });
      }, 500);
    });
  }
};

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`antenatal-tabpanel-${index}`}
      aria-labelledby={`antenatal-tab-${index}`}
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

const AntenatalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [antenatalRecord, setAntenatalRecord] = useState(null);
  const [visitHistory, setVisitHistory] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [newVisitDialogOpen, setNewVisitDialogOpen] = useState(false);
  
  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  // New visit form state
  const [visitFormData, setVisitFormData] = useState({
    visit_date: new Date(),
    gestational_age: 0,
    weight_kg: '',
    blood_pressure: '',
    fundal_height_cm: '',
    fetal_heart_rate: '',
    fetal_movement: '',
    urine_test: 'Normal',
    hemoglobin: '',
    next_appointment: new Date(new Date().setDate(new Date().getDate() + 28)), // Default to 4 weeks from today
    complaints: '',
    interventions: 'Routine care',
    notes: '',
    provider: 'Nurse 1',
    risk_assessment: 'low'
  });

  // Form handlers
  const handleVisitFormChange = (event) => {
    const { name, value } = event.target;
    setVisitFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVisitDateChange = (date) => {
    setVisitFormData(prev => ({
      ...prev,
      visit_date: date
    }));
  };

  const handleNextAppointmentChange = (date) => {
    setVisitFormData(prev => ({
      ...prev,
      next_appointment: date
    }));
  };

  const handleAlertClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertOpen(false);
  };

  // Fetch antenatal record data
  useEffect(() => {
    const loadAntenatalRecord = async () => {
      await execute(
        antenatalService.getAntenatalRecordById,
        [id],
        (response) => {
          setAntenatalRecord(response);

          // Also fetch visit history
          execute(
            antenatalService.getAntenatalVisits,
            [id],
            (visitsResponse) => {
              setVisitHistory(visitsResponse);
            }
          );
        }
      );
    };

    loadAntenatalRecord();
  }, [id, execute]);

  // Initialize form with antenatal record data when available
  useEffect(() => {
    if (antenatalRecord) {
      setVisitFormData(prev => ({
        ...prev,
        gestational_age: antenatalRecord.gestational_age || 0,
        weight_kg: antenatalRecord.weight_kg || '',
        blood_pressure: antenatalRecord.blood_pressure || '',
        hemoglobin: antenatalRecord.hemoglobin || '',
        risk_assessment: antenatalRecord.risk_level || 'low'
      }));
    }
  }, [antenatalRecord]);

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
  const handleEditRecord = () => {
    navigate(`/antenatal/${id}/edit`);
    handleMenuClose();
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
      antenatalService.deleteAntenatalRecord,
      [id],
      () => {
        navigate('/antenatal');
      }
    );
  };

  // Handle new visit
  const handleNewVisitClick = () => {
    setNewVisitDialogOpen(true);
    handleMenuClose();
  };

  const handleNewVisitDialogClose = () => {
    setNewVisitDialogOpen(false);
  };

  // Handle new visit form submission
  const handleNewVisitSubmit = async () => {
    try {
      // Format dates for the API
      const formattedData = {
        ...visitFormData,
        visit_date: format(new Date(visitFormData.visit_date), 'yyyy-MM-dd'),
        next_appointment: format(new Date(visitFormData.next_appointment), 'yyyy-MM-dd')
      };
      
      // Create a new visit object to add to the visit history
      const newVisit = {
        id: visitHistory.length + 1,
        visit_number: visitHistory.length + 1,
        visit_date: formattedData.visit_date,
        gestational_age: parseInt(formattedData.gestational_age),
        weight_kg: parseFloat(formattedData.weight_kg),
        blood_pressure: formattedData.blood_pressure,
        fundal_height_cm: formattedData.fundal_height_cm ? parseFloat(formattedData.fundal_height_cm) : null,
        fetal_heart_rate: formattedData.fetal_heart_rate ? parseInt(formattedData.fetal_heart_rate) : null,
        fetal_movement: formattedData.fetal_movement || null,
        urine_test: formattedData.urine_test,
        hemoglobin: formattedData.hemoglobin ? parseFloat(formattedData.hemoglobin) : null,
        complaints: formattedData.complaints || null,
        interventions: formattedData.interventions,
        next_appointment: formattedData.next_appointment,
        notes: formattedData.notes || '',
        provider: formattedData.provider
      };
      
      // Call the service to save the visit
      await execute(
        antenatalService.saveAntenatalVisit,
        [id, newVisit],
        (response) => {
          // Update the visit history state
          setVisitHistory(prevHistory => [newVisit, ...prevHistory]);
          
          // Update the antenatal record with new values
          setAntenatalRecord(prev => ({
            ...prev,
            gestational_age: parseInt(formattedData.gestational_age),
            weight_kg: parseFloat(formattedData.weight_kg),
            blood_pressure: formattedData.blood_pressure,
            next_appointment: formattedData.next_appointment,
            visit_count: prev.visit_count + 1,
            risk_level: formattedData.risk_assessment
          }));
          
          // Show success message
          setAlertMessage('Visit recorded successfully');
          setAlertSeverity('success');
          setAlertOpen(true);
          
          // Close the dialog
          setNewVisitDialogOpen(false);
          
          // Reset the form data for next time
          setVisitFormData({
            visit_date: new Date(),
            gestational_age: antenatalRecord.gestational_age,
            weight_kg: antenatalRecord.weight_kg,
            blood_pressure: antenatalRecord.blood_pressure,
            fundal_height_cm: '',
            fetal_heart_rate: '',
            fetal_movement: '',
            urine_test: 'Normal',
            hemoglobin: antenatalRecord.hemoglobin,
            next_appointment: new Date(new Date().setDate(new Date().getDate() + 28)),
            complaints: '',
            interventions: 'Routine care',
            notes: '',
            provider: 'Nurse 1',
            risk_assessment: antenatalRecord.risk_level
          });
        }
      );
    } catch (error) {
      // Show error message
      setAlertMessage('Failed to record visit. Please try again.');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Calculate trimester from gestational age
  const getTrimester = (gestationalAge) => {
    if (gestationalAge <= 12) return '1st Trimester';
    if (gestationalAge <= 27) return '2nd Trimester';
    return '3rd Trimester';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'delivered':
        return 'info';
      case 'transferred':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Get risk level color
  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading && !antenatalRecord) {
    return (
      <MainLayout title="Antenatal Record Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error && !antenatalRecord) {
    return (
      <MainLayout title="Antenatal Record Details">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          component={RouterLink} 
          to="/antenatal" 
          variant="contained"
          startIcon={<ArrowBackIcon />}
        >
          Back to Antenatal Records
        </Button>
      </MainLayout>
    );
  }

  if (!antenatalRecord) {
    return (
      <MainLayout title="Antenatal Record Details">
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading antenatal record information...
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={`Antenatal Record: ${antenatalRecord.patient_name}`}
      breadcrumbs={[
        { name: 'Antenatal', path: '/antenatal' },
        { name: antenatalRecord.patient_name, active: true }
      ]}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/antenatal"
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              Antenatal Record Details
            </Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleNewVisitClick}
              sx={{ mr: 1 }}
            >
              New Visit
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEditRecord}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <IconButton
              aria-label="more options"
              aria-controls="antenatal-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="antenatal-menu"
              anchorEl={menuAnchorEl}
              keepMounted
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEditRecord}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Edit Record" />
              </MenuItem>
              <MenuItem onClick={handleNewVisitClick}>
                <ListItemIcon>
                  <AddIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="New Visit" />
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <PrintIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Print Record" />
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ShareIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Share Record" />
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Download PDF" />
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

        <Box sx={{ mb: 4 }}>
          <Card>
            <CardHeader
              title={antenatalRecord.patient_name}
              subheader={`Registration Number: ${antenatalRecord.registration_number} | Patient ID: ${antenatalRecord.patient_id}`}
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={antenatalRecord.risk_level + ' risk'}
                    color={getRiskLevelColor(antenatalRecord.risk_level)}
                    size="medium"
                    variant="outlined"
                    icon={antenatalRecord.risk_level === 'high' ? <WarningIcon /> : undefined}
                  />
                  <Chip
                    label={antenatalRecord.status}
                    color={getStatusColor(antenatalRecord.status)}
                    size="medium"
                    variant="outlined"
                  />
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Gestational Age
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {antenatalRecord.gestational_age} weeks ({getTrimester(antenatalRecord.gestational_age)})
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Menstrual Period (LMP)
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(antenatalRecord.lmp)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Expected Delivery Date (EDD)
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(antenatalRecord.edd)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Next Appointment
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(antenatalRecord.next_appointment)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="antenatal record tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<PersonIcon />} iconPosition="start" label="Patient Details" />
              <Tab icon={<PregnantWomanIcon />} iconPosition="start" label="Obstetric History" />
              <Tab icon={<MedicalIcon />} iconPosition="start" label="Medical Information" />
              <Tab icon={<CalendarIcon />} iconPosition="start" label="Visit History" />
              <Tab icon={<TimelineIcon />} iconPosition="start" label="Progress" />
            </Tabs>
          </Box>

          {/* Patient Details Tab */}
          <TabPanel value={tabValue} index={0}>
            <Card>
              <CardHeader
                title="Patient Information"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.patient_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Patient ID
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.patient_id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Age
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.age} years
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date of Birth
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(antenatalRecord.date_of_birth)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Phone Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.phone_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Blood Type
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.blood_type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.address}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardHeader
                title="Emergency Contact Information"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Husband/Partner Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.husband_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Husband/Partner Contact
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.husband_contact}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nearest Health Facility
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.nearest_health_facility}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Emergency Contact Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.emergency_contact_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Emergency Contact Phone
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.emergency_contact_phone}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Relationship
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.emergency_contact_relationship}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Obstetric History Tab */}
          <TabPanel value={tabValue} index={1}>
            <Card>
              <CardHeader
                title="Pregnancy Information"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Gravida (Total Pregnancies)
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {antenatalRecord.gravida}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Parity (Previous Births)
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {antenatalRecord.parity}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Menstrual Period (LMP)
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(antenatalRecord.lmp)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Expected Delivery Date (EDD)
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(antenatalRecord.edd)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Gestational Age
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.gestational_age} weeks ({getTrimester(antenatalRecord.gestational_age)})
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Registration Date
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(antenatalRecord.registration_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Risk Level
                    </Typography>
                    <Chip
                      label={antenatalRecord.risk_level + ' risk'}
                      color={getRiskLevelColor(antenatalRecord.risk_level)}
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={antenatalRecord.status}
                      color={getStatusColor(antenatalRecord.status)}
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                {antenatalRecord.risk_factors && antenatalRecord.risk_factors.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Risk Factors
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {antenatalRecord.risk_factors.map((factor, index) => (
                        <Chip
                          key={index}
                          label={factor}
                          color="error"
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {antenatalRecord.notes && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.notes}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Previous Pregnancies would be shown here if this wasn't first pregnancy */}
            {antenatalRecord.gravida > 1 && (
              <Card sx={{ mt: 3 }}>
                <CardHeader
                  title="Previous Pregnancies"
                />
                <Divider />
                <CardContent>
                  {/* This would show previous pregnancy history if available */}
                  <Alert severity="info">
                    Previous pregnancy information not available in mock data.
                  </Alert>
                </CardContent>
              </Card>
            )}
          </TabPanel>

          {/* Medical Information Tab */}
          <TabPanel value={tabValue} index={2}>
            <Card>
              <CardHeader
                title="Physical Measurements"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Height
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.height_cm} cm
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Current Weight
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.weight_kg} kg
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      BMI
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.bmi} kg/m²
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Blood Pressure
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.blood_pressure} mmHg
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardHeader
                title="Laboratory Tests"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Blood Type
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.blood_type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      HIV Status
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.hiv_status}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Syphilis Status
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.syphilis_status}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Hepatitis B Status
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.hepatitis_b_status}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Hemoglobin Level
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.hemoglobin} g/dL
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Urinalysis
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.urinalysis}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardHeader
                title="Preventive Measures"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tetanus Vaccination
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.tetanus_vaccination}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Malaria Prophylaxis
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.malaria_prophylaxis}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Iron/Folate Supplementation
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.iron_folate_supplementation}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Visit History Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Visit History ({visitHistory.length} visits)
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleNewVisitClick}
              >
                Record New Visit
              </Button>
            </Box>

            {visitHistory.length === 0 ? (
              <Alert severity="info">
                No visits have been recorded yet for this patient.
              </Alert>
            ) : (
              <>
                {visitHistory.map((visit, index) => (
                  <Accordion key={visit.id} defaultExpanded={index === 0}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1">
                          Visit {visit.visit_number} ({formatDate(visit.visit_date)})
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {visit.gestational_age} weeks
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Gestational Age
                          </Typography>
                          <Typography variant="body1">
                            {visit.gestational_age} weeks ({getTrimester(visit.gestational_age)})
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Weight
                          </Typography>
                          <Typography variant="body1">
                            {visit.weight_kg} kg
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Blood Pressure
                          </Typography>
                          <Typography variant="body1">
                            {visit.blood_pressure} mmHg
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Hemoglobin
                          </Typography>
                          <Typography variant="body1">
                            {visit.hemoglobin} g/dL
                          </Typography>
                        </Grid>

                        {visit.fundal_height_cm && (
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Fundal Height
                            </Typography>
                            <Typography variant="body1">
                              {visit.fundal_height_cm} cm
                            </Typography>
                          </Grid>
                        )}

                        {visit.fetal_heart_rate && (
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Fetal Heart Rate
                            </Typography>
                            <Typography variant="body1">
                              {visit.fetal_heart_rate} bpm
                            </Typography>
                          </Grid>
                        )}

                        {visit.fetal_movement && (
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Fetal Movement
                            </Typography>
                            <Typography variant="body1">
                              {visit.fetal_movement}
                            </Typography>
                          </Grid>
                        )}

                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Urine Test
                          </Typography>
                          <Typography variant="body1">
                            {visit.urine_test}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Healthcare Provider
                          </Typography>
                          <Typography variant="body1">
                            {visit.provider}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Next Appointment
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(visit.next_appointment)}
                          </Typography>
                        </Grid>

                        {visit.complaints && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Complaints
                            </Typography>
                            <Typography variant="body1">
                              {typeof visit.complaints === 'string' ? visit.complaints : visit.complaints.join(', ')}
                            </Typography>
                          </Grid>
                        )}

                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Interventions
                          </Typography>
                          <Typography variant="body1">
                            {visit.interventions}
                          </Typography>
                        </Grid>

                        {visit.notes && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Notes
                            </Typography>
                            <Typography variant="body1">
                              {visit.notes}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </>
            )}
          </TabPanel>

          {/* Progress Tab */}
          <TabPanel value={tabValue} index={4}>
            <Card>
              <CardHeader
                title="Pregnancy Progress"
                subheader="Visual tracking of pregnancy progress and key metrics"
              />
              <Divider />
              <CardContent>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Gestational Progress
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(antenatalRecord.gestational_age / 40) * 100}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {antenatalRecord.gestational_age}/40
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Currently in {getTrimester(antenatalRecord.gestational_age)}
                  </Typography>
                </Box>

                {/* Weight Progress Chart */}
                {visitHistory.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Weight Progression
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Visit</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Gestational Age</TableCell>
                            <TableCell>Weight (kg)</TableCell>
                            <TableCell>Blood Pressure</TableCell>
                            {visitHistory.some(v => v.fundal_height_cm) && (
                              <TableCell>Fundal Height (cm)</TableCell>
                            )}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {visitHistory.map((visit) => (
                            <TableRow key={visit.id}>
                              <TableCell>{visit.visit_number}</TableCell>
                              <TableCell>{formatDate(visit.visit_date)}</TableCell>
                              <TableCell>{visit.gestational_age} weeks</TableCell>
                              <TableCell>{visit.weight_kg}</TableCell>
                              <TableCell>{visit.blood_pressure}</TableCell>
                              {visitHistory.some(v => v.fundal_height_cm) && (
                                <TableCell>{visit.fundal_height_cm || 'N/A'}</TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* Recommended Schedule */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Recommended Visit Schedule
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Visit</TableCell>
                          <TableCell>Recommended Timing</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          { visit: 'First Visit', timing: '8-12 weeks', completed: visitHistory.length > 0 },
                          { visit: 'Second Visit', timing: '24-26 weeks', completed: visitHistory.length > 1 },
                          { visit: 'Third Visit', timing: '32 weeks', completed: visitHistory.length > 2 },
                          { visit: 'Fourth Visit', timing: '36 weeks', completed: visitHistory.length > 3 },
                          { visit: 'Fifth Visit', timing: '38 weeks', completed: visitHistory.length > 4 },
                          { visit: 'Sixth Visit', timing: '40 weeks', completed: visitHistory.length > 5 }
                        ].map((schedule, index) => (
                          <TableRow key={index}>
                            <TableCell>{schedule.visit}</TableCell>
                            <TableCell>{schedule.timing}</TableCell>
                            <TableCell>
                              <Chip
                                label={schedule.completed ? 'Completed' : 'Pending'}
                                color={schedule.completed ? 'success' : 'default'}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this antenatal record? This action cannot be undone and will remove all associated data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

       {/* New Visit Dialog with Form */}
       <Dialog
        open={newVisitDialogOpen}
        onClose={handleNewVisitDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Record New Antenatal Visit</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Patient: {antenatalRecord.patient_name} | Current gestational age: {antenatalRecord.gestational_age} weeks
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Visit Date *"
                    value={visitFormData.visit_date}
                    onChange={handleVisitDateChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        name="visit_date"
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
                  required
                  label="Gestational Age (Weeks)"
                  name="gestational_age"
                  type="number"
                  value={visitFormData.gestational_age}
                  onChange={handleVisitFormChange}
                  InputProps={{
                    inputProps: { min: 1, max: 45 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Weight (kg)"
                  name="weight_kg"
                  type="number"
                  value={visitFormData.weight_kg}
                  onChange={handleVisitFormChange}
                  InputProps={{
                    inputProps: { min: 30, max: 200, step: 0.1 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Blood Pressure"
                  name="blood_pressure"
                  placeholder="e.g. 120/80"
                  value={visitFormData.blood_pressure}
                  onChange={handleVisitFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fundal Height (cm)"
                  name="fundal_height_cm"
                  type="number"
                  value={visitFormData.fundal_height_cm}
                  onChange={handleVisitFormChange}
                  InputProps={{
                    inputProps: { min: 0, max: 50 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fetal Heart Rate (bpm)"
                  name="fetal_heart_rate"
                  type="number"
                  value={visitFormData.fetal_heart_rate}
                  onChange={handleVisitFormChange}
                  InputProps={{
                    inputProps: { min: 110, max: 180 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="fetal-movement-label">Fetal Movement</InputLabel>
                  <Select
                    labelId="fetal-movement-label"
                    name="fetal_movement"
                    label="Fetal Movement"
                    value={visitFormData.fetal_movement}
                    onChange={handleVisitFormChange}
                  >
                    <MenuItem value="">Not Checked</MenuItem>
                    <MenuItem value="Present">Present</MenuItem>
                    <MenuItem value="Reduced">Reduced</MenuItem>
                    <MenuItem value="Absent">Absent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="urine-test-label">Urine Test</InputLabel>
                  <Select
                    labelId="urine-test-label"
                    name="urine_test"
                    label="Urine Test"
                    value={visitFormData.urine_test}
                    onChange={handleVisitFormChange}
                  >
                    <MenuItem value="Normal">Normal</MenuItem>
                    <MenuItem value="Trace protein">Trace Protein</MenuItem>
                    <MenuItem value="Protein +">Protein +</MenuItem>
                    <MenuItem value="Protein ++">Protein ++</MenuItem>
                    <MenuItem value="Glucose +">Glucose +</MenuItem>
                    <MenuItem value="Glucose ++">Glucose ++</MenuItem>
                    <MenuItem value="Protein and Glucose">Protein and Glucose</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hemoglobin (g/dL)"
                  name="hemoglobin"
                  type="number"
                  value={visitFormData.hemoglobin}
                  onChange={handleVisitFormChange}
                  InputProps={{
                    inputProps: { min: 5, max: 20, step: 0.1 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Next Appointment *"
                    value={visitFormData.next_appointment}
                    onChange={handleNextAppointmentChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
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
              <Grid item xs={12} sm={12}>
                <TextField
                  fullWidth
                  label="Complaints/Symptoms"
                  name="complaints"
                  value={visitFormData.complaints}
                  onChange={handleVisitFormChange}
                  multiline
                  rows={2}
                  placeholder="Enter patient complaints or symptoms"
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <TextField
                  fullWidth
                  label="Interventions"
                  name="interventions"
                  value={visitFormData.interventions}
                  onChange={handleVisitFormChange}
                  multiline
                  rows={2}
                  placeholder="Enter interventions provided during this visit"
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={visitFormData.notes}
                  onChange={handleVisitFormChange}
                  multiline
                  rows={2}
                  placeholder="Enter additional notes regarding this visit"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="provider-label">Healthcare Provider *</InputLabel>
                  <Select
                    labelId="provider-label"
                    name="provider"
                    label="Healthcare Provider *"
                    value={visitFormData.provider}
                    onChange={handleVisitFormChange}
                    required
                  >
                    <MenuItem value="Nurse 1">Nurse 1</MenuItem>
                    <MenuItem value="Nurse 2">Nurse 2</MenuItem>
                    <MenuItem value="Nurse 3">Nurse 3</MenuItem>
                    <MenuItem value="Nurse 4">Nurse 4</MenuItem>
                    <MenuItem value="Nurse 5">Nurse 5</MenuItem>
                    <MenuItem value="Doctor 1">Doctor 1</MenuItem>
                    <MenuItem value="Doctor 2">Doctor 2</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="risk-assessment-label">Risk Assessment</InputLabel>
                  <Select
                    labelId="risk-assessment-label"
                    name="risk_assessment"
                    label="Risk Assessment"
                    value={visitFormData.risk_assessment}
                    onChange={handleVisitFormChange}
                  >
                    <MenuItem value="low">Low Risk</MenuItem>
                    <MenuItem value="medium">Medium Risk</MenuItem>
                    <MenuItem value="high">High Risk</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNewVisitDialogClose}>Cancel</Button>
          <Button
            onClick={handleNewVisitSubmit}
            variant="contained"
            color="primary"
          >
            Save Visit
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

export default AntenatalDetail;