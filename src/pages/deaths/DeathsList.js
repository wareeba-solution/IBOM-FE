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

// Mock death service - replace with actual service when available
const deathService = {
  getAllDeaths: async (params) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: mockDeathData,
          meta: {
            total: mockDeathData.length,
            page: params.page || 1,
            per_page: params.per_page || 10
          }
        });
      }, 500);
    });
  },
  deleteDeath: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  }
};

// Mock death data
const mockDeathData = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  registration_number: `DR${10000 + i}`,
  deceased_name: `${i % 2 === 0 ? 'John' : 'Jane'} Doe ${i + 1}`,
  gender: i % 2 === 0 ? 'Male' : 'Female',
  date_of_birth: new Date(1940 + i % 50, (i % 12), i % 28 + 1).toISOString().split('T')[0],
  date_of_death: new Date(2023, (i % 12), i % 28 + 1).toISOString().split('T')[0],
  age_at_death: 83 - (i % 50),
  place_of_death: i % 3 === 0 ? 'Hospital' : (i % 3 === 1 ? 'Home' : 'Other'),
  cause_of_death: i % 5 === 0 ? 'Natural Causes' : (i % 5 === 1 ? 'Heart Disease' : (i % 5 === 2 ? 'Cancer' : (i % 5 === 3 ? 'Accident' : 'Respiratory Disease'))),
  informant_name: `Informant ${i + 1}`,
  informant_relationship: i % 4 === 0 ? 'Son' : (i % 4 === 1 ? 'Daughter' : (i % 4 === 2 ? 'Spouse' : 'Sibling')),
  address: `Address ${i + 1}, Akwa Ibom`,
  status: i % 10 === 0 ? 'pending' : 'registered',
  created_at: new Date(2023, (i % 12), i % 28 + 1).toISOString()
}));

// Death Records List Component
const DeathsList = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [deaths, setDeaths] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    gender: '',
    place_of_death: '',
    cause_of_death: '',
    status: '',
    date_range: ''
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalDeaths, setTotalDeaths] = useState(0);
  const [selectedDeath, setSelectedDeath] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [tabValue, setTabValue] = useState(0);

  // Fetch death records
  const fetchDeaths = async () => {
    const queryParams = {
      page: page + 1,
      per_page: pageSize,
      search: searchTerm,
      ...filters
    };

    const result = await execute(
      deathService.getAllDeaths,
      [queryParams],
      (response) => {
        setDeaths(response.data);
        setTotalDeaths(response.meta.total);
      }
    );
  };

  // Initial data loading
  useEffect(() => {
    fetchDeaths();
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
      place_of_death: '',
      cause_of_death: '',
      status: '',
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
        >
          <Tab icon={<DeathIcon />} label="All Records" />
          <Tab label="Registered" />
          <Tab label="Pending" />
          <Tab label="Hospital Deaths" />
          <Tab label="Non-Hospital Deaths" />
        </Tabs>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <TextField
            placeholder="Search death records..."
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
                <InputLabel>Place of Death</InputLabel>
                <Select
                  name="place_of_death"
                  value={filters.place_of_death}
                  onChange={handleFilterChange}
                  label="Place of Death"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Hospital">Hospital</MenuItem>
                  <MenuItem value="Home">Home</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Cause of Death</InputLabel>
                <Select
                  name="cause_of_death"
                  value={filters.cause_of_death}
                  onChange={handleFilterChange}
                  label="Cause of Death"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Natural Causes">Natural Causes</MenuItem>
                  <MenuItem value="Heart Disease">Heart Disease</MenuItem>
                  <MenuItem value="Cancer">Cancer</MenuItem>
                  <MenuItem value="Accident">Accident</MenuItem>
                  <MenuItem value="Respiratory Disease">Respiratory Disease</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
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
                  <MenuItem value="registered">Registered</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
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