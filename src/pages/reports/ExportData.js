// src/pages/reports/ExportData.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  FormHelperText,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Tooltip,
  Link,
  LinearProgress,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  DatePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  CloudDownload as CloudDownloadIcon,
  FileCopy as FileCopyIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Backup as BackupIcon,
  DateRange as DateRangeIcon,
  FilterList as FilterListIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  TableChart as TableChartIcon,
  ArrowForward as ArrowForwardIcon,
  CloudQueue as CloudQueueIcon,
  Info as InfoIcon,
  PictureAsPdf as PictureAsPdfIcon,
  InsertDriveFile as InsertDriveFileIcon,
  SendToMobile as SendToMobileIcon,
  Mail as MailIcon,
  ContentCopy as ContentCopyIcon,
  GetApp as GetAppIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// Mock export service - replace with actual service when available
const exportService = {
  getExportableDatasets: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'births',
            name: 'Birth Records',
            description: 'Export birth records and statistics',
            availableFormats: ['csv', 'excel', 'pdf', 'json'],
            fields: [
              { id: 'record_id', name: 'Record ID', type: 'string', required: true },
              { id: 'birth_date', name: 'Birth Date', type: 'date', required: true },
              { id: 'time_of_birth', name: 'Time of Birth', type: 'time', required: false },
              { id: 'child_name', name: 'Child Name', type: 'string', required: true },
              { id: 'gender', name: 'Gender', type: 'string', required: true },
              { id: 'weight', name: 'Birth Weight (kg)', type: 'number', required: true },
              { id: 'mother_name', name: 'Mother\'s Name', type: 'string', required: true },
              { id: 'mother_age', name: 'Mother\'s Age', type: 'number', required: true },
              { id: 'father_name', name: 'Father\'s Name', type: 'string', required: false },
              { id: 'address', name: 'Address', type: 'string', required: true },
              { id: 'lga', name: 'LGA', type: 'string', required: true },
              { id: 'facility', name: 'Facility', type: 'string', required: true },
              { id: 'delivery_type', name: 'Delivery Type', type: 'string', required: true },
              { id: 'complications', name: 'Complications', type: 'string', required: false },
              { id: 'attending_staff', name: 'Attending Staff', type: 'string', required: true },
              { id: 'notes', name: 'Notes', type: 'string', required: false }
            ]
          },
          {
            id: 'deaths',
            name: 'Death Records',
            description: 'Export death records and statistics',
            availableFormats: ['csv', 'excel', 'pdf', 'json'],
            fields: [
              { id: 'record_id', name: 'Record ID', type: 'string', required: true },
              { id: 'death_date', name: 'Date of Death', type: 'date', required: true },
              { id: 'time_of_death', name: 'Time of Death', type: 'time', required: false },
              { id: 'name', name: 'Full Name', type: 'string', required: true },
              { id: 'gender', name: 'Gender', type: 'string', required: true },
              { id: 'age', name: 'Age', type: 'number', required: true },
              { id: 'address', name: 'Address', type: 'string', required: true },
              { id: 'lga', name: 'LGA', type: 'string', required: true },
              { id: 'facility', name: 'Facility', type: 'string', required: true },
              { id: 'cause', name: 'Cause of Death', type: 'string', required: true },
              { id: 'attending_doctor', name: 'Attending Doctor', type: 'string', required: true },
              { id: 'notes', name: 'Notes', type: 'string', required: false }
            ]
          },
          {
            id: 'immunizations',
            name: 'Immunization Records',
            description: 'Export immunization records and coverage data',
            availableFormats: ['csv', 'excel', 'pdf', 'json'],
            fields: [
              { id: 'record_id', name: 'Record ID', type: 'string', required: true },
              { id: 'immunization_date', name: 'Immunization Date', type: 'date', required: true },
              { id: 'patient_id', name: 'Patient ID', type: 'string', required: true },
              { id: 'patient_name', name: 'Patient Name', type: 'string', required: true },
              { id: 'gender', name: 'Gender', type: 'string', required: true },
              { id: 'age', name: 'Age', type: 'number', required: true },
              { id: 'vaccine_type', name: 'Vaccine Type', type: 'string', required: true },
              { id: 'dose_number', name: 'Dose Number', type: 'number', required: true },
              { id: 'batch_number', name: 'Batch Number', type: 'string', required: true },
              { id: 'administered_by', name: 'Administered By', type: 'string', required: true },
              { id: 'facility', name: 'Facility', type: 'string', required: true },
              { id: 'lga', name: 'LGA', type: 'string', required: true },
              { id: 'adverse_events', name: 'Adverse Events', type: 'string', required: false },
              { id: 'notes', name: 'Notes', type: 'string', required: false }
            ]
          },
          {
            id: 'antenatal',
            name: 'Antenatal Care Records',
            description: 'Export antenatal care visit records and maternal health data',
            availableFormats: ['csv', 'excel', 'pdf', 'json'],
            fields: [
              { id: 'record_id', name: 'Record ID', type: 'string', required: true },
              { id: 'visit_date', name: 'Visit Date', type: 'date', required: true },
              { id: 'patient_id', name: 'Patient ID', type: 'string', required: true },
              { id: 'patient_name', name: 'Patient Name', type: 'string', required: true },
              { id: 'age', name: 'Age', type: 'number', required: true },
              { id: 'gestational_age', name: 'Gestational Age (weeks)', type: 'number', required: true },
              { id: 'blood_pressure', name: 'Blood Pressure', type: 'string', required: true },
              { id: 'weight', name: 'Weight (kg)', type: 'number', required: true },
              { id: 'hemoglobin', name: 'Hemoglobin Level', type: 'number', required: false },
              { id: 'visit_number', name: 'Visit Number', type: 'number', required: true },
              { id: 'high_risk', name: 'High Risk Pregnancy', type: 'boolean', required: true },
              { id: 'facility', name: 'Facility', type: 'string', required: true },
              { id: 'lga', name: 'LGA', type: 'string', required: true },
              { id: 'attended_by', name: 'Attended By', type: 'string', required: true },
              { id: 'notes', name: 'Notes', type: 'string', required: false }
            ]
          },
          {
            id: 'diseases',
            name: 'Disease Surveillance Records',
            description: 'Export disease surveillance data and outbreak information',
            availableFormats: ['csv', 'excel', 'pdf', 'json'],
            fields: [
              { id: 'record_id', name: 'Record ID', type: 'string', required: true },
              { id: 'report_date', name: 'Report Date', type: 'date', required: true },
              { id: 'diagnosis_date', name: 'Diagnosis Date', type: 'date', required: true },
              { id: 'patient_id', name: 'Patient ID', type: 'string', required: true },
              { id: 'patient_name', name: 'Patient Name', type: 'string', required: true },
              { id: 'gender', name: 'Gender', type: 'string', required: true },
              { id: 'age', name: 'Age', type: 'number', required: true },
              { id: 'disease_type', name: 'Disease Type', type: 'string', required: true },
              { id: 'severity', name: 'Severity', type: 'string', required: true },
              { id: 'symptoms', name: 'Symptoms', type: 'string', required: true },
              { id: 'treatment', name: 'Treatment', type: 'string', required: false },
              { id: 'outcome', name: 'Outcome', type: 'string', required: false },
              { id: 'facility', name: 'Facility', type: 'string', required: true },
              { id: 'lga', name: 'LGA', type: 'string', required: true },
              { id: 'notes', name: 'Notes', type: 'string', required: false }
            ]
          },
          {
            id: 'family_planning',
            name: 'Family Planning Records',
            description: 'Export family planning consultation and method data',
            availableFormats: ['csv', 'excel', 'pdf', 'json'],
            fields: [
              { id: 'record_id', name: 'Record ID', type: 'string', required: true },
              { id: 'consultation_date', name: 'Consultation Date', type: 'date', required: true },
              { id: 'patient_id', name: 'Patient ID', type: 'string', required: true },
              { id: 'patient_name', name: 'Patient Name', type: 'string', required: true },
              { id: 'age', name: 'Age', type: 'number', required: true },
              { id: 'method', name: 'Method', type: 'string', required: true },
              { id: 'is_new_acceptor', name: 'New Acceptor', type: 'boolean', required: true },
              { id: 'previous_method', name: 'Previous Method', type: 'string', required: false },
              { id: 'counselled_by', name: 'Counselled By', type: 'string', required: true },
              { id: 'facility', name: 'Facility', type: 'string', required: true },
              { id: 'lga', name: 'LGA', type: 'string', required: true },
              { id: 'follow_up_date', name: 'Follow-up Date', type: 'date', required: false },
              { id: 'notes', name: 'Notes', type: 'string', required: false }
            ]
          }
        ]);
      }, 500);
    });
  },
  getExportFormats: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'csv', name: 'CSV', description: 'Comma Separated Values file', icon: 'InsertDriveFileIcon' },
          { id: 'excel', name: 'Excel', description: 'Microsoft Excel spreadsheet', icon: 'TableChartIcon' },
          { id: 'pdf', name: 'PDF', description: 'Portable Document Format', icon: 'PictureAsPdfIcon' },
          { id: 'json', name: 'JSON', description: 'JavaScript Object Notation', icon: 'ContentCopyIcon' }
        ]);
      }, 300);
    });
  },
  getExportEstimate: async (params) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate random count based on dataset
        const counts = {
          'births': Math.floor(Math.random() * 1000) + 500,
          'deaths': Math.floor(Math.random() * 500) + 100,
          'immunizations': Math.floor(Math.random() * 2000) + 1000,
          'antenatal': Math.floor(Math.random() * 1000) + 500,
          'diseases': Math.floor(Math.random() * 800) + 300,
          'family_planning': Math.floor(Math.random() * 700) + 200
        };
        
        resolve({
          recordCount: counts[params.datasetId] || 0,
          estimatedSize: `${(counts[params.datasetId] / 100).toFixed(1)} MB`,
          timeEstimate: `${Math.floor(Math.random() * 20) + 5} seconds`
        });
      }, 600);
    });
  },
  requestExport: async (params) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          exportId: `export-${Date.now()}`,
          status: 'processing',
          message: 'Export request has been submitted and is being processed',
          estimatedCompletionTime: '30 seconds'
        });
      }, 800);
    });
  },
  getExportStatus: async (exportId) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Randomly determine if export is ready
        const isReady = Math.random() > 0.3;
        
        if (isReady) {
          resolve({
            exportId: exportId,
            status: 'completed',
            message: 'Export is ready for download',
            downloadUrl: `https://example.com/exports/${exportId}.zip`,
            completedAt: new Date().toISOString()
          });
        } else {
          resolve({
            exportId: exportId,
            status: 'processing',
            message: 'Export is still being processed',
            progress: Math.floor(Math.random() * 90) + 10,
            estimatedCompletionTime: '15 seconds'
          });
        }
      }, 500);
    });
  },
  getRecentExports: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            exportId: 'export-1683733945000',
            datasetId: 'births',
            datasetName: 'Birth Records',
            format: 'excel',
            status: 'completed',
            requestedAt: '2025-05-05T14:30:00Z',
            completedAt: '2025-05-05T14:32:30Z',
            recordCount: 782,
            fileSize: '4.2 MB',
            downloadUrl: 'https://example.com/exports/export-1683733945000.zip',
            requestedBy: 'Dr. Sarah Johnson'
          },
          {
            exportId: 'export-1683647545000',
            datasetId: 'immunizations',
            datasetName: 'Immunization Records',
            format: 'csv',
            status: 'completed',
            requestedAt: '2025-05-04T10:15:00Z',
            completedAt: '2025-05-04T10:16:45Z',
            recordCount: 1245,
            fileSize: '6.8 MB',
            downloadUrl: 'https://example.com/exports/export-1683647545000.zip',
            requestedBy: 'Dr. Sarah Johnson'
          },
          {
            exportId: 'export-1683561145000',
            datasetId: 'diseases',
            datasetName: 'Disease Surveillance Records',
            format: 'pdf',
            status: 'completed',
            requestedAt: '2025-05-03T16:45:00Z',
            completedAt: '2025-05-03T16:48:20Z',
            recordCount: 423,
            fileSize: '8.5 MB',
            downloadUrl: 'https://example.com/exports/export-1683561145000.zip',
            requestedBy: 'Dr. Sarah Johnson'
          }
        ]);
      }, 500);
    });
  }
};

// Format options by dataset
const datasetFilterOptions = {
  'births': {
    facilities: true,
    lgas: true,
    dateRange: true,
    gender: true,
    deliveryType: true,
    motherAge: true
  },
  'deaths': {
    facilities: true,
    lgas: true,
    dateRange: true,
    gender: true,
    ageGroup: true,
    causeOfDeath: true
  },
  'immunizations': {
    facilities: true,
    lgas: true,
    dateRange: true,
    vaccineType: true,
    ageGroup: true
  },
  'antenatal': {
    facilities: true,
    lgas: true,
    dateRange: true,
    visitNumber: true,
    maternalAge: true,
    highRisk: true
  },
  'diseases': {
    facilities: true,
    lgas: true,
    dateRange: true,
    diseaseType: true,
    gender: true,
    ageGroup: true,
    severity: true
  },
  'family_planning': {
    facilities: true,
    lgas: true,
    dateRange: true,
    method: true,
    ageGroup: true,
    newAcceptor: true
  }
};

// Export Data Component
const ExportData = () => {
  const { loading, error, execute } = useApi();
  
  // State
  const [exportableDatasets, setExportableDatasets] = useState([]);
  const [exportFormats, setExportFormats] = useState([]);
  const [recentExports, setRecentExports] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(subMonths(new Date(), 3)),
    endDate: endOfMonth(new Date())
  });
  const [filters, setFilters] = useState({
    facilities: ['all'],
    lgas: ['all'],
    gender: ['all'],
    ageGroup: ['all'],
    deliveryType: ['all'],
    vaccineType: ['all'],
    diseaseType: ['all'],
    method: ['all'],
    includeConfidentialInfo: false
  });
  const [selectedFields, setSelectedFields] = useState([]);
  const [exportEstimate, setExportEstimate] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [currentExport, setCurrentExport] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);
  const [showExportProgress, setShowExportProgress] = useState(false);
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);

  // Facility options
  const facilityOptions = [
    { id: 'all', name: 'All Facilities' },
    { id: 'uyo-general', name: 'Uyo General Hospital' },
    { id: 'ikot-ekpene', name: 'Ikot Ekpene Medical Center' },
    { id: 'eket', name: 'Eket Community Hospital' },
    { id: 'abak', name: 'Abak Primary Healthcare' },
    { id: 'oron', name: 'Oron District Hospital' }
  ];

  // LGA options
  const lgaOptions = [
    { id: 'all', name: 'All LGAs' },
    { id: 'uyo', name: 'Uyo' },
    { id: 'ikot-ekpene', name: 'Ikot Ekpene' },
    { id: 'eket', name: 'Eket' },
    { id: 'abak', name: 'Abak' },
    { id: 'oron', name: 'Oron' },
    { id: 'ibiono-ibom', name: 'Ibiono Ibom' },
    { id: 'itu', name: 'Itu' },
    { id: 'nsit-ubium', name: 'Nsit Ubium' },
    { id: 'ikot-abasi', name: 'Ikot Abasi' }
  ];

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      // Load exportable datasets
      await execute(
        exportService.getExportableDatasets,
        [],
        (response) => {
          setExportableDatasets(response);
        }
      );

      // Load export formats
      await execute(
        exportService.getExportFormats,
        [],
        (response) => {
          setExportFormats(response);
        }
      );

      // Load recent exports
      await execute(
        exportService.getRecentExports,
        [],
        (response) => {
          setRecentExports(response);
        }
      );
    };

    loadInitialData();

    // Clean up status check interval on unmount
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, []);

  // Reset selected fields when dataset changes
  useEffect(() => {
    if (selectedDataset) {
      const dataset = exportableDatasets.find(d => d.id === selectedDataset);
      if (dataset) {
        // Select all required fields by default
        setSelectedFields(dataset.fields.filter(field => field.required).map(field => field.id));
      }
    } else {
      setSelectedFields([]);
    }
  }, [selectedDataset, exportableDatasets]);

  // Update export estimate when selections change
  useEffect(() => {
    if (selectedDataset && dateRange.startDate && dateRange.endDate) {
      const getEstimate = async () => {
        await execute(
          exportService.getExportEstimate,
          [{
            datasetId: selectedDataset,
            startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
            endDate: format(dateRange.endDate, 'yyyy-MM-dd'),
            filters: filters
          }],
          (response) => {
            setExportEstimate(response);
          }
        );
      };

      getEstimate();
    }
  }, [selectedDataset, dateRange, filters]);

  // Start status check interval when export is initiated
  useEffect(() => {
    if (currentExport && showExportProgress) {
      // Check status immediately
      checkExportStatus(currentExport.exportId);
      
      // Set up interval for checking status
      const interval = setInterval(() => {
        checkExportStatus(currentExport.exportId);
      }, 3000);
      
      setStatusCheckInterval(interval);
      
      // Clean up interval when export is complete or component unmounts
      return () => {
        clearInterval(interval);
      };
    }
  }, [currentExport, showExportProgress]);

  // Stop checking status when export is completed
  useEffect(() => {
    if (exportStatus && exportStatus.status === 'completed' && statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
  }, [exportStatus]);

  // Handle dataset selection
  const handleDatasetChange = (event) => {
    setSelectedDataset(event.target.value);
    setSelectedFormat('');
    setExportEstimate(null);
  };

  // Handle format selection
  const handleFormatChange = (event) => {
    setSelectedFormat(event.target.value);
  };

  // Handle date range change
  const handleStartDateChange = (date) => {
    setDateRange(prevRange => ({
      ...prevRange,
      startDate: date
    }));
  };

  const handleEndDateChange = (date) => {
    setDateRange(prevRange => ({
      ...prevRange,
      endDate: date
    }));
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };

  // Handle confidential info toggle
  const handleConfidentialInfoChange = (event) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      includeConfidentialInfo: event.target.checked
    }));
  };

  // Handle field selection
  const handleFieldChange = (event) => {
    const { value, checked } = event.target;
    
    // Get dataset to check if field is required
    const dataset = exportableDatasets.find(d => d.id === selectedDataset);
    const field = dataset?.fields.find(f => f.id === value);
    
    // Don't allow unchecking required fields
    if (!checked && field?.required) {
      return;
    }
    
    setSelectedFields(prevFields => {
      if (checked) {
        return [...prevFields, value];
      } else {
        return prevFields.filter(field => field !== value);
      }
    });
  };

  // Handle step navigation
  const handleNext = () => {
    setActiveStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedDataset('');
    setSelectedFormat('');
    setDateRange({
      startDate: startOfMonth(subMonths(new Date(), 3)),
      endDate: endOfMonth(new Date())
    });
    setFilters({
      facilities: ['all'],
      lgas: ['all'],
      gender: ['all'],
      ageGroup: ['all'],
      deliveryType: ['all'],
      vaccineType: ['all'],
      diseaseType: ['all'],
      method: ['all'],
      includeConfidentialInfo: false
    });
    setSelectedFields([]);
    setExportEstimate(null);
    setCurrentExport(null);
    setExportStatus(null);
    setShowExportProgress(false);
    
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
  };

  // Handle export request
  const handleRequestExport = async () => {
    await execute(
      exportService.requestExport,
      [{
        datasetId: selectedDataset,
        format: selectedFormat,
        startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
        endDate: format(dateRange.endDate, 'yyyy-MM-dd'),
        filters: filters,
        fields: selectedFields
      }],
      (response) => {
        setCurrentExport(response);
        setShowExportProgress(true);
        handleNext();
      }
    );
  };

  // Check export status
  const checkExportStatus = async (exportId) => {
    try {
      const status = await exportService.getExportStatus(exportId);
      setExportStatus(status);
    } catch (error) {
      console.error('Error checking export status:', error);
    }
  };

  // Handle download
  const handleDownload = (url) => {
    window.open(url, '_blank');
  };

  // Export steps
  const steps = [
    {
      label: 'Choose Dataset',
      description: 'Select the type of data to export'
    },
    {
      label: 'Configure Export',
      description: 'Select time period, filters, and fields'
    },
    {
      label: 'Review and Export',
      description: 'Review export configuration and confirm'
    },
    {
      label: 'Download',
      description: 'Processing and downloading your data'
    }
  ];

  // Get dataset fields
  const getDatasetFields = () => {
    if (!selectedDataset) return [];
    
    const dataset = exportableDatasets.find(d => d.id === selectedDataset);
    return dataset ? dataset.fields : [];
  };

  // Get dataset format options
  const getDatasetFormats = () => {
    if (!selectedDataset) return [];
    
    const dataset = exportableDatasets.find(d => d.id === selectedDataset);
    if (!dataset) return [];
    
    return exportFormats.filter(format => 
      dataset.availableFormats.includes(format.id)
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  // Get filter options for dataset
  const getFilterOptions = () => {
    if (!selectedDataset) return {};
    
    return datasetFilterOptions[selectedDataset] || {};
  };

  // Get icon for format
  const getFormatIcon = (formatId) => {
    switch (formatId) {
      case 'csv':
        return <InsertDriveFileIcon />;
      case 'excel':
        return <TableChartIcon />;
      case 'pdf':
        return <PictureAsPdfIcon />;
      case 'json':
        return <ContentCopyIcon />;
      default:
        return <DescriptionIcon />;
    }
  };

  if (loading && !exportableDatasets.length) {
    return (
      <MainLayout title="Export Data">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Export Data"
      breadcrumbs={[
        { name: 'Reports', path: '/reports' },
        { name: 'Export Data', active: true }
      ]}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          <CloudDownloadIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Export Health Data
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 3 }}>
          {/* Step 1: Choose Dataset */}
          <Step>
            <StepLabel>{steps[0].label}</StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                {steps[0].description}
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="dataset-label">Dataset</InputLabel>
                <Select
                  labelId="dataset-label"
                  id="dataset"
                  value={selectedDataset}
                  onChange={handleDatasetChange}
                  label="Dataset"
                >
                  {exportableDatasets.map((dataset) => (
                    <MenuItem key={dataset.id} value={dataset.id}>
                      {dataset.name}
                    </MenuItem>
                  ))}
                </Select>
                {selectedDataset && (
                  <FormHelperText>
                    {exportableDatasets.find(d => d.id === selectedDataset)?.description}
                  </FormHelperText>
                )}
              </FormControl>
              
              {selectedDataset && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="format-label">Export Format</InputLabel>
                  <Select
                    labelId="format-label"
                    id="format"
                    value={selectedFormat}
                    onChange={handleFormatChange}
                    label="Export Format"
                  >
                    {getDatasetFormats().map((format) => (
                      <MenuItem key={format.id} value={format.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getFormatIcon(format.id)}
                          <Box sx={{ ml: 1 }}>{format.name}</Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {selectedFormat && (
                    <FormHelperText>
                      {exportFormats.find(f => f.id === selectedFormat)?.description}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!selectedDataset || !selectedFormat}
                  endIcon={<ArrowForwardIcon />}
                >
                  Continue
                </Button>
              </Box>
            </StepContent>
          </Step>
          
          {/* Step 2: Configure Export */}
          <Step>
            <StepLabel>{steps[1].label}</StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                {steps[1].description}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <DateRangeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Date Range
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Start Date"
                        value={dateRange.startDate}
                        onChange={handleStartDateChange}
                        renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="End Date"
                        value={dateRange.endDate}
                        onChange={handleEndDateChange}
                        renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Filters
                </Typography>
                <Grid container spacing={2}>
                  {getFilterOptions().facilities && (
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel id="facilities-label">Facilities</InputLabel>
                        <Select
                          labelId="facilities-label"
                          id="facilities"
                          multiple
                          value={filters.facilities}
                          onChange={(e) => handleFilterChange('facilities', e.target.value)}
                          label="Facilities"
                          renderValue={(selected) => {
                            if (selected.includes('all')) return 'All Facilities';
                            
                            return selected.map(id => {
                              const facility = facilityOptions.find(f => f.id === id);
                              return facility ? facility.name : id;
                            }).join(', ');
                          }}
                        >
                          <MenuItem value="all">
                            <Checkbox checked={filters.facilities.includes('all')} />
                            <ListItemText primary="All Facilities" />
                          </MenuItem>
                          
                          {facilityOptions.filter(f => f.id !== 'all').map((facility) => (
                            <MenuItem key={facility.id} value={facility.id}>
                              <Checkbox checked={filters.facilities.includes(facility.id)} />
                              <ListItemText primary={facility.name} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  
                  {getFilterOptions().lgas && (
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel id="lgas-label">Local Government Areas</InputLabel>
                        <Select
                          labelId="lgas-label"
                          id="lgas"
                          multiple
                          value={filters.lgas}
                          onChange={(e) => handleFilterChange('lgas', e.target.value)}
                          label="Local Government Areas"
                          renderValue={(selected) => {
                            if (selected.includes('all')) return 'All LGAs';
                            
                            return selected.map(id => {
                              const lga = lgaOptions.find(l => l.id === id);
                              return lga ? lga.name : id;
                            }).join(', ');
                          }}
                        >
                          <MenuItem value="all">
                            <Checkbox checked={filters.lgas.includes('all')} />
                            <ListItemText primary="All LGAs" />
                          </MenuItem>
                          
                          {lgaOptions.filter(l => l.id !== 'all').map((lga) => (
                            <MenuItem key={lga.id} value={lga.id}>
                              <Checkbox checked={filters.lgas.includes(lga.id)} />
                              <ListItemText primary={lga.name} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  
                  {/* Dataset-specific filters */}
                  {selectedDataset === 'births' && getFilterOptions().gender && (
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel id="gender-label">Gender</InputLabel>
                        <Select
                          labelId="gender-label"
                          id="gender"
                          multiple
                          value={filters.gender}
                          onChange={(e) => handleFilterChange('gender', e.target.value)}
                          label="Gender"
                        >
                          <MenuItem value="all">All</MenuItem>
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  
                  {selectedDataset === 'births' && getFilterOptions().deliveryType && (
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel id="deliveryType-label">Delivery Type</InputLabel>
                        <Select
                          labelId="deliveryType-label"
                          id="deliveryType"
                          multiple
                          value={filters.deliveryType}
                          onChange={(e) => handleFilterChange('deliveryType', e.target.value)}
                          label="Delivery Type"
                        >
                          <MenuItem value="all">All Types</MenuItem>
                          <MenuItem value="Normal">Normal</MenuItem>
                          <MenuItem value="Caesarean">Caesarean Section</MenuItem>
                          <MenuItem value="Assisted">Assisted</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  
                  {/* Add more dataset-specific filters as needed */}
                </Grid>
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.includeConfidentialInfo}
                      onChange={handleConfidentialInfoChange}
                      name="includeConfidentialInfo"
                    />
                  }
                  label="Include confidential information (requires additional authorization)"
                  sx={{ mt: 2 }}
                />
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Select Fields
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Select the fields to include in your export. Required fields are pre-selected and cannot be deselected.
                </Typography>
                
                <Grid container spacing={2}>
                  {getDatasetFields().map((field) => (
                    <Grid item xs={12} sm={6} md={4} key={field.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedFields.includes(field.id)}
                            onChange={handleFieldChange}
                            value={field.id}
                            disabled={field.required}
                          />
                        }
                        label={
                          <Box>
                            {field.name}
                            {field.required && (
                              <Chip
                                label="Required"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                >
                  Continue
                </Button>
              </Box>
            </StepContent>
          </Step>
          
          {/* Step 3: Review and Export */}
          <Step>
            <StepLabel>{steps[2].label}</StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                {steps[2].description}
              </Typography>
              
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardHeader title="Export Configuration" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Dataset:</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {exportableDatasets.find(d => d.id === selectedDataset)?.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Format:</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {exportFormats.find(f => f.id === selectedFormat)?.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Date Range:</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {format(dateRange.startDate, 'MMM dd, yyyy')} to {format(dateRange.endDate, 'MMM dd, yyyy')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Selected Fields:</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {selectedFields.length} of {getDatasetFields().length} fields
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Filters:</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Facilities: {filters.facilities.includes('all') ? 'All' : filters.facilities.length}
                        <br />
                        LGAs: {filters.lgas.includes('all') ? 'All' : filters.lgas.length}
                        {selectedDataset === 'births' && (
                          <>
                            <br />
                            Gender: {filters.gender.includes('all') ? 'All' : filters.gender.join(', ')}
                          </>
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Confidential Information:</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {filters.includeConfidentialInfo ? 'Included' : 'Excluded'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              {exportEstimate && (
                <Card variant="outlined" sx={{ mb: 3, bgcolor: 'info.lighter' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      <InfoIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'info.main' }} />
                      Export Estimate
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2">
                          <strong>Records:</strong> {exportEstimate.recordCount.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2">
                          <strong>Estimated Size:</strong> {exportEstimate.estimatedSize}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2">
                          <strong>Processing Time:</strong> ~{exportEstimate.timeEstimate}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
              
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  By exporting this data, you confirm that you have the necessary authorization and will handle the exported data in accordance with applicable privacy regulations and institutional policies.
                </Typography>
              </Alert>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleRequestExport}
                  endIcon={<CloudUploadIcon />}
                  color="primary"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Export Data'}
                </Button>
              </Box>
            </StepContent>
          </Step>
          
          {/* Step 4: Download */}
          <Step>
            <StepLabel>{steps[3].label}</StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                {steps[3].description}
              </Typography>
              
              {currentExport && (
                <Box>
                  {showExportProgress && exportStatus && (
                    <Card sx={{ mb: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {exportStatus.status === 'completed' ? (
                            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                          ) : (
                            <CircularProgress size={24} sx={{ mr: 1 }} />
                          )}
                          <Typography variant="h6">
                            {exportStatus.status === 'completed' ? 'Export Complete' : 'Processing Export'}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" paragraph>
                          {exportStatus.message}
                        </Typography>
                        
                        {exportStatus.status === 'processing' && (
                          <Box sx={{ width: '100%', mb: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={exportStatus.progress || 0}
                              sx={{ height: 10, borderRadius: 5 }}
                            />
                            <Typography variant="caption" align="center" display="block" sx={{ mt: 0.5 }}>
                              {exportStatus.progress}% Complete
                            </Typography>
                          </Box>
                        )}
                        
                        {exportStatus.status === 'completed' && exportStatus.downloadUrl && (
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<GetAppIcon />}
                            onClick={() => handleDownload(exportStatus.downloadUrl)}
                            fullWidth
                          >
                            Download Export
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button onClick={handleReset} startIcon={<RefreshIcon />}>
                      Start New Export
                    </Button>
                    
                    {exportStatus && exportStatus.status === 'completed' && (
                      <Button
                        variant="outlined"
                        startIcon={<MailIcon />}
                        onClick={() => alert('Email functionality would be implemented here')}
                      >
                        Email Export Link
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
            </StepContent>
          </Step>
        </Stepper>
      </Paper>
      
      {/* Recent Exports */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Recent Exports
        </Typography>
        
        {recentExports.length > 0 ? (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Dataset</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Format</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Records</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>File Size</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentExports.map((export_) => (
                  <tr key={export_.exportId} style={{ backgroundColor: export_.status === 'completed' ? 'white' : '#f9f9f9' }}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                      {formatDate(export_.requestedAt)}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                      {export_.datasetName}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getFormatIcon(export_.format)}
                        <Box sx={{ ml: 1 }}>{export_.format.toUpperCase()}</Box>
                      </Box>
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                      {export_.recordCount.toLocaleString()}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                      {export_.fileSize}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                      <Chip
                        label={export_.status.charAt(0).toUpperCase() + export_.status.slice(1)}
                        color={export_.status === 'completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                      {export_.status === 'completed' && (
                        <Tooltip title="Download">
                          <IconButton
                            color="primary"
                            onClick={() => handleDownload(export_.downloadUrl)}
                            size="small"
                          >
                            <GetAppIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
            No recent exports
          </Typography>
        )}
      </Paper>
    </MainLayout>
  );
};

export default ExportData;