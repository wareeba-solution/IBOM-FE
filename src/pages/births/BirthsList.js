// src/pages/births/BirthsList.js
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
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  Assessment as AssessmentIcon,
  ChildCare as ChildIcon,
  CheckCircle as RegisteredIcon,
  Schedule as PendingIcon,
  LocalHospital as HospitalIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import birthService, { getAllBirths } from '../../services/birthService';

const BirthsList = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [births, setBirths] = useState([]);
  const [allBirthsData, setAllBirthsData] = useState([]); // Store unfiltered data for counts
  const [birthCounts, setBirthCounts] = useState({
    total: 0,
    registered: 0,
    pending: 0,
    hospital: 0,
    home: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    facilityId: '',
    startDate: '',
    endDate: '',
    gender: '',
    deliveryMethod: '',
    birthType: '',
    lgaResidence: '',
    status: ''
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalBirths, setTotalBirths] = useState(0);
  const [selectedBirth, setSelectedBirth] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [tabValue, setTabValue] = useState(0);

  // Fetch birth records
  const fetchBirths = async () => {
    try {
      const queryParams = {
        page: page + 1,
        limit: pageSize,
        search: searchTerm,
        ...filters
      };

      // Remove empty parameters
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      console.log('🔍 Fetching births with params:', queryParams);
      
      const response = await getAllBirths(queryParams);
      console.log('🔍 API Response:', response);

      if (response && response.data) {
        const { births = [], total = 0, counts = {} } = response.data;
        
        setBirths(births);
        setTotalBirths(total);
        
        // Store all births data for count calculations (only on initial load or when no filters)
        if (!searchTerm && Object.values(filters).every(v => v === '')) {
          setAllBirthsData(births);
          setBirthCounts({
            total: counts.total || total,
            registered: counts.registered || births.filter(b => b.status === 'registered').length,
            pending: counts.pending || births.filter(b => b.status === 'pending').length,
            hospital: counts.hospital || births.filter(b => b.delivery_method === 'hospital').length,
            home: counts.home || births.filter(b => b.delivery_method === 'home').length
          });
        }
        
        console.log('🔍 Setting births:', births.length);
        console.log('🔍 Birth counts:', birthCounts);
        
      } else {
        console.warn('Unexpected response structure:', response);
        setBirths([]);
        setTotalBirths(0);
      }
      
    } catch (error) {
      console.error('Error fetching births:', error);
      setBirths([]);
      setTotalBirths(0);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchBirths();
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
      facilityId: '',
      startDate: '',
      endDate: '',
      gender: '',
      deliveryMethod: '',
      birthType: '',
      lgaResidence: '',
      status: ''
    });
    setPage(0);
    setFilterAnchorEl(null);
  };

  // Handle tab change with specific filtering logic
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
    
    // Clear existing filters and apply tab-specific filters
    let newFilters = {
      facilityId: '',
      startDate: '',
      endDate: '',
      gender: '',
      deliveryMethod: '',
      birthType: '',
      lgaResidence: '',
      status: ''
    };

    switch(newValue) {
      case 0: // All Records
        // No additional filters needed
        break;
      case 1: // Registered
        newFilters.status = 'registered';
        break;
      case 2: // Pending
        newFilters.status = 'pending';
        break;
      case 3: // Hospital Births
        newFilters.deliveryMethod = 'hospital';
   
      case 4: // Home Births
        newFilters.deliveryMethod = 'home';
        break;
      default:
        break;
    }
    
    setFilters(newFilters);
  };

  // Navigation actions
  const handleAddBirth = () => {
    navigate('/births/new');
  };

  const handleBirthClick = (id) => {
    navigate(`/births/${id}`);
  };

  const handleEditBirth = (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    navigate(`/births/${id}/edit`);
  };

  // Handle statistics view
  const handleViewStatistics = () => {
    navigate('/births/statistics');
  };

  // Handle delete
  const handleDeleteClick = (birth, event) => {
    if (event) {
      event.stopPropagation();
    }
    setSelectedBirth(birth);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedBirth(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedBirth) {
      await execute(
        birthService.deleteBirth,
        [selectedBirth.id],
        () => {
          fetchBirths();
          setDeleteDialogOpen(false);
          setSelectedBirth(null);
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

  // Table columns
  const columns = [
    { field: 'registration_number', headerName: 'Reg. No.', width: 120 },
    { 
      field: 'child_name', 
      headerName: 'Child Name', 
      width: 180,
      valueGetter: (params) => params.value || `Baby ${params.row.gender === 'male' ? 'Boy' : 'Girl'}`
    },
    { 
      field: 'gender', 
      headerName: 'Gender', 
      width: 110,
      valueFormatter: (params) => params.value ? params.value.charAt(0).toUpperCase() + params.value.slice(1) : '-'
    },
    { 
      field: 'date_of_birth', 
      headerName: 'Date of Birth', 
      width: 150,
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: 'birth_weight', 
      headerName: 'Weight (kg)', 
      width: 120,
      valueFormatter: (params) => params.value ? `${params.value} kg` : '-'
    },
    { 
      field: 'delivery_method', 
      headerName: 'Delivery Method', 
      width: 150,
      valueFormatter: (params) => params.value ? params.value.charAt(0).toUpperCase() + params.value.slice(1) : '-'
    },
    { 
      field: 'birth_type', 
      headerName: 'Birth Type', 
      width: 130,
      valueFormatter: (params) => params.value ? params.value.charAt(0).toUpperCase() + params.value.slice(1) : '-'
    },
    { field: 'mother_name', headerName: 'Mother', width: 180 },
    { field: 'father_name', headerName: 'Father', width: 180 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value ? params.value.charAt(0).toUpperCase() + params.value.slice(1) : 'Registered'} 
          color={params.value === 'registered' ? 'success' : 'warning'} 
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
            onClick={(e) => handleEditBirth(params.row.id, e)}
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
  const renderBirthCards = () => {
    return (
      <Grid container spacing={2}>
        {births.map((birth) => (
          <Grid item xs={12} sm={6} md={4} key={birth.id}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                transition: 'transform 0.2s', 
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } 
              }}
              onClick={() => handleBirthClick(birth.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" noWrap>
                    {birth.child_name || `Baby ${birth.gender === 'male' ? 'Boy' : 'Girl'}`}
                  </Typography>
                  <Chip 
                    label={birth.status ? birth.status.charAt(0).toUpperCase() + birth.status.slice(1) : 'Registered'} 
                    color={birth.status === 'registered' ? 'success' : 'warning'} 
                    size="small" 
                    variant="outlined" 
                  />
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Reg No:</strong> {birth.registration_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Gender:</strong> {birth.gender ? birth.gender.charAt(0).toUpperCase() + birth.gender.slice(1) : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>DOB:</strong> {formatDate(birth.date_of_birth)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Weight:</strong> {birth.birth_weight ? `${birth.birth_weight} kg` : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Mother:</strong> {birth.mother_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Father:</strong> {birth.father_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {birth.delivery_method === 'hospital' ? <HospitalIcon fontSize="small" /> : <HomeIcon fontSize="small" />}
                      <Typography variant="body2" color="text.secondary">
                        <strong>Delivery:</strong> {birth.delivery_method ? birth.delivery_method.charAt(0).toUpperCase() + birth.delivery_method.slice(1) : '-'}
                      </Typography>
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
    <MainLayout title="Birth Records">
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Birth Records
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
              onClick={handleAddBirth}
            >
              Register New Birth
            </Button>
          </Box>
        </Box>

        {/* Enhanced Tabs with Icons and Counts */}
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="birth records tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            icon={<ChildIcon />} 
            iconPosition="start"
            label={`All Records (${birthCounts.total})`}
          />
          <Tab 
            icon={<RegisteredIcon />} 
            iconPosition="start"
            label={`Registered (${birthCounts.registered})`}
          />
          <Tab 
            icon={<PendingIcon />} 
            iconPosition="start"
            label={`Pending (${birthCounts.pending})`}
          />
          <Tab 
            icon={<HospitalIcon />} 
            iconPosition="start"
            label={`Hospital Births (${birthCounts.hospital})`}
          />
          <Tab 
            icon={<HomeIcon />} 
            iconPosition="start"
            label={`Home Births (${birthCounts.home})`}
          />
        </Tabs>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <TextField
            placeholder="Search birth records..."
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
                width: 320,
                maxHeight: 500,
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Advanced Filters
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
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Birth Type</InputLabel>
                <Select
                  name="birthType"
                  value={filters.birthType}
                  onChange={handleFilterChange}
                  label="Birth Type"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="singleton">Singleton</MenuItem>
                  <MenuItem value="twin">Twin</MenuItem>
                  <MenuItem value="triplet">Triplet</MenuItem>
                  <MenuItem value="multiple">Multiple</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>LGA of Residence</InputLabel>
                <Select
                  name="lgaResidence"
                  value={filters.lgaResidence}
                  onChange={handleFilterChange}
                  label="LGA of Residence"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Uyo">Uyo</MenuItem>
                  <MenuItem value="Ikot Ekpene">Ikot Ekpene</MenuItem>
                  <MenuItem value="Eket">Eket</MenuItem>
                  <MenuItem value="Oron">Oron</MenuItem>
                  <MenuItem value="Abak">Abak</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                margin="dense"
                size="small"
                name="startDate"
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={handleFilterChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
              <TextField
                fullWidth
                margin="dense"
                size="small"
                name="endDate"
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={handleFilterChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Facility</InputLabel>
                <Select
                  name="facilityId"
                  value={filters.facilityId}
                  onChange={handleFilterChange}
                  label="Facility"
                >
                  <MenuItem value="">All Facilities</MenuItem>
                  <MenuItem value="facility-1">University of Uyo Teaching Hospital</MenuItem>
                  <MenuItem value="facility-2">Ibom Specialist Hospital</MenuItem>
                  <MenuItem value="facility-3">General Hospital Uyo</MenuItem>
                  <MenuItem value="facility-4">St. Luke's Hospital</MenuItem>
                  <MenuItem value="facility-5">Primary Health Center</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleClearFilters} size="small">
                  Clear All
                </Button>
                <Button 
                  onClick={handleFilterClose} 
                  variant="contained" 
                  size="small" 
                  sx={{ ml: 1 }}
                >
                  Apply Filters
                </Button>
              </Box>
            </Box>
          </Menu>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
                        onClick={fetchBirths}
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

        {/* Active Filters Display */}
        {Object.values(filters).some(v => v !== '') && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Active Filters:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(filters).map(([key, value]) => {
                if (value === '') return null;
                
                let displayValue = value;
                let displayKey = key;
                
                // Format display names
                switch(key) {
                  case 'deliveryMethod':
                    displayKey = 'Delivery';
                    displayValue = value.charAt(0).toUpperCase() + value.slice(1);
                    break;
                  case 'birthType':
                    displayKey = 'Birth Type';
                    displayValue = value.charAt(0).toUpperCase() + value.slice(1);
                    break;
                  case 'lgaResidence':
                    displayKey = 'LGA';
                    break;
                  case 'facilityId':
                    displayKey = 'Facility';
                    break;
                  case 'startDate':
                    displayKey = 'From';
                    break;
                  case 'endDate':
                    displayKey = 'To';
                    break;
                  case 'gender':
                    displayKey = 'Gender';
                    displayValue = value.charAt(0).toUpperCase() + value.slice(1);
                    break;
                  case 'status':
                    displayKey = 'Status';
                    displayValue = value.charAt(0).toUpperCase() + value.slice(1);
                    break;
                  default:
                    displayKey = key.charAt(0).toUpperCase() + key.slice(1);
                }
                
                return (
                  <Chip
                    key={key}
                    label={`${displayKey}: ${displayValue}`}
                    onDelete={() => {
                      setFilters({
                        ...filters,
                        [key]: ''
                      });
                    }}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                );
              })}
              <Button
                size="small"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
              >
                Clear All
              </Button>
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : births.length === 0 ? (
          <Alert severity="info" sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              No birth records found
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {searchTerm || Object.values(filters).some(v => v !== '') 
                ? 'Try adjusting your search criteria or filters'
                : 'Start by registering your first birth record'
              }
            </Typography>
            {!searchTerm && !Object.values(filters).some(v => v !== '') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddBirth}
                sx={{ mt: 2 }}
              >
                Register First Birth
              </Button>
            )}
          </Alert>
        ) : viewMode === 'table' ? (
          <Box sx={{ width: '100%' }}>
            <DataGrid
              rows={births}
              columns={columns}
              pageSize={pageSize}
              rowsPerPageOptions={[10, 25, 50]}
              pagination
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              onPageChange={(newPage) => setPage(newPage)}
              rowCount={totalBirths}
              paginationMode="client"
              page={page}
              autoHeight
              disableSelectionOnClick
              density="standard"
              onRowClick={(params) => handleBirthClick(params.id)}
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
            {renderBirthCards()}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(totalBirths / pageSize)}
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
            Are you sure you want to delete birth record for: {selectedBirth?.child_name || 'this baby'}? This action cannot be undone.
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

export default BirthsList;

