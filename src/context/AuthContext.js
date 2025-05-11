// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import authService, { TOKEN_KEY, USER_KEY } from '../services/authService';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Check if token exists and is valid on initial load
  useEffect(() => {
   const verifyToken = async () => {
    if (token) {
      try {
        const decodedToken = jwt_decode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          // Token expired, do not proceed
          logout();
          return; // <-- prevent setLoading from being called
        }

        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Token verification failed:', err);
        logout();
        return; // <-- same here
      }
    }
    setLoading(false);
  };

    verifyToken();
  }, [token]);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Login attempt with:", credentials.email);
      
      // Make the login request
      const response = await axios.post('http://localhost:3000/api/auth/login', credentials);
      console.log("Login response:", response.data);
      
      // Extract token and user from response
      const { token, user } = response.data.data || response.data;
      
      if (!user || !token) {
        console.error("Invalid response format:", response.data);
        throw new Error("Invalid response from server");
      }
      
      console.log("User data:", user);
      console.log("User role:", user.role);
      
      // Store token and user in localStorage
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      // Update state
      setToken(token);
      setUser(user);
      //setLoading(false);
      
      // Implement direct redirection based on role
      if (user.role === 'admin') {
        console.log("User is admin, redirecting to /admin");
        // Use a slight delay to ensure state is updated
        setTimeout(() => {
          window.location.href = '/admin';
        }, 100);
      } else {
        console.log("User is not admin, redirecting to /dashboard");
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
         //setLoading(false);
      }
      
      return { success: true, user };
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      //const response = await authService.register(userData);
      const response = await axios.post('http://localhost:3000/api/auth/register', userData);
      console.log("Registration response:", response.data);
      return { success: true, data: response };
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  // Password reset request
  const requestPasswordReset = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.requestPasswordReset(email);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset request failed.');
      return { success: false, error: err.response?.data?.message || 'Request failed' };
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (resetData) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.resetPassword(resetData);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed.');
      return { success: false, error: err.response?.data?.message || 'Reset failed' };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      return { success: true, data: updatedUser };
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed.');
      return { success: false, error: err.response?.data?.message || 'Update failed' };
    } finally {
      setLoading(false);
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  const doSetToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem(TOKEN_KEY, newToken);
  };

  const doSetUser = (newUser) => {
    setUser(newUser);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  };

  const contextValue = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    setToken: doSetToken,
    setUser: doSetUser,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    updateProfile,
    hasRole
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;