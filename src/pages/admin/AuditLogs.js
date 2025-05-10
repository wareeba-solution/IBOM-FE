// src/pages/admin/AuditLogs.js
import React, { useState, useEffect } from 'react';
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
  Alert,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Tooltip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Info as InfoIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  Description as DescriptionIcon,
  ToggleOn as ToggleOnIcon,
} from '@mui/icons-material';
import { format, parseISO, subDays } from 'date-fns';
import { useApi } from '../../hooks/useApi';

// Mock audit log service - replace with actual service when available
const auditLogService = {
  getAuditLogs: async (params) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredLogs = [...mockAuditLogs];
        
        // Apply search filter
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filteredLogs = filteredLogs.filter(log => 
            log.user.name.toLowerCase().includes(searchLower) || 
            log.action.toLowerCase().includes(searchLower) || 
            log.details.toLowerCase().includes(searchLower) ||
            log.module.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply module filter
        if (params.module && params.module !== 'all') {
          filteredLogs = filteredLogs.filter(log => log.module === params.module);
        }
        
        // Apply action type filter
        if (params.actionType && params.actionType !== 'all') {
          filteredLogs = filteredLogs.filter(log => log.actionType === params.actionType);
        }
        
        // Apply user filter
        if (params.user && params.user !== 'all') {
          filteredLogs = filteredLogs.filter(log => log.user.id === parseInt(params.user));
        }
        
        // Apply date range filter
        if (params.startDate) {
          const startDate = new Date(params.startDate);
          filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
        }
        
        if (params.endDate) {
          const endDate = new Date(params.endDate);
          endDate.setHours(23, 59, 59, 999);
          filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
        }
        
        // Sort by timestamp (descending)
        filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Apply pagination
        const page = params.page || 0;
        const pageSize = params.pageSize || 10;
        const startIndex = page * pageSize;
        const paginatedLogs = filteredLogs.slice(startIndex, startIndex + pageSize);
        
        resolve({
          data: paginatedLogs,
          total: filteredLogs.length
        });
      }, 500);
    });
  },
  
  getAuditLogById: async (id) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const log = mockAuditLogs.find(l => l.id === id);
        if (log) {
          resolve(log);
        } else {
          reject(new Error('Audit log not found'));
        }
      }, 300);
    });
  },
  
  exportAuditLogs: async (params) => {
    // Simulate API call for exporting logs
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  },
  
  clearAuditLogs: async (olderThan) => {
    // Simulate API call for clearing old logs
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate removing logs older than the specified date
        const cutoffDate = new Date(olderThan);
        const initialCount = mockAuditLogs.length;
        
        // Filter out logs that are older than the cutoff date
        const remainingLogs = mockAuditLogs.filter(log => 
          new Date(log.timestamp) >= cutoffDate
        );
        
        // Update the mock data
        mockAuditLogs.length = 0;
        mockAuditLogs.push(...remainingLogs);
        
        const removedCount = initialCount - remainingLogs.length;
        
        resolve({ 
          success: true,
          message: `Successfully cleared ${removedCount} audit logs older than ${format(cutoffDate, 'MMM dd, yyyy')}`,
          removedCount
        });
      }, 1000);
    });
  }
};

// Mock audit logs data
const mockAuditLogs = [
  {
    id: 1,
    timestamp: '2023-05-31T08:15:30Z',
    user: { id: 1, name: 'Admin User', username: 'admin' },
    ip: '192.168.1.100',
    module: 'User Management',
    action: 'User Created',
    actionType: 'CREATE',
    details: 'Created new user: Patricia Thomas (pthomas)',
    metaData: {
      userId: 11,
      username: 'pthomas',
      email: 'patricia.thomas@akwaibomhealth.gov.ng',
      role: 'doctor',
      facility: 'Ikot Ekpene Health Center'
    }
  },
  {
    id: 2,
    timestamp: '2023-05-31T09:30:45Z',
    user: { id: 1, name: 'Admin User', username: 'admin' },
    ip: '192.168.1.100',
    module: 'Patient Management',
    action: 'Patient Updated',
    actionType: 'UPDATE',
    details: 'Updated patient: John Doe (ID: 1234)',
    metaData: {
      patientId: 1234,
      updatedFields: ['address', 'phoneNumber'],
      previousValues: {
        address: '123 Main St, Uyo',
        phoneNumber: '07012345678'
      },
      newValues: {
        address: '456 First Ave, Uyo',
        phoneNumber: '07087654321'
      }
    }
  },
  {
    id: 3,
    timestamp: '2023-05-31T10:45:15Z',
    user: { id: 2, name: 'Dr. John Smith', username: 'jsmith' },
    ip: '192.168.1.101',
    module: 'Immunization',
    action: 'Vaccination Recorded',
    actionType: 'CREATE',
    details: 'Recorded vaccination for patient: Sarah Johnson (ID: 2345)',
    metaData: {
      patientId: 2345,
      vaccineName: 'Polio Vaccine',
      vaccineType: 'OPV',
      doseNumber: 2,
      batchNumber: 'PV-2023-05-001'
    }
  },
  {
    id: 4,
    timestamp: '2023-05-31T11:20:30Z',
    user: { id: 3, name: 'Mary Johnson', username: 'mjohnson' },
    ip: '192.168.1.102',
    module: 'Birth Records',
    action: 'Birth Record Created',
    actionType: 'CREATE',
    details: 'Created birth record: Baby Girl Essien',
    metaData: {
      recordId: 5678,
      motherName: 'Ekaette Essien',
      fatherName: 'Okon Essien',
      dateOfBirth: '2023-05-31T07:45:00Z',
      weight: '3.2kg',
      facility: 'Uyo General Hospital'
    }
  },
  {
    id: 5,
    timestamp: '2023-05-31T12:10:45Z',
    user: { id: 4, name: 'David Williams', username: 'dwilliams' },
    ip: '192.168.1.103',
    module: 'System Settings',
    action: 'System Setting Updated',
    actionType: 'UPDATE',
    details: 'Updated system settings: Email Configuration',
    metaData: {
      category: 'Email Settings',
      updatedFields: ['smtpServer', 'smtpPort', 'senderEmail'],
      previousValues: {
        smtpServer: 'mail.old-server.com',
        smtpPort: 587,
        senderEmail: 'noreply@old-domain.com'
      },
      newValues: {
        smtpServer: 'mail.akwaibomhealth.gov.ng',
        smtpPort: 587,
        senderEmail: 'noreply@akwaibomhealth.gov.ng'
      }
    }
  },
  {
    id: 6,
    timestamp: '2023-05-31T13:30:15Z',
    user: { id: 5, name: 'Dr. Sarah Brown', username: 'sbrown' },
    ip: '192.168.1.104',
    module: 'Death Records',
    action: 'Death Record Created',
    actionType: 'CREATE',
    details: 'Created death record: Elder Effiong Akpan',
    metaData: {
      recordId: 6789,
      deceasedName: 'Effiong Akpan',
      dateOfDeath: '2023-05-30T18:20:00Z',
      causeOfDeath: 'Natural causes',
      age: 89,
      facility: 'Eket General Hospital'
    }
  },
  {
    id: 7,
    timestamp: '2023-05-31T14:25:30Z',
    user: { id: 1, name: 'Admin User', username: 'admin' },
    ip: '192.168.1.100',
    module: 'User Management',
    action: 'User Permission Updated',
    actionType: 'UPDATE',
    details: 'Updated permissions for user: Mary Johnson (mjohnson)',
    metaData: {
      userId: 3,
      username: 'mjohnson',
      previousRole: 'staff',
      newRole: 'supervisor',
      changedBy: 'admin'
    }
  },
  {
    id: 8,
    timestamp: '2023-05-31T15:40:45Z',
    user: { id: 6, name: 'Michael Davis', username: 'mdavis' },
    ip: '192.168.1.105',
    module: 'Antenatal Care',
    action: 'Antenatal Visit Recorded',
    actionType: 'CREATE',
    details: 'Recorded antenatal visit for patient: Grace Udoh (ID: 3456)',
    metaData: {
      patientId: 3456,
      visitNumber: 3,
      gestationalAge: '28 weeks',
      bloodPressure: '120/80',
      weight: '68kg',
      nextAppointment: '2023-06-14T10:00:00Z'
    }
  },
  {
    id: 9,
    timestamp: '2023-05-31T16:15:30Z',
    user: { id: 2, name: 'Dr. John Smith', username: 'jsmith' },
    ip: '192.168.1.101',
    module: 'Communicable Diseases',
    action: 'Disease Case Reported',
    actionType: 'CREATE',
    details: 'Reported new case: Malaria - Patient ID: 4567',
    metaData: {
      patientId: 4567,
      disease: 'Malaria',
      symptoms: ['fever', 'headache', 'chills'],
      diagnosisDate: '2023-05-31T15:30:00Z',
      severity: 'Moderate',
      treatment: 'Artemisinin-based combination therapy'
    }
  },
  {
    id: 10,
    timestamp: '2023-05-31T17:20:45Z',
    user: { id: 7, name: 'Jennifer Wilson', username: 'jwilson' },
    ip: '192.168.1.106',
    module: 'Family Planning',
    action: 'Counseling Session Recorded',
    actionType: 'CREATE',
    details: 'Recorded family planning counseling for patient: Blessing Udo (ID: 5678)',
    metaData: {
      patientId: 5678,
      sessionType: 'Initial Counseling',
      methodsDiscussed: ['Oral Contraceptives', 'Injectables', 'Implants'],
      methodChosen: 'Implants',
      followUpDate: '2023-06-30T11:00:00Z'
    }
  },
  {
    id: 11,
    timestamp: '2023-05-30T09:10:15Z',
    user: { id: 1, name: 'Admin User', username: 'admin' },
    ip: '192.168.1.100',
    module: 'Facility Management',
    action: 'Facility Added',
    actionType: 'CREATE',
    details: 'Added new facility: Ibiono Primary Health Center',
    metaData: {
      facilityId: 8,
      facilityName: 'Ibiono Primary Health Center',
      facilityType: 'Primary Health Center',
      location: 'Ibiono Ibom LGA',
      capacity: 25,
      services: ['General Care', 'Maternal Care', 'Immunization']
    }
  },
  {
    id: 12,
    timestamp: '2023-05-30T10:45:30Z',
    user: { id: 4, name: 'David Williams', username: 'dwilliams' },
    ip: '192.168.1.103',
    module: 'Reports',
    action: 'Report Generated',
    actionType: 'READ',
    details: 'Generated Immunization Coverage Report',
    metaData: {
      reportType: 'Immunization Coverage',
      period: 'Q1 2023',
      format: 'PDF',
      filters: {
        startDate: '2023-01-01',
        endDate: '2023-03-31',
        facilities: ['All'],
        vaccines: ['All']
      }
    }
  },
  {
    id: 13,
    timestamp: '2023-05-30T11:55:45Z',
    user: { id: 1, name: 'Admin User', username: 'admin' },
    ip: '192.168.1.100',
    module: 'User Management',
    action: 'User Deactivated',
    actionType: 'UPDATE',
    details: 'Deactivated user: Robert Taylor (rtaylor)',
    metaData: {
      userId: 8,
      username: 'rtaylor',
      previousStatus: 'Active',
      newStatus: 'Inactive',
      reason: 'Extended leave of absence',
      deactivatedBy: 'admin'
    }
  },
  {
    id: 14,
    timestamp: '2023-05-30T13:25:15Z',
    user: { id: 3, name: 'Mary Johnson', username: 'mjohnson' },
    ip: '192.168.1.102',
    module: 'Patient Management',
    action: 'Patient Merged',
    actionType: 'UPDATE',
    details: 'Merged duplicate patient records: IDs 6789 and 6790',
    metaData: {
      primaryPatientId: 6789,
      secondaryPatientId: 6790,
      mergedFields: ['contactInfo', 'medicalHistory', 'visits'],
      resultingPatientId: 6789
    }
  },
  {
    id: 15,
    timestamp: '2023-05-30T14:50:30Z',
    user: { id: 9, name: 'Dr. Elizabeth Moore', username: 'emoore' },
    ip: '192.168.1.108',
    module: 'Immunization',
    action: 'Vaccine Inventory Updated',
    actionType: 'UPDATE',
    details: 'Updated vaccine inventory: Received new stock of Pentavalent Vaccine',
    metaData: {
      vaccineType: 'Pentavalent Vaccine',
      previousQuantity: 150,
      addedQuantity: 300,
      newQuantity: 450,
      batchNumber: 'PV-2023-05-002',
      expiryDate: '2024-05-30'
    }
  },
  {
    id: 16,
    timestamp: '2023-05-30T15:35:45Z',
    user: { id: 1, name: 'Admin User', username: 'admin' },
    ip: '192.168.1.100',
    module: 'System Settings',
    action: 'Backup Completed',
    actionType: 'SYSTEM',
    details: 'System database backup completed successfully',
    metaData: {
      backupId: 'BKP-2023-05-30-1535',
      backupSize: '2.8 GB',
      backupLocation: 'gs://akwaibom-health-backups/',
      backupType: 'Full',
      duration: '15 minutes'
    }
  },
  {
    id: 17,
    timestamp: '2023-05-30T16:20:15Z',
    user: { id: 12, name: 'Charles Jackson', username: 'cjackson' },
    ip: '192.168.1.111',
    module: 'Facility Management',
    action: 'Facility Updated',
    actionType: 'UPDATE',
    details: 'Updated facility information: Uyo General Hospital',
    metaData: {
      facilityId: 1,
      updatedFields: ['contactInfo', 'services', 'capacity'],
      previousValues: {
        contactInfo: {
          phone: '08012345678',
          email: 'info@uyogeneral.org'
        },
        services: ['General Care', 'Surgery', 'Pediatrics', 'Obstetrics'],
        capacity: 200
      },
      newValues: {
        contactInfo: {
          phone: '08087654321',
          email: 'contact@uyogeneral.org'
        },
        services: ['General Care', 'Surgery', 'Pediatrics', 'Obstetrics', 'Cardiology', 'Neurology'],
        capacity: 250
      }
    }
  },
  {
    id: 18,
    timestamp: '2023-05-30T17:05:30Z',
    user: { id: 1, name: 'Admin User', username: 'admin' },
    ip: '192.168.1.100',
    module: 'User Management',
    action: 'User Login Failed',
    actionType: 'SECURITY',
    details: 'Failed login attempt for user: admin',
    metaData: {
      username: 'admin',
      failureReason: 'Invalid password',
      attemptNumber: 1,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  {
    id: 19,
    timestamp: '2023-05-30T17:10:45Z',
    user: { id: 1, name: 'Admin User', username: 'admin' },
    ip: '192.168.1.100',
    module: 'User Management',
    action: 'User Login Successful',
    actionType: 'SECURITY',
    details: 'Successful login: admin',
    metaData: {
      username: 'admin',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess-2023-05-30-1710-admin'
    }
  },
  {
    id: 20,
    timestamp: '2023-05-30T18:30:15Z',
    user: { id: 2, name: 'Dr. John Smith', username: 'jsmith' },
    ip: '192.168.1.101',
    module: 'Reports',
    action: 'Data Exported',
    actionType: 'READ',
    details: 'Exported patient records for research purposes',
    metaData: {
      exportType: 'Anonymized Patient Data',
      recordCount: 150,
      format: 'CSV',
      purpose: 'Research on maternal health outcomes',
      filters: {
        startDate: '2022-01-01',
        endDate: '2022-12-31',
        dataPoints: ['age', 'visits', 'diagnoses', 'treatments']
      }
    }
  }
];

// Mock modules for filtering
const mockModules = [
  'User Management',
  'Patient Management',
  'Birth Records',
  'Death Records',
  'Immunization',
  'Antenatal Care',
  'Communicable Diseases',
  'Family Planning',
  'Facility Management',
  'Reports',
  'System Settings'
];

// Mock action types for filtering
const mockActionTypes = [
  { value: 'CREATE', label: 'Create', color: 'success' },
  { value: 'READ', label: 'Read', color: 'info' },
  { value: 'UPDATE', label: 'Update', color: 'primary' },
  { value: 'DELETE', label: 'Delete', color: 'error' },
  { value: 'SECURITY', label: 'Security', color: 'warning' },
  { value: 'SYSTEM', label: 'System', color: 'secondary' }
];

// Mock users for filtering
const mockUsers = [
  { id: 1, name: 'Admin User' },
  { id: 2, name: 'Dr. John Smith' },
  { id: 3, name: 'Mary Johnson' },
  { id: 4, name: 'David Williams' },
  { id: 5, name: 'Dr. Sarah Brown' },
  { id: 6, name: 'Michael Davis' },
  { id: 7, name: 'Jennifer Wilson' },
  { id: 8, name: 'Robert Taylor' },
  { id: 9, name: 'Dr. Elizabeth Moore' },
  { id: 10, name: 'William Anderson' },
  { id: 11, name: 'Dr. Patricia Thomas' },
  { id: 12, name: 'Charles Jackson' }
];

// AuditLogs Component
const AuditLogs = () => {
  const { loading, error, execute } = useApi();

  // State
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    module: '',
    actionType: '',
    user: '',
    startDate: '',
    endDate: ''
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearPeriod, setClearPeriod] = useState('30');
  const [actionSuccess, setActionSuccess] = useState('');

  // Fetch audit logs
  const fetchLogs = async () => {
    const queryParams = {
      page,
      pageSize,
      search: searchTerm,
      ...filters
    };

    await execute(
      auditLogService.getAuditLogs,
      [queryParams],
      (response) => {
        setLogs(response.data);
        setTotalLogs(response.total);
      }
    );
  };

  // Initial data loading
  useEffect(() => {
    fetchLogs();
  }, [page, pageSize]);

  // Apply search and filters
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchLogs();
  };

  // Handle search term change
  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    if (searchTerm) {
      setPage(0);
      setTimeout(fetchLogs, 0);
    }
  };

  // Handle filter menu open
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  // Handle filter menu close
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
  };

  // Apply filters
  const handleApplyFilters = () => {
    setPage(0);
    fetchLogs();
    handleFilterClose();
  };

 // Reset filters
 const handleResetFilters = () => {
  setFilters({
    module: '',
    actionType: '',
    user: '',
    startDate: '',
    endDate: ''
  });
  setPage(0);
  // Don't close the menu here, let user see filters were reset
};

// Handle pagination change
const handleChangePage = (event, newPage) => {
  setPage(newPage);
};

// Handle rows per page change
const handleChangeRowsPerPage = (event) => {
  setPageSize(parseInt(event.target.value, 10));
  setPage(0);
};

// View log details
const handleViewDetails = async (logId) => {
  try {
    const log = await auditLogService.getAuditLogById(logId);
    setSelectedLog(log);
    setDetailDialogOpen(true);
  } catch (error) {
    console.error('Error fetching log details:', error);
  }
};

// Handle export logs
const handleExportLogs = async () => {
  const exportParams = {
    search: searchTerm,
    ...filters
  };

  await execute(
    auditLogService.exportAuditLogs,
    [exportParams],
    () => {
      setActionSuccess('Audit logs exported successfully. Download should start automatically.');
      setTimeout(() => setActionSuccess(''), 5000);
    }
  );
};

// Open clear logs dialog
const handleClearLogsClick = () => {
  setClearDialogOpen(true);
};

// Handle clear period change
const handleClearPeriodChange = (event) => {
  setClearPeriod(event.target.value);
};

// Handle clear logs
const handleClearLogsConfirm = async () => {
  const days = parseInt(clearPeriod, 10);
  const olderThan = subDays(new Date(), days).toISOString();

  await execute(
    auditLogService.clearAuditLogs,
    [olderThan],
    (response) => {
      setClearDialogOpen(false);
      setActionSuccess(response.message);
      setTimeout(() => setActionSuccess(''), 5000);
      fetchLogs();
    }
  );
};

// Format date
const formatDate = (dateString) => {
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy HH:mm:ss');
  } catch (error) {
    return dateString;
  }
};

// Get action type chip
const getActionTypeChip = (actionType) => {
  const type = mockActionTypes.find(t => t.value === actionType) || { label: actionType, color: 'default' };
  
  return (
    <Chip
      label={type.label}
      color={type.color}
      size="small"
      variant="outlined"
    />
  );
};

return (
  <Paper sx={{ p: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h5">System Audit Logs</Typography>
      <Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportLogs}
          sx={{ mr: 1 }}
        >
          Export Logs
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleClearLogsClick}
        >
          Clear Old Logs
        </Button>
      </Box>
    </Box>
    
    {actionSuccess && (
      <Alert 
        severity="success" 
        onClose={() => setActionSuccess('')}
        sx={{ mb: 2 }}
      >
        {actionSuccess}
      </Alert>
    )}
    
    {error && (
      <Alert 
        severity="error" 
        onClose={() => execute(null)}
        sx={{ mb: 2 }}
      >
        {error}
      </Alert>
    )}
    
    <Box sx={{ display: 'flex', mb: 2 }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', flexGrow: 1 }}>
        <TextField
          placeholder="Search by user, action, details..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={handleSearchTermChange}
          sx={{ maxWidth: 500 }}
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
          type="submit" 
          variant="contained" 
          sx={{ ml: 1 }}
        >
          Search
        </Button>
      </form>
      
      <Box sx={{ display: 'flex', ml: 2 }}>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={handleFilterClick}
          color={Object.values(filters).some(v => v !== '') ? "primary" : "inherit"}
        >
          Filter
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchLogs}
          sx={{ ml: 1 }}
        >
          Refresh
        </Button>
      </Box>
      
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          style: {
            width: 300,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Filter Audit Logs
          </Typography>
          
          <FormControl fullWidth margin="dense" size="small">
            <InputLabel id="module-label">Module</InputLabel>
            <Select
              labelId="module-label"
              name="module"
              value={filters.module}
              onChange={handleFilterChange}
              label="Module"
            >
              <MenuItem value="">All Modules</MenuItem>
              {mockModules.map((module) => (
                <MenuItem key={module} value={module}>{module}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="dense" size="small">
            <InputLabel id="action-type-label">Action Type</InputLabel>
            <Select
              labelId="action-type-label"
              name="actionType"
              value={filters.actionType}
              onChange={handleFilterChange}
              label="Action Type"
            >
              <MenuItem value="">All Actions</MenuItem>
              {mockActionTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      label={type.label}
                      color={type.color}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    {type.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="dense" size="small">
            <InputLabel id="user-label">User</InputLabel>
            <Select
              labelId="user-label"
              name="user"
              value={filters.user}
              onChange={handleFilterChange}
              label="User"
            >
              <MenuItem value="">All Users</MenuItem>
              {mockUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Date Range
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="From"
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="To"
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleResetFilters} size="small">
              Reset Filters
            </Button>
            <Button 
              onClick={handleApplyFilters} 
              variant="contained" 
              size="small" 
              sx={{ ml: 1 }}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Menu>
    </Box>
    
    {loading && !logs.length ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    ) : (
      <>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Details</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(log.timestamp)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {log.user.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{log.module}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    {getActionTypeChip(log.actionType)}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {log.details}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(log.id)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={totalLogs}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
        
        {logs.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body1" color="text.secondary">
              No audit logs found.
            </Typography>
          </Box>
        )}
      </>
    )}
    
    {/* Log Details Dialog */}
    <Dialog
      open={detailDialogOpen}
      onClose={() => setDetailDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InfoIcon sx={{ mr: 1 }} />
          Audit Log Details
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {selectedLog && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="subtitle2">Timestamp:</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                        {formatDate(selectedLog.timestamp)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="subtitle2">User:</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                        {selectedLog.user.name} ({selectedLog.user.username})
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ComputerIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="subtitle2">IP Address:</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                        {selectedLog.ip}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ToggleOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="subtitle2">Action Type:</Typography>
                      </Box>
                      <Box sx={{ ml: 3 }}>
                        {getActionTypeChip(selectedLog.actionType)}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Action Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight="medium">Module:</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedLog.module}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight="medium">Action:</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedLog.action}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" fontWeight="medium">Details:</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedLog.details}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DescriptionIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="subtitle2">Metadata</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                      {JSON.stringify(selectedLog.metaData, null, 2)}
                    </pre>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
    
    {/* Clear Logs Dialog */}
    <Dialog
      open={clearDialogOpen}
      onClose={() => setClearDialogOpen(false)}
    >
      <DialogTitle>Clear Old Audit Logs</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" paragraph>
            This action will permanently delete audit logs older than the selected period.
            This operation cannot be undone.
          </Typography>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="clear-period-label">Delete logs older than</InputLabel>
            <Select
              labelId="clear-period-label"
              value={clearPeriod}
              onChange={handleClearPeriodChange}
              label="Delete logs older than"
            >
              <MenuItem value="30">30 days</MenuItem>
              <MenuItem value="60">60 days</MenuItem>
              <MenuItem value="90">3 months</MenuItem>
              <MenuItem value="180">6 months</MenuItem>
              <MenuItem value="365">1 year</MenuItem>
            </Select>
          </FormControl>
          
          <Alert severity="warning" sx={{ mt: 2 }}>
            Note: Regulatory compliance may require retention of audit logs for a specific period.
            Please ensure this action complies with your organization's data retention policies.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleClearLogsConfirm} color="error" variant="contained">
          Clear Logs
        </Button>
      </DialogActions>
    </Dialog>
  </Paper>
);
};

export default AuditLogs;