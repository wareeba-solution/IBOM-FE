import axios from 'axios';
import api from './api';
import { 
  getToken, 
  setToken, 
  removeToken, 
  getRefreshToken, 
  setRefreshToken, 
  removeRefreshToken,
  getUser, 
  setUser, 
  removeUser,
  clearAuthData 
} from '../utils/helpers';

// Mock users for development (keeping your existing ones)
const MOCK_USERS = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
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
  const token = getToken();
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
      const { password: _, ...userWithoutPassword } = mockUser;
      const user = userWithoutPassword;
      
      // Generate mock tokens
      const token = `mock-jwt-token-${user.role}-${Date.now()}`;
      const refreshToken = `mock-refresh-token-${user.role}-${Date.now()}`;
      
      // Store tokens and user data using helpers
      setToken(token);
      setRefreshToken(refreshToken);
      setUser(user);
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { token, refreshToken, user };
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
      const { token, refreshToken, user } = response.data.data;
      
      // Store tokens and user data using helpers
      setToken(token);
      setRefreshToken(refreshToken);
      setUser(user);
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { token, refreshToken, user };
    } catch (error) {
      throw error;
    }
    */
  },
  
  logout: async () => {
    // Clear all auth data using helper
    clearAuthData();
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    return true;
  },
  
  getCurrentUser: async () => {
    const user = getUser();
    const token = getToken();
    
    if (!user || !token) {
      return null;
    }
    
    // For development/testing purposes - simulate a verified token
    return user;
    
    // When backend is ready, use this instead:
    /*
    try {
      // Verify token is still valid by calling a protected endpoint
      const response = await api.get('/auth/me');
      return response.data.data;
    } catch (error) {
      // Token is invalid, clear storage
      clearAuthData();
      return null;
    }
    */
  },
  
  refreshToken: async () => {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    // For development - simulate token refresh
    const user = getUser();
    const newToken = `mock-jwt-token-${user?.role}-${Date.now()}`;
    
    setToken(newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    return { token: newToken };
    
    // When backend is ready, use this instead:
    /*
    try {
      const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
      const { token } = response.data.data;
      
      setToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { token };
    } catch (error) {
      // Refresh failed, clear storage
      clearAuthData();
      throw error;
    }
    */
  },
  
  isAuthenticated: () => {
    return !!getToken();
  },
  
  // Helper method to check if user has a specific role
  hasRole: (role) => {
    const user = getUser();
    return user?.role === role;
  },
  
  // Helper method to check if user has one of the roles
  hasAnyRole: (roles) => {
    const user = getUser();
    return roles.includes(user?.role);
  }
};

export default authService;
