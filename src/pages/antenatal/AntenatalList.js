// src/pages/antenatal/AntenatalList.js
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
  PregnantWoman as PregnantWomanIcon,
  ChildCare as ChildCareIcon,
  MedicalServices as MedicalIcon
} from '@mui/icons-material';
import { format, parseISO, differenceInWeeks } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';

// Mock antenatal service - replace with actual service when available
const antenatalService = {
  getAllAntenatalRecords: async (params) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: mockAntenatalData,
          meta: {
            total: mockAntenatalData.length,
            page: params.page || 1,
            per_page: params.per_page || 10
          }
        });
      }, 500);
    });
  },
  deleteAntenatalRecord: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  }
};

// Mock antenatal data
const mockAntenatalData = Array.from({ length: 50 }, (_, i) => {
  const lmpDate = new Date(2023 - (i % 2), (i % 12), i % 28 + 1);
  const registrationDate = new Date(lmpDate);
  registrationDate.setDate(registrationDate.getDate() + (i % 30) + 10);
  
  const currentDate = new Date();
  const gestationalAge = differenceInWeeks(currentDate, lmpDate);
  
  // Calculate EDD (Estimated Due Date): LMP + 280 days
  const edd = new Date(lmpDate);
  edd.setDate(edd.getDate() + 280);
  
  return {
    id: i + 1,
    registration_number: `ANC${10000 + i}`,
    patient_name: `${i % 2 === 0 ? 'Mary' : 'Sarah'} ${['Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis'][i % 7]} ${i + 1}`,
    patient_id: `PT${5000 + i}`,
    age: 20 + (i % 15),
    lmp: lmpDate.toISOString().split('T')[0],
    edd: edd.toISOString().split('T')[0],
    gestational_age: gestationalAge > 0 ? gestationalAge : 4,
    gravida: 1 + (i % 4),
    parity: i % 3,
    phone_number: `080${i}${i}${i}${i}${i}${i}${i}`,
    address: `Address ${i + 1}, Akwa Ibom`,
    risk_level: i % 10 === 0 ? 'high' : (i % 5 === 0 ? 'medium' : 'low'),
    registration_date: registrationDate.toISOString().split('T')[0],
    next_appointment: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (i % 14) + 1).toISOString().split('T')[0],
    visit_count: i % 8,
    blood_type: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][i % 8],
    status: i % 20 === 0 ? 'delivered' : (i % 15 === 0 ? 'transferred' : (i % 10 === 0 ? 'inactive' : 'active')),
    created_at: registrationDate.toISOString()
  };
});

// Antenatal Records List Component
const AntenatalList = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [antenatalRecords, setAntenatalRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    risk_level: '',
    status: '',
    trimester: '',
    age_group: '',
    date_range: ''
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [tabValue, setTabValue] = useState(0);

  // Fetch antenatal records
  const fetchAntenatalRecords = async () => {
    const queryParams = {
      page: page + 1,
      per_page: pageSize,
      search: searchTerm,
      ...filters
    };

    const result = await execute(
      antenatalService.getAllAntenatalRecords,
      [queryParams],
      (response) => {
        setAntenatalRecords(response.data);
        setTotalRecords(response.meta.total);
      }
    );
  };

  // Initial data loading
  useEffect(() => {
    fetchAntenatalRecords();
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
      risk_level: '',
      status: '',
      trimester: '',
      age_group: '',
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
  const handleAddRecord = () => {
    navigate('/antenatal/new');
  };

  const handleRecordClick = (id) => {
    navigate(`/antenatal/${id}`);
  };

  const handleEditRecord = (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    navigate(`/antenatal/${id}/edit`);
  };

  // Handle statistics view
  const handleViewStatistics = () => {
    navigate('/antenatal/statistics');
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
        antenatalService.deleteAntenatalRecord,
        [selectedRecord.id],
        () => {
          fetchAntenatalRecords();
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

  // Calculate trimester from gestational age
  const getTrimester = (gestationalAge) => {
    if (gestationalAge <= 12) return '1st';
    if (gestationalAge <= 27) return '2nd';
    return '3rd';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'delivered':
        return 'info';
      case 'transferred':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Get risk level color
  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  // Table columns
  const columns = [
    { field: 'registration_number', headerName: 'Reg. No.', width: 120 },
    { field: 'patient_name', headerName: 'Patient Name', width: 180 },
    { 
      field: 'gestational_age', 
      headerName: 'Gest. Age (Weeks)', 
      width: 150,
      valueFormatter: (params) => `${params.value} (${getTrimester(params.value)})`
    },
    { 
      field: 'edd', 
      headerName: 'EDD', 
      width: 120,
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: 'next_appointment', 
      headerName: 'Next Visit', 
      width: 120,
      valueFormatter: (params) => formatDate(params.value)
    },
    { field: 'visit_count', headerName: 'Visits', width: 80 },
    { 
      field: 'risk_level', 
      headerName: 'Risk Level', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getRiskLevelColor(params.value)} 
          size="small" 
          variant="outlined" 
        />
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStatusColor(params.value)} 
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
  const renderAntenatalCards = () => {
    return (
      <Grid container spacing={2}>
        {antenatalRecords.map((record) => (
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
                  <Chip 
                    label={record.status} 
                    color={getStatusColor(record.status)} 
                    size="small" 
                    variant="outlined" 
                  />
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Reg No:</strong> {record.registration_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Age:</strong> {record.age} years
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Gestational Age:</strong> {record.gestational_age} weeks ({getTrimester(record.gestational_age)})
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>EDD:</strong> {formatDate(record.edd)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Next Visit:</strong> {formatDate(record.next_appointment)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Visits:</strong> {record.visit_count}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Chip 
                        label={`G${record.gravida}P${record.parity}`} 
                        size="small" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={`Risk: ${record.risk_level}`} 
                        color={getRiskLevelColor(record.risk_level)} 
                        size="small" 
                        variant="outlined" 
                      />
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
    <MainLayout title="Antenatal Care Records">
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Antenatal Care Records
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
              Register New Patient
            </Button>
          </Box>
        </Box>

        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="antenatal records tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab icon={<PregnantWomanIcon />} label="All Records" />
          <Tab label="Active" />
          <Tab label="1st Trimester" />
          <Tab label="2nd Trimester" />
          <Tab label="3rd Trimester" />
          <Tab label="High Risk" />
        </Tabs>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <TextField
            placeholder="Search antenatal records..."
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
                <InputLabel>Risk Level</InputLabel>
                <Select
                  name="risk_level"
                  value={filters.risk_level}
                  onChange={handleFilterChange}
                  label="Risk Level"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="low">Low Risk</MenuItem>
                  <MenuItem value="medium">Medium Risk</MenuItem>
                  <MenuItem value="high">High Risk</MenuItem>
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
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="transferred">Transferred</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Trimester</InputLabel>
                <Select
                  name="trimester"
                  value={filters.trimester}
                  onChange={handleFilterChange}
                  label="Trimester"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="1st">1st Trimester</MenuItem>
                  <MenuItem value="2nd">2nd Trimester</MenuItem>
                  <MenuItem value="3rd">3rd Trimester</MenuItem>
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
                  <MenuItem value="below-18">Below 18</MenuItem>
                  <MenuItem value="18-25">18-25 years</MenuItem>
                  <MenuItem value="26-35">26-35 years</MenuItem>
                  <MenuItem value="above-35">Above 35 years</MenuItem>
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
            onClick={fetchAntenatalRecords}
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
              rows={antenatalRecords}
              columns={columns}
              pageSize={pageSize}
              rowsPerPageOptions={[10, 25, 50]}
              pagination
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              onPageChange={(newPage) => setPage(newPage)}
              rowCount={totalRecords}
              paginationMode="server"
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
            {renderAntenatalCards()}
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
            Are you sure you want to delete antenatal record for: {selectedRecord?.patient_name}? This action cannot be undone.
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

export default AntenatalList;