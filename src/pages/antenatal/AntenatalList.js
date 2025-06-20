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
import antenatalService from '../../services/antenatalService';
import patientService from '../../services/patientService'; // If available

// Antenatal Records List Component
const AntenatalList = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [antenatalRecords, setAntenatalRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    outcome: '',
    hivStatus: '',
    riskLevel: '',
    facilityId: '',
    registrationDateFrom: '',
    registrationDateTo: '',
    eddFrom: '',
    eddTo: ''
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [tabValue, setTabValue] = useState(0);

  // Fetch antenatal records
  const fetchAntenatalRecords = async () => {
    try {
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
        case 1: // Active
          queryParams.status = 'Active';
          break;
        case 2: // 1st Trimester (0-12 weeks)
          queryParams.gestationalAgeMin = 0;
          queryParams.gestationalAgeMax = 12;
          break;
        case 3: // 2nd Trimester (13-27 weeks)
          queryParams.gestationalAgeMin = 13;
          queryParams.gestationalAgeMax = 27;
          break;
        case 4: // 3rd Trimester (28+ weeks)
          queryParams.gestationalAgeMin = 28;
          queryParams.gestationalAgeMax = 42;
          break;
        case 5: // High Risk
          queryParams.riskLevel = 'high';
          break;
        default:
          // All records - no additional filters
          break;
      }

      console.log('Fetching antenatal records with params:', queryParams);

      await execute(
        antenatalService.getAllAntenatalRecords,
        [queryParams],
        (response) => {
          console.log('API response:', response);
          
          // Handle the response structure - the data is already properly structured
          const records = response.data || [];
          const pagination = response.pagination || { totalItems: records.length };

          console.log('Setting records:', records);
          console.log('First record structure:', records[0]);

          setAntenatalRecords(records);
          setTotalRecords(pagination.totalItems || records.length);
        }
      );
    } catch (error) {
      console.error('Error fetching antenatal records:', error);
      setAntenatalRecords([]);
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
    fetchAntenatalRecords();
  }, [page, pageSize, searchTerm, filters, tabValue]);

  // Handle search with debouncing
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  // Handle filters - Updated with API-compatible filter options
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
      status: '',
      outcome: '',
      hivStatus: '',
      riskLevel: '',
      facilityId: '',
      registrationDateFrom: '',
      registrationDateTo: '',
      eddFrom: '',
      eddTo: ''
    });
    setPage(0);
    setFilterAnchorEl(null);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0); // Reset to first page when changing tabs
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

  // Get status color - Updated for API status values
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Completed':
        return 'info';
      case 'Transferred':
        return 'secondary';
      case 'Lost to Follow-up':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get risk level color
  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
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

  // Updated table columns for the actual API response structure
  const columns = [
    {
      field: 'registrationNumber',
      headerName: 'Reg. No.',
      width: 150,
      renderCell: (params) => params.row.registrationNumber || 'N/A',
    },
    {
      field: 'patientName',
      headerName: 'Patient Name',
      width: 200,
      renderCell: (params) => {
        const p = params.row.patient;
        if (p && (p.firstName || p.lastName)) {
          return `${p.firstName || ''} ${p.lastName || ''}`.trim();
        }
        return 'Unknown';
      },
    },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 100,
      renderCell: (params) => params.row.patient?.gender || 'Unspecified',
    },
    {
      field: 'age',
      headerName: 'Age',
      width: 80,
      renderCell: (params) => {
        const dob = params.row.patient?.dateOfBirth;
        if (!dob) return 'Unknown';
        const birth = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return `${age}y`;
      },
    },
    {
      field: 'gravida',
      headerName: 'G',
      width: 60,
      renderCell: (params) => params.row.gravida ?? '',
    },
    {
      field: 'para',
      headerName: 'P',
      width: 60,
      renderCell: (params) => params.row.para ?? '',
    },
    {
      field: 'lmp',
      headerName: 'LMP',
      width: 110,
      renderCell: (params) =>
        params.row.lmp ? new Date(params.row.lmp).toLocaleDateString('en-GB') : 'N/A',
    },
    {
      field: 'edd',
      headerName: 'EDD',
      width: 110,
      renderCell: (params) =>
        params.row.edd ? new Date(params.row.edd).toLocaleDateString('en-GB') : 'N/A',
    },
    {
      field: 'gestationalAge',
      headerName: 'GA (wks)',
      width: 100,
      renderCell: (params) => {
        if (!params.row.lmp) return 'N/A';
        const lmp = new Date(params.row.lmp);
        const today = new Date();
        const diff = today - lmp;
        if (isNaN(diff) || diff < 0) return 'Invalid';
        const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
        return weeks >= 0 && weeks <= 50 ? `${weeks}w` : 'Invalid';
      },
    },
    {
      field: 'riskLevel',
      headerName: 'Risk Level',
      width: 110,
      renderCell: (params) => params.row.riskLevel || 'Unknown',
    },
    {
      field: 'hivStatus',
      headerName: 'HIV Status',
      width: 110,
      renderCell: (params) => params.row.hivStatus || 'Unknown',
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone',
      width: 130,
      renderCell: (params) => params.row.patient?.phoneNumber || 'Not provided',
    },
    {
      field: 'facility',
      headerName: 'Facility',
      width: 160,
      renderCell: (params) => params.row.facility?.name || 'Unknown Facility',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => params.row.status || 'Unknown',
    },
    {
      field: 'nextAppointment',
      headerName: 'Next Visit',
      width: 110,
      renderCell: (params) =>
        params.row.nextAppointment
          ? new Date(params.row.nextAppointment).toLocaleDateString('en-GB')
          : 'Not scheduled',
    },
    // Updated Actions column - removed View, kept Edit and Delete
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              handleEditRecord(params.row.id, e);
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(params.row, e);
            }}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

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
          Filter Records
        </Typography>
        
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
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Transferred">Transferred</MenuItem>
            <MenuItem value="Lost to Follow-up">Lost to Follow-up</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth margin="dense" size="small">
          <InputLabel>Outcome</InputLabel>
          <Select
            name="outcome"
            value={filters.outcome}
            onChange={handleFilterChange}
            label="Outcome"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Ongoing">Ongoing</MenuItem>
            <MenuItem value="Live Birth">Live Birth</MenuItem>
            <MenuItem value="Stillbirth">Stillbirth</MenuItem>
            <MenuItem value="Miscarriage">Miscarriage</MenuItem>
            <MenuItem value="Abortion">Abortion</MenuItem>
            <MenuItem value="Ectopic Pregnancy">Ectopic Pregnancy</MenuItem>
            <MenuItem value="Unknown">Unknown</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth margin="dense" size="small">
          <InputLabel>HIV Status</InputLabel>
          <Select
            name="hivStatus"
            value={filters.hivStatus}
            onChange={handleFilterChange}
            label="HIV Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Positive">Positive</MenuItem>
            <MenuItem value="Negative">Negative</MenuItem>
            <MenuItem value="Unknown">Unknown</MenuItem>
            <MenuItem value="Not Tested">Not Tested</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth margin="dense" size="small">
          <InputLabel>Risk Level</InputLabel>
          <Select
            name="riskLevel"
            value={filters.riskLevel}
            onChange={handleFilterChange}
            label="Risk Level"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="low">Low Risk</MenuItem>
            <MenuItem value="medium">Medium Risk</MenuItem>
            <MenuItem value="high">High Risk</MenuItem>
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

  // Updated card view for API data
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
                    {record.patient_name || 'Loading...'}
                  </Typography>
                  <Chip 
                    label={record.status || 'Unknown'} 
                    color={getStatusColor(record.status)} 
                    size="small" 
                    variant="outlined" 
                  />
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Reg No:</strong> {record.registration_number || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Age:</strong> {record.age ? `${record.age} years` : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Gestational Age:</strong> {record.gestational_age ? `${record.gestational_age} weeks` : 'N/A'}
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
                      <strong>G/P:</strong> G{record.gravida || 0}P{record.para || record.parity || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Chip 
                        label={record.outcome || 'Ongoing'} 
                        size="small" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={`Risk: ${record.risk_level || 'Unknown'}`} 
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
              onClick={() => navigate('/antenatal/statistics')}
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
          
          {renderFilterMenu()}
          
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
          <Box sx={{ width: '100%' }}>
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