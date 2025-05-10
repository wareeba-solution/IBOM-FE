// src/pages/reports/GeneralStatistics.js
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
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  DatePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Assessment as AssessmentIcon,
  Autorenew as AutorenewIcon,
  DateRange as DateRangeIcon,
  GetApp as GetAppIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  BubbleChart as BubbleChartIcon,
  MapOutlined as MapOutlinedIcon
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
  Line,
  AreaChart,
  Area
} from 'recharts';

// Mock report service - replace with actual service when available
const reportService = {
  getGeneralStatistics: async (params) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          summary: {
            total_births: 1248,
            total_deaths: 286,
            immunizations_given: 3512,
            antenatal_visits: 1876,
            disease_cases: 742,
            family_planning_consultations: 893
          },
          birth_data: {
            by_month: [
              { month: 'Jan', count: 98 },
              { month: 'Feb', count: 87 },
              { month: 'Mar', count: 105 },
              { month: 'Apr', count: 115 },
              { month: 'May', count: 120 },
              { month: 'Jun', count: 109 },
              { month: 'Jul', count: 114 },
              { month: 'Aug', count: 112 },
              { month: 'Sep', count: 98 },
              { month: 'Oct', count: 115 },
              { month: 'Nov', count: 94 },
              { month: 'Dec', count: 81 }
            ],
            by_facility: [
              { facility: 'Uyo General Hospital', count: 425 },
              { facility: 'Ikot Ekpene Medical Center', count: 287 },
              { facility: 'Eket Community Hospital', count: 236 },
              { facility: 'Abak Primary Healthcare', count: 165 },
              { facility: 'Oron District Hospital', count: 135 }
            ],
            by_gender: [
              { gender: 'Male', count: 642 },
              { gender: 'Female', count: 606 }
            ]
          },
          death_data: {
            by_month: [
              { month: 'Jan', count: 25 },
              { month: 'Feb', count: 22 },
              { month: 'Mar', count: 28 },
              { month: 'Apr', count: 24 },
              { month: 'May', count: 21 },
              { month: 'Jun', count: 26 },
              { month: 'Jul', count: 27 },
              { month: 'Aug', count: 24 },
              { month: 'Sep', count: 23 },
              { month: 'Oct', count: 24 },
              { month: 'Nov', count: 22 },
              { month: 'Dec', count: 20 }
            ],
            by_cause: [
              { cause: 'Cardiovascular Diseases', count: 78 },
              { cause: 'Infectious Diseases', count: 65 },
              { cause: 'Cancer', count: 54 },
              { cause: 'Respiratory Diseases', count: 42 },
              { cause: 'Accidents/Trauma', count: 32 },
              { cause: 'Other', count: 15 }
            ],
            by_age_group: [
              { age_group: '0-5', count: 32 },
              { age_group: '6-18', count: 14 },
              { age_group: '19-35', count: 38 },
              { age_group: '36-50', count: 62 },
              { age_group: '51-65', count: 75 },
              { age_group: '66+', count: 65 }
            ]
          },
          immunization_data: {
            by_month: [
              { month: 'Jan', count: 267 },
              { month: 'Feb', count: 248 },
              { month: 'Mar', count: 305 },
              { month: 'Apr', count: 298 },
              { month: 'May', count: 312 },
              { month: 'Jun', count: 287 },
              { month: 'Jul', count: 324 },
              { month: 'Aug', count: 298 },
              { month: 'Sep', count: 287 },
              { month: 'Oct', count: 305 },
              { month: 'Nov', count: 292 },
              { month: 'Dec', count: 289 }
            ],
            by_type: [
              { type: 'BCG', count: 452 },
              { type: 'OPV', count: 648 },
              { type: 'Pentavalent', count: 586 },
              { type: 'PCV', count: 542 },
              { type: 'Measles', count: 478 },
              { type: 'Yellow Fever', count: 412 },
              { type: 'Rotavirus', count: 394 }
            ]
          },
          antenatal_data: {
            by_month: [
              { month: 'Jan', count: 142 },
              { month: 'Feb', count: 135 },
              { month: 'Mar', count: 158 },
              { month: 'Apr', count: 165 },
              { month: 'May', count: 172 },
              { month: 'Jun', count: 168 },
              { month: 'Jul', count: 176 },
              { month: 'Aug', count: 165 },
              { month: 'Sep', count: 152 },
              { month: 'Oct', count: 158 },
              { month: 'Nov', count: 145 },
              { month: 'Dec', count: 140 }
            ],
            by_visit_number: [
              { visit: '1st Visit', count: 486 },
              { visit: '2nd Visit', count: 425 },
              { visit: '3rd Visit', count: 382 },
              { visit: '4th Visit', count: 328 },
              { visit: '5+ Visits', count: 255 }
            ]
          },
          disease_data: {
            by_month: [
              { month: 'Jan', count: 52 },
              { month: 'Feb', count: 48 },
              { month: 'Mar', count: 65 },
              { month: 'Apr', count: 72 },
              { month: 'May', count: 78 },
              { month: 'Jun', count: 64 },
              { month: 'Jul', count: 68 },
              { month: 'Aug', count: 74 },
              { month: 'Sep', count: 65 },
              { month: 'Oct', count: 58 },
              { month: 'Nov', count: 54 },
              { month: 'Dec', count: 44 }
            ],
            by_disease: [
              { disease: 'Malaria', count: 285 },
              { disease: 'Respiratory Infections', count: 172 },
              { disease: 'Diarrheal Diseases', count: 98 },
              { disease: 'Typhoid', count: 65 },
              { disease: 'Tuberculosis', count: 42 },
              { disease: 'Measles', count: 38 },
              { disease: 'Others', count: 42 }
            ]
          },
          family_planning_data: {
            by_month: [
              { month: 'Jan', count: 68 },
              { month: 'Feb', count: 72 },
              { month: 'Mar', count: 76 },
              { month: 'Apr', count: 82 },
              { month: 'May', count: 78 },
              { month: 'Jun', count: 74 },
              { month: 'Jul', count: 79 },
              { month: 'Aug', count: 75 },
              { month: 'Sep', count: 72 },
              { month: 'Oct', count: 76 },
              { month: 'Nov', count: 71 },
              { month: 'Dec', count: 70 }
            ],
            by_method: [
              { method: 'Hormonal Contraceptives', count: 324 },
              { method: 'IUDs', count: 178 },
              { method: 'Implants', count: 215 },
              { method: 'Condoms', count: 106 },
              { method: 'Natural Methods', count: 70 }
            ]
          }
        });
      }, 1000);
    });
  }
};

// Chart color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`statistics-tabpanel-${index}`}
      aria-labelledby={`statistics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// General Statistics Component
const GeneralStatistics = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { loading, error, execute } = useApi();

  // State
  const [statistics, setStatistics] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(subMonths(new Date(), 11)),
    endDate: endOfMonth(new Date())
  });
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [selectedLGA, setSelectedLGA] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [chartType, setChartType] = useState({
    births: 'bar',
    deaths: 'bar',
    immunizations: 'bar',
    antenatal: 'bar',
    diseases: 'bar',
    familyPlanning: 'bar'
  });

  // Mock facility options
  const facilityOptions = [
    { value: 'all', label: 'All Facilities' },
    { value: 'uyo-general', label: 'Uyo General Hospital' },
    { value: 'ikot-ekpene', label: 'Ikot Ekpene Medical Center' },
    { value: 'eket', label: 'Eket Community Hospital' },
    { value: 'abak', label: 'Abak Primary Healthcare' },
    { value: 'oron', label: 'Oron District Hospital' }
  ];

  // Mock LGA options
  const lgaOptions = [
    { value: 'all', label: 'All LGAs' },
    { value: 'uyo', label: 'Uyo' },
    { value: 'ikot-ekpene', label: 'Ikot Ekpene' },
    { value: 'eket', label: 'Eket' },
    { value: 'abak', label: 'Abak' },
    { value: 'oron', label: 'Oron' },
    { value: 'ibiono-ibom', label: 'Ibiono Ibom' },
    { value: 'itu', label: 'Itu' },
    { value: 'nsit-ubium', label: 'Nsit Ubium' },
    { value: 'ikot-abasi', label: 'Ikot Abasi' }
  ];

  // Fetch statistics data
  useEffect(() => {
    const loadStatistics = async () => {
      const params = {
        start_date: format(dateRange.startDate, 'yyyy-MM-dd'),
        end_date: format(dateRange.endDate, 'yyyy-MM-dd'),
        facility: selectedFacility,
        lga: selectedLGA
      };

      await execute(
        reportService.getGeneralStatistics,
        [params],
        (response) => {
          setStatistics(response);
        }
      );
    };

    loadStatistics();
  }, [dateRange, selectedFacility, selectedLGA]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle chart type change
  const handleChartTypeChange = (section, type) => {
    setChartType(prevState => ({
      ...prevState,
      [section]: type
    }));
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

  // Handle facility change
  const handleFacilityChange = (event) => {
    setSelectedFacility(event.target.value);
  };

  // Handle LGA change
  const handleLGAChange = (event) => {
    setSelectedLGA(event.target.value);
  };

  // Handle refresh data
  const handleRefreshData = () => {
    const params = {
      start_date: format(dateRange.startDate, 'yyyy-MM-dd'),
      end_date: format(dateRange.endDate, 'yyyy-MM-dd'),
      facility: selectedFacility,
      lga: selectedLGA
    };

    execute(
      reportService.getGeneralStatistics,
      [params],
      (response) => {
        setStatistics(response);
      }
    );
  };

  // Handle export data
  const handleExportData = () => {
    // Implement export functionality
    alert('Export functionality would be implemented here');
  };

  // Handle print data
  const handlePrintData = () => {
    window.print();
  };

  // Handle share data
  const handleShareData = () => {
    // Implement share functionality
    alert('Share functionality would be implemented here');
  };

  // Render chart based on type
  const renderChart = (section, data, dataKey, nameKey) => {
    switch (chartType[section]) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={nameKey} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey={dataKey} fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={nameKey} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey={dataKey} stroke="#1976d2" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={nameKey} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Area type="monotone" dataKey={dataKey} stroke="#1976d2" fill="#1976d2" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey={nameKey}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  // Render summary card
  const renderSummaryCard = (title, value, icon) => {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'primary.light',
                  borderRadius: '50%',
                  width: 56,
                  height: 56,
                  color: 'primary.main'
                }}
              >
                {icon}
              </Box>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" component="div" color="primary.main">
                {value.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (loading && !statistics) {
    return (
      <MainLayout title="General Statistics">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="General Statistics"
      breadcrumbs={[
        { name: 'Reports', path: '/reports' },
        { name: 'General Statistics', active: true }
      ]}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
          <Typography variant="h5" component="h1" sx={{ mb: { xs: 2, md: 0 } }}>
            <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            General Health Statistics
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<AutorenewIcon />}
              onClick={handleRefreshData}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<GetAppIcon />}
              onClick={handleExportData}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrintData}
            >
              Print
            </Button>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={handleShareData}
            >
              Share
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
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
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <MapOutlinedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Location Filter
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="facility-label">Facility</InputLabel>
                      <Select
                        labelId="facility-label"
                        id="facility"
                        value={selectedFacility}
                        onChange={handleFacilityChange}
                        label="Facility"
                      >
                        {facilityOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="lga-label">Local Government Area</InputLabel>
                      <Select
                        labelId="lga-label"
                        id="lga"
                        value={selectedLGA}
                        onChange={handleLGAChange}
                        label="Local Government Area"
                      >
                        {lgaOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {statistics && (
          <>
            {/* Summary Cards */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Summary Statistics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  {renderSummaryCard('Total Births', statistics.summary.total_births, <BarChartIcon fontSize="large" />)}
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  {renderSummaryCard('Total Deaths', statistics.summary.total_deaths, <PieChartIcon fontSize="large" />)}
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  {renderSummaryCard('Immunizations', statistics.summary.immunizations_given, <TimelineIcon fontSize="large" />)}
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  {renderSummaryCard('Antenatal Visits', statistics.summary.antenatal_visits, <BubbleChartIcon fontSize="large" />)}
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  {renderSummaryCard('Disease Cases', statistics.summary.disease_cases, <PieChartIcon fontSize="large" />)}
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  {renderSummaryCard('Family Planning', statistics.summary.family_planning_consultations, <TimelineIcon fontSize="large" />)}
                </Grid>
              </Grid>
            </Box>

            {/* Detailed Statistics Tabs */}
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant={isMobile ? "scrollable" : "fullWidth"}
                  scrollButtons={isMobile ? "auto" : false}
                  aria-label="statistics tabs"
                >
                  <Tab label="Births" />
                  <Tab label="Deaths" />
                  <Tab label="Immunizations" />
                  <Tab label="Antenatal" />
                  <Tab label="Diseases" />
                  <Tab label="Family Planning" />
                </Tabs>
              </Box>

              {/* Birth Statistics */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Birth Statistics
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Bar Chart">
                        <IconButton
                          color={chartType.births === 'bar' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('births', 'bar')}
                        >
                          <BarChartIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Line Chart">
                        <IconButton
                          color={chartType.births === 'line' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('births', 'line')}
                        >
                          <TimelineIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Area Chart">
                        <IconButton
                          color={chartType.births === 'area' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('births', 'area')}
                        >
                          <BubbleChartIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Pie Chart">
                        <IconButton
                          color={chartType.births === 'pie' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('births', 'pie')}
                        >
                          <PieChartIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Card>
                        <CardHeader title="Births by Month" />
                        <Divider />
                        <CardContent>
                          {renderChart('births', statistics.birth_data.by_month, 'count', 'month')}
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ height: '100%' }}>
                        <CardHeader title="Births by Gender" />
                        <Divider />
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={statistics.birth_data.by_gender}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="gender"
                                label={({ gender, percent }) => `${gender}: ${(percent * 100).toFixed(0)}%`}
                              >
                                <Cell fill="#1976d2" />
                                <Cell fill="#ff8042" />
                              </Pie>
                              <RechartsTooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12}>
                      <Card>
                        <CardHeader title="Births by Facility" />
                        <Divider />
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={statistics.birth_data.by_facility} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis type="category" dataKey="facility" width={100} />
                              <RechartsTooltip />
                              <Legend />
                              <Bar dataKey="count" fill="#1976d2" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Death Statistics */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Death Statistics
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Bar Chart">
                        <IconButton
                          color={chartType.deaths === 'bar' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('deaths', 'bar')}
                        >
                          <BarChartIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Line Chart">
                        <IconButton
                          color={chartType.deaths === 'line' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('deaths', 'line')}
                        >
                          <TimelineIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Area Chart">
                        <IconButton
                          color={chartType.deaths === 'area' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('deaths', 'area')}
                        >
                          <BubbleChartIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Pie Chart">
                        <IconButton
                          color={chartType.deaths === 'pie' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('deaths', 'pie')}
                        >
                          <PieChartIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Card>
                        <CardHeader title="Deaths by Month" />
                        <Divider />
                        <CardContent>
                          {renderChart('deaths', statistics.death_data.by_month, 'count', 'month')}
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ height: '100%' }}>
                        <CardHeader title="Deaths by Cause" />
                        <Divider />
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={statistics.death_data.by_cause}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="cause"
                                label={({ cause, percent }) => `${(percent * 100).toFixed(0)}%`}
                              >
                                {statistics.death_data.by_cause.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12}>
                      <Card>
                        <CardHeader title="Deaths by Age Group" />
                        <Divider />
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={statistics.death_data.by_age_group} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="age_group" />
                              <YAxis />
                              <RechartsTooltip />
                              <Legend />
                              <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Immunization Statistics */}
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Immunization Statistics
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Bar Chart">
                        <IconButton
                          color={chartType.immunizations === 'bar' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('immunizations', 'bar')}
                        >
                          <BarChartIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Line Chart">
                        <IconButton
                          color={chartType.immunizations === 'line' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('immunizations', 'line')}
                        >
                          <TimelineIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Area Chart">
                        <IconButton
                          color={chartType.immunizations === 'area' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('immunizations', 'area')}
                        >
                          <BubbleChartIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Pie Chart">
                        <IconButton
                          color={chartType.immunizations === 'pie' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('immunizations', 'pie')}
                        >
                          <PieChartIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Card>
                        <CardHeader title="Immunizations by Month" />
                        <Divider />
                        <CardContent>
                          {renderChart('immunizations', statistics.immunization_data.by_month, 'count', 'month')}
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ height: '100%' }}>
                        <CardHeader title="Immunizations by Type" />
                        <Divider />
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={statistics.immunization_data.by_type}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="type"
                                label={({ type, percent }) => `${(percent * 100).toFixed(0)}%`}
                              >
                                {statistics.immunization_data.by_type.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Antenatal Statistics */}
              <TabPanel value={tabValue} index={3}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Antenatal Statistics
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Bar Chart">
                        <IconButton
                          color={chartType.antenatal === 'bar' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('antenatal', 'bar')}
                        >
                          <BarChartIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Line Chart">
                        <IconButton
                          color={chartType.antenatal === 'line' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('antenatal', 'line')}
                        >
                          <TimelineIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Area Chart">
                        <IconButton
                          color={chartType.antenatal === 'area' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('antenatal', 'area')}
                        >
                          <BubbleChartIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Pie Chart">
                        <IconButton
                          color={chartType.antenatal === 'pie' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('antenatal', 'pie')}
                        >
                          <PieChartIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Card>
                        <CardHeader title="Antenatal Visits by Month" />
                        <Divider />
                        <CardContent>
                          {renderChart('antenatal', statistics.antenatal_data.by_month, 'count', 'month')}
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ height: '100%' }}>
                        <CardHeader title="Antenatal Visits by Number" />
                        <Divider />
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={statistics.antenatal_data.by_visit_number} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="visit" />
                              <YAxis />
                              <RechartsTooltip />
                              <Legend />
                              <Bar dataKey="count" fill="#00C49F" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Disease Statistics */}
              <TabPanel value={tabValue} index={4}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Disease Statistics
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Bar Chart">
                        <IconButton
                          color={chartType.diseases === 'bar' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('diseases', 'bar')}
                        >
                          <BarChartIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Line Chart">
                        <IconButton
                          color={chartType.diseases === 'line' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('diseases', 'line')}
                        >
                          <TimelineIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Area Chart">
                        <IconButton
                          color={chartType.diseases === 'area' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('diseases', 'area')}
                        >
                          <BubbleChartIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Pie Chart">
                        <IconButton
                          color={chartType.diseases === 'pie' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('diseases', 'pie')}
                        >
                          <PieChartIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Card>
                        <CardHeader title="Disease Cases by Month" />
                        <Divider />
                        <CardContent>
                          {renderChart('diseases', statistics.disease_data.by_month, 'count', 'month')}
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ height: '100%' }}>
                        <CardHeader title="Cases by Disease Type" />
                        <Divider />
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={statistics.disease_data.by_disease}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="disease"
                                label={({ disease, percent }) => `${(percent * 100).toFixed(0)}%`}
                              >
                                {statistics.disease_data.by_disease.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Family Planning Statistics */}
              <TabPanel value={tabValue} index={5}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Family Planning Statistics
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Bar Chart">
                        <IconButton
                          color={chartType.familyPlanning === 'bar' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('familyPlanning', 'bar')}
                        >
                          <BarChartIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Line Chart">
                        <IconButton
                          color={chartType.familyPlanning === 'line' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('familyPlanning', 'line')}
                        >
                          <TimelineIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Area Chart">
                        <IconButton
                          color={chartType.familyPlanning === 'area' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('familyPlanning', 'area')}
                        >
                          <BubbleChartIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Pie Chart">
                        <IconButton
                          color={chartType.familyPlanning === 'pie' ? 'primary' : 'default'}
                          onClick={() => handleChartTypeChange('familyPlanning', 'pie')}
                        >
                          <PieChartIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Card>
                        <CardHeader title="Family Planning Consultations by Month" />
                        <Divider />
                        <CardContent>
                          {renderChart('familyPlanning', statistics.family_planning_data.by_month, 'count', 'month')}
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ height: '100%' }}>
                        <CardHeader title="Consultations by Method" />
                        <Divider />
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={statistics.family_planning_data.by_method}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="method"
                                label={({ method, percent }) => `${(percent * 100).toFixed(0)}%`}
                              >
                                {statistics.family_planning_data.by_method.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>
            </Box>
          </>
        )}
      </Paper>
    </MainLayout>
  );
};

export default GeneralStatistics;