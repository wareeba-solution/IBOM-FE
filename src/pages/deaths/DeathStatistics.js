// src/pages/deaths/DeathStatistics.js
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
  IconButton,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  DateRange as DateRangeIcon,
  Print as PrintIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO, startOfYear, endOfYear, startOfMonth, endOfMonth, subMonths, subYears } from 'date-fns';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';

// Mock death statistics service - replace with actual service when available
const deathStatisticsService = {
  getDeathStatistics: async (params) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          summary: {
            total_deaths: 1458,
            deaths_this_month: 42,
            deaths_this_year: 387,
            average_age: 64.8
          },
          by_gender: [
            { gender: 'Male', count: 781, percentage: 53.6 },
            { gender: 'Female', count: 677, percentage: 46.4 }
          ],
          by_age_group: [
            { age_group: 'Under 1', count: 58, percentage: 4.0 },
            { age_group: '1-5', count: 43, percentage: 2.9 },
            { age_group: '6-17', count: 29, percentage: 2.0 },
            { age_group: '18-35', count: 127, percentage: 8.7 },
            { age_group: '36-50', count: 219, percentage: 15.0 },
            { age_group: '51-65', count: 346, percentage: 23.7 },
            { age_group: '66-80', count: 428, percentage: 29.4 },
            { age_group: 'Over 80', count: 208, percentage: 14.3 }
          ],
          by_cause: [
            { cause: 'Natural Causes', count: 314, percentage: 21.5 },
            { cause: 'Heart Disease', count: 387, percentage: 26.5 },
            { cause: 'Cancer', count: 293, percentage: 20.1 },
            { cause: 'Respiratory Disease', count: 196, percentage: 13.4 },
            { cause: 'Accident', count: 94, percentage: 6.5 },
            { cause: 'Stroke', count: 127, percentage: 8.7 },
            { cause: 'Other', count: 47, percentage: 3.3 }
          ],
          by_place: [
            { place: 'Hospital', count: 873, percentage: 59.9 },
            { place: 'Home', count: 452, percentage: 31.0 },
            { place: 'Other', count: 133, percentage: 9.1 }
          ],
          by_month: [
            { month: 'Jan', count: 32 },
            { month: 'Feb', count: 27 },
            { month: 'Mar', count: 35 },
            { month: 'Apr', count: 33 },
            { month: 'May', count: 30 },
            { month: 'Jun', count: 28 },
            { month: 'Jul', count: 31 },
            { month: 'Aug', count: 34 },
            { month: 'Sep', count: 39 },
            { month: 'Oct', count: 36 },
            { month: 'Nov', count: 33 },
            { month: 'Dec', count: 29 }
          ],
          by_year: [
            { year: '2019', count: 358 },
            { year: '2020', count: 412 },
            { year: '2021', count: 385 },
            { year: '2022', count: 396 },
            { year: '2023', count: 377 }
          ],
          top_localities: [
            { locality: 'Uyo', count: 487, percentage: 33.4 },
            { locality: 'Ikot Ekpene', count: 238, percentage: 16.3 },
            { locality: 'Eket', count: 186, percentage: 12.8 },
            { locality: 'Oron', count: 124, percentage: 8.5 },
            { locality: 'Abak', count: 98, percentage: 6.7 },
            { locality: 'Other', count: 325, percentage: 22.3 }
          ]
        });
      }, 1000);
    });
  },
  getDeathTrends: async (params) => {
    // Simulate API call for trend data (more detailed monthly data)
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate data for the past 24 months
        const trendsData = Array.from({ length: 24 }, (_, index) => {
          const date = subMonths(new Date(), 23 - index);
          const monthYear = format(date, 'MMM yyyy');
          
          // Generate some realistic looking data with some variation
          const baseCount = 30 + Math.floor(Math.random() * 15);
          const maleCount = Math.floor(baseCount * (0.5 + Math.random() * 0.1));
          const femaleCount = baseCount - maleCount;
          
          return {
            month: monthYear,
            total: baseCount,
            male: maleCount,
            female: femaleCount,
            hospital: Math.floor(baseCount * (0.55 + Math.random() * 0.1)),
            natural: Math.floor(baseCount * (0.2 + Math.random() * 0.05)),
            heart: Math.floor(baseCount * (0.25 + Math.random() * 0.05)),
            cancer: Math.floor(baseCount * (0.18 + Math.random() * 0.05)),
            respiratory: Math.floor(baseCount * (0.12 + Math.random() * 0.05)),
            accident: Math.floor(baseCount * (0.06 + Math.random() * 0.02)),
            other: Math.floor(baseCount * (0.12 + Math.random() * 0.03))
          };
        });
        
        resolve(trendsData);
      }, 1000);
    });
  }
};

// Define color schemes
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
  '#82CA9D', '#FFC658', '#8DD1E1', '#A4DE6C', '#D0ED57'
];

const DeathStatistics = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [statistics, setStatistics] = useState(null);
  const [trendsData, setTrendsData] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    date_range: 'all_time',
    locality: '',
    age_group: '',
    gender: '',
    start_date: subYears(new Date(), 1),
    end_date: new Date()
  });
  
  // Fetch statistics data
  const fetchStatistics = async () => {
    await execute(
      deathStatisticsService.getDeathStatistics,
      [filters],
      (response) => {
        setStatistics(response);
      }
    );
  };

  // Fetch trends data
  const fetchTrends = async () => {
    await execute(
      deathStatisticsService.getDeathTrends,
      [filters],
      (response) => {
        setTrendsData(response);
      }
    );
  };

  // Initial data loading
  useEffect(() => {
    fetchStatistics();
    fetchTrends();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date range filter change
  const handleDateRangeChange = (range) => {
    let start_date, end_date;
    
    switch(range) {
      case 'last_month':
        start_date = startOfMonth(subMonths(new Date(), 1));
        end_date = endOfMonth(subMonths(new Date(), 1));
        break;
      case 'last_3_months':
        start_date = startOfMonth(subMonths(new Date(), 3));
        end_date = new Date();
        break;
      case 'last_6_months':
        start_date = startOfMonth(subMonths(new Date(), 6));
        end_date = new Date();
        break;
      case 'last_year':
        start_date = subYears(new Date(), 1);
        end_date = new Date();
        break;
      case 'this_year':
        start_date = startOfYear(new Date());
        end_date = new Date();
        break;
      case 'custom_range':
        // Keep existing custom dates
        start_date = filters.start_date;
        end_date = filters.end_date;
        break;
      default: // all_time
        start_date = null;
        end_date = null;
    }
    
    setFilters(prev => ({
      ...prev,
      date_range: range,
      start_date,
      end_date
    }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchStatistics();
    fetchTrends();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      date_range: 'all_time',
      locality: '',
      age_group: '',
      gender: '',
      start_date: subYears(new Date(), 1),
      end_date: new Date()
    });
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format percentage
  const formatPercentage = (num) => {
    return `${num.toFixed(1)}%`;
  };

  // Handle export
  const handleExport = () => {
    alert('Export functionality would be implemented here');
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle navigate back
  const handleBack = () => {
    navigate('/deaths');
  };

  // Render summary cards
  const renderSummaryCards = () => {
    if (!statistics) return null;
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Deaths
              </Typography>
              <Typography variant="h4">
                {formatNumber(statistics.summary.total_deaths)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All recorded deaths
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Deaths This Month
              </Typography>
              <Typography variant="h4">
                {statistics.summary.deaths_this_month}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {format(new Date(), 'MMMM yyyy')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Deaths This Year
              </Typography>
              <Typography variant="h4">
                {statistics.summary.deaths_this_year}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {format(new Date(), 'yyyy')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Age at Death
              </Typography>
              <Typography variant="h4">
                {statistics.summary.average_age.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Average across all records
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Render cause of death chart
  const renderCauseOfDeathChart = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Deaths by Cause" 
          subheader="Distribution of death causes"
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statistics.by_cause}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="cause"
                >
                  {statistics.by_cause.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${value} (${formatPercentage(props.payload.percentage)})`, props.payload.cause]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render age distribution chart
  const renderAgeDistributionChart = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Deaths by Age Group" 
          subheader="Age distribution of deaths"
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statistics.by_age_group}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age_group" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [formatNumber(value), 'Deaths']}
                  labelFormatter={(label) => `Age Group: ${label}`}
                />
                <Bar dataKey="count" name="Deaths" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render gender distribution chart
  const renderGenderDistributionChart = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Deaths by Gender" 
          subheader="Gender distribution of deaths"
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statistics.by_gender}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="gender"
                >
                  <Cell fill="#0088FE" />
                  <Cell fill="#FF8042" />
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${value} (${formatPercentage(props.payload.percentage)})`, props.payload.gender]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render place of death chart
  const renderPlaceOfDeathChart = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Deaths by Place" 
          subheader="Distribution by place of death"
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statistics.by_place}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="place"
                >
                  <Cell fill="#00C49F" />
                  <Cell fill="#FFBB28" />
                  <Cell fill="#FF8042" />
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${value} (${formatPercentage(props.payload.percentage)})`, props.payload.place]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render monthly trend chart
  const renderMonthlyTrendChart = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Monthly Death Trends" 
          subheader="Deaths by month for current year"
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={statistics.by_month}
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
                  dataKey="count" 
                  name="Deaths" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render yearly trend chart
  const renderYearlyTrendChart = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Yearly Death Trends" 
          subheader="Deaths by year"
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statistics.by_year}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatNumber(value), 'Deaths']}
                />
                <Bar dataKey="count" name="Deaths" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render locality distribution
  const renderLocalityChart = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Deaths by Locality" 
          subheader="Geographical distribution"
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statistics.top_localities}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 80,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="locality" />
                <Tooltip 
                  formatter={(value, name, props) => [`${value} (${formatPercentage(props.payload.percentage)})`, 'Deaths']}
                />
                <Bar dataKey="count" name="Deaths" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render detailed trends tab
  const renderDetailedTrendsTab = () => {
    if (trendsData.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    return (
      <Box>
        <Card sx={{ mb: 4 }}>
          <CardHeader 
            title="Death Trends Over Time" 
            subheader="Monthly breakdown for the past 24 months"
          />
          <Divider />
          <CardContent>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendsData}
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
                    dataKey="total" 
                    name="Total Deaths" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="male" 
                    name="Male" 
                    stroke="#0088FE" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="female" 
                    name="Female" 
                    stroke="#FF8042" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ mb: 4 }}>
          <CardHeader 
            title="Deaths by Cause Over Time" 
            subheader="Monthly breakdown by major causes"
          />
          <Divider />
          <CardContent>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendsData}
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
                    dataKey="natural" 
                    name="Natural Causes" 
                    stroke="#00C49F" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="heart" 
                    name="Heart Disease" 
                    stroke="#0088FE" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cancer" 
                    name="Cancer" 
                    stroke="#FFBB28" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="respiratory" 
                    name="Respiratory" 
                    stroke="#FF8042" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accident" 
                    name="Accident" 
                    stroke="#8884d8" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader 
            title="Detailed Monthly Breakdown" 
            subheader="Complete data for analysis"
          />
          <Divider />
          <CardContent>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Month</strong></TableCell>
                    <TableCell align="right"><strong>Total</strong></TableCell>
                    <TableCell align="right"><strong>Male</strong></TableCell>
                    <TableCell align="right"><strong>Female</strong></TableCell>
                    <TableCell align="right"><strong>Hospital</strong></TableCell>
                    <TableCell align="right"><strong>Natural</strong></TableCell>
                    <TableCell align="right"><strong>Heart</strong></TableCell>
                    <TableCell align="right"><strong>Cancer</strong></TableCell>
                    <TableCell align="right"><strong>Respiratory</strong></TableCell>
                    <TableCell align="right"><strong>Accident</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trendsData.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell component="th" scope="row">{row.month}</TableCell>
                      <TableCell align="right">{row.total}</TableCell>
                      <TableCell align="right">{row.male}</TableCell>
                      <TableCell align="right">{row.female}</TableCell>
                      <TableCell align="right">{row.hospital}</TableCell>
                      <TableCell align="right">{row.natural}</TableCell>
                      <TableCell align="right">{row.heart}</TableCell>
                      <TableCell align="right">{row.cancer}</TableCell>
                      <TableCell align="right">{row.respiratory}</TableCell>
                      <TableCell align="right">{row.accident}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <MainLayout title="Death Statistics">
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              onClick={handleBack}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              Death Statistics & Analysis
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ mr: 1 }}
            >
              Print
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={handleExport}
            >
              Export Data
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="date-range-label">Date Range</InputLabel>
                <Select
                  labelId="date-range-label"
                  id="date_range"
                  name="date_range"
                  value={filters.date_range}
                  onChange={(e) => {
                    handleDateRangeChange(e.target.value);
                  }}
                  label="Date Range"
                >
                  <MenuItem value="all_time">All Time</MenuItem>
                  <MenuItem value="last_month">Last Month</MenuItem>
                  <MenuItem value="last_3_months">Last 3 Months</MenuItem>
                  <MenuItem value="last_6_months">Last 6 Months</MenuItem>
                  <MenuItem value="last_year">Last Year</MenuItem>
                  <MenuItem value="this_year">This Year</MenuItem>
                  <MenuItem value="custom_range">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {filters.date_range === 'custom_range' && (
              <>
                <Grid item xs={12} sm={3} md={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={filters.start_date}
                      onChange={(date) => {
                        setFilters(prev => ({
                          ...prev,
                          start_date: date
                        }));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={3} md={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={filters.end_date}
                      onChange={(date) => {
                        setFilters(prev => ({
                          ...prev,
                          end_date: date
                        }));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}
            
            <Grid item xs={12} sm={3} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="locality-label">Locality</InputLabel>
                <Select
                  labelId="locality-label"
                  id="locality"
                  name="locality"
                  value={filters.locality}
                  onChange={handleFilterChange}
                  label="Locality"
                >
                  <MenuItem value="">All Localities</MenuItem>
                  <MenuItem value="Uyo">Uyo</MenuItem>
                  <MenuItem value="Ikot Ekpene">Ikot Ekpene</MenuItem>
                  <MenuItem value="Eket">Eket</MenuItem>
                  <MenuItem value="Oron">Oron</MenuItem>
                  <MenuItem value="Abak">Abak</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={3} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="age-group-label">Age Group</InputLabel>
                <Select
                  labelId="age-group-label"
                  id="age_group"
                  name="age_group"
                  value={filters.age_group}
                  onChange={handleFilterChange}
                  label="Age Group"
                >
                  <MenuItem value="">All Ages</MenuItem>
                  <MenuItem value="Under 1">Under 1</MenuItem>
                  <MenuItem value="1-5">1-5</MenuItem>
                  <MenuItem value="6-17">6-17</MenuItem>
                  <MenuItem value="18-35">18-35</MenuItem>
                  <MenuItem value="36-50">36-50</MenuItem>
                  <MenuItem value="51-65">51-65</MenuItem>
                  <MenuItem value="66-80">66-80</MenuItem>
                  <MenuItem value="Over 80">Over 80</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={3} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={filters.gender}
                  onChange={handleFilterChange}
                  label="Gender"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={3} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={applyFilters}
                >
                  Apply
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetFilters}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Content tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="death statistics tabs"
          >
            <Tab label="Overview" />
            <Tab label="Detailed Trends" />
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && !statistics ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Overview Tab */}
            {tabValue === 0 && (
              <Box>
                {/* Summary Stats */}
                <Box sx={{ mb: 4 }}>
                  {renderSummaryCards()}
                </Box>

                {/* Primary Charts */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    {renderCauseOfDeathChart()}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {renderAgeDistributionChart()}
                  </Grid>
                </Grid>

                {/* Secondary Charts */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    {renderGenderDistributionChart()}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {renderPlaceOfDeathChart()}
                  </Grid>
                </Grid>

                {/* Trend Charts */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    {renderMonthlyTrendChart()}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {renderYearlyTrendChart()}
                  </Grid>
                </Grid>

                {/* Locality Chart */}
                <Box sx={{ mt: 4 }}>
                  {renderLocalityChart()}
                </Box>
              </Box>
            )}

            {/* Detailed Trends Tab */}
            {tabValue === 1 && renderDetailedTrendsTab()}
          </>
        )}
      </Paper>
    </MainLayout>
  );
};

export default DeathStatistics;