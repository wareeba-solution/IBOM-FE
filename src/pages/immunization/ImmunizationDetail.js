// src/pages/immunization/ImmunizationDetail.js
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
  TableRow
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
  Vaccines as VaccinesIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  MedicalServices as MedicalIcon,
  Event as EventIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Phone as PhoneIcon,
  Female as FemaleIcon,
  Male as MaleIcon
} from '@mui/icons-material';
import { format, parseISO, addMonths, differenceInMonths } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import immunizationService from '../../services/immunizationService';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`immunization-tabpanel-${index}`}
      aria-labelledby={`immunization-tab-${index}`}
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

const ImmunizationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [immunization, setImmunization] = useState(null);
  const [immunizationHistory, setImmunizationHistory] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);

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

  // Fetch immunization record data
  useEffect(() => {
    const loadImmunization = async () => {
      await execute(
        immunizationService.getImmunizationById,
        [id],
        (response) => {
          console.log('Loaded immunization record:', response);
          
          // Map API response to component format
          const immunizationData = response.data || response;
          const patient = immunizationData.patient || {};
          const facility = immunizationData.facility || {};
          
          const mappedImmunization = {
            id: immunizationData.id,
            registration_number: `IM-${new Date().getFullYear()}-${immunizationData.id ? immunizationData.id.substring(0, 8) : '00000000'}`,
            
            // Patient information from nested patient object
            patient_name: patient.firstName && patient.lastName ? 
              `${patient.firstName} ${patient.lastName}` : 
              'Unknown Patient',
            patient_id: immunizationData.patientId,
            gender: patient.gender || 'Unknown',
            date_of_birth: patient.dateOfBirth,
            age_months: immunizationData.ageMonths || calculateAge(patient.dateOfBirth) * 12,
            
            // Vaccine information
            vaccine_type: immunizationData.vaccineType,
            vaccine_name: immunizationData.vaccineName,
            dose_number: immunizationData.doseNumber,
            lot_number: immunizationData.batchNumber,
            vaccination_date: immunizationData.administrationDate,
            next_due_date: immunizationData.nextDoseDate,
            expiry_date: immunizationData.expiryDate,
            
            // Administration details
            healthcare_provider: immunizationData.administeredBy,
            provider_id: immunizationData.providerId || 'N/A',
            facility: facility.name || 'Unknown Facility',
            facility_id: immunizationData.facilityId,
            facility_type: facility.facilityType,
            facility_lga: facility.lga,
            administration_site: immunizationData.administrationSite,
            administration_route: immunizationData.administrationRoute,
            dosage: immunizationData.dosage,
            
            // Medical measurements
            weight_kg: immunizationData.weightKg,
            height_cm: immunizationData.heightCm,
            
            // Status and effects
            status: immunizationData.status?.toLowerCase() || 'administered',
            side_effects: immunizationData.sideEffects,
            notes: immunizationData.notes,
            
            // Timestamps
            created_at: immunizationData.createdAt,
            updated_at: immunizationData.updatedAt
          };
          
          setImmunization(mappedImmunization);
          
          // Also fetch immunization history for this patient
          execute(
            immunizationService.getPatientImmunizationHistory,
            [mappedImmunization.patient_id],
            (historyResponse) => {
              console.log('Immunization history:', historyResponse);
              const historyData = historyResponse.data || historyResponse || [];
              
              const mappedHistory = historyData.map((item) => {
                const historyPatient = item.patient || {};
                const historyFacility = item.facility || {};
                
                return {
                  id: item.id,
                  vaccine_type: item.vaccineType,
                  vaccine_name: item.vaccineName,
                  dose_number: item.doseNumber,
                  vaccination_date: item.administrationDate,
                  healthcare_provider: item.administeredBy,
                  facility: historyFacility.name || 'Unknown Facility',
                  status: item.status?.toLowerCase() || 'administered'
                };
              });
              
              setImmunizationHistory(mappedHistory);
            }
          );
        }
      );
    };
    
    loadImmunization();
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
  const handleEditImmunization = () => {
    navigate(`/immunizations/${id}/edit`);
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
      immunizationService.deleteImmunization,
      [id],
      () => {
        navigate('/immunization');
      }
    );
  };

  // Handle print certificate
  const handlePrintCertificate = () => {
    setCertificateDialogOpen(true);
    handleMenuClose();
  };

  const handleCertificateDialogClose = () => {
    setCertificateDialogOpen(false);
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

  // Calculate age in months from date of birth
  const calculateAgeMonths = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    try {
      const birthDate = new Date(dateOfBirth);
      const vaccDate = immunization?.vaccination_date 
        ? new Date(immunization.vaccination_date) 
        : new Date();
      
      const months = differenceInMonths(vaccDate, birthDate);
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      
      if (years === 0) {
        return `${months} month${months !== 1 ? 's' : ''}`;
      } else {
        return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
      }
    } catch (error) {
      return 'N/A';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'administered':
      case 'completed':
        return 'success';
      case 'pending':
      case 'scheduled':
        return 'warning';
      case 'missed':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'administered':
      case 'completed':
        return <CheckIcon color="success" />;
      case 'pending':
      case 'scheduled':
        return <WarningIcon color="warning" />;
      case 'missed':
      case 'cancelled':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  if (loading && !immunization) {
    return (
      <MainLayout title="Immunization Record Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error && !immunization) {
    return (
      <MainLayout title="Immunization Record Details">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          component={RouterLink} 
          to="/immunization" 
          variant="contained"
          startIcon={<ArrowBackIcon />}
        >
          Back to Immunization Records
        </Button>
      </MainLayout>
    );
  }

  if (!immunization) {
    return (
      <MainLayout title="Immunization Record Details">
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading immunization record information...
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={`Immunization Record: ${immunization.patient_name}`}
      breadcrumbs={[
        { name: 'Immunization', path: '/immunization' },
        { name: immunization.patient_name, active: true }
      ]}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/immunization"
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              Immunization Record Details
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={handlePrintCertificate}
              sx={{ mr: 1 }}
            >
              Print Certificate
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEditImmunization}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <IconButton
              aria-label="more options"
              aria-controls="immunization-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="immunization-menu"
              anchorEl={menuAnchorEl}
              keepMounted
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEditImmunization}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Edit Record" />
              </MenuItem>
              <MenuItem onClick={handlePrintCertificate}>
                <ListItemIcon>
                  <PrintIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Print Certificate" />
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
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  {immunization.patient_name}
                  {immunization.gender === 'female' ? 
                    <FemaleIcon color="secondary" sx={{ ml: 1 }} /> : 
                    <MaleIcon color="primary" sx={{ ml: 1 }} />
                  }
                </Box>
              }
              subheader={`Registration Number: ${immunization.registration_number} | Patient ID: ${immunization.patient_id}`}
              action={
                <Chip 
                  label={immunization.status} 
                  color={getStatusColor(immunization.status)} 
                  size="medium" 
                  variant="outlined" 
                  icon={getStatusIcon(immunization.status)}
                />
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Vaccine
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {immunization.vaccine_name || immunization.vaccine_type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dose {immunization.dose_number}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Vaccination Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(immunization.vaccination_date)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Next Due Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {immunization.next_due_date ? formatDate(immunization.next_due_date) : 'N/A - Series Complete'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Healthcare Provider
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {immunization.healthcare_provider}
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
              aria-label="immunization record tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<VaccinesIcon />} iconPosition="start" label="Vaccination Details" />
              <Tab icon={<PersonIcon />} iconPosition="start" label="Patient Details" />
              <Tab icon={<MedicalIcon />} iconPosition="start" label="Medical Details" />
              <Tab icon={<EventIcon />} iconPosition="start" label="Immunization History" />
            </Tabs>
          </Box>

          {/* Vaccination Details Tab */}
          <TabPanel value={tabValue} index={0}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <VaccinesIcon sx={{ mr: 1 }} />
                    Vaccination Details
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Vaccine Type
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.vaccine_type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Vaccine Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.vaccine_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Dose Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.dose_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Batch/Lot Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.lot_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Vaccination Date
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(immunization.vaccination_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Expiry Date
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(immunization.expiry_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Next Due Date
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.next_due_date ? formatDate(immunization.next_due_date) : 'N/A - Series Complete'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Box>
                      <Chip 
                        label={immunization.status} 
                        color={getStatusColor(immunization.status)} 
                        size="small" 
                        variant="outlined" 
                        icon={getStatusIcon(immunization.status)}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Administration Site
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.administration_site}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Administration Route
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.administration_route}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Dosage
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.dosage}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Facility
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.facility}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {immunization.facility_lga}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Healthcare Provider
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.healthcare_provider}
                    </Typography>
                    {immunization.provider_id && immunization.provider_id !== 'N/A' && (
                      <Typography variant="body2" color="text.secondary">
                        ID: {immunization.provider_id}
                      </Typography>
                    )}
                  </Grid>
                  {immunization.side_effects && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Side Effects
                      </Typography>
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        {immunization.side_effects}
                      </Alert>
                    </Grid>
                  )}
                  {immunization.notes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Notes
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                        <Typography variant="body2">
                          {immunization.notes}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Patient Details Tab */}
          <TabPanel value={tabValue} index={1}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    Patient Details
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.patient_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Patient ID
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.patient_id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Gender
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {immunization.gender === 'female' ? 
                        <FemaleIcon color="secondary" fontSize="small" sx={{ mr: 1 }} /> : 
                        <MaleIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                      }
                      <Typography variant="body1">
                        {immunization.gender ? immunization.gender.charAt(0).toUpperCase() + immunization.gender.slice(1) : 'Unknown'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date of Birth
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(immunization.date_of_birth)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Age at Vaccination
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {calculateAgeMonths(immunization.date_of_birth)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Weight at Vaccination
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.weight_kg ? `${immunization.weight_kg} kg` : 'Not recorded'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Height at Vaccination
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.height_cm ? `${immunization.height_cm} cm` : 'Not recorded'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Medical Details Tab */}
          <TabPanel value={tabValue} index={2}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MedicalIcon sx={{ mr: 1 }} />
                    Medical Information
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Vaccine Information
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Vaccine</TableCell>
                          <TableCell>Dosage</TableCell>
                          <TableCell>Route</TableCell>
                          <TableCell>Site</TableCell>
                          <TableCell>Batch Number</TableCell>
                          <TableCell>Expiry Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>{immunization.vaccine_name || immunization.vaccine_type}</TableCell>
                          <TableCell>{immunization.dosage}</TableCell>
                          <TableCell>{immunization.administration_route}</TableCell>
                          <TableCell>{immunization.administration_site}</TableCell>
                          <TableCell>{immunization.lot_number}</TableCell>
                          <TableCell>{formatDate(immunization.expiry_date)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Administration Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Healthcare Provider
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {immunization.healthcare_provider}
                      </Typography>
                    </Grid>
                    {immunization.provider_id && immunization.provider_id !== 'N/A' && (
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Provider ID
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {immunization.provider_id}
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Facility
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {immunization.facility}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {immunization.facility_type} - {immunization.facility_lga}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {immunization.side_effects && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Adverse Events/Side Effects
                    </Typography>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      {immunization.side_effects}
                    </Alert>
                  </Box>
                )}

                {immunization.notes && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Clinical Notes
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2">
                        {immunization.notes}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </CardContent>
            </Card>
          </TabPanel>

          {/* Immunization History Tab */}
          <TabPanel value={tabValue} index={3}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventIcon sx={{ mr: 1 }} />
                    Patient Immunization History
                  </Box>
                }
                subheader={`Immunization history for ${immunization.patient_name} (${immunization.patient_id})`}
              />
              <Divider />
              <CardContent>
                {immunizationHistory.length === 0 ? (
                  <Alert severity="info">
                    No prior immunization records found for this patient.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Vaccine</TableCell>
                          <TableCell>Vaccine Name</TableCell>
                          <TableCell>Dose</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Provider</TableCell>
                          <TableCell>Facility</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {immunizationHistory.map((record) => (
                          <TableRow 
                            key={record.id}
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                              bgcolor: record.id.toString() === id ? 'rgba(0, 0, 0, 0.08)' : 'inherit'
                            }}
                            onClick={() => {
                              if (record.id.toString() !== id) {
                                navigate(`/immunization/${record.id}`);
                              }
                            }}
                          >
                            <TableCell>{record.vaccine_type}</TableCell>
                            <TableCell>{record.vaccine_name}</TableCell>
                            <TableCell>Dose {record.dose_number}</TableCell>
                            <TableCell>{formatDate(record.vaccination_date)}</TableCell>
                            <TableCell>{record.healthcare_provider}</TableCell>
                            <TableCell>{record.facility}</TableCell>
                            <TableCell>
                              <Chip 
                                label={record.status} 
                                color={getStatusColor(record.status)} 
                                size="small" 
                                variant="outlined" 
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
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
            Are you sure you want to delete this immunization record? This action cannot be undone and will remove all associated data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Print Certificate Dialog */}
      <Dialog
        open={certificateDialogOpen}
        onClose={handleCertificateDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Immunization Certificate</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1, mb: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                FEDERAL REPUBLIC OF NIGERIA
              </Typography>
              <Typography variant="h6" gutterBottom>
                AKWA IBOM STATE MINISTRY OF HEALTH
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ my: 2 }}>
                CERTIFICATE OF IMMUNIZATION
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1" align="center" gutterBottom>
                  This is to certify that
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" align="center" gutterBottom>
                  {immunization.patient_name}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" align="center" gutterBottom>
                  of gender {immunization.gender} born on {formatDate(immunization.date_of_birth)} with ID {immunization.patient_id}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" align="center" gutterBottom>
                  has received the following immunization:
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" align="center" gutterBottom>
                  {immunization.vaccine_name || immunization.vaccine_type} - Dose {immunization.dose_number}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" align="center" gutterBottom>
                  Administered on: {formatDate(immunization.vaccination_date)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" align="center" gutterBottom>
                  at {immunization.facility} by {immunization.healthcare_provider}
                </Typography>
              </Grid>
              {immunization.next_due_date && (
                <Grid item xs={12}>
                  <Typography variant="body1" align="center" gutterBottom>
                    Next dose due: {formatDate(immunization.next_due_date)}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" gutterBottom>
                  Registration Number: {immunization.registration_number}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" gutterBottom align="right">
                  Batch Number: {immunization.lot_number}
                </Typography>
              </Grid>
              <Grid item xs={12} sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      ________________________
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Healthcare Provider's Signature
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" gutterBottom align="right">
                      [OFFICIAL SEAL]
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <DialogContentText>
            This is a preview of the immunization certificate. Click Print to generate a printable version.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCertificateDialogClose}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<PrintIcon />}
            onClick={() => {
              // In a real application, this would trigger printing
              window.alert('Printing functionality would be implemented here');
              handleCertificateDialogClose();
            }}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default ImmunizationDetail;