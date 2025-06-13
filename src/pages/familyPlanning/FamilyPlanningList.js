// src/pages/familyPlanning/FamilyPlanningList.js
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
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Female as FemaleIcon,
  Male as MaleIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { format, parseISO, subMonths } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import familyPlanningService from '../../services/familyPlanningService';
import patientService from '../../services/patientService'; // If available

// Family Planning List Component
const FamilyPlanningList = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    methodId: '',
    serviceType: '',
    serviceDateFrom: '',
    serviceDateTo: '',
    patientSatisfaction: ''
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [tabValue, setTabValue] = useState(0);
  const [methods, setMethods] = useState([]);

  // Service types from API
  const serviceTypes = [
    'Initial Adoption',
    'Method Switch',
    'Resupply',
    'Follow-up',
    'Counseling',
    'Removal',
    'Other'
  ];

  // Patient satisfaction levels from API
  const satisfactionLevels = [
    'Very Satisfied',
    'Satisfied',
    'Neutral',
    'Dissatisfied',
    'Very Dissatisfied',
    'Not Recorded'
  ];

  // Fetch family planning methods for filter dropdown
  useEffect(() => {
    const loadMethods = async () => {
      try {
        const response = await familyPlanningService.getFamilyPlanningMethods();
        setMethods(response.data || []);
      } catch (error) {
        console.error('Failed to load family planning methods:', error);
      }
    };
    
    loadMethods();
  }, []);

  // Fetch family planning records
  const fetchRecords = async () => {
    try {
      // Map frontend filters to API query params
      const queryParams = {
        page: page + 1,
        limit: pageSize,
        sortBy: 'serviceDate',
        sortOrder: 'desc'
      };

      // Add search term if provided
      if (searchTerm) {
        queryParams.search = searchTerm;
      }

      // Add filters
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== '') {
          queryParams[key] = filters[key];
        }
      });

      // Add tab-specific filters
      switch (tabValue) {
        case 1: // New Acceptors
          queryParams.serviceType = 'Initial Adoption';
          break;
        case 2: // Follow-ups
          queryParams.serviceType = 'Follow-up';
          break;
        case 3: // This Month
          const now = new Date();
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
          queryParams.serviceDateFrom = firstDay.toISOString().split('T')[0];
          break;
        case 4: // Side Effects
          // This would need a specific API parameter or we filter client-side
          break;
        default:
          // All Records - no additional filters
          break;
      }

      console.log('Fetching family planning services with params:', queryParams);

      await execute(
        familyPlanningService.getAllFamilyPlanningServices,
        [queryParams],
        async (response) => {
          console.log('API response:', response);
          
          // Handle the response structure
          const services = response.data || [];
          const pagination = response.pagination || { total: services.length };

          // Map the services and enhance with client/method data
          const mappedServices = await Promise.all(
            services.map(async (serviceItem) => {
              const mappedService = familyPlanningService.mapFamilyPlanningService(serviceItem);
              
              // Try to get client information
              try {
                if (mappedService.client_id && patientService) {
                  const clientData = await patientService.getPatientById(mappedService.client_id);
                  if (clientData) {
                    mappedService.patient_name = clientData.firstName && clientData.lastName ? 
                      `${clientData.firstName} ${clientData.lastName}${clientData.otherNames ? ' ' + clientData.otherNames : ''}` :
                      clientData.name || mappedService.patient_name || 'Unknown Client';
                    mappedService.age = clientData.age || calculateAge(clientData.dateOfBirth);
                    mappedService.gender = clientData.gender;
                    mappedService.marital_status = clientData.maritalStatus;
                    mappedService.education_level = clientData.educationLevel;
                  }
                }
              } catch (clientError) {
                console.warn('Could not fetch client data for:', mappedService.client_id, clientError);
                // Use a fallback name
                if (!mappedService.patient_name || mappedService.patient_name === 'Loading...') {
                  mappedService.patient_name = `Client ${mappedService.client_id ? mappedService.client_id.substring(0, 8) : 'Unknown'}`;
                }
              }

              // Try to get method information
              try {
                if (mappedService.method_id && methods.length > 0) {
                  const method = methods.find(m => m.id === mappedService.method_id);
                  if (method) {
                    mappedService.method = method.name;
                  }
                }
              } catch (methodError) {
                console.warn('Could not map method for:', mappedService.method_id);
              }

              return mappedService;
            })
          );

          // Filter for side effects tab if needed (client-side filtering)
          let finalServices = mappedServices;
          if (tabValue === 4) { // Side Effects tab
            finalServices = mappedServices.filter(service => service.has_side_effects);
          }

          setRecords(finalServices);
          setTotalRecords(pagination.total || finalServices.length);
        }
      );
    } catch (error) {
      console.error('Error fetching family planning services:', error);
      setRecords([]);
      setTotalRecords(0);
    }
  };

  // Helper function to calculate age from date of birth
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

  // Initial data loading
  useEffect(() => {
    fetchRecords();
  }, [page, pageSize, searchTerm, filters, tabValue, methods]);

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
      methodId: '',
      serviceType: '',
      serviceDateFrom: '',
      serviceDateTo: '',
      patientSatisfaction: ''
    });
    setPage(0);
    setFilterAnchorEl(null);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Navigation actions
  const handleAddRecord = () => {
    navigate('/family-planning/new');
  };

  const handleRecordClick = (id) => {
    navigate(`/family-planning/${id}`);
  };

  const handleEditRecord = (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    navigate(`/family-planning/${id}/edit`);
  };

  // Handle statistics view
  const handleViewStatistics = () => {
    navigate('/family-planning/statistics');
  };

  // Handle delete
  const handleDeleteClick = (record, event) => {
    if (event) {
      event.stopPropagation();
    }
    setSelectedRecord(record);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedRecord(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRecord) {
      await execute(
        familyPlanningService.deleteRecord,
        [selectedRecord.id],
        () => {
          fetchRecords();
          setDeleteDialogOpen(false);
          setSelectedRecord(null);
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

  // Updated filter menu with API-compatible options
  const renderFilterMenu = () => (
    <Menu
      anchorEl={filterAnchorEl}
      open={Boolean(filterAnchorEl)}
      onClose={handleFilterClose}
      PaperProps={{
        style: {
          width: 320,
          maxHeight: 400
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Filter Services
        </Typography>
        
        <FormControl fullWidth margin="dense" size="small">
          <InputLabel>Method</InputLabel>
          <Select
            name="methodId"
            value={filters.methodId}
            onChange={handleFilterChange}
            label="Method"
          >
            <MenuItem value="">All Methods</MenuItem>
            {methods.map((method) => (
              <MenuItem key={method.id} value={method.id}>
                {method.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl fullWidth margin="dense" size="small">
          <InputLabel>Service Type</InputLabel>
          <Select
            name="serviceType"
            value={filters.serviceType}
            onChange={handleFilterChange}
            label="Service Type"
          >
            <MenuItem value="">All Service Types</MenuItem>
            {serviceTypes.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl fullWidth margin="dense" size="small">
          <InputLabel>Patient Satisfaction</InputLabel>
          <Select
            name="patientSatisfaction"
            value={filters.patientSatisfaction}
            onChange={handleFilterChange}
            label="Patient Satisfaction"
          >
            <MenuItem value="">All</MenuItem>
            {satisfactionLevels.map((level) => (
              <MenuItem key={level} value={level}>{level}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          margin="dense"
          size="small"
          label="Service Date From"
          name="serviceDateFrom"
          type="date"
          value={filters.serviceDateFrom}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
        />
        
        <TextField
          fullWidth
          margin="dense"
          size="small"
          label="Service Date To"
          name="serviceDateTo"
          type="date"
          value={filters.serviceDateTo}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
        />
        
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
  );

  // Updated table columns for API data structure
  const columns = [
    { field: 'record_id', headerName: 'Record ID', width: 120 },
    { field: 'patient_name', headerName: 'Client Name', width: 180 },
    { 
      field: 'gender', 
      headerName: 'Gender', 
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {params.value === 'female' ? 
            <FemaleIcon color="secondary" fontSize="small" sx={{ mr: 1 }} /> : 
            <MaleIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
          }
          {params.value ? params.value.charAt(0).toUpperCase() + params.value.slice(1) : 'N/A'}
        </Box>
      )
    },
    { field: 'age', headerName: 'Age', width: 80, type: 'number' },
    { 
      field: 'service_date', 
      headerName: 'Service Date', 
      width: 120,
      valueFormatter: (params) => formatDate(params.value)
    },
    { field: 'method', headerName: 'Method', width: 180 },
    { field: 'service_type', headerName: 'Service Type', width: 180 },
    { 
      field: 'is_new_acceptor', 
      headerName: 'New Acceptor', 
      width: 130,
      renderCell: (params) => (
        params.value ? 
          <Chip label="Yes" color="primary" size="small" variant="outlined" /> : 
          <Chip label="No" size="small" variant="outlined" />
      )
    },
    { 
      field: 'next_appointment', 
      headerName: 'Next Visit', 
      width: 120,
      valueFormatter: (params) => formatDate(params.value)
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
            onClick={(e) => handleEditRecord(params.row.id, e)}
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
  const renderRecordCards = () => {
    return (
      <Grid container spacing={2}>
        {records.map((record) => (
          <Grid item xs={12} sm={6} md={4} key={record.id}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                transition: 'transform 0.2s', 
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } 
              }}
              onClick={() => handleRecordClick(record.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" noWrap>
                    {record.patient_name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {record.gender === 'Female' ? 
                      <FemaleIcon color="secondary" fontSize="small" /> : 
                      <MaleIcon color="primary" fontSize="small" />
                    }
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                      {record.age}
                    </Typography>
                  </Box>
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Record ID:</strong> {record.record_id}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Visit:</strong> {formatDate(record.visit_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Method:</strong> {record.method}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Visit Type:</strong> {record.visit_type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Next Visit:</strong> {formatDate(record.next_visit_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      {record.is_new_acceptor && (
                        <Chip 
                          label="New Acceptor" 
                          color="primary" 
                          size="small" 
                          variant="outlined" 
                        />
                      )}
                      {record.has_side_effects && (
                        <Chip 
                          label="Side Effects" 
                          color="warning" 
                          size="small" 
                          variant="outlined" 
                        />
                      )}
                    </Box>
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
    <MainLayout title="Family Planning Records">
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Family Planning Records
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
              onClick={handleAddRecord}
            >
              New Record
            </Button>
          </Box>
        </Box>

        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="family planning tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab icon={<PersonIcon />} label="All Records" />
          <Tab label="New Acceptors" />
          <Tab label="Follow-ups" />
          <Tab label="This Month" />
          <Tab label="Side Effects" />
        </Tabs>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <TextField
            placeholder="Search records..."
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
          
          {renderFilterMenu()}
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchRecords}
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
              rows={records}
              columns={columns}
              pageSize={pageSize}
              rowsPerPageOptions={[10, 25, 50]}
              pagination
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              onPageChange={(newPage) => setPage(newPage)}
              rowCount={totalRecords}
              paginationMode="client"
              page={page}
              autoHeight
              disableSelectionOnClick
              density="standard"
              onRowClick={(params) => handleRecordClick(params.id)}
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
            {renderRecordCards()}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(totalRecords / pageSize)}
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
            Are you sure you want to delete record {selectedRecord?.record_id} for {selectedRecord?.patient_name}? This action cannot be undone.
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

export default FamilyPlanningList;