// src/pages/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  PeopleAlt as PatientsIcon,
  ChildCare as BirthsIcon,
  SentimentVeryDissatisfied as DeathsIcon,
  Healing as ImmunizationIcon,
  Coronavirus as DiseaseIcon,
  TrendingUp as TrendingUpIcon,
  Pregnant as PregnantIcon,
  FamilyRestroom as FamilyIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import MainLayout from '../../components/common/Layout/MainLayout';
import ApiConnectionTest from '../../components/ApiConnectionTest';

// Sample data - would be replaced with API calls in production
const dashboardData = {
  stats: {
    totalPatients: 12458,
    newToday: 32,
    birthsThisMonth: 145,
    deathsThisMonth: 38,
    immunizationsThisWeek: 156,
    diseaseReports: 18
  },
  recentActivity: [
    { id: 1, type: 'patient', action: 'registered', time: '10 minutes ago', details: 'New patient registered - Akpan John' },
    { id: 2, type: 'birth', action: 'recorded', time: '30 minutes ago', details: 'Birth record added - Female, 3.2kg' },
    { id: 3, type: 'immunization', action: 'scheduled', time: '1 hour ago', details: 'Immunization scheduled - Polio, 24 children' },
    { id: 4, type: 'disease', action: 'reported', time: '3 hours ago', details: 'Malaria case reported - Ikot Ekpene area' },
    { id: 5, type: 'death', action: 'recorded', time: '5 hours ago', details: 'Death record added - Male, 78 years' },
  ],
  notCompleted: [
    { id: 1, task: 'Complete weekly immunization report', due: 'Today' },
    { id: 2, task: 'Update patient records for transfer cases', due: 'Tomorrow' },
    { id: 3, task: 'Submit monthly birth statistics', due: 'In 2 days' },
  ]
};

// Dashboard component
const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  // Simulating data fetching from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In production, this would be an API call
        // const response = await dashboardService.getDashboardData();
        
        // Simulate API delay
        setTimeout(() => {
          setData(dashboardData);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Map icons to activity types
  const getActivityIcon = (type) => {
    switch (type) {
      case 'patient':
        return <PatientsIcon color="primary" />;
      case 'birth':
        return <BirthsIcon color="success" />;
      case 'death':
        return <DeathsIcon color="error" />;
      case 'immunization':
        return <ImmunizationIcon color="info" />;
      case 'disease':
        return <DiseaseIcon color="warning" />;
      default:
        return <BarChartIcon color="primary" />;
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <MainLayout title="Dashboard">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <MainLayout title="Dashboard">
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout title="Dashboard">
      {/* Welcome section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          bgcolor: 'primary.light',
          color: 'primary.contrastText',
          borderRadius: 2
        }}
      >
        <Typography variant="h5" gutterBottom>
          Welcome back, {user?.name || 'User'}
        </Typography>
        <Typography variant="body1">
          Here's what's happening in the Akwa Ibom Health Data System today.
        </Typography>
      </Paper>
      
      {/* Statistics cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card elevation={2}>
            <CardContent sx={{ p: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mb: 1 }}>
                <PatientsIcon />
              </Avatar>
              <Typography variant="h5" component="div">
                {data.stats.totalPatients.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Patients
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                component={RouterLink} 
                to="/patients"
                sx={{ ml: 'auto' }}
              >
                View All
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card elevation={2}>
            <CardContent sx={{ p: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mb: 1 }}>
                <BirthsIcon />
              </Avatar>
              <Typography variant="h5" component="div">
                {data.stats.birthsThisMonth}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Births this Month
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                component={RouterLink} 
                to="/births"
                sx={{ ml: 'auto' }}
              >
                View All
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card elevation={2}>
            <CardContent sx={{ p: 2 }}>
              <Avatar sx={{ bgcolor: 'error.main', mb: 1 }}>
                <DeathsIcon />
              </Avatar>
              <Typography variant="h5" component="div">
                {data.stats.deathsThisMonth}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Deaths this Month
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                component={RouterLink} 
                to="/deaths"
                sx={{ ml: 'auto' }}
              >
                View All
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card elevation={2}>
            <CardContent sx={{ p: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main', mb: 1 }}>
                <ImmunizationIcon />
              </Avatar>
              <Typography variant="h5" component="div">
                {data.stats.immunizationsThisWeek}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Immunizations this Week
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                component={RouterLink} 
                to="/immunization"
                sx={{ ml: 'auto' }}
              >
                View All
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card elevation={2}>
            <CardContent sx={{ p: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mb: 1 }}>
                <DiseaseIcon />
              </Avatar>
              <Typography variant="h5" component="div">
                {data.stats.diseaseReports}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Disease Reports
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                component={RouterLink} 
                to="/diseases"
                sx={{ ml: 'auto' }}
              >
                View All
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card elevation={2}>
            <CardContent sx={{ p: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mb: 1 }}>
                <PatientsIcon />
              </Avatar>
              <Typography variant="h5" component="div">
                {data.stats.newToday}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                New Patients Today
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                component={RouterLink} 
                to="/patients"
                sx={{ ml: 'auto' }}
              >
                View All
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      {/* Activity and tasks section */}
      <Grid container spacing={3}>
        {/* Recent activity */}
        <Grid item xs={12} md={7}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {data.recentActivity.map((activity) => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon>
                        {getActivityIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.details}
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {activity.time}
                          </Typography>
                        }
                      />
                      <Chip 
                        label={activity.action} 
                        size="small" 
                        variant="outlined"
                        sx={{ 
                          textTransform: 'capitalize',
                          borderRadius: 1
                        }}
                      />
                    </ListItem>
                    {activity.id < data.recentActivity.length && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button 
                  variant="text" 
                  color="primary"
                  size="small"
                >
                  View All Activity
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Tasks section */}
        <Grid item xs={12} md={5}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tasks to Complete
              </Typography>
              <List>
                {data.notCompleted.map((task) => (
                  <React.Fragment key={task.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={task.task}
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Due: {task.due}
                          </Typography>
                        }
                      />
                      <Button 
                        size="small" 
                        variant="outlined"
                      >
                        Complete
                      </Button>
                    </ListItem>
                    {task.id < data.notCompleted.length && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  size="small"
                >
                  View All Tasks
                </Button>
              </Box>
            </CardContent>
          </Card>
          <ApiConnectionTest />
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default Dashboard;