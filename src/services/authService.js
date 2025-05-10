// // src/services/authService.js
// import api from './api';

// const authService = {
//   // Login user
//   login: async (credentials) => {
//     const response = await api.post('/auth/login', credentials);
//     return response.data;
//   },

//   // Register new user
//   register: async (userData) => {
//     const response = await api.post('/auth/register', userData);
//     return response.data;
//   },

//   // Get current user data
//   getCurrentUser: async () => {
//     const response = await api.get('/auth/me');
//     return response.data;
//   },

//   // Request password reset
//   requestPasswordReset: async (email) => {
//     const response = await api.post('/auth/forgot-password', { email });
//     return response.data;
//   },

//   // Reset password with token
//   resetPassword: async (resetData) => {
//     const { token, password, password_confirmation } = resetData;
//     const response = await api.post('/auth/reset-password', {
//       token,
//       password,
//       password_confirmation
//     });
//     return response.data;
//   },

//   // Update user profile
//   updateProfile: async (userData) => {
//     const response = await api.put('/auth/profile', userData);
//     return response.data;
//   },

//   // Change password
//   changePassword: async (passwordData) => {
//     const response = await api.post('/auth/change-password', passwordData);
//     return response.data;
//   },

//   // Verify email with token
//   verifyEmail: async (token) => {
//     const response = await api.get(`/auth/verify-email/${token}`);
//     return response.data;
//   }
// };

// export default authService;

import axios from 'axios';
import api from './api';

export const TOKEN_KEY = 'akwa_ibom_health_token';
export const USER_KEY = 'akwa_ibom_health_user';

// Mock users for development
const MOCK_USERS = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',  // Make sure this matches the expected value
    email: 'admin@akwaibomhealth.gov.ng',
    facilityId: '1',
    facilityName: 'Akwa Ibom State Health Department'
  },
  {
    id: '2',
    username: 'commissioner',
    password: 'health2025',
    firstName: 'Health',
    lastName: 'Commissioner',
    role: 'health_commissioner',
    email: 'commissioner@akwaibomhealth.gov.ng',
    facilityId: '1',
    facilityName: 'Akwa Ibom State Health Department'
  },
  {
    id: '3',
    username: 'facility_admin',
    password: 'facility2025',
    firstName: 'Facility',
    lastName: 'Manager',
    role: 'facility_admin',
    email: 'facility@hospital.org',
    facilityId: '2',
    facilityName: 'University of Uyo Teaching Hospital'
  },
  {
    id: '4',
    username: 'doctor',
    password: 'doctor2025',
    firstName: 'John',
    lastName: 'Doe',
    role: 'doctor',
    email: 'doctor@hospital.org',
    facilityId: '2',
    facilityName: 'University of Uyo Teaching Hospital'
  },
  {
    id: '5',
    username: 'nurse',
    password: 'nurse2025',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'nurse',
    email: 'nurse@hospital.org',
    facilityId: '3',
    facilityName: 'Ibom Specialist Hospital'
  },
  {
    id: '6',
    username: 'data_entry',
    password: 'data2025',
    firstName: 'Data',
    lastName: 'Clerk',
    role: 'data_entry',
    email: 'clerk@hospital.org',
    facilityId: '3',
    facilityName: 'Ibom Specialist Hospital'
  }
];

// Initialize axios instance with auth token
const initializeAxios = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Call this when the app starts
initializeAxios();

const authService = {
  login: async (username, password) => {
    // For development/testing purposes - mock authentication
    const mockUser = MOCK_USERS.find(
      user => user.username === username && user.password === password
    );
    
    if (mockUser) {
      // Create a copy without the password
      const { password, ...userWithoutPassword } = mockUser;
      const user = userWithoutPassword;
      
      // Generate a mock token
      const token = `mock-jwt-token-${user.role}-${Date.now()}`;
      
      // Store token and user data
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { token, user };
    }
    
    // If no mock user matches, throw an error
    throw { 
      response: { 
        data: { 
          message: 'Invalid username or password' 
        } 
      } 
    };
    
    // When backend is ready, use this instead:
    /*
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data.data;
      
      // Store token and user data
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { token, user };
    } catch (error) {
      throw error;
    }
    */
  },
  
  logout: async () => {
    // Remove token and user data
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    return true;
  },
  
  getCurrentUser: async () => {
    const user = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (!user || !token) {
      return null;
    }
    
    // For development/testing purposes - simulate a verified token
    return JSON.parse(user);
    
    // When backend is ready, use this instead:
    /*
    try {
      // Verify token is still valid by calling a protected endpoint
      await api.get('/auth/profile');
      return JSON.parse(user);
    } catch (error) {
      // Token is invalid, clear storage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return null;
    }
    */
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
  
  // Helper method to check if user has a specific role
  hasRole: (role) => {
    const user = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
    return user.role === role;
  },
  
  // Helper method to check if user has one of the roles
  hasAnyRole: (roles) => {
    const user = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
    return roles.includes(user.role);
  }
};

export default authService;