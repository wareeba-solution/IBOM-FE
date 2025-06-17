import axios from 'axios';

// Base API URL (without /api - just like birthService)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

console.log('Immunization Service API URL:', API_URL);

// Create axios instance with proper config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
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
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Immunization service endpoints
const IMMUNIZATION_BASE_URL = '/api/immunizations';

const immunizationService = {
  // Get all immunizations with pagination and filters
  getAllImmunizations: async (params = {}) => {
    try {
      console.log('Fetching immunizations with params:', params);
      const response = await apiClient.get(IMMUNIZATION_BASE_URL, { params });
      console.log('Immunization API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching immunizations:', error);
      throw error;
    }
  },

  // Get immunization by ID
  getImmunizationById: async (id) => {
    try {
      const response = await apiClient.get(`${IMMUNIZATION_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching immunization ${id}:`, error);
      throw error;
    }
  },

  // Create new immunization record
  createImmunization: async (data) => {
    try {
      const response = await apiClient.post(IMMUNIZATION_BASE_URL, data);
      return response.data;
    } catch (error) {
      console.error('Error creating immunization:', error);
      throw error;
    }
  },

  // Update immunization record
  updateImmunization: async (id, data) => {
    try {
      const response = await apiClient.put(`${IMMUNIZATION_BASE_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating immunization ${id}:`, error);
      throw error;
    }
  },

  // Delete immunization record
  deleteImmunization: async (id) => {
    try {
      const response = await apiClient.delete(`${IMMUNIZATION_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting immunization ${id}:`, error);
      throw error;
    }
  },

  // Get immunization statistics
  getImmunizationStatistics: async (params = {}) => {
    try {
      const response = await apiClient.get(`${IMMUNIZATION_BASE_URL}/statistics`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching immunization statistics:', error);
      throw error;
    }
  },

  // Get vaccine schedules
  getVaccineSchedules: async (params = {}) => {
    try {
      const response = await apiClient.get(`${IMMUNIZATION_BASE_URL}/schedules`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching vaccine schedules:', error);
      throw error;
    }
  },

  // Get immunization coverage
  getImmunizationCoverage: async (params = {}) => {
    try {
      const response = await apiClient.get(`${IMMUNIZATION_BASE_URL}/coverage`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching immunization coverage:', error);
      throw error;
    }
  },

  // Search patients for immunization
  searchPatientsForImmunization: async (query) => {
    try {
      const response = await apiClient.get(`/api/patients/search`, {
        params: { q: query, limit: 20 }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  },

  // Get patient immunization history
  getPatientImmunizationHistory: async (patientId) => {
    try {
      const response = await apiClient.get(`${IMMUNIZATION_BASE_URL}/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching immunization history for patient ${patientId}:`, error);
      throw error;
    }
  },

  // Get vaccine types
  getVaccineTypes: async () => {
    try {
      const response = await apiClient.get(`${IMMUNIZATION_BASE_URL}/vaccine-types`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vaccine types:', error);
      throw error;
    }
  },

  // Get facilities
  getFacilities: async () => {
    try {
      const response = await apiClient.get('/api/facilities');
      return response.data;
    } catch (error) {
      console.error('Error fetching facilities:', error);
      throw error;
    }
  },

  // Bulk import immunizations
  bulkImportImmunizations: async (data) => {
    try {
      const response = await apiClient.post(`${IMMUNIZATION_BASE_URL}/bulk-import`, data);
      return response.data;
    } catch (error) {
      console.error('Error bulk importing immunizations:', error);
      throw error;
    }
  },

  // Export immunizations
  exportImmunizations: async (params = {}) => {
    try {
      const response = await apiClient.get(`${IMMUNIZATION_BASE_URL}/export`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting immunizations:', error);
      throw error;
    }
  }
};

export default immunizationService;