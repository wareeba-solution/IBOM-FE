// src/pages/facilities/FacilityStatistics.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
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
  ArrowBack as ArrowBackIcon,
  FileDownload as ExportIcon,
  Print as PrintIcon,
  DateRange as DateRangeIcon,
  Assessment as AssessmentIcon,
  LocalHospital as HospitalIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon
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
  ResponsiveContainer,
  Label
} from 'recharts';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';

// Mock service
const statisticsService = {
  getAllFacilitiesStats: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          total_facilities: 120,
          by_type: [
            { name: 'Hospital', count: 15 },
            { name: 'Primary Health Center', count: 78 },
            { name: 'Clinic', count: 27 }
          ],
          by_level: [
            { name: 'Primary', count: 95 },
            { name: 'Secondary', count: 20 },
            { name: 'Tertiary', count: 5 }
          ],
          by_ownership: [
            { name: 'Government', count: 85 },
            { name: 'Private', count: 25 },
            { name: 'Faith-based', count: 7 },
            { name: 'NGO', count: 3 }
          ],
          by_status: [
            { name: 'Active', count: 110 },
            { name: 'Inactive', count: 7 },
            { name: 'Under Construction', count: 3 }
          ],
          by_lga: [
            { name: 'Uyo', count: 25 },
            { name: 'Ikot Ekpene', count: 18 },
            { name: 'Eket', count: 15 },
            { name: 'Oron', count: 12 },
            { name: 'Abak', count: 10 },
            { name: 'Etinan', count: 8 },
            { name: 'Ini', count: 6 },
            { name: 'Ibeno', count: 5 },
            { name: 'Itu', count: 5 },
            { name: 'Others', count: 16 }
          ],
          beds_total: 3500,
          beds_per_population: 1.5, // per 1000 population
          staff_total: 7800,
          staff_by_category: [
            { name: 'Doctors', count: 950 },
            { name: 'Nurses', count: 3200 },
            { name: 'Lab Technicians', count: 620 },
            { name: 'Administrative', count: 1530 },
            { name: 'Other', count: 1500 }
          ],
          service_availability: [
            { name: 'Outpatient Services', percentage: 98 },
            { name: 'Laboratory Services', percentage: 86 },
            { name: 'Pharmacy', percentage: 75 },
            { name: 'Emergency Services', percentage: 45 },
            { name: 'Surgery', percentage: 32 },
            { name: 'Maternity', percentage: 61 },
            { name: 'Pediatrics', percentage: 53 },
            { name: 'Vaccination/Immunization', percentage: 87 },
            { name: 'Family Planning', percentage: 76 },
            { name: 'Mental Health Services', percentage: 18 }
          ],
          monthly_registrations: [
            { month: 'Jan', count: 2 },
            { month: 'Feb', count: 1 },
            { month: 'Mar', count: 3 },
            { month: 'Apr', count: 5 },
            { month: 'May', count: 2 },
            { month: 'Jun', count: 4 },
            { month: 'Jul', count: 1 },
            { month: 'Aug', count: 2 },
            { month: 'Sep', count: 3 },
            { month: 'Oct', count: 1 },
            { month: 'Nov', count: 0 },
            { month: 'Dec', count: 2 }
          ],
          yearly_registrations: [
            { year: '2018', count: 10 },
            { year: '2019', count: 15 },
            { year: '2020', count: 8 },
            { year: '2021', count: 12 },
            { year: '2022', count: 18 },
            { year: '2023', count: 22 },
            { year: '2024', count: 25 }
          ]
        });
      }, 500);
    });
  },
  getFacilityStats: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = {
          id,
          name: `${parseInt(id) % 3 === 0 ? 'General Hospital' : (parseInt(id) % 3 === 1 ? 'Primary Health Center' : 'Medical Clinic')} ${id}`,
          facility_code: `FAC${10000 + parseInt(id)}`,
          type: parseInt(id) % 3 === 0 ? 'Hospital' : (parseInt(id) % 3 === 1 ? 'Primary Health Center' : 'Clinic'),
          level: parseInt(id) % 3 === 0 ? 'Secondary' : (parseInt(id) % 3 === 1 ? 'Primary' : 'Primary'),
          beds: parseInt(id) % 3 === 0 ? 50 + parseInt(id) : (parseInt(id) % 3 === 1 ? 20 + parseInt(id) : 10 + parseInt(id)),
          staff_count: parseInt(id) % 3 === 0 ? 100 + parseInt(id) : (parseInt(id) % 3 === 1 ? 30 + parseInt(id) : 15 + parseInt(id)),
          
          // Patient visit statistics
          patient_visits: [
            { month: 'Jan', outpatient: 450 + parseInt(id) * 10, inpatient: 120 + parseInt(id) * 5 },
            { month: 'Feb', outpatient: 420 + parseInt(id) * 10, inpatient: 110 + parseInt(id) * 5 },
            { month: 'Mar', outpatient: 480 + parseInt(id) * 10, inpatient: 130 + parseInt(id) * 5 },
            { month: 'Apr', outpatient: 520 + parseInt(id) * 10, inpatient: 140 + parseInt(id) * 5 },
            { month: 'May', outpatient: 550 + parseInt(id) * 10, inpatient: 150 + parseInt(id) * 5 },
            { month: 'Jun', outpatient: 580 + parseInt(id) * 10, inpatient: 160 + parseInt(id) * 5 }
          ],
          
          // Bed utilization
          bed_utilization: [
            { month: 'Jan', occupancy_rate: 65 + (parseInt(id) % 10) },
            { month: 'Feb', occupancy_rate: 68 + (parseInt(id) % 10) },
            { month: 'Mar', occupancy_rate: 72 + (parseInt(id) % 10) },
            { month: 'Apr', occupancy_rate: 75 + (parseInt(id) % 10) },
            { month: 'May', occupancy_rate: 70 + (parseInt(id) % 10) },
            { month: 'Jun', occupancy_rate: 73 + (parseInt(id) % 10) }
          ],
          
          // Service usage
          service_usage: [
            { name: 'Outpatient Visits', value: 3000 + parseInt(id) * 50 },
            { name: 'Laboratory Tests', value: 1800 + parseInt(id) * 30 },
            { name: 'Pharmacy Visits', value: 2500 + parseInt(id) * 40 },
            { name: 'Emergency Cases', value: 500 + parseInt(id) * 10 },
            { name: 'Surgeries', value: 300 + parseInt(id) * 5 },
            { name: 'Antenatal Visits', value: 400 + parseInt(id) * 8 }
          ],
          
          // Patient demographics
          patient_demographics: {
            age_groups: [
              { name: '0-5', value: 15 + (parseInt(id) % 5) },
              { name: '6-17', value: 20 + (parseInt(id) % 5) },
              { name: '18-35', value: 30 + (parseInt(id) % 5) },
              { name: '36-50', value: 20 + (parseInt(id) % 5) },
              { name: '51+', value: 15 + (parseInt(id) % 5) }
            ],
            gender_ratio: {
              male: 48 + (parseInt(id) % 5),
              female: 52 - (parseInt(id) % 5)
            }
          },
          
          // Top conditions
          top_conditions: [
            { name: 'Malaria', count: 500 + parseInt(id) * 10 },
            { name: 'Hypertension', count: 300 + parseInt(id) * 8 },
            { name: 'Respiratory Infections', count: 250 + parseInt(id) * 7 },
            { name: 'Diabetes', count: 200 + parseInt(id) * 6 },
            { name: 'Gastrointestinal Disorders', count: 180 + parseInt(id) * 5 }
          ],
          
          // Staff distribution
          staff_distribution: [
            { name: 'Doctors', value: parseInt(id) % 3 === 0 ? 25 : (parseInt(id) % 3 === 1 ? 15 : 10) },
            { name: 'Nurses', value: parseInt(id) % 3 === 0 ? 40 : (parseInt(id) % 3 === 1 ? 30 : 20) },
            { name: 'Lab Technicians', value: parseInt(id) % 3 === 0 ? 10 : (parseInt(id) % 3 === 1 ? 5 : 3) },
            { name: 'Administrative', value: parseInt(id) % 3 === 0 ? 15 : (parseInt(id) % 3 === 1 ? 10 : 5) },
            { name: 'Other', value: parseInt(id) % 3 === 0 ? 10 : (parseInt(id) % 3 === 1 ? 5 : 5) }
          ]
        };
        resolve(data);
      }, 500);
    });
  }
};

// Component for facility statistics
const FacilityStatistics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const facilityId = searchParams.get('id');
  
  const { loading, error, execute } = useApi();
  
  // State
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('6months');
  const [facilitySelector, setFacilitySelector] = useState('all');
  const [stats, setStats] = useState(null);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];
  
  // Load statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      if (facilityId) {
        // Load specific facility statistics
        await execute(
          statisticsService.getFacilityStats,
          [facilityId],
          (response) => {
            setStats(response);
            setFacilitySelector(facilityId);
          }
        );
      } else {
        // Load all facilities statistics
        await execute(
          statisticsService.getAllFacilitiesStats,
          [],
          (response) => {
            setStats(response);
          }
        );
      }
    };
    
    fetchStatistics();
  }, [facilityId]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  // Handle facility selector change
  const handleFacilitySelectorChange = (event) => {
    const newValue = event.target.value;
    setFacilitySelector(newValue);
    
    if (newValue === 'all') {
      navigate('/facilities/statistics');
    } else {
      navigate(`/facilities/statistics?id=${newValue}`);
    }
  };
  
  // Navigate back
  const handleBack = () => {
    if (facilityId) {
      navigate(`/facilities/${facilityId}`);
    } else {
      navigate('/facilities');
    }
  };
  
  // Render stacked bar chart for patient visits (specific facility)
  const renderPatientVisitsChart = () => {
    if (!stats || !stats.patient_visits) return null;
    
    return (
      <Card variant="outlined" sx={{ height: 400, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Patient Visits
        </Typography>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart
            data={stats.patient_visits}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="outpatient" name="Outpatient" stackId="a" fill="#0088FE" />
            <Bar dataKey="inpatient" name="Inpatient" stackId="a" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    );
  };
  
  // Render bed utilization chart (specific facility)
  const renderBedUtilizationChart = () => {
    if (!stats || !stats.bed_utilization) return null;
    
    return (
      <Card variant="outlined" sx={{ height: 400, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Bed Occupancy Rate (%)
        </Typography>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart
            data={stats.bed_utilization}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="occupancy_rate" 
              name="Occupancy Rate (%)" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }} 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    );
  };
  
  // Render service usage chart (specific facility)
  const renderServiceUsageChart = () => {
    if (!stats || !stats.service_usage) return null;
    
    return (
      <Card variant="outlined" sx={{ height: 400, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Service Usage
        </Typography>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart
            data={stats.service_usage}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="value" name="Count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    );
  };
  
  // Render patient demographics chart (specific facility)
  const renderPatientDemographicsChart = () => {
    if (!stats || !stats.patient_demographics) return null;
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: 400, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Patient Age Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={stats.patient_demographics.age_groups}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.patient_demographics.age_groups.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: 400, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Gender Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Male', value: stats.patient_demographics.gender_ratio.male },
                    { name: 'Female', value: stats.patient_demographics.gender_ratio.female }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#0088FE" />
                  <Cell fill="#FF8042" />
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    );
  };
  
  // Render top conditions chart (specific facility)
  const renderTopConditionsChart = () => {
    if (!stats || !stats.top_conditions) return null;
    
    return (
      <Card variant="outlined" sx={{ height: 400, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Top Medical Conditions
        </Typography>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart
            data={stats.top_conditions}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" name="Cases" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    );
  };
  
  // Render staff distribution chart (specific facility) 
  const renderStaffDistributionChart = () => {
    if (!stats || !stats.staff_distribution) return null;
    
    return (
      <Card variant="outlined" sx={{ height: 400, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Staff Distribution
        </Typography>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie
              data={stats.staff_distribution}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {stats.staff_distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name, props) => [`${value}%`, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    );
  };
  
  // Render facility distribution chart (all facilities)
  const renderFacilityDistributionCharts = () => {
    if (!stats) return null;
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: 400, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Facilities by Type
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={stats.by_type}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="name"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.by_type.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: 400, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Facilities by Ownership
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={stats.by_ownership}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="name"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.by_ownership.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: 400, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Facilities by LGA
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart
                data={stats.by_lga}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="Number of Facilities" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: 400, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Service Availability
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart
                data={stats.service_availability}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="percentage" name="% of Facilities" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    );
  };
  
  // Render registration trends chart (all facilities)
  const renderRegistrationTrendsChart = () => {
    if (!stats) return null;
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: 400, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Facility Registrations (Current Year)
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart
                data={stats.monthly_registrations}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="New Facilities" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: 400, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Yearly Facility Registrations
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart
                data={stats.yearly_registrations}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" name="New Facilities" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    );
  };
  
  // Render summary indicators (all facilities)
  const renderSummaryIndicators = () => {
    if (!stats) return null;
    
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <HospitalIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">
              {stats.total_facilities}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Facilities
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <BedIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">
              {stats.beds_total.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Beds
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Diversity3Icon color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">
              {stats.staff_total.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Healthcare Staff
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <LocationIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">
              {stats.beds_per_population.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Beds per 1,000 Population
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };
  
  // Import BedIcon for summary indicators
  const BedIcon = () => {
    return <span role="img" aria-label="bed" style={{ fontSize: '1.5rem' }}>🛏️</span>;
  };
  
  // Render specific facility stats
  const renderFacilitySpecificStats = () => {
    if (!stats || !stats.patient_visits) return null;
    
    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            {renderPatientVisitsChart()}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderBedUtilizationChart()}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderServiceUsageChart()}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderStaffDistributionChart()}
          </Grid>
          <Grid item xs={12}>
            {renderTopConditionsChart()}
          </Grid>
          <Grid item xs={12}>
            {renderPatientDemographicsChart()}
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  // Render general facility stats
  const renderGeneralFacilityStats = () => {
    if (!stats || !stats.by_type) return null;
    
    return (
      <Box>
        {renderSummaryIndicators()}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            {renderFacilityDistributionCharts()}
          </Grid>
          <Grid item xs={12}>
            {renderRegistrationTrendsChart()}
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <MainLayout 
      title="Facility Statistics"
      breadcrumbs={[
        { name: 'Facilities', path: '/facilities' },
        facilityId ? 
          { name: stats?.name || 'Facility', path: `/facilities/${facilityId}` } : 
          null,
        { name: 'Statistics', active: true }
      ].filter(Boolean)}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handleBack} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              {facilityId && stats?.name ? `${stats.name} - Statistics` : 'Healthcare Facilities Statistics'}
            </Typography>
          </Box>
          
          <Box>
            <Button 
              startIcon={<ExportIcon />} 
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Export Data
            </Button>
            <Button 
              startIcon={<PrintIcon />} 
              variant="outlined"
            >
              Print Report
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel id="facility-select-label">Facility</InputLabel>
            <Select
              labelId="facility-select-label"
              id="facility-select"
              value={facilitySelector}
              label="Facility"
              onChange={handleFacilitySelectorChange}
            >
              <MenuItem value="all">All Facilities</MenuItem>
              <MenuItem value="1">General Hospital 1</MenuItem>
              <MenuItem value="2">Primary Health Center 2</MenuItem>
              <MenuItem value="3">Medical Clinic 3</MenuItem>
              <MenuItem value="4">Primary Health Center 4</MenuItem>
              <MenuItem value="5">General Hospital 5</MenuItem>
            </Select>
          </FormControl>
          
          {facilityId && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="time-range-label">Time Range</InputLabel>
              <Select
                labelId="time-range-label"
                id="time-range"
                value={timeRange}
                label="Time Range"
                onChange={handleTimeRangeChange}
                startAdornment={<DateRangeIcon sx={{ mr: 1 }} />}
              >
                <MenuItem value="3months">Last 3 Months</MenuItem>
                <MenuItem value="6months">Last 6 Months</MenuItem>
                <MenuItem value="1year">Last Year</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : stats ? (
          <Box>
            {facilityId ? renderFacilitySpecificStats() : renderGeneralFacilityStats()}
          </Box>
        ) : (
          <Alert severity="info">
            No statistics available
          </Alert>
        )}
      </Paper>
    </MainLayout>
  );
};

export default FacilityStatistics;