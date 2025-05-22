// src/services/api.js
import axios from 'axios';

// Determine API URL based on environment
const API_URL = process.env.NODE_ENV === 'development'
  ? process.env.REACT_APP_API_URL || 'http://localhost:5000'  // Development
  : process.env.REACT_APP_API_URL || 'https://ibom-healthcare.onrender.com';  // Production

console.log(`API Service initialized with ${process.env.NODE_ENV} environment`);
console.log(`Using API URL: ${API_URL}`);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('akwa_ibom_health_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} from ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Always log errors
    console.error(`❌ API Error: ${error.message}`);
    
    // Handle 401 Unauthorized (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('akwa_ibom_health_token');
      
      // Redirect to login
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;