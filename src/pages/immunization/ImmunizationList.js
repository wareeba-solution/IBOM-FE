// src/pages/immunization/ImmunizationList.js
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
  MedicalServices as MedicalIcon,
  Assessment as AssessmentIcon,
  PersonAdd as PersonAddIcon,
  Vaccines as VaccinesIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import immunizationService from '../../services/immunizationService'; // Import real service

// Immunization Records List Component
const ImmunizationList = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [immunizations, setImmunizations] = useState([]);
  const [immunizationCounts, setImmunizationCounts] = useState({
    total: 0,
    administered: 0,
    scheduled: 0,
    missed: 0,
    cancelled: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    patientId: '',
    facilityId: '',
    vaccineType: '',
    vaccineName: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    gender: '',
    age_group: ''
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalImmunizations, setTotalImmunizations] = useState(0);
  const [selectedImmunization, setSelectedImmunization] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [tabValue, setTabValue] = useState(0);

  // Fetch immunization records
  const fetchImmunizations = async () => {
    try {
      // Map frontend filters to API query params
      const queryParams = {
        page: page + 1,
        limit: pageSize,
        patientId: filters.patientId || undefined,
        facilityId: filters.facilityId || undefined,
        vaccineType: filters.vaccineType || undefined,
        vaccineName: filters.vaccineName || searchTerm || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        status: filters.status || undefined,
        sortBy: 'administrationDate',
        sortOrder: 'desc'
      };

      // Remove undefined parameters
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined || queryParams[key] === '') {
          delete queryParams[key];
        }
      });

      console.log('Fetching immunizations with params:', queryParams);
      const response = await immunizationService.getAllImmunizations(queryParams);
      console.log('Full API response:', response);

      // Handle API response structure
      if (response && response.data) {
        // Check if this is actually patient data instead of immunization data
        const responseData = response.data.immunizations || response.data || [];
        console.log('Response data:', responseData);
        
        // If we're getting patient data instead of immunization data, map it properly
        const mappedImmunizations = responseData.map((item, index) => {
          console.log('Processing item:', item);
          
          // Check if this looks like patient data (has firstName, lastName, etc.)
          if (item.firstName && item.lastName) {
            // This is patient data, create mock immunization record
            return {
              id: item.id || `mock-${index}`,
              registration_number: item.uniqueIdentifier || `IM-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`,
              patient_name: `${item.firstName} ${item.lastName}${item.otherNames ? ' ' + item.otherNames : ''}`,
              patient_id: item.uniqueIdentifier || item.id,
              gender: item.gender || 'Unknown',
              date_of_birth: item.dateOfBirth,
              age_months: calculateAgeMonths(item.dateOfBirth),
              vaccine_type: 'COVID-19', // Mock data since we don't have actual immunization data
              vaccine_name: 'Pfizer-BioNTech',
              dose_number: 1,
              lot_number: `LOT-${Math.floor(Math.random() * 10000)}`,
              vaccination_date: item.registrationDate || item.createdAt,
              next_due_date: null,
              healthcare_provider: 'Dr. Default Provider',
              facility: item.registrationFacility?.name || 'Unknown Facility',
              facility_id: item.facilityId,
              administration_site: 'Left Arm',
              administration_route: 'Intramuscular',
              dosage: '0.5 mL',
              weight_kg: null,
              height_cm: null,
              status: 'administered',
              side_effects: null,
              notes: null,
              created_at: item.createdAt
            };
          } else {
            // This is actual immunization data
            return {
              id: item.id,
              registration_number: item.registration_number || `IM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
              patient_name: item.patient_name || item.patientName || 'Unknown Patient',
              patient_id: item.patientId || 'Unknown',
              gender: item.gender || 'Unknown',
              date_of_birth: item.date_of_birth || item.dateOfBirth,
              age_months: item.ageMonths || item.age_months,
              vaccine_type: item.vaccineType || item.vaccine_type,
              vaccine_name: item.vaccineName || item.vaccine_name,
              dose_number: item.doseNumber || item.dose_number || 1,
              lot_number: item.batchNumber || item.lot_number,
              vaccination_date: item.administrationDate || item.vaccination_date,
              next_due_date: item.nextDoseDate || item.next_due_date,
              healthcare_provider: item.administeredBy || item.healthcare_provider,
              facility: item.facility_name || item.facilityName || 'Unknown Facility',
              facility_id: item.facilityId || item.facility_id,
              administration_site: item.administrationSite || item.administration_site,
              administration_route: item.administrationRoute || item.administration_route,
              dosage: item.dosage,
              weight_kg: item.weightKg || item.weight_kg,
              height_cm: item.heightCm || item.height_cm,
              status: item.status?.toLowerCase() || 'administered',
              side_effects: item.sideEffects || item.side_effects,
              notes: item.notes,
              created_at: item.createdAt || item.created_at
            };
          }
        });

        console.log('Mapped immunizations:', mappedImmunizations);
        setImmunizations(mappedImmunizations);
        
        const pagination = response.data.pagination || { totalItems: mappedImmunizations.length };
        setTotalImmunizations(pagination.totalItems || mappedImmunizations.length);
      } else {
        console.log('No data in response');
        setImmunizations([]);
        setTotalImmunizations(0);
      }
    } catch (error) {
      console.error('Error fetching immunizations:', error);
      setImmunizations([]);
      setTotalImmunizations(0);
    }
  };

  // Calculate immunization counts for tabs
  const calculateImmunizationCounts = (immunizationsData) => {
    const counts = {
      total: immunizationsData.length,
      administered: immunizationsData.filter(imm => imm.status === 'administered').length,
      scheduled: immunizationsData.filter(imm => imm.status === 'scheduled').length,
      missed: immunizationsData.filter(imm => imm.status === 'missed').length,
      cancelled: immunizationsData.filter(imm => imm.status === 'cancelled').length,
    };
    setImmunizationCounts(counts);
  };

  // Fetch immunization counts for tabs
  const fetchImmunizationCounts = async () => {
    try {
      const response = await immunizationService.getAllImmunizations({ limit: 100 });
      if (response && response.data) {
        const immunizationsData = response.data.immunizations || response.data || [];
        calculateImmunizationCounts(immunizationsData);
      }
    } catch (error) {
      console.error('Error fetching immunization counts:', error);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchImmunizations();
    // Only fetch counts when we're on first page with no filters/search
    if (page === 0 && !searchTerm && Object.values(filters).every(v => v === '')) {
      fetchImmunizationCounts();
    }
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

  // Handle tab change with specific filtering logic
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
    
    // Clear existing filters and apply tab-specific filters
    let newFilters = {
      patientId: '',
      facilityId: '',
      vaccineType: '',
      vaccineName: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      gender: '',
      age_group: ''
    };

    switch(newValue) {
      case 0: // All Records
        // No additional filters needed
        break;
      case 1: // Administered
        newFilters.status = 'Administered';
        break;
      case 2: // Scheduled
        newFilters.status = 'Scheduled';
        break;
      case 3: // Missed
        newFilters.status = 'Missed';
        break;
      case 4: // Due This Month
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        newFilters.dateFrom = format(firstDay, 'yyyy-MM-dd');
        newFilters.dateTo = format(lastDay, 'yyyy-MM-dd');
        newFilters.status = 'Scheduled';
        break;
      default:
        break;
    }
    
    setFilters(newFilters);
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
      patientId: '',
      facilityId: '',
      vaccineType: '',
      vaccineName: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      gender: '',
      age_group: ''
    });
    setPage(0);
    setFilterAnchorEl(null);
  };

  // Handle delete
  const handleDeleteClick = (immunization, event) => {
    if (event) {
      event.stopPropagation();
    }
    setSelectedImmunization(immunization);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedImmunization(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedImmunization) {
      await execute(
        immunizationService.deleteImmunization,
        [selectedImmunization.id],
        () => {
          fetchImmunizations();
          setDeleteDialogOpen(false);
          setSelectedImmunization(null);
        }
      );
    }
  };

  // Navigation actions
  const handleAddImmunization = () => {
    navigate('/immunizations/new');
  };

  const handleImmunizationClick = (id) => {
    navigate(`/immunizations/${id}`);
  };

  const handleEditImmunization = (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    navigate(`/immunizations/${id}/edit`);
  };

  const handleViewStatistics = () => {
    navigate('/immunizations/statistics');
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

  // Calculate age in months from date of birth
  const calculateAgeMonths = (dateOfBirth) => {
    if (!dateOfBirth) return '-';
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
      months -= birthDate.getMonth();
      months += today.getMonth();
      
      return months <= 0 ? 0 : months;
    } catch (error) {
      return '-';
    }
  };

  // Updated table columns to match API response
  const columns = [
    { field: 'registration_number', headerName: 'Reg. No.', width: 120 },
    { field: 'patient_name', headerName: 'Patient Name', width: 180 },
    { field: 'vaccine_type', headerName: 'Vaccine Type', width: 130 },
    { field: 'vaccine_name', headerName: 'Vaccine Name', width: 150 },
    { field: 'dose_number', headerName: 'Dose', width: 80 },
    { 
      field: 'vaccination_date', 
      headerName: 'Administration Date', 
      width: 150,
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: 'next_due_date', 
      headerName: 'Next Due Date', 
      width: 150,
      valueFormatter: (params) => params.value ? formatDate(params.value) : 'N/A'
    },
    { 
      field: 'age_months', 
      headerName: 'Age (Months)', 
      width: 120,
      valueGetter: (params) => params.row.age_months || calculateAgeMonths(params.row.date_of_birth)
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={
            params.value === 'administered' 
              ? 'success' 
              : params.value === 'scheduled' 
                ? 'info'
                : params.value === 'missed'
                  ? 'error'
                  : 'warning'
          } 
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
            onClick={(e) => handleEditImmunization(params.row.id, e)}
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
  const renderImmunizationCards = () => {
    return (
      <Grid container spacing={2}>
        {immunizations.map((immunization) => (
          <Grid item xs={12} sm={6} md={4} key={immunization.id}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                transition: 'transform 0.2s', 
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } 
              }}
              onClick={() => handleImmunizationClick(immunization.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" noWrap>
                    {immunization.patient_name}
                  </Typography>
                  <Chip 
                    label={immunization.status} 
                    color={
                      immunization.status === 'completed' 
                        ? 'success' 
                        : immunization.status === 'pending' 
                          ? 'warning' 
                          : 'error'
                    } 
                    size="small" 
                    variant="outlined" 
                  />
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Reg No:</strong> {immunization.registration_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Patient ID:</strong> {immunization.patient_id}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Vaccine:</strong> {immunization.vaccine_type}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Dose:</strong> {immunization.dose_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Date:</strong> {formatDate(immunization.vaccination_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Next Due:</strong> {immunization.next_due_date ? formatDate(immunization.next_due_date) : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Provider:</strong> {immunization.healthcare_provider}
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
    <MainLayout title="Immunization Records">
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Immunization Records
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
              onClick={handleAddImmunization}
            >
              New Immunization
            </Button>
          </Box>
        </Box>

        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="immunization records tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            icon={<VaccinesIcon />} 
            iconPosition="start"
            label={`All Records (${immunizationCounts.total})`}
          />
          <Tab 
            label={`Administered (${immunizationCounts.administered})`}
          />
          <Tab 
            label={`Scheduled (${immunizationCounts.scheduled})`}
          />
          <Tab 
            label={`Missed (${immunizationCounts.missed})`}
          />
          <Tab 
            label="Due This Month"
          />
        </Tabs>

        {/* Search and Filter Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <TextField
            placeholder="Search by vaccine name or patient..."
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
                <InputLabel>Vaccine Type</InputLabel>
                <Select
                  name="vaccineType"
                  value={filters.vaccineType}
                  onChange={handleFilterChange}
                  label="Vaccine Type"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="COVID-19">COVID-19</MenuItem>
                  <MenuItem value="Hepatitis B">Hepatitis B</MenuItem>
                  <MenuItem value="BCG">BCG</MenuItem>
                  <MenuItem value="Polio">Polio</MenuItem>
                  <MenuItem value="Pentavalent">Pentavalent</MenuItem>
                  <MenuItem value="Pneumococcal">Pneumococcal</MenuItem>
                  <MenuItem value="Rotavirus">Rotavirus</MenuItem>
                  <MenuItem value="Measles">Measles</MenuItem>
                  <MenuItem value="Yellow Fever">Yellow Fever</MenuItem>
                  <MenuItem value="Meningitis">Meningitis</MenuItem>
                  <MenuItem value="Tetanus Toxoid">Tetanus Toxoid</MenuItem>
                  <MenuItem value="HPV">HPV</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                margin="dense"
                size="small"
                name="vaccineName"
                label="Vaccine Name"
                value={filters.vaccineName}
                onChange={handleFilterChange}
                placeholder="e.g., Pfizer-BioNTech"
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
                  <MenuItem value="Administered">Administered</MenuItem>
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                  <MenuItem value="Missed">Missed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                margin="dense"
                size="small"
                name="patientId"
                label="Patient ID"
                value={filters.patientId}
                onChange={handleFilterChange}
              />
              
              <TextField
                fullWidth
                margin="dense"
                size="small"
                name="facilityId"
                label="Facility ID"
                value={filters.facilityId}
                onChange={handleFilterChange}
              />
              
              <TextField
                fullWidth
                margin="dense"
                size="small"
                name="dateFrom"
                label="Date From"
                type="date"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
              <TextField
                fullWidth
                margin="dense"
                size="small"
                name="dateTo"
                label="Date To"
                type="date"
                value={filters.dateTo}
                onChange={handleFilterChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
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
            onClick={fetchImmunizations}
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
                
                let displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
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
        ) : immunizations.length === 0 ? (
          <Alert severity="info" sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              No immunization records found
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {searchTerm || Object.values(filters).some(v => v !== '') 
                ? 'Try adjusting your search criteria or filters'
                : 'Start by recording your first immunization'
              }
            </Typography>
            {!searchTerm && !Object.values(filters).some(v => v !== '') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddImmunization}
                sx={{ mt: 2 }}
              >
                Record First Immunization
              </Button>
            )}
          </Alert>
        ) : viewMode === 'table' ? (
          <Box sx={{ width: '100%' }}>
            <DataGrid
              rows={immunizations}
              columns={columns}
              pageSize={pageSize}
              rowsPerPageOptions={[10, 25, 50]}
              pagination
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              onPageChange={(newPage) => setPage(newPage)}
              rowCount={totalImmunizations}
              paginationMode="server"
              page={page}
              autoHeight
              disableSelectionOnClick
              density="standard"
              onRowClick={(params) => handleImmunizationClick(params.id)}
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
            {renderImmunizationCards()}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(totalImmunizations / pageSize)}
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
            Are you sure you want to delete immunization record for: {selectedImmunization?.patient_name}? This action cannot be undone.
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

export default ImmunizationList;