// utils/apiBase.js
import axios from 'axios';

// Read from config.js first (for runtime config), then env variables, then fallback
const API_BASE_URL = 
  window.ENV?.API_URL || 
  process.env.REACT_APP_API_BASE_URL || 
  'http://localhost:5000/api';

console.log('API Base URL:', API_BASE_URL); // Helpful for debugging

const apiBase = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable cookies/credentials if your API uses session-based auth
  withCredentials: true,
});

// Request interceptor to add auth token to every request
apiBase.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiBase.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired, invalid, etc.)
    if (error.response && error.response.status === 401) {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden errors (insufficient permissions)
    if (error.response && error.response.status === 403) {
      console.error('Permission denied:', error.response.data);
      // You could redirect to an access denied page or show a notification
    }
    
    // Handle 500 and other server errors
    if (error.response && error.response.status >= 500) {
      console.error('Server error:', error.response.data);
      // You could show a generic server error notification
    }
    
    // Handle network errors (API server down, no internet, etc.)
    if (error.message === 'Network Error') {
      console.error('Network error - please check your connection');
      // You could show an offline notification
    }
    
    return Promise.reject(error);
  }
);

// Helper methods to make API calls easier
const apiHelpers = {
  get: (endpoint, params = {}) => apiBase.get(endpoint, { params }),
  post: (endpoint, data = {}) => apiBase.post(endpoint, data),
  put: (endpoint, data = {}) => apiBase.put(endpoint, data),
  patch: (endpoint, data = {}) => apiBase.patch(endpoint, data),
  delete: (endpoint) => apiBase.delete(endpoint),
};

export default apiHelpers;