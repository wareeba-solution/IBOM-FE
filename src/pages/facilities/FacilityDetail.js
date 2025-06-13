// src/pages/facilities/FacilityDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  Chip,
  IconButton,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  CircularProgress,
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
  LocalHospital as HospitalIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebsiteIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  MedicalServices as ServicesIcon,
  Bed as BedIcon,
  People as PeopleIcon,
  Map as MapIcon,
  History as HistoryIcon,
  Print as PrintIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import { format } from 'date-fns';
import facilityService from '../../services/facilityService';

const FacilityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();
  
  // State
  const [facility, setFacility] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Fetch facility details
  useEffect(() => {
    const loadFacility = async () => {
      console.log('Loading facility with ID:', id);
      
      await execute(
        facilityService.getFacilityById,
        [id],
        (response) => {
          console.log('Loaded facility response:', response);
          
          // Ensure we have all required fields for the UI
          if (response && response.id) {
            // Add debugging to see what we're setting
            console.log('Setting facility state:', response);
            setFacility(response);
          } else {
            console.error('Invalid facility response:', response);
          }
        }
      );
    };
    
    if (id) {
      loadFacility();
    }
  }, [id, execute]);

  // Add debugging for facility state changes
  useEffect(() => {
    console.log('Facility state updated:', facility);
  }, [facility]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Navigation handlers
  const handleBack = () => {
    navigate('/facilities');
  };
  
  const handleEdit = () => {
    navigate(`/facilities/${id}/edit`);
  };
  
  // Delete handlers
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleDeleteConfirm = async () => {
    await execute(
      facilityService.deleteFacility,
      [id],
      () => {
        navigate('/facilities');
      }
    );
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  // Render overview tab
  const renderOverviewTab = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <HospitalIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Facility Type" 
                    secondary={facility.facilityType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Local Government Area" 
                    secondary={facility.lga} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Contact Person" 
                    secondary={facility.contactPerson} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Created Date" 
                    secondary={formatDate(facility.createdAt)} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Last Updated" 
                    secondary={formatDate(facility.updatedAt)} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact & Location
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Address" 
                    secondary={`${facility.address}, ${facility.lga}, ${facility.state}`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Phone" 
                    secondary={facility.phoneNumber} 
                  />
                </ListItem>
                {facility.email && (
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email" 
                      secondary={facility.email} 
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Services Offered
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {facility.services?.map((service, index) => (
                  <Chip 
                    key={index}
                    label={service}
                    color="primary"
                    variant="outlined"
                    icon={<ServicesIcon />}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };
  
  // Render staff tab
  const renderStaffTab = () => {
    if (!facility?.staff || !facility?.staff_count) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Staff information not available
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Staff Breakdown
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Staff Category</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Doctors</TableCell>
                      <TableCell align="right">{facility.staff.doctors || 0}</TableCell>
                      <TableCell align="right">
                        {facility.staff_count > 0 ? `${Math.round((facility.staff.doctors / facility.staff_count) * 100)}%` : '0%'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Nurses</TableCell>
                      <TableCell align="right">{facility.staff.nurses || 0}</TableCell>
                      <TableCell align="right">
                        {facility.staff_count > 0 ? `${Math.round((facility.staff.nurses / facility.staff_count) * 100)}%` : '0%'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Lab Technicians</TableCell>
                      <TableCell align="right">{facility.staff.lab_technicians || 0}</TableCell>
                      <TableCell align="right">
                        {facility.staff_count > 0 ? `${Math.round((facility.staff.lab_technicians / facility.staff_count) * 100)}%` : '0%'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Administrative</TableCell>
                      <TableCell align="right">{facility.staff.administrative || 0}</TableCell>
                      <TableCell align="right">
                        {facility.staff_count > 0 ? `${Math.round((facility.staff.administrative / facility.staff_count) * 100)}%` : '0%'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Other Staff</TableCell>
                      <TableCell align="right">{facility.staff.other || 0}</TableCell>
                      <TableCell align="right">
                        {facility.staff_count > 0 ? `${Math.round((facility.staff.other / facility.staff_count) * 100)}%` : '0%'}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ fontWeight: 'bold' }}>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>{facility.staff_count || 0}</strong></TableCell>
                      <TableCell align="right"><strong>100%</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };
  
  // Render capacity tab
  const renderCapacityTab = () => {
    if (!facility?.beds_breakdown || !facility?.beds) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Capacity information not available
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Beds Breakdown
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ward Type</TableCell>
                      <TableCell align="right">Bed Count</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>General</TableCell>
                      <TableCell align="right">{facility.beds_breakdown.general || 0}</TableCell>
                      <TableCell align="right">
                        {facility.beds > 0 ? `${Math.round((facility.beds_breakdown.general / facility.beds) * 100)}%` : '0%'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Pediatric</TableCell>
                      <TableCell align="right">{facility.beds_breakdown.pediatric || 0}</TableCell>
                      <TableCell align="right">
                        {facility.beds > 0 ? `${Math.round((facility.beds_breakdown.pediatric / facility.beds) * 100)}%` : '0%'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Maternity</TableCell>
                      <TableCell align="right">{facility.beds_breakdown.maternity || 0}</TableCell>
                      <TableCell align="right">
                        {facility.beds > 0 ? `${Math.round((facility.beds_breakdown.maternity / facility.beds) * 100)}%` : '0%'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>ICU</TableCell>
                      <TableCell align="right">{facility.beds_breakdown.icu || 0}</TableCell>
                      <TableCell align="right">
                        {facility.beds > 0 ? `${Math.round((facility.beds_breakdown.icu / facility.beds) * 100)}%` : '0%'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Emergency</TableCell>
                      <TableCell align="right">{facility.beds_breakdown.emergency || 0}</TableCell>
                      <TableCell align="right">
                        {facility.beds > 0 ? `${Math.round((facility.beds_breakdown.emergency / facility.beds) * 100)}%` : '0%'}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ fontWeight: 'bold' }}>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>{facility.beds || 0}</strong></TableCell>
                      <TableCell align="right"><strong>100%</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Equipment
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Equipment</TableCell>
                      <TableCell align="right">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(facility.equipment || []).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name || 'Unknown Equipment'}</TableCell>
                        <TableCell align="right">{item.count || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };
  
  // Render statistics tab
  const renderStatsTab = () => {
    if (!facility?.patient_stats) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Patient statistics not available
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Patient Statistics
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                    <Typography variant="h4">
                      {(facility.patient_stats.total_patients || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Total Patients
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                    <Typography variant="h4">
                      {(facility.patient_stats.monthly_average || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Monthly Average
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Typography variant="h4">
                      {`${Math.round((facility.patient_stats.outpatient_ratio || 0) * 100)}%`}
                    </Typography>
                    <Typography variant="body2">
                      Outpatient
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                    <Typography variant="h4">
                      {`${Math.round((facility.patient_stats.inpatient_ratio || 0) * 100)}%`}
                    </Typography>
                    <Typography variant="body2">
                      Inpatient
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate(`/facilities/statistics?id=${id}`)}
                >
                  View Detailed Statistics
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <MainLayout 
      title="Facility Details"
      breadcrumbs={[
        { name: 'Facilities', path: '/facilities' },
        { name: facility?.name || 'Facility Details', active: true }
      ]}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : facility ? (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={handleBack} sx={{ mr: 1 }}>
                  <ArrowBackIcon />
                </IconButton>
                <Box>
                  <Typography variant="h5" component="h1">
                    {facility.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      {facility.facility_code}
                    </Typography>
                    <Chip 
                      label={facility.status?.charAt(0).toUpperCase() + facility.status?.slice(1) || 'Unknown'} 
                      color={facility.status === 'active' ? 'success' : 'default'} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>
                </Box>
              </Box>
              
              <Box>
                <Button 
                  startIcon={<PrintIcon />} 
                  variant="outlined" 
                  sx={{ mr: 1 }}
                >
                  Print
                </Button>
                <Button 
                  startIcon={<ShareIcon />} 
                  variant="outlined" 
                  sx={{ mr: 1 }}
                >
                  Share
                </Button>
                <Button 
                  startIcon={<EditIcon />} 
                  variant="contained" 
                  color="primary" 
                  onClick={handleEdit}
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
                <Button 
                  startIcon={<DeleteIcon />} 
                  variant="outlined" 
                  color="error" 
                  onClick={handleDeleteClick}
                >
                  Delete
                </Button>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
            >
              <Tab label="Overview" icon={<HospitalIcon />} iconPosition="start" />
              <Tab label="Staff" icon={<PeopleIcon />} iconPosition="start" />
              <Tab label="Capacity" icon={<BedIcon />} iconPosition="start" />
              <Tab label="Statistics" icon={<AssessmentIcon />} iconPosition="start" />
              <Tab label="History" icon={<HistoryIcon />} iconPosition="start" />
            </Tabs>
            
            <Box sx={{ py: 2 }}>
              {tabValue === 0 && renderOverviewTab()}
              {tabValue === 1 && renderStaffTab()}
              {tabValue === 2 && renderCapacityTab()}
              {tabValue === 3 && renderStatsTab()}
              {tabValue === 4 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No historical data available
                  </Typography>
                </Box>
              )}
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
                Are you sure you want to delete {facility.name}? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteDialogClose}>Cancel</Button>
              <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        <Alert severity="warning">
          Facility not found
        </Alert>
      )}
    </MainLayout>
  );
};

export default FacilityDetail;