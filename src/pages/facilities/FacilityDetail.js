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

// Mock facility service - replace with actual service when available
const facilityService = {
  getFacilityById: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockFacility = {
          id,
          facility_code: `FAC${10000 + parseInt(id)}`,
          name: `${parseInt(id) % 3 === 0 ? 'General Hospital' : (parseInt(id) % 3 === 1 ? 'Primary Health Center' : 'Medical Clinic')} ${id}`,
          type: parseInt(id) % 3 === 0 ? 'Hospital' : (parseInt(id) % 3 === 1 ? 'Primary Health Center' : 'Clinic'),
          level: parseInt(id) % 3 === 0 ? 'Secondary' : (parseInt(id) % 3 === 1 ? 'Primary' : 'Primary'),
          ownership: parseInt(id) % 4 === 0 ? 'Government' : (parseInt(id) % 4 === 1 ? 'Private' : (parseInt(id) % 4 === 2 ? 'Faith-based' : 'NGO')),
          address: `Address ${id}, Akwa Ibom`,
          city: parseInt(id) % 5 === 0 ? 'Uyo' : (parseInt(id) % 5 === 1 ? 'Ikot Ekpene' : (parseInt(id) % 5 === 2 ? 'Eket' : (parseInt(id) % 5 === 3 ? 'Oron' : 'Abak'))),
          local_govt: parseInt(id) % 5 === 0 ? 'Uyo' : (parseInt(id) % 5 === 1 ? 'Ikot Ekpene' : (parseInt(id) % 5 === 2 ? 'Eket' : (parseInt(id) % 5 === 3 ? 'Oron' : 'Abak'))),
          state: 'Akwa Ibom',
          postal_code: `5${id}${id}${id}${id}`,
          phone: `080${id}${id}${id}${id}${id}${id}${id}${id}`,
          email: `facility${id}@example.com`,
          website: parseInt(id) % 3 === 0 ? `www.facility${id}.com` : '',
          gps_coordinates: `${4 + Math.random() * 2}, ${7 + Math.random() * 2}`,
          services: [
            'Outpatient Services',
            parseInt(id) % 2 === 0 ? 'Surgery' : 'Laboratory Services',
            parseInt(id) % 3 === 0 ? 'Emergency Services' : 'Pharmacy',
            parseInt(id) % 4 === 0 ? 'Maternity' : 'Pediatrics'
          ],
          beds: parseInt(id) % 3 === 0 ? 50 + parseInt(id) : (parseInt(id) % 3 === 1 ? 20 + parseInt(id) : 10 + parseInt(id)),
          staff_count: parseInt(id) % 3 === 0 ? 100 + parseInt(id) : (parseInt(id) % 3 === 1 ? 30 + parseInt(id) : 15 + parseInt(id)),
          head_name: `Dr. ${parseInt(id) % 2 === 0 ? 'John' : 'Jane'} Smith ${id}`,
          head_title: parseInt(id) % 3 === 0 ? 'Medical Director' : (parseInt(id) % 3 === 1 ? 'Chief Medical Officer' : 'Head Doctor'),
          registration_date: new Date(2010 + (parseInt(id) % 12), (parseInt(id) % 12), parseInt(id) % 28 + 1).toISOString().split('T')[0],
          status: parseInt(id) % 10 === 0 ? 'Inactive' : 'Active',
          last_updated: new Date(2023, (parseInt(id) % 12), parseInt(id) % 28 + 1).toISOString(),
          // Additional mock data for stats
          staff: {
            doctors: parseInt(id) % 3 === 0 ? 20 + parseInt(id) % 10 : (parseInt(id) % 3 === 1 ? 8 + parseInt(id) % 5 : 3 + parseInt(id) % 3),
            nurses: parseInt(id) % 3 === 0 ? 40 + parseInt(id) % 15 : (parseInt(id) % 3 === 1 ? 15 + parseInt(id) % 8 : 5 + parseInt(id) % 5),
            lab_technicians: parseInt(id) % 3 === 0 ? 10 + parseInt(id) % 5 : (parseInt(id) % 3 === 1 ? 3 + parseInt(id) % 2 : 1),
            administrative: parseInt(id) % 3 === 0 ? 15 + parseInt(id) % 10 : (parseInt(id) % 3 === 1 ? 5 + parseInt(id) % 3 : 2 + parseInt(id) % 2),
            other: parseInt(id) % 3 === 0 ? 15 : (parseInt(id) % 3 === 1 ? 5 : 2)
          },
          // Mock patient stats
          patient_stats: {
            total_patients: parseInt(id) * 250,
            monthly_average: parseInt(id) * 20,
            outpatient_ratio: 0.7,
            inpatient_ratio: 0.3
          },
          // Mock beds breakdown
          beds_breakdown: {
            general: parseInt(id) % 3 === 0 ? 25 + parseInt(id) % 10 : (parseInt(id) % 3 === 1 ? 10 + parseInt(id) % 5 : 5 + parseInt(id) % 3),
            pediatric: parseInt(id) % 3 === 0 ? 10 + parseInt(id) % 5 : (parseInt(id) % 3 === 1 ? 5 + parseInt(id) % 3 : 2 + parseInt(id) % 2),
            maternity: parseInt(id) % 3 === 0 ? 8 + parseInt(id) % 4 : (parseInt(id) % 3 === 1 ? 3 + parseInt(id) % 2 : 1),
            icu: parseInt(id) % 3 === 0 ? 5 + parseInt(id) % 3 : (parseInt(id) % 3 === 1 ? 0 : 0),
            emergency: parseInt(id) % 3 === 0 ? 5 : (parseInt(id) % 3 === 1 ? 2 : 1)
          },
          // Mock equipment count
          equipment: [
            { name: 'X-Ray Machine', count: parseInt(id) % 3 === 0 ? 2 : (parseInt(id) % 3 === 1 ? 1 : 0) },
            { name: 'Ultrasound Machine', count: parseInt(id) % 3 === 0 ? 3 : (parseInt(id) % 3 === 1 ? 1 : 0) },
            { name: 'ECG Machine', count: parseInt(id) % 3 === 0 ? 2 : (parseInt(id) % 3 === 1 ? 1 : 0) },
            { name: 'Ventilator', count: parseInt(id) % 3 === 0 ? 5 : (parseInt(id) % 3 === 1 ? 0 : 0) },
            { name: 'Defibrillator', count: parseInt(id) % 3 === 0 ? 3 : (parseInt(id) % 3 === 1 ? 1 : 0) },
            { name: 'Surgical Equipment', count: parseInt(id) % 3 === 0 ? 5 : (parseInt(id) % 3 === 1 ? 2 : 0) }
          ]
        };
        resolve(mockFacility);
      }, 500);
    });
  },
  deleteFacility: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  }
};

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
      await execute(
        facilityService.getFacilityById,
        [id],
        (response) => {
          setFacility(response);
        }
      );
    };
    
    loadFacility();
  }, [id]);
  
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
                    secondary={`${facility.type} (${facility.level})`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BedIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Bed Capacity" 
                    secondary={facility.beds} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Staff Count" 
                    secondary={facility.staff_count} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Head of Facility" 
                    secondary={`${facility.head_name} (${facility.head_title})`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Registration Date" 
                    secondary={formatDate(facility.registration_date)} 
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
                    secondary={`${facility.address}, ${facility.city}, ${facility.local_govt}, ${facility.state}`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Phone" 
                    secondary={facility.phone} 
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
                {facility.website && (
                  <ListItem>
                    <ListItemIcon>
                      <WebsiteIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Website" 
                      secondary={facility.website} 
                    />
                  </ListItem>
                )}
                {facility.gps_coordinates && (
                  <ListItem>
                    <ListItemIcon>
                      <MapIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="GPS Coordinates" 
                      secondary={facility.gps_coordinates} 
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
                {facility.services.map((service, index) => (
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
                      <TableCell align="right">{facility.staff.doctors}</TableCell>
                      <TableCell align="right">
                        {`${Math.round((facility.staff.doctors / facility.staff_count) * 100)}%`}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Nurses</TableCell>
                      <TableCell align="right">{facility.staff.nurses}</TableCell>
                      <TableCell align="right">
                        {`${Math.round((facility.staff.nurses / facility.staff_count) * 100)}%`}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Lab Technicians</TableCell>
                      <TableCell align="right">{facility.staff.lab_technicians}</TableCell>
                      <TableCell align="right">
                        {`${Math.round((facility.staff.lab_technicians / facility.staff_count) * 100)}%`}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Administrative</TableCell>
                      <TableCell align="right">{facility.staff.administrative}</TableCell>
                      <TableCell align="right">
                        {`${Math.round((facility.staff.administrative / facility.staff_count) * 100)}%`}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Other Staff</TableCell>
                      <TableCell align="right">{facility.staff.other}</TableCell>
                      <TableCell align="right">
                        {`${Math.round((facility.staff.other / facility.staff_count) * 100)}%`}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ fontWeight: 'bold' }}>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>{facility.staff_count}</strong></TableCell>
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
                      <TableCell align="right">{facility.beds_breakdown.general}</TableCell>
                      <TableCell align="right">
                        {`${Math.round((facility.beds_breakdown.general / facility.beds) * 100)}%`}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Pediatric</TableCell>
                      <TableCell align="right">{facility.beds_breakdown.pediatric}</TableCell>
                      <TableCell align="right">
                        {`${Math.round((facility.beds_breakdown.pediatric / facility.beds) * 100)}%`}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Maternity</TableCell>
                      <TableCell align="right">{facility.beds_breakdown.maternity}</TableCell>
                      <TableCell align="right">
                        {`${Math.round((facility.beds_breakdown.maternity / facility.beds) * 100)}%`}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>ICU</TableCell>
                      <TableCell align="right">{facility.beds_breakdown.icu}</TableCell>
                      <TableCell align="right">
                        {`${Math.round((facility.beds_breakdown.icu / facility.beds) * 100)}%`}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Emergency</TableCell>
                      <TableCell align="right">{facility.beds_breakdown.emergency}</TableCell>
                      <TableCell align="right">
                        {`${Math.round((facility.beds_breakdown.emergency / facility.beds) * 100)}%`}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ fontWeight: 'bold' }}>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>{facility.beds}</strong></TableCell>
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
                    {facility.equipment.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{item.count}</TableCell>
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
                      {facility.patient_stats.total_patients.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Total Patients
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                    <Typography variant="h4">
                      {facility.patient_stats.monthly_average.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Monthly Average
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Typography variant="h4">
                      {`${Math.round(facility.patient_stats.outpatient_ratio * 100)}%`}
                    </Typography>
                    <Typography variant="body2">
                      Outpatient
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                    <Typography variant="h4">
                      {`${Math.round(facility.patient_stats.inpatient_ratio * 100)}%`}
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
                      label={facility.status} 
                      color={facility.status === 'Active' ? 'success' : 'default'} 
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