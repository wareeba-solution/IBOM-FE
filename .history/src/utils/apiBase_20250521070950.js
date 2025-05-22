// src/utils/apiBase.js
import axios from 'axios';
import config from '../config';

// Create Axios instance with configured base URL
const apiBase = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable cookies/credentials for session-based auth
  withCredentials: true,
});

// Add request interceptor
apiBase.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiBase.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
    }
    
    return Promise.reject(error);
  }
);

// Export the Axios instance
export default apiBase;