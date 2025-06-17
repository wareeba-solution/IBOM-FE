// src/pages/familyPlanning/FamilyPlanningDetail.js
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
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
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
  TableRow,
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
  Female as FemaleIcon,
  Male as MaleIcon,
  CalendarToday as CalendarIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  MedicalServices as MedicalIcon,
  AccessTime as AccessTimeIcon,
  HelpOutline as HelpOutlineIcon,
  ContentPaste as ContentPasteIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  Phone as PhoneIcon,
  ContactPhone as ContactPhoneIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import familyPlanningService from '../../services/familyPlanningService';

// Family Planning Detail Component
const FamilyPlanningDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [record, setRecord] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch record data
  useEffect(() => {
    const loadRecord = async () => {
      await execute(
        familyPlanningService.getFamilyPlanningClientById,
        [id],
        async (response) => {
          
          // Map API response to component format
          const clientData = response.data || response;
          const patient = clientData.patient || {};
          const facility = clientData.facility || {};
          const primaryContact = clientData.primaryContact || {};
          
          const mappedRecord = {
            id: clientData.id,
            record_id: `FPC${clientData.id ? clientData.id.substring(0, 8) : '00000000'}`,
            patient_id: clientData.patientId,
            facility_id: clientData.facilityId,
            
            // Patient information from nested patient object
            patient_name: patient.firstName && patient.lastName ? 
              `${patient.firstName} ${patient.lastName}` : 
              'Unknown Client',
            gender: patient.gender,
            date_of_birth: patient.dateOfBirth,
            age: patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : null,
            phone_number: patient.phoneNumber,
            
            // Client information
            registration_date: clientData.registrationDate,
            client_type: clientData.clientType,
            marital_status: clientData.maritalStatus,
            number_of_children: clientData.numberOfChildren,
            desired_number_of_children: clientData.desiredNumberOfChildren,
            education_level: clientData.educationLevel,
            occupation: clientData.occupation,
            
            // Contact information
            primary_contact: primaryContact,
            contact_name: primaryContact.name || 'Not provided',
            contact_phone: primaryContact.phoneNumber || 'Not provided',
            contact_relationship: primaryContact.relationship || 'Not provided',
            contact_address: primaryContact.address || 'Not provided',
            
            // Medical information
            medical_history: clientData.medicalHistory,
            allergy_history: clientData.allergyHistory,
            reproductive_history: clientData.reproductiveHistory,
            menstrual_history: clientData.menstrualHistory,
            
            // Service information
            referred_by: clientData.referredBy,
            notes: clientData.notes,
            status: clientData.status,
            
            // Facility information
            facility_name: facility.name,
            facility_type: facility.facilityType,
            facility_lga: facility.lga,
            
            // Computed fields
            is_new_acceptor: clientData.clientType === 'New Acceptor',
            is_active: clientData.status === 'Active',
            has_allergies: !!clientData.allergyHistory,
            
            // Timestamps
            created_at: clientData.createdAt,
            updated_at: clientData.updatedAt,
          };
          
          setRecord(mappedRecord);
        }
      );
    };
    
    loadRecord();
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

  // Handle delete - Updated for real API
  const handleDeleteConfirm = async () => {
    await execute(
      familyPlanningService.deleteFamilyPlanningClient,
      [id],
      () => {
        navigate('/family-planning');
      }
    );
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
    navigate(`/family-planning/${id}/edit`);
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  if (loading && !record) {
    return (
      <MainLayout title="Family Planning Client">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error && !record) {
    return (
      <MainLayout title="Family Planning Client">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          component={RouterLink} 
          to="/family-planning" 
          variant="contained"
          startIcon={<ArrowBackIcon />}
        >
          Back to Clients
        </Button>
      </MainLayout>
    );
  }

  if (!record) {
    return (
      <MainLayout title="Family Planning Client">
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading family planning client...
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={`Family Planning Client: ${record.record_id}`}
      breadcrumbs={[
        { name: 'Family Planning', path: '/family-planning' },
        { name: record.record_id, active: true }
      ]}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/family-planning"
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              Family Planning Client
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
              aria-controls="record-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="record-menu"
              anchorEl={menuAnchorEl}
              keepMounted
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEditRecord}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Edit Client" />
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); /* Add print functionality */ }}>
                <ListItemIcon>
                  <PrintIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Print Record" />
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); /* Add share functionality */ }}>
                <ListItemIcon>
                  <ShareIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Share Record" />
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); /* Add export functionality */ }}>
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
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  {record.patient_name}
                  {record.gender === 'female' ? 
                    <FemaleIcon color="secondary" sx={{ ml: 1 }} /> : 
                    <MaleIcon color="primary" sx={{ ml: 1 }} />
                  }
                </Box>
              }
              subheader={`Client ID: ${record.record_id} | Patient ID: ${record.patient_id}`}
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {record.is_new_acceptor && (
                    <Chip 
                      label="New Acceptor" 
                      color="primary" 
                      size="medium" 
                      variant="outlined" 
                    />
                  )}
                  {record.is_active && (
                    <Chip 
                      label="Active" 
                      color="success" 
                      size="medium" 
                      variant="outlined" 
                    />
                  )}
                  {record.has_allergies && (
                    <Chip 
                      label="Has Allergies" 
                      color="warning" 
                      size="medium" 
                      variant="outlined" 
                    />
                  )}
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Registration Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(record.registration_date)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Client Type
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {record.client_type}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {record.status}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Facility
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {record.facility_name}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    Patient Information
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row" width="40%">
                          Age
                        </TableCell>
                        <TableCell>
                          {record.age ? `${record.age} years` : 'Not available'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Gender
                        </TableCell>
                        <TableCell>
                          {record.gender ? record.gender.charAt(0).toUpperCase() + record.gender.slice(1) : 'Not specified'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Date of Birth
                        </TableCell>
                        <TableCell>
                          {formatDate(record.date_of_birth)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Phone Number
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                            {record.phone_number || 'Not provided'}
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Marital Status
                        </TableCell>
                        <TableCell>
                          {record.marital_status || 'Not recorded'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Education Level
                        </TableCell>
                        <TableCell>
                          {record.education_level || 'Not recorded'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Occupation
                        </TableCell>
                        <TableCell>
                          {record.occupation || 'Not recorded'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MedicalIcon sx={{ mr: 1 }} />
                    Family Planning Information
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row" width="40%">
                          Client Type
                        </TableCell>
                        <TableCell>
                          {record.client_type || 'Not specified'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Number of Children
                        </TableCell>
                        <TableCell>
                          {record.number_of_children || 0}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Desired Children
                        </TableCell>
                        <TableCell>
                          {record.desired_number_of_children || 'Not specified'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Referred By
                        </TableCell>
                        <TableCell>
                          {record.referred_by || 'Self-referred'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Facility
                        </TableCell>
                        <TableCell>
                          {record.facility_name} ({record.facility_lga})
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Status
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={record.status} 
                            color={record.is_active ? 'success' : 'default'} 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ContactPhoneIcon sx={{ mr: 1 }} />
                    Emergency Contact
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row" width="40%">
                          Name
                        </TableCell>
                        <TableCell>
                          {record.contact_name}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Relationship
                        </TableCell>
                        <TableCell>
                          {record.contact_relationship}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Phone Number
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                            {record.contact_phone}
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Address
                        </TableCell>
                        <TableCell>
                          {record.contact_address}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MedicalIcon sx={{ mr: 1 }} />
                    Medical History
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row" width="40%">
                          Medical History
                        </TableCell>
                        <TableCell>
                          {record.medical_history || 'No significant medical history'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Reproductive History
                        </TableCell>
                        <TableCell>
                          {record.reproductive_history || 'Not recorded'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Menstrual History
                        </TableCell>
                        <TableCell>
                          {record.menstrual_history || 'Not recorded'}
                        </TableCell>
                      </TableRow>
                      {record.allergy_history && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <WarningIcon fontSize="small" color="warning" sx={{ mr: 1 }} />
                              Allergies
                            </Box>
                          </TableCell>
                          <TableCell>
                            {record.allergy_history}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {record.notes && (
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ContentPasteIcon sx={{ mr: 1 }} />
                      Additional Notes
                    </Box>
                  }
                />
                <Divider />
                <CardContent>
                  <Typography variant="body1">
                    {record.notes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

        </Grid>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this family planning client record? This action cannot be undone and will remove all associated data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default FamilyPlanningDetail;