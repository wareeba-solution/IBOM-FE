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

// Mock family planning service - replace with actual service when available
const familyPlanningService = {
  getAllRecords: async (params) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: mockFamilyPlanningData,
          meta: {
            total: mockFamilyPlanningData.length,
            page: params.page || 1,
            per_page: params.per_page || 10
          }
        });
      }, 500);
    });
  },
  deleteRecord: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  }
};

// Contraceptive methods
const contraceptiveMethods = [
  'Oral Contraceptives',
  'Injectable Contraceptives',
  'Intrauterine Device (IUD)',
  'Implant',
  'Condoms',
  'Female Sterilization',
  'Male Sterilization',
  'Natural Family Planning',
  'Emergency Contraception',
  'Other'
];

// Visit types
const visitTypes = [
  'Initial Consultation',
  'Follow-up',
  'Method Change',
  'Method Renewal',
  'Side Effects Consultation',
  'Counseling Only',
  'Removal',
  'Other'
];

// Mock family planning data
const mockFamilyPlanningData = Array.from({ length: 50 }, (_, i) => {
  const visitDate = subMonths(new Date(), i % 12);
  const nextVisitDate = new Date(visitDate);
  nextVisitDate.setMonth(nextVisitDate.getMonth() + 3);
  
  const age = 18 + (i % 30);
  const isMale = i % 10 === 0; // Mostly female clients, but some male for condoms or vasectomy
  
  return {
    id: i + 1,
    record_id: `FP${10000 + i}`,
    patient_name: `${isMale ? 'John' : 'Jane'} ${['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller'][i % 7]} ${i + 1}`,
    patient_id: `PT${5000 + i}`,
    age: age,
    gender: isMale ? 'Male' : 'Female',
    visit_date: visitDate.toISOString().split('T')[0],
    next_visit_date: nextVisitDate.toISOString().split('T')[0],
    visit_type: visitTypes[i % visitTypes.length],
    method: isMale ? 
      (i % 5 === 0 ? 'Male Sterilization' : 'Condoms') : 
      contraceptiveMethods[i % (contraceptiveMethods.length - 2)], // Exclude male methods for females
    location: `${['Uyo', 'Ikot Ekpene', 'Eket', 'Oron', 'Abak'][i % 5]} Health Center`,
    provider: `Provider ${i % 10 + 1}`,
    has_side_effects: (i % 7 === 0),
    is_new_acceptor: (i % 5 === 0),
    created_at: visitDate.toISOString()
  };
});

// Family Planning List Component
const FamilyPlanningList = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    method: '',
    visit_type: '',
    date_range: '',
    is_new_acceptor: ''
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [tabValue, setTabValue] = useState(0);

  // Fetch family planning records
  const fetchRecords = async () => {
    const queryParams = {
      page: page + 1,
      per_page: pageSize,
      search: searchTerm,
      ...filters
    };

    const result = await execute(
      familyPlanningService.getAllRecords,
      [queryParams],
      (response) => {
        setRecords(response.data);
        setTotalRecords(response.meta.total);
      }
    );
  };

  // Initial data loading
  useEffect(() => {
    fetchRecords();
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
      method: '',
      visit_type: '',
      date_range: '',
      is_new_acceptor: ''
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

  // Table columns
  const columns = [
    { field: 'record_id', headerName: 'Record ID', width: 120 },
    { field: 'patient_name', headerName: 'Patient Name', width: 180 },
    { 
      field: 'gender', 
      headerName: 'Gender', 
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {params.value === 'Female' ? 
            <FemaleIcon color="secondary" fontSize="small" sx={{ mr: 1 }} /> : 
            <MaleIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
          }
          {params.value}
        </Box>
      )
    },
    { field: 'age', headerName: 'Age', width: 80, type: 'number' },
    { 
      field: 'visit_date', 
      headerName: 'Visit Date', 
      width: 120,
      valueFormatter: (params) => formatDate(params.value)
    },
    { field: 'method', headerName: 'Method', width: 180 },
    { field: 'visit_type', headerName: 'Visit Type', width: 180 },
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
      field: 'next_visit_date', 
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
                <InputLabel>Method</InputLabel>
                <Select
                  name="method"
                  value={filters.method}
                  onChange={handleFilterChange}
                  label="Method"
                >
                  <MenuItem value="">All Methods</MenuItem>
                  {contraceptiveMethods.map((method) => (
                    <MenuItem key={method} value={method}>{method}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Visit Type</InputLabel>
                <Select
                  name="visit_type"
                  value={filters.visit_type}
                  onChange={handleFilterChange}
                  label="Visit Type"
                >
                  <MenuItem value="">All Visit Types</MenuItem>
                  {visitTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>New Acceptor</InputLabel>
                <Select
                  name="is_new_acceptor"
                  value={filters.is_new_acceptor}
                  onChange={handleFilterChange}
                  label="New Acceptor"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
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