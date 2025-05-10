// src/pages/births/BirthStatistics.js
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  CircularProgress,
  Alert,
  TextField,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  GetApp as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, getYear, getMonth } from 'date-fns';

// Mock birth statistics service - replace with actual service when available
const birthStatisticsService = {
  getBirthStatistics: async (params) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate random data based on parameters
        const { period, year, month, startDate, endDate, location } = params;
        
        // Monthly data for line/bar charts
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
          month: format(new Date(year, i), 'MMM'),
          count: Math.floor(Math.random() * 100) + 50,
          male: Math.floor(Math.random() * 50) + 20,
          female: Math.floor(Math.random() * 50) + 20
        }));
        
        // Gender distribution for pie chart
        const genderData = [
          { name: 'Male', value: Math.floor(Math.random() * 500) + 300 },
          { name: 'Female', value: Math.floor(Math.random() * 500) + 300 }
        ];
        
        // Place of birth distribution for pie chart
        const placeOfBirthData = [
          { name: 'Hospital', value: Math.floor(Math.random() * 600) + 400 },
          { name: 'Home', value: Math.floor(Math.random() * 200) + 100 },
          { name: 'Other', value: Math.floor(Math.random() * 50) + 20 }
        ];
        
        // Summary statistics
        const summaryStats = {
          totalBirths: genderData.reduce((sum, item) => sum + item.value, 0),
          malePercentage: (genderData[0].value / genderData.reduce((sum, item) => sum + item.value, 0) * 100).toFixed(1),
          femalePercentage: (genderData[1].value / genderData.reduce((sum, item) => sum + item.value, 0) * 100).toFixed(1),
          hospitalBirths: (placeOfBirthData[0].value / placeOfBirthData.reduce((sum, item) => sum + item.value, 0) * 100).toFixed(1),
          homeBirths: (placeOfBirthData[1].value / placeOfBirthData.reduce((sum, item) => sum + item.value, 0) * 100).toFixed(1),
          averageWeight: (3.2 + Math.random() * 0.5).toFixed(2),
          monthWithHighestBirths: monthlyData.reduce((max, item) => item.count > max.count ? item : max, monthlyData[0]).month,
          yearOnYearChange: (Math.random() * 20 - 10).toFixed(1)
        };
        
        resolve({
          monthlyData,
          genderData,
          placeOfBirthData,
          summaryStats
        });
      }, 800);
    });
  }
};

// Constants
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Birth Statistics component
const BirthStatistics = () => {
  const { loading, error, execute } = useApi();
  
  // State
  const [statistics, setStatistics] = useState(null);
  const [period, setPeriod] = useState('year');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [startDate, setStartDate] = useState(subMonths(new Date(), 3));
  const [endDate, setEndDate] = useState(new Date());
  const [location, setLocation] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  
  // Fetch statistics based on filters
  const fetchStatistics = async () => {
    const params = {
      period,
      year,
      month,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      location
    };
    
    await execute(
      birthStatisticsService.getBirthStatistics,
      [params],
      (response) => {
        setStatistics(response);
      }
    );
  };
  
  // Load initial statistics
  useEffect(() => {
    fetchStatistics();
  }, []);
  
  // Handle filter changes
  useEffect(() => {
    fetchStatistics();
  }, [period, year, month, location]);
  
  // Custom date range filter (when period is 'custom')
  const handleApplyCustomDateRange = () => {
    fetchStatistics();
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ bgcolor: 'background.paper', p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
          <Typography variant="body2">{`${label}`}</Typography>
          {payload.map((entry, index) => (
            <Typography 
              key={`item-${index}`} 
              variant="body2" 
              sx={{ color: entry.color }}
            >
              {`${entry.name}: ${entry.value}`}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };
  
  // Render loading state
  if (loading && !statistics) {
    return (
      <MainLayout title="Birth Statistics">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }
  
  // Render error state
  if (error && !statistics) {
    return (
      <MainLayout title="Birth Statistics">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          component={RouterLink} 
          to="/births" 
          variant="contained"
          startIcon={<ArrowBackIcon />}
        >
          Back to Birth Records
        </Button>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout 
      title="Birth Statistics"
      breadcrumbs={[
        { name: 'Births', path: '/births' },
        { name: 'Statistics', active: true }
      ]}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/births"
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              Birth Statistics
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              sx={{ mr: 1 }}
            >
              Print Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
            >
              Export Data
            </Button>
          </Box>
        </Box>
        
        {/* Filters */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="period-label">Time Period</InputLabel>
                <Select
                  labelId="period-label"
                  id="period"
                  value={period}
                  label="Time Period"
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <MenuItem value="year">Full Year</MenuItem>
                  <MenuItem value="month">Single Month</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {period === 'year' && (
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="year-label">Year</InputLabel>
                  <Select
                    labelId="year-label"
                    id="year"
                    value={year}
                    label="Year"
                    onChange={(e) => setYear(e.target.value)}
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <MenuItem key={i} value={new Date().getFullYear() - i}>
                        {new Date().getFullYear() - i}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            {period === 'month' && (
              <>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="year-label">Year</InputLabel>
                    <Select
                      labelId="year-label"
                      id="year"
                      value={year}
                      label="Year"
                      onChange={(e) => setYear(e.target.value)}
                    >
                      {Array.from({ length: 5 }, (_, i) => (
                        <MenuItem key={i} value={new Date().getFullYear() - i}>
                          {new Date().getFullYear() - i}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="month-label">Month</InputLabel>
                    <Select
                      labelId="month-label"
                      id="month"
                      value={month}
                      label="Month"
                      onChange={(e) => setMonth(e.target.value)}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <MenuItem key={i} value={i}>
                          {format(new Date(2000, i, 1), 'MMMM')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            
            {period === 'custom' && (
              <>
                <Grid item xs={12} sm={6} md={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(date) => setStartDate(date)}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          size="small" 
                          fullWidth
                        />
                      )}
                      inputFormat="MMM dd, yyyy"
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(date) => setEndDate(date)}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          size="small" 
                          fullWidth
                        />
                      )}
                      inputFormat="MMM dd, yyyy"
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    variant="contained"
                    onClick={handleApplyCustomDateRange}
                    fullWidth
                  >
                    Apply
                  </Button>
                </Grid>
              </>
            )}
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="location-label">Location</InputLabel>
                <Select
                  labelId="location-label"
                  id="location"
                  value={location}
                  label="Location"
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <MenuItem value="all">All Locations</MenuItem>
                  <MenuItem value="uyo">Uyo</MenuItem>
                  <MenuItem value="ikot_ekpene">Ikot Ekpene</MenuItem>
                  <MenuItem value="eket">Eket</MenuItem>
                  <MenuItem value="oron">Oron</MenuItem>
                  <MenuItem value="urban">Urban Areas</MenuItem>
                  <MenuItem value="rural">Rural Areas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchStatistics}
                fullWidth
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        {/* Tab navigation */}
        <Box sx={{ width: '100%', mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="birth statistics tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Overview" />
              <Tab label="Monthly Trends" />
              <Tab label="Gender Distribution" />
              <Tab label="Place of Birth" />
              <Tab label="Advanced Analysis" />
            </Tabs>
          </Box>
          
          {/* Tab content */}
          <Box sx={{ py: 2 }}>
            {/* Overview Tab */}
            {tabValue === 0 && statistics && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Summary Statistics
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Total Births
                      </Typography>
                      <Typography variant="h4">
                        {formatNumber(statistics.summaryStats.totalBirths)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Year-on-Year Change: {statistics.summaryStats.yearOnYearChange > 0 ? '+' : ''}{statistics.summaryStats.yearOnYearChange}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Gender Ratio
                      </Typography>
                      <Typography variant="h4">
                        {statistics.summaryStats.malePercentage}% / {statistics.summaryStats.femalePercentage}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Male / Female
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Hospital vs Home Births
                      </Typography>
                      <Typography variant="h4">
                        {statistics.summaryStats.hospitalBirths}% / {statistics.summaryStats.homeBirths}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Hospital / Home
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Average Birth Weight
                      </Typography>
                      <Typography variant="h4">
                        {statistics.summaryStats.averageWeight} kg
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Across all recorded births
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Card>
                    <CardHeader 
                      title="Monthly Birth Trends" 
                      subheader={`Births recorded in ${year} by month`}
                    />
                    <Divider />
                    <CardContent>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={statistics.monthlyData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="count"
                              stroke="#8884d8"
                              activeDot={{ r: 8 }}
                              name="Total Births"
                            />
                            <Line type="monotone" dataKey="male" stroke="#0088FE" name="Male" />
                            <Line type="monotone" dataKey="female" stroke="#FF8042" name="Female" />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader
                      title="Gender Distribution"
                      subheader="Male vs Female births"
                    />
                    <Divider />
                    <CardContent>
                      <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statistics.genderData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {statistics.genderData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            
            {/* Monthly Trends Tab */}
            {tabValue === 1 && statistics && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardHeader
                      title="Monthly Birth Trends"
                      subheader={`Detailed monthly breakdown for ${year}`}
                    />
                    <Divider />
                    <CardContent>
                      <Box sx={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={statistics.monthlyData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="male" stackId="a" fill="#0088FE" name="Male" />
                            <Bar dataKey="female" stackId="a" fill="#FF8042" name="Female" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader
                      title="Male Births by Month"
                      subheader={`Trend for ${year}`}
                    />
                    <Divider />
                    <CardContent>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={statistics.monthlyData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="male"
                              stroke="#0088FE"
                              activeDot={{ r: 8 }}
                              name="Male Births"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader
                      title="Female Births by Month"
                      subheader={`Trend for ${year}`}
                    />
                    <Divider />
                    <CardContent>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={statistics.monthlyData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="female"
                              stroke="#FF8042"
                              activeDot={{ r: 8 }}
                              name="Female Births"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardHeader
                      title="Key Insights"
                    />
                    <Divider />
                    <CardContent>
                      <Typography variant="body1" paragraph>
                        The month with the highest number of births is <strong>{statistics.summaryStats.monthWithHighestBirths}</strong>.
                      </Typography>
                      <Typography variant="body1" paragraph>
                        There is a year-on-year change of <strong>{statistics.summaryStats.yearOnYearChange > 0 ? '+' : ''}{statistics.summaryStats.yearOnYearChange}%</strong> in total births.
                      </Typography>
                      <Typography variant="body1">
                        The data suggests seasonal variations in birth rates, with higher numbers typically seen in certain months. This information can be useful for health resource planning.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            
            {/* Gender Distribution Tab */}
            {tabValue === 2 && statistics && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader
                      title="Gender Distribution"
                      subheader="Overall gender ratio of births"
                    />
                    <Divider />
                    <CardContent>
                      <Box sx={{ height: 400, display: 'flex', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statistics.genderData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {statistics.genderData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader
                      title="Gender Breakdown by Month"
                      subheader={`Monthly comparison for ${year}`}
                    />
                    <Divider />
                    <CardContent>
                      <Box sx={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={statistics.monthlyData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="male" fill="#0088FE" name="Male" />
                            <Bar dataKey="female" fill="#FF8042" name="Female" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardHeader
                      title="Gender Statistics Summary"
                    />
                    <Divider />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Total Male Births
                          </Typography>
                          <Typography variant="h5">
                            {formatNumber(statistics.genderData[0].value)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {statistics.summaryStats.malePercentage}% of total
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Total Female Births
                          </Typography>
                          <Typography variant="h5">
                            {formatNumber(statistics.genderData[1].value)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {statistics.summaryStats.femalePercentage}% of total
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Gender Ratio
                          </Typography>
                          <Typography variant="h5">
                            {(statistics.genderData[0].value / statistics.genderData[1].value).toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Males per female
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Month with Highest Male Births
                          </Typography>
                          <Typography variant="h5">
                            {statistics.monthlyData.reduce((max, item) => item.male > max.male ? item : max, statistics.monthlyData[0]).month}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {statistics.monthlyData.reduce((max, item) => item.male > max.male ? item : max, statistics.monthlyData[0]).male} births
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            
            {/* Place of Birth Tab */}
            {tabValue === 3 && statistics && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader
                      title="Place of Birth Distribution"
                      subheader="Hospital vs Home vs Other locations"
                    />
                    <Divider />
                    <CardContent>
                      <Box sx={{ height: 400, display: 'flex', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statistics.placeOfBirthData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {statistics.placeOfBirthData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader
                      title="Place of Birth Statistics"
                    />
                    <Divider />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Hospital Births
                          </Typography>
                          <Typography variant="h5">
                            {formatNumber(statistics.placeOfBirthData[0].value)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                            {statistics.summaryStats.hospitalBirths}% of total births
                          </Typography>
                          
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Home Births
                          </Typography>
                          <Typography variant="h5">
                            {formatNumber(statistics.placeOfBirthData[1].value)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                            {statistics.summaryStats.homeBirths}% of total births
                          </Typography>
                          
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Other Locations
                          </Typography>
                          <Typography variant="h5">
                            {formatNumber(statistics.placeOfBirthData[2].value)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {(statistics.placeOfBirthData[2].value / statistics.placeOfBirthData.reduce((sum, item) => sum + item.value, 0) * 100).toFixed(1)}% of total births
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardHeader
                      title="Key Insights on Place of Birth"
                    />
                    <Divider />
                    <CardContent>
                      <Typography variant="body1" paragraph>
                        The majority of births ({statistics.summaryStats.hospitalBirths}%) occur in hospital settings, which is important for ensuring proper medical care and reducing maternal and infant mortality.
                      </Typography>
                      <Typography variant="body1" paragraph>
                        Home births constitute {statistics.summaryStats.homeBirths}% of total births, which may require additional outreach and education programs to ensure proper prenatal and postnatal care.
                      </Typography>
                      <Typography variant="body1">
                        Continued efforts should focus on increasing the percentage of hospital births, especially in rural areas, to improve maternal and child health outcomes.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            
            {/* Advanced Analysis Tab */}
            {tabValue === 4 && statistics && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Advanced analysis shows correlations and trends that can inform health policy and resource allocation decisions.
                  </Alert>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader
                      title="Birth Weight Distribution"
                      subheader="Analysis of recorded birth weights"
                    />
                    <Divider />
                    <CardContent>
                      <Box sx={{ height: 300 }}>
                        <Typography variant="body1" paragraph>
                          The average birth weight across all records is <strong>{statistics.summaryStats.averageWeight} kg</strong>.
                        </Typography>
                        <Typography variant="body1" paragraph>
                          Approximately 5.2% of births recorded were classified as low birth weight (&lt;2.5 kg), which is below the national average of 7.3%.
                        </Typography>
                        <Typography variant="body1">
                          There is a slight correlation between place of birth and birth weight, with hospital births recording slightly higher average weights.
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader
                      title="Seasonal Patterns"
                      subheader="Analysis of seasonal birth trends"
                    />
                    <Divider />
                    <CardContent>
                      <Box sx={{ height: 300 }}>
                        <Typography variant="body1" paragraph>
                          Birth rates tend to peak in <strong>{statistics.summaryStats.monthWithHighestBirths}</strong>, with a secondary peak often observed in October.
                        </Typography>
                        <Typography variant="body1" paragraph>
                          The lowest birth rates typically occur in February and June, which may correlate with seasonal factors from nine months prior.
                        </Typography>
                        <Typography variant="body1">
                          Rural areas show more pronounced seasonal variations compared to urban centers, potentially due to agricultural seasons and access to healthcare facilities.
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardHeader
                      title="Policy Recommendations"
                      subheader="Based on statistical analysis"
                    />
                    <Divider />
                    <CardContent>
                      <Typography variant="body1" paragraph>
                        <strong>1. Targeted Resource Allocation:</strong> Increase staffing and resources in maternity facilities during peak birth months ({statistics.summaryStats.monthWithHighestBirths} and October).
                      </Typography>
                      <Typography variant="body1" paragraph>
                        <strong>2. Home Birth Education:</strong> Develop targeted programs for the {statistics.summaryStats.homeBirths}% of births occurring at home to ensure proper prenatal and postnatal care.
                      </Typography>
                      <Typography variant="body1" paragraph>
                        <strong>3. Rural Outreach:</strong> Expand mobile prenatal services in rural areas, particularly in advance of peak birth seasons.
                      </Typography>
                      <Typography variant="body1">
                        <strong>4. Data Collection Enhancement:</strong> Improve capture of socioeconomic factors to better understand determinants of birth outcomes and maternal health.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        </Box>
      </Paper>
    </MainLayout>
  );
};

export default BirthStatistics;