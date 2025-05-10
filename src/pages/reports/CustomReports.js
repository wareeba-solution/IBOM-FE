// src/pages/reports/CustomReports.js
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
  FormControlLabel,
  FormGroup,
  FormLabel,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Checkbox,
  Radio,
  RadioGroup,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Switch,
  Skeleton,
  useTheme
} from '@mui/material';
import {
  DatePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  GetApp as GetAppIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  List as ListIcon,
  TableChart as TableChartIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  CloudDownload as CloudDownloadIcon,
  Description as DescriptionIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

// Mock report service - replace with actual service when available
const reportService = {
  getSavedReports: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'report-1',
            name: 'Monthly Birth Rate Trends',
            description: 'Analysis of birth rates across facilities by month',
            created_at: '2025-04-10T15:30:00Z',
            last_run: '2025-05-07T10:20:00Z',
            type: 'births',
            visualization: 'line',
            shared: true,
            filters: {
              date_range: {
                start_date: '2024-05-01',
                end_date: '2025-04-30'
              },
              facilities: ['all'],
              lgas: ['uyo', 'ikot-ekpene', 'eket']
            }
          },
          {
            id: 'report-2',
            name: 'Immunization Coverage by LGA',
            description: 'Comparison of immunization coverage across LGAs',
            created_at: '2025-03-15T09:45:00Z',
            last_run: '2025-05-06T14:20:00Z',
            type: 'immunizations',
            visualization: 'bar',
            shared: false,
            filters: {
              date_range: {
                start_date: '2024-05-01',
                end_date: '2025-04-30'
              },
              facilities: ['all'],
              lgas: ['all'],
              vaccine_types: ['BCG', 'OPV', 'Pentavalent', 'Measles']
            }
          },
          {
            id: 'report-3',
            name: 'Disease Prevalence Analysis',
            description: 'Analysis of disease prevalence by type and location',
            created_at: '2025-02-20T11:15:00Z',
            last_run: '2025-05-02T09:30:00Z',
            type: 'diseases',
            visualization: 'pie',
            shared: true,
            filters: {
              date_range: {
                start_date: '2024-08-01',
                end_date: '2025-04-30'
              },
              facilities: ['uyo-general', 'ikot-ekpene', 'eket'],
              lgas: ['uyo', 'ikot-ekpene', 'eket'],
              disease_types: ['Malaria', 'Respiratory Infections', 'Diarrheal Diseases']
            }
          }
        ]);
      }, 500);
    });
  },
  getReportTypes: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'births',
            name: 'Birth Records',
            description: 'Reports on birth statistics, trends, and demographics',
            fields: [
              { id: 'birth_date', name: 'Birth Date', type: 'date' },
              { id: 'gender', name: 'Gender', type: 'select', options: ['Male', 'Female'] },
              { id: 'weight', name: 'Birth Weight', type: 'number' },
              { id: 'facility', name: 'Facility', type: 'select', reference: 'facilities' },
              { id: 'mother_age', name: 'Mother\'s Age', type: 'number' },
              { id: 'delivery_type', name: 'Delivery Type', type: 'select', options: ['Normal', 'Caesarean Section', 'Assisted'] }
            ]
          },
          {
            id: 'deaths',
            name: 'Death Records',
            description: 'Reports on mortality statistics, causes, and demographics',
            fields: [
              { id: 'death_date', name: 'Date of Death', type: 'date' },
              { id: 'age', name: 'Age', type: 'number' },
              { id: 'gender', name: 'Gender', type: 'select', options: ['Male', 'Female'] },
              { id: 'cause', name: 'Cause of Death', type: 'select', reference: 'causes' },
              { id: 'facility', name: 'Facility', type: 'select', reference: 'facilities' },
              { id: 'lga', name: 'LGA', type: 'select', reference: 'lgas' }
            ]
          },
          {
            id: 'immunizations',
            name: 'Immunization Records',
            description: 'Reports on immunization coverage, types, and demographics',
            fields: [
              { id: 'immunization_date', name: 'Immunization Date', type: 'date' },
              { id: 'vaccine_type', name: 'Vaccine Type', type: 'select', reference: 'vaccines' },
              { id: 'age_group', name: 'Age Group', type: 'select', options: ['0-1 year', '1-5 years', '5+ years'] },
              { id: 'facility', name: 'Facility', type: 'select', reference: 'facilities' },
              { id: 'lga', name: 'LGA', type: 'select', reference: 'lgas' }
            ]
          },
          {
            id: 'antenatal',
            name: 'Antenatal Care',
            description: 'Reports on antenatal care visits, outcomes, and maternal health',
            fields: [
              { id: 'visit_date', name: 'Visit Date', type: 'date' },
              { id: 'visit_number', name: 'Visit Number', type: 'number' },
              { id: 'mother_age', name: 'Mother\'s Age', type: 'number' },
              { id: 'facility', name: 'Facility', type: 'select', reference: 'facilities' },
              { id: 'high_risk', name: 'High Risk Pregnancy', type: 'boolean' }
            ]
          },
          {
            id: 'diseases',
            name: 'Disease Surveillance',
            description: 'Reports on disease prevalence, outbreaks, and trends',
            fields: [
              { id: 'diagnosis_date', name: 'Diagnosis Date', type: 'date' },
              { id: 'disease_type', name: 'Disease Type', type: 'select', reference: 'diseases' },
              { id: 'age_group', name: 'Age Group', type: 'select', options: ['0-5', '6-18', '19-35', '36-50', '51-65', '66+'] },
              { id: 'gender', name: 'Gender', type: 'select', options: ['Male', 'Female'] },
              { id: 'facility', name: 'Facility', type: 'select', reference: 'facilities' },
              { id: 'lga', name: 'LGA', type: 'select', reference: 'lgas' }
            ]
          },
          {
            id: 'family_planning',
            name: 'Family Planning',
            description: 'Reports on family planning methods, consultations, and demographics',
            fields: [
              { id: 'consultation_date', name: 'Consultation Date', type: 'date' },
              { id: 'method', name: 'Method', type: 'select', reference: 'fp_methods' },
              { id: 'age_group', name: 'Age Group', type: 'select', options: ['15-19', '20-24', '25-34', '35-49'] },
              { id: 'facility', name: 'Facility', type: 'select', reference: 'facilities' },
              { id: 'lga', name: 'LGA', type: 'select', reference: 'lgas' }
            ]
          }
        ]);
      }, 600);
    });
  },
  getReportConfiguration: async (reportId) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: reportId || 'new-report',
          name: reportId ? 'Monthly Birth Rate Trends' : '',
          description: reportId ? 'Analysis of birth rates across facilities by month' : '',
          type: reportId ? 'births' : '',
          visualization: reportId ? 'line' : 'bar',
          grouping: reportId ? 'month' : '',
          metrics: reportId ? ['count'] : [],
          filters: reportId ? {
            date_range: {
              start_date: '2024-05-01',
              end_date: '2025-04-30'
            },
            facilities: ['all'],
            lgas: ['uyo', 'ikot-ekpene', 'eket'],
            gender: ['all']
          } : {
            date_range: {
              start_date: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
              end_date: format(new Date(), 'yyyy-MM-dd')
            },
            facilities: ['all'],
            lgas: ['all']
          },
          columns: reportId ? ['month', 'facility', 'count'] : []
        });
      }, 700);
    });
  },
  getReferenceData: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          facilities: [
            { id: 'uyo-general', name: 'Uyo General Hospital' },
            { id: 'ikot-ekpene', name: 'Ikot Ekpene Medical Center' },
            { id: 'eket', name: 'Eket Community Hospital' },
            { id: 'abak', name: 'Abak Primary Healthcare' },
            { id: 'oron', name: 'Oron District Hospital' }
          ],
          lgas: [
            { id: 'uyo', name: 'Uyo' },
            { id: 'ikot-ekpene', name: 'Ikot Ekpene' },
            { id: 'eket', name: 'Eket' },
            { id: 'abak', name: 'Abak' },
            { id: 'oron', name: 'Oron' },
            { id: 'ibiono-ibom', name: 'Ibiono Ibom' },
            { id: 'itu', name: 'Itu' },
            { id: 'nsit-ubium', name: 'Nsit Ubium' },
            { id: 'ikot-abasi', name: 'Ikot Abasi' }
          ],
          diseases: [
            { id: 'malaria', name: 'Malaria' },
            { id: 'respiratory', name: 'Respiratory Infections' },
            { id: 'diarrheal', name: 'Diarrheal Diseases' },
            { id: 'typhoid', name: 'Typhoid' },
            { id: 'tuberculosis', name: 'Tuberculosis' },
            { id: 'measles', name: 'Measles' },
            { id: 'cholera', name: 'Cholera' }
          ],
          vaccines: [
            { id: 'bcg', name: 'BCG' },
            { id: 'opv', name: 'OPV' },
            { id: 'pentavalent', name: 'Pentavalent' },
            { id: 'pcv', name: 'PCV' },
            { id: 'measles', name: 'Measles' },
            { id: 'yellow-fever', name: 'Yellow Fever' },
            { id: 'rotavirus', name: 'Rotavirus' }
          ],
          causes: [
            { id: 'cardiovascular', name: 'Cardiovascular Diseases' },
            { id: 'infectious', name: 'Infectious Diseases' },
            { id: 'cancer', name: 'Cancer' },
            { id: 'respiratory', name: 'Respiratory Diseases' },
            { id: 'accidents', name: 'Accidents/Trauma' },
            { id: 'other', name: 'Other' }
          ],
          fp_methods: [
            { id: 'hormonal', name: 'Hormonal Contraceptives' },
            { id: 'iud', name: 'IUDs' },
            { id: 'implants', name: 'Implants' },
            { id: 'condoms', name: 'Condoms' },
            { id: 'natural', name: 'Natural Methods' }
          ]
        });
      }, 700);
    });
  },
  saveReport: async (reportData) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Report saved successfully',
          report: {
            ...reportData,
            id: reportData.id || `report-${Date.now()}`,
            created_at: reportData.created_at || new Date().toISOString(),
            last_run: new Date().toISOString()
          }
        });
      }, 800);
    });
  },
  runReport: async (reportId, params) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock data for different report types
        const mockData = {
          'births': [
            { month: 'Jan', facility: 'Uyo General Hospital', count: 58, gender: 'Male' },
            { month: 'Jan', facility: 'Uyo General Hospital', count: 55, gender: 'Female' },
            { month: 'Jan', facility: 'Ikot Ekpene Medical Center', count: 32, gender: 'Male' },
            { month: 'Jan', facility: 'Ikot Ekpene Medical Center', count: 28, gender: 'Female' },
            { month: 'Feb', facility: 'Uyo General Hospital', count: 52, gender: 'Male' },
            { month: 'Feb', facility: 'Uyo General Hospital', count: 49, gender: 'Female' },
            { month: 'Feb', facility: 'Ikot Ekpene Medical Center', count: 28, gender: 'Male' },
            { month: 'Feb', facility: 'Ikot Ekpene Medical Center', count: 30, gender: 'Female' },
            { month: 'Mar', facility: 'Uyo General Hospital', count: 62, gender: 'Male' },
            { month: 'Mar', facility: 'Uyo General Hospital', count: 58, gender: 'Female' },
            { month: 'Mar', facility: 'Ikot Ekpene Medical Center', count: 34, gender: 'Male' },
            { month: 'Mar', facility: 'Ikot Ekpene Medical Center', count: 32, gender: 'Female' }
          ],
          'immunizations': [
            { month: 'Jan', vaccine: 'BCG', count: 87, facility: 'Uyo General Hospital' },
            { month: 'Jan', vaccine: 'OPV', count: 92, facility: 'Uyo General Hospital' },
            { month: 'Jan', vaccine: 'Pentavalent', count: 78, facility: 'Uyo General Hospital' },
            { month: 'Jan', vaccine: 'BCG', count: 65, facility: 'Ikot Ekpene Medical Center' },
            { month: 'Jan', vaccine: 'OPV', count: 72, facility: 'Ikot Ekpene Medical Center' },
            { month: 'Jan', vaccine: 'Pentavalent', count: 54, facility: 'Ikot Ekpene Medical Center' },
            { month: 'Feb', vaccine: 'BCG', count: 82, facility: 'Uyo General Hospital' },
            { month: 'Feb', vaccine: 'OPV', count: 90, facility: 'Uyo General Hospital' },
            { month: 'Feb', vaccine: 'Pentavalent', count: 72, facility: 'Uyo General Hospital' },
            { month: 'Feb', vaccine: 'BCG', count: 61, facility: 'Ikot Ekpene Medical Center' },
            { month: 'Feb', vaccine: 'OPV', count: 68, facility: 'Ikot Ekpene Medical Center' },
            { month: 'Feb', vaccine: 'Pentavalent', count: 50, facility: 'Ikot Ekpene Medical Center' }
          ],
          'diseases': [
            { month: 'Jan', disease: 'Malaria', count: 120, lga: 'Uyo' },
            { month: 'Jan', disease: 'Respiratory Infections', count: 78, lga: 'Uyo' },
            { month: 'Jan', disease: 'Diarrheal Diseases', count: 45, lga: 'Uyo' },
            { month: 'Jan', disease: 'Malaria', count: 85, lga: 'Ikot Ekpene' },
            { month: 'Jan', disease: 'Respiratory Infections', count: 52, lga: 'Ikot Ekpene' },
            { month: 'Jan', disease: 'Diarrheal Diseases', count: 32, lga: 'Ikot Ekpene' },
            { month: 'Feb', disease: 'Malaria', count: 115, lga: 'Uyo' },
            { month: 'Feb', disease: 'Respiratory Infections', count: 72, lga: 'Uyo' },
            { month: 'Feb', disease: 'Diarrheal Diseases', count: 42, lga: 'Uyo' },
            { month: 'Feb', disease: 'Malaria', count: 82, lga: 'Ikot Ekpene' },
            { month: 'Feb', disease: 'Respiratory Infections', count: 50, lga: 'Ikot Ekpene' },
            { month: 'Feb', disease: 'Diarrheal Diseases', count: 30, lga: 'Ikot Ekpene' }
          ]
        };

        // Get the appropriate data for the report type
        let reportData = [];
        if (reportId === 'report-1' || params?.type === 'births') {
          reportData = mockData.births;
        } else if (reportId === 'report-2' || params?.type === 'immunizations') {
          reportData = mockData.immunizations;
        } else if (reportId === 'report-3' || params?.type === 'diseases') {
          reportData = mockData.diseases;
        } else {
          // Default to births data
          reportData = mockData.births;
        }

        resolve({
          success: true,
          data: reportData,
          metadata: {
            report_id: reportId,
            run_date: new Date().toISOString(),
            params: params || {}
          }
        });
      }, 1200);
    });
  },
  deleteReport: async (reportId) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `Report ${reportId} deleted successfully`
        });
      }, 500);
    });
  }
};

// Chart color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

// Custom Reports Component
const CustomReports = () => {
  const theme = useTheme();
  const { loading, error, execute } = useApi();

  // State
  const [savedReports, setSavedReports] = useState([]);
  const [reportTypes, setReportTypes] = useState([]);
  const [referenceData, setReferenceData] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportConfig, setReportConfig] = useState(null);
  const [reportResults, setReportResults] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingReportData, setLoadingReportData] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  // Load saved reports and report types
  useEffect(() => {
    const loadInitialData = async () => {
      // Load saved reports
      await execute(
        reportService.getSavedReports,
        [],
        (response) => {
          setSavedReports(response);
        }
      );

      // Load report types
      await execute(
        reportService.getReportTypes,
        [],
        (response) => {
          setReportTypes(response);
        }
      );

      // Load reference data
      await execute(
        reportService.getReferenceData,
        [],
        (response) => {
          setReferenceData(response);
        }
      );
    };

    loadInitialData();
  }, []);

  // Handle report selection
  const handleReportSelect = async (reportId) => {
    setSelectedReport(reportId);
    setIsEditing(false);
    setIsCreating(false);

    // Load report configuration
    await execute(
      reportService.getReportConfiguration,
      [reportId],
      (response) => {
        setReportConfig(response);
      }
    );

    // Run the report
    setLoadingReportData(true);
    try {
      const result = await reportService.runReport(reportId);
      setReportResults(result);
    } catch (error) {
      console.error('Error running report:', error);
    } finally {
      setLoadingReportData(false);
    }
  };

  // Handle create new report
  const handleCreateNewReport = async () => {
    setSelectedReport(null);
    setReportResults(null);
    setIsEditing(true);
    setIsCreating(true);

    // Load empty report configuration
    await execute(
      reportService.getReportConfiguration,
      [],
      (response) => {
        setReportConfig(response);
      }
    );
  };

  // Handle edit report
  const handleEditReport = () => {
    setIsEditing(true);
  };

  // Handle report type change
  const handleReportTypeChange = (event) => {
    const selectedType = event.target.value;
    
    setReportConfig(prevConfig => ({
      ...prevConfig,
      type: selectedType,
      // Reset metrics and columns when type changes
      metrics: [],
      columns: []
    }));
  };

  // Handle visualization type change
  const handleVisualizationChange = (event) => {
    setReportConfig(prevConfig => ({
      ...prevConfig,
      visualization: event.target.value
    }));
  };

  // Handle grouping change
  const handleGroupingChange = (event) => {
    setReportConfig(prevConfig => ({
      ...prevConfig,
      grouping: event.target.value
    }));
  };

  // Handle metrics change
  const handleMetricsChange = (event) => {
    const { value, checked } = event.target;
    
    setReportConfig(prevConfig => {
      const currentMetrics = [...prevConfig.metrics];
      
      if (checked) {
        // Add metric if checked
        return {
          ...prevConfig,
          metrics: [...currentMetrics, value]
        };
      } else {
        // Remove metric if unchecked
        return {
          ...prevConfig,
          metrics: currentMetrics.filter(metric => metric !== value)
        };
      }
    });
  };

  // Handle columns change
  const handleColumnsChange = (event) => {
    const { value, checked } = event.target;
    
    setReportConfig(prevConfig => {
      const currentColumns = [...prevConfig.columns];
      
      if (checked) {
        // Add column if checked
        return {
          ...prevConfig,
          columns: [...currentColumns, value]
        };
      } else {
        // Remove column if unchecked
        return {
          ...prevConfig,
          columns: currentColumns.filter(column => column !== value)
        };
      }
    });
  };

  // Handle date range change
  const handleStartDateChange = (date) => {
    setReportConfig(prevConfig => ({
      ...prevConfig,
      filters: {
        ...prevConfig.filters,
        date_range: {
          ...prevConfig.filters.date_range,
          start_date: format(date, 'yyyy-MM-dd')
        }
      }
    }));
  };

  const handleEndDateChange = (date) => {
    setReportConfig(prevConfig => ({
      ...prevConfig,
      filters: {
        ...prevConfig.filters,
        date_range: {
          ...prevConfig.filters.date_range,
          end_date: format(date, 'yyyy-MM-dd')
        }
      }
    }));
  };

  // Handle facility selection
  const handleFacilitiesChange = (event) => {
    const { value } = event.target;
    
    setReportConfig(prevConfig => ({
      ...prevConfig,
      filters: {
        ...prevConfig.filters,
        facilities: value
      }
    }));
  };

  // Handle LGA selection
  const handleLGAsChange = (event) => {
    const { value } = event.target;
    
    setReportConfig(prevConfig => ({
      ...prevConfig,
      filters: {
        ...prevConfig.filters,
        lgas: value
      }
    }));
  };

  // Handle form input change
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    
    setReportConfig(prevConfig => ({
      ...prevConfig,
      [name]: value
    }));
  };

  // Handle save report
  const handleSaveReport = async () => {
    await execute(
      reportService.saveReport,
      [reportConfig],
      (response) => {
        // Update saved reports list
        setSavedReports(prevReports => {
          const existingIndex = prevReports.findIndex(report => report.id === response.report.id);
          
          if (existingIndex >= 0) {
            // Update existing report
            const updatedReports = [...prevReports];
            updatedReports[existingIndex] = {
              ...response.report,
              type: reportConfig.type,
              visualization: reportConfig.visualization,
              shared: reportConfig.shared || false
            };
            return updatedReports;
          } else {
            // Add new report
            return [...prevReports, {
              ...response.report,
              type: reportConfig.type,
              visualization: reportConfig.visualization,
              shared: reportConfig.shared || false
            }];
          }
        });

        // Set selected report to the saved report
        setSelectedReport(response.report.id);
        setIsEditing(false);
        setIsCreating(false);
        
        // Run the report
        handleRunReport(response.report.id);
      }
    );
  };

  // Handle run report
  const handleRunReport = async (reportId) => {
    setLoadingReportData(true);
    try {
      const result = await reportService.runReport(reportId || selectedReport, reportConfig);
      setReportResults(result);

      // Update last run date in saved reports
      setSavedReports(prevReports => {
        return prevReports.map(report => {
          if (report.id === (reportId || selectedReport)) {
            return {
              ...report,
              last_run: new Date().toISOString()
            };
          }
          return report;
        });
      });
    } catch (error) {
      console.error('Error running report:', error);
    } finally {
      setLoadingReportData(false);
    }
  };

  // Handle delete report
  const handleDeleteReport = (reportId) => {
    setReportToDelete(reportId);
    setConfirmDialogOpen(true);
  };

  // Confirm delete report
  const confirmDeleteReport = async () => {
    setConfirmDialogOpen(false);
    
    if (reportToDelete) {
      await execute(
        reportService.deleteReport,
        [reportToDelete],
        (response) => {
          // Remove from saved reports
          setSavedReports(prevReports => prevReports.filter(report => report.id !== reportToDelete));
          
          // Clear selected report if it was deleted
          if (selectedReport === reportToDelete) {
            setSelectedReport(null);
            setReportConfig(null);
            setReportResults(null);
          }
          
          setReportToDelete(null);
        }
      );
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
    setReportToDelete(null);
  };

  // Handle search query change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter saved reports based on search query
  const filteredReports = savedReports.filter(report => {
    const searchLower = searchQuery.toLowerCase();
    return (
      report.name.toLowerCase().includes(searchLower) ||
      report.description.toLowerCase().includes(searchLower) ||
      report.type.toLowerCase().includes(searchLower)
    );
  });

  // Get report type name
  const getReportTypeName = (typeId) => {
    const reportType = reportTypes.find(type => type.id === typeId);
    return reportType ? reportType.name : typeId;
  };

  // Get available fields for selected report type
  const getAvailableFields = () => {
    if (!reportConfig || !reportConfig.type) return [];
    
    const reportType = reportTypes.find(type => type.id === reportConfig.type);
    return reportType ? reportType.fields : [];
  };

  // Render chart based on visualization type and data
  const renderVisualization = (type, data) => {
    if (!data || data.length === 0) return null;
    
    // Prepare data for visualization
    let preparedData = [...data];
    
    // Group data if grouping is specified
    if (reportConfig && reportConfig.grouping) {
      // Example: Group by month
      const groupedData = {};
      data.forEach(item => {
        const groupKey = item[reportConfig.grouping];
        if (!groupedData[groupKey]) {
          groupedData[groupKey] = { [reportConfig.grouping]: groupKey, count: 0 };
        }
        groupedData[groupKey].count += item.count;
      });
      
      preparedData = Object.values(groupedData);
    }
    
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={preparedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={reportConfig?.grouping || preparedData[0] && Object.keys(preparedData[0])[0]} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="count" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={preparedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={reportConfig?.grouping || preparedData[0] && Object.keys(preparedData[0])[0]} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#1976d2" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={preparedData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={150}
                fill="#8884d8"
                dataKey="count"
                nameKey={reportConfig?.grouping || preparedData[0] && Object.keys(preparedData[0])[0]}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {preparedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'table':
        // For table view, we just return the data to be displayed in a table
        return null;
      default:
        return null;
    }
  };

  // Render data table
  const renderDataTable = (data) => {
    if (!data || data.length === 0) return null;
    
    // Get all column keys from data
    const columns = Object.keys(data[0]);
    
    return (
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index} style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  {column.charAt(0).toUpperCase() + column.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} style={{ backgroundColor: rowIndex % 2 === 0 ? '#f9f9f9' : 'white' }}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex} style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                    {row[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  // Get time since for display
  const getTimeSince = (dateString) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    } catch (error) {
      return 'Unknown';
    }
  };

  if (loading && !reportTypes.length && !savedReports.length) {
    return (
      <MainLayout title="Custom Reports">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Custom Reports"
      breadcrumbs={[
        { name: 'Reports', path: '/reports' },
        { name: 'Custom Reports', active: true }
      ]}
    >
      <Grid container spacing={3}>
        {/* Saved Reports List */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Saved Reports
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleCreateNewReport}
              >
                New
              </Button>
            </Box>
            
            <TextField
              fullWidth
              placeholder="Search reports..."
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
              }}
              sx={{ mb: 2 }}
            />
            
            {filteredReports.length > 0 ? (
              <List dense sx={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                {filteredReports.map((report) => (
                  <ListItem
                    key={report.id}
                    button
                    selected={selectedReport === report.id}
                    onClick={() => handleReportSelect(report.id)}
                  >
                    <ListItemIcon>
                      {report.type === 'births' && <BarChartIcon color="primary" />}
                      {report.type === 'immunizations' && <TimelineIcon color="primary" />}
                      {report.type === 'diseases' && <PieChartIcon color="primary" />}
                      {!['births', 'immunizations', 'diseases'].includes(report.type) && <AssessmentIcon color="primary" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={report.name}
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {getReportTypeName(report.type)}
                          </Typography>
                          <br />
                          <Typography variant="caption" component="span">
                            Last run: {getTimeSince(report.last_run)}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReport(report.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery ? 'No reports match your search' : 'No saved reports'}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Report Configuration and Results */}
        <Grid item xs={12} md={9}>
          {(selectedReport || isCreating) && reportConfig ? (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" component="h2">
                  {isEditing ? (
                    isCreating ? 'Create New Report' : `Edit Report: ${reportConfig.name}`
                  ) : (
                    reportConfig.name
                  )}
                </Typography>
                <Box>
                  {isEditing ? (
                    <>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                          if (isCreating) {
                            setIsCreating(false);
                            setSelectedReport(null);
                            setReportConfig(null);
                          } else {
                            setIsEditing(false);
                            // Reload original config
                            handleReportSelect(selectedReport);
                          }
                        }}
                        sx={{ mr: 1 }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveReport}
                      >
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={handleEditReport}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<RefreshIcon />}
                        onClick={() => handleRunReport()}
                        disabled={loadingReportData}
                      >
                        Run Report
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
              
              {isEditing ? (
                // Report Configuration Form
                <Box component="form">
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Report Name"
                        name="name"
                        value={reportConfig.name}
                        onChange={handleInputChange}
                        required
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel id="report-type-label">Report Type</InputLabel>
                        <Select
                          labelId="report-type-label"
                          id="type"
                          name="type"
                          value={reportConfig.type}
                          onChange={handleReportTypeChange}
                          label="Report Type"
                        >
                          {reportTypes.map((type) => (
                            <MenuItem key={type.id} value={type.id}>
                              {type.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={reportConfig.description}
                        onChange={handleInputChange}
                        multiline
                        rows={2}
                        margin="normal"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" gutterBottom>
                        Visualization Settings
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl component="fieldset" margin="normal">
                        <FormLabel component="legend">Visualization Type</FormLabel>
                        <RadioGroup
                          row
                          name="visualization"
                          value={reportConfig.visualization}
                          onChange={handleVisualizationChange}
                        >
                          <FormControlLabel value="bar" control={<Radio />} label="Bar Chart" />
                          <FormControlLabel value="line" control={<Radio />} label="Line Chart" />
                          <FormControlLabel value="pie" control={<Radio />} label="Pie Chart" />
                          <FormControlLabel value="table" control={<Radio />} label="Table" />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel id="grouping-label">Group By</InputLabel>
                        <Select
                          labelId="grouping-label"
                          id="grouping"
                          name="grouping"
                          value={reportConfig.grouping}
                          onChange={handleGroupingChange}
                          label="Group By"
                        >
                          <MenuItem value="">None</MenuItem>
                          {getAvailableFields().map((field) => (
                            <MenuItem key={field.id} value={field.id}>
                              {field.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" gutterBottom>
                        <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Filters
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Start Date"
                          value={new Date(reportConfig.filters.date_range.start_date)}
                          onChange={handleStartDateChange}
                          renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                        />
                      </LocalizationProvider>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="End Date"
                          value={new Date(reportConfig.filters.date_range.end_date)}
                          onChange={handleEndDateChange}
                          renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                        />
                      </LocalizationProvider>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel id="facilities-label">Facilities</InputLabel>
                        <Select
                          labelId="facilities-label"
                          id="facilities"
                          multiple
                          value={reportConfig.filters.facilities}
                          onChange={handleFacilitiesChange}
                          label="Facilities"
                          renderValue={(selected) => {
                            if (selected.includes('all')) return 'All Facilities';
                            
                            return selected.map(id => {
                              const facility = referenceData?.facilities.find(f => f.id === id);
                              return facility ? facility.name : id;
                            }).join(', ');
                          }}
                        >
                          <MenuItem value="all">
                            <Checkbox checked={reportConfig.filters.facilities.includes('all')} />
                            <ListItemText primary="All Facilities" />
                          </MenuItem>
                          
                          {referenceData?.facilities.map((facility) => (
                            <MenuItem key={facility.id} value={facility.id}>
                              <Checkbox checked={reportConfig.filters.facilities.includes(facility.id)} />
                              <ListItemText primary={facility.name} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel id="lgas-label">Local Government Areas</InputLabel>
                        <Select
                          labelId="lgas-label"
                          id="lgas"
                          multiple
                          value={reportConfig.filters.lgas}
                          onChange={handleLGAsChange}
                          label="Local Government Areas"
                          renderValue={(selected) => {
                            if (selected.includes('all')) return 'All LGAs';
                            
                            return selected.map(id => {
                              const lga = referenceData?.lgas.find(l => l.id === id);
                              return lga ? lga.name : id;
                            }).join(', ');
                          }}
                        >
                          <MenuItem value="all">
                            <Checkbox checked={reportConfig.filters.lgas.includes('all')} />
                            <ListItemText primary="All LGAs" />
                          </MenuItem>
                          
                          {referenceData?.lgas.map((lga) => (
                            <MenuItem key={lga.id} value={lga.id}>
                              <Checkbox checked={reportConfig.filters.lgas.includes(lga.id)} />
                              <ListItemText primary={lga.name} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {/* Add more type-specific filters here based on report type */}
                    {reportConfig.type === 'births' && (
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth margin="normal">
                          <InputLabel id="gender-label">Gender</InputLabel>
                          <Select
                            labelId="gender-label"
                            id="gender"
                            multiple
                            value={reportConfig.filters.gender || ['all']}
                            onChange={(e) => {
                              setReportConfig(prevConfig => ({
                                ...prevConfig,
                                filters: {
                                  ...prevConfig.filters,
                                  gender: e.target.value
                                }
                              }));
                            }}
                            label="Gender"
                            renderValue={(selected) => {
                              if (selected.includes('all')) return 'All';
                              return selected.join(', ');
                            }}
                          >
                            <MenuItem value="all">
                              <Checkbox checked={(reportConfig.filters.gender || ['all']).includes('all')} />
                              <ListItemText primary="All" />
                            </MenuItem>
                            <MenuItem value="Male">
                              <Checkbox checked={(reportConfig.filters.gender || []).includes('Male')} />
                              <ListItemText primary="Male" />
                            </MenuItem>
                            <MenuItem value="Female">
                              <Checkbox checked={(reportConfig.filters.gender || []).includes('Female')} />
                              <ListItemText primary="Female" />
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    
                    {reportConfig.type === 'immunizations' && (
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth margin="normal">
                          <InputLabel id="vaccines-label">Vaccine Types</InputLabel>
                          <Select
                            labelId="vaccines-label"
                            id="vaccines"
                            multiple
                            value={reportConfig.filters.vaccine_types || ['all']}
                            onChange={(e) => {
                              setReportConfig(prevConfig => ({
                                ...prevConfig,
                                filters: {
                                  ...prevConfig.filters,
                                  vaccine_types: e.target.value
                                }
                              }));
                            }}
                            label="Vaccine Types"
                            renderValue={(selected) => {
                              if (selected.includes('all')) return 'All Vaccines';
                              
                              return selected.map(id => {
                                const vaccine = referenceData?.vaccines.find(v => v.id === id);
                                return vaccine ? vaccine.name : id;
                              }).join(', ');
                            }}
                          >
                            <MenuItem value="all">
                              <Checkbox checked={(reportConfig.filters.vaccine_types || ['all']).includes('all')} />
                              <ListItemText primary="All Vaccines" />
                            </MenuItem>
                            
                            {referenceData?.vaccines.map((vaccine) => (
                              <MenuItem key={vaccine.id} value={vaccine.id}>
                                <Checkbox checked={(reportConfig.filters.vaccine_types || []).includes(vaccine.id)} />
                                <ListItemText primary={vaccine.name} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    
                    {reportConfig.type === 'diseases' && (
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth margin="normal">
                          <InputLabel id="diseases-label">Disease Types</InputLabel>
                          <Select
                            labelId="diseases-label"
                            id="diseases"
                            multiple
                            value={reportConfig.filters.disease_types || ['all']}
                            onChange={(e) => {
                              setReportConfig(prevConfig => ({
                                ...prevConfig,
                                filters: {
                                  ...prevConfig.filters,
                                  disease_types: e.target.value
                                }
                              }));
                            }}
                            label="Disease Types"
                            renderValue={(selected) => {
                              if (selected.includes('all')) return 'All Diseases';
                              
                              return selected.map(id => {
                                const disease = referenceData?.diseases.find(d => d.id === id);
                                return disease ? disease.name : id;
                              }).join(', ');
                            }}
                          >
                            <MenuItem value="all">
                              <Checkbox checked={(reportConfig.filters.disease_types || ['all']).includes('all')} />
                              <ListItemText primary="All Diseases" />
                            </MenuItem>
                            
                            {referenceData?.diseases.map((disease) => (
                              <MenuItem key={disease.id} value={disease.id}>
                                <Checkbox checked={(reportConfig.filters.disease_types || []).includes(disease.id)} />
                                <ListItemText primary={disease.name} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" gutterBottom>
                        <PlaylistAddCheckIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Display Options
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl component="fieldset" margin="normal">
                        <FormLabel component="legend">Metrics</FormLabel>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={reportConfig.metrics.includes('count')}
                                onChange={handleMetricsChange}
                                value="count"
                              />
                            }
                            label="Count"
                          />
                          {/* Add more metrics as needed */}
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={reportConfig.metrics.includes('percentage')}
                                onChange={handleMetricsChange}
                                value="percentage"
                              />
                            }
                            label="Percentage"
                          />
                        </FormGroup>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl component="fieldset" margin="normal">
                        <FormLabel component="legend">Columns</FormLabel>
                        <FormGroup>
                          {getAvailableFields().map((field) => (
                            <FormControlLabel
                              key={field.id}
                              control={
                                <Checkbox
                                  checked={reportConfig.columns.includes(field.id)}
                                  onChange={handleColumnsChange}
                                  value={field.id}
                                />
                              }
                              label={field.name}
                            />
                          ))}
                        </FormGroup>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={reportConfig.shared || false}
                            onChange={(e) => {
                              setReportConfig(prevConfig => ({
                                ...prevConfig,
                                shared: e.target.checked
                              }));
                            }}
                            name="shared"
                          />
                        }
                        label="Share this report with other users"
                      />
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                // Report Results
                <Box>
                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}
                  
                  {/* Report description */}
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {reportConfig.description}
                  </Typography>
                  
                  {/* Report metadata */}
                  <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2">
                          <strong>Type:</strong> {getReportTypeName(reportConfig.type)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2">
                          <strong>Date Range:</strong> {format(new Date(reportConfig.filters.date_range.start_date), 'MMM dd, yyyy')} - {format(new Date(reportConfig.filters.date_range.end_date), 'MMM dd, yyyy')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2">
                          <strong>Last Run:</strong> {getTimeSince(reportResults?.metadata?.run_date || reportConfig.last_run)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2">
                          <strong>Created:</strong> {formatDate(reportConfig.created_at)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  {/* Report results */}
                  <Divider sx={{ my: 2 }} />
                  
                  {loadingReportData ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                      <CircularProgress />
                    </Box>
                  ) : reportResults?.data ? (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          Results
                        </Typography>
                        <Box>
                          <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => alert('Export functionality would be implemented here')}
                          >
                            Export
                          </Button>
                        </Box>
                      </Box>
                      
                      {/* Visualization */}
                      {reportConfig.visualization !== 'table' && (
                        <Box sx={{ mb: 3 }}>
                          {renderVisualization(reportConfig.visualization, reportResults.data)}
                        </Box>
                      )}
                      
                      {/* Data Table */}
                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          <TableChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Data Table
                        </Typography>
                        {renderDataTable(reportResults.data)}
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Run the report to see results
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<RefreshIcon />}
                        onClick={() => handleRunReport()}
                        sx={{ mt: 2 }}
                      >
                        Run Report
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Select a report or create a new one
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Choose a saved report from the list or create a new custom report.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateNewReport}
                sx={{ mt: 2 }}
              >
                Create New Report
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Report
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this report? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>
            Cancel
          </Button>
          <Button onClick={confirmDeleteReport} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default CustomReports;