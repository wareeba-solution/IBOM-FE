// src/components/ApiConnectionTest.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert, 
  Divider, 
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  CheckCircle, 
  Error, 
  Info, 
  ArrowRight 
} from '@mui/icons-material';

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
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    
    // Default for development
    return 'http://localhost:5000';
  };
  
  const apiUrl = getApiUrl();

  useEffect(() => {
    console.log('Testing connection to:', apiUrl);
    
    const testConnection = async () => {
      try {
        // Try the health endpoint with axios directly
        setStatus('checking');
        const healthResponse = await axios.get(`${apiUrl}/health`, {
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
          const rootResponse = await axios.get(apiUrl, {
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
    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        API Connection Status
      </Typography>
      
      <Box sx={{ my: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>API URL:</strong> {apiUrl}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            <strong>Status:</strong>
          </Typography>
          
          {status === 'checking' && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">Checking connection...</Typography>
            </Box>
          )}
          
          {status === 'success' && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle color="success" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="success.main">Connected successfully!</Typography>
            </Box>
          )}
          
          {status === 'error' && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Error color="error" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="error.main">Connection failed</Typography>
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
          <Typography variant="subtitle2" gutterBottom>Server Information</Typography>
          <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.50' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.75rem' }}>
              {JSON.stringify(serverInfo, null, 2)}
            </pre>
          </Paper>
        </Box>
      )}
      
      {status === 'error' && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Troubleshooting Tips
          </Typography>
          
          <List dense disablePadding>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <ArrowRight color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Ensure the backend server is running on port 5000" 
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            
            <ListItem sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <ArrowRight color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Check the browser console for CORS errors" 
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            
            <ListItem sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <ArrowRight color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Verify the backend's CORS configuration includes localhost:3000" 
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          </List>
        </Box>
      )}
    </Paper>
  );
};

export default ApiConnectionTest;