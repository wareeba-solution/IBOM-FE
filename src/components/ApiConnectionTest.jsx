// src/components/ApiConnectionTest.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';

function ApiConnectionTest() {
  const [status, setStatus] = useState('Testing API connection...');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      const result = await api.testConnection();
      setStatus(result.success ? 'Connected successfully' : 'Connection failed');
      setDetails(result);
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: '10px', margin: '10px', border: '1px solid #ccc' }}>
      <h3>API Connection Status: {status}</h3>
      <p>Connecting to: {api.defaults.baseURL}</p>
      {details && (
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '5px',
          maxHeight: '200px',
          overflow: 'auto' 
        }}>
          {JSON.stringify(details, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default ApiConnectionTest;