// src/services/birthService.js
import axios from 'axios';

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

console.log('Birth Service API URL:', API_URL);

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
    const token = localStorage.getItem('token');
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
    console.error('Birth API Error:', error.response || error);
    
    // If we're in development mode, return mock data
    if (process.env.NODE_ENV === 'development') {
      const url = error.config.url;
      
      // For birth list
      if (url.includes('/api/births') && !url.includes('/api/births/')) {
        return Promise.resolve({
          data: {
            data: {
              births: getMockBirths(),
              total: getMockBirths().length,
              counts: getMockCounts()
            }
          }
        });
      }
      
      // For single birth
      if (url.includes('/api/births/') && !url.includes('/statistics')) {
        const birthId = url.split('/api/births/')[1].split('/')[0];
        return Promise.resolve({
          data: {
            data: getMockBirthById(birthId)
          }
        });
      }
      
      // For birth statistics
      if (url.includes('/statistics')) {
        return Promise.resolve({
          data: {
            data: getMockStatistics()
          }
        });
      }
    }
    
    return Promise.reject(error);
  }
);

// API Functions
export const getAllBirths = async (params) => {
  try {
    const response = await apiClient.get('/api/births', { params });
    console.log('Birth data response:', response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBirthById = async (id) => {
  try {
    const response = await apiClient.get(`/api/births/${id}`);
    console.log('Single birth data response:', response.data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const createBirth = async (birthData) => {
  try {
    const response = await apiClient.post('/api/births', birthData);
    console.log('Birth created successfully:', response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBirth = async (id, birthData) => {
  try {
    const response = await apiClient.put(`/api/births/${id}`, birthData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteBirth = async (id) => {
  try {
    const response = await apiClient.delete(`/api/births/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBirthStatistics = async (params) => {
  try {
    const response = await apiClient.get('/api/births/statistics', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mock data functions
const getMockBirths = () => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    registration_number: `BR${10000 + i}`,
    child_name: i % 5 === 0 ? '' : `Baby ${i % 2 === 0 ? 'Boy' : 'Girl'} ${i + 1}`,
    gender: i % 2 === 0 ? 'male' : 'female',
    date_of_birth: new Date(2023, (i % 12), (i % 28) + 1).toISOString().split('T')[0],
    time_of_birth: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    delivery_method: i % 3 === 0 ? 'home' : 'hospital',
    birth_type: i % 10 === 0 ? 'twin' : i % 15 === 0 ? 'triplet' : 'singleton',
    birth_weight: (2.5 + Math.random() * 2).toFixed(2),
    birth_length: (45 + Math.random() * 10).toFixed(1),
    mother_name: `Mother ${i + 1}`,
    mother_age: 20 + (i % 25),
    father_name: `Father ${i + 1}`,
    father_age: 25 + (i % 30),
    address: `Address ${i + 1}, Akwa Ibom`,
    lga_residence: ['Uyo', 'Ikot Ekpene', 'Eket', 'Oron', 'Abak'][i % 5],
    state_residence: 'Akwa Ibom',
    nationality: 'Nigerian',
    facility_id: `facility-${(i % 5) + 1}`,
    status: i % 8 === 0 ? 'pending' : 'registered',
    created_at: new Date(2023, (i % 12), (i % 28) + 1).toISOString(),
    updated_at: new Date(2023, (i % 12), (i % 28) + 1).toISOString()
  }));
};

const getMockBirthById = (id) => {
  const birthId = parseInt(id, 10);
  const mockBirths = getMockBirths();
  return mockBirths.find(birth => birth.id === birthId) || mockBirths[0];
};

const getMockCounts = () => {
  const births = getMockBirths();
  return {
    total: births.length,
    registered: births.filter(b => b.status === 'registered').length,
    pending: births.filter(b => b.status === 'pending').length,
    hospital: births.filter(b => b.delivery_method === 'hospital').length,
    home: births.filter(b => b.delivery_method === 'home').length,
    male: births.filter(b => b.gender === 'male').length,
    female: births.filter(b => b.gender === 'female').length,
    singleton: births.filter(b => b.birth_type === 'singleton').length,
    twin: births.filter(b => b.birth_type === 'twin').length,
    triplet: births.filter(b => b.birth_type === 'triplet').length
  };
};

const getMockStatistics = () => {
  return {
    totalBirths: 50,
    thisMonth: 12,
    thisYear: 50,
    byGender: {
      male: 25,
      female: 25
    },
    byDeliveryMethod: {
      hospital: 34,
      home: 16
    },
    byStatus: {
      registered: 44,
      pending: 6
    },
    byBirthType: {
      singleton: 45,
      twin: 4,
      triplet: 1
    }
  };
};

export default {
  getAllBirths,
  getBirthById,
  createBirth,
  updateBirth,
  deleteBirth,
  getBirthStatistics
};
