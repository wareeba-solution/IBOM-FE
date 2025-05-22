// src/services/api.js
import axios from 'axios';
import { getToken, removeToken } from '../utils/helpers';

// Get the API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/sessions if you're using them
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      removeToken();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API service methods
const apiService = {
  // Generic methods
  get: (endpoint, params = {}) => apiClient.get(endpoint, { params }),
  post: (endpoint, data = {}) => apiClient.post(endpoint, data),
  put: (endpoint, data = {}) => apiClient.put(endpoint, data),
  patch: (endpoint, data = {}) => apiClient.patch(endpoint, data),
  delete: (endpoint) => apiClient.delete(endpoint),
};

export default apiService;