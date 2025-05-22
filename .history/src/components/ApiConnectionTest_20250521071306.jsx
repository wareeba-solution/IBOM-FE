// src/components/ApiConnectionTest.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, CircularProgress, Alert, Divider, Link, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { CheckCircle, Error, Info, ArrowRight } from '@mui/icons-material';

const ApiConnectionTest = () => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);
  const [serverInfo, setServerInfo] = useState(null);
  
  // Get API URL based on environment
  const getApiUrl = () => {
    // Check window.ENV first (if set in public/config.js)
    if (window.ENV && window.ENV.API_URL) {
      return window.ENV.API_URL;
    }
    
    // Check environment variables
    if (process.env.REACT_APP_API_BASE_URL) {
      return process.env.REACT_APP_API_BASE_URL;
    }
    
    // Default for development
    return 'http://localhost:5000/api';
  };
  
  const apiUrl = getApiUrl();

  useEffect(() => {
    console.log('Testing connection to:', apiUrl);
    
    const testConnection = async () => {
      try {
        // Try the health endpoint with axios directly (to bypass any interceptors)
        setStatus('checking');
        const healthResponse = await axios.get(`${apiUrl}/health`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        setStatus('success');
        setServerInfo(healthResponse.data);
        console.log('Health endpoint response:', healthResponse.data);
        
      } catch (healthError) {
        console.error('Health endpoint error:', healthError);
        
        // If health endpoint fails, try the root API endpoint
        try {
          setStatus('checking');
          const rootResponse = await axios.get(apiUrl, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          setStatus('success');
          setServerInfo(rootResponse.data);
          console.log('Root endpoint response:', rootResponse.data);
          
        } catch (rootError) {
          console.error('Root endpoint error:', rootError);
          
          setStatus('error');
          
          // Provide detailed error information
          if (!healthError.response && !rootError.response) {
            setError(`Network error - the backend server at ${apiUrl} may not be running or CORS might be blocking the request`);
          } else {
            const statusCode = healthError.response?.status || rootError.response?.status;
            const statusText = healthError.response?.statusText || rootError.response?.statusText;
            setError(`Server responded with status ${statusCode} ${statusText}. Check the console for more details.`);
          }
        }
      }
    };

    testConnection();
  }, [apiUrl]);

  return (
    <Paper elevation={3} sx={{ padding: 3, maxWidth: 800, mx: 'auto', my: 2 }}>
      <Typography variant="h5" gutterBottom>
        API Connection Test
      </Typography>
      
      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle1">
          <strong>API URL:</strong> {apiUrl}
        </Typography>
        
        <Typography variant="subtitle1">
          <strong>Environment:</strong> {process.env.NODE_ENV || 'development'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
          <Typography variant="subtitle1" sx={{ mr: 1 }}>
            <strong>Status:</strong>
          </Typography>
          
          {status === 'checking' && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography color="text.secondary">Checking connection...</Typography>
            </Box>
          )}
          
          {status === 'success' && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle color="success" sx={{ mr: 1 }} />
              <Typography color="success.main">Connected successfully!</Typography>
            </Box>
          )}
          
          {status === 'error' && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Error color="error" sx={{ mr: 1 }} />
              <Typography color="error.main">Connection failed</Typography>
            </Box>
          )}
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}
      
      {serverInfo && (
        <Box sx={{ my: 2 }}>
          <Typography variant="h6" gutterBottom>Server Information</Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(serverInfo, null, 2)}
            </pre>
          </Paper>
        </Box>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Troubleshooting Tips
        </Typography>
        
        <List dense>
          <ListItem>
            <ListItemIcon>
              <ArrowRight color="primary" />
            </ListItemIcon>
            <ListItemText primary="Ensure the backend server is running on port 5000" />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <ArrowRight color="primary" />
            </ListItemIcon>
            <ListItemText primary="Check the browser console for CORS errors" />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <ArrowRight color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Verify that the backend has the correct CORS configuration for localhost:3000" 
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <ArrowRight color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary={
                <span>
                  Try accessing the API directly in a browser: 
                  <Link 
                    href={`${apiUrl}/health`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ ml: 1 }}
                  >
                    {`${apiUrl}/health`}
                  </Link>
                </span>
              } 
            />
          </ListItem>
        </List>
      </Box>
    </Paper>
  );
};

export default ApiConnectionTest;