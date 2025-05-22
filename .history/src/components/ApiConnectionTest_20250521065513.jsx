// src/components/ApiConnectionTest.jsx
import React, { useState, useEffect } from 'react';
import apiBase from '../utils/apiBase';
import config from '../config';

const ApiConnectionTest = () => {
  const [status, setStatus] = useState('Checking connection...');
  const [error, setError] = useState(null);
  const [serverInfo, setServerInfo] = useState(null);
  const [envInfo, setEnvInfo] = useState({
    apiUrl: config.apiUrl,
    currentHostname: window.location.hostname,
    nodeEnv: process.env.NODE_ENV || 'not set',
  });

  useEffect(() => {
    async function checkConnection() {
      try {
        setStatus('Connecting to backend...');
        
        // Try to connect to the health endpoint
        const response = await apiBase.get('/health');
        
        setStatus('Connected successfully!');
        setServerInfo(response.data);
        
        console.log('Backend connection successful:', response.data);
      } catch (err) {
        console.error('Connection error:', err);
        
        setStatus('Connection failed');
        
        // Show more specific error based on the failure
        if (!err.response) {
          setError(`Network error - please check if the backend server is running at ${config.apiUrl}`);
        } else {
          setError(`Server responded with status ${err.response.status}: ${err.response.statusText}`);
        }
      }
    }

    checkConnection();
  }, []);

  return (
    <div className="api-connection-test" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px', maxWidth: '600px', margin: '20px auto' }}>
      <h2>API Connection Test</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Environment:</strong> {process.env.NODE_ENV || 'not set'}
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>API URL:</strong> {config.apiUrl}
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Current Hostname:</strong> {window.location.hostname}
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
          If the connection fails, please check:
          <ol style={{ marginTop: '5px' }}>
            <li>Is your backend server running?</li>
            <li>Is the API URL correctly configured for this environment?</li>
            <li>Are there any CORS issues in the console?</li>
          </ol>
        </p>
      </div>
    </div>
  );
};

export default ApiConnectionTest;