// src/pages/diseases/DiseaseDetail.js
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
  TextField,
  InputLabel,
  FormControl,
  Select
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
  Coronavirus as CoronavirusIcon,
  WarningRounded as WarningIcon,
  ContactPage as ContactIcon,
  AddCircle as AddCircleIcon,
  AccessTime as AccessTimeIcon,
  FiberManualRecord as FiberManualRecordIcon,
  Masks as MasksIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import { format, parseISO, differenceInDays } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import {
   TimelineDot,
   Timeline,
   TimelineItem,
   TimelineOppositeContent,
   TimelineSeparator,
   TimelineConnector,
   TimelineContent
} from '@mui/lab';
import diseaseService from '../../services/diseaseService';
import patientService from '../../services/patientService'; // If available

// Helper function to create a valid date
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

// Helper function to add days to a date string safely
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



// Mock disease service - replace with actual service when available
// Mock disease service - replace with actual service when available
const diseaseServiceMock = {
  getDiseaseById: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const parsedId = parseInt(id) || 1; // Default to 1 if parsing fails
          
          // Base year and create safe date strings
          const baseYear = 2023;
          const month = parsedId % 12;
          const day = (parsedId % 20) + 1; // Keep day between 1-21 to avoid month boundary issues
          
          // Create report date
          const reportDateString = createValidDateString(baseYear, month, day);
          
          // Create onset date (a few days before report date)
          const onsetDays = (parsedId % 5) + 1; // 1-6 days before
          const onsetDateString = addDaysToDateString(reportDateString, -onsetDays);
          
          const diseaseTypes = [
            'Malaria', 'Tuberculosis', 'HIV/AIDS', 'Cholera', 'Typhoid',
            'Measles', 'Meningitis', 'Hepatitis', 'Yellow Fever', 'Lassa Fever',
            'Ebola', 'COVID-19', 'Other'
          ];
          
          // Calculate a valid date of birth based on the given age
          const age = 15 + (parsedId % 60);
          const birthYear = baseYear - age;
          const dobString = createValidDateString(birthYear, month, day);
          
          // Test date (1 day after report)
          const testDateString = addDaysToDateString(reportDateString, 1);
          
          // Create timelines
          const labOrderDateString = addDaysToDateString(reportDateString, 1);
          const resultsDateString = addDaysToDateString(reportDateString, 2);
          
          // For hospitalizations
          let admissionDateString = null;
          let dischargeDateString = null;
          if (parsedId % 10 === 0) {
            admissionDateString = reportDateString;
            if (parsedId % 20 !== 0) { // Not deceased
              dischargeDateString = addDaysToDateString(reportDateString, (parsedId % 7) + 2);
            }
          }
          
          const mockDisease = {
            id,
            case_id: `CDCS${10000 + parsedId}`,
            patient_name: `${parsedId % 2 === 0 ? 'John' : 'Jane'} ${['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller'][parsedId % 7]} ${id}`,
            patient_id: `PT${5000 + parsedId}`,
            age: age,
            gender: parsedId % 2 === 0 ? 'Male' : 'Female',
            disease_type: diseaseTypes[parsedId % diseaseTypes.length],
            onset_date: onsetDateString,
            report_date: reportDateString,
            location: `${['Uyo', 'Ikot Ekpene', 'Eket', 'Oron', 'Abak'][parsedId % 5]}, Akwa Ibom`,
            status: parsedId % 10 === 0 ? 'suspected' : (parsedId % 10 === 1 ? 'probable' : (parsedId % 5 === 0 ? 'confirmed' : 'ruled_out')),
            severity: parsedId % 10 === 0 ? 'severe' : (parsedId % 5 === 0 ? 'moderate' : 'mild'),
            outcome: parsedId % 20 === 0 ? 'death' : (parsedId % 10 === 0 ? 'hospitalized' : (parsedId % 5 === 0 ? 'recovered' : 'under_treatment')),
            is_outbreak: parsedId % 15 === 0,
            reported_by: `Staff ${parsedId % 20 + 1}`,
            note: parsedId % 8 === 0 ? 'Patient has travel history to affected region.' : '',
            created_at: reportDateString,
            
            // Additional fields for detail view
            date_of_birth: dobString,
            phone_number: `080${id}${id}${id}${id}${id}${id}`,
            email: `patient${id}@example.com`,
            address: `Address ${id}, ${['Uyo', 'Ikot Ekpene', 'Eket', 'Oron', 'Abak'][parsedId % 5]}, Akwa Ibom`,
            occupation: ['Teacher', 'Farmer', 'Trader', 'Student', 'Healthcare Worker', 'Office Worker', 'Retired'][parsedId % 7],
            symptoms: [
              'Fever', 'Cough', 'Headache', 'Fatigue', 'Body Aches',
              'Diarrhea', 'Vomiting', 'Rash', 'Sore Throat'
            ].filter((_, i) => parsedId % (i + 2) === 0),
            diagnosis_notes: parsedId % 8 === 0 
              ? 'Patient presented with severe symptoms. Initial rapid diagnostic test positive. Confirmatory tests ordered.' 
              : 'Standard diagnostic protocol followed.',
            treatment: parsedId % 20 === 0 
              ? 'No treatment administered due to patient death.' 
              : (parsedId % 10 === 0 
                ? 'Hospitalized for intensive care and monitoring. IV fluids and antibiotics administered.' 
                : (parsedId % 5 === 0 
                  ? 'Prescription medications and home care instructions provided. Follow-up scheduled.' 
                  : 'Medication prescribed. Patient advised to rest and maintain hydration.')),
            hospital_name: parsedId % 10 === 0 ? `${['General', 'University', 'Community', 'Memorial', 'Regional'][parsedId % 5]} Hospital` : null,
            admission_date: admissionDateString,
            discharge_date: dischargeDateString,
            lab_results: {
              test_date: testDateString,
              test_type: diseaseTypes[parsedId % diseaseTypes.length] === 'Malaria' 
                ? 'Malaria Rapid Diagnostic Test' 
                : (diseaseTypes[parsedId % diseaseTypes.length] === 'COVID-19' 
                  ? 'COVID-19 PCR Test' 
                  : 'Blood Culture'),
              result: parsedId % 5 === 0 ? 'Positive' : (parsedId % 5 === 1 ? 'Negative' : 'Inconclusive'),
              notes: parsedId % 8 === 0 ? 'Sample quality was poor. Recommend retest.' : ''
            },
            contacts: Array.from({ length: parsedId % 5 }, (_, i) => ({
              name: `Contact ${i + 1}`,
              relationship: ['Family Member', 'Co-worker', 'Friend', 'Neighbor', 'Caregiver'][i % 5],
              phone: `090${id}${i}${id}${i}${id}${i}`,
              status: i === 0 ? 'symptomatic' : 'under_observation'
            })),
            case_history: [
              {
                date: reportDateString,
                action: 'Case Reported',
                details: 'Initial case reported to health facility',
                performed_by: `Staff ${parsedId % 20 + 1}`
              },
              {
                date: labOrderDateString,
                action: 'Lab Test Ordered',
                details: `${diseaseTypes[parsedId % diseaseTypes.length]} diagnostic tests ordered`,
                performed_by: `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][parsedId % 5]}`
              },
              {
                date: resultsDateString,
                action: 'Results Received',
                details: `Test results: ${parsedId % 5 === 0 ? 'Positive' : (parsedId % 5 === 1 ? 'Negative' : 'Inconclusive')}`,
                performed_by: 'Lab Technician'
              }
            ]
          };
          
          // Add conditional case history entries
          if (parsedId % 10 === 0) { // Hospitalized
            mockDisease.case_history.push({
              date: admissionDateString,
              action: 'Hospital Admission',
              details: 'Patient admitted for treatment and observation',
              performed_by: `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][parsedId % 5]}`
            });
          }
          
          if (parsedId % 20 === 0) { // Deceased
            mockDisease.case_history.push({
              date: addDaysToDateString(reportDateString, 5),
              action: 'Deceased',
              details: 'Patient succumbed to illness',
              performed_by: `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][parsedId % 5]}`
            });
          }
          
          if (parsedId % 10 === 0 && parsedId % 20 !== 0) { // Discharged
            mockDisease.case_history.push({
              date: dischargeDateString,
              action: 'Hospital Discharge',
              details: 'Patient discharged with follow-up instructions',
              performed_by: `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][parsedId % 5]}`
            });
          }
          
          if (parsedId % 5 === 0 && parsedId % 10 !== 0 && parsedId % 20 !== 0) { // Follow-up visit
            mockDisease.case_history.push({
              date: addDaysToDateString(reportDateString, 14),
              action: 'Follow-up Visit',
              details: 'Patient reported improvement. Treatment completed.',
              performed_by: `Nurse ${parsedId % 10 + 1}`
            });
          }
          
          resolve(mockDisease);
        } catch (error) {
          console.error('Error generating mock disease data:', error);
          // Return a minimal object if there's an error
          resolve({
            id,
            case_id: `CDCS${10000 + parseInt(id)}`,
            patient_name: "Unknown Patient",
            report_date: new Date().toISOString().split('T')[0],
            status: "unknown",
            severity: "unknown",
            outcome: "unknown",
            contacts: [],
            case_history: []
          });
        }
      }, 500);
    });
  },
  // Other methods remain the same...
  deleteDiseaseCase: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  },
  addContact: async (id, contactData) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true,
          contact: {
            ...contactData,
            id: Math.floor(Math.random() * 1000)
          }
        });
      }, 300);
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
      id={`disease-tabpanel-${index}`}
      aria-labelledby={`disease-tab-${index}`}
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

const DiseaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [diseaseCase, setDiseaseCase] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    status: 'under_observation'
  });

  // Fetch disease case data
  useEffect(() => {
    const loadDiseaseCase = async () => {
      await execute(
        diseaseService.getDiseaseCaseById,
        [id],
        async (response) => {
          console.log('Loaded disease case:', response);
          
          // Map API response to component format
          const apiData = response.data || response;
          const mappedCase = diseaseService.mapDiseaseCase(apiData);
          
          // Try to get patient information
          try {
            if (mappedCase.patient_id && patientService) {
              const patientData = await patientService.getPatientById(mappedCase.patient_id);
              if (patientData) {
                mappedCase.patient_name = patientData.firstName && patientData.lastName ? 
                  `${patientData.firstName} ${patientData.lastName}${patientData.otherNames ? ' ' + patientData.otherNames : ''}` :
                  patientData.name || mappedCase.patient_name || 'Unknown Patient';
                mappedCase.age = patientData.age || calculateAge(patientData.dateOfBirth);
                mappedCase.gender = patientData.gender;
                mappedCase.phone_number = patientData.phoneNumber;
                mappedCase.email = patientData.email;
                mappedCase.address = patientData.address;
                mappedCase.occupation = patientData.occupation;
                mappedCase.date_of_birth = patientData.dateOfBirth;
              }
            }
          } catch (patientError) {
            console.warn('Could not fetch patient data:', patientError);
          }
          
          // Try to get contacts
          try {
            const contactsResponse = await diseaseService.getContacts(id);
            mappedCase.contacts = contactsResponse.data || [];
          } catch (contactError) {
            console.warn('Could not fetch contacts:', contactError);
            mappedCase.contacts = [];
          }
          
          // Generate case history from available data
          mappedCase.case_history = generateCaseHistory(mappedCase);
          
          setDiseaseCase(mappedCase);
        }
      );
    };
    
    loadDiseaseCase();
  }, [id, execute]);

  // Helper function to calculate age
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Helper function to generate case history from case data
  const generateCaseHistory = (caseData) => {
    const history = [];
    
    if (caseData.report_date) {
      history.push({
        date: caseData.report_date,
        action: 'Case Reported',
        details: `${caseData.disease_type} case reported to health facility`,
        performed_by: caseData.reported_by || 'Health Facility Staff'
      });
    }
    
    if (caseData.diagnosis_date) {
      history.push({
        date: caseData.diagnosis_date,
        action: 'Diagnosis Made',
        details: `${caseData.diagnosis_type} diagnosis confirmed`,
        performed_by: 'Medical Officer'
      });
    }
    
    if (caseData.lab_test_results?.testDate) {
      history.push({
        date: caseData.lab_test_results.testDate,
        action: 'Lab Results Received',
        details: `${caseData.lab_test_results.testType}: ${caseData.lab_test_results.result}`,
        performed_by: 'Laboratory Technician'
      });
    }
    
    if (caseData.admission_date) {
      history.push({
        date: caseData.admission_date,
        action: 'Hospital Admission',
        details: `Patient admitted to ${caseData.hospital_name || 'hospital'}`,
        performed_by: 'Medical Officer'
      });
    }
    
    if (caseData.discharge_date) {
      history.push({
        date: caseData.discharge_date,
        action: 'Hospital Discharge',
        details: 'Patient discharged with follow-up instructions',
        performed_by: 'Medical Officer'
      });
    }
    
    if (caseData.outcome_date && caseData.outcome === 'death') {
      history.push({
        date: caseData.outcome_date,
        action: 'Deceased',
        details: 'Patient succumbed to illness',
        performed_by: 'Medical Officer'
      });
    }
    
    // Sort by date
    return history.sort((a, b) => new Date(a.date) - new Date(b.date));
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
  const handleEditCase = () => {
    navigate(`/diseases/${id}/edit`);
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
      diseaseService.deleteDiseaseCase,
      [id],
      () => {
        navigate('/diseases');
      }
    );
  };

  // Handle adding new contact
  const handleAddContactClick = () => {
    setContactDialogOpen(true);
    handleMenuClose();
  };

  const handleContactDialogClose = () => {
    setContactDialogOpen(false);
    setNewContact({
      name: '',
      relationship: '',
      phone: '',
      status: 'under_observation'
    });
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setNewContact(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddContact = async () => {
    if (newContact.name && newContact.phone) {
      await execute(
        diseaseService.addContact,
        [id, newContact],
        (response) => {
          // Update local state with new contact
          setDiseaseCase(prev => ({
            ...prev,
            contacts: [...prev.contacts, response.data || response.contact || newContact]
          }));
          handleContactDialogClose();
        }
      );
    }
  };

  // Format date for display - improved with better error handling
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Try to parse as ISO string first
      return format(parseISO(dateString), 'MMMM dd, yyyy');
    } catch (error) {
      try {
        // If that fails, try as direct date object
        return format(new Date(dateString), 'MMMM dd, yyyy');
      } catch (innerError) {
        // If all parsing fails, return the original string
        console.warn('Failed to parse date:', dateString);
        return dateString;
      }
    }
  };

  // Calculate illness duration - improved with better error handling
  const calculateDuration = (onsetDate, outcomeDate) => {
    if (!onsetDate || !outcomeDate) return 'Ongoing';
    
    try {
      const onset = parseISO(onsetDate);
      const outcome = parseISO(outcomeDate);
      const days = differenceInDays(outcome, onset);
      return `${days} days`;
    } catch (error) {
      console.warn('Failed to calculate duration:', error);
      return 'Unknown';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'error';
      case 'suspected':
        return 'warning';
      case 'probable':
        return 'warning';
      case 'ruled_out':
        return 'success';
      case 'symptomatic':
        return 'error';
      case 'under_observation':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get outcome color
  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'death':
        return 'error';
      case 'hospitalized':
        return 'warning';
      case 'recovered':
        return 'success';
      case 'under_treatment':
        return 'info';
      default:
        return 'default';
    }
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'severe':
        return 'error';
      case 'moderate':
        return 'warning';
      case 'mild':
        return 'success';
      default:
        return 'default';
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return '';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format outcome for display
  const formatOutcome = (outcome) => {
    if (!outcome) return '';
    return outcome.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get time line dots color
  const getTimelineDotColor = (action) => {
    switch(action) {
      case 'Case Reported':
        return 'info';
      case 'Lab Test Ordered':
        return 'primary';
      case 'Results Received':
        return 'secondary';
      case 'Hospital Admission':
        return 'warning';
      case 'Hospital Discharge':
        return 'success';
      case 'Deceased':
        return 'error';
      case 'Follow-up Visit':
        return 'success';
      default:
        return 'grey';
    }
  };

  if (loading && !diseaseCase) {
    return (
      <MainLayout title="Disease Case Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error && !diseaseCase) {
    return (
      <MainLayout title="Disease Case Details">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          component={RouterLink} 
          to="/diseases" 
          variant="contained"
          startIcon={<ArrowBackIcon />}
        >
          Back to Disease Cases
        </Button>
      </MainLayout>
    );
  }

  if (!diseaseCase) {
    return (
      <MainLayout title="Disease Case Details">
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading disease case information...
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={`${diseaseCase?.disease_type || 'Disease'} Case: ${diseaseCase?.case_id || 'Loading...'}`}
      breadcrumbs={[
        { name: 'Diseases', path: '/diseases' },
        { name: diseaseCase?.case_id || 'Loading...', active: true }
      ]}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/diseases"
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              {diseaseCase.disease_type} Case Details
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddCircleIcon />}
              onClick={handleAddContactClick}
              sx={{ mr: 1 }}
            >
              Add Contact
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEditCase}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <IconButton
              aria-label="more options"
              aria-controls="disease-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="disease-menu"
              anchorEl={menuAnchorEl}
              keepMounted
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEditCase}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Edit Case" />
              </MenuItem>
              <MenuItem onClick={handleAddContactClick}>
                <ListItemIcon>
                  <AddCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Add Contact" />
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
                <ListItemText primary="Export to PDF" />
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
              title={`${diseaseCase.disease_type} - Case ID: ${diseaseCase.case_id}`}
              subheader={`Patient: ${diseaseCase.patient_name} (ID: ${diseaseCase.patient_id})`}
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {diseaseCase.is_outbreak && (
                    <Chip 
                      label="Outbreak" 
                      color="error" 
                      size="medium" 
                      icon={<WarningIcon />}
                      variant="outlined" 
                    />
                  )}
                  <Chip 
                    label={formatStatus(diseaseCase.status)} 
                    color={getStatusColor(diseaseCase.status)} 
                    size="medium" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={formatOutcome(diseaseCase.outcome)} 
                    color={getOutcomeColor(diseaseCase.outcome)} 
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
                    Date of Onset
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(diseaseCase.onset_date)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date Reported
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(diseaseCase.report_date)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {diseaseCase.location}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Severity
                  </Typography>
                  <Chip 
                    label={diseaseCase.severity.charAt(0).toUpperCase() + diseaseCase.severity.slice(1)} 
                    color={getSeverityColor(diseaseCase.severity)} 
                    size="small" 
                    variant="outlined" 
                  />
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
              aria-label="disease case tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<PersonIcon />} iconPosition="start" label="Patient Details" />
              <Tab icon={<MedicalIcon />} iconPosition="start" label="Clinical Information" />
              <Tab icon={<ContactIcon />} iconPosition="start" label="Contact Tracing" />
              <Tab icon={<AccessTimeIcon />} iconPosition="start" label="Case Timeline" />
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
                      {diseaseCase.patient_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Patient ID
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {diseaseCase.patient_id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Gender
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {diseaseCase.gender}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Age
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {diseaseCase.age} years
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date of Birth
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(diseaseCase.date_of_birth)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Occupation
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {diseaseCase.occupation}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Phone Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {diseaseCase.phone_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {diseaseCase.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {diseaseCase.address}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardHeader
                title="Disease Notification Details"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Case ID
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {diseaseCase.case_id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Disease Type
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {diseaseCase.disease_type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Reported By
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {diseaseCase.reported_by}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date of Onset
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(diseaseCase.onset_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date Reported
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(diseaseCase.report_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {diseaseCase.location}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Current Status
                    </Typography>
                    <Chip 
                      label={formatStatus(diseaseCase.status)} 
                      color={getStatusColor(diseaseCase.status)} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Outcome
                    </Typography>
                    <Chip 
                      label={formatOutcome(diseaseCase.outcome)} 
                      color={getOutcomeColor(diseaseCase.outcome)} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Illness Duration
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {calculateDuration(
                        diseaseCase.onset_date, 
                        diseaseCase.outcome === 'recovered' ? diseaseCase.case_history.find(h => h.action === 'Follow-up Visit')?.date : 
                          (diseaseCase.outcome === 'death' ? diseaseCase.case_history.find(h => h.action === 'Deceased')?.date : null)
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2 }}>
                        Outbreak Associated:
                      </Typography>
                      {diseaseCase.is_outbreak ? (
                        <Chip 
                          label="Yes - Part of Outbreak" 
                          color="error" 
                          size="small" 
                          icon={<WarningIcon />}
                          variant="outlined" 
                        />
                      ) : (
                        <Chip 
                          label="No" 
                          color="success" 
                          size="small" 
                          variant="outlined" 
                        />
                      )}
                    </Box>
                  </Grid>
                  {diseaseCase.note && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Notes
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {diseaseCase.note}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Clinical Information Tab */}
          <TabPanel value={tabValue} index={1}>
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title="Symptoms and Diagnosis"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Reported Symptoms
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                      {diseaseCase.symptoms.map((symptom, index) => (
                        <Chip 
                          key={index}
                          label={symptom}
                          color="primary"
                          variant="outlined"
                          size="small"
                          icon={<FiberManualRecordIcon style={{ fontSize: 12 }} />}
                        />
                      ))}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Diagnosis Notes
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {diseaseCase.diagnosis_notes}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Severity
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={diseaseCase.severity.charAt(0).toUpperCase() + diseaseCase.severity.slice(1)} 
                        color={getSeverityColor(diseaseCase.severity)} 
                        size="small" 
                        variant="outlined" 
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                        {diseaseCase.severity === 'severe' 
                          ? 'Severe symptoms requiring immediate medical intervention'
                          : (diseaseCase.severity === 'moderate'
                            ? 'Moderate symptoms requiring medical attention'
                            : 'Mild symptoms that can be managed with standard care')}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title="Laboratory Results"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Test Date
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(diseaseCase.lab_results.test_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Test Type
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {diseaseCase.lab_results.test_type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Result
                    </Typography>
                    <Chip 
                      label={diseaseCase.lab_results.result} 
                      color={
                        diseaseCase.lab_results.result === 'Positive' 
                          ? 'error' 
                          : (diseaseCase.lab_results.result === 'Negative' 
                            ? 'success' 
                            : 'warning')
                      } 
                      size="small" 
                      variant="outlined" 
                    />
                  </Grid>
                  {diseaseCase.lab_results.notes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Lab Notes
                      </Typography>
                      <Typography variant="body1">
                        {diseaseCase.lab_results.notes}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader
                title="Treatment and Hospitalization"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Treatment Plan
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {diseaseCase.treatment}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Outcome
                    </Typography>
                    <Chip 
                      label={formatOutcome(diseaseCase.outcome)} 
                      color={getOutcomeColor(diseaseCase.outcome)} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Grid>
                  
                  {diseaseCase.hospital_name && (
                    <>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Hospital
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {diseaseCase.hospital_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Admission Date
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {formatDate(diseaseCase.admission_date)}
                        </Typography>
                      </Grid>
                      {diseaseCase.discharge_date && (
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Discharge Date
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {formatDate(diseaseCase.discharge_date)}
                          </Typography>
                        </Grid>
                      )}
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Hospitalization Duration
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {diseaseCase.discharge_date 
                            ? calculateDuration(diseaseCase.admission_date, diseaseCase.discharge_date)
                            : 'Ongoing'}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Contact Tracing Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Contact Tracing Information
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleIcon />}
                onClick={handleAddContactClick}
              >
                Add Contact
              </Button>
            </Box>

            {diseaseCase.contacts.length === 0 ? (
              <Alert severity="info">
                No contacts have been identified for this case yet.
              </Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Relationship</TableCell>
                      <TableCell>Phone Number</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {diseaseCase.contacts.map((contact, index) => (
                      <TableRow key={index}>
                        <TableCell>{contact.name}</TableCell>
                        <TableCell>{contact.relationship}</TableCell>
                        <TableCell>{contact.phone}</TableCell>
                        <TableCell>
                          <Chip 
                            label={formatStatus(contact.status)} 
                            color={getStatusColor(contact.status)} 
                            size="small" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell>
                          <Button size="small">Edit</Button>
                          <Button size="small" color="error">Remove</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Contact Tracing Guidelines
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  For {diseaseCase.disease_type} cases:
                </Typography>
                <Typography variant="body2">
                  • All identified contacts should be monitored for {diseaseCase.disease_type === 'COVID-19' ? '14 days' : (diseaseCase.disease_type === 'Ebola' ? '21 days' : '7-10 days')} from last exposure.
                </Typography>
                <Typography variant="body2">
                  • Contacts developing symptoms should be immediately isolated and tested.
                </Typography>
                <Typography variant="body2">
                  • Follow local health department guidelines for specific monitoring protocols.
                </Typography>
              </Alert>
            </Box>

            {diseaseCase.is_outbreak && (
              <Card sx={{ mt: 3, border: '1px solid #f44336' }}>
                <CardHeader
                  title="Outbreak Alert"
                  sx={{ bgcolor: '#fff8f8' }}
                />
                <Divider />
                <CardContent>
                  <Typography variant="body1" paragraph>
                    This case has been identified as part of a potential outbreak. Additional contact tracing and surveillance measures may be required.
                  </Typography>
                  <Typography variant="body1">
                    Please refer to the outbreak response protocol and coordinate with the district surveillance team.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </TabPanel>

          {/* Case Timeline Tab */}
          <TabPanel value={tabValue} index={3}>
            <Card>
              <CardHeader
                title="Case Timeline"
                subheader="History of events and actions taken"
              />
              <Divider />
              <CardContent>
                <Timeline position="alternate" sx={{ mt: 2 }}>
                  {diseaseCase.case_history.map((event, index) => (
                    <TimelineItem key={index}>
                      <TimelineOppositeContent color="text.secondary">
                        {formatDate(event.date)}
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color={getTimelineDotColor(event.action)} />
                        {index < diseaseCase.case_history.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="h6" component="span">
                          {event.action}
                        </Typography>
                        <Typography variant="body2">
                          {event.details}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          By: {event.performed_by}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
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
            Are you sure you want to delete this disease case record? This action cannot be undone and will remove all associated data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Contact Dialog */}
      <Dialog
        open={contactDialogOpen}
        onClose={handleContactDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Contact</DialogTitle>
        <DialogContent>
          <DialogContentText gutterBottom>
            Add contact information for an individual who had contact with the patient.
          </DialogContentText>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Name"
                name="name"
                value={newContact.name}
                onChange={handleContactChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Relationship to Patient"
                name="relationship"
                value={newContact.relationship}
                onChange={handleContactChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={newContact.phone}
                onChange={handleContactChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Contact Status</InputLabel>
                <Select
                  name="status"
                  value={newContact.status}
                  onChange={handleContactChange}
                  label="Contact Status"
                >
                  <MenuItem value="under_observation">Under Observation</MenuItem>
                  <MenuItem value="symptomatic">Symptomatic</MenuItem>
                  <MenuItem value="positive">Tested Positive</MenuItem>
                  <MenuItem value="negative">Tested Negative</MenuItem>
                  <MenuItem value="cleared">Cleared</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleContactDialogClose}>Cancel</Button>
          <Button 
            onClick={handleAddContact} 
            variant="contained" 
            color="primary"
            disabled={!newContact.name || !newContact.phone}
          >
            Add Contact
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default DiseaseDetail;