// src/pages/familyPlanning/FamilyPlanningStatistics.js
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
  Female as FemaleIcon,
  Male as MaleIcon,
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

// Mock family planning statistics service - replace with actual service when available
const familyPlanningStatisticsService = {
  getStatistics: async (params) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate mock data based on params
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
        
        // Method distribution data
        const methodDistribution = contraceptiveMethods.map(method => ({
          name: method,
          value: Math.floor(Math.random() * 200) + 10,
        }));
        
        // Filter by selected method if provided
        const filteredByMethod = params.method ? 
          methodDistribution.filter(d => d.name === params.method) : 
          methodDistribution;
        
        // Sort by usage count
        const sortedByMethod = [...filteredByMethod].sort((a, b) => b.value - a.value);
        
        // Visit type distribution
        const visitTypeDistribution = [
          { name: 'Initial Consultation', value: Math.floor(Math.random() * 150) + 50 },
          { name: 'Follow-up', value: Math.floor(Math.random() * 300) + 100 },
          { name: 'Method Change', value: Math.floor(Math.random() * 100) + 30 },
          { name: 'Method Renewal', value: Math.floor(Math.random() * 200) + 80 },
          { name: 'Side Effects Consultation', value: Math.floor(Math.random() * 80) + 20 },
          { name: 'Counseling Only', value: Math.floor(Math.random() * 50) + 10 },
          { name: 'Removal', value: Math.floor(Math.random() * 40) + 5 },
          { name: 'Other', value: Math.floor(Math.random() * 30) + 5 }
        ];
        
        // Gender distribution
        const genderDistribution = [
          { name: 'Female', value: Math.floor(Math.random() * 800) + 600 },
          { name: 'Male', value: Math.floor(Math.random() * 100) + 50 }
        ];
        
        // Age group distribution
        const ageGroupDistribution = [
          { name: '12-17', value: Math.floor(Math.random() * 30) + 10 },
          { name: '18-24', value: Math.floor(Math.random() * 200) + 100 },
          { name: '25-34', value: Math.floor(Math.random() * 300) + 200 },
          { name: '35-44', value: Math.floor(Math.random() * 200) + 100 },
          { name: '45+', value: Math.floor(Math.random() * 50) + 20 }
        ];
        
        // Marital status distribution
        const maritalStatusDistribution = [
          { name: 'Single', value: Math.floor(Math.random() * 200) + 100 },
          { name: 'Married', value: Math.floor(Math.random() * 500) + 300 },
          { name: 'Divorced', value: Math.floor(Math.random() * 100) + 50 },
          { name: 'Widowed', value: Math.floor(Math.random() * 50) + 20 }
        ];
        
        // New acceptors by month
        const newAcceptorTrend = [];
        for (let i = 11; i >= 0; i--) {
          const date = sub(new Date(), { months: i });
          const monthName = format(date, 'MMM yyyy');
          
          newAcceptorTrend.push({
            month: monthName,
            count: Math.floor(Math.random() * 50) + 10
          });
        }
        
        // Method usage trend - last 12 months
        const methodTrend = [];
        for (let i = 11; i >= 0; i--) {
          const date = sub(new Date(), { months: i });
          const monthName = format(date, 'MMM yyyy');
          
          // Generate data for each method for trend chart
          const methodData = {};
          contraceptiveMethods.forEach(method => {
            methodData[method] = Math.floor(Math.random() * 50) + 1;
          });
          
          methodTrend.push({
            month: monthName,
            ...methodData,
            total: Object.values(methodData).reduce((sum, val) => sum + val, 0)
          });
        }
        
        // Filter trend data based on date range if provided
        let filteredTrendData = [...methodTrend];
        if (params.start_date && params.end_date) {
          const startDate = parseISO(params.start_date);
          const endDate = parseISO(params.end_date);
          
          filteredTrendData = methodTrend.filter(item => {
            const itemDate = new Date(item.month);
            return (isAfter(itemDate, startDate) || isEqual(itemDate, startDate)) && 
                   (isBefore(itemDate, endDate) || isEqual(itemDate, endDate));
          });
        }
        
        // Side effects reported
        const sideEffectsData = [
          { name: 'Headache', value: Math.floor(Math.random() * 50) + 20 },
          { name: 'Nausea', value: Math.floor(Math.random() * 40) + 15 },
          { name: 'Weight Changes', value: Math.floor(Math.random() * 60) + 30 },
          { name: 'Mood Changes', value: Math.floor(Math.random() * 35) + 10 },
          { name: 'Irregular Bleeding', value: Math.floor(Math.random() * 70) + 40 },
          { name: 'Decreased Libido', value: Math.floor(Math.random() * 25) + 5 },
          { name: 'Other', value: Math.floor(Math.random() * 20) + 10 }
        ].sort((a, b) => b.value - a.value);
        
        // Side effects by method
        const sideEffectsByMethod = contraceptiveMethods.map(method => ({
          name: method,
          rate: Math.random() * 20 // Percentage of users reporting side effects
        })).sort((a, b) => b.rate - a.rate);
        
        // Method discontinuation reasons
        const discontinuationReasons = [
          { name: 'Side Effects', value: Math.floor(Math.random() * 60) + 30 },
          { name: 'Wants Pregnancy', value: Math.floor(Math.random() * 50) + 20 },
          { name: 'Method Failure', value: Math.floor(Math.random() * 10) + 5 },
          { name: 'Partner Objection', value: Math.floor(Math.random() * 30) + 10 },
          { name: 'Access Issues', value: Math.floor(Math.random() * 20) + 5 },
          { name: 'Health Concerns', value: Math.floor(Math.random() * 40) + 15 },
          { name: 'Other', value: Math.floor(Math.random() * 30) + 10 }
        ].sort((a, b) => b.value - a.value);
        
        // Location data
        const locationData = [
          { name: 'Uyo', value: Math.floor(Math.random() * 300) + 100 },
          { name: 'Ikot Ekpene', value: Math.floor(Math.random() * 200) + 80 },
          { name: 'Eket', value: Math.floor(Math.random() * 180) + 70 },
          { name: 'Oron', value: Math.floor(Math.random() * 150) + 50 },
          { name: 'Abak', value: Math.floor(Math.random() * 120) + 40 },
          { name: 'Other', value: Math.floor(Math.random() * 100) + 30 }
        ].sort((a, b) => b.value - a.value);
        
        // Summary statistics
        const totalUsers = sortedByMethod.reduce((sum, item) => sum + item.value, 0);
        const newAcceptors = newAcceptorTrend.reduce((sum, item) => sum + item.count, 0);
        const activeUsers = totalUsers - Math.floor(Math.random() * 200);
        const sideEffectsReported = sideEffectsData.reduce((sum, item) => sum + item.value, 0);
        const discontinuations = discontinuationReasons.reduce((sum, item) => sum + item.value, 0);
        
        resolve({
          summary: {
            totalUsers,
            newAcceptors,
            activeUsers,
            sideEffectsReported,
            discontinuations
          },
          methodDistribution: sortedByMethod,
          visitTypeDistribution,
          genderDistribution,
          ageGroupDistribution,
          maritalStatusDistribution,
          newAcceptorTrend,
          methodTrend: filteredTrendData,
          sideEffectsData,
          sideEffectsByMethod,
          discontinuationReasons,
          locationData
        });
      }, 800);
    });
  }
};

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57', '#ffc658'];
const GENDER_COLORS = { 'Female': '#f50057', 'Male': '#2196f3' };

// Family Planning Statistics Component
const FamilyPlanningStatistics = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [statistics, setStatistics] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [chartType, setChartType] = useState('bar');
  const [filters, setFilters] = useState({
    method: '',
    start_date: sub(new Date(), { months: 12 }),
    end_date: new Date(),
    location: '',
    age_group: '',
    marital_status: ''
  });

  // Fetch statistics data
  const fetchStatistics = async () => {
    const queryParams = {
      method: filters.method,
      start_date: filters.start_date ? format(filters.start_date, 'yyyy-MM-dd') : undefined,
      end_date: filters.end_date ? format(filters.end_date, 'yyyy-MM-dd') : undefined,
      location: filters.location,
      age_group: filters.age_group,
      marital_status: filters.marital_status
    };

    await execute(
      familyPlanningStatisticsService.getStatistics,
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
      method: '',
      start_date: sub(new Date(), { months: 12 }),
      end_date: new Date(),
      location: '',
      age_group: '',
      marital_status: ''
    });
    // Auto-fetch after reset
    setTimeout(fetchStatistics, 0);
  };

  // Navigate back to family planning list
  const handleBackToList = () => {
    navigate('/family-planning');
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

  // Format percentage
  const formatPercentage = (value, total) => {
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  // Render loading state
  if (loading && !statistics) {
    return (
      <MainLayout title="Family Planning Statistics">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  // Render error state
  if (error) {
    return (
      <MainLayout title="Family Planning Statistics">
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
      title="Family Planning Statistics"
      breadcrumbs={[
        { name: 'Family Planning', path: '/family-planning' },
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
              Family Planning Statistics
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
                <InputLabel id="method-label">Contraceptive Method</InputLabel>
                <Select
                  labelId="method-label"
                  name="method"
                  value={filters.method}
                  onChange={handleFilterChange}
                  label="Contraceptive Method"
                >
                  <MenuItem value="">All Methods</MenuItem>
                  {statistics && statistics.methodDistribution.map((item) => (
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
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      size="small" 
                      fullWidth 
                    />
                  )}
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
                <InputLabel id="marital-status-label">Marital Status</InputLabel>
                <Select
                  labelId="marital-status-label"
                  name="marital_status"
                  value={filters.marital_status}
                  onChange={handleFilterChange}
                  label="Marital Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Single">Single</MenuItem>
                  <MenuItem value="Married">Married</MenuItem>
                  <MenuItem value="Divorced">Divorced</MenuItem>
                  <MenuItem value="Widowed">Widowed</MenuItem>
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
            aria-label="family planning statistics tabs"
          >
            <Tab label="Method Distribution" />
            <Tab label="Demographics" />
            <Tab label="Trends" />
            <Tab label="Side Effects" />
            <Tab label="Location Analysis" />
          </Tabs>
        </Box>

        {/* Summary statistics */}
        {statistics && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="div" color="primary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatNumber(statistics.summary.totalUsers)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#e8f5e9', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="div" color="success.main" gutterBottom>
                    Active Users
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatNumber(statistics.summary.activeUsers)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#f3e5f5', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="div" color="secondary" gutterBottom>
                    New Acceptors
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatNumber(statistics.summary.newAcceptors)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#fff8e1', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="div" color="warning.main" gutterBottom>
                    Side Effects
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatNumber(statistics.summary.sideEffectsReported)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#ffebee', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="div" color="error" gutterBottom>
                    Discontinuations
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatNumber(statistics.summary.discontinuations)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tab panels */}
        {statistics && tabValue === 0 && (
          <Card sx={{ p: 3, mb: 3 }}>
            <CardHeader title="Contraceptive Method Distribution" />
            <Divider />
            <CardContent>
              {chartType === 'bar' && (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={statistics.methodDistribution}
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
                    <Bar dataKey="value" name="Number of Users" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {chartType === 'pie' && (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={statistics.methodDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {statistics.methodDistribution.map((entry, index) => (
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
                        <TableCell>Contraceptive Method</TableCell>
                        <TableCell align="right">Number of Users</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {statistics.methodDistribution.map((row) => (
                        <TableRow key={row.name}>
                          <TableCell component="th" scope="row">
                            {row.name}
                          </TableCell>
                          <TableCell align="right">{row.value}</TableCell>
                          <TableCell align="right">
                            {((row.value / statistics.summary.totalUsers) * 100).toFixed(1)}%
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
                  <CardHeader title="Gender Distribution" />
                  <Divider />
                  <CardContent>
                    {chartType === 'pie' && (
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={statistics.genderDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={130}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {statistics.genderDistribution.map((entry) => (
                              <Cell key={entry.name} fill={GENDER_COLORS[entry.name] || COLORS[0]} />
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
                          data={statistics.genderDistribution}
                          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Users" fill="#8884d8">
                            {statistics.genderDistribution.map((entry) => (
                              <Cell key={entry.name} fill={GENDER_COLORS[entry.name] || COLORS[0]} />
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
                              <TableCell>Gender</TableCell>
                              <TableCell align="right">Users</TableCell>
                              <TableCell align="right">Percentage</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {statistics.genderDistribution.map((row) => (
                              <TableRow key={row.name}>
                                <TableCell component="th" scope="row">
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {row.name === 'Female' ? 
                                      <FemaleIcon color="secondary" fontSize="small" sx={{ mr: 1 }} /> : 
                                      <MaleIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                                    }
                                    {row.name}
                                  </Box>
                                </TableCell>
                                <TableCell align="right">{row.value}</TableCell>
                                <TableCell align="right">
                                  {((row.value / statistics.genderDistribution.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
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
                  <CardHeader title="Age Group Distribution" />
                  <Divider />
                  <CardContent>
                    {chartType === 'pie' && (
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={statistics.ageGroupDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={130}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {statistics.ageGroupDistribution.map((entry, index) => (
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
                          data={statistics.ageGroupDistribution}
                          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Users" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    {chartType === 'table' && (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Age Group</TableCell>
                              <TableCell align="right">Users</TableCell>
                              <TableCell align="right">Percentage</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {statistics.ageGroupDistribution.map((row) => (
                              <TableRow key={row.name}>
                                <TableCell component="th" scope="row">
                                  {row.name}
                                </TableCell>
                                <TableCell align="right">{row.value}</TableCell>
                                <TableCell align="right">
                                  {((row.value / statistics.ageGroupDistribution.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
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
                  <CardHeader title="Marital Status Distribution" />
                  <Divider />
                  <CardContent>
                    {chartType === 'pie' && (
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={statistics.maritalStatusDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={130}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {statistics.maritalStatusDistribution.map((entry, index) => (
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
                          data={statistics.maritalStatusDistribution}
                          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Users" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    {chartType === 'table' && (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Marital Status</TableCell>
                              <TableCell align="right">Users</TableCell>
                              <TableCell align="right">Percentage</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {statistics.maritalStatusDistribution.map((row) => (
                              <TableRow key={row.name}>
                                <TableCell component="th" scope="row">
                                  {row.name}
                                </TableCell>
                                <TableCell align="right">{row.value}</TableCell>
                                <TableCell align="right">
                                  {((row.value / statistics.maritalStatusDistribution.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
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
                  <CardHeader title="Visit Type Distribution" />
                  <Divider />
                  <CardContent>
                    {chartType === 'pie' && (
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={statistics.visitTypeDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={130}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {statistics.visitTypeDistribution.map((entry, index) => (
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
                          data={statistics.visitTypeDistribution}
                          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Visits" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    {chartType === 'table' && (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Visit Type</TableCell>
                              <TableCell align="right">Count</TableCell>
                              <TableCell align="right">Percentage</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {statistics.visitTypeDistribution.map((row) => (
                              <TableRow key={row.name}>
                                <TableCell component="th" scope="row">
                                  {row.name}
                                </TableCell>
                                <TableCell align="right">{row.value}</TableCell>
                                <TableCell align="right">
                                  {((row.value / statistics.visitTypeDistribution.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
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
        
        {statistics && tabValue === 2 && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Contraceptive Method Usage Trend" />
                <Divider />
                <CardContent>
                  {chartType === 'line' && (
                    <ResponsiveContainer width="100%" height={500}>
                      <LineChart
                        data={statistics.methodTrend}
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
                          name="Total Users" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                        {filters.method ? (
                          <Line 
                            type="monotone" 
                            dataKey={filters.method} 
                            name={`${filters.method} Users`} 
                            stroke="#82ca9d" 
                            activeDot={{ r: 8 }} 
                          />
                        ) : (
                          <>
                            <Line type="monotone" dataKey="Oral Contraceptives" stroke="#ff7300" />
                            <Line type="monotone" dataKey="Injectable Contraceptives" stroke="#387908" />
                            <Line type="monotone" dataKey="Condoms" stroke="#9467bd" />
                          </>
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  {chartType === 'bar' && (
                    <ResponsiveContainer width="100%" height={500}>
                      <BarChart
                        data={statistics.methodTrend}
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
                        <Bar dataKey="total" name="Total Users" fill="#8884d8" />
                        {filters.method && (
                          <Bar dataKey={filters.method} name={`${filters.method} Users`} fill="#82ca9d" />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {chartType === 'table' && (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Month</TableCell>
                            <TableCell align="right">Total Users</TableCell>
                            {filters.method ? (
                              <TableCell align="right">{filters.method} Users</TableCell>
                            ) : (
                              <>
                                <TableCell align="right">Oral Contraceptives</TableCell>
                                <TableCell align="right">Injectable Contraceptives</TableCell>
                                <TableCell align="right">Condoms</TableCell>
                              </>
                            )}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {statistics.methodTrend.map((row) => (
                            <TableRow key={row.month}>
                              <TableCell component="th" scope="row">
                                {row.month}
                              </TableCell>
                              <TableCell align="right">{row.total}</TableCell>
                              {filters.method ? (
                                <TableCell align="right">{row[filters.method]}</TableCell>
                              ) : (
                                <>
                                  <TableCell align="right">{row['Oral Contraceptives']}</TableCell>
                                  <TableCell align="right">{row['Injectable Contraceptives']}</TableCell>
                                  <TableCell align="right">{row['Condoms']}</TableCell>
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
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardHeader title="New Acceptors Trend" />
                <Divider />
                <CardContent>
                  {(chartType === 'line' || chartType === 'bar') && (
                    <ResponsiveContainer width="100%" height={400}>
                      {chartType === 'line' ? (
                        <LineChart
                          data={statistics.newAcceptorTrend}
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
                            dataKey="count" 
                            name="New Acceptors" 
                            stroke="#8884d8" 
                            activeDot={{ r: 8 }} 
                          />
                        </LineChart>
                      ) : (
                        <BarChart
                          data={statistics.newAcceptorTrend}
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
                          <Bar dataKey="count" name="New Acceptors" fill="#8884d8" />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  )}
                  {chartType === 'table' && (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Month</TableCell>
                            <TableCell align="right">New Acceptors</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {statistics.newAcceptorTrend.map((row) => (
                            <TableRow key={row.month}>
                              <TableCell component="th" scope="row">
                                {row.month}
                              </TableCell>
                              <TableCell align="right">{row.count}</TableCell>
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
        )}
        
        {statistics && tabValue === 3 && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Reported Side Effects" />
                <Divider />
                <CardContent>
                  {chartType === 'pie' && (
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={statistics.sideEffectsData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {statistics.sideEffectsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  {chartType === 'bar' && (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={statistics.sideEffectsData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={120}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Reported Cases" fill="#ff9800" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {chartType === 'table' && (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Side Effect</TableCell>
                            <TableCell align="right">Reported Cases</TableCell>
                            <TableCell align="right">Percentage</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {statistics.sideEffectsData.map((row) => (
                            <TableRow key={row.name}>
                              <TableCell component="th" scope="row">
                                {row.name}
                              </TableCell>
                              <TableCell align="right">{row.value}</TableCell>
                              <TableCell align="right">
                                {((row.value / statistics.sideEffectsData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
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
              <Card>
                <CardHeader title="Side Effects Rate by Method" />
                <Divider />
                <CardContent>
                  {chartType === 'bar' && (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={statistics.sideEffectsByMethod}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 25]} tickFormatter={(value) => `${value}%`} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={150}
                          tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                        />
                        <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Side Effects Rate']} />
                        <Legend />
                        <Bar dataKey="rate" name="Side Effects Rate (%)" fill="#f44336" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {chartType === 'table' && (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Contraceptive Method</TableCell>
                            <TableCell align="right">Side Effects Rate</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {statistics.sideEffectsByMethod.map((row) => (
                            <TableRow key={row.name}>
                              <TableCell component="th" scope="row">
                                {row.name}
                              </TableCell>
                              <TableCell align="right">{row.rate.toFixed(1)}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Method Discontinuation Reasons" />
                <Divider />
                <CardContent>
                  {chartType === 'pie' && (
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={statistics.discontinuationReasons}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {statistics.discontinuationReasons.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  {chartType === 'bar' && (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={statistics.discontinuationReasons}
                        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={120}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Cases" fill="#e53935" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {chartType === 'table' && (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Reason</TableCell>
                            <TableCell align="right">Cases</TableCell>
                            <TableCell align="right">Percentage</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {statistics.discontinuationReasons.map((row) => (
                            <TableRow key={row.name}>
                              <TableCell component="th" scope="row">
                                {row.name}
                              </TableCell>
                              <TableCell align="right">{row.value}</TableCell>
                              <TableCell align="right">
                                {((row.value / statistics.discontinuationReasons.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
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
        )}
        
        {statistics && tabValue === 4 && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Geographical Distribution" />
                <Divider />
                <CardContent>
                  {chartType === 'pie' && (
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={statistics.locationData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={150}
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
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={statistics.locationData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Users" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {chartType === 'table' && (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Location</TableCell>
                            <TableCell align="right">Users</TableCell>
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
        )}
      </Paper>
    </MainLayout>
  );
};

export default FamilyPlanningStatistics;