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
  LocalHospital as HospitalIcon,
  Healing as HealingIcon,
  AssignmentInd as AssignmentIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import birthService, { getBirthById } from '../../services/birthService';

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
        getBirthById,
        [id],
        (response) => {
          setBirth(response);
          console.log("Birth record loaded:", response);
        }
      );
    };
    
    if (id) {
      loadBirth();
    }
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

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      // Assuming time format is HH:mm:ss
      const [hours, minutes] = timeString.split(':');
      const hour12 = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
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
      title={`Birth Record: Baby ${birth.gender} - ${formatDate(birth.birthDate)}`}
      breadcrumbs={[
        { name: 'Births', path: '/births' },
        { name: `Baby ${birth.gender} - ${formatDate(birth.birthDate)}`, active: true }
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
              disabled={!birth.isBirthCertificateIssued}
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
              <MenuItem onClick={handlePrintCertificate} disabled={!birth.isBirthCertificateIssued}>
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
              title={`Baby ${birth.gender} - Born ${formatDate(birth.birthDate)}`}
              subheader={`Birth ID: ${birth.id}`}
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={birth.isBirthCertificateIssued ? 'Certificate Issued' : 'Certificate Pending'} 
                    color={birth.isBirthCertificateIssued ? 'success' : 'warning'} 
                    size="medium" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={birth.resuscitation ? 'Resuscitation Required' : 'Normal Birth'} 
                    color={birth.resuscitation ? 'error' : 'success'} 
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
                    Gender
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {birth.gender ? birth.gender.charAt(0).toUpperCase() + birth.gender.slice(1) : 'Not specified'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Birth Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(birth.birthDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Birth Time
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatTime(birth.birthTime)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Birth Weight
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {birth.birthWeight ? `${birth.birthWeight} kg` : 'Not recorded'}
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
              <Tab icon={<ChildIcon />} iconPosition="start" label="Birth Details" />
              <Tab icon={<PersonIcon />} iconPosition="start" label="Mother Information" />
              <Tab icon={<HospitalIcon />} iconPosition="start" label="Medical Details" />
              <Tab icon={<AssignmentIcon />} iconPosition="start" label="Certificate Status" />
            </Tabs>
          </Box>

          {/* Birth Details Tab */}
          <TabPanel value={tabValue} index={0}>
            <Card>
              <CardHeader
                title="Birth Information"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Gender
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.gender ? birth.gender.charAt(0).toUpperCase() + birth.gender.slice(1) : 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Birth Date
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(birth.birthDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Birth Time
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatTime(birth.birthTime)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Birth Weight
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.birthWeight ? `${birth.birthWeight} kg` : 'Not recorded'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Birth Type
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.birthType ? birth.birthType.charAt(0).toUpperCase() + birth.birthType.slice(1) : 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Delivery Method
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.deliveryMethod ? birth.deliveryMethod.charAt(0).toUpperCase() + birth.deliveryMethod.slice(1) : 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Facility ID
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.facilityId || 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Resuscitation Required
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <Chip 
                        label={birth.resuscitation ? 'Yes' : 'No'} 
                        color={birth.resuscitation ? 'error' : 'success'} 
                        size="small" 
                        variant="outlined" 
                      />
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Mother Information Tab */}
          <TabPanel value={tabValue} index={1}>
            <Card>
              <CardHeader
                title="Mother Information"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mother ID
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.motherId || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.motherName || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Age
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.motherAge ? `${birth.motherAge} years` : 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      LGA of Origin
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.motherLgaOrigin || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      LGA of Residence
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.motherLgaResidence || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Parity (Number of Births)
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.motherParity !== null && birth.motherParity !== undefined ? birth.motherParity : 'Not recorded'}
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
                title="Medical Assessment Details"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      APGAR Score (1 minute)
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" color={birth.apgarScoreOneMin >= 7 ? 'success.main' : birth.apgarScoreOneMin >= 4 ? 'warning.main' : 'error.main'}>
                          {birth.apgarScoreOneMin !== null && birth.apgarScoreOneMin !== undefined ? birth.apgarScoreOneMin : 'N/A'}
                        </Typography>
                        {birth.apgarScoreOneMin !== null && birth.apgarScoreOneMin !== undefined && (
                          <Chip 
                            label={birth.apgarScoreOneMin >= 7 ? 'Good' : birth.apgarScoreOneMin >= 4 ? 'Fair' : 'Poor'} 
                            color={birth.apgarScoreOneMin >= 7 ? 'success' : birth.apgarScoreOneMin >= 4 ? 'warning' : 'error'} 
                            size="small" 
                            variant="outlined" 
                          />
                        )}
                      </Box>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      APGAR Score (5 minutes)
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" color={birth.apgarScoreFiveMin >= 7 ? 'success.main' : birth.apgarScoreFiveMin >= 4 ? 'warning.main' : 'error.main'}>
                          {birth.apgarScoreFiveMin !== null && birth.apgarScoreFiveMin !== undefined ? birth.apgarScoreFiveMin : 'N/A'}
                        </Typography>
                        {birth.apgarScoreFiveMin !== null && birth.apgarScoreFiveMin !== undefined && (
                          <Chip 
                            label={birth.apgarScoreFiveMin >= 7 ? 'Good' : birth.apgarScoreFiveMin >= 4 ? 'Fair' : 'Poor'} 
                            color={birth.apgarScoreFiveMin >= 7 ? 'success' : birth.apgarScoreFiveMin >= 4 ? 'warning' : 'error'} 
                            size="small" 
                            variant="outlined" 
                          />
                        )}
                      </Box>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Birth Weight
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">
                          {birth.birthWeight ? `${birth.birthWeight} kg` : 'Not recorded'}
                        </Typography>
                        {birth.birthWeight && (
                          <Chip 
                            label={
                              birth.birthWeight >= 2.5 && birth.birthWeight <= 4.0 ? 'Normal' :
                              birth.birthWeight < 2.5 ? 'Low' : 'High'
                            }
                            color={
                              birth.birthWeight >= 2.5 && birth.birthWeight <= 4.0 ? 'success' :
                              birth.birthWeight < 2.5 ? 'warning' : 'info'
                            }
                            size="small" 
                            variant="outlined" 
                          />
                        )}
                      </Box>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Birth Type
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.birthType ? birth.birthType.charAt(0).toUpperCase() + birth.birthType.slice(1) : 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Delivery Method
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.deliveryMethod ? birth.deliveryMethod.charAt(0).toUpperCase() + birth.deliveryMethod.slice(1) : 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Resuscitation Required
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <Chip 
                        label={birth.resuscitation ? 'Yes - Required' : 'No - Not Required'} 
                        color={birth.resuscitation ? 'error' : 'success'} 
                        size="small" 
                        variant="outlined" 
                        icon={birth.resuscitation ? <HealingIcon /> : undefined}
                      />
                    </Typography>
                  </Grid>
                </Grid>

                {/* APGAR Score Information */}
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    APGAR Score Reference
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • <strong>7-10:</strong> Good condition (normal)<br/>
                    • <strong>4-6:</strong> Fair condition (may need some resuscitative measures)<br/>
                    • <strong>0-3:</strong> Poor condition (needs immediate resuscitation)
                  </Typography>
                </Box>

                {/* Birth Weight Information */}
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Birth Weight Reference
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • <strong>2.5-4.0 kg:</strong> Normal birth weight<br/>
                    • <strong>&lt;2.5 kg:</strong> Low birth weight<br/>
                    • <strong>&gt;4.0 kg:</strong> High birth weight (macrosomia)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Certificate Status Tab */}
          <TabPanel value={tabValue} index={3}>
            <Card>
              <CardHeader
                title="Birth Certificate Status"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Certificate Status
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <Chip 
                        label={birth.isBirthCertificateIssued ? 'Certificate Issued' : 'Certificate Not Issued'} 
                        color={birth.isBirthCertificateIssued ? 'success' : 'warning'} 
                        size="medium" 
                        variant="outlined" 
                      />
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Birth Record ID
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Facility ID
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {birth.facilityId || 'Not specified'}
                    </Typography>
                  </Grid>
                </Grid>

                {!birth.isBirthCertificateIssued && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                      Certificate Not Yet Issued
                    </Typography>
                    <Typography variant="body2" color="warning.dark">
                      The birth certificate for this record has not been issued yet. Please contact the registrar's office to process the certificate.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="contained" 
                        color="warning" 
                        size="small"
                        onClick={() => {
                          // Handle certificate request
                          console.log('Request certificate for birth ID:', birth.id);
                        }}
                      >
                        Request Certificate
                      </Button>
                    </Box>
                  </Box>
                )}

                {birth.isBirthCertificateIssued && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="success.dark" gutterBottom>
                      Certificate Available
                    </Typography>
                    <Typography variant="body2" color="success.dark">
                      The birth certificate for this record has been issued and is available for printing.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="contained" 
                        color="success" 
                        size="small"
                        startIcon={<PrintIcon />}
                        onClick={handlePrintCertificate}
                      >
                        Print Certificate
                      </Button>
                    </Box>
                  </Box>
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
            Are you sure you want to delete this birth record for Baby {birth.gender} born on {formatDate(birth.birthDate)}? This action cannot be undone and will remove all associated data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Birth Certificate Dialog */}
      <Dialog
        open={certificateDialogOpen}
        onClose={handleCertificateDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Birth Certificate</Typography>
            <IconButton onClick={handleCertificateDialogClose}>
              <ArrowBackIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 3, border: '2px solid #ccc', borderRadius: 2, bgcolor: 'background.paper' }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" gutterBottom>
                BIRTH CERTIFICATE
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Akwa Ibom State Government
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ministry of Health
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Certificate of Birth
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Birth Record ID:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {birth.id}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Certificate Status:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {birth.isBirthCertificateIssued ? 'ISSUED' : 'PENDING'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Child Information:
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  Baby {birth.gender ? birth.gender.charAt(0).toUpperCase() + birth.gender.slice(1) : 'Unknown'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Gender:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {birth.gender ? birth.gender.charAt(0).toUpperCase() + birth.gender.slice(1) : 'Not specified'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Date of Birth:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatDate(birth.birthDate)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Time of Birth:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatTime(birth.birthTime)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Birth Weight:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {birth.birthWeight ? `${birth.birthWeight} kg` : 'Not recorded'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Mother's Full Name:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {birth.motherName || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Mother's Age:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {birth.motherAge ? `${birth.motherAge} years` : 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Mother's LGA of Origin:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {birth.motherLgaOrigin || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Mother's LGA of Residence:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {birth.motherLgaResidence || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Birth Type:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {birth.birthType ? birth.birthType.charAt(0).toUpperCase() + birth.birthType.slice(1) : 'Not specified'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Delivery Method:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {birth.deliveryMethod ? birth.deliveryMethod.charAt(0).toUpperCase() + birth.deliveryMethod.slice(1) : 'Not specified'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Facility ID:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {birth.facilityId || 'Not specified'}
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                This certificate is issued under the authority of the Akwa Ibom State Government
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2">
                    ________________________
                  </Typography>
                  <Typography variant="caption">
                    Registrar's Signature
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2">
                    ________________________
                  </Typography>
                  <Typography variant="caption">
                    Official Seal
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCertificateDialogClose}>
            Close
          </Button>
          <Button 
            variant="contained" 
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            disabled={!birth.isBirthCertificateIssued}
          >
            Print Certificate
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            disabled={!birth.isBirthCertificateIssued}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default BirthDetail;
