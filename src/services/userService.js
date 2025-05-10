// src/services/userService.js
import api from './api';

const userService = {
  // Get all users (admin only)
  getAllUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create new user (admin only)
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Change user role (admin only)
  changeUserRole: async (id, role) => {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  // Approve user registration (admin only)
  approveUser: async (id) => {
    const response = await api.patch(`/users/${id}/approve`);
    return response.data;
  },

  // Reject user registration (admin only)
  rejectUser: async (id, reason) => {
    const response = await api.patch(`/users/${id}/reject`, { reason });
    return response.data;
  },

  // Get user activity logs
  getUserLogs: async (id) => {
    const response = await api.get(`/users/${id}/logs`);
    return response.data;
  }
};

export default userService;