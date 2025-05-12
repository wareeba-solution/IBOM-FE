// src/pages/patients/PatientsList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Alert,
  CircularProgress,
  Grid,
  Pagination,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import MainLayout from '../../components/common/Layout/MainLayout';
import patientService from '../../services/patientService';
import { useApi } from '../../hooks/useApi';

const PatientsList = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    gender: '',
    ageGroup: '',
    location: '',
    status: 'active'
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPatients, setTotalPatients] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Fetch patients data
  const fetchPatients = async () => {
    const queryParams = {
      page: page + 1,
      per_page: pageSize,
      search: searchTerm,
      ...filters
    };

    const result = await execute(
      patientService.getAllPatients,
      [queryParams],
      (response) => {
        setPatients(response.data);
        setTotalPatients(response.meta.total);
      }
    );

    // In development, using mock data
    if (!result.success) {
      // Mock data for development
      const mockPatients = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        registration_number: `PAT${1000 + i}`,
        full_name: `Patient ${i + 1}`,
        gender: i % 2 === 0 ? 'Male' : 'Female',
        date_of_birth: new Date(1980 + i % 40, i % 12, i % 28 + 1).toISOString().split('T')[0],
        phone: `080${i}${i}${i}${i}${i}${i}${i}${i}`,
        address: `Address ${i + 1}, Akwa Ibom`,
        location: i % 3 === 0 ? 'Urban' : 'Rural',
        status: i % 10 === 0 ? 'inactive' : 'active',
        last_visit: i % 5 === 0 ? null : new Date(2023, i % 12, i % 28 + 1).toISOString().split('T')[0],
        created_at: new Date(2022, i % 12, i % 28 + 1).toISOString()
      }));
      
      setPatients(mockPatients);
      setTotalPatients(mockPatients.length);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchPatients();
  }, [page, pageSize, searchTerm, filters]);

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  // Handle filters
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      gender: '',
      ageGroup: '',
      location: '',
      status: 'active'
    });
    setPage(0);
    setFilterAnchorEl(null);
  };

  // Navigation actions
  const handleAddPatient = () => {
    navigate('/patients/new');
  };

  const handlePatientClick = (id) => {
    navigate(`/patients/${id}`);
  };

  const handleEditPatient = (id, event) => {
    event.stopPropagation();
    navigate(`/patients/${id}/edit`);
  };

  // Handle delete
  const handleDeleteClick = (patient, event) => {
    event.stopPropagation();
    setSelectedPatient(patient);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedPatient(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPatient) {
      await execute(
        patientService.deletePatient,
        [selectedPatient.id],
        () => {
          fetchPatients();
          setDeleteDialogOpen(false);
          setSelectedPatient(null);
        }
      );
    }
  };

  // Table columns
  const columns = [
    { field: 'registration_number', headerName: 'Reg. No.', width: 120 },
    { field: 'full_name', headerName: 'Patient Name', width: 200 },
    { field: 'gender', headerName: 'Gender', width: 100 },
    { 
      field: 'date_of_birth', 
      headerName: 'DOB / Age', 
      width: 120,
      valueGetter: (params) => {
        if (!params.value) return 'Unknown';
        
        const dob = new Date(params.value);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        
        return `${params.value} (${age}y)`;
      }
    },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'address', headerName: 'Address', width: 200 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'active' ? 'success' : 'default'} 
          size="small" 
          variant="outlined" 
        />
      )
    },
    { 
      field: 'last_visit', 
      headerName: 'Last Visit', 
      width: 150,
      valueGetter: (params) => params.value || 'Never'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button 
            size="small" 
            onClick={(e) => handleEditPatient(params.row.id, e)}
          >
            Edit
          </Button>
          <Button 
            size="small" 
            color="error" 
            onClick={(e) => handleDeleteClick(params.row, e)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  // Card view render function
  const renderPatientCards = () => {
    return (
      <Grid container spacing={2}>
        {patients.map((patient) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={patient.id}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                transition: 'transform 0.2s', 
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } 
              }}
              onClick={() => handlePatientClick(patient.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" noWrap>
                    {patient.full_name}
                  </Typography>
                  <Chip 
                    label={patient.status} 
                    color={patient.status === 'active' ? 'success' : 'default'} 
                    size="small" 
                    variant="outlined" 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Reg No:</strong> {patient.registration_number}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Gender:</strong> {patient.gender}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>DOB:</strong> {patient.date_of_birth}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Phone:</strong> {patient.phone}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  <strong>Address:</strong> {patient.address}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <MainLayout title="Patient Management">
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Patients
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleAddPatient}
          >
            Register New Patient
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <TextField
            placeholder="Search patients..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ flexGrow: 1, maxWidth: { xs: '100%', sm: 300 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleFilterClick}
            color={Object.values(filters).some(v => v !== '') ? "primary" : "inherit"}
          >
            Filter
          </Button>
          
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
            PaperProps={{
              style: {
                width: 300,
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Filter Patients
              </Typography>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={filters.gender}
                  onChange={handleFilterChange}
                  label="Gender"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Age Group</InputLabel>
                <Select
                  name="ageGroup"
                  value={filters.ageGroup}
                  onChange={handleFilterChange}
                  label="Age Group"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="0-5">0-5 years</MenuItem>
                  <MenuItem value="6-17">6-17 years</MenuItem>
                  <MenuItem value="18-40">18-40 years</MenuItem>
                  <MenuItem value="41-65">41-65 years</MenuItem>
                  <MenuItem value="65+">65+ years</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Location</InputLabel>
                <Select
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  label="Location"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Urban">Urban</MenuItem>
                  <MenuItem value="Rural">Rural</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleClearFilters} size="small">
                  Clear Filters
                </Button>
                <Button 
                  onClick={handleFilterClose} 
                  variant="contained" 
                  size="small" 
                  sx={{ ml: 1 }}
                >
                  Apply
                </Button>
              </Box>
            </Box>
          </Menu>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchPatients}
          >
            Refresh
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
          >
            Export
          </Button>
          
          <FormControl sx={{ width: 120, ml: { sm: 2 } }}>
            <InputLabel id="view-mode-label">View</InputLabel>
            <Select
              labelId="view-mode-label"
              id="view-mode"
              value={viewMode}
              label="View"
              size="small"
              onChange={(e) => setViewMode(e.target.value)}
            >
              <MenuItem value="table">Table</MenuItem>
              <MenuItem value="grid">Grid</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : viewMode === 'table' ? (
          <Box sx={{ width: '100%' }}>
            <DataGrid
              rows={patients}
              columns={columns}
              pageSize={pageSize}
              rowsPerPageOptions={[10, 20, 50]}
              pagination
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              onPageChange={(newPage) => setPage(newPage)}
              rowCount={totalPatients}
              paginationMode="client"
              page={page}
              autoHeight
              disableSelectionOnClick
              density="standard"
              components={{
                Toolbar: GridToolbar,
              }}
              onRowClick={(params) => handlePatientClick(params.id)}
              sx={{
                '& .MuiDataGrid-row:hover': {
                  cursor: 'pointer',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            />
          </Box>
        ) : (
          <>
            {renderPatientCards()}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(totalPatients / pageSize)}
                page={page + 1}
                onChange={(e, newPage) => setPage(newPage - 1)}
                color="primary"
              />
            </Box>
          </>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete patient: {selectedPatient?.full_name}? This action cannot be undone.
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

export default PatientsList;