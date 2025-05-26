// src/pages/patients/PatientForm.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';
import { createPatient, getPatientById, updatePatient } from '../../services/patientService';
import { format } from 'date-fns';
import useNigeriaLocations from '../../hooks/useNigeriaLocations';

// Import form schema and steps
import { patientValidationSchema, initialPatientValues } from './PatientFormSchema';
import { STEPS, renderStepContent, isStepComplete, canSubmit } from './PatientFormSteps';

const PatientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();
  const locationData = useNigeriaLocations();
  
  // State
  const [patient, setPatient] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Initialize formik
  const formik = useFormik({
    initialValues: initialPatientValues,
    validationSchema: patientValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true
  });

  // Handle state change to update LGA options
  const handleStateChange = useCallback((e) => {
    const newState = e.target.value;
    formik.setFieldValue('state', newState);
    formik.setFieldValue('lgaResidence', '');
    
    if (locationData?.updateSelectedState) {
      locationData.updateSelectedState(newState);
    }
  }, [locationData, formik]);

  // Update LGAs when state changes
  useEffect(() => {
    if (formik.values.state && locationData?.updateSelectedState) {
      locationData.updateSelectedState(formik.values.state);
    }
  }, [formik.values.state, locationData]);

  // Load patient data if in edit mode
  useEffect(() => {
    const loadPatient = async () => {
      if (id && id !== 'new') {
        setIsEditMode(true);
        
        await execute(
          getPatientById,
          [id],
          (response) => {
            const patientData = {
              ...initialPatientValues,
              ...response,
              dateOfBirth: response.dateOfBirth ? new Date(response.dateOfBirth) : null,
            };
            
            setPatient(patientData);
            
            Object.keys(patientData).forEach(key => {
              formik.setFieldValue(key, patientData[key], false);
            });
          }
        );
      }
    };
    
    loadPatient();
  }, [id, execute, formik]);

  // Handle form submission
  async function handleSubmit(values) {
    const formattedValues = {
      ...values,
      dateOfBirth: values.dateOfBirth ? format(new Date(values.dateOfBirth), 'yyyy-MM-dd') : null,
    };
  
    try {
      if (isEditMode) {
        await execute(
          updatePatient,
          [id, formattedValues],
          (response) => {
            const message = response?.message || 'Patient updated successfully';
            setAlertMessage(message);
            setAlertSeverity('success');
            setAlertOpen(true);
            
            setTimeout(() => navigate(`/patients/${id}`), 1500);
          },
          (error, errorMessage) => {
            setAlertMessage(errorMessage);
            setAlertSeverity('error');
            setAlertOpen(true);
            
            const errorResponse = error.response?.data;
            if (errorResponse?.errors) {
              Object.keys(errorResponse.errors).forEach(field => {
                formik.setFieldError(field, errorResponse.errors[field]);
              });
            }
          }
        );
      } else {
        await execute(
          createPatient,
          [formattedValues],
          (response) => {
            const message = response?.message || 'Patient registered successfully';
            setAlertMessage(message);
            setAlertSeverity('success');
            setAlertOpen(true);
            
            setTimeout(() => {
              if (response?.data?.id) {
                navigate(`/patients/${response.data.id}`);
              } else {
                navigate('/patients');
              }
            }, 1500);
          },
          (error, errorMessage) => {
            setAlertMessage(errorMessage);
            setAlertSeverity('error');
            setAlertOpen(true);
            
            const errorResponse = error.response?.data;
            if (errorResponse?.errors) {
              Object.keys(errorResponse.errors).forEach(field => {
                formik.setFieldError(field, errorResponse.errors[field]);
              });
            }
          }
        );
      }
    } catch (err) {
      console.error('Form submission error:', err);
      
      const errorMessage = err.response?.data?.message || 'An unexpected error occurred. Please try again.';
      setAlertMessage(errorMessage);
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  }

  // Handle form submission - prevent submission until final step
  const handleFormSubmit = (e) => {
    if (activeStep < STEPS.length - 1) {
      e.preventDefault();
      return;
    }
    formik.handleSubmit(e);
  };

  // Navigation handlers
  const handleNext = (e) => {
    if (e) e.preventDefault();
    setActiveStep(prev => prev + 1);
  };

  const handleBack = (e) => {
    if (e) e.preventDefault();
    setActiveStep(prev => prev - 1);
  };

  const handleCancel = () => {
    if (formik.dirty) {
      setCancelDialogOpen(true);
    } else {
      navigateBack();
    }
  };

  const navigateBack = () => {
    if (isEditMode) {
      navigate(`/patients/${id}`);
    } else {
      navigate('/patients');
    }
  };

  const handleAlertClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setAlertOpen(false);
  };

  return (
    <MainLayout 
      title={isEditMode ? "Edit Patient" : "Register New Patient"}
      breadcrumbs={[
        { name: 'Patients', path: '/patients' },
        { name: isEditMode ? 'Edit Patient' : 'Register New Patient', active: true }
      ]}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton color="inherit" onClick={handleCancel} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            {isEditMode ? 'Edit Patient Information' : 'Register New Patient'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleFormSubmit}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {STEPS.map((label, index) => (
                <Step key={label} completed={Boolean(isStepComplete(index, formik))}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mb: 3 }}>
              {renderStepContent(activeStep, formik, { ...locationData, handleStateChange })}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
                type="button"
              >
                Back
              </Button>
              
              <Box>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancel}
                  startIcon={<CancelIcon />}
                  sx={{ mr: 1 }}
                  type="button"
                >
                  Cancel
                </Button>
                
                {activeStep < STEPS.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    disabled={!isStepComplete(activeStep, formik)}
                    type="button"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={!canSubmit(formik)}
                  >
                    {isEditMode ? 'Update Patient' : 'Register Patient'}
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        )}
      </Paper>

      {/* Cancellation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes. Are you sure you want to discard these changes?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            No, Continue Editing
          </Button>
          <Button onClick={navigateBack} color="error" autoFocus>
            Yes, Discard Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alertSeverity}
          sx={{ width: '100%' }}
          action={
            <IconButton size="small" color="inherit" onClick={handleAlertClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default PatientForm;