// src/pages/antenatal/AntenatalStatistics.js
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

// Mock antenatal statistics service - replace with actual service when available
const antenatalStatisticsService = {
  getAntenatalStatistics: async (params) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          summary: {
            total_registrations: 3426,
            active_pregnancies: 587,
            registrations_this_month: 74,
            high_risk_cases: 112
          },
          by_trimester: [
            { trimester: '1st Trimester', count: 186, percentage: 31.7 },
            { trimester: '2nd Trimester', count: 247, percentage: 42.1 },
            { trimester: '3rd Trimester', count: 154, percentage: 26.2 }
          ],
          by_risk_level: [
            { risk_level: 'Low Risk', count: 325, percentage: 55.4 },
            { risk_level: 'Medium Risk', count: 150, percentage: 25.6 },
            { risk_level: 'High Risk', count: 112, percentage: 19.0 }
          ],
          by_age_group: [
            { age_group: 'Below 18', count: 23, percentage: 3.9 },
            { age_group: '18-25', count: 198, percentage: 33.7 },
            { age_group: '26-35', count: 284, percentage: 48.4 },
            { age_group: 'Above 35', count: 82, percentage: 14.0 }
          ],
          top_risk_factors: [
            { factor: 'Advanced maternal age', count: 82, percentage: 14.0 },
            { factor: 'Previous C-section', count: 67, percentage: 11.4 },
            { factor: 'Hypertension', count: 43, percentage: 7.3 },
            { factor: 'Diabetes', count: 28, percentage: 4.8 },
            { factor: 'Multiple gestation', count: 21, percentage: 3.6 }
          ],
          monthly_registrations: [
            { month: 'Jan', count: 64 },
            { month: 'Feb', count: 57 },
            { month: 'Mar', count: 71 },
            { month: 'Apr', count: 63 },
            { month: 'May', count: 70 },
            { month: 'Jun', count: 68 },
            { month: 'Jul', count: 61 },
            { month: 'Aug', count: 74 },
            { month: 'Sep', count: 69 },
            { month: 'Oct', count: 66 },
            { month: 'Nov', count: 73 },
            { month: 'Dec', count: 69 }
          ],
          visit_compliance: {
            on_schedule: 421,
            missed_appointments: 78,
            never_returned: 88,
            compliance_rate: 71.7
          },
          attendance_by_facility: [
            { facility: 'Health Center 1', count: 176, percentage: 30.0 },
            { facility: 'Health Center 2', count: 147, percentage: 25.0 },
            { facility: 'Health Center 3', count: 124, percentage: 21.1 },
            { facility: 'Health Center 4', count: 82, percentage: 14.0 },
            { facility: 'Health Center 5', count: 58, percentage: 9.9 }
          ],
          delivery_outcomes: {
            total_deliveries: 2839,
            normal_delivery: 2102,
            cesarean_section: 519,
            assisted_delivery: 168,
            still_births: 50,
            maternal_deaths: 12,
            maternal_mortality_ratio: 422 // per 100,000 live births
          }
        });
      }, 1000);
    });
  },
  getAntenatalTrends: async (params) => {
    // Simulate API call for trend data (more detailed monthly data)
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate data for the past 24 months
        const trendsData = Array.from({ length: 24 }, (_, index) => {
          const date = subMonths(new Date(), 23 - index);
          const monthYear = format(date, 'MMM yyyy');
          
          // Generate some realistic looking data with some variation
          const baseCount = 60 + Math.floor(Math.random() * 20);
          const highRiskPercentage = 15 + Math.floor(Math.random() * 10);
          const highRiskCount = Math.floor(baseCount * (highRiskPercentage / 100));
          
          return {
            month: monthYear,
            total_registrations: baseCount,
            first_trimester: Math.floor(baseCount * 0.4),
            second_trimester: Math.floor(baseCount * 0.4),
            third_trimester: Math.floor(baseCount * 0.2),
            high_risk: highRiskCount,
            visit_compliance: 65 + Math.floor(Math.random() * 15)
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

const AntenatalStatistics = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [statistics, setStatistics] = useState(null);
  const [trendsData, setTrendsData] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    date_range: 'all_time',
    facility: '',
    age_group: '',
    risk_level: '',
    start_date: subYears(new Date(), 1),
    end_date: new Date()
  });
  
  // Fetch statistics data
  const fetchStatistics = async () => {
    await execute(
      antenatalStatisticsService.getAntenatalStatistics,
      [filters],
      (response) => {
        setStatistics(response);
      }
    );
  };

  // Fetch trends data
  const fetchTrends = async () => {
    await execute(
      antenatalStatisticsService.getAntenatalTrends,
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
      facility: '',
      age_group: '',
      risk_level: '',
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
    navigate('/antenatal');
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
                Total Registrations
              </Typography>
              <Typography variant="h4">
                {formatNumber(statistics.summary.total_registrations)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Pregnancies
              </Typography>
              <Typography variant="h4">
                {statistics.summary.active_pregnancies}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Currently monitored
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Registrations This Month
              </Typography>
              <Typography variant="h4">
                {statistics.summary.registrations_this_month}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {format(new Date(), 'MMMM yyyy')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#FFF8F8' }}>
            <CardContent>
              <Typography color="error" gutterBottom>
                High Risk Cases
              </Typography>
              <Typography variant="h4" color="error">
                {statistics.summary.high_risk_cases}
              </Typography>
              <Typography variant="body2" color="error">
                {formatPercentage(statistics.summary.high_risk_cases / statistics.summary.active_pregnancies * 100)} of active pregnancies
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Render trimester distribution chart
  const renderTrimesterChart = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Pregnancies by Trimester" 
          subheader="Distribution of active pregnancies by trimester"
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statistics.by_trimester}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="trimester"
                >
                  <Cell fill="#00C49F" />
                  <Cell fill="#FFBB28" />
                  <Cell fill="#FF8042" />
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${value} (${formatPercentage(props.payload.percentage)})`, props.payload.trimester]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render risk level distribution chart
  const renderRiskLevelChart = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Risk Level Distribution" 
          subheader="Classification of pregnancies by risk level"
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statistics.by_risk_level}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="risk_level"
                >
                  <Cell fill="#00C49F" />
                  <Cell fill="#FFBB28" />
                  <Cell fill="#FF8042" />
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${value} (${formatPercentage(props.payload.percentage)})`, props.payload.risk_level]}
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
          title="Age Distribution" 
          subheader="Maternal age distribution of active pregnancies"
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
                  formatter={(value, name) => [formatNumber(value), 'Patients']}
                  labelFormatter={(label) => `Age Group: ${label}`}
                />
                <Bar dataKey="count" name="Patients" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render risk factors chart
  const renderRiskFactorsChart = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Top Risk Factors" 
          subheader="Most common pregnancy risk factors"
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statistics.top_risk_factors}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 120,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="factor" />
                <Tooltip 
                  formatter={(value, name, props) => [`${value} (${formatPercentage(props.payload.percentage)})`, 'Patients']}
                />
                <Bar dataKey="count" name="Patients" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render monthly registrations chart
  const renderMonthlyRegistrationsChart = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Monthly Registrations" 
          subheader="New antenatal registrations by month"
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={statistics.monthly_registrations}
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
                  name="Registrations" 
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

  // Render visit compliance card
  const renderVisitComplianceCard = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Visit Compliance" 
          subheader="Adherence to scheduled antenatal visits"
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'On Schedule', value: statistics.visit_compliance.on_schedule, color: '#00C49F' },
                        { name: 'Missed Appointments', value: statistics.visit_compliance.missed_appointments, color: '#FFBB28' },
                        { name: 'Never Returned', value: statistics.visit_compliance.never_returned, color: '#FF8042' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'On Schedule', value: statistics.visit_compliance.on_schedule, color: '#00C49F' },
                        { name: 'Missed Appointments', value: statistics.visit_compliance.missed_appointments, color: '#FFBB28' },
                        { name: 'Never Returned', value: statistics.visit_compliance.never_returned, color: '#FF8042' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Patients']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Visit Compliance Rate
                </Typography>
                <Typography variant="h2" color="primary" gutterBottom>
                  {statistics.visit_compliance.compliance_rate}%
                </Typography>
                <Typography variant="body1" paragraph>
                  {statistics.visit_compliance.on_schedule} out of {statistics.visit_compliance.on_schedule + statistics.visit_compliance.missed_appointments + statistics.visit_compliance.never_returned} patients are adhering to their scheduled visit plans.
                </Typography>
                <Typography variant="body2" color="error">
                  {statistics.visit_compliance.never_returned} patients ({formatPercentage(statistics.visit_compliance.never_returned / (statistics.visit_compliance.on_schedule + statistics.visit_compliance.missed_appointments + statistics.visit_compliance.never_returned) * 100)}) never returned after initial registration.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Render facility distribution chart
  const renderFacilityDistributionChart = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Attendance by Facility" 
          subheader="Distribution of patients by healthcare facility"
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statistics.attendance_by_facility}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="facility" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name, props) => [`${value} (${formatPercentage(props.payload.percentage)})`, 'Patients']}
                />
                <Bar dataKey="count" name="Patients" fill="#82CA9D" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render delivery outcomes card
  const renderDeliveryOutcomesCard = () => {
    if (!statistics) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Delivery Outcomes" 
          subheader="Summary of delivery outcomes and maternal statistics"
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Normal Delivery', value: statistics.delivery_outcomes.normal_delivery, color: '#00C49F' },
                        { name: 'Cesarean Section', value: statistics.delivery_outcomes.cesarean_section, color: '#FFBB28' },
                        { name: 'Assisted Delivery', value: statistics.delivery_outcomes.assisted_delivery, color: '#0088FE' },
                        { name: 'Still Births', value: statistics.delivery_outcomes.still_births, color: '#FF8042' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Normal Delivery', value: statistics.delivery_outcomes.normal_delivery, color: '#00C49F' },
                        { name: 'Cesarean Section', value: statistics.delivery_outcomes.cesarean_section, color: '#FFBB28' },
                        { name: 'Assisted Delivery', value: statistics.delivery_outcomes.assisted_delivery, color: '#0088FE' },
                        { name: 'Still Births', value: statistics.delivery_outcomes.still_births, color: '#FF8042' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Deliveries']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Key Delivery Statistics
              </Typography>
              <TableContainer sx={{ marginTop: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Deliveries</TableCell>
                      <TableCell align="right">{formatNumber(statistics.delivery_outcomes.total_deliveries)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>C-Section Rate</TableCell>
                      <TableCell align="right">
                        {formatPercentage(statistics.delivery_outcomes.cesarean_section / statistics.delivery_outcomes.total_deliveries * 100)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Still Birth Rate</TableCell>
                      <TableCell align="right">
                        {formatPercentage(statistics.delivery_outcomes.still_births / statistics.delivery_outcomes.total_deliveries * 100)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Maternal Deaths</TableCell>
                      <TableCell align="right">{statistics.delivery_outcomes.maternal_deaths}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Maternal Mortality Ratio</TableCell>
                      <TableCell align="right">
                        {statistics.delivery_outcomes.maternal_mortality_ratio} per 100,000 live births
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Alert severity="info" sx={{ mt: 2 }}>
                The World Health Organization (WHO) target for maternal mortality ratio is below 70 per 100,000 live births.
              </Alert>
            </Grid>
          </Grid>
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
            title="Antenatal Registration Trends" 
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
                    dataKey="total_registrations" 
                    name="Total Registrations" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="first_trimester" 
                    name="1st Trimester" 
                    stroke="#00C49F" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="second_trimester" 
                    name="2nd Trimester" 
                    stroke="#FFBB28" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="third_trimester" 
                    name="3rd Trimester" 
                    stroke="#FF8042" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ mb: 4 }}>
          <CardHeader 
            title="Risk Assessment Over Time" 
            subheader="High-risk pregnancies as percentage of total registrations"
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
                    dataKey="high_risk" 
                    name="High Risk Cases" 
                    stroke="#FF8042" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visit_compliance" 
                    name="Visit Compliance (%)" 
                    stroke="#00C49F" 
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
                    <TableCell align="right"><strong>1st Trimester</strong></TableCell>
                    <TableCell align="right"><strong>2nd Trimester</strong></TableCell>
                    <TableCell align="right"><strong>3rd Trimester</strong></TableCell>
                    <TableCell align="right"><strong>High Risk</strong></TableCell>
                    <TableCell align="right"><strong>Compliance %</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trendsData.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell component="th" scope="row">{row.month}</TableCell>
                      <TableCell align="right">{row.total_registrations}</TableCell>
                      <TableCell align="right">{row.first_trimester}</TableCell>
                      <TableCell align="right">{row.second_trimester}</TableCell>
                      <TableCell align="right">{row.third_trimester}</TableCell>
                      <TableCell align="right">{row.high_risk}</TableCell>
                      <TableCell align="right">{row.visit_compliance}%</TableCell>
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
    <MainLayout title="Antenatal Statistics">
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
              Antenatal Statistics & Analysis
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
                <InputLabel id="facility-label">Facility</InputLabel>
                <Select
                  labelId="facility-label"
                  id="facility"
                  name="facility"
                  value={filters.facility}
                  onChange={handleFilterChange}
                  label="Facility"
                >
                  <MenuItem value="">All Facilities</MenuItem>
                  <MenuItem value="Health Center 1">Health Center 1</MenuItem>
                  <MenuItem value="Health Center 2">Health Center 2</MenuItem>
                  <MenuItem value="Health Center 3">Health Center 3</MenuItem>
                  <MenuItem value="Health Center 4">Health Center 4</MenuItem>
                  <MenuItem value="Health Center 5">Health Center 5</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={3} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="risk-level-label">Risk Level</InputLabel>
                <Select
                  labelId="risk-level-label"
                  id="risk_level"
                  name="risk_level"
                  value={filters.risk_level}
                  onChange={handleFilterChange}
                  label="Risk Level"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="low">Low Risk</MenuItem>
                  <MenuItem value="medium">Medium Risk</MenuItem>
                  <MenuItem value="high">High Risk</MenuItem>
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
                  <MenuItem value="Below 18">Below 18</MenuItem>
                  <MenuItem value="18-25">18-25 years</MenuItem>
                  <MenuItem value="26-35">26-35 years</MenuItem>
                  <MenuItem value="Above 35">Above 35 years</MenuItem>
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
            aria-label="antenatal statistics tabs"
          >
            <Tab label="Overview" />
            <Tab label="Risk Analysis" />
            <Tab label="Outcomes" />
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
                    {renderTrimesterChart()}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {renderAgeDistributionChart()}
                  </Grid>
                </Grid>

                {/* Secondary Charts */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    {renderMonthlyRegistrationsChart()}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {renderFacilityDistributionChart()}
                  </Grid>
                </Grid>

                {/* Visit Compliance */}
                <Box sx={{ mb: 4 }}>
                  {renderVisitComplianceCard()}
                </Box>
              </Box>
            )}

            {/* Risk Analysis Tab */}
            {tabValue === 1 && (
              <Box>
                {/* Summary Stats for Quick Reference */}
                <Box sx={{ mb: 4 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Card sx={{ bgcolor: '#FFF8F8' }}>
                        <CardContent>
                          <Typography color="error" gutterBottom>
                            High Risk Cases
                          </Typography>
                          <Typography variant="h4" color="error">
                            {statistics?.summary.high_risk_cases}
                          </Typography>
                          <Typography variant="body2" color="error">
                            {formatPercentage(statistics?.summary.high_risk_cases / statistics?.summary.active_pregnancies * 100)} of active pregnancies
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Card>
                        <CardContent>
                          <Typography color="warning.main" gutterBottom>
                            Visit Compliance Rate
                          </Typography>
                          <Typography variant="h4" color="warning.main">
                            {statistics?.visit_compliance.compliance_rate}%
                          </Typography>
                          <Typography variant="body2" color="warning.main">
                            {statistics?.visit_compliance.never_returned} patients never returned
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Card>
                        <CardContent>
                          <Typography color="info.main" gutterBottom>
                            Active Pregnancies
                          </Typography>
                          <Typography variant="h4" color="info.main">
                            {statistics?.summary.active_pregnancies}
                          </Typography>
                          <Typography variant="body2" color="info.main">
                            Currently being monitored
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
                
                {/* Risk Level Distribution */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    {renderRiskLevelChart()}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {renderRiskFactorsChart()}
                  </Grid>
                </Grid>
                
                {/* Risk Analysis Table */}
                <Card>
                  <CardHeader 
                    title="Risk Analysis by Age Group" 
                    subheader="Distribution of risk levels across different age groups"
                  />
                  <Divider />
                  <CardContent>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Age Group</TableCell>
                            <TableCell align="right">Total</TableCell>
                            <TableCell align="right">Low Risk</TableCell>
                            <TableCell align="right">Medium Risk</TableCell>
                            <TableCell align="right">High Risk</TableCell>
                            <TableCell align="right">High Risk %</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>Below 18</TableCell>
                            <TableCell align="right">23</TableCell>
                            <TableCell align="right">5</TableCell>
                            <TableCell align="right">10</TableCell>
                            <TableCell align="right">8</TableCell>
                            <TableCell align="right">34.8%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>18-25</TableCell>
                            <TableCell align="right">198</TableCell>
                            <TableCell align="right">134</TableCell>
                            <TableCell align="right">42</TableCell>
                            <TableCell align="right">22</TableCell>
                            <TableCell align="right">11.1%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>26-35</TableCell>
                            <TableCell align="right">284</TableCell>
                            <TableCell align="right">176</TableCell>
                            <TableCell align="right">63</TableCell>
                            <TableCell align="right">45</TableCell>
                            <TableCell align="right">15.8%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Above 35</TableCell>
                            <TableCell align="right">82</TableCell>
                            <TableCell align="right">10</TableCell>
                            <TableCell align="right">35</TableCell>
                            <TableCell align="right">37</TableCell>
                            <TableCell align="right">45.1%</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Outcomes Tab */}
            {tabValue === 2 && (
              <Box>
                {/* Delivery Outcomes Card */}
                <Box sx={{ mb: 4 }}>
                  {renderDeliveryOutcomesCard()}
                </Box>
                
                {/* Outcome Analysis Tables */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardHeader 
                        title="Outcomes by Age Group" 
                        subheader="Delivery outcomes across different age groups"
                      />
                      <Divider />
                      <CardContent>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Age Group</TableCell>
                                <TableCell align="right">C-Section Rate</TableCell>
                                <TableCell align="right">Still Birth Rate</TableCell>
                                <TableCell align="right">Maternal Mortality</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell>Below 18</TableCell>
                                <TableCell align="right">24.2%</TableCell>
                                <TableCell align="right">3.2%</TableCell>
                                <TableCell align="right">820</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>18-25</TableCell>
                                <TableCell align="right">15.8%</TableCell>
                                <TableCell align="right">1.4%</TableCell>
                                <TableCell align="right">285</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>26-35</TableCell>
                                <TableCell align="right">18.2%</TableCell>
                                <TableCell align="right">1.3%</TableCell>
                                <TableCell align="right">350</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Above 35</TableCell>
                                <TableCell align="right">26.3%</TableCell>
                                <TableCell align="right">2.5%</TableCell>
                                <TableCell align="right">620</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                          *Maternal Mortality is expressed as deaths per 100,000 live births
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardHeader 
                        title="Outcomes by Risk Level" 
                        subheader="Delivery outcomes across different risk levels"
                      />
                      <Divider />
                      <CardContent>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Risk Level</TableCell>
                                <TableCell align="right">C-Section Rate</TableCell>
                                <TableCell align="right">Still Birth Rate</TableCell>
                                <TableCell align="right">Maternal Mortality</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell>Low Risk</TableCell>
                                <TableCell align="right">12.3%</TableCell>
                                <TableCell align="right">0.8%</TableCell>
                                <TableCell align="right">150</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Medium Risk</TableCell>
                                <TableCell align="right">22.8%</TableCell>
                                <TableCell align="right">1.9%</TableCell>
                                <TableCell align="right">480</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>High Risk</TableCell>
                                <TableCell align="right">38.5%</TableCell>
                                <TableCell align="right">3.6%</TableCell>
                                <TableCell align="right">980</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                          *Maternal Mortality is expressed as deaths per 100,000 live births
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Detailed Trends Tab */}
            {tabValue === 3 && renderDetailedTrendsTab()}
          </>
        )}
      </Paper>
    </MainLayout>
  );
};

export default AntenatalStatistics;