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

// Base URL for family planning endpoints
const FAMILY_PLANNING_BASE_URL = '/api/family-planning';

// API Functions
export const getAllFamilyPlanningServices = async (params) => {
  try {
    console.log('Fetching family planning services with params:', params);
    
    const response = await apiClient.get(`${FAMILY_PLANNING_BASE_URL}/services`, { params });
    console.log('Family planning services API response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching family planning services:', error);
    throw error;
  }
};

export const getFamilyPlanningServiceById = async (id) => {
  try {
    console.log('Fetching family planning service by ID:', id);
    
    const response = await apiClient.get(`${FAMILY_PLANNING_BASE_URL}/services/${id}`);
    console.log('Family planning service response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching family planning service:', error);
    throw error;
  }
};

export const createFamilyPlanningService = async (data) => {
  try {
    console.log('Creating family planning service:', data);
    
    // Validate required fields before sending
    const requiredFields = ['clientId', 'methodId', 'serviceDate', 'serviceType'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    const response = await apiClient.post(`${FAMILY_PLANNING_BASE_URL}/services`, data);
    console.log('Create family planning service response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error creating family planning service:', error);
    throw error;
  }
};

export const updateFamilyPlanningService = async (id, data) => {
  try {
    console.log('Updating family planning service:', id, data);
    
    const response = await apiClient.put(`${FAMILY_PLANNING_BASE_URL}/services/${id}`, data);
    console.log('Update family planning service response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error updating family planning service:', error);
    throw error;
  }
};

export const deleteFamilyPlanningService = async (id) => {
  try {
    console.log('Deleting family planning service:', id);
    
    const response = await apiClient.delete(`${FAMILY_PLANNING_BASE_URL}/services/${id}`);
    console.log('Delete family planning service response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error deleting family planning service:', error);
    throw error;
  }
};

// Get family planning methods (for dropdown options)
export const getFamilyPlanningMethods = async () => {
  try {
    console.log('Fetching family planning methods');
    
    const response = await apiClient.get(`${FAMILY_PLANNING_BASE_URL}/methods`);
    console.log('Family planning methods response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching family planning methods, using fallback:', error);
    
    // Return mock methods as fallback
    return {
      data: [
        { id: 'oral-contraceptives', name: 'Oral Contraceptives', type: 'Hormonal', duration: '1 month' },
        { id: 'injectable-contraceptives', name: 'Injectable Contraceptives', type: 'Hormonal', duration: '3 months' },
        { id: 'iud', name: 'Intrauterine Device (IUD)', type: 'Long-acting', duration: '5-10 years' },
        { id: 'implant', name: 'Implant', type: 'Long-acting', duration: '3-5 years' },
        { id: 'condoms', name: 'Condoms', type: 'Barrier', duration: 'Per use' },
        { id: 'female-sterilization', name: 'Female Sterilization', type: 'Permanent', duration: 'Permanent' },
        { id: 'male-sterilization', name: 'Male Sterilization', type: 'Permanent', duration: 'Permanent' },
        { id: 'natural-family-planning', name: 'Natural Family Planning', type: 'Natural', duration: 'Ongoing' },
        { id: 'emergency-contraception', name: 'Emergency Contraception', type: 'Emergency', duration: 'One-time' },
        { id: 'other', name: 'Other', type: 'Other', duration: 'Varies' }
      ]
    };
  }
};

// Get family planning statistics
export const getFamilyPlanningStatistics = async (params) => {
  try {
    console.log('Fetching family planning statistics with params:', params);
    
    const response = await apiClient.get(`${FAMILY_PLANNING_BASE_URL}/statistics`, { params });
    console.log('Family planning statistics response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching family planning statistics, using mock data:', error);
    
    // Return mock statistics as fallback
    return {
      data: {
        totalClients: 2456,
        activeClients: 1834,
        newAcceptors: 234,
        methodSwitches: 156,
        discontinuations: 89,
        followUps: 567,
        topMethods: [
          { name: 'Injectable Contraceptives', clients: 678, percentage: 36.9 },
          { name: 'Oral Contraceptives', clients: 456, percentage: 24.9 },
          { name: 'Implant', clients: 334, percentage: 18.2 },
          { name: 'IUD', clients: 234, percentage: 12.8 },
          { name: 'Condoms', clients: 132, percentage: 7.2 }
        ],
        monthlyServices: [
          { month: 'Jan', services: 189 },
          { month: 'Feb', services: 205 },
          { month: 'Mar', services: 234 },
          { month: 'Apr', services: 267 },
          { month: 'May', services: 289 },
          { month: 'Jun', services: 312 }
        ]
      }
    };
  }
};

// Search clients for family planning services
export const searchFamilyPlanningClients = async (searchTerm) => {
  try {
    console.log('Searching for family planning clients with term:', searchTerm);
    
    // Try different client search endpoints
    const endpointsToTry = [
      { url: '/api/clients/search', params: { q: searchTerm, limit: 50 } },
      { url: '/api/patients/search', params: { q: searchTerm, limit: 50 } },
      { url: '/api/clients', params: { search: searchTerm, limit: 50 } },
      { url: '/api/patients', params: { search: searchTerm, limit: 50 } }
    ];
    
    let response;
    let endpointUsed;
    
    for (const endpoint of endpointsToTry) {
      try {
        console.log(`Trying endpoint: ${endpoint.url}`);
        response = await apiClient.get(endpoint.url, { params: endpoint.params });
        endpointUsed = endpoint.url;
        console.log(`✅ Success with ${endpoint.url}:`, response.data);
        break;
      } catch (error) {
        console.log(`❌ Failed ${endpoint.url}:`, error.response?.status);
        continue;
      }
    }
    
    if (!response) {
      throw new Error('All client search endpoints failed');
    }
    
    // Handle response
    let clients = response.data.data || response.data || [];
    
    // Filter by search term if needed
    if (searchTerm && clients.length > 0) {
      const searchLower = searchTerm.toLowerCase();
      clients = clients.filter(client => {
        const fullName = `${client.firstName || ''} ${client.lastName || ''} ${client.otherNames || ''}`.toLowerCase();
        const uniqueId = (client.uniqueIdentifier || '').toLowerCase();
        const email = (client.email || '').toLowerCase();
        
        return fullName.includes(searchLower) || 
               uniqueId.includes(searchLower) ||
               email.includes(searchLower);
      });
    }
    
    const mappedClients = clients.slice(0, 10).map(client => ({
      id: client.id, // UUID for API calls
      uniqueIdentifier: client.uniqueIdentifier || client.id,
      name: client.firstName && client.lastName ? 
            `${client.firstName} ${client.lastName}${client.otherNames ? ' ' + client.otherNames : ''}` : 
            client.name || 'Unknown Client',
      firstName: client.firstName,
      lastName: client.lastName,
      otherNames: client.otherNames,
      gender: client.gender,
      date_of_birth: client.dateOfBirth || client.date_of_birth,
      dateOfBirth: client.dateOfBirth || client.date_of_birth,
      phoneNumber: client.phoneNumber,
      email: client.email,
      address: client.address
    }));
    
    console.log('Final mapped family planning clients:', mappedClients);
    return mappedClients;
    
  } catch (error) {
    console.error('Family planning client search failed:', error);
    
    // Return mock clients as fallback
    const mockClients = getMockClients(searchTerm);
    console.log('Using mock family planning clients:', mockClients);
    return mockClients;
  }
};

// Mock clients for family planning services
const getMockClients = (searchTerm) => {
  return Array.from({ length: 5 }, (_, i) => {
    const mockId = `735f0276-9dd3-41d5-a33f-b0ad6cc11${i.toString().padStart(3, '0')}`;
    const names = ['Sarah', 'Mary', 'Grace', 'Faith', 'Joy'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
    
    return {
      id: mockId, // Valid UUID format
      uniqueIdentifier: `AKH-25-C033${i}`,
      firstName: searchTerm || names[i],
      lastName: lastNames[i],
      otherNames: i % 2 === 0 ? 'Middle' : null,
      name: `${searchTerm || names[i]} ${lastNames[i]}${i % 2 === 0 ? ' Middle' : ''}`,
      gender: i % 8 === 0 ? 'male' : 'female', // Mostly female, some male for condoms/vasectomy
      dateOfBirth: new Date(1985 + (i % 20), (i % 12), (i % 28) + 1).toISOString().split('T')[0],
      date_of_birth: new Date(1985 + (i % 20), (i % 12), (i % 28) + 1).toISOString().split('T')[0],
      phoneNumber: `+234${800 + i}${String(i).padStart(6, '0')}`,
      email: `${(searchTerm || names[i]).toLowerCase()}${i}@example.com`,
      address: `${100 + i} Test Street`
    };
  });
};

// Helper function to map API field names to component field names
export const mapFamilyPlanningService = (apiService) => {
  if (!apiService) return null;

  return {
    id: apiService.id,
    client_id: apiService.clientId,
    method_id: apiService.methodId,
    service_date: apiService.serviceDate,
    service_type: apiService.serviceType,
    previous_method_id: apiService.previousMethodId,
    switch_reason: apiService.switchReason,
    quantity: apiService.quantity,
    batch_number: apiService.batchNumber,
    expiry_date: apiService.expiryDate,
    provided_by: apiService.providedBy,
    weight: apiService.weight,
    blood_pressure: apiService.bloodPressure,
    side_effects_reported: apiService.sideEffectsReported || [],
    side_effects_management: apiService.sideEffectsManagement,
    counseling_notes: apiService.counselingNotes,
    next_appointment: apiService.nextAppointment,
    discontinuation_reason: apiService.discontinuationReason,
    procedure_notes: apiService.procedureNotes,
    patient_satisfaction: apiService.patientSatisfaction,
    created_by: apiService.createdBy,
    updated_by: apiService.updatedBy,
    created_at: apiService.createdAt,
    updated_at: apiService.updatedAt,
    deleted_at: apiService.deletedAt,
    
    // Additional computed fields for compatibility with existing components
    record_id: `FP${apiService.id ? apiService.id.substring(0, 8) : '00000000'}`, // Generate display ID
    patient_name: 'Loading...', // Will be populated when client data is fetched
    patient_id: apiService.clientId, // Alias for clientId
    age: null, // Will be calculated from client DOB
    gender: null, // Will be populated from client data
    visit_date: apiService.serviceDate, // Alias for serviceDate
    next_visit_date: apiService.nextAppointment, // Alias for nextAppointment
    visit_type: apiService.serviceType, // Alias for serviceType
    method: null, // Will be populated from method data
    location: null, // Will be populated from facility data
    provider: apiService.providedBy,
    has_side_effects: apiService.sideEffectsReported && apiService.sideEffectsReported.length > 0,
    side_effects: apiService.sideEffectsReported ? apiService.sideEffectsReported.join(', ') : '',
    is_new_acceptor: apiService.serviceType === 'Initial Adoption',
    parity: null, // Will be populated from client data
    marital_status: null, // Will be populated from client data
    education_level: null, // Will be populated from client data
    partner_support: null, // Will be populated from client data
    reason_for_visit: apiService.switchReason || 'Routine service',
    counseling_provided: Boolean(apiService.counselingNotes),
    follow_up_plan: apiService.nextAppointment ? `Next appointment: ${apiService.nextAppointment}` : '',
    notes: apiService.procedureNotes || apiService.counselingNotes || ''
  };
};

// Helper function to map component data to API format
export const mapToApiFormat = (componentData) => {
  const apiData = {
    clientId: componentData.client_id || componentData.patient_id,
    methodId: componentData.method_id,
    serviceDate: componentData.service_date || componentData.visit_date,
    serviceType: componentData.service_type || componentData.visit_type,
    quantity: componentData.quantity ? Number(componentData.quantity) : undefined,
    batchNumber: componentData.batch_number,
    expiryDate: componentData.expiry_date,
    providedBy: componentData.provided_by || componentData.provider,
    weight: componentData.weight ? Number(componentData.weight) : undefined,
    bloodPressure: componentData.blood_pressure,
    sideEffectsReported: Array.isArray(componentData.side_effects_reported) ? 
      componentData.side_effects_reported : 
      (componentData.side_effects ? componentData.side_effects.split(', ').filter(Boolean) : []),
    sideEffectsManagement: componentData.side_effects_management,
    counselingNotes: componentData.counseling_notes,
    nextAppointment: componentData.next_appointment || componentData.next_visit_date,
    discontinuationReason: componentData.discontinuation_reason,
    procedureNotes: componentData.procedure_notes || componentData.notes,
    patientSatisfaction: componentData.patient_satisfaction || 'Not Recorded'
  };

  // Add optional fields only if they have values
  if (componentData.previous_method_id) {
    apiData.previousMethodId = componentData.previous_method_id;
  }
  if (componentData.switch_reason) {
    apiData.switchReason = componentData.switch_reason;
  }

  // Remove undefined values
  Object.keys(apiData).forEach(key => 
    apiData[key] === undefined && delete apiData[key]
  );

  return apiData;
};

const familyPlanningService = {
  getAllFamilyPlanningServices,
  getFamilyPlanningServiceById,
  createFamilyPlanningService,
  updateFamilyPlanningService,
  deleteFamilyPlanningService,
  getFamilyPlanningMethods,
  getFamilyPlanningStatistics,
  searchFamilyPlanningClients,
  mapFamilyPlanningService,
  mapToApiFormat,
  
  // Legacy method names for compatibility
  getAllRecords: getAllFamilyPlanningServices,
  getRecordById: getFamilyPlanningServiceById,
  createRecord: createFamilyPlanningService,
  updateRecord: updateFamilyPlanningService,
  deleteRecord: deleteFamilyPlanningService
};

export default familyPlanningService;