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

// Base URL for facility endpoints
const FACILITY_BASE_URL = '/api/facilities';

// API Functions
export const getAllFacilities = async (params) => {
  try {
    console.log('🔍 FacilityService: Fetching facilities with params:', params);
    
    // Map frontend params to API params
    const apiParams = {
      page: params.page || 1,
      limit: params.limit || params.per_page || 10
    };

    // Add filters - Make sure facilityType filter is properly added
    if (params.status) apiParams.status = params.status;
    if (params.type) apiParams.facilityType = params.type;
    if (params.facilityType) apiParams.facilityType = params.facilityType; // This is the important one for tabs
    if (params.city) apiParams.lga = params.city;
    if (params.lga) apiParams.lga = params.lga;
    if (params.search) apiParams.search = params.search;

    console.log('🌐 API params being sent:', apiParams);

    const response = await apiClient.get(FACILITY_BASE_URL, { params: apiParams });
    console.log('📡 Raw API response:', response.data);
    
    // Handle different response structures
    let facilitiesData = [];
    let metaData = {};
    
    if (response.data.status === 'success' && response.data.data) {
      facilitiesData = response.data.data;
      metaData = response.data.meta || {};
    } else if (response.data.data) {
      facilitiesData = response.data.data;
      metaData = response.data.meta || {};
    } else if (Array.isArray(response.data)) {
      facilitiesData = response.data;
      metaData = { totalItems: facilitiesData.length };
    } else {
      facilitiesData = [];
      metaData = { totalItems: 0 };
    }

    console.log('Raw facilities data:', facilitiesData);

    // **IMPORTANT: Map each facility using mapFacility function**
    const mappedFacilities = facilitiesData.map(facility => {
      const mapped = mapFacility(facility);
      console.log('Mapped facility:', mapped);
      return mapped;
    });

    console.log('All mapped facilities:', mappedFacilities);

    // Return mapped response
    return {
      data: mappedFacilities,
      meta: {
        totalItems: metaData.totalItems || mappedFacilities.length,
        totalPages: metaData.totalPages || Math.ceil((metaData.totalItems || mappedFacilities.length) / apiParams.limit),
        currentPage: metaData.currentPage || apiParams.page,
        pageSize: metaData.pageSize || apiParams.limit
      }
    };
  } catch (error) {
    console.error('❌ Error fetching facilities:', error);
    
    // Return filtered mock facilities based on facilityType
    const mockFacilities = getMockFacilities();
    let filteredMockFacilities = mockFacilities;
    
    // Apply facilityType filter to mock data for testing
    if (params.facilityType) {
      filteredMockFacilities = mockFacilities.filter(f => f.facilityType === params.facilityType);
      console.log(`🔧 Mock: Filtered to ${params.facilityType}, found ${filteredMockFacilities.length} facilities`);
    }
    
    return {
      data: filteredMockFacilities,
      meta: {
        totalItems: filteredMockFacilities.length,
        totalPages: Math.ceil(filteredMockFacilities.length / (params.limit || 10)),
        currentPage: params.page || 1,
        pageSize: params.limit || 10
      }
    };
  }
};

export const getFacilityById = async (id) => {
  try {
    console.log('Fetching facility by ID:', id);
    
    const response = await apiClient.get(`${FACILITY_BASE_URL}/${id}`);
    console.log('Facility response:', response.data);
    
    // Handle different response structures
    let apiData;
    if (response.data.data) {
      apiData = response.data.data; // If wrapped in data property
    } else if (response.data.status === 'success' && response.data.data) {
      apiData = response.data.data; // If status wrapper
    } else {
      apiData = response.data; // Direct data
    }
    
    console.log('API facility data:', apiData);
    
    // Map API response to component format
    const mappedFacility = mapFacility(apiData);
    console.log('Mapped facility:', mappedFacility);
    
    return mappedFacility;
  } catch (error) {
    console.error('Error fetching facility:', error);
    
    // Return mock facility as fallback
    return getMockFacilityById(id);
  }
};

export const createFacility = async (data) => {
  try {
    console.log('Creating facility:', data);
    
    // Map component data to API format
    const apiData = mapToApiFormat(data);
    
    const response = await apiClient.post(FACILITY_BASE_URL, apiData);
    console.log('Create facility response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error creating facility:', error);
    throw error;
  }
};

export const updateFacility = async (id, data) => {
  try {
    console.log('Updating facility:', id, data);
    
    // Map component data to API format
    const apiData = mapToApiFormat(data);
    
    const response = await apiClient.put(`${FACILITY_BASE_URL}/${id}`, apiData);
    console.log('Update facility response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error updating facility:', error);
    throw error;
  }
};

export const deleteFacility = async (id) => {
  try {
    console.log('Deleting facility:', id);
    
    const response = await apiClient.delete(`${FACILITY_BASE_URL}/${id}`);
    console.log('Delete facility response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error deleting facility:', error);
    throw error;
  }
};

// Search facilities
export const searchFacilities = async (searchTerm) => {
  try {
    console.log('Searching facilities with term:', searchTerm);
    
    const response = await getAllFacilities({ search: searchTerm, limit: 50 });
    
    // Filter results by search term if API doesn't handle it
    let facilities = response.data || [];
    if (searchTerm && facilities.length > 0) {
      const searchLower = searchTerm.toLowerCase();
      facilities = facilities.filter(facility => 
        facility.name?.toLowerCase().includes(searchLower) ||
        facility.lga?.toLowerCase().includes(searchLower) ||
        facility.facilityType?.toLowerCase().includes(searchLower)
      );
    }
    
    return facilities.slice(0, 10); // Return top 10 matches
  } catch (error) {
    console.error('Facility search failed:', error);
    return getMockFacilities().slice(0, 5);
  }
};

// Helper function to map API data to component format
export const mapFacility = (apiData) => {
  if (!apiData) {
    console.warn('No facility data to map');
    return null;
  }

  console.log('Mapping facility data:', apiData);

  const mapped = {
    // Direct API fields
    id: apiData.id,
    name: apiData.name,
    facilityType: apiData.facilityType,
    address: apiData.address,
    lga: apiData.lga,
    state: apiData.state || 'Akwa Ibom',
    contactPerson: apiData.contactPerson,
    phoneNumber: apiData.phoneNumber,
    email: apiData.email,
    status: apiData.status,
    createdAt: apiData.createdAt,
    updatedAt: apiData.updatedAt,
    
    // Computed/mapped fields for component compatibility
    facility_code: `FAC${apiData.id?.substring(0, 8) || '00000000'}`,
    type: apiData.facilityType,
    city: apiData.lga,
    local_govt: apiData.lga,
    phone: apiData.phoneNumber,
    contact_person: apiData.contactPerson,
    created_at: apiData.createdAt,
    updated_at: apiData.updatedAt,
    
    // Additional fields based on facility type
    level: getFacilityLevel(apiData.facilityType),
    ownership: 'Government', // Default since API doesn't provide this
    postal_code: '',
    website: '',
    gps_coordinates: '',
    services: getDefaultServices(apiData.facilityType),
    beds: getDefaultBeds(apiData.facilityType),
    staff_count: getDefaultStaffCount(apiData.facilityType),
    head_name: apiData.contactPerson || 'Not specified',
    head_title: getDefaultHeadTitle(apiData.facilityType),
    registration_date: apiData.createdAt ? apiData.createdAt.split('T')[0] : '',
    last_updated: apiData.updatedAt,
    
    // Enhanced data for detail views
    staff: getDefaultStaffBreakdown(apiData.facilityType),
    patient_stats: getDefaultPatientStats(apiData.facilityType),
    beds_breakdown: getDefaultBedsBreakdown(apiData.facilityType),
    equipment: getDefaultEquipment(apiData.facilityType)
  };

  console.log('Final mapped facility:', mapped);
  return mapped;
};

// Helper function to map component data to API format
export const mapToApiFormat = (componentData) => {
  const apiData = {
    name: componentData.name,
    facilityType: componentData.type || componentData.facilityType,
    address: componentData.address,
    lga: componentData.city || componentData.lga || componentData.local_govt,
    state: componentData.state || 'Akwa Ibom',
    contactPerson: componentData.contact_person || componentData.contactPerson || componentData.head_name,
    phoneNumber: componentData.phone || componentData.phoneNumber,
    email: componentData.email
  };

  // Remove undefined values
  Object.keys(apiData).forEach(key => 
    apiData[key] === undefined && delete apiData[key]
  );

  return apiData;
};

// Helper functions for default values
const getFacilityLevel = (facilityType) => {
  switch (facilityType?.toLowerCase()) {
    case 'hospital': return 'Secondary';
    case 'clinic': return 'Primary';
    case 'health_center': return 'Primary';
    case 'maternity': return 'Primary';
    default: return 'Primary';
  }
};

const getDefaultServices = (facilityType) => {
  const baseServices = ['Outpatient Services', 'Pharmacy'];
  switch (facilityType?.toLowerCase()) {
    case 'hospital':
      return [...baseServices, 'Emergency Services', 'Surgery', 'Laboratory Services', 'Maternity', 'Pediatrics', 'Internal Medicine', 'Orthopedics'];
    case 'clinic':
      return [...baseServices, 'Laboratory Services', 'Minor Surgery'];
    case 'health_center':
      return [...baseServices, 'Immunization', 'Antenatal Care', 'Family Planning', 'Basic Laboratory'];
    case 'maternity':
      return [...baseServices, 'Maternity', 'Antenatal Care', 'Postnatal Care', 'Family Planning'];
    default:
      return baseServices;
  }
};

const getDefaultBeds = (facilityType) => {
  switch (facilityType?.toLowerCase()) {
    case 'hospital': return 120;
    case 'clinic': return 15;
    case 'health_center': return 25;
    case 'maternity': return 30;
    default: return 20;
  }
};

const getDefaultStaffCount = (facilityType) => {
  switch (facilityType?.toLowerCase()) {
    case 'hospital': return 150;
    case 'clinic': return 18;
    case 'health_center': return 35;
    case 'maternity': return 25;
    default: return 25;
  }
};

const getDefaultHeadTitle = (facilityType) => {
  switch (facilityType?.toLowerCase()) {
    case 'hospital': return 'Medical Director';
    case 'clinic': return 'Head Doctor';
    case 'health_center': return 'Chief Medical Officer';
    case 'maternity': return 'Head Midwife';
    default: return 'Head of Facility';
  }
};

const getDefaultStaffBreakdown = (facilityType) => {
  switch (facilityType?.toLowerCase()) {
    case 'hospital':
      return { 
        doctors: 30, 
        nurses: 60, 
        lab_technicians: 15, 
        administrative: 25, 
        other: 20 
      };
    case 'clinic':
      return { 
        doctors: 3, 
        nurses: 8, 
        lab_technicians: 2, 
        administrative: 3, 
        other: 2 
      };
    case 'health_center':
      return { 
        doctors: 5, 
        nurses: 15, 
        lab_technicians: 3, 
        administrative: 7, 
        other: 5 
      };
    case 'maternity':
      return { 
        doctors: 3, 
        nurses: 12, 
        lab_technicians: 2, 
        administrative: 5, 
        other: 3 
      };
    default:
      return { 
        doctors: 4, 
        nurses: 12, 
        lab_technicians: 2, 
        administrative: 4, 
        other: 3 
      };
  }
};

const getDefaultPatientStats = (facilityType) => {
  switch (facilityType?.toLowerCase()) {
    case 'hospital':
      return { 
        total_patients: 8500, 
        monthly_average: 650, 
        outpatient_ratio: 0.7, 
        inpatient_ratio: 0.3 
      };
    case 'clinic':
      return { 
        total_patients: 1200, 
        monthly_average: 90, 
        outpatient_ratio: 0.95, 
        inpatient_ratio: 0.05 
      };
    case 'health_center':
      return { 
        total_patients: 2800, 
        monthly_average: 220, 
        outpatient_ratio: 0.85, 
        inpatient_ratio: 0.15 
      };
    case 'maternity':
      return { 
        total_patients: 1800, 
        monthly_average: 140, 
        outpatient_ratio: 0.6, 
        inpatient_ratio: 0.4 
      };
    default:
      return { 
        total_patients: 2000, 
        monthly_average: 150, 
        outpatient_ratio: 0.8, 
        inpatient_ratio: 0.2 
      };
  }
};

const getDefaultBedsBreakdown = (facilityType) => {
  const totalBeds = getDefaultBeds(facilityType);
  switch (facilityType?.toLowerCase()) {
    case 'hospital':
      return { 
        general: 60, 
        pediatric: 20, 
        maternity: 18, 
        icu: 12, 
        emergency: 10 
      };
    case 'clinic':
      return { 
        general: 10, 
        pediatric: 2, 
        maternity: 2, 
        icu: 0, 
        emergency: 1 
      };
    case 'health_center':
      return { 
        general: 15, 
        pediatric: 5, 
        maternity: 3, 
        icu: 0, 
        emergency: 2 
      };
    case 'maternity':
      return { 
        general: 5, 
        pediatric: 0, 
        maternity: 20, 
        icu: 2, 
        emergency: 3 
      };
    default:
      return { 
        general: 12, 
        pediatric: 3, 
        maternity: 3, 
        icu: 0, 
        emergency: 2 
      };
  }
};

const getDefaultEquipment = (facilityType) => {
  const baseEquipment = [
    { name: 'Blood Pressure Monitor', count: 8 },
    { name: 'Digital Thermometer', count: 15 },
    { name: 'Stethoscope', count: 12 },
    { name: 'Pulse Oximeter', count: 6 }
  ];
  
  switch (facilityType?.toLowerCase()) {
    case 'hospital':
      return [
        ...baseEquipment,
        { name: 'X-Ray Machine', count: 2 },
        { name: 'Ultrasound Machine', count: 4 },
        { name: 'ECG Machine', count: 3 },
        { name: 'Ventilator', count: 8 },
        { name: 'Defibrillator', count: 5 },
        { name: 'CT Scanner', count: 1 },
        { name: 'Laboratory Equipment', count: 1 },
        { name: 'Surgical Instruments Set', count: 10 },
        { name: 'Anesthesia Machine', count: 3 },
        { name: 'Dialysis Machine', count: 2 }
      ];
    case 'clinic':
      return [
        ...baseEquipment,
        { name: 'ECG Machine', count: 1 },
        { name: 'Nebulizer', count: 2 },
        { name: 'Glucometer', count: 3 }
      ];
    case 'health_center':
      return [
        ...baseEquipment,
        { name: 'Ultrasound Machine', count: 1 },
        { name: 'ECG Machine', count: 1 },
        { name: 'Vaccine Refrigerator', count: 2 },
        { name: 'Microscope', count: 1 }
      ];
    case 'maternity':
      return [
        ...baseEquipment,
        { name: 'Ultrasound Machine', count: 2 },
        { name: 'Fetal Monitor', count: 4 },
        { name: 'Delivery Bed', count: 8 },
        { name: 'Infant Warmer', count: 3 },
        { name: 'Vacuum Extractor', count: 2 }
      ];
    default:
      return baseEquipment;
  }
};

// Mock facilities for fallback
const getMockFacilities = () => {
  return [
    {
      id: '1',
      name: 'Akwa Ibom State University Teaching Hospital',
      facilityType: 'hospital',
      address: 'Uyo-Ikot Ekpene Road',
      lga: 'Uyo',
      state: 'Akwa Ibom',
      contactPerson: 'Dr. John Doe',
      phoneNumber: '+234-801-234-5678',
      email: 'info@aksuths.edu.ng',
      status: 'active',
      createdAt: '2020-01-15T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z'
    },
    {
      id: '2',
      name: 'General Hospital Uyo',
      facilityType: 'hospital',
      address: 'Hospital Road, Uyo',
      lga: 'Uyo',
      state: 'Akwa Ibom',
      contactPerson: 'Dr. Jane Smith',
      phoneNumber: '+234-802-345-6789',
      email: 'info@ghuyou.gov.ng',
      status: 'active',
      createdAt: '2018-03-20T10:00:00Z',
      updatedAt: '2024-11-15T10:00:00Z'
    },
    {
      id: '3',
      name: 'Primary Health Centre Ikot Ekpene',
      facilityType: 'health_center',
      address: 'Market Road, Ikot Ekpene',
      lga: 'Ikot Ekpene',
      state: 'Akwa Ibom',
      contactPerson: 'Nurse Mary Johnson',
      phoneNumber: '+234-803-456-7890',
      email: 'phc.ikotekpene@aksgov.ng',
      status: 'active',
      createdAt: '2019-06-10T10:00:00Z',
      updatedAt: '2024-10-20T10:00:00Z'
    },
    {
      id: '4',
      name: 'Eket General Hospital',
      facilityType: 'hospital',
      address: 'Eket-Oron Road',
      lga: 'Eket',
      state: 'Akwa Ibom',
      contactPerson: 'Dr. David Wilson',
      phoneNumber: '+234-804-567-8901',
      email: 'info@eketgh.gov.ng',
      status: 'active',
      createdAt: '2017-09-05T10:00:00Z',
      updatedAt: '2024-09-30T10:00:00Z'
    },
    {
      id: '5',
      name: 'Oron Maternity Centre',
      facilityType: 'maternity',
      address: 'Oron Town Centre',
      lga: 'Oron',
      state: 'Akwa Ibom',
      contactPerson: 'Midwife Sarah Brown',
      phoneNumber: '+234-805-678-9012',
      email: 'oronmaternity@aksgov.ng',
      status: 'active',
      createdAt: '2021-02-14T10:00:00Z',
      updatedAt: '2024-11-10T10:00:00Z'
    }
  ].map(facility => mapFacility(facility));
};

const getMockFacilityById = (id) => {
  const mockFacilities = getMockFacilities();
  return mockFacilities.find(f => f.id === id) || mockFacilities[0];
};

const facilityService = {
  getAllFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
  searchFacilities,
  mapFacility,
  mapToApiFormat,
  
  // Legacy method names for compatibility
  getFacilities: getAllFacilities
};

export default facilityService;