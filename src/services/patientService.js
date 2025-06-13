// src/services/patientService.js
import axios from 'axios';
import { getToken } from '../utils/helpers'; // adjust path as needed

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

console.log('API URL:', API_URL);
console.log('Environment:', process.env.NODE_ENV);

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
    // Implement proper error handling
    console.error('API Error:', error.response || error);
    
    // If we're in development mode, return mock data in some cases
    if (process.env.NODE_ENV === 'development') {
      // Check the request URL to determine the correct mock response
      const url = error.config.url;
      
      // For patient list
      if (url.includes('/api/patients') && !url.includes('/api/patients/')) {
        return Promise.resolve({
          data: {
            data: getMockPatients(),
            meta: {
              total: 50,
              per_page: 20,
              current_page: 1,
              last_page: 3
            }
          }
        });
      }
      
      // For single patient
      if (url.includes('/api/patients/') && !url.includes('/visits')) {
        const patientId = url.split('/api/patients/')[1].split('/')[0];
        return Promise.resolve({
          data: {
            data: getMockPatientById(patientId)
          }
        });
      }
      
      // For patient visits
      if (url.includes('/visits')) {
        return Promise.resolve({
          data: {
            data: getMockVisits(),
            meta: {
              total: 2,
              per_page: 10,
              current_page: 1,
              last_page: 1
            }
          }
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export const createPatient = async (patientData) => {
  try {
    const response = await apiClient.post('/api/patients', patientData);
    console.log('Patient created successfully:', response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const getAllPatients = async (params) => {
  try {
    const response = await apiClient.get('/api/patients', { params });
    return response.data;
  } catch (error) {
    // Mock data for development is handled in the interceptor
    throw error;
  }
}

export const getPatientById = async (id) => {
  return apiClient.get(`/api/patients/${id}`);
}

export const updatePatient = async (id, patientData) => {
  try {
    const response = await apiClient.put(`/api/patients/${id}`, patientData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Delete patient
export const deletePatient = async (id) => {
  try {
    const response = await apiClient.delete(`/api/patients/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get patient visits
export const getPatientVisits = async (patientId) => {
  try {
    const response = await apiClient.get(`/api/patients/${patientId}/visits`);
    return response.data;
  } catch (error) {
    // Mock data for development is handled in the interceptor
    throw error;
  }
};

// Create patient visit
export const createPatientVisit = async (patientId, visitData) => {
  try {
    const response = await apiClient.post(`/api/patients/${patientId}/visits`, visitData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mock data functions
const getMockPatients = () => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    firstName: `John${i + 1}`,
    lastName: `Doe${i + 1}`,
    otherNames: i % 3 === 0 ? `Michael${i + 1}` : '',
    dateOfBirth: `199${i % 10}-05-1${i % 9}`,
    gender: i % 2 === 0 ? 'Male' : 'Female',
    maritalStatus: i % 2 === 0 ? 'Married' : 'Single',
    occupation: 'Teacher',
    phoneNumber: `+234-801-234-56${70 + i}`,
    email: `john${i + 1}.doe@email.com`,
    address: `123 Main Street, District ${i + 1}`,
    city: 'Abuja',
    state: 'FCT',
    lgaResidence: 'Municipal Area Council',
    bloodGroup: ['O+', 'A+', 'B+', 'AB+'][i % 4],
    genotype: ['AA', 'AS', 'SS', 'AC'][i % 4],
    emergencyContactName: `Jane Doe${i + 1}`,
    emergencyContactRelationship: 'Spouse',
    emergencyContactPhone: `+234-801-234-56${80 + i}`,
    status: i % 10 === 0 ? 'inactive' : 'active',
    last_visit: i % 5 === 0 ? null : `2023-0${(i % 9) + 1}-1${i % 9}`,
    created_at: `2022-0${(i % 9) + 1}-1${i % 9}T10:00:00Z`
  }));
};

const getMockPatientById = (id) => {
  const patientId = parseInt(id, 10);
  return {
    id: patientId,
    firstName: `John${patientId}`,
    lastName: `Doe${patientId}`,
    otherNames: patientId % 3 === 0 ? `Michael${patientId}` : '',
    dateOfBirth: `199${patientId % 10}-05-1${patientId % 9}`,
    gender: patientId % 2 === 0 ? 'Male' : 'Female',
    maritalStatus: patientId % 2 === 0 ? 'Married' : 'Single',
    occupation: 'Teacher',
    phoneNumber: `+234-801-234-56${70 + patientId}`,
    email: `john${patientId}.doe@email.com`,
    address: `123 Main Street, District ${patientId}`,
    city: 'Abuja',
    state: 'FCT',
    lgaResidence: 'Municipal Area Council',
    bloodGroup: ['O+', 'A+', 'B+', 'AB+'][patientId % 4],
    genotype: ['AA', 'AS', 'SS', 'AC'][patientId % 4],
    emergencyContactName: `Jane Doe${patientId}`,
    emergencyContactRelationship: 'Spouse',
    emergencyContactPhone: `+234-801-234-56${80 + patientId}`,
    status: patientId % 10 === 0 ? 'inactive' : 'active',
    last_visit: patientId % 5 === 0 ? null : `2023-0${(patientId % 9) + 1}-1${patientId % 9}`,
    created_at: `2022-0${(patientId % 9) + 1}-1${patientId % 9}T10:00:00Z`
  };
};

const getMockVisits = () => {
  return [
    {
      id: 1,
      visit_date: '2023-05-12',
      purpose: 'Routine Checkup',
      diagnosis: 'Healthy',
      treatment: 'None',
      notes: 'Patient is in good health',
      vital_signs: {
        temperature: '36.7°C',
        blood_pressure: '120/80 mmHg',
        pulse: '72 bpm',
        respiratory_rate: '16 breaths/min',
        weight: '65 kg',
        height: '175 cm'
      }
    },
    {
      id: 2,
      visit_date: '2023-03-25',
      purpose: 'Illness',
      diagnosis: 'Malaria',
      treatment: 'Prescribed antimalarial medication',
      notes: 'Patient presented with fever, headache, and fatigue',
      vital_signs: {
        temperature: '38.9°C',
        blood_pressure: '115/75 mmHg',
        pulse: '90 bpm',
        respiratory_rate: '18 breaths/min',
        weight: '64 kg',
        height: '175 cm'
      }
    }
  ];
};

export default {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientVisits,
  createPatientVisit
};