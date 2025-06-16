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
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import antenatalService from '../../services/antenatalService';

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
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  
  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

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
          console.log('Antenatal record response:', response);
          setAntenatalRecord(response);
        }
      );
    };

    loadAntenatalRecord();
  }, [id, execute]);

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

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Unknown';
    try {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return `${age} years`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  const calculateGestationalAge = (lmp) => {
    if (!lmp) return 'N/A';
    try {
      const lmpDate = new Date(lmp);
      const today = new Date();
      const diffTime = today - lmpDate;
      const weeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
      const days = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));
      
      if (weeks < 0 || weeks > 50) return 'Invalid';
      return `${weeks} weeks, ${days} days`;
    } catch (error) {
      return 'Invalid';
    }
  };

  const getTrimester = (lmp) => {
    if (!lmp) return 'Unknown';
    try {
      const lmpDate = new Date(lmp);
      const today = new Date();
      const weeks = Math.floor((today - lmpDate) / (1000 * 60 * 60 * 24 * 7));
      
      if (weeks <= 12) return '1st Trimester';
      if (weeks <= 27) return '2nd Trimester';
      return '3rd Trimester';
    } catch (error) {
      return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'inactive':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
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
          Antenatal record not found.
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

  const patient = antenatalRecord.patient || {};
  const facility = antenatalRecord.facility || {};

  return (
    <MainLayout
      title={`Antenatal Record: ${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient'}
      breadcrumbs={[
        { name: 'Antenatal', path: '/antenatal' },
        { name: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient', active: true }
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
              title={`${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient'}
              subheader={`Registration Number: ${antenatalRecord.registrationNumber || 'N/A'} | Patient ID: ${antenatalRecord.patientId || 'N/A'}`}
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`${antenatalRecord.riskLevel || 'unknown'} risk`}
                    color={getRiskLevelColor(antenatalRecord.riskLevel)}
                    size="medium"
                    variant="outlined"
                    icon={antenatalRecord.riskLevel === 'high' ? <WarningIcon /> : undefined}
                  />
                  <Chip
                    label={antenatalRecord.status || 'Unknown'}
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
                    {calculateGestationalAge(antenatalRecord.lmp)} ({getTrimester(antenatalRecord.lmp)})
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
                    {formatDate(antenatalRecord.nextAppointment)}
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
              <Tab icon={<TimelineIcon />} iconPosition="start" label="Progress" />
            </Tabs>
          </Box>

          {/* Patient Details Tab */}
          <TabPanel value={tabValue} index={0}>
            <Card>
              <CardHeader title="Patient Information" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {`${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Patient ID
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.patientId || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Gender
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {patient.gender || 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Age
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {calculateAge(patient.dateOfBirth)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date of Birth
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(patient.dateOfBirth)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Phone Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {patient.phoneNumber || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Facility
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {facility.name || 'Unknown Facility'} ({facility.lga || 'Unknown LGA'})
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardHeader title="Contact Information" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Emergency Contact Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.emergencyContact?.name || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Emergency Contact Phone
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.emergencyContact?.phone || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Relationship
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.emergencyContact?.relationship || 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Partner Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.partner?.name || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Partner Contact
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.partner?.phone || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nearest Health Facility
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.nearestHealthFacility || 'Not specified'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Obstetric History Tab */}
          <TabPanel value={tabValue} index={1}>
            <Card>
              <CardHeader title="Pregnancy Information" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Gravida (Total Pregnancies)
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {antenatalRecord.gravida || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Para (Previous Births)
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {antenatalRecord.para || 0}
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
                      {calculateGestationalAge(antenatalRecord.lmp)} ({getTrimester(antenatalRecord.lmp)})
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Registration Date
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(antenatalRecord.registrationDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Risk Level
                    </Typography>
                    <Chip
                      label={`${antenatalRecord.riskLevel || 'unknown'} risk`}
                      color={getRiskLevelColor(antenatalRecord.riskLevel)}
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={antenatalRecord.status || 'Unknown'}
                      color={getStatusColor(antenatalRecord.status)}
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                {antenatalRecord.riskFactors && antenatalRecord.riskFactors.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Risk Factors
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {antenatalRecord.riskFactors.map((factor, index) => (
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

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Medical History
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {antenatalRecord.medicalHistory || 'No medical history recorded'}
                  </Typography>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Obstetrics History
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {antenatalRecord.obstetricsHistory || 'No obstetrics history recorded'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Medical Information Tab */}
          <TabPanel value={tabValue} index={2}>
            <Card>
              <CardHeader title="Physical Measurements" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Height
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.height ? `${antenatalRecord.height} cm` : 'Not recorded'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Pre-pregnancy Weight
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.prePregnancyWeight ? `${antenatalRecord.prePregnancyWeight} kg` : 'Not recorded'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Blood Group
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.bloodGroup || 'Not recorded'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardHeader title="Laboratory Tests" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      HIV Status
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.hivStatus || 'Not tested'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Sickling Test
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.sickling || 'Not tested'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Hepatitis B
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.hepatitisB || 'Not tested'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Hepatitis C
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.hepatitisC || 'Not tested'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      VDRL
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.vdrl || 'Not tested'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardHeader title="Preventive Measures" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tetanus Vaccination
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.tetanusVaccination || 'Not recorded'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Malaria Prophylaxis
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.malariaProphylaxis || 'Not recorded'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Iron/Folate Supplementation
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {antenatalRecord.ironFolateSupplementation || 'Not recorded'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Progress Tab */}
          <TabPanel value={tabValue} index={3}>
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
                        value={antenatalRecord.lmp ? Math.min((Math.floor((new Date() - new Date(antenatalRecord.lmp)) / (1000 * 60 * 60 * 24 * 7)) / 40) * 100, 100) : 0}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {antenatalRecord.lmp ? `${Math.floor((new Date() - new Date(antenatalRecord.lmp)) / (1000 * 60 * 60 * 24 * 7))}/40` : '0/40'}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Currently in {getTrimester(antenatalRecord.lmp)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Delivery Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Outcome
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {antenatalRecord.outcome || 'Ongoing'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Delivery Date
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatDate(antenatalRecord.deliveryDate) || 'Not delivered'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Mode of Delivery
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {antenatalRecord.modeOfDelivery || 'Not applicable'}
                      </Typography>
                    </Grid>
                  </Grid>
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