import axios from 'axios';
import { getToken } from '../utils/helpers';

// Base API URL (without /api - just like birthService)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

console.log('Death Service API URL:', API_URL);

// Create axios instance with proper config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Death API Error:', error.response || error);
    
    // If we're in development mode, return mock data
    if (process.env.NODE_ENV === 'development') {
      const url = error.config.url;
      
      // For death list - use death-statistics endpoint
      if (url.includes('/api/death-statistics') && !url.includes('/api/death-statistics/')) {
        // Extract limit from query params or default to 10
        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        const limit = Math.min(parseInt(urlParams.get('limit') || '10'), 100);
        const page = parseInt(urlParams.get('page') || '1');
        
        const allDeaths = getMockDeaths();
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedDeaths = allDeaths.slice(startIndex, endIndex);
        
        return Promise.resolve({
          data: {
            data: paginatedDeaths,
            pagination: {
              page: page,
              limit: limit,
              totalItems: allDeaths.length,
              totalPages: Math.ceil(allDeaths.length / limit)
            }
          }
        });
      }
      
      // For single death
      if (url.includes('/api/death-statistics/') && !url.includes('/statistics')) {
        const deathId = url.split('/api/death-statistics/')[1].split('/')[0];
        return Promise.resolve({
          data: {
            data: getMockDeathById(deathId)
          }
        });
      }
    }
    
    return Promise.reject(error);
  }
);

// API Functions - Updated to use death-statistics endpoint
export const getAllDeaths = async (params) => {
  try {
    // Use death-statistics endpoint for getting deaths (based on Swagger docs)
    const response = await apiClient.get('/api/death-statistics', { params });
    console.log('Death data response:', response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDeathById = async (id) => {
  try {
    // Use death-statistics endpoint for single death
    const response = await apiClient.get(`/api/death-statistics/${id}`);
    console.log('Single death data response:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    throw error;
  }
};

export const createDeath = async (deathData) => {
  try {
    // Use the correct endpoint from Swagger docs
    const response = await apiClient.post('/api/death-statistics', deathData);
    console.log('Death created successfully:', response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateDeath = async (id, deathData) => {
  try {
    // Use death-statistics endpoint for updates
    const response = await apiClient.put(`/api/death-statistics/${id}`, deathData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteDeath = async (id) => {
  try {
    // Use death-statistics endpoint for deletes
    const response = await apiClient.delete(`/api/death-statistics/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDeathStatistics = async (params) => {
  try {
    // This might be a different endpoint for statistics only
    const response = await apiClient.get('/api/death-statistics/summary', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mock data functions (for development fallback)
const getMockDeaths = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `death-${i + 1}`,
    registration_number: `DR-2024-${String(i + 1).padStart(4, '0')}`, // Add registration number
    deceased_name: `Deceased Person ${i + 1}`,
    gender: i % 2 === 0 ? 'Male' : 'Female',
    date_of_birth: new Date(1950 + (i % 50), (i % 12), (i % 28) + 1).toISOString().split('T')[0],
    date_of_death: new Date(2024, (i % 12), (i % 28) + 1).toISOString().split('T')[0],
    age_at_death: 50 + (i % 30),
    place_of_death: i % 3 === 0 ? 'Home' : 'Hospital',
    hospital_name: i % 3 !== 0 ? 'University of Uyo Teaching Hospital' : null,
    cause_of_death: ['Natural causes', 'Cardiac arrest', 'Respiratory failure', 'Cancer', 'Stroke'][i % 5],
    manner_of_death: ['Natural', 'Accident', 'Natural'][i % 3],
    informant_name: `Informant ${i + 1}`,
    informant_relationship: ['Spouse', 'Child', 'Sibling', 'Parent'][i % 4],
    informant_phone: `+234${800 + i}${String(i).padStart(6, '0')}`,
    city: 'Uyo',
    state: 'Akwa Ibom',
    registration_date: new Date(2024, (i % 12), (i % 28) + 1).toISOString().split('T')[0],
    status: i % 3 === 0 ? 'pending' : 'registered'
  }));
};

const getMockDeathById = (id) => {
  const mockDeaths = getMockDeaths();
  return mockDeaths.find(death => death.id === id) || mockDeaths[0];
};

export default {
  getAllDeaths,
  getDeathById,
  createDeath,
  updateDeath,
  deleteDeath,
  getDeathStatistics
};