// src/pages/diseases/DiseaseList.js
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
  LocalHospital as LocalHospitalIcon,
  Coronavirus as CoronavirusIcon,
  MedicalServices as MedicalIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';

// Mock disease service - replace with actual service when available
const diseaseService = {
  getAllDiseaseCases: async (params) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: mockDiseaseData,
          meta: {
            total: mockDiseaseData.length,
            page: params.page || 1,
            per_page: params.per_page || 10
          }
        });
      }, 500);
    });
  },
  deleteDiseaseCase: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  }
};

// Disease types
const diseaseTypes = [
  'Malaria',
  'Tuberculosis',
  'HIV/AIDS',
  'Cholera',
  'Typhoid',
  'Measles',
  'Meningitis',
  'Hepatitis',
  'Yellow Fever',
  'Lassa Fever',
  'Ebola',
  'COVID-19',
  'Other'
];

// Mock disease data
const mockDiseaseData = Array.from({ length: 50 }, (_, i) => {
  const reportDate = new Date(2023, (i % 12), i % 28 + 1);
  const onset = new Date(reportDate);
  onset.setDate(onset.getDate() - (i % 7 + 1));
  
  return {
    id: i + 1,
    case_id: `CDCS${10000 + i}`,
    patient_name: `${i % 2 === 0 ? 'John' : 'Jane'} ${['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller'][i % 7]} ${i + 1}`,
    patient_id: `PT${5000 + i}`,
    age: 15 + (i % 60),
    gender: i % 2 === 0 ? 'Male' : 'Female',
    disease_type: diseaseTypes[i % diseaseTypes.length],
    onset_date: onset.toISOString().split('T')[0],
    report_date: reportDate.toISOString().split('T')[0],
    location: `${['Uyo', 'Ikot Ekpene', 'Eket', 'Oron', 'Abak'][i % 5]}, Akwa Ibom`,
    status: i % 10 === 0 ? 'suspected' : (i % 10 === 1 ? 'probable' : (i % 5 === 0 ? 'confirmed' : 'ruled_out')),
    severity: i % 10 === 0 ? 'severe' : (i % 5 === 0 ? 'moderate' : 'mild'),
    outcome: i % 20 === 0 ? 'death' : (i % 10 === 0 ? 'hospitalized' : (i % 5 === 0 ? 'recovered' : 'under_treatment')),
    is_outbreak: i % 15 === 0,
    reported_by: `Staff ${i % 20 + 1}`,
    note: i % 8 === 0 ? 'Patient has travel history to affected region.' : null,
    created_at: reportDate.toISOString()
  };
});

// Disease List Component
const DiseaseList = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [diseaseCases, setDiseaseCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    disease_type: '',
    status: '',
    severity: '',
    outcome: '',
    date_range: ''
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCases, setTotalCases] = useState(0);
  const [selectedCase, setSelectedCase] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [tabValue, setTabValue] = useState(0);

  // Fetch disease cases
  const fetchDiseaseCases = async () => {
    const queryParams = {
      page: page + 1,
      per_page: pageSize,
      search: searchTerm,
      ...filters
    };

    const result = await execute(
      diseaseService.getAllDiseaseCases,
      [queryParams],
      (response) => {
        setDiseaseCases(response.data);
        setTotalCases(response.meta.total);
      }
    );
  };

  // Initial data loading
  useEffect(() => {
    fetchDiseaseCases();
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
      disease_type: '',
      status: '',
      severity: '',
      outcome: '',
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
  const handleAddCase = () => {
    navigate('/diseases/new');
  };

  const handleCaseClick = (id) => {
    navigate(`/diseases/${id}`);
  };

  const handleEditCase = (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    navigate(`/diseases/${id}/edit`);
  };

  // Handle statistics view
  const handleViewStatistics = () => {
    navigate('/diseases/statistics');
  };

  // Handle outbreak reporting
  const handleReportOutbreak = () => {
    navigate('/diseases/outbreak/new');
  };

  // Handle delete
  const handleDeleteClick = (caseData, event) => {
    if (event) {
      event.stopPropagation();
    }
    setSelectedCase(caseData);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedCase(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCase) {
      await execute(
        diseaseService.deleteDiseaseCase,
        [selectedCase.id],
        () => {
          fetchDiseaseCases();
          setDeleteDialogOpen(false);
          setSelectedCase(null);
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

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'error';
      case 'suspected':
        return 'warning';
      case 'probable':
        return 'warning';
      case 'ruled_out':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get outcome color
  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'death':
        return 'error';
      case 'hospitalized':
        return 'warning';
      case 'recovered':
        return 'success';
      case 'under_treatment':
        return 'info';
      default:
        return 'default';
    }
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'severe':
        return 'error';
      case 'moderate':
        return 'warning';
      case 'mild':
        return 'success';
      default:
        return 'default';
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format outcome for display
  const formatOutcome = (outcome) => {
    return outcome.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Table columns
  const columns = [
    { field: 'case_id', headerName: 'Case ID', width: 120 },
    { field: 'patient_name', headerName: 'Patient Name', width: 180 },
    { field: 'disease_type', headerName: 'Disease', width: 150 },
    { 
      field: 'report_date', 
      headerName: 'Report Date', 
      width: 120,
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: 'onset_date', 
      headerName: 'Onset Date', 
      width: 120,
      valueFormatter: (params) => formatDate(params.value)
    },
    { field: 'location', headerName: 'Location', width: 150 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={formatStatus(params.value)} 
          color={getStatusColor(params.value)} 
          size="small" 
          variant="outlined" 
        />
      )
    },
    { 
      field: 'severity', 
      headerName: 'Severity', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)} 
          color={getSeverityColor(params.value)} 
          size="small" 
          variant="outlined" 
        />
      )
    },
    { 
      field: 'outcome', 
      headerName: 'Outcome', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={formatOutcome(params.value)} 
          color={getOutcomeColor(params.value)} 
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
            onClick={(e) => handleEditCase(params.row.id, e)}
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
  const renderDiseaseCards = () => {
    return (
      <Grid container spacing={2}>
        {diseaseCases.map((caseData) => (
          <Grid item xs={12} sm={6} md={4} key={caseData.id}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                transition: 'transform 0.2s', 
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } 
              }}
              onClick={() => handleCaseClick(caseData.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" noWrap>
                    {caseData.disease_type}
                  </Typography>
                  <Chip 
                    label={formatStatus(caseData.status)} 
                    color={getStatusColor(caseData.status)} 
                    size="small" 
                    variant="outlined" 
                  />
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Case ID:</strong> {caseData.case_id}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Patient:</strong> {caseData.patient_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Onset:</strong> {formatDate(caseData.onset_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Reported:</strong> {formatDate(caseData.report_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Location:</strong> {caseData.location}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Chip 
                        label={caseData.severity.charAt(0).toUpperCase() + caseData.severity.slice(1)} 
                        color={getSeverityColor(caseData.severity)} 
                        size="small" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={formatOutcome(caseData.outcome)} 
                        color={getOutcomeColor(caseData.outcome)} 
                        size="small" 
                        variant="outlined" 
                      />
                      {caseData.is_outbreak && (
                        <Chip 
                          label="Outbreak" 
                          color="error" 
                          size="small" 
                          icon={<WarningIcon />}
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
    <MainLayout title="Communicable Diseases">
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Communicable Disease Cases
          </Typography>
          <Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<WarningIcon />}
              onClick={handleReportOutbreak}
              sx={{ mr: 1 }}
            >
              Report Outbreak
            </Button>
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
              onClick={handleAddCase}
            >
              Register New Case
            </Button>
          </Box>
        </Box>

        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="disease cases tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab icon={<CoronavirusIcon />} label="All Cases" />
          <Tab label="Confirmed" />
          <Tab label="Suspected" />
          <Tab label="Outbreaks" />
          <Tab label="This Month" />
        </Tabs>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <TextField
            placeholder="Search disease cases..."
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
                Filter Cases
              </Typography>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Disease Type</InputLabel>
                <Select
                  name="disease_type"
                  value={filters.disease_type}
                  onChange={handleFilterChange}
                  label="Disease Type"
                >
                  <MenuItem value="">All</MenuItem>
                  {diseaseTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
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
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="suspected">Suspected</MenuItem>
                  <MenuItem value="probable">Probable</MenuItem>
                  <MenuItem value="ruled_out">Ruled Out</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Severity</InputLabel>
                <Select
                  name="severity"
                  value={filters.severity}
                  onChange={handleFilterChange}
                  label="Severity"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="mild">Mild</MenuItem>
                  <MenuItem value="moderate">Moderate</MenuItem>
                  <MenuItem value="severe">Severe</MenuItem>
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
                  <MenuItem value="under_treatment">Under Treatment</MenuItem>
                  <MenuItem value="recovered">Recovered</MenuItem>
                  <MenuItem value="hospitalized">Hospitalized</MenuItem>
                  <MenuItem value="death">Death</MenuItem>
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
            onClick={fetchDiseaseCases}
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
              rows={diseaseCases}
              columns={columns}
              pageSize={pageSize}
              rowsPerPageOptions={[10, 25, 50]}
              pagination
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              onPageChange={(newPage) => setPage(newPage)}
              rowCount={totalCases}
              paginationMode="client"
              page={page}
              autoHeight
              disableSelectionOnClick
              density="standard"
              onRowClick={(params) => handleCaseClick(params.id)}
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
            {renderDiseaseCards()}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(totalCases / pageSize)}
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
            Are you sure you want to delete case {selectedCase?.case_id} for: {selectedCase?.patient_name}? This action cannot be undone.
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

export default DiseaseList;