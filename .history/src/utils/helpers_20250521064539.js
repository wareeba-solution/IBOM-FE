// src/utils/helpers.js (add these functions if they don't exist)

// Get token from localStorage
export const getToken = () => {
    return localStorage.getItem('token');
  };
  
  // Set token in localStorage
  export const setToken = (token) => {
    localStorage.setItem('token', token);
  };
  
  // Remove token from localStorage
  export const removeToken = () => {
    localStorage.removeItem('token');
  };
  
  // Check if user is logged in
  export const isAuthenticated = () => {
    return !!getToken();
  };
  
  // Other helper functions...