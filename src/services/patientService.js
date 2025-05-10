// src/services/patientService.js
import axios from 'axios';

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || 'https://api.akwaibomhealth.org/api';

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
    // Implement proper error handling
    console.error('API Error:', error.response || error);
    
    // If we're in development mode, return mock data in some cases
    if (process.env.NODE_ENV === 'development') {
      // Check the request URL to determine the correct mock response
      const url = error.config.url;
      
      // For patient list
      if (url.includes('/patients') && !url.includes('/patients/')) {
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
      if (url.includes('/patients/') && !url.includes('/visits')) {
        const patientId = url.split('/patients/')[1].split('/')[0];
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

// Patient service methods
const patientService = {
  // Get all patients with pagination and filters
  getAllPatients: async (params) => {
    try {
      const response = await apiClient.get('/patients', { params });
      return response.data;
    } catch (error) {
      // Mock data for development is handled in the interceptor
      throw error;
    }
  },
  
  // Get patient by ID
  getPatientById: async (id) => {
    try {
      const response = await apiClient.get(`/patients/${id}`);
      return response.data.data;
    } catch (error) {
      // Mock data for development is handled in the interceptor
      throw error;
    }
  },
  
  // Create new patient
  createPatient: async (patientData) => {
    try {
      const response = await apiClient.post('/patients', patientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Update patient
  updatePatient: async (id, patientData) => {
    try {
      const response = await apiClient.put(`/patients/${id}`, patientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete patient
  deletePatient: async (id) => {
    try {
      const response = await apiClient.delete(`/patients/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get patient visits
  getPatientVisits: async (patientId) => {
    try {
      const response = await apiClient.get(`/patients/${patientId}/visits`);
      return response.data;
    } catch (error) {
      // Mock data for development is handled in the interceptor
      throw error;
    }
  },
  
  // Create patient visit
  createPatientVisit: async (patientId, visitData) => {
    try {
      const response = await apiClient.post(`/patients/${patientId}/visits`, visitData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Mock data functions
const getMockPatients = () => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    registration_number: `PAT${1000 + i}`,
    full_name: `Patient ${i + 1}`,
    gender: i % 2 === 0 ? 'Male' : 'Female',
    date_of_birth: new Date(1980 + i % 40, i % 12, i % 28 + 1).toISOString().split('T')[0],
    phone: `080${i}${i}${i}${i}${i}${i}${i}${i}`,
    address: `Address ${i + 1}, Akwa Ibom`,
    location: i % 3 === 0 ? 'Urban' : 'Rural',
    status: i % 10 === 0 ? 'inactive' : 'active',
    last_visit: i % 5 === 0 ? null : new Date(2023, i % 12, i % 28 + 1).toISOString().split('T')[0],
    created_at: new Date(2022, i % 12, i % 28 + 1).toISOString()
  }));
};

const getMockPatientById = (id) => {
  // Convert id to number
  const patientId = parseInt(id, 10);
  
  return {
    id: patientId,
    registration_number: `PAT${1000 + patientId}`,
    first_name: `First${patientId}`,
    last_name: `Last${patientId}`,
    other_names: patientId % 3 === 0 ? `Middle${patientId}` : '',
    gender: patientId % 2 === 0 ? 'Male' : 'Female',
    date_of_birth: new Date(1980 + patientId % 40, patientId % 12, patientId % 28 + 1).toISOString().split('T')[0],
    phone_number: `080${patientId}${patientId}${patientId}${patientId}${patientId}${patientId}`,
    email: patientId % 2 === 0 ? `patient${patientId}@example.com` : '',
    address: `Address ${patientId}, Akwa Ibom`,
    city: 'Uyo',
    state: 'Akwa Ibom',
    postal_code: `23${patientId}${patientId}${patientId}`,
    blood_group: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][patientId % 8],
    genotype: ['AA', 'AS', 'SS', 'AC'][patientId % 4],
    marital_status: ['Single', 'Married', 'Divorced', 'Widowed'][patientId % 4],
    next_of_kin_name: patientId % 3 === 0 ? '' : `NOK ${patientId}`,
    next_of_kin_relationship: patientId % 3 === 0 ? '' : ['Spouse', 'Parent', 'Child', 'Sibling'][patientId % 4],
    next_of_kin_phone: patientId % 3 === 0 ? '' : `070${patientId}${patientId}${patientId}${patientId}${patientId}${patientId}`,
    notes: patientId % 5 === 0 ? 'Patient has a history of hypertension. Regular checkups recommended.' : '',
    status: patientId % 10 === 0 ? 'inactive' : 'active',
    registration_date: new Date(2022, patientId % 12, patientId % 28 + 1).toISOString().split('T')[0]
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

export default patientService;