// src/pages/errors/NotFound.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Button,
  Paper
} from '@mui/material';
import { 
  SentimentDissatisfied as SadIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const NotFound = () => {
  return (
    <Container component="main" maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <SadIcon color="primary" sx={{ fontSize: 100, mb: 2 }} />
        
        <Typography variant="h3" component="h1" gutterBottom align="center">
          404: Page Not Found
        </Typography>
        
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          The page you are looking for does not exist or has been moved.
        </Typography>
        
        <Button
          component={RouterLink}
          to="/dashboard"
          variant="contained"
          color="primary"
          startIcon={<HomeIcon />}
          sx={{ mt: 2 }}
        >
          Return to Dashboard
        </Button>
      </Paper>
    </Container>
  );
};

export default NotFound;