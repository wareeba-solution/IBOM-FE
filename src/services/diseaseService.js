import axios from 'axios';

// Create a simple API client (same as in antenatalService)
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token if needed
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
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
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Base URL for disease endpoints
const DISEASE_BASE_URL = '/api/diseases';

// API Functions
export const getAllDiseaseCases = async (params) => {
  try {
    console.log('Fetching disease cases with params:', params);
    
    const response = await apiClient.get(`${DISEASE_BASE_URL}/cases`, { params });
    console.log('Disease cases API response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching disease cases:', error);
    throw error;
  }
};

export const getDiseaseCaseById = async (id) => {
  try {
    console.log('Fetching disease case by ID:', id);
    
    const response = await apiClient.get(`${DISEASE_BASE_URL}/cases/${id}`);
    console.log('Disease case response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching disease case:', error);
    throw error;
  }
};

export const createDiseaseCase = async (data) => {
  try {
    console.log('Creating disease case:', data);
    
    // Validate required fields before sending
    const requiredFields = ['patientId', 'diseaseId', 'reportDate', 'status'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    const response = await apiClient.post(`${DISEASE_BASE_URL}/cases`, data);
    console.log('Create disease case response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error creating disease case:', error);
    throw error;
  }
};

export const updateDiseaseCase = async (id, data) => {
  try {
    console.log('Updating disease case:', id, data);
    
    const response = await apiClient.put(`${DISEASE_BASE_URL}/cases/${id}`, data);
    console.log('Update disease case response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error updating disease case:', error);
    throw error;
  }
};

export const deleteDiseaseCase = async (id) => {
  try {
    console.log('Deleting disease case:', id);
    
    const response = await apiClient.delete(`${DISEASE_BASE_URL}/cases/${id}`);
    console.log('Delete disease case response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error deleting disease case:', error);
    throw error;
  }
};

// Get diseases list (for dropdown options) - Use mock data since no diseases endpoint exists
export const getDiseases = async () => {
  console.log('Using mock diseases list - no /diseases endpoint available');
  
  // Return mock diseases as the primary data source
  return {
    data: [
      { id: 'covid-19', name: 'COVID-19', type: 'Viral' },
      { id: 'malaria', name: 'Malaria', type: 'Parasitic' },
      { id: 'tuberculosis', name: 'Tuberculosis', type: 'Bacterial' },
      { id: 'cholera', name: 'Cholera', type: 'Bacterial' },
      { id: 'typhoid', name: 'Typhoid Fever', type: 'Bacterial' },
      { id: 'measles', name: 'Measles', type: 'Viral' },
      { id: 'meningitis', name: 'Meningitis', type: 'Bacterial' },
      { id: 'hepatitis-b', name: 'Hepatitis B', type: 'Viral' },
      { id: 'yellow-fever', name: 'Yellow Fever', type: 'Viral' },
      { id: 'lassa-fever', name: 'Lassa Fever', type: 'Viral' },
      { id: 'ebola', name: 'Ebola Virus Disease', type: 'Viral' },
      { id: 'hiv-aids', name: 'HIV/AIDS', type: 'Viral' }
    ]
  };
};

// Get disease statistics - Use mock data since no statistics endpoint exists
export const getDiseaseStatistics = async (params) => {
  console.log('Using mock disease statistics - no statistics endpoint available');
  
  // Return mock statistics
  return {
    data: {
      totalCases: 1247,
      activeCases: 234,
      confirmedCases: 891,
      suspectedCases: 356,
      recoveredCases: 876,
      deaths: 137,
      outbreaks: 3
    }
  };
};

// Report outbreak
export const reportOutbreak = async (data) => {
  try {
    console.log('Reporting outbreak:', data);
    
    const response = await apiClient.post(`${DISEASE_BASE_URL}/outbreaks`, data);
    console.log('Report outbreak response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error reporting outbreak:', error);
    throw error;
  }
};

// Contact management
export const addContact = async (caseId, contactData) => {
  try {
    console.log('Adding contact for case:', caseId, contactData);
    
    const response = await apiClient.post(`${DISEASE_BASE_URL}/cases/${caseId}/contacts`, contactData);
    console.log('Add contact response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
};

export const getContacts = async (caseId) => {
  try {
    console.log('Fetching contacts for case:', caseId);
    
    const response = await apiClient.get(`${DISEASE_BASE_URL}/cases/${caseId}/contacts`);
    console.log('Contacts response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return { data: [] };
  }
};

// Helper function to map API field names to component field names
export const mapDiseaseCase = (apiCase) => {
  if (!apiCase) return null;

  return {
    id: apiCase.id,
    case_id: apiCase.caseId,
    disease_id: apiCase.diseaseId,
    disease_type: apiCase.diseaseType,
    patient_id: apiCase.patientId,
    patient_name: apiCase.patientName,
    facility_id: apiCase.facilityId,
    report_date: apiCase.reportDate,
    onset_date: apiCase.onsetDate,
    diagnosis_date: apiCase.diagnosisDate,
    diagnosis_type: apiCase.diagnosisType,
    location: apiCase.location,
    symptoms: apiCase.symptoms || [],
    status: apiCase.status,
    severity: apiCase.severity,
    outcome: apiCase.outcome,
    is_outbreak: apiCase.isOutbreak,
    reported_by: apiCase.reportedBy,
    lab_test_type: apiCase.labTestType,
    lab_result: apiCase.labResult,
    lab_notes: apiCase.labNotes,
    lab_test_results: apiCase.labTestResults,
    hospitalized: apiCase.hospitalized,
    hospital_name: apiCase.hospitalName,
    admission_date: apiCase.admissionDate,
    discharge_date: apiCase.dischargeDate,
    outcome_date: apiCase.outcomeDate,
    transmission_route: apiCase.transmissionRoute,
    transmission_location: apiCase.transmissionLocation,
    travel_history: apiCase.travelHistory,
    contact_history: apiCase.contactHistory,
    treatment_provided: apiCase.treatmentProvided,
    treatment: apiCase.treatment,
    diagnosis_notes: apiCase.diagnosisNotes,
    complications: apiCase.complications || [],
    notes: apiCase.notes,
    reported_to_authorities: apiCase.reportedToAuthorities,
    reported_date: apiCase.reportedDate,
    case_status: apiCase.caseStatus,
    created_by: apiCase.createdBy,
    updated_by: apiCase.updatedBy,
    created_at: apiCase.createdAt,
    updated_at: apiCase.updatedAt,
    deleted_at: apiCase.deletedAt,
    
    // Additional computed fields for compatibility
    age: null, // Will be populated from patient data
    gender: null, // Will be populated from patient data
    phone_number: null, // Will be populated from patient data
    email: null, // Will be populated from patient data
    address: null, // Will be populated from patient data
    occupation: null, // Will be populated from patient data
    date_of_birth: null, // Will be populated from patient data
    contacts: [], // Will be populated from contacts endpoint
    case_history: [] // Will be populated from case history endpoint
  };
};

// Helper function to map component data to API format
export const mapToApiFormat = (componentData) => {
  const apiData = {
    diseaseId: componentData.disease_id,
    patientId: componentData.patient_id,
    facilityId: componentData.facility_id,
    reportDate: componentData.report_date,
    onsetDate: componentData.onset_date,
    diagnosisDate: componentData.diagnosis_date,
    diagnosisType: componentData.diagnosis_type,
    location: componentData.location,
    symptoms: Array.isArray(componentData.symptoms) ? componentData.symptoms : [],
    status: componentData.status,
    severity: componentData.severity,
    outcome: componentData.outcome,
    isOutbreak: componentData.is_outbreak || false,
    reportedBy: componentData.reported_by,
    labTestType: componentData.lab_test_type,
    labResult: componentData.lab_result,
    labNotes: componentData.lab_notes,
    hospitalized: componentData.hospitalized || false,
    hospitalName: componentData.hospital_name,
    admissionDate: componentData.admission_date,
    dischargeDate: componentData.discharge_date,
    outcomeDate: componentData.outcome_date,
    transmissionRoute: componentData.transmission_route,
    transmissionLocation: componentData.transmission_location,
    travelHistory: componentData.travel_history,
    contactHistory: componentData.contact_history,
    treatmentProvided: componentData.treatment_provided,
    treatment: componentData.treatment,
    diagnosisNotes: componentData.diagnosis_notes,
    complications: Array.isArray(componentData.complications) ? componentData.complications : [],
    notes: componentData.notes,
    reportedToAuthorities: componentData.reported_to_authorities || false,
    reportedDate: componentData.reported_date,
    caseStatus: componentData.case_status
  };

  // Remove undefined values
  Object.keys(apiData).forEach(key => 
    apiData[key] === undefined && delete apiData[key]
  );

  return apiData;
};

const diseaseService = {
  getAllDiseaseCases,
  getDiseaseCaseById,
  createDiseaseCase,
  updateDiseaseCase,
  deleteDiseaseCase,
  getDiseases,
  getDiseaseStatistics,
  reportOutbreak,
  addContact,
  getContacts,
  mapDiseaseCase,
  mapToApiFormat
};

export default diseaseService;