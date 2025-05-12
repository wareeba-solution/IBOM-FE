// src/pages/immunization/ImmunizationList.js
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
  Select,
  Tabs,
  Tab
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  Print as PrintIcon,
  MedicalServices as MedicalIcon,
  Assessment as AssessmentIcon,
  PersonAdd as PersonAddIcon,
  Vaccines as VaccinesIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';

// Mock immunization service - replace with actual service when available
const immunizationService = {
  getAllImmunizations: async (params) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: mockImmunizationData,
          meta: {
            total: mockImmunizationData.length,
            page: params.page || 1,
            per_page: params.per_page || 10
          }
        });
      }, 500);
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

// Vaccine types
const vaccineTypes = [
  'BCG',
  'Hepatitis B',
  'OPV',
  'Pentavalent',
  'Pneumococcal',
  'Rotavirus',
  'Measles',
  'Yellow Fever',
  'Meningitis',
  'Tetanus Toxoid',
  'HPV',
  'COVID-19',
  'Other'
];

// Mock immunization data
const mockImmunizationData = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  registration_number: `IM${10000 + i}`,
  patient_name: `${i % 2 === 0 ? 'John' : 'Jane'} Doe ${i + 1}`,
  patient_id: `PT${5000 + i}`,
  gender: i % 2 === 0 ? 'Male' : 'Female',
  date_of_birth: new Date(2020 - (i % 5), (i % 12), i % 28 + 1).toISOString().split('T')[0],
  age_months: 12 + (i % 48),
  vaccine_type: vaccineTypes[i % vaccineTypes.length],
  dose_number: (i % 3) + 1,
  vaccination_date: new Date(2023, (i % 12), i % 28 + 1).toISOString().split('T')[0],
  next_due_date: i % 3 === 2 ? null : new Date(2023, (i % 12) + 2, i % 28 + 1).toISOString().split('T')[0],
  healthcare_provider: `Nurse ${i % 10 + 1}`,
  facility: `Health Center ${i % 5 + 1}`,
  status: i % 10 === 0 ? 'pending' : (i % 10 === 1 ? 'missed' : 'completed'),
  side_effects: i % 15 === 0 ? 'Mild fever' : (i % 20 === 0 ? 'Swelling at injection site' : null),
  notes: i % 8 === 0 ? 'Follow up required' : null,
  created_at: new Date(2023, (i % 12), i % 28 + 1).toISOString()
}));

// Immunization Records List Component
const ImmunizationList = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [immunizations, setImmunizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    vaccine_type: '',
    status: '',
    age_group: '',
    gender: '',
    date_range: ''
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalImmunizations, setTotalImmunizations] = useState(0);
  const [selectedImmunization, setSelectedImmunization] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [tabValue, setTabValue] = useState(0);

  // Fetch immunization records
  const fetchImmunizations = async () => {
    const queryParams = {
      page: page + 1,
      per_page: pageSize,
      search: searchTerm,
      ...filters
    };

    const result = await execute(
      immunizationService.getAllImmunizations,
      [queryParams],
      (response) => {
        setImmunizations(response.data);
        setTotalImmunizations(response.meta.total);
      }
    );
  };

  // Initial data loading
  useEffect(() => {
    fetchImmunizations();
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
      vaccine_type: '',
      status: '',
      age_group: '',
      gender: '',
      date_range: ''
    });
    setPage(0);
    setFilterAnchorEl(null);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Navigation actions
  const handleAddImmunization = () => {
    navigate('/immunizations/new');  // Changed from '/immunization/new' to '/immunizations/new'
  };

  const handleImmunizationClick = (id) => {
    navigate(`/immunization/${id}`);
  };

  const handleEditImmunization = (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    navigate(`/immunization/${id}/edit`);
  };

  // Handle statistics view
  const handleViewStatistics = () => {
    navigate('/immunizations/statistics');
  };

  // Handle delete
  const handleDeleteClick = (immunization, event) => {
    if (event) {
      event.stopPropagation();
    }
    setSelectedImmunization(immunization);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedImmunization(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedImmunization) {
      await execute(
        immunizationService.deleteImmunization,
        [selectedImmunization.id],
        () => {
          fetchImmunizations();
          setDeleteDialogOpen(false);
          setSelectedImmunization(null);
        }
      );
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Calculate age in months from date of birth
  const calculateAgeMonths = (dateOfBirth) => {
    if (!dateOfBirth) return '-';
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
      months -= birthDate.getMonth();
      months += today.getMonth();
      
      return months <= 0 ? 0 : months;
    } catch (error) {
      return '-';
    }
  };

  // Table columns
  const columns = [
    { field: 'registration_number', headerName: 'Reg. No.', width: 120 },
    { field: 'patient_name', headerName: 'Patient Name', width: 180 },
    { field: 'vaccine_type', headerName: 'Vaccine', width: 150 },
    { field: 'dose_number', headerName: 'Dose', width: 80 },
    { 
      field: 'vaccination_date', 
      headerName: 'Vaccination Date', 
      width: 150,
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: 'next_due_date', 
      headerName: 'Next Due Date', 
      width: 150,
      valueFormatter: (params) => params.value ? formatDate(params.value) : 'N/A'
    },
    { 
      field: 'age_months', 
      headerName: 'Age (Months)', 
      width: 120,
      valueGetter: (params) => params.row.age_months || calculateAgeMonths(params.row.date_of_birth)
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={
            params.value === 'completed' 
              ? 'success' 
              : params.value === 'pending' 
                ? 'warning' 
                : 'error'
          } 
          size="small" 
          variant="outlined" 
        />
      )
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
            onClick={(e) => handleEditImmunization(params.row.id, e)}
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
  const renderImmunizationCards = () => {
    return (
      <Grid container spacing={2}>
        {immunizations.map((immunization) => (
          <Grid item xs={12} sm={6} md={4} key={immunization.id}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                transition: 'transform 0.2s', 
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } 
              }}
              onClick={() => handleImmunizationClick(immunization.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" noWrap>
                    {immunization.patient_name}
                  </Typography>
                  <Chip 
                    label={immunization.status} 
                    color={
                      immunization.status === 'completed' 
                        ? 'success' 
                        : immunization.status === 'pending' 
                          ? 'warning' 
                          : 'error'
                    } 
                    size="small" 
                    variant="outlined" 
                  />
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Reg No:</strong> {immunization.registration_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Patient ID:</strong> {immunization.patient_id}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Vaccine:</strong> {immunization.vaccine_type}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Dose:</strong> {immunization.dose_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Date:</strong> {formatDate(immunization.vaccination_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Next Due:</strong> {immunization.next_due_date ? formatDate(immunization.next_due_date) : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Provider:</strong> {immunization.healthcare_provider}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <MainLayout title="Immunization Records">
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Immunization Records
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<AssessmentIcon />}
              onClick={handleViewStatistics}
              sx={{ mr: 1 }}
            >
              Statistics
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddImmunization}
            >
              New Immunization
            </Button>
          </Box>
        </Box>

        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="immunization records tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab icon={<VaccinesIcon />} label="All Records" />
          <Tab label="Completed" />
          <Tab label="Pending" />
          <Tab label="Missed" />
          <Tab label="Due This Month" />
        </Tabs>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <TextField
            placeholder="Search immunization records..."
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
                width: 280,
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Filter Records
              </Typography>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Vaccine Type</InputLabel>
                <Select
                  name="vaccine_type"
                  value={filters.vaccine_type}
                  onChange={handleFilterChange}
                  label="Vaccine Type"
                >
                  <MenuItem value="">All</MenuItem>
                  {vaccineTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
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
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="missed">Missed</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Age Group</InputLabel>
                <Select
                  name="age_group"
                  value={filters.age_group}
                  onChange={handleFilterChange}
                  label="Age Group"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="0-6">0-6 months</MenuItem>
                  <MenuItem value="7-12">7-12 months</MenuItem>
                  <MenuItem value="13-24">13-24 months</MenuItem>
                  <MenuItem value="25-60">25-60 months</MenuItem>
                  <MenuItem value="60+">Above 60 months</MenuItem>
                </Select>
              </FormControl>
              
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
                <InputLabel>Date Range</InputLabel>
                <Select
                  name="date_range"
                  value={filters.date_range}
                  onChange={handleFilterChange}
                  label="Date Range"
                >
                  <MenuItem value="">All Time</MenuItem>
                  <MenuItem value="last_week">Last Week</MenuItem>
                  <MenuItem value="last_month">Last Month</MenuItem>
                  <MenuItem value="last_3_months">Last 3 Months</MenuItem>
                  <MenuItem value="last_year">Last Year</MenuItem>
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
            onClick={fetchImmunizations}
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
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={immunizations}
              columns={columns}
              pageSize={pageSize}
              rowsPerPageOptions={[10, 25, 50]}
              pagination
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              onPageChange={(newPage) => setPage(newPage)}
              rowCount={totalImmunizations}
              paginationMode="client"
              page={page}
              autoHeight
              disableSelectionOnClick
              density="standard"
              onRowClick={(params) => handleImmunizationClick(params.id)}
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
            {renderImmunizationCards()}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(totalImmunizations / pageSize)}
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
            Are you sure you want to delete immunization record for: {selectedImmunization?.patient_name}? This action cannot be undone.
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

export default ImmunizationList;