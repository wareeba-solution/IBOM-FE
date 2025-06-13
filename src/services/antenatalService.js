import axios from 'axios';

// Create a simple API client
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token if needed
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Base URL for antenatal endpoints
const ANTENATAL_BASE_URL = '/api/antenatal';

// API Functions
export const getAllAntenatalRecords = async (params) => {
  try {
    console.log('Fetching antenatal records with params:', params);
    
    const response = await apiClient.get(ANTENATAL_BASE_URL, { params });
    console.log('Antenatal API response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching antenatal records:', error);
    throw error;
  }
};

export const getAntenatalRecordById = async (id) => {
  try {
    console.log('Fetching antenatal record by ID:', id);
    
    const response = await apiClient.get(`${ANTENATAL_BASE_URL}/${id}`);
    console.log('Antenatal record response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching antenatal record:', error);
    throw error;
  }
};

export const createAntenatalRecord = async (data) => {
  try {
    console.log('Creating antenatal record:', data);
    
    const response = await apiClient.post(ANTENATAL_BASE_URL, data);
    console.log('Create antenatal response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error creating antenatal record:', error);
    throw error;
  }
};

export const updateAntenatalRecord = async (id, data) => {
  try {
    console.log('Updating antenatal record:', id, data);
    
    const response = await apiClient.put(`${ANTENATAL_BASE_URL}/${id}`, data);
    console.log('Update antenatal response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error updating antenatal record:', error);
    throw error;
  }
};

export const deleteAntenatalRecord = async (id) => {
  try {
    console.log('Deleting antenatal record:', id);
    
    const response = await apiClient.delete(`${ANTENATAL_BASE_URL}/${id}`);
    console.log('Delete antenatal response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error deleting antenatal record:', error);
    throw error;
  }
};

// Additional endpoints that might be available
export const getAntenatalVisits = async (antenatalId, params) => {
  try {
    console.log('Fetching antenatal visits for:', antenatalId);
    
    const response = await apiClient.get(`${ANTENATAL_BASE_URL}/${antenatalId}/visits`, { params });
    console.log('Antenatal visits response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching antenatal visits:', error);
    // Return empty array if endpoint doesn't exist
    return { data: [] };
  }
};

export const createAntenatalVisit = async (antenatalId, data) => {
  try {
    console.log('Creating antenatal visit for:', antenatalId, data);
    
    const response = await apiClient.post(`${ANTENATAL_BASE_URL}/${antenatalId}/visits`, data);
    console.log('Create visit response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error creating antenatal visit:', error);
    throw error;
  }
};

export const getAntenatalStatistics = async (params) => {
  try {
    console.log('Fetching antenatal statistics with params:', params);
    
    const response = await apiClient.get(`${ANTENATAL_BASE_URL}/statistics`, { params });
    console.log('Antenatal statistics response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching antenatal statistics:', error);
    throw error;
  }
};

// Helper function to map API field names to component field names
export const mapAntenatalRecord = (apiRecord) => {
  if (!apiRecord) return null;

  return {
    id: apiRecord.id,
    registration_number: apiRecord.registrationNumber,
    patient_id: apiRecord.patientId,
    facility_id: apiRecord.facilityId,
    registration_date: apiRecord.registrationDate,
    lmp: apiRecord.lmp,
    edd: apiRecord.edd,
    gravida: apiRecord.gravida,
    para: apiRecord.para,
    parity: apiRecord.para, // Alias for para
    blood_group: apiRecord.bloodGroup,
    height_cm: apiRecord.height,
    pre_pregnancy_weight: apiRecord.prePregnancyWeight,
    hiv_status: apiRecord.hivStatus,
    sickling_status: apiRecord.sickling,
    hepatitis_b_status: apiRecord.hepatitisB,
    hepatitis_c_status: apiRecord.hepatitisC,
    vdrl_status: apiRecord.vdrl,
    tetanus_vaccination: apiRecord.tetanusVaccination,
    malaria_prophylaxis: apiRecord.malariaProphylaxis,
    iron_folate_supplementation: apiRecord.ironFolateSupplementation,
    risk_factors: apiRecord.riskFactors || [],
    risk_level: apiRecord.riskLevel,
    medical_history: apiRecord.medicalHistory,
    obstetrics_history: apiRecord.obstetricsHistory,
    partner: apiRecord.partner,
    emergency_contact: apiRecord.emergencyContact,
    nearest_health_facility: apiRecord.nearestHealthFacility,
    outcome: apiRecord.outcome,
    delivery_date: apiRecord.deliveryDate,
    mode_of_delivery: apiRecord.modeOfDelivery,
    birth_outcome: apiRecord.birthOutcome,
    status: apiRecord.status,
    next_appointment: apiRecord.nextAppointment,
    created_by: apiRecord.createdBy,
    updated_by: apiRecord.updatedBy,
    created_at: apiRecord.createdAt,
    updated_at: apiRecord.updatedAt,
    deleted_at: apiRecord.deletedAt,
    
    // Computed fields for compatibility with existing components
    patient_name: 'Loading...', // Will be populated when patient data is fetched
    age: null, // Will be calculated from patient DOB
    date_of_birth: null, // Will be populated from patient data
    phone_number: null, // Will be populated from patient data
    address: null, // Will be populated from patient data
    visit_count: 0, // Will be populated from visits data
    
    // Calculate gestational age in weeks
    gestational_age: apiRecord.lmp ? 
      Math.floor((new Date() - new Date(apiRecord.lmp)) / (7 * 24 * 60 * 60 * 1000)) : 0
  };
};

// Helper function to map component data to API format
export const mapToApiFormat = (componentData) => {
  return {
    patientId: componentData.patient_id,
    facilityId: componentData.facility_id,
    registrationDate: componentData.registration_date,
    lmp: componentData.lmp,
    edd: componentData.edd,
    gravida: componentData.gravida,
    para: componentData.para || componentData.parity,
    bloodGroup: componentData.blood_group,
    height: componentData.height_cm,
    prePregnancyWeight: componentData.pre_pregnancy_weight,
    hivStatus: componentData.hiv_status,
    sickling: componentData.sickling_status,
    hepatitisB: componentData.hepatitis_b_status,
    hepatitisC: componentData.hepatitis_c_status,
    vdrl: componentData.vdrl_status,
    tetanusVaccination: componentData.tetanus_vaccination,
    malariaProphylaxis: componentData.malaria_prophylaxis,
    ironFolateSupplementation: componentData.iron_folate_supplementation,
    riskFactors: componentData.risk_factors || [],
    riskLevel: componentData.risk_level,
    medicalHistory: componentData.medical_history,
    obstetricsHistory: componentData.obstetrics_history,
    partner: componentData.partner,
    emergencyContact: componentData.emergency_contact,
    nearestHealthFacility: componentData.nearest_health_facility,
    outcome: componentData.outcome,
    deliveryDate: componentData.delivery_date,
    modeOfDelivery: componentData.mode_of_delivery,
    birthOutcome: componentData.birth_outcome,
    status: componentData.status,
    nextAppointment: componentData.next_appointment
  };
};

const antenatalService = {
  getAllAntenatalRecords,
  getAntenatalRecordById,
  createAntenatalRecord,
  updateAntenatalRecord,
  deleteAntenatalRecord,
  getAntenatalVisits,
  createAntenatalVisit,
  getAntenatalStatistics,
  mapAntenatalRecord,
  mapToApiFormat
};

export default antenatalService;