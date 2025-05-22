// src/components/ApiConnectionTest.jsx
import React, { useState, useEffect } from 'react';
import apiBase from '../utils/apiBase';
import config from '../config';

const ApiConnectionTest = () => {
  const [status, setStatus] = useState('Checking connection...');
  const [error, setError] = useState(null);
  const [serverInfo, setServerInfo] = useState(null);
  const [apiUrl, setApiUrl] = useState(config.apiUrl);

  useEffect(() => {
    console.log('Testing connection to:', apiUrl);
    
    const testConnection = async () => {
      try {
        // Try the health endpoint first
        setStatus('Connecting to /health endpoint...');
        const healthResponse = await apiBase.get('/health');
        
        setStatus('Connected successfully to health endpoint!');
        setServerInfo(healthResponse.data);
        console.log('Health endpoint response:', healthResponse.data);
        
      } catch (healthError) {
        console.error('Health endpoint error:', healthError);
        
        // If health endpoint fails, try the root API endpoint
        try {
          setStatus('Trying root API endpoint...');
          const rootResponse = await apiBase.get('/');
          
          setStatus('Connected successfully to root endpoint!');
          setServerInfo(rootResponse.data);
          console.log('Root endpoint response:', rootResponse.data);
          
        } catch (rootError) {
          console.error('Root endpoint error:', rootError);
          
          setStatus('Connection failed');
          
          // Provide detailed error information
          if (!healthError.response && !rootError.response) {
            setError(`Network error - the backend server at ${apiUrl} may not be running or CORS might be blocking the request`);
          } else {
            const statusCode = healthError.response?.status || rootError.response?.status;
            setError(`Server responded with status ${statusCode}. Check the console for more details.`);
          }
        }
      }
    };

    testConnection();
  }, [apiUrl]);

  return (
    <div className="api-connection-test" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px', maxWidth: '600px', margin: '20px auto' }}>
      <h2>API Connection Test</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>API URL:</strong> {apiUrl}
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Environment:</strong> {process.env.NODE_ENV || 'development'}
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Status:</strong> <span style={{ color: status.includes('failed') ? 'red' : status.includes('success') ? 'green' : 'orange' }}>{status}</span>
      </div>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffeeee', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {serverInfo && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h3>Server Information</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(serverInfo, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>
          <strong>Troubleshooting Tips:</strong>
          <ol style={{ marginTop: '5px' }}>
            <li>Ensure the backend server is running on port 5000</li>
            <li>Check the browser console for CORS errors</li>
            <li>Verify that the backend has the correct CORS configuration for localhost:3000</li>
            <li>Try accessing the API directly in a browser: <a href="http://localhost:5000/api/health" target="_blank" rel="noopener noreferrer">http://localhost:5000/api/health</a></li>
          </ol>
        </p>
      </div>
    </div>
  );
};

export default ApiConnectionTest;