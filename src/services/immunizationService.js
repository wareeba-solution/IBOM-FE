import axios from 'axios';
import { getToken } from '../utils/helpers';

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
    console.error('Immunization API Error:', error.response || error);
    
    // If we're in development mode, return mock data
    if (process.env.NODE_ENV === 'development') {
      const url = error.config.url;
      
      // For immunization list
      if (url.includes('/api/immunizations') && !url.includes('/api/immunizations/')) {
        // Extract limit from query params or default to 10
        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        const limit = Math.min(parseInt(urlParams.get('limit') || '10'), 100);
        const page = parseInt(urlParams.get('page') || '1');
        
        const allImmunizations = getMockImmunizations();
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedImmunizations = allImmunizations.slice(startIndex, endIndex);
        
        return Promise.resolve({
          data: {
            data: paginatedImmunizations,
            pagination: {
              page: page,
              limit: limit,
              totalItems: allImmunizations.length,
              totalPages: Math.ceil(allImmunizations.length / limit)
            }
          }
        });
      }
      
      // For single immunization
      if (url.includes('/api/immunizations/')) {
        const immunizationId = url.split('/api/immunizations/')[1].split('/')[0];
        return Promise.resolve({
          data: {
            data: getMockImmunizationById(immunizationId)
          }
        });
      }
    }
    
    return Promise.reject(error);
  }
);

// API Functions
export const getAllImmunizations = async (params) => {
  try {
    const response = await apiClient.get('/api/immunizations', { params });
    console.log('Immunization data response:', response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getImmunizationById = async (id) => {
  try {
    const response = await apiClient.get(`/api/immunizations/${id}`);
    console.log('Single immunization data response:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    throw error;
  }
};

export const createImmunization = async (immunizationData) => {
  try {
    const response = await apiClient.post('/api/immunizations', immunizationData);
    console.log('Immunization created successfully:', response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateImmunization = async (id, immunizationData) => {
  try {
    const response = await apiClient.put(`/api/immunizations/${id}`, immunizationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteImmunization = async (id) => {
  try {
    const response = await apiClient.delete(`/api/immunizations/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getImmunizationStatistics = async (params) => {
  try {
    const response = await apiClient.get('/api/immunizations/statistics', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchPatients = async (searchTerm) => {
  try {
    console.log('Searching for patients with term:', searchTerm); // Debug log
    
    // Try multiple possible endpoints for patient search
    let response;
    try {
      // First try the dedicated patient search endpoint
      response = await apiClient.get('/api/patients/search', { 
        params: { q: searchTerm } 
      });
    } catch (error) {
      if (error.response?.status === 404) {
        // If search endpoint doesn't exist, try getting all patients and filter
        console.log('Search endpoint not found, trying /api/patients');
        response = await apiClient.get('/api/patients', { 
          params: { 
            search: searchTerm,
            limit: 50 
          } 
        });
      } else {
        throw error;
      }
    }
    
    console.log('Patient search API response:', response.data); // Debug log
    
    // Handle different response structures
    let patients = [];
    if (response.data.data) {
      patients = response.data.data;
    } else if (Array.isArray(response.data)) {
      patients = response.data;
    } else {
      patients = [];
    }
    
    // Filter patients by search term if we got all patients
    if (searchTerm && patients.length > 0) {
      const searchLower = searchTerm.toLowerCase();
      patients = patients.filter(patient => {
        const fullName = `${patient.firstName || ''} ${patient.lastName || ''} ${patient.otherNames || ''}`.toLowerCase();
        const uniqueId = (patient.uniqueIdentifier || '').toLowerCase();
        const email = (patient.email || '').toLowerCase();
        const phone = (patient.phoneNumber || '').toLowerCase();
        
        return fullName.includes(searchLower) || 
               uniqueId.includes(searchLower) ||
               email.includes(searchLower) ||
               phone.includes(searchLower);
      });
    }
    
    const mappedPatients = patients.map(patient => {
      console.log('Mapping patient:', patient); // Debug log
      
      return {
        id: patient.id, // Make sure we get the UUID
        uniqueIdentifier: patient.uniqueIdentifier || patient.id,
        name: patient.firstName && patient.lastName ? 
              `${patient.firstName} ${patient.lastName}${patient.otherNames ? ' ' + patient.otherNames : ''}` : 
              patient.name || 'Unknown Patient',
        firstName: patient.firstName,
        lastName: patient.lastName,
        otherNames: patient.otherNames,
        gender: patient.gender,
        date_of_birth: patient.dateOfBirth || patient.date_of_birth,
        dateOfBirth: patient.dateOfBirth || patient.date_of_birth,
        // Include other fields that might be useful
        phoneNumber: patient.phoneNumber,
        email: patient.email,
        address: patient.address
      };
    });
    
    console.log('Mapped patients:', mappedPatients); // Debug log
    return mappedPatients;
  } catch (error) {
    console.error('Patient search error:', error);
    
    // Return mock data for development if all endpoints fail
    const mockPatients = getMockPatients(searchTerm);
    console.log('Using mock patients due to API error:', mockPatients); // Debug log
    return mockPatients;
  }
};

export const getVaccineSchedule = async (vaccineType, doseNumber) => {
  try {
    // Since this endpoint doesn't exist, return mock data directly
    return getMockVaccineSchedule(vaccineType, doseNumber);
  } catch (error) {
    // Return mock schedule for development
    return getMockVaccineSchedule(vaccineType, doseNumber);
  }
};

// Mock data functions (for development fallback)
const getMockImmunizations = () => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: `imm-${i + 1}`,
    registration_number: `IM-2024-${String(i + 1).padStart(4, '0')}`,
    patientId: `PT${5000 + i}`,
    patient_name: `Patient ${i + 1}`,
    gender: i % 2 === 0 ? 'Male' : 'Female',
    date_of_birth: new Date(2020 - (i % 5), (i % 12), (i % 28) + 1).toISOString().split('T')[0],
    age_months: 12 + (i % 48),
    vaccineType: ['COVID-19', 'Hepatitis B', 'BCG', 'Measles', 'Polio'][i % 5],
    vaccineName: ['Pfizer-BioNTech', 'Moderna', 'AstraZeneca', 'Johnson & Johnson'][i % 4],
    doseNumber: (i % 3) + 1,
    batchNumber: `LOT${100 + i}`,
    administrationDate: new Date(2024, (i % 12), (i % 28) + 1).toISOString().split('T')[0],
    expiryDate: new Date(2025, (i % 12), (i % 28) + 1).toISOString().split('T')[0],
    administeredBy: `Dr. Provider ${(i % 10) + 1}`,
    administrationSite: ['Left Arm', 'Right Arm', 'Left Thigh', 'Right Thigh'][i % 4],
    administrationRoute: ['Intramuscular', 'Subcutaneous', 'Oral'][i % 3],
    dosage: '0.5 mL',
    status: ['Administered', 'Pending', 'Missed'][i % 3],
    weightKg: 10 + (i % 50),
    heightCm: 60 + (i % 40),
    facilityId: `FAC${(i % 5) + 1}`,
    facility_name: `Health Center ${(i % 5) + 1}`,
    side_effects: i % 15 === 0 ? 'Mild fever' : null,
    notes: i % 10 === 0 ? 'Follow-up required' : null
  }));
};

const getMockImmunizationById = (id) => {
  const mockImmunizations = getMockImmunizations();
  return mockImmunizations.find(imm => imm.id === id) || mockImmunizations[0];
};

// Update the mock patients function to ensure valid UUIDs
const getMockPatients = (searchTerm) => {
  return Array.from({ length: 5 }, (_, i) => {
    const mockId = `735f0276-9dd3-41d5-a33f-b0ad6cc11${i.toString().padStart(3, '0')}`;
    return {
      id: mockId, // Valid UUID format
      uniqueIdentifier: `AKH-25-1033${i}`,
      firstName: `${searchTerm}`,
      lastName: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][i],
      otherNames: i % 2 === 0 ? 'Middle' : null,
      name: `${searchTerm} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][i]}${i % 2 === 0 ? ' Middle' : ''}`,
      gender: i % 2 === 0 ? 'male' : 'female',
      dateOfBirth: new Date(1990 - (i % 30), (i % 12), (i % 28) + 1).toISOString().split('T')[0],
      date_of_birth: new Date(1990 - (i % 30), (i % 12), (i % 28) + 1).toISOString().split('T')[0],
      phoneNumber: `+234${800 + i}${String(i).padStart(6, '0')}`,
      email: `${searchTerm.toLowerCase()}${i}@example.com`,
      address: `${100 + i} Test Street`
    };
  });
};

const getMockVaccineSchedule = (vaccineType, doseNumber) => {
  const scheduleIntervals = {
    'COVID-19': 4,
    'Hepatitis B': 8,
    'BCG': 0,
    'Measles': 12,
    'Polio': 8,
    'Pentavalent': 8,
    'Pneumococcal': 8,
    'Rotavirus': 8,
    'Yellow Fever': 0,
    'Meningitis': 0,
    'Tetanus Toxoid': 4,
    'HPV': 24,
    'Other': 4
  };
  
  const maxDoses = {
    'COVID-19': 2,
    'Hepatitis B': 3,
    'BCG': 1,
    'Measles': 2,
    'Polio': 4,
    'Pentavalent': 3,
    'Pneumococcal': 3,
    'Rotavirus': 2,
    'Yellow Fever': 1,
    'Meningitis': 1,
    'Tetanus Toxoid': 5,
    'HPV': 2,
    'Other': 3
  };
  
  const interval = scheduleIntervals[vaccineType] || 4;
  const isLastDose = doseNumber >= (maxDoses[vaccineType] || 1);
  
  return {
    interval: interval,
    isLastDose: isLastDose,
    maxDoses: maxDoses[vaccineType] || 1
  };
};

export default {
  getAllImmunizations,
  getImmunizationById,
  createImmunization,
  updateImmunization,
  deleteImmunization,
  getImmunizationStatistics,
  searchPatients,
  getVaccineSchedule
};