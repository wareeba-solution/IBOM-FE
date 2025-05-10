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
  Error as ErrorIcon
} from '@mui/icons-material';
import { format, parseISO, addMonths, differenceInMonths } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';

// Mock immunization service - replace with actual service when available
const immunizationService = {
  getImmunizationById: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockImmunization = {
          id,
          registration_number: `IM${10000 + parseInt(id)}`,
          patient_name: `${parseInt(id) % 2 === 0 ? 'John' : 'Jane'} Doe ${id}`,
          patient_id: `PT${5000 + parseInt(id)}`,
          gender: parseInt(id) % 2 === 0 ? 'Male' : 'Female',
          date_of_birth: new Date(2020 - (parseInt(id) % 5), (parseInt(id) % 12), parseInt(id) % 28 + 1).toISOString().split('T')[0],
          age_months: 12 + (parseInt(id) % 48),
          vaccine_type: ['BCG', 'Hepatitis B', 'OPV', 'Pentavalent', 'Pneumococcal', 'Rotavirus', 'Measles', 'Yellow Fever'][parseInt(id) % 8],
          dose_number: (parseInt(id) % 3) + 1,
          lot_number: `LOT${100 + parseInt(id)}`,
          vaccination_date: new Date(2023, (parseInt(id) % 12), parseInt(id) % 28 + 1).toISOString().split('T')[0],
          next_due_date: parseInt(id) % 3 === 2 ? null : new Date(2023, (parseInt(id) % 12) + 2, parseInt(id) % 28 + 1).toISOString().split('T')[0],
          healthcare_provider: `Nurse ${parseInt(id) % 10 + 1}`,
          provider_id: `NUR${1000 + parseInt(id) % 20}`,
          facility: `Health Center ${parseInt(id) % 5 + 1}`,
          facility_id: `FAC${parseInt(id) % 5 + 1}`,
          status: parseInt(id) % 10 === 0 ? 'pending' : (parseInt(id) % 10 === 1 ? 'missed' : 'completed'),
          side_effects: parseInt(id) % 15 === 0 ? 'Mild fever' : (parseInt(id) % 20 === 0 ? 'Swelling at injection site' : null),
          notes: parseInt(id) % 8 === 0 ? 'Follow up required due to previous adverse reaction' : null,
          created_at: new Date(2023, (parseInt(id) % 12), parseInt(id) % 28 + 1).toISOString(),
          weight_kg: 5 + (parseInt(id) % 20),
          height_cm: 50 + (parseInt(id) % 30),
          site_of_administration: parseInt(id) % 2 === 0 ? 'Left Arm' : 'Right Thigh',
          route_of_administration: parseInt(id) % 3 === 0 ? 'Intramuscular' : (parseInt(id) % 3 === 1 ? 'Subcutaneous' : 'Oral')
        };
        resolve(mockImmunization);
      }, 500);
    });
  },
  getImmunizationHistory: async (patientId) => {
    // Simulate API call to get immunization history for this patient
    return new Promise((resolve) => {
      setTimeout(() => {
        const historyCount = 3 + (parseInt(patientId) % 5);
        const history = Array.from({ length: historyCount }, (_, i) => ({
          id: 100 + i,
          vaccine_type: ['BCG', 'Hepatitis B', 'OPV', 'Pentavalent', 'Pneumococcal', 'Rotavirus', 'Measles', 'Yellow Fever'][i % 8],
          dose_number: (i % 3) + 1,
          vaccination_date: new Date(2022, i, 15).toISOString().split('T')[0],
          healthcare_provider: `Nurse ${i % 10 + 1}`,
          facility: `Health Center ${i % 5 + 1}`,
          status: i === historyCount - 1 ? 'pending' : 'completed'
        }));
        resolve(history);
      }, 300);
    });
  },
  deleteImmunization: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
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

  // Fetch immunization record data
  useEffect(() => {
    const loadImmunization = async () => {
      await execute(
        immunizationService.getImmunizationById,
        [id],
        (response) => {
          setImmunization(response);
          
          // Also fetch immunization history for this patient
          execute(
            immunizationService.getImmunizationHistory,
            [response.patient_id],
            (historyResponse) => {
              setImmunizationHistory(historyResponse);
            }
          );
        }
      );
    };
    
    loadImmunization();
  }, [id]);

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
    navigate(`/immunizations/${id}/edit`);  // Changed from '/immunization/${id}/edit' to '/immunizations/${id}/edit'
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
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'missed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckIcon color="success" />;
      case 'pending':
        return <WarningIcon color="warning" />;
      case 'missed':
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
              title={immunization.patient_name}
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
                    {immunization.vaccine_type} (Dose {immunization.dose_number})
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
                title="Vaccination Details"
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
                      Dose Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.dose_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Lot Number
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
                      Site of Administration
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.site_of_administration}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Route of Administration
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.route_of_administration}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Facility
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.facility}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Healthcare Provider
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.healthcare_provider} ({immunization.provider_id})
                    </Typography>
                  </Grid>
                  {immunization.side_effects && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Side Effects
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {immunization.side_effects}
                      </Typography>
                    </Grid>
                  )}
                  {immunization.notes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Notes
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {immunization.notes}
                      </Typography>
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
                title="Patient Details"
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
                    <Typography variant="body1" gutterBottom>
                      {immunization.gender}
                    </Typography>
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
                      Weight
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.weight_kg} kg
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Height
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {immunization.height_cm} cm
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
                title="Medical Information"
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
                          <TableCell>Lot Number</TableCell>
                          <TableCell>Expiry Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>{immunization.vaccine_type}</TableCell>
                          <TableCell>Dose {immunization.dose_number}</TableCell>
                          <TableCell>{immunization.route_of_administration}</TableCell>
                          <TableCell>{immunization.site_of_administration}</TableCell>
                          <TableCell>{immunization.lot_number}</TableCell>
                          <TableCell>
                            {format(addMonths(parseISO(immunization.vaccination_date), 6), 'MM/yyyy')}
                          </TableCell>
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
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Provider ID
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {immunization.provider_id}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Facility
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {immunization.facility} ({immunization.facility_id})
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {immunization.side_effects && (
                  <Box>
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
                title="Patient Immunization History"
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
                  {immunization.vaccine_type} - Dose {immunization.dose_number}
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
                  Lot Number: {immunization.lot_number}
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