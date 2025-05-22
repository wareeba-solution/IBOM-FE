// src/services/api.js
import axios from 'axios';

// Create base axios instance with correct configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000', // Changed port to 5000 assuming backend runs on 5000
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token - this has issues in your original code
api.interceptors.request.use(
  (config) => {
    // Get the most up-to-date token on each request
    const token = localStorage.getItem('akwa_ibom_health_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add debug logging
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Add debug logging
    console.log(`✅ API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    // Add detailed error logging
    console.error(`❌ API Response Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error);
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      // Clear local storage
      localStorage.removeItem('akwa_ibom_health_token');
      
      // Redirect to login page if not already there
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/reset-password')) {
        window.location.href = '/login';
      }
    }
    
    // Handle offline status
    if (!error.response) {
      if (!navigator.onLine) {
        console.log('Network unavailable - request will be retried when online');
      } else {
        console.error('API request failed without response:', error.message);
      }
    }
    
    return Promise.reject(error);
  }
);

// Add a test method to help with debugging
api.testConnection = async () => {
  try {
    const response = await api.get('/health');
    console.log('API connection test successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('API connection test failed:', error);
    return { 
      success: false, 
      error: error.message,
      details: {
        status: error.response?.status,
        data: error.response?.data,
        baseURL: api.defaults.baseURL
      }
    };
  }
};

export default api;