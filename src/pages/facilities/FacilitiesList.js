// src/pages/facilities/FacilitiesList.js
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
  CardMedia,
  CardActionArea,
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
  Print as PrintIcon,
  Assessment as AssessmentIcon,
  LocalHospital as HospitalIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';

// Mock facility service - replace with actual service when available
const facilityService = {
  getAllFacilities: async (params) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: mockFacilityData,
          meta: {
            total: mockFacilityData.length,
            page: params.page || 1,
            per_page: params.per_page || 10
          }
        });
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

// Mock facility data
const mockFacilityData = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  facility_code: `FAC${10000 + i}`,
  name: `${i % 3 === 0 ? 'General Hospital' : (i % 3 === 1 ? 'Primary Health Center' : 'Medical Clinic')} ${i + 1}`,
  type: i % 3 === 0 ? 'Hospital' : (i % 3 === 1 ? 'Primary Health Center' : 'Clinic'),
  level: i % 3 === 0 ? 'Secondary' : (i % 3 === 1 ? 'Primary' : 'Primary'),
  ownership: i % 4 === 0 ? 'Government' : (i % 4 === 1 ? 'Private' : (i % 4 === 2 ? 'Faith-based' : 'NGO')),
  address: `Address ${i + 1}, Akwa Ibom`,
  city: i % 5 === 0 ? 'Uyo' : (i % 5 === 1 ? 'Ikot Ekpene' : (i % 5 === 2 ? 'Eket' : (i % 5 === 3 ? 'Oron' : 'Abak'))),
  local_govt: i % 5 === 0 ? 'Uyo' : (i % 5 === 1 ? 'Ikot Ekpene' : (i % 5 === 2 ? 'Eket' : (i % 5 === 3 ? 'Oron' : 'Abak'))),
  state: 'Akwa Ibom',
  postal_code: `5${i}${i}${i}${i}`,
  phone: `080${i}${i}${i}${i}${i}${i}${i}${i}`,
  email: `facility${i}@example.com`,
  website: i % 3 === 0 ? `www.facility${i}.com` : '',
  gps_coordinates: `${4 + Math.random() * 2}, ${7 + Math.random() * 2}`,
  services: [
    'Outpatient Services',
    i % 2 === 0 ? 'Surgery' : 'Laboratory Services',
    i % 3 === 0 ? 'Emergency Services' : 'Pharmacy',
    i % 4 === 0 ? 'Maternity' : 'Pediatrics'
  ],
  beds: i % 3 === 0 ? 50 + i : (i % 3 === 1 ? 20 + i : 10 + i),
  staff_count: i % 3 === 0 ? 100 + i : (i % 3 === 1 ? 30 + i : 15 + i),
  head_name: `Dr. ${i % 2 === 0 ? 'John' : 'Jane'} Smith ${i}`,
  head_title: i % 3 === 0 ? 'Medical Director' : (i % 3 === 1 ? 'Chief Medical Officer' : 'Head Doctor'),
  registration_date: new Date(2010 + (i % 12), (i % 12), i % 28 + 1).toISOString().split('T')[0],
  status: i % 10 === 0 ? 'Inactive' : 'Active',
  last_updated: new Date(2023, (i % 12), i % 28 + 1).toISOString()
}));

// Facilities List Component
const FacilitiesList = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [facilities, setFacilities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    level: '',
    ownership: '',
    city: '',
    status: ''
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalFacilities, setTotalFacilities] = useState(0);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [tabValue, setTabValue] = useState(0);

  // Fetch facilities data
  const fetchFacilities = async () => {
    const queryParams = {
      page: page + 1,
      per_page: pageSize,
      search: searchTerm,
      ...filters
    };

    const result = await execute(
      facilityService.getAllFacilities,
      [queryParams],
      (response) => {
        setFacilities(response.data);
        setTotalFacilities(response.meta.total);
      }
    );
  };

  // Initial data loading
  useEffect(() => {
    fetchFacilities();
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
      type: '',
      level: '',
      ownership: '',
      city: '',
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
  const handleAddFacility = () => {
    navigate('/facilities/new');
  };

  const handleFacilityClick = (id) => {
    navigate(`/facilities/${id}`);
  };

  const handleEditFacility = (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    navigate(`/facilities/${id}/edit`);
  };

  // Handle statistics view
  const handleViewStatistics = () => {
    navigate('/facilities/statistics');
  };

  // Handle delete
  const handleDeleteClick = (facility, event) => {
    if (event) {
      event.stopPropagation();
    }
    setSelectedFacility(facility);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedFacility(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedFacility) {
      await execute(
        facilityService.deleteFacility,
        [selectedFacility.id],
        () => {
          fetchFacilities();
          setDeleteDialogOpen(false);
          setSelectedFacility(null);
        }
      );
    }
  };

  // Table columns
  const columns = [
    { field: 'facility_code', headerName: 'Facility Code', width: 120 },
    { field: 'name', headerName: 'Facility Name', width: 220 },
    { field: 'type', headerName: 'Type', width: 150 },
    { field: 'level', headerName: 'Level', width: 120 },
    { field: 'city', headerName: 'City', width: 120 },
    { field: 'ownership', headerName: 'Ownership', width: 150 },
    { field: 'beds', headerName: 'Beds', width: 100, type: 'number' },
    { field: 'staff_count', headerName: 'Staff', width: 100, type: 'number' },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'Active' ? 'success' : 'default'} 
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
            onClick={(e) => handleEditFacility(params.row.id, e)}
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
  const renderFacilityCards = () => {
    return (
      <Grid container spacing={2}>
        {facilities.map((facility) => (
          <Grid item xs={12} sm={6} md={4} key={facility.id}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                transition: 'transform 0.2s', 
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } 
              }}
            >
              <CardActionArea onClick={() => handleFacilityClick(facility.id)}>
                <CardMedia
                  component="div"
                  sx={{ 
                    height: 140, 
                    bgcolor: facility.type === 'Hospital' ? 'primary.main' : 
                              (facility.type === 'Primary Health Center' ? 'secondary.main' : 'info.main'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <HospitalIcon sx={{ fontSize: 60, color: 'white' }} />
                </CardMedia>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" noWrap>
                      {facility.name}
                    </Typography>
                    <Chip 
                      label={facility.status} 
                      color={facility.status === 'Active' ? 'success' : 'default'} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <HospitalIcon fontSize="small" sx={{ mr: 1 }} />
                      {facility.type} ({facility.level})
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                      {facility.city}, {facility.state}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                      {facility.phone}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                      {facility.head_name} ({facility.head_title})
                    </Box>
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Beds:</strong> {facility.beds}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Staff:</strong> {facility.staff_count}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <MainLayout title="Facility Management">
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Healthcare Facilities
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
              onClick={handleAddFacility}
            >
              Add New Facility
            </Button>
          </Box>
        </Box>

        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="facility types tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab icon={<HospitalIcon />} label="All Facilities" />
          <Tab label="Hospitals" />
          <Tab label="Health Centers" />
          <Tab label="Clinics" />
          <Tab label="Government Owned" />
          <Tab label="Private Owned" />
        </Tabs>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <TextField
            placeholder="Search facilities..."
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
                Filter Facilities
              </Typography>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Facility Type</InputLabel>
                <Select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  label="Facility Type"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Hospital">Hospital</MenuItem>
                  <MenuItem value="Primary Health Center">Primary Health Center</MenuItem>
                  <MenuItem value="Clinic">Clinic</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Facility Level</InputLabel>
                <Select
                  name="level"
                  value={filters.level}
                  onChange={handleFilterChange}
                  label="Facility Level"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Primary">Primary</MenuItem>
                  <MenuItem value="Secondary">Secondary</MenuItem>
                  <MenuItem value="Tertiary">Tertiary</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Ownership</InputLabel>
                <Select
                  name="ownership"
                  value={filters.ownership}
                  onChange={handleFilterChange}
                  label="Ownership"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Government">Government</MenuItem>
                  <MenuItem value="Private">Private</MenuItem>
                  <MenuItem value="Faith-based">Faith-based</MenuItem>
                  <MenuItem value="NGO">NGO</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>City</InputLabel>
                <Select
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  label="City"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Uyo">Uyo</MenuItem>
                  <MenuItem value="Ikot Ekpene">Ikot Ekpene</MenuItem>
                  <MenuItem value="Eket">Eket</MenuItem>
                  <MenuItem value="Oron">Oron</MenuItem>
                  <MenuItem value="Abak">Abak</MenuItem>
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
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
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
            onClick={fetchFacilities}
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
              rows={facilities}
              columns={columns}
              pageSize={pageSize}
              rowsPerPageOptions={[10, 25, 50]}
              pagination
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              onPageChange={(newPage) => setPage(newPage)}
              rowCount={totalFacilities}
              paginationMode="client"
              page={page}
              autoHeight
              disableSelectionOnClick
              density="standard"
              onRowClick={(params) => handleFacilityClick(params.id)}
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
            {renderFacilityCards()}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(totalFacilities / pageSize)}
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
            Are you sure you want to delete facility: {selectedFacility?.name}? This action cannot be undone.
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

export default FacilitiesList;