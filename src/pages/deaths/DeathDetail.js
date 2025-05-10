// src/pages/deaths/DeathDetail.js
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
  Tab
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
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  MedicalServices as MedicalIcon,
  SentimentVeryDissatisfied as DeathIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';

// Mock death service - replace with actual service when available
const deathService = {
  getDeathById: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockDeath = {
          id,
          registration_number: `DR${10000 + parseInt(id)}`,
          deceased_name: `${parseInt(id) % 2 === 0 ? 'John' : 'Jane'} Doe ${id}`,
          gender: parseInt(id) % 2 === 0 ? 'Male' : 'Female',
          date_of_birth: new Date(1940 + parseInt(id) % 50, (parseInt(id) % 12), parseInt(id) % 28 + 1).toISOString().split('T')[0],
          date_of_death: new Date(2023, (parseInt(id) % 12), parseInt(id) % 28 + 1).toISOString().split('T')[0],
          age_at_death: 83 - (parseInt(id) % 50),
          place_of_death: parseInt(id) % 3 === 0 ? 'Hospital' : (parseInt(id) % 3 === 1 ? 'Home' : 'Other'),
          hospital_name: parseInt(id) % 3 === 0 ? `Hospital ${id}` : '',
          cause_of_death: parseInt(id) % 5 === 0 ? 'Natural Causes' : (parseInt(id) % 5 === 1 ? 'Heart Disease' : (parseInt(id) % 5 === 2 ? 'Cancer' : (parseInt(id) % 5 === 3 ? 'Accident' : 'Respiratory Disease'))),
          secondary_causes: parseInt(id) % 4 === 0 ? 'Hypertension' : '',
          manner_of_death: parseInt(id) % 6 === 0 ? 'Natural' : (parseInt(id) % 6 === 1 ? 'Accident' : (parseInt(id) % 6 === 2 ? 'Suicide' : (parseInt(id) % 6 === 3 ? 'Homicide' : 'Undetermined'))),
          informant_name: `Informant ${id}`,
          informant_relationship: parseInt(id) % 4 === 0 ? 'Son' : (parseInt(id) % 4 === 1 ? 'Daughter' : (parseInt(id) % 4 === 2 ? 'Spouse' : 'Sibling')),
          informant_phone: `080${id}${id}${id}${id}${id}${id}`,
          informant_address: `Address ${id}, Akwa Ibom`,
          doctor_name: parseInt(id) % 3 === 0 ? `Dr. Medicine ${id}` : '',
          doctor_id: parseInt(id) % 3 === 0 ? `MED${id}${id}${id}` : '',
          city: 'Uyo',
          state: 'Akwa Ibom',
          status: parseInt(id) % 10 === 0 ? 'pending' : 'registered',
          registration_date: new Date().toISOString().split('T')[0],
          notes: parseInt(id) % 6 === 0 ? 'Special notes about this death record' : ''
        };
        resolve(mockDeath);
      }, 500);
    });
  },
  deleteDeath: async (id) => {
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
      id={`death-tabpanel-${index}`}
      aria-labelledby={`death-tab-${index}`}
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

const DeathDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [death, setDeath] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);

  // Fetch death record data
  useEffect(() => {
    const loadDeath = async () => {
      await execute(
        deathService.getDeathById,
        [id],
        (response) => {
          setDeath(response);
        }
      );
    };
    
    loadDeath();
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
  const handleEditDeath = () => {
    navigate(`/deaths/${id}/edit`);
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
      deathService.deleteDeath,
      [id],
      () => {
        navigate('/deaths');
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

  if (loading && !death) {
    return (
      <MainLayout title="Death Record Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error && !death) {
    return (
      <MainLayout title="Death Record Details">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          component={RouterLink} 
          to="/deaths" 
          variant="contained"
          startIcon={<ArrowBackIcon />}
        >
          Back to Death Records
        </Button>
      </MainLayout>
    );
  }

  if (!death) {
    return (
      <MainLayout title="Death Record Details">
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading death record information...
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={`Death Record: ${death.deceased_name}`}
      breadcrumbs={[
        { name: 'Deaths', path: '/deaths' },
        { name: death.deceased_name, active: true }
      ]}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/deaths"
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              Death Record Details
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
              onClick={handleEditDeath}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <IconButton
              aria-label="more options"
              aria-controls="death-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="death-menu"
              anchorEl={menuAnchorEl}
              keepMounted
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEditDeath}>
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
              title={death.deceased_name}
              subheader={`Registration Number: ${death.registration_number}`}
              action={
                <Chip 
                  label={death.status} 
                  color={death.status === 'registered' ? 'success' : 'warning'} 
                  size="medium" 
                  variant="outlined" 
                />
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Gender
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {death.gender}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date of Death
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(death.date_of_death)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Age at Death
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {death.age_at_death} years
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cause of Death
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {death.cause_of_death}
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
              aria-label="death record tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<PersonIcon />} iconPosition="start" label="Deceased Details" />
              <Tab icon={<MedicalIcon />} iconPosition="start" label="Death Information" />
              <Tab icon={<PersonIcon />} iconPosition="start" label="Informant Details" />
              <Tab icon={<AssignmentIcon />} iconPosition="start" label="Registration Details" />
            </Tabs>
          </Box>

          {/* Deceased Details Tab */}
          <TabPanel value={tabValue} index={0}>
            <Card>
              <CardHeader
                title="Deceased Details"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {death.deceased_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Gender
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {death.gender}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date of Birth
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(death.date_of_birth)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date of Death
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(death.date_of_death)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Age at Death
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {death.age_at_death} years
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Death Information Tab */}
          <TabPanel value={tabValue} index={1}>
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title="Death Details"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Place of Death
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {death.place_of_death}
                    </Typography>
                  </Grid>
                  {death.hospital_name && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Hospital Name
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {death.hospital_name}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Primary Cause of Death
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {death.cause_of_death}
                    </Typography>
                  </Grid>
                  {death.secondary_causes && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Secondary Causes
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {death.secondary_causes}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Manner of Death
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {death.manner_of_death}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {(death.doctor_name || death.doctor_id) && (
              <Card>
                <CardHeader
                  title="Medical Certification"
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    {death.doctor_name && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Certifying Doctor
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {death.doctor_name}
                        </Typography>
                      </Grid>
                    )}
                    {death.doctor_id && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Doctor's ID/License
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {death.doctor_id}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </TabPanel>

          {/* Informant Details Tab */}
          <TabPanel value={tabValue} index={2}>
            <Card>
              <CardHeader
                title="Informant Details"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Informant Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {death.informant_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Relationship to Deceased
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {death.informant_relationship}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Phone Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {death.informant_phone || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {death.informant_address || 'Not provided'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Registration Details Tab */}
          <TabPanel value={tabValue} index={3}>
            <Card>
              <CardHeader
                title="Registration Details"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Registration Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {death.registration_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Registration Date
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(death.registration_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Box>
                      <Chip 
                        label={death.status} 
                        color={death.status === 'registered' ? 'success' : 'warning'} 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      City
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {death.city}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      State
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {death.state}
                    </Typography>
                  </Grid>
                  {death.notes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Additional Notes
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {death.notes}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
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
            Are you sure you want to delete this death record? This action cannot be undone and will remove all associated data.
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
        <DialogTitle>Death Certificate</DialogTitle>
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
                CERTIFICATE OF DEATH
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
                  {death.deceased_name}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" align="center" gutterBottom>
                  of gender {death.gender} and {death.age_at_death} years of age died on
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" align="center" gutterBottom>
                  {formatDate(death.date_of_death)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" align="center" gutterBottom>
                  at {death.place_of_death}{death.hospital_name ? ` (${death.hospital_name})` : ''}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" align="center" gutterBottom>
                  Cause of death: {death.cause_of_death}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" align="center" gutterBottom>
                  Manner of death: {death.manner_of_death}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" gutterBottom>
                  Registration Number: {death.registration_number}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" gutterBottom align="right">
                  Date of Registration: {formatDate(death.registration_date)}
                </Typography>
              </Grid>
              <Grid item xs={12} sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      ________________________
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Registrar's Signature
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
            This is a preview of the death certificate. Click Print to generate a printable version.
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

export default DeathDetail;