// src/hooks/useForm.js
import { useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useApi from './useApi';

/**
 * Custom hook for handling forms with Formik, Yup validation and API integration
 * 
 * @param {Object} initialValues - Initial form values
 * @param {Object|Function} validationSchema - Yup validation schema or function that returns one
 * @param {Function} onSubmit - Function to handle form submission
 * @param {Function} onSuccess - Callback for successful submission
 * @param {Function} onError - Callback for submission error
 * @param {Object} options - Additional options
 * @returns {Object} - Form handling utilities
 */
const useForm = (
  initialValues, 
  validationSchema, 
  onSubmit, 
  onSuccess, 
  onError, 
  options = {}
) => {
  const { execute, loading, error, clearError } = useApi();
  
  // Handle form submission
  const handleSubmit = useCallback(async (values, formikHelpers) => {
    try {
      const result = await onSubmit(values, formikHelpers);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Reset form if specified
      if (options.resetOnSuccess) {
        formikHelpers.resetForm();
      }
      
      return result;
    } catch (err) {
      if (onError) {
        onError(err);
      }
      
      // Format error messages for form fields if available
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        const errors = err.response.data.errors;
        
        Object.keys(errors).forEach(field => {
          fieldErrors[field] = errors[field][0];
        });
        
        formikHelpers.setErrors(fieldErrors);
      }
      
      throw err;
    }
  }, [onSubmit, onSuccess, onError, options]);
  
  // Create formik instance
  const formik = useFormik({
    initialValues,
    validationSchema: typeof validationSchema === 'function' 
      ? validationSchema() 
      : validationSchema,
    onSubmit: handleSubmit,
    validateOnChange: options.validateOnChange !== undefined 
      ? options.validateOnChange 
      : true,
    validateOnBlur: options.validateOnBlur !== undefined 
      ? options.validateOnBlur 
      : true,
    enableReinitialize: options.enableReinitialize !== undefined 
      ? options.enableReinitialize 
      : false
  });
  
  /**
   * Execute an API call as part of form submission
   * 
   * @param {Function} apiCall - The API function to call
   * @param {Array} params - Parameters to pass to the API function (including form values)
   * @param {Function} transformValues - Function to transform form values before API call
   * @returns {Promise} - The result of the API call
   */
  const submitWithApi = useCallback(async (apiCall, params = [], transformValues = null) => {
    return execute(
      apiCall,
      params, 
      (response) => {
        if (onSuccess) {
          onSuccess(response);
        }
        
        // Reset form if specified
        if (options.resetOnSuccess) {
          formik.resetForm();
        }
      },
      (err) => {
        if (onError) {
          onError(err);
        }
        
        // Format error messages for form fields if available
        if (err.response?.data?.errors) {
          const fieldErrors = {};
          const errors = err.response.data.errors;
          
          Object.keys(errors).forEach(field => {
            fieldErrors[field] = errors[field][0];
          });
          
          formik.setErrors(fieldErrors);
        }
      }
    );
  }, [execute, formik, onSuccess, onError, options]);
  
  /**
   * Set initial values and reset form
   * 
   * @param {Object} values - New initial values
   */
  const setInitialValues = useCallback((values) => {
    formik.resetForm({
      values: values
    });
  }, [formik]);
  
  return {
    formik,
    submitWithApi,
    setInitialValues,
    isSubmitting: formik.isSubmitting || loading,
    error,
    clearError
  };
};

export default useForm;