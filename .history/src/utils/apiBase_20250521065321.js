// utils/apiBase.js
import axios from 'axios';
import config from '../config';

const apiBase = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
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
    // Handle connection errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      // You could dispatch to a global error state or show a notification
    }
    
    // Handle 401 Unauthorized errors (token expired, invalid, etc.)
    else if (error.response.status === 401) {
      console.error('Authentication Error:', error.response.data);
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden errors
    else if (error.response.status === 403) {
      console.error('Permission Denied:', error.response.data);
      // Handle forbidden errors (e.g., show a message)
    }
    
    // Handle server errors
    else if (error.response.status >= 500) {
      console.error('Server Error:', error.response.data);
      // Handle server errors (e.g., show a friendly error message)
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