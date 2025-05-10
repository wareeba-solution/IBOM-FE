// src/services/api.js
import axios from 'axios';

// Create base axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      // Clear local storage
      localStorage.removeItem('token');
      
      // Redirect to login page if not already there
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/reset-password')) {
        window.location.href = '/login';
      }
    }
    
    // Handle offline status
    if (!error.response) {
      // Store failed requests in IndexedDB for later sync when back online
      if (navigator.onLine === false) {
        // TODO: Implement offline queue system
        console.log('Request failed while offline - queued for later', error.config);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;