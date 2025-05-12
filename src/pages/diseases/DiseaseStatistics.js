// src/pages/diseases/DiseaseStatistics.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/lab';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  ArrowBack as ArrowBackIcon,
  FileDownload as ExportIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Map as MapIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { format, parseISO, sub, isAfter, isBefore, isEqual } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';

// Mock disease statistics service - replace with actual service when available
const diseaseStatisticsService = {
  getDiseaseStats: async (params) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate mock data based on params
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
        
        // Disease by type data
        const diseaseByType = diseaseTypes.map(type => ({
          name: type,
          cases: Math.floor(Math.random() * 200) + 10,
        }));
        
        // Filter by selected disease if provided
        const filteredByType = params.disease_type ? 
          diseaseByType.filter(d => d.name === params.disease_type) : 
          diseaseByType;
        
        // Sort by cases count
        const sortedByType = [...filteredByType].sort((a, b) => b.cases - a.cases);
        
        // Disease by status
        const diseaseByStatus = [
          { name: 'Confirmed', value: Math.floor(Math.random() * 300) + 100 },
          { name: 'Suspected', value: Math.floor(Math.random() * 200) + 50 },
          { name: 'Probable', value: Math.floor(Math.random() * 100) + 20 },
          { name: 'Ruled Out', value: Math.floor(Math.random() * 150) + 30 }
        ];
        
        // Disease by severity
        const diseaseBySeverity = [
          { name: 'Mild', value: Math.floor(Math.random() * 300) + 100 },
          { name: 'Moderate', value: Math.floor(Math.random() * 200) + 80 },
          { name: 'Severe', value: Math.floor(Math.random() * 100) + 20 }
        ];
        
        // Disease by outcome
        const diseaseByOutcome = [
          { name: 'Under Treatment', value: Math.floor(Math.random() * 250) + 100 },
          { name: 'Recovered', value: Math.floor(Math.random() * 300) + 150 },
          { name: 'Hospitalized', value: Math.floor(Math.random() * 100) + 30 },
          { name: 'Death', value: Math.floor(Math.random() * 50) + 5 }
        ];
        
        // Trend data - last 12 months
        const trendData = [];
        for (let i = 11; i >= 0; i--) {
          const date = sub(new Date(), { months: i });
          const monthName = format(date, 'MMM yyyy');
          
          // Generate data for each disease type for trend chart
          const diseaseData = {};
          diseaseTypes.forEach(type => {
            diseaseData[type] = Math.floor(Math.random() * 50) + 1;
          });
          
          trendData.push({
            month: monthName,
            ...diseaseData,
            total: Object.values(diseaseData).reduce((sum, val) => sum + val, 0)
          });
        }
        
        // Filter trend data based on date range if provided
        let filteredTrendData = [...trendData];
        if (params.start_date && params.end_date) {
          const startDate = parseISO(params.start_date);
          const endDate = parseISO(params.end_date);
          
          filteredTrendData = trendData.filter(item => {
            const itemDate = new Date(item.month);
            return (isAfter(itemDate, startDate) || isEqual(itemDate, startDate)) && 
                   (isBefore(itemDate, endDate) || isEqual(itemDate, endDate));
          });
        }
        
        // Age group distribution
        const diseaseByAge = [
          { name: '0-5', value: Math.floor(Math.random() * 100) + 10 },
          { name: '6-17', value: Math.floor(Math.random() * 120) + 20 },
          { name: '18-35', value: Math.floor(Math.random() * 200) + 50 },
          { name: '36-50', value: Math.floor(Math.random() * 150) + 30 },
          { name: '51-65', value: Math.floor(Math.random() * 100) + 20 },
          { name: '65+', value: Math.floor(Math.random() * 80) + 10 }
        ];
        
        // Location data
        const locationData = [
          { name: 'Uyo', value: Math.floor(Math.random() * 200) + 50 },
          { name: 'Ikot Ekpene', value: Math.floor(Math.random() * 150) + 30 },
          { name: 'Eket', value: Math.floor(Math.random() * 120) + 20 },
          { name: 'Oron', value: Math.floor(Math.random() * 100) + 10 },
          { name: 'Abak', value: Math.floor(Math.random() * 80) + 10 },
          { name: 'Other', value: Math.floor(Math.random() * 50) + 5 }
        ].sort((a, b) => b.value - a.value);
        
        // Outbreak data
        const outbreakData = {
          total: Math.floor(Math.random() * 15) + 1,
          active: Math.floor(Math.random() * 5) + 1,
          locations: [
            { name: 'Uyo', cases: Math.floor(Math.random() * 50) + 10, status: 'Active' },
            { name: 'Ikot Ekpene', cases: Math.floor(Math.random() * 30) + 5, status: 'Contained' },
            { name: 'Eket', cases: Math.floor(Math.random() * 20) + 3, status: 'Active' }
          ],
          byDisease: [
            { name: 'Cholera', value: Math.floor(Math.random() * 5) + 1 },
            { name: 'Measles', value: Math.floor(Math.random() * 3) + 1 },
            { name: 'Meningitis', value: Math.floor(Math.random() * 2) + 1 },
            { name: 'Lassa Fever', value: Math.floor(Math.random() * 2) }
          ]
        };
        
        // Summary statistics
        const totalCases = sortedByType.reduce((sum, item) => sum + item.cases, 0);
        const activeCases = diseaseByStatus.find(item => item.name === 'Confirmed').value + 
                           diseaseByStatus.find(item => item.name === 'Suspected').value;
        const recoveredCases = diseaseByOutcome.find(item => item.name === 'Recovered').value;
        const deathCases = diseaseByOutcome.find(item => item.name === 'Death').value;
        const outbreakCount = outbreakData.total;
        
        resolve({
          summary: {
            totalCases,
            activeCases,
            recoveredCases,
            deathCases,
            outbreakCount
          },
          diseaseByType: sortedByType,
          diseaseByStatus,
          diseaseBySeverity,
          diseaseByOutcome,
          diseaseByAge,
          locationData,
          trendData: filteredTrendData,
          outbreakData
        });
      }, 800);
    });
  }
};

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57', '#ffc658'];
const STATUS_COLORS = { 'Confirmed': '#f44336', 'Suspected': '#ff9800', 'Probable': '#ffc107', 'Ruled Out': '#4caf50' };
const SEVERITY_COLORS = { 'Mild': '#4caf50', 'Moderate': '#ff9800', 'Severe': '#f44336' };
const OUTCOME_COLORS = { 'Under Treatment': '#2196f3', 'Recovered': '#4caf50', 'Hospitalized': '#ff9800', 'Death': '#f44336' };

// Disease Statistics Component
const DiseaseStatistics = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [statistics, setStatistics] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [chartType, setChartType] = useState('bar');
  const [filters, setFilters] = useState({
    disease_type: '',
    start_date: sub(new Date(), { months: 12 }),
    end_date: new Date(),
    location: '',
    age_group: '',
    status: ''
  });

  // Fetch statistics data
  const fetchStatistics = async () => {
    const queryParams = {
      disease_type: filters.disease_type,
      start_date: filters.start_date ? format(filters.start_date, 'yyyy-MM-dd') : undefined,
      end_date: filters.end_date ? format(filters.end_date, 'yyyy-MM-dd') : undefined,
      location: filters.location,
      age_group: filters.age_group,
      status: filters.status
    };

    await execute(
      diseaseStatisticsService.getDiseaseStats,
      [queryParams],
      (response) => {
        setStatistics(response);
      }
    );
  };

  // Initial data loading
  useEffect(() => {
    fetchStatistics();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date range change
  const handleDateChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    fetchStatistics();
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      disease_type: '',
      start_date: sub(new Date(), { months: 12 }),
      end_date: new Date(),
      location: '',
      age_group: '',
      status: ''
    });
    // Auto-fetch after reset
    setTimeout(fetchStatistics, 0);
  };

  // Navigate back to disease list
  const handleBackToList = () => {
    navigate('/diseases');
  };

  // Export data
  const handleExportData = () => {
    alert('Export functionality would be implemented here');
  };

  // Print report
  const handlePrintReport = () => {
    window.print();
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Render loading state
  if (loading && !statistics) {
    return (
      <MainLayout title="Disease Statistics">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  // Render error state
  if (error) {
    return (
      <MainLayout title="Disease Statistics">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />}
          onClick={fetchStatistics}
        >
          Retry
        </Button>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Communicable Disease Statistics"
      breadcrumbs={[
        { name: 'Diseases', path: '/diseases' },
        { name: 'Statistics', active: true }
      ]}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              onClick={handleBackToList}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              Communicable Disease Statistics
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrintReport}
              sx={{ mr: 1 }}
            >
              Print
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={handleExportData}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* Filter controls */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="disease-type-label">Disease Type</InputLabel>
                <Select
                  labelId="disease-type-label"
                  name="disease_type"
                  value={filters.disease_type}
                  onChange={handleFilterChange}
                  label="Disease Type"
                >
                  <MenuItem value="">All Diseases</MenuItem>
                  {statistics && statistics.diseaseByType.map((item) => (
                    <MenuItem key={item.name} value={item.name}>{item.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={filters.start_date}
                  onChange={(value) => handleDateChange('start_date', value)}
                  slotProps={{ 
                    textField: { 
                      size: 'small',
                      fullWidth: true 
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={2}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={filters.end_date}
                  onChange={(value) => handleDateChange('end_date', value)}
                  slotProps={{ 
                    textField: { 
                      size: 'small',
                      fullWidth: true 
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="location-label">Location</InputLabel>
                <Select
                  labelId="location-label"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  label="Location"
                >
                  <MenuItem value="">All Locations</MenuItem>
                  <MenuItem value="Uyo">Uyo</MenuItem>
                  <MenuItem value="Ikot Ekpene">Ikot Ekpene</MenuItem>
                  <MenuItem value="Eket">Eket</MenuItem>
                  <MenuItem value="Oron">Oron</MenuItem>
                  <MenuItem value="Abak">Abak</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="suspected">Suspected</MenuItem>
                  <MenuItem value="probable">Probable</MenuItem>
                  <MenuItem value="ruled_out">Ruled Out</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<FilterListIcon />}
                  onClick={handleApplyFilters}
                  size="small"
                >
                  Apply
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleResetFilters}
                  size="small"
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Chart type selector */}
        <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
          <Button
            variant={chartType === 'bar' ? 'contained' : 'outlined'}
            startIcon={<BarChartIcon />}
            onClick={() => setChartType('bar')}
          >
            Bar
          </Button>
          <Button
            variant={chartType === 'pie' ? 'contained' : 'outlined'}
            startIcon={<PieChartIcon />}
            onClick={() => setChartType('pie')}
          >
            Pie
          </Button>
          <Button
            variant={chartType === 'line' ? 'contained' : 'outlined'}
            startIcon={<TimelineIcon />}
            onClick={() => setChartType('line')}
          >
            Line
          </Button>
          <Button
            variant={chartType === 'table' ? 'contained' : 'outlined'}
            startIcon={<TableChartIcon />}
            onClick={() => setChartType('table')}
          >
            Table
          </Button>
        </Box>

        {/* Tabs for different statistical views */}
        <Box sx={{ width: '100%', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="disease statistics tabs"
          >
            <Tab label="Disease Distribution" />
            <Tab label="Status & Outcome" />
            <Tab label="Trends" />
            <Tab label="Demographics" />
            <Tab label="Outbreaks" />
          </Tabs>
        </Box>

        {/* Summary statistics */}
        {statistics && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="div" color="primary" gutterBottom>
                    Total Cases
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatNumber(statistics.summary.totalCases)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#fff8e1', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="div" color="warning.main" gutterBottom>
                    Active Cases
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatNumber(statistics.summary.activeCases)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#e8f5e9', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="div" color="success.main" gutterBottom>
                    Recovered
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatNumber(statistics.summary.recoveredCases)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#ffebee', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="div" color="error" gutterBottom>
                    Deaths
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatNumber(statistics.summary.deathCases)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#fce4ec', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="div" color="secondary" gutterBottom>
                    Outbreaks
                  </Typography>
                  <Typography variant="h4" component="div">
                    {statistics.summary.outbreakCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tab panels */}
        {statistics && tabValue === 0 && (
          <Card sx={{ p: 3, mb: 3 }}>
            <CardHeader title="Disease Distribution by Type" />
            <Divider />
            <CardContent>
              {chartType === 'bar' && (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={statistics.diseaseByType}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cases" name="Number of Cases" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {chartType === 'pie' && (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={statistics.diseaseByType}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="cases"
                      nameKey="name"
                      label={({name, cases, percent}) => `${name}: ${cases} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {statistics.diseaseByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {chartType === 'table' && (
                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Disease Type</TableCell>
                        <TableCell align="right">Number of Cases</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {statistics.diseaseByType.map((row) => (
                        <TableRow key={row.name}>
                          <TableCell component="th" scope="row">
                            {row.name}
                          </TableCell>
                          <TableCell align="right">{row.cases}</TableCell>
                          <TableCell align="right">
                            {((row.cases / statistics.summary.totalCases) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}
        
        {statistics && tabValue === 1 && (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader title="Disease Status Distribution" />
                  <Divider />
                  <CardContent>
                    {chartType === 'pie' && (
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={statistics.diseaseByStatus}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={130}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {statistics.diseaseByStatus.map((entry) => (
                              <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || COLORS[0]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    {chartType === 'bar' && (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                          data={statistics.diseaseByStatus}
                          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Cases" fill="#8884d8">
                            {statistics.diseaseByStatus.map((entry) => (
                              <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || COLORS[0]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    {chartType === 'table' && (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Status</TableCell>
                              <TableCell align="right">Cases</TableCell>
                              <TableCell align="right">Percentage</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {statistics.diseaseByStatus.map((row) => (
                              <TableRow key={row.name}>
                                <TableCell component="th" scope="row">
                                  {row.name}
                                </TableCell>
                                <TableCell align="right">{row.value}</TableCell>
                                <TableCell align="right">
                                  {((row.value / statistics.diseaseByStatus.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader title="Disease Outcome Distribution" />
                  <Divider />
                  <CardContent>
                    {chartType === 'pie' && (
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={statistics.diseaseByOutcome}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={130}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {statistics.diseaseByOutcome.map((entry) => (
                              <Cell key={entry.name} fill={OUTCOME_COLORS[entry.name] || COLORS[0]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    {chartType === 'bar' && (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                          data={statistics.diseaseByOutcome}
                          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Cases" fill="#8884d8">
                            {statistics.diseaseByOutcome.map((entry) => (
                              <Cell key={entry.name} fill={OUTCOME_COLORS[entry.name] || COLORS[0]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    {chartType === 'table' && (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Outcome</TableCell>
                              <TableCell align="right">Cases</TableCell>
                              <TableCell align="right">Percentage</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {statistics.diseaseByOutcome.map((row) => (
                              <TableRow key={row.name}>
                                <TableCell component="th" scope="row">
                                  {row.name}
                                </TableCell>
                                <TableCell align="right">{row.value}</TableCell>
                                <TableCell align="right">
                                  {((row.value / statistics.diseaseByOutcome.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Disease Severity Distribution" />
              <Divider />
              <CardContent>
                {chartType === 'pie' && (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={statistics.diseaseBySeverity}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={130}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {statistics.diseaseBySeverity.map((entry) => (
                          <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || COLORS[0]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {chartType === 'bar' && (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={statistics.diseaseBySeverity}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Cases" fill="#8884d8">
                        {statistics.diseaseBySeverity.map((entry) => (
                          <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || COLORS[0]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {chartType === 'table' && (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Severity</TableCell>
                          <TableCell align="right">Cases</TableCell>
                          <TableCell align="right">Percentage</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {statistics.diseaseBySeverity.map((row) => (
                          <TableRow key={row.name}>
                            <TableCell component="th" scope="row">
                              {row.name}
                            </TableCell>
                            <TableCell align="right">{row.value}</TableCell>
                            <TableCell align="right">
                              {((row.value / statistics.diseaseBySeverity.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </>
        )}
        
        {statistics && tabValue === 2 && (
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Disease Trend Over Time" />
            <Divider />
            <CardContent>
              {chartType === 'line' && (
                <ResponsiveContainer width="100%" height={500}>
                  <LineChart
                    data={statistics.trendData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      name="Total Cases" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                    {filters.disease_type ? (
                      <Line 
                        type="monotone" 
                        dataKey={filters.disease_type} 
                        name={`${filters.disease_type} Cases`} 
                        stroke="#82ca9d" 
                        activeDot={{ r: 8 }} 
                      />
                    ) : (
                      <>
                        <Line type="monotone" dataKey="Malaria" stroke="#ff7300" />
                        <Line type="monotone" dataKey="COVID-19" stroke="#387908" />
                        <Line type="monotone" dataKey="Tuberculosis" stroke="#9467bd" />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              )}
              {chartType === 'bar' && (
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart
                    data={statistics.trendData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" name="Total Cases" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {chartType === 'table' && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Month</TableCell>
                        <TableCell align="right">Total Cases</TableCell>
                        {filters.disease_type ? (
                          <TableCell align="right">{filters.disease_type} Cases</TableCell>
                        ) : (
                          <>
                            <TableCell align="right">Malaria</TableCell>
                            <TableCell align="right">Tuberculosis</TableCell>
                            <TableCell align="right">COVID-19</TableCell>
                          </>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {statistics.trendData.map((row) => (
                        <TableRow key={row.month}>
                          <TableCell component="th" scope="row">
                            {row.month}
                          </TableCell>
                          <TableCell align="right">{row.total}</TableCell>
                          {filters.disease_type ? (
                            <TableCell align="right">{row[filters.disease_type]}</TableCell>
                          ) : (
                            <>
                              <TableCell align="right">{row.Malaria}</TableCell>
                              <TableCell align="right">{row.Tuberculosis}</TableCell>
                              <TableCell align="right">{row['COVID-19']}</TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}
        
        {statistics && tabValue === 3 && (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader title="Disease Distribution by Age Group" />
                  <Divider />
                  <CardContent>
                    {chartType === 'pie' && (
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={statistics.diseaseByAge}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={130}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {statistics.diseaseByAge.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    {chartType === 'bar' && (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                          data={statistics.diseaseByAge}
                          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Cases" fill="#8884d8">
                            {statistics.diseaseByAge.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    {chartType === 'table' && (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Age Group</TableCell>
                              <TableCell align="right">Cases</TableCell>
                              <TableCell align="right">Percentage</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {statistics.diseaseByAge.map((row) => (
                              <TableRow key={row.name}>
                                <TableCell component="th" scope="row">
                                  {row.name}
                                </TableCell>
                                <TableCell align="right">{row.value}</TableCell>
                                <TableCell align="right">
                                  {((row.value / statistics.diseaseByAge.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader title="Disease Distribution by Location" />
                  <Divider />
                  <CardContent>
                    {chartType === 'pie' && (
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={statistics.locationData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={130}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {statistics.locationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    {chartType === 'bar' && (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                          data={statistics.locationData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Cases" fill="#8884d8">
                            {statistics.locationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    {chartType === 'table' && (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Location</TableCell>
                              <TableCell align="right">Cases</TableCell>
                              <TableCell align="right">Percentage</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {statistics.locationData.map((row) => (
                              <TableRow key={row.name}>
                                <TableCell component="th" scope="row">
                                  {row.name}
                                </TableCell>
                                <TableCell align="right">{row.value}</TableCell>
                                <TableCell align="right">
                                  {((row.value / statistics.locationData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
        
        {statistics && tabValue === 4 && (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader title="Disease Outbreaks by Type" />
                  <Divider />
                  <CardContent>
                    {chartType === 'pie' && (
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={statistics.outbreakData.byDisease}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={130}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {statistics.outbreakData.byDisease.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    {chartType === 'bar' && (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                          data={statistics.outbreakData.byDisease}
                          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Outbreaks" fill="#f44336">
                            {statistics.outbreakData.byDisease.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    {chartType === 'table' && (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Disease Type</TableCell>
                              <TableCell align="right">Outbreaks</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {statistics.outbreakData.byDisease.map((row) => (
                              <TableRow key={row.name}>
                                <TableCell component="th" scope="row">
                                  {row.name}
                                </TableCell>
                                <TableCell align="right">{row.value}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', bgcolor: '#fff8e1' }}>
                  <CardHeader 
                    title="Current Outbreak Status" 
                    subheader={`Total Outbreaks: ${statistics.outbreakData.total}, Active: ${statistics.outbreakData.active}`}
                  />
                  <Divider />
                  <CardContent>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Location</TableCell>
                            <TableCell align="right">Cases</TableCell>
                            <TableCell align="center">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {statistics.outbreakData.locations.map((row) => (
                            <TableRow key={row.name}>
                              <TableCell component="th" scope="row">
                                {row.name}
                              </TableCell>
                              <TableCell align="right">{row.cases}</TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={row.status} 
                                  color={row.status === 'Active' ? 'error' : 'success'} 
                                  size="small" 
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => navigate('/diseases/outbreak/new')}
                      >
                        Report New Outbreak
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>
    </MainLayout>
  );
};

export default DiseaseStatistics;