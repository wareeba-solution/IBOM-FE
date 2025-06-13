// src/pages/deaths/DeathsList.js
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
  CloudUpload as UploadIcon,
  Assessment as AssessmentIcon,
  SentimentVeryDissatisfied as DeathIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import deathService from '../../services/deathService'; // Import real service

const DeathsList = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [deaths, setDeaths] = useState([]);
  const [deathCounts, setDeathCounts] = useState({
    total: 0,
    registered: 0,
    pending: 0,
    hospital: 0,
    home: 0,
    male: 0,
    female: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    gender: '',
    place_of_death: '',
    manner_of_death: '',
    cause_of_death: '',
    status: '',
    city: '',
    state: '',
    date_from: '',
    date_to: '',
    facilityId: '',
    autopsyPerformed: ''
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalDeaths, setTotalDeaths] = useState(0);
  const [selectedDeath, setSelectedDeath] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [tabValue, setTabValue] = useState(0);

  // Fetch death records
  const fetchDeaths = async () => {
    try {
      // Map frontend filters to API query params
      const queryParams = {
        page: page + 1,
        limit: pageSize,
        deceased_name: searchTerm || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        manner_of_death: filters.manner_of_death || undefined,
        cause_of_death: filters.cause_of_death || undefined,
        city: filters.city || undefined,
        state: filters.state || undefined,
        status: filters.status || undefined,
        facilityId: filters.facilityId || undefined,
        autopsyPerformed: filters.autopsyPerformed !== '' ? filters.autopsyPerformed : undefined,
        sortBy: 'date_of_death',
        sortOrder: 'desc'
      };

      // Remove undefined parameters
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined || queryParams[key] === '') {
          delete queryParams[key];
        }
      });

      const response = await deathService.getAllDeaths(queryParams);

      // Handle API response structure
      if (response && response.data) {
        let deathsData = Array.isArray(response.data) ? response.data : response.data.deaths || [];
        const pagination = response.pagination || { totalItems: deathsData.length };

        // Map API response to include registration_number if missing
        const mappedDeaths = deathsData.map(death => ({
          ...death,
          id: death.id,
          registration_number: death.registration_number || death.id || `DR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          deceased_name: death.deceased_name || 'Unknown',
          gender: death.gender || 'Unknown',
          date_of_birth: death.date_of_birth,
          date_of_death: death.date_of_death,
          age_at_death: death.age_at_death,
          place_of_death: death.place_of_death || 'Unknown',
          hospital_name: death.hospital_name,
          cause_of_death: death.cause_of_death || 'Unknown',
          manner_of_death: death.manner_of_death || 'Unknown',
          informant_name: death.informant_name,
          informant_relationship: death.informant_relationship,
          informant_phone: death.informant_phone,
          city: death.city || 'Unknown',
          state: death.state || 'Akwa Ibom',
          registration_date: death.registration_date || death.createdAt,
          status: death.status || 'pending'
        }));

        setDeaths(mappedDeaths);
        setTotalDeaths(pagination.totalItems || mappedDeaths.length);
      } else {
        setDeaths([]);
        setTotalDeaths(0);
      }
    } catch (error) {
      console.error('Error fetching deaths:', error);
      setDeaths([]);
      setTotalDeaths(0);
    }
  };

  // Calculate death counts for tabs
  const calculateDeathCounts = (deathsData) => {
    const counts = {
      total: deathsData.length,
      registered: deathsData.filter(death => death.status === 'registered').length,
      pending: deathsData.filter(death => death.status === 'pending').length,
      hospital: deathsData.filter(death => death.place_of_death === 'Hospital').length,
      home: deathsData.filter(death => death.place_of_death === 'Home').length,
      male: deathsData.filter(death => death.gender === 'Male').length,
      female: deathsData.filter(death => death.gender === 'Female').length,
    };
    setDeathCounts(counts);
  };

  // Fetch death counts for tabs
  const fetchDeathCounts = async () => {
    try {
      // Use maximum allowed limit of 100 instead of 1000
      const response = await deathService.getAllDeaths({ limit: 100 });
      if (response && response.data) {
        const deathsData = Array.isArray(response.data) ? response.data : response.data.deaths || [];
        calculateDeathCounts(deathsData);
      }
    } catch (error) {
      console.error('Error fetching death counts:', error);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchDeaths();
    // Only fetch counts when we're on first page with no filters/search
    if (page === 0 && !searchTerm && Object.values(filters).every(v => v === '')) {
      fetchDeathCounts();
    }
  }, [page, pageSize, searchTerm, filters]);

  // Handle tab change with specific filtering logic
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
    
    // Clear existing filters and apply tab-specific filters
    let newFilters = {
      gender: '',
      place_of_death: '',
      manner_of_death: '',
      cause_of_death: '',
      status: '',
      city: '',
      state: '',
      date_from: '',
      date_to: '',
      facilityId: '',
      autopsyPerformed: ''
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
      case 3: // Hospital Deaths
        newFilters.place_of_death = 'Hospital';
        break;
      case 4: // Non-Hospital Deaths
        newFilters.place_of_death = 'Home';
        break;
      default:
        break;
    }
    
    setFilters(newFilters);
  };

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
      place_of_death: '',
      manner_of_death: '',
      cause_of_death: '',
      status: '',
      city: '',
      state: '',
      date_from: '',
      date_to: '',
      facilityId: '',
      autopsyPerformed: ''
    });
    setPage(0);
    setFilterAnchorEl(null);
  };

  // Handle delete
  const handleDeleteClick = (death, event) => {
    if (event) {
      event.stopPropagation();
    }
    setSelectedDeath(death);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedDeath(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedDeath) {
      await execute(
        deathService.deleteDeath,
        [selectedDeath.id],
        () => {
          fetchDeaths();
          setDeleteDialogOpen(false);
          setSelectedDeath(null);
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

  // Calculate age from dates
  const calculateAge = (dateOfBirth, dateOfDeath) => {
    if (!dateOfBirth || !dateOfDeath) return '-';
    try {
      const birthDate = new Date(dateOfBirth);
      const deathDate = new Date(dateOfDeath);
      let age = deathDate.getFullYear() - birthDate.getFullYear();
      const m = deathDate.getMonth() - birthDate.getMonth();
      
      if (m < 0 || (m === 0 && deathDate.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      return '-';
    }
  };

  // Table columns
  const columns = [
    { field: 'registration_number', headerName: 'Reg. No.', width: 120 },
    { field: 'deceased_name', headerName: 'Deceased Name', width: 180 },
    { field: 'gender', headerName: 'Gender', width: 100 },
    { 
      field: 'date_of_death', 
      headerName: 'Date of Death', 
      width: 140,
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: 'age_at_death', 
      headerName: 'Age', 
      width: 100,
      valueGetter: (params) => params.row.age_at_death || calculateAge(params.row.date_of_birth, params.row.date_of_death)
    },
    { field: 'place_of_death', headerName: 'Place of Death', width: 150 },
    { field: 'cause_of_death', headerName: 'Cause of Death', width: 180 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
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
            onClick={(e) => handleEditDeath(params.row.id, e)}
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
  const renderDeathCards = () => {
    return (
      <Grid container spacing={2}>
        {deaths.map((death) => (
          <Grid item xs={12} sm={6} md={4} key={death.id}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                transition: 'transform 0.2s', 
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } 
              }}
              onClick={() => handleDeathClick(death.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" noWrap>
                    {death.deceased_name}
                  </Typography>
                  <Chip 
                    label={death.status} 
                    color={death.status === 'registered' ? 'success' : 'warning'} 
                    size="small" 
                    variant="outlined" 
                  />
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Reg No:</strong> {death.registration_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Gender:</strong> {death.gender}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Date of Death:</strong> {formatDate(death.date_of_death)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Age:</strong> {death.age_at_death || calculateAge(death.date_of_birth, death.date_of_death)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Cause:</strong> {death.cause_of_death}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Place:</strong> {death.place_of_death}
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

  // Navigation actions
  const handleAddDeath = () => {
    navigate('/deaths/new');
  };

  const handleDeathClick = (id) => {
    navigate(`/deaths/${id}`);
  };

  const handleEditDeath = (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    navigate(`/deaths/${id}/edit`);
  };

  // Handle statistics view
  const handleViewStatistics = () => {
    navigate('/deaths/statistics');
  };

  return (
    <MainLayout title="Death Records">
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Death Records
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
              onClick={handleAddDeath}
            >
              Register New Death
            </Button>
          </Box>
        </Box>

        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="death records tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            icon={<DeathIcon />} 
            iconPosition="start"
            label={`All Records (${deathCounts.total})`}
          />
          <Tab 
            label={`Registered (${deathCounts.registered})`}
          />
          <Tab 
            label={`Pending (${deathCounts.pending})`}
          />
          <Tab 
            label={`Hospital Deaths (${deathCounts.hospital})`}
          />
          <Tab 
            label={`Non-Hospital Deaths (${deathCounts.home})`}
          />
        </Tabs>

        {/* Search and Filter Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <TextField
            placeholder="Search by deceased name..."
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
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Manner of Death</InputLabel>
                <Select
                  name="manner_of_death"
                  value={filters.manner_of_death}
                  onChange={handleFilterChange}
                  label="Manner of Death"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Natural">Natural</MenuItem>
                  <MenuItem value="Accident">Accident</MenuItem>
                  <MenuItem value="Suicide">Suicide</MenuItem>
                  <MenuItem value="Homicide">Homicide</MenuItem>
                  <MenuItem value="Undetermined">Undetermined</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                margin="dense"
                size="small"
                name="cause_of_death"
                label="Cause of Death"
                value={filters.cause_of_death}
                onChange={handleFilterChange}
              />
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="registered">Registered</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                margin="dense"
                size="small"
                name="city"
                label="City"
                value={filters.city}
                onChange={handleFilterChange}
              />
              
              <TextField
                fullWidth
                margin="dense"
                size="small"
                name="date_from"
                label="Date From"
                type="date"
                value={filters.date_from}
                onChange={handleFilterChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
              <TextField
                fullWidth
                margin="dense"
                size="small"
                name="date_to"
                label="Date To"
                type="date"
                value={filters.date_to}
                onChange={handleFilterChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Autopsy Performed</InputLabel>
                <Select
                  name="autopsyPerformed"
                  value={filters.autopsyPerformed}
                  onChange={handleFilterChange}
                  label="Autopsy Performed"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
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
            onClick={fetchDeaths}
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
                if (!value) return null;
                
                let displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                let displayValue = value;
                
                return (
                  <Chip
                    key={key}
                    label={`${displayKey}: ${displayValue}`}
                    onDelete={() => handleFilterChange({ target: { name: key, value: '' } })}
                    size="small"
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
        ) : deaths.length === 0 ? (
          <Alert severity="info" sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              No death records found
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {searchTerm || Object.values(filters).some(v => v !== '') 
                ? 'Try adjusting your search criteria or filters'
                : 'Start by registering your first death record'
              }
            </Typography>
            {!searchTerm && !Object.values(filters).some(v => v !== '') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddDeath}
                sx={{ mt: 2 }}
              >
                Register First Death
              </Button>
            )}
          </Alert>
        ) : viewMode === 'table' ? (
          <Box sx={{ width: '100%' }}>
            <DataGrid
              rows={deaths}
              columns={columns}
              pageSize={pageSize}
              rowsPerPageOptions={[10, 25, 50]}
              pagination
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              onPageChange={(newPage) => setPage(newPage)}
              rowCount={totalDeaths}
              paginationMode="server"
              page={page}
              autoHeight
              disableSelectionOnClick
              density="standard"
              onRowClick={(params) => handleDeathClick(params.id)}
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
            {renderDeathCards()}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(totalDeaths / pageSize)}
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
            Are you sure you want to delete death record for: {selectedDeath?.deceased_name}? This action cannot be undone.
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

export default DeathsList;