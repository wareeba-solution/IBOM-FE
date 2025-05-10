// src/hooks/useApi.js
import { useState, useCallback } from 'react';

/**
 * Custom hook for handling API calls with loading, error states.
 * This hook provides a consistent way to manage API requests across the application.
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Execute an API call with proper state management.
   * 
   * @param {Function} apiFunction - The API function to execute
   * @param {Array} params - Parameters to pass to the API function
   * @param {Function} onSuccess - Callback function to execute on success
   * @param {Function} onError - Optional callback function to execute on error
   * @returns {Object} - Result containing success flag and data
   */
  const execute = useCallback(async (apiFunction, params = [], onSuccess, onError) => {
    setLoading(true);
    setError(null);
    
    try {
      // Spread params for the API call
      const response = await apiFunction(...params);
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess(response);
      }
      
      setLoading(false);
      return { success: true, data: response };
    } catch (err) {
      console.error('API Error in useApi hook:', err);
      
      // Format error message
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.status === 401) {
          errorMessage = 'Authentication required. Please log in.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (err.response.status === 404) {
          errorMessage = 'The requested resource was not found.';
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response received from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      
      // Call the error callback if provided
      if (onError) {
        onError(err, errorMessage);
      }
      
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);
  
  /**
   * Clear any current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError
  };
};