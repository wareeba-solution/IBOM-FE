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
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import familyPlanningService from '../../services/familyPlanningService';
import patientService from '../../services/patientService'; // If available

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
        familyPlanningService.getFamilyPlanningServiceById,
        [id],
        async (response) => {
          console.log('Loaded family planning service:', response);
          
          // Map API response to component format
          const apiData = response.data || response;
          const mappedRecord = familyPlanningService.mapFamilyPlanningService(apiData);
          
          // Try to get client information
          try {
            if (mappedRecord.client_id && patientService) {
              const clientData = await patientService.getPatientById(mappedRecord.client_id);
              if (clientData) {
                mappedRecord.patient_name = clientData.firstName && clientData.lastName ? 
                  `${clientData.firstName} ${clientData.lastName}${clientData.otherNames ? ' ' + clientData.otherNames : ''}` :
                  clientData.name || mappedRecord.patient_name || 'Unknown Client';
                mappedRecord.age = clientData.age || calculateAge(clientData.dateOfBirth);
                mappedRecord.gender = clientData.gender;
                mappedRecord.marital_status = clientData.maritalStatus;
                mappedRecord.education_level = clientData.educationLevel;
                mappedRecord.parity = clientData.parity;
              }
            }
          } catch (clientError) {
            console.warn('Could not fetch client data:', clientError);
            // Use fallback name
            if (!mappedRecord.patient_name || mappedRecord.patient_name === 'Loading...') {
              mappedRecord.patient_name = `Client ${mappedRecord.client_id ? mappedRecord.client_id.substring(0, 8) : 'Unknown'}`;
            }
          }
          
          // Try to get method information
          try {
            const methodsResponse = await familyPlanningService.getFamilyPlanningMethods();
            const methods = methodsResponse.data || [];
            const method = methods.find(m => m.id === mappedRecord.method_id);
            if (method) {
              mappedRecord.method = method.name;
            }
          } catch (methodError) {
            console.warn('Could not fetch method data:', methodError);
          }
          
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
      familyPlanningService.deleteFamilyPlanningService,
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
      <MainLayout title="Family Planning Record">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error && !record) {
    return (
      <MainLayout title="Family Planning Record">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          component={RouterLink} 
          to="/family-planning" 
          variant="contained"
          startIcon={<ArrowBackIcon />}
        >
          Back to Records
        </Button>
      </MainLayout>
    );
  }

  if (!record) {
    return (
      <MainLayout title="Family Planning Record">
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading family planning record...
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={`Family Planning Record: ${record.record_id}`}
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
              Family Planning Record
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
                <ListItemText primary="Edit Record" />
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
                  {record.gender === 'Female' ? 
                    <FemaleIcon color="secondary" sx={{ ml: 1 }} /> : 
                    <MaleIcon color="primary" sx={{ ml: 1 }} />
                  }
                </Box>
              }
              subheader={`Record ID: ${record.record_id} | Patient ID: ${record.patient_id}`}
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
                  {record.has_side_effects && (
                    <Chip 
                      label="Side Effects" 
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
                    Visit Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(record.visit_date)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Next Visit
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(record.next_visit_date)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Visit Type
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {record.visit_type}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Method
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {record.method}
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
                    Client Information
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
                      {record.gender === 'female' && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Parity
                          </TableCell>
                          <TableCell>
                            {record.parity || 'Not recorded'}
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Patient Satisfaction
                        </TableCell>
                        <TableCell>
                          {record.patient_satisfaction || 'Not Recorded'}
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
                    Service Information
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
                          Method
                        </TableCell>
                        <TableCell>
                          {record.method || 'Not specified'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Service Type
                        </TableCell>
                        <TableCell>
                          {record.service_type}
                        </TableCell>
                      </TableRow>
                      {record.quantity && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Quantity Provided
                          </TableCell>
                          <TableCell>
                            {record.quantity}
                          </TableCell>
                        </TableRow>
                      )}
                      {record.batch_number && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Batch Number
                          </TableCell>
                          <TableCell>
                            {record.batch_number}
                          </TableCell>
                        </TableRow>
                      )}
                      {record.expiry_date && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Expiry Date
                          </TableCell>
                          <TableCell>
                            {formatDate(record.expiry_date)}
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Provider
                        </TableCell>
                        <TableCell>
                          {record.provider || record.provided_by || 'Not recorded'}
                        </TableCell>
                      </TableRow>
                      {record.weight && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Weight
                          </TableCell>
                          <TableCell>
                            {record.weight} kg
                          </TableCell>
                        </TableRow>
                      )}
                      {record.blood_pressure && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Blood Pressure
                          </TableCell>
                          <TableCell>
                            {record.blood_pressure}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {record.reason_for_visit && (
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <HelpOutlineIcon sx={{ mr: 1 }} />
                      Reason for Visit
                    </Box>
                  }
                />
                <Divider />
                <CardContent>
                  <Typography variant="body1">
                    {record.reason_for_visit}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {record.counseling_provided && record.counseling_notes && (
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ContentPasteIcon sx={{ mr: 1 }} />
                      Counseling Notes
                    </Box>
                  }
                />
                <Divider />
                <CardContent>
                  <Typography variant="body1">
                    {record.counseling_notes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {record.follow_up_plan && (
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ mr: 1 }} />
                      Follow-up Plan
                    </Box>
                  }
                />
                <Divider />
                <CardContent>
                  <Typography variant="body1">
                    {record.follow_up_plan}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {record.side_effects_reported && record.side_effects_reported.length > 0 && (
            <Grid item xs={12}>
              <Card sx={{ borderColor: '#ff9800', borderWidth: 1, borderStyle: 'solid' }}>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WarningIcon sx={{ mr: 1, color: '#ff9800' }} />
                      Side Effects Reported
                    </Box>
                  }
                  sx={{ bgcolor: '#fff8e1' }}
                />
                <Divider />
                <CardContent>
                  <Typography variant="body1">
                    {Array.isArray(record.side_effects_reported) ? 
                      record.side_effects_reported.join(', ') : 
                      record.side_effects_reported}
                  </Typography>
                  {record.side_effects_management && (
                    <>
                      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                        Management:
                      </Typography>
                      <Typography variant="body1">
                        {record.side_effects_management}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          {record.counseling_notes && (
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ContentPasteIcon sx={{ mr: 1 }} />
                      Counseling Notes
                    </Box>
                  }
                />
                <Divider />
                <CardContent>
                  <Typography variant="body1">
                    {record.counseling_notes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {record.procedure_notes && (
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AssignmentIcon sx={{ mr: 1 }} />
                      Procedure Notes
                    </Box>
                  }
                />
                <Divider />
                <CardContent>
                  <Typography variant="body1">
                    {record.procedure_notes}
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
            Are you sure you want to delete this family planning record? This action cannot be undone and will remove all associated data.
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