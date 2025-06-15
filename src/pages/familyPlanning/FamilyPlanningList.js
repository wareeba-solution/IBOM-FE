// src/pages/familyPlanning/FamilyPlanningList.js
import React, { useState, useEffect, useCallback } from 'react';
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
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);  const [filters, setFilters] = useState({
    clientType: '',
    maritalStatus: '',
    registrationDateFrom: '',
    registrationDateTo: '',
    status: ''
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState(null);  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [tabValue, setTabValue] = useState(0);
  // Client types from API
  const clientTypes = [
    'New Acceptor',
    'Continuing User',
    'Returner',
    'Other'
  ];

  // Marital status options from API
  const maritalStatuses = [
    'Single',
    'Married',
    'Divorced',
    'Widowed',
    'Separated',
    'Cohabiting'
  ];

  // Status options from API
  const statusOptions = [
    'Active',
    'Inactive',
    'Discontinued',
    'Transferred',
    'Other'
  ];
  // Family planning methods are not needed for client listing
  // useEffect(() => {
  //   const loadMethods = async () => {
  //     try {
  //       const response = await familyPlanningService.getFamilyPlanningMethods();
  //       setMethods(response.data || []);
  //     } catch (error) {
  //       console.error('Failed to load family planning methods:', error);
  //     }
  //   };
  //   
  //   loadMethods();
  // }, []);
  // Fetch family planning records
  const fetchRecords = useCallback(async () => {
    try {      // Map frontend filters to API query params
      const queryParams = {
        page: page + 1,
        limit: pageSize,
        sortBy: 'registrationDate',
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
          queryParams.clientType = 'New Acceptor';
          break;
        case 2: // Active Clients
          queryParams.status = 'Active';
          break;
        case 3: // This Month
          const now = new Date();
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
          queryParams.registrationDateFrom = firstDay.toISOString().split('T')[0];
          break;
        case 4: // Continuing Users
          queryParams.clientType = 'Continuing User';
          break;
        default:
          // All Records - no additional filters
          break;
      }console.log('Fetching family planning clients with params:', queryParams);

      await execute(
        familyPlanningService.getAllFamilyPlanningClients,
        [queryParams],
        async (response) => {
          console.log('API response:', response);
          
          // Handle the response structure
          const clients = response.data || [];
          const pagination = response.pagination || { total: clients.length };

          // Map the clients and enhance with patient data
          const mappedClients = await Promise.all(
            clients.map(async (clientItem) => {
              const mappedClient = familyPlanningService.mapFamilyPlanningClient(clientItem);
                // Try to get client information
              try {
                if (mappedClient.client_id && patientService) {
                  const clientData = await patientService.getPatientById(mappedClient.client_id);
                  if (clientData) {
                    mappedClient.patient_name = clientData.firstName && clientData.lastName ? 
                      `${clientData.firstName} ${clientData.lastName}${clientData.otherNames ? ' ' + clientData.otherNames : ''}` :
                      clientData.name || mappedClient.patient_name || 'Unknown Client';
                    mappedClient.age = clientData.age || calculateAge(clientData.dateOfBirth);
                    mappedClient.gender = clientData.gender;
                    mappedClient.marital_status = clientData.maritalStatus;
                    mappedClient.education_level = clientData.educationLevel;
                  }
                }
              } catch (clientError) {
                console.warn('Could not fetch client data for:', mappedClient.client_id, clientError);
                // Use a fallback name
                if (!mappedClient.patient_name || mappedClient.patient_name === 'Loading...') {
                  mappedClient.patient_name = `Client ${mappedClient.client_id ? mappedClient.client_id.substring(0, 8) : 'Unknown'}`;
                }
              }              // Client data is now complete
              return mappedClient;
            })
          );          // Apply client-side filtering if needed
          let finalClients = mappedClients;
          if (tabValue === 4) { // Continuing Users tab
            finalClients = mappedClients.filter(client => client.client_type === 'Continuing User');
          }

          setRecords(finalClients);
          setTotalRecords(pagination.total || finalClients.length);
        }
      );
    } catch (error) {
      console.error('Error fetching family planning clients:', error);      setRecords([]);
      setTotalRecords(0);
    }
  }, [page, pageSize, searchTerm, filters, tabValue, execute]);

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
  }, [page, pageSize, searchTerm, filters, tabValue, fetchRecords]);

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
      clientType: '',
      maritalStatus: '',
      registrationDateFrom: '',
      registrationDateTo: '',
      status: ''
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
      <Box sx={{ p: 2 }}>        <Typography variant="subtitle1" gutterBottom>
          Filter Clients
        </Typography>
        
        <FormControl fullWidth margin="dense" size="small">
          <InputLabel>Client Type</InputLabel>
          <Select
            name="clientType"
            value={filters.clientType}
            onChange={handleFilterChange}
            label="Client Type"
          >
            <MenuItem value="">All Client Types</MenuItem>
            {clientTypes.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl fullWidth margin="dense" size="small">
          <InputLabel>Marital Status</InputLabel>
          <Select
            name="maritalStatus"
            value={filters.maritalStatus}
            onChange={handleFilterChange}
            label="Marital Status"
          >
            <MenuItem value="">All Marital Statuses</MenuItem>
            {maritalStatuses.map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
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
            <MenuItem value="">All Statuses</MenuItem>
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          margin="dense"
          size="small"
          label="Registration Date From"
          name="registrationDateFrom"
          type="date"
          value={filters.registrationDateFrom}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
        />
        
        <TextField
          fullWidth
          margin="dense"
          size="small"
          label="Registration Date To"
          name="registrationDateTo"
          type="date"
          value={filters.registrationDateTo}
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
      field: 'registration_date', 
      headerName: 'Registration Date', 
      width: 140,
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: 'client_type', 
      headerName: 'Client Type', 
      width: 140,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'Unknown'} 
          color={params.value === 'New Acceptor' ? 'primary' : 'default'} 
          size="small" 
          variant="outlined" 
        />
      )
    },
    { field: 'marital_status', headerName: 'Marital Status', width: 130 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'Unknown'} 
          color={params.value === 'Active' ? 'success' : 'default'} 
          size="small" 
          variant="outlined" 
        />
      )
    },
    { field: 'contact_phone', headerName: 'Contact', width: 130 },
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
                </Box>                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Record ID:</strong> {record.record_id}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Registered:</strong> {formatDate(record.registration_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Client Type:</strong> {record.client_type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Marital Status:</strong> {record.marital_status}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Contact:</strong> {record.contact_phone}
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
                      {record.status === 'Active' && (
                        <Chip 
                          label="Active" 
                          color="success" 
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
        >          <Tab icon={<PersonIcon />} label="All Clients" />
          <Tab label="New Acceptors" />
          <Tab label="Active Clients" />
          <Tab label="This Month" />
          <Tab label="Continuing Users" />
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