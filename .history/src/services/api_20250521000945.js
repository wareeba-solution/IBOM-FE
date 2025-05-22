// src/services/api.js
import axios from 'axios';

/**
 * Determine the API URL with multiple fallbacks
 * This ensures the application works in all environments
 */
const getApiUrl = () => {
  // 1. Runtime configuration (highest priority, can be changed after build)
  if (window.ENV?.API_URL) {
    console.log('Using runtime API URL from window.ENV:', window.ENV.API_URL);
    return window.ENV.API_URL;
  }
  
  // 2. Build-time environment variable
  if (process.env.REACT_APP_API_URL) {
    console.log('Using build-time API URL from env:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // 3. Environment-specific fallbacks
  const fallbackUrl = process.env.NODE_ENV === 'production'
    ? 'https://ibom-healthcare.onrender.com'
    : 'http://localhost:5000';
  
  console.log(`Using fallback API URL for ${process.env.NODE_ENV} environment:`, fallbackUrl);
  return fallbackUrl;
};

// Determine the API URL to use
const API_URL = getApiUrl();

// Create axios instance with the determined API URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests if available
    const token = localStorage.getItem('akwa_ibom_health_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log outgoing requests in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error(`❌ API Error:`, error);
    
    // Handle specific error cases
    if (error.response) {
      // Server responded with an error status code
      console.error(`Status: ${error.response.status}`, error.response.data);
      
      // Handle 401 Unauthorized (token expired or invalid)
      if (error.response.status === 401) {
        localStorage.removeItem('akwa_ibom_health_token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/reset-password')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
      
      // Check if offline
      if (!navigator.onLine) {
        console.log('Device appears to be offline. Requests will be retried when online.');
      }
    } else {
      // Error in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Add a test method to verify API connectivity
api.testConnection = async () => {
  try {
    console.log('Testing API connection to:', API_URL);
    const response = await api.get('/health');
    console.log('API connection successful:', response.data);
    return { 
      success: true, 
      data: response.data,
      url: API_URL 
    };
  } catch (error) {
    console.error('API connection test failed:', error);
    return { 
      success: false, 
      error: error.message,
      url: API_URL,
      details: {
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
};

// Helper method to check if user is authenticated
api.isAuthenticated = () => {
  return !!localStorage.getItem('akwa_ibom_health_token');
};

export default api;