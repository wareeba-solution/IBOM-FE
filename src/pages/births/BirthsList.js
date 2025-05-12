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
  ChildCare as ChildIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';

// Mock birth service - replace with actual service when available
const birthService = {
  getAllBirths: async (params) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: mockBirthData,
          meta: {
            total: mockBirthData.length,
            page: params.page || 1,
            per_page: params.per_page || 10
          }
        });
      }, 500);
    });
  },
  deleteBirth: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  }
};

// Mock birth data
const mockBirthData = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  registration_number: `BR${10000 + i}`,
  child_name: `Baby ${i % 2 === 0 ? 'Boy' : 'Girl'} ${i + 1}`,
  gender: i % 2 === 0 ? 'Male' : 'Female',
  date_of_birth: new Date(2023, (i % 12), i % 28 + 1).toISOString().split('T')[0],
  place_of_birth: i % 3 === 0 ? 'Home' : 'Hospital',
  birth_weight: (2.5 + Math.random() * 2).toFixed(2) + ' kg',
  mother_name: `Mother ${i + 1}`,
  father_name: `Father ${i + 1}`,
  address: `Address ${i + 1}, Akwa Ibom`,
  telephone: `080${i}${i}${i}${i}${i}${i}${i}${i}`,
  status: i % 10 === 0 ? 'pending' : 'registered',
  created_at: new Date(2023, (i % 12), i % 28 + 1).toISOString()
}));

// Birth Records List Component
const BirthsList = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [births, setBirths] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    gender: '',
    place_of_birth: '',
    status: '',
    date_range: ''
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalBirths, setTotalBirths] = useState(0);
  const [selectedBirth, setSelectedBirth] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [tabValue, setTabValue] = useState(0);

  // Fetch birth records
  const fetchBirths = async () => {
    const queryParams = {
      page: page + 1,
      per_page: pageSize,
      search: searchTerm,
      ...filters
    };

    const result = await execute(
      birthService.getAllBirths,
      [queryParams],
      (response) => {
        setBirths(response.data);
        setTotalBirths(response.meta.total);
      }
    );
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
      gender: '',
      place_of_birth: '',
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
    { field: 'child_name', headerName: 'Child Name', width: 180 },
    { field: 'gender', headerName: 'Gender', width: 110 },
    { 
      field: 'date_of_birth', 
      headerName: 'Date of Birth', 
      width: 150,
      valueFormatter: (params) => formatDate(params.value)
    },
    { field: 'birth_weight', headerName: 'Weight', width: 120 },
    { field: 'place_of_birth', headerName: 'Place of Birth', width: 150 },
    { field: 'mother_name', headerName: 'Mother', width: 180 },
    { field: 'father_name', headerName: 'Father', width: 180 },
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
                    {birth.child_name}
                  </Typography>
                  <Chip 
                    label={birth.status} 
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
                      <strong>Gender:</strong> {birth.gender}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>DOB:</strong> {formatDate(birth.date_of_birth)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Weight:</strong> {birth.birth_weight}
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
                    <Typography variant="body2" color="text.secondary">
                      <strong>Place:</strong> {birth.place_of_birth}
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

        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="birth records tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab icon={<ChildIcon />} label="All Records" />
          <Tab label="Registered" />
          <Tab label="Pending" />
          <Tab label="Hospital Births" />
          <Tab label="Home Births" />
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
                <InputLabel>Place of Birth</InputLabel>
                <Select
                  name="place_of_birth"
                  value={filters.place_of_birth}
                  onChange={handleFilterChange}
                  label="Place of Birth"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Hospital">Hospital</MenuItem>
                  <MenuItem value="Home">Home</MenuItem>
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
            Are you sure you want to delete birth record for: {selectedBirth?.child_name}? This action cannot be undone.
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