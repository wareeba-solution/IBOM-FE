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

// Mock family planning service - replace with actual service when available
const familyPlanningService = {
  getRecordById: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const visitDate = new Date();
        visitDate.setMonth(visitDate.getMonth() - (parseInt(id) % 12));
        
        const nextVisitDate = new Date(visitDate);
        nextVisitDate.setMonth(nextVisitDate.getMonth() + 3);
        
        const age = 18 + (parseInt(id) % 30);
        const isMale = parseInt(id) % 10 === 0; // Mostly female clients, but some male for condoms or vasectomy
        
        const contraceptiveMethods = [
          'Oral Contraceptives',
          'Injectable Contraceptives',
          'Intrauterine Device (IUD)',
          'Implant',
          'Condoms',
          'Female Sterilization',
          'Male Sterilization',
          'Natural Family Planning',
          'Emergency Contraception',
          'Other'
        ];
        
        const visitTypes = [
          'Initial Consultation',
          'Follow-up',
          'Method Change',
          'Method Renewal',
          'Side Effects Consultation',
          'Counseling Only',
          'Removal',
          'Other'
        ];
        
        const mockRecord = {
          id,
          record_id: `FP${10000 + parseInt(id)}`,
          patient_id: `PT${5000 + parseInt(id)}`,
          patient_name: `${isMale ? 'John' : 'Jane'} ${['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller'][parseInt(id) % 7]} ${id}`,
          age: age,
          gender: isMale ? 'Male' : 'Female',
          visit_date: visitDate.toISOString().split('T')[0],
          next_visit_date: nextVisitDate.toISOString().split('T')[0],
          visit_type: visitTypes[parseInt(id) % visitTypes.length],
          method: isMale ? 
            (parseInt(id) % 5 === 0 ? 'Male Sterilization' : 'Condoms') : 
            contraceptiveMethods[parseInt(id) % (contraceptiveMethods.length - 2)],
          quantity_provided: parseInt(id) % 5 === 0 ? 0 : (parseInt(id) % 10 + 1),
          location: `${['Uyo', 'Ikot Ekpene', 'Eket', 'Oron', 'Abak'][parseInt(id) % 5]} Health Center`,
          provider: `Provider ${parseInt(id) % 10 + 1}`,
          has_side_effects: (parseInt(id) % 7 === 0),
          side_effects: parseInt(id) % 7 === 0 ? 
            'Patient reported headaches and nausea after starting the method.' : '',
          is_new_acceptor: (parseInt(id) % 5 === 0),
          parity: parseInt(id) % 8,
          marital_status: ['Single', 'Married', 'Divorced', 'Widowed'][parseInt(id) % 4],
          education_level: ['None', 'Primary', 'Secondary', 'Tertiary'][parseInt(id) % 4],
          partner_support: ['Supportive', 'Unsupportive', 'Unaware', 'N/A'][parseInt(id) % 4],
          reason_for_visit: parseInt(id) % 5 === 0 ? 
            'Patient wants to start family planning.' : 
            (parseInt(id) % 7 === 0 ? 
              'Patient experiencing side effects.' : 
              'Routine follow-up visit.'),
          counseling_provided: true,
          counseling_notes: 'Discussed all available methods and their side effects. Emphasized importance of consistent use.',
          follow_up_plan: 'Return in 3 months for method renewal or sooner if experiencing issues.',
          notes: parseInt(id) % 3 === 0 ? 
            'Patient expressed concern about privacy. Reassured about confidentiality.' : '',
          created_at: visitDate.toISOString()
        };
        resolve(mockRecord);
      }, 500);
    });
  },
  deleteRecord: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  }
};

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
        familyPlanningService.getRecordById,
        [id],
        (response) => {
          setRecord(response);
        }
      );
    };
    
    loadRecord();
  }, [id]);

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

  const handleDeleteConfirm = async () => {
    await execute(
      familyPlanningService.deleteRecord,
      [id],
      () => {
        navigate('/family-planning');
      }
    );
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
                          {record.age} years
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Gender
                        </TableCell>
                        <TableCell>
                          {record.gender}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Marital Status
                        </TableCell>
                        <TableCell>
                          {record.marital_status}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Education Level
                        </TableCell>
                        <TableCell>
                          {record.education_level}
                        </TableCell>
                      </TableRow>
                      {record.gender === 'Female' && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Parity
                          </TableCell>
                          <TableCell>
                            {record.parity}
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Partner Support
                        </TableCell>
                        <TableCell>
                          {record.partner_support}
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
                    Method Information
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
                          {record.method}
                        </TableCell>
                      </TableRow>
                      {!['Intrauterine Device (IUD)', 'Implant', 'Female Sterilization', 'Male Sterilization'].includes(record.method) && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Quantity Provided
                          </TableCell>
                          <TableCell>
                            {record.quantity_provided}
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell component="th" scope="row">
                          New Acceptor
                        </TableCell>
                        <TableCell>
                          {record.is_new_acceptor ? 'Yes' : 'No'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Counseling Provided
                        </TableCell>
                        <TableCell>
                          {record.counseling_provided ? 'Yes' : 'No'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Side Effects Reported
                        </TableCell>
                        <TableCell>
                          {record.has_side_effects ? 'Yes' : 'No'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Location
                        </TableCell>
                        <TableCell>
                          {record.location}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Provider
                        </TableCell>
                        <TableCell>
                          {record.provider}
                        </TableCell>
                      </TableRow>
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

          {record.has_side_effects && record.side_effects && (
            <Grid item xs={12}>
              <Card sx={{ borderColor: '#ff9800', borderWidth: 1, borderStyle: 'solid' }}>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WarningIcon sx={{ mr: 1, color: '#ff9800' }} />
                      Side Effects
                    </Box>
                  }
                  sx={{ bgcolor: '#fff8e1' }}
                />
                <Divider />
                <CardContent>
                  <Typography variant="body1">
                    {record.side_effects}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {record.notes && (
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AssignmentIcon sx={{ mr: 1 }} />
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