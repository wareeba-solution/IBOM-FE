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
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import facilityService from '../../services/facilityService';

// Facilities List Component
const FacilitiesList = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [facilities, setFacilities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    facilityType: '',
    status: '',
    lga: ''
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalFacilities, setTotalFacilities] = useState(0);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [tabValue, setTabValue] = useState(0);

  // Add state for tab loading
  const [tabLoading, setTabLoading] = useState(false);

  // Facility types from API
  const facilityTypes = [
    { value: 'hospital', label: 'Hospital' },
    { value: 'clinic', label: 'Clinic' },
    { value: 'health_center', label: 'Health Center' },
    { value: 'maternity', label: 'Maternity' }
  ];

  // LGAs in Akwa Ibom State
  const lgas = [
    'Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo',
    'Etinan', 'Ibeno', 'Ibesikpo Asutan', 'Ibiono-Ibom', 'Ika', 'Ikono',
    'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu', 'Mbo', 'Mkpat-Enin',
    'Nsit-Atai', 'Nsit-Ibom', 'Nsit-Ubium', 'Obot Akara', 'Okobo',
    'Onna', 'Oron', 'Oruk Anam', 'Udung-Uko', 'Ukanafun', 'Uruan',
    'Urue-Offong/Oruko', 'Uyo'
  ];

  // Fetch facilities data - Updated for real API
  const fetchFacilities = async () => {
    try {
      // Map frontend filters to API query params
      const queryParams = {
        page: page + 1,
        limit: pageSize
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

      // Add tab-specific filters - FIXED VERSION
      switch (tabValue) {
        case 1: // Hospitals
          queryParams.facilityType = 'hospital';
          break;
        case 2: // Health Centers  
          queryParams.facilityType = 'health_center';
          break;
        case 3: // Clinics
          queryParams.facilityType = 'clinic';
          break;
        case 4: // Maternity Centers
          queryParams.facilityType = 'maternity';
          break;
        default:
          // All Facilities (tab 0) - no additional filters
          break;
      }

      console.log('Tab value:', tabValue, 'Applied filter:', queryParams.facilityType);
      console.log('Fetching facilities with params:', queryParams);

      await execute(
        facilityService.getAllFacilities,
        [queryParams],
        (response) => {
          console.log('Full API response in component:', response);
          
          const facilitiesData = response.data || [];
          const metaData = response.meta || { totalItems: facilitiesData.length };

          console.log('Facilities data to set:', facilitiesData);
          console.log('Meta data:', metaData);

          // Ensure we have valid facility data
          if (Array.isArray(facilitiesData)) {
            setFacilities(facilitiesData);
            setTotalFacilities(metaData.totalItems || facilitiesData.length);
            console.log('State updated with facilities:', facilitiesData.length, 'items');
          } else {
            console.error('Invalid facilities data format:', facilitiesData);
            setFacilities([]);
            setTotalFacilities(0);
          }
        }
      );
    } catch (error) {
      console.error('Error fetching facilities:', error);
      setFacilities([]);
      setTotalFacilities(0);
    }
  };

  // Initial data loading - Make sure tabValue is in the dependency array
  useEffect(() => {
    console.log('useEffect triggered - fetching facilities');
    console.log('Dependencies:', { page, pageSize, searchTerm, filters, tabValue });
    fetchFacilities();
  }, [page, pageSize, searchTerm, filters, tabValue]); // tabValue should trigger re-fetch

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
      facilityType: '',
      status: '',
      lga: ''
    });
    setPage(0);
    setFilterAnchorEl(null);
  };

  // Handle tab change - Add debugging
  const handleTabChange = (event, newValue) => {
    console.log('Tab changed from', tabValue, 'to', newValue);
    setTabLoading(true);
    setTabValue(newValue);
    setPage(0);
    
    // Clear tab loading after a short delay
    setTimeout(() => setTabLoading(false), 100);
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

  // Updated filter menu with API-compatible options
  const renderFilterMenu = () => (
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
            name="facilityType"
            value={filters.facilityType}
            onChange={handleFilterChange}
            label="Facility Type"
          >
            <MenuItem value="">All</MenuItem>
            {facilityTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
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
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth margin="dense" size="small">
          <InputLabel>Local Government Area</InputLabel>
          <Select
            name="lga"
            value={filters.lga}
            onChange={handleFilterChange}
            label="Local Government Area"
          >
            <MenuItem value="">All</MenuItem>
            {lgas.map((lga) => (
              <MenuItem key={lga} value={lga}>
                {lga}
              </MenuItem>
            ))}
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
  );

  // Updated table columns for API data structure
  const columns = [
    { field: 'facility_code', headerName: 'Facility Code', width: 120 },
    { field: 'name', headerName: 'Facility Name', width: 250 },
    { 
      field: 'facilityType', 
      headerName: 'Type', 
      width: 150,
      valueFormatter: (params) => {
        const typeMap = {
          'hospital': 'Hospital',
          'clinic': 'Clinic',
          'health_center': 'Health Center',
          'maternity': 'Maternity'
        };
        return typeMap[params.value] || params.value;
      }
    },
    { field: 'lga', headerName: 'LGA', width: 150 },
    { field: 'contactPerson', headerName: 'Contact Person', width: 180 },
    { field: 'phoneNumber', headerName: 'Phone', width: 150 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value?.charAt(0).toUpperCase() + params.value?.slice(1) || 'Unknown'} 
          color={params.value === 'active' ? 'success' : 'default'} 
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

  // Updated card view for API data
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
                    bgcolor: facility.facilityType === 'hospital' ? 'primary.main' : 
                              (facility.facilityType === 'health_center' ? 'secondary.main' : 'info.main'),
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
                      label={facility.status?.charAt(0).toUpperCase() + facility.status?.slice(1) || 'Unknown'} 
                      color={facility.status === 'active' ? 'success' : 'default'} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <HospitalIcon fontSize="small" sx={{ mr: 1 }} />
                      {facility.facilityType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                      {facility.lga}, {facility.state}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                      {facility.phoneNumber}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                      {facility.contactPerson}
                    </Box>
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="body2" color="text.secondary">
                    <strong>Address:</strong> {facility.address}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Add debugging for facilities state
  useEffect(() => {
    console.log('Facilities state updated:', facilities.length, 'items');
    console.log('Current tab value:', tabValue);
    console.log('Current filters:', filters);
  }, [facilities, tabValue, filters]);

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
          <Tab icon={<HospitalIcon />} label="All Facilities" />      {/* Index 0 */}
          <Tab label="Hospitals" />                                    {/* Index 1 - hospital */}
          <Tab label="Health Centers" />                               {/* Index 2 - health_center */}
          <Tab label="Clinics" />                                      {/* Index 3 - clinic */}
          <Tab label="Maternity Centers" />                            {/* Index 4 - maternity */}
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
          
          {renderFilterMenu()}
          
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

        {(loading || tabLoading) ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : viewMode === 'table' ? (
          <Box sx={{ width: '100%' }}>
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