// src/pages/births/BirthDetail.js
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
  //PersonIcon,
  //Healing,
  //Home,
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
  ChildCare as ChildIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Healing as HealingIcon,
  AssignmentInd as AssignmentIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';

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
  deleteBirth: async (id) => {
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
      id={`birth-tabpanel-${index}`}
      aria-labelledby={`birth-tab-${index}`}
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

const BirthDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [birth, setBirth] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);

  // Fetch birth record data
  useEffect(() => {
    const loadBirth = async () => {
      await execute(
        birthService.getBirthById,
        [id],
        (response) => {
          setBirth(response);
        }
      );
    };
    
    loadBirth();
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
  const handleEditBirth = () => {
    navigate(`/births/${id}/edit`);
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
      birthService.deleteBirth,
      [id],
      () => {
        navigate('/births');
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

  if (loading && !birth) {
    return (
      <MainLayout title="Birth Record Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error && !birth) {
    return (
      <MainLayout title="Birth Record Details">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          component={RouterLink} 
          to="/births" 
          variant="contained"
          startIcon={<ArrowBackIcon />}
        >
          Back to Birth Records
        </Button>
      </MainLayout>
    );
  }

  if (!birth) {
    return (
      <MainLayout title="Birth Record Details">
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading birth record information...
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={`Birth Record: ${birth.child_name}`}
      breadcrumbs={[
        { name: 'Births', path: '/births' },
        { name: birth.child_name, active: true }
      ]}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/births"
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              Birth Record Details
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
              onClick={handleEditBirth}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <IconButton
              aria-label="more options"
              aria-controls="birth-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="birth-menu"
              anchorEl={menuAnchorEl}
              keepMounted
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEditBirth}>
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
              title={birth.child_name}
              subheader={`Registration Number: ${birth.registration_number}`}
              action={
                <Chip 
                  label={birth.status} 
                  color={birth.status === 'registered' ? 'success' : 'warning'} 
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
                    {birth.gender}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date of Birth
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(birth.date_of_birth)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Place of Birth
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {birth.place_of_birth}
                    {birth.hospital_name && ` (${birth.hospital_name})`}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Registration Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(birth.registration_date)}
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
              aria-label="birth record tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<ChildIcon />} iconPosition="start" label="Child Details" />
              <Tab icon={<PersonIcon />} iconPosition="start" label="Parents Information" />
              <Tab icon={<HealingIcon />} iconPosition="start" label="Birth Details" />
              <Tab icon={<HomeIcon />} iconPosition="start" label="Address Information" />
              <Tab icon={<AssignmentIcon />} iconPosition="start" label="Registration" />
            </Tabs>
          </Box>

          {/* Child Details Tab */}
          <TabPanel value={tabValue} index={0}>
            <Card>
              <CardHeader
                title="Child Details"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.child_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Gender
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.gender}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date of Birth
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(birth.date_of_birth)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Birth Weight
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.birth_weight} kg
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Birth Length
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.birth_length} cm
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Head Circumference
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.head_circumference} cm
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Place of Birth
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.place_of_birth}
                      {birth.hospital_name && ` (${birth.hospital_name})`}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Parents Information Tab */}
          <TabPanel value={tabValue} index={1}>
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title="Mother's Information"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mother's Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.mother_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mother's Age
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.mother_age} years
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mother's Occupation
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.mother_occupation || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mother's ID Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.mother_id_number || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mother's Phone Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.mother_phone || 'Not provided'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                title="Father's Information"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Father's Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.father_name || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Father's Age
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.father_age ? `${birth.father_age} years` : 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Father's Occupation
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.father_occupation || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Father's ID Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.father_id_number || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Father's Phone Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.father_phone || 'Not provided'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Birth Details Tab */}
          <TabPanel value={tabValue} index={2}>
            <Card>
              <CardHeader
                title="Birth Details"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Delivery Type
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.delivery_type || 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Birth Attendant
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.birth_attendant || 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Complications
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.complications || 'None reported'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Additional Notes
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.notes || 'No additional notes'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Address Information Tab */}
          <TabPanel value={tabValue} index={3}>
            <Card>
              <CardHeader
                title="Address Information"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.address}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      City/Town
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.city}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      State
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.state}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Registration Tab */}
          <TabPanel value={tabValue} index={4}>
            <Card>
              <CardHeader
                title="Registration Information"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Registration Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.registration_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Registration Date
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(birth.registration_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Box>
                      <Chip 
                        label={birth.status} 
                        color={birth.status === 'registered' ? 'success' : 'warning'} 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>
                  </Grid>
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
            Are you sure you want to delete this birth record? This action cannot be undone and will remove all associated data.
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
        <DialogTitle>Birth Certificate</DialogTitle>
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
                CERTIFICATE OF BIRTH
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
                  {birth.child_name}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" align="center" gutterBottom>
                  of gender {birth.gender} was born on
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" align="center" gutterBottom>
                  {formatDate(birth.date_of_birth)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" align="center" gutterBottom>
                  at {birth.place_of_birth}{birth.hospital_name ? ` (${birth.hospital_name})` : ''}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" align="center" gutterBottom>
                  to {birth.mother_name}{birth.father_name ? ` and ${birth.father_name}` : ''}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" align="center" gutterBottom>
                  residing at {birth.address}, {birth.city}, {birth.state}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" gutterBottom>
                  Registration Number: {birth.registration_number}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" gutterBottom align="right">
                  Date of Registration: {formatDate(birth.registration_date)}
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
            This is a preview of the birth certificate. Click Print to generate a printable version.
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

export default BirthDetail;