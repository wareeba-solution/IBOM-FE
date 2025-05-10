// src/pages/immunization/ImmunizationStatistics.js
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
  TableRow,
  Chip
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

// Mock immunization statistics service - replace with actual service when available
const immunizationStatisticsService = {
  getImmunizationStatistics: async (params) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          summary: {
            total_vaccinations: 12483,
            vaccinations_this_month: 324,
            vaccinations_this_year: 3716,
            completion_rate: 87.2
          },
          coverage_by_vaccine: [
            { vaccine: 'BCG', target: 1200, achieved: 1158, coverage: 96.5 },
            { vaccine: 'Hepatitis B', target: 1200, achieved: 1132, coverage: 94.3 },
            { vaccine: 'OPV', target: 1200, achieved: 1093, coverage: 91.1 },
            { vaccine: 'Pentavalent', target: 1200, achieved: 1118, coverage: 93.2 },
            { vaccine: 'Pneumococcal', target: 1200, achieved: 1084, coverage: 90.3 },
            { vaccine: 'Rotavirus', target: 1200, achieved: 982, coverage: 81.8 },
            { vaccine: 'Measles', target: 1200, achieved: 1047, coverage: 87.3 },
            { vaccine: 'Yellow Fever', target: 1200, achieved: 993, coverage: 82.8 }
          ],
          by_gender: [
            { gender: 'Male', count: 6318, percentage: 50.6 },
            { gender: 'Female', count: 6165, percentage: 49.4 }
          ],
          by_age_group: [
            { age_group: '0-6 months', count: 3621, percentage: 29.0 },
            { age_group: '7-12 months', count: 2953, percentage: 23.7 },
            { age_group: '13-24 months', count: 3147, percentage: 25.2 },
            { age_group: '25-36 months', count: 1623, percentage: 13.0 },
            { age_group: '37-60 months', count: 892, percentage: 7.1 },
            { age_group: 'Above 60 months', count: 247, percentage: 2.0 }
          ],
          by_dose: [
            { dose: 'Dose 1', count: 5283, percentage: 42.3 },
            { dose: 'Dose 2', count: 4127, percentage: 33.1 },
            { dose: 'Dose 3', count: 2845, percentage: 22.8 },
            { dose: 'Booster', count: 228, percentage: 1.8 }
          ],
          by_month: [
            { month: 'Jan', count: 342 },
            { month: 'Feb', count: 287 },
            { month: 'Mar', count: 315 },
            { month: 'Apr', count: 293 },
            { month: 'May', count: 310 },
            { month: 'Jun', count: 328 },
            { month: 'Jul', count: 301 },
            { month: 'Aug', count: 344 },
            { month: 'Sep', count: 329 },
            { month: 'Oct', count: 316 },
            { month: 'Nov', count: 303 },
            { month: 'Dec', count: 285 }
          ],
          dropout_rates: [
            { vaccine: 'BCG to Measles', dropout_rate: 9.5 },
            { vaccine: 'Penta 1 to Penta 3', dropout_rate: 6.2 },
            { vaccine: 'OPV 1 to OPV 3', dropout_rate: 5.8 },
            { vaccine: 'PCV 1 to PCV 3', dropout_rate: 7.3 }
          ],
          top_facilities: [
            { facility: 'Health Center 1', count: 3572, percentage: 28.6 },
            { facility: 'Health Center 2', count: 2841, percentage: 22.8 },
            { facility: 'Health Center 3', count: 2237, percentage: 17.9 },
            { facility: 'Health Center 4', count: 2083, percentage: 16.7 },
            { facility: 'Health Center 5', count: 1750, percentage: 14.0 }
          ],
          missed_opportunities: {
            total: 682,
            reasons: [
              { reason: 'Vaccine stockout', count: 187, percentage: 27.4 },
              { reason: 'Facility closed', count: 128, percentage: 18.8 },
              { reason: 'Parent/Guardian refused', count: 143, percentage: 21.0 },
              { reason: 'Child sick', count: 92, percentage: 13.5 },
              { reason: 'Other', count: 132, percentage: 19.3 }
            ]
          }
        });
      }, 1000);
    });
  },
  getVaccinationTrends: async (params) => {
    // Simulate API call for trend data (more detailed monthly data)
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate data for the past 24 months
        const trendsData = Array.from({ length: 24 }, (_, index) => {
          const date = subMonths(new Date(), 23 - index);
          const monthYear = format(date, 'MMM yyyy');
          
          // Generate some realistic looking data with some variation
          const baseCount = 300 + Math.floor(Math.random() * 50);
          const maleCount = Math.floor(baseCount * (0.5 + Math.random() * 0.1));
          const femaleCount = baseCount - maleCount;
          
          return {
            month: monthYear,
            total: baseCount,
            male: maleCount,
            female: femaleCount,
            bcg: Math.floor(baseCount * (0.12 + Math.random() * 0.03)),
            opv: Math.floor(baseCount * (0.25 + Math.random() * 0.05)),
            penta: Math.floor(baseCount * (0.23 + Math.random() * 0.05)),
            measles: Math.floor(baseCount * (0.15 + Math.random() * 0.04)),
            yf: Math.floor(baseCount * (0.15 + Math.random() * 0.04)),
            other: Math.floor(baseCount * (0.10 + Math.random() * 0.03))
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

const ImmunizationStatistics = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [statistics, setStatistics] = useState(null);
  const [trendsData, setTrendsData] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    date_range: 'all_time',
    vaccine_type: '',
    age_group: '',
    gender: '',
    start_date: subYears(new Date(), 1),
    end_date: new Date()
  });
  
  // Fetch statistics data
  const fetchStatistics = async () => {
    await execute(
      immunizationStatisticsService.getImmunizationStatistics,
      [filters],
      (response) => {
        setStatistics(response);
      }
    );
  };

  // Fetch trends data
  const fetchTrends = async () => {
    await execute(
      immunizationStatisticsService.getVaccinationTrends,
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
      vaccine_type: '',
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
    navigate('/immunization');
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
                Total Vaccinations
              </Typography>
              <Typography variant="h4">
                {formatNumber(statistics.summary.total_vaccinations)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All recorded vaccinations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Vaccinations This Month
              </Typography>
              <Typography variant="h4">
                {statistics.summary.vaccinations_this_month}
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
                Vaccinations This Year
              </Typography>
              <Typography variant="h4">
                {statistics.summary.vaccinations_this_year}
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
                Completion Rate
              </Typography>
              <Typography variant="h4">
                {statistics.summary.completion_rate}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Vaccine series completion
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Render coverage by vaccine chart
  const renderCoverageChart = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Vaccine Coverage" 
          subheader="Percentage of target population covered by vaccine type"
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statistics.coverage_by_vaccine}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vaccine" />
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  label={{ value: 'Count', angle: -90, position: 'insideLeft' }} 
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  label={{ value: 'Coverage %', angle: 90, position: 'insideRight' }} 
                  domain={[0, 100]}
                />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="achieved" name="Vaccinations" fill="#8884d8" />
                <Bar yAxisId="left" dataKey="target" name="Target" fill="#82ca9d" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="coverage"
                  name="Coverage %"
                  stroke="#ff7300"
                  activeDot={{ r: 8 }}
                />
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
          title="Vaccinations by Gender" 
          subheader="Gender distribution of vaccinations"
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

  // Render age distribution chart
  const renderAgeDistributionChart = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Vaccinations by Age Group" 
          subheader="Age distribution of vaccinations"
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
                  formatter={(value, name) => [formatNumber(value), 'Vaccinations']}
                  labelFormatter={(label) => `Age Group: ${label}`}
                />
                <Bar dataKey="count" name="Vaccinations" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render dose distribution chart
  const renderDoseDistributionChart = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Vaccinations by Dose" 
          subheader="Distribution by dose number"
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statistics.by_dose}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="dose"
                >
                  {statistics.by_dose.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${value} (${formatPercentage(props.payload.percentage)})`, props.payload.dose]}
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
          title="Monthly Vaccination Trends" 
          subheader="Vaccinations by month for current year"
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
                  name="Vaccinations" 
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

  // Render dropout rates chart
  const renderDropoutRatesChart = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Dropout Rates" 
          subheader="Percentage of children who do not complete vaccine series"
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statistics.dropout_rates}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vaccine" />
                <YAxis domain={[0, 15]} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Dropout Rate']}
                />
                <Bar dataKey="dropout_rate" name="Dropout Rate %" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render missed opportunities chart
  const renderMissedOpportunitiesChart = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Missed Opportunities" 
          subheader={`Reasons for ${statistics.missed_opportunities.total} missed vaccinations`}
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statistics.missed_opportunities.reasons}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="reason"
                >
                  {statistics.missed_opportunities.reasons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${value} (${formatPercentage(props.payload.percentage)})`, props.payload.reason]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render facilities distribution chart
  const renderFacilitiesChart = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Vaccinations by Facility" 
          subheader="Distribution by health facility"
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statistics.top_facilities}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 100,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="facility" />
                <Tooltip 
                  formatter={(value, name, props) => [`${value} (${formatPercentage(props.payload.percentage)})`, 'Vaccinations']}
                />
                <Bar dataKey="count" name="Vaccinations" fill="#8884d8" />
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
            title="Vaccination Trends Over Time" 
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
                    name="Total Vaccinations" 
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
            title="Vaccinations by Type Over Time" 
            subheader="Monthly breakdown by vaccine type"
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
                    dataKey="bcg" 
                    name="BCG" 
                    stroke="#00C49F" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="opv" 
                    name="OPV" 
                    stroke="#0088FE" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="penta" 
                    name="Pentavalent" 
                    stroke="#FFBB28" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="measles" 
                    name="Measles" 
                    stroke="#FF8042" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="yf" 
                    name="Yellow Fever" 
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
                    <TableCell align="right"><strong>BCG</strong></TableCell>
                    <TableCell align="right"><strong>OPV</strong></TableCell>
                    <TableCell align="right"><strong>Penta</strong></TableCell>
                    <TableCell align="right"><strong>Measles</strong></TableCell>
                    <TableCell align="right"><strong>Yellow Fever</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trendsData.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell component="th" scope="row">{row.month}</TableCell>
                      <TableCell align="right">{row.total}</TableCell>
                      <TableCell align="right">{row.male}</TableCell>
                      <TableCell align="right">{row.female}</TableCell>
                      <TableCell align="right">{row.bcg}</TableCell>
                      <TableCell align="right">{row.opv}</TableCell>
                      <TableCell align="right">{row.penta}</TableCell>
                      <TableCell align="right">{row.measles}</TableCell>
                      <TableCell align="right">{row.yf}</TableCell>
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
    <MainLayout title="Immunization Statistics">
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
              Immunization Statistics & Analysis
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
                <InputLabel id="vaccine-type-label">Vaccine Type</InputLabel>
                <Select
                  labelId="vaccine-type-label"
                  id="vaccine_type"
                  name="vaccine_type"
                  value={filters.vaccine_type}
                  onChange={handleFilterChange}
                  label="Vaccine Type"
                >
                  <MenuItem value="">All Vaccines</MenuItem>
                  <MenuItem value="BCG">BCG</MenuItem>
                  <MenuItem value="Hepatitis B">Hepatitis B</MenuItem>
                  <MenuItem value="OPV">OPV</MenuItem>
                  <MenuItem value="Pentavalent">Pentavalent</MenuItem>
                  <MenuItem value="Pneumococcal">Pneumococcal</MenuItem>
                  <MenuItem value="Rotavirus">Rotavirus</MenuItem>
                  <MenuItem value="Measles">Measles</MenuItem>
                  <MenuItem value="Yellow Fever">Yellow Fever</MenuItem>
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
                  <MenuItem value="0-6 months">0-6 months</MenuItem>
                  <MenuItem value="7-12 months">7-12 months</MenuItem>
                  <MenuItem value="13-24 months">13-24 months</MenuItem>
                  <MenuItem value="25-36 months">25-36 months</MenuItem>
                  <MenuItem value="37-60 months">37-60 months</MenuItem>
                  <MenuItem value="Above 60 months">Above 60 months</MenuItem>
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
            aria-label="immunization statistics tabs"
          >
            <Tab label="Overview" />
            <Tab label="Coverage Analysis" />
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
                    {renderGenderDistributionChart()}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {renderDoseDistributionChart()}
                  </Grid>
                </Grid>

                {/* Secondary Charts */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    {renderAgeDistributionChart()}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {renderMonthlyTrendChart()}
                  </Grid>
                </Grid>

                {/* Additional Charts */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    {renderMissedOpportunitiesChart()}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {renderFacilitiesChart()}
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Coverage Analysis Tab */}
            {tabValue === 1 && (
              <Box>
                {renderCoverageChart()}
                
                <Grid container spacing={3} sx={{ mt: 3 }}>
                  <Grid item xs={12} md={6}>
                    {renderDropoutRatesChart()}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {renderMissedOpportunitiesChart()}
                  </Grid>
                </Grid>
                
                <Card sx={{ mt: 3 }}>
                  <CardHeader 
                    title="Vaccine Coverage Analysis" 
                    subheader="Detailed coverage statistics by vaccine type"
                  />
                  <Divider />
                  <CardContent>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Vaccine</strong></TableCell>
                            <TableCell align="right"><strong>Target</strong></TableCell>
                            <TableCell align="right"><strong>Achieved</strong></TableCell>
                            <TableCell align="right"><strong>Coverage</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {statistics?.coverage_by_vaccine.map((row) => (
                            <TableRow key={row.vaccine}>
                              <TableCell component="th" scope="row">{row.vaccine}</TableCell>
                              <TableCell align="right">{row.target}</TableCell>
                              <TableCell align="right">{row.achieved}</TableCell>
                              <TableCell align="right">{`${row.coverage}%`}</TableCell>
                              <TableCell>
                                {row.coverage >= 90 ? (
                                  <Chip label="Good" color="success" size="small" />
                                ) : row.coverage >= 80 ? (
                                  <Chip label="Acceptable" color="warning" size="small" />
                                ) : (
                                  <Chip label="Below Target" color="error" size="small" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Detailed Trends Tab */}
            {tabValue === 2 && renderDetailedTrendsTab()}
          </>
        )}
      </Paper>
    </MainLayout>
  );
};

export default ImmunizationStatistics;