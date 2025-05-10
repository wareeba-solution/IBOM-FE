// src/components/patients/MedicalHistoryForm.js
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { useApi } from '../../hooks/useApi';

const MedicalHistoryForm = ({ open, onClose, patientId, onSaved }) => {
  const { loading, error, execute } = useApi();
  const today = new Date();
  
  // Form state
  const [formData, setFormData] = useState({
    condition: '',
    diagnosis_date: today,
    status: 'Ongoing',
    notes: '',
    severity: 'Moderate',
    diagnosed_by: '',
    treatment_history: ''
  });

  // Common medical conditions
  const commonConditions = [
    'Hypertension',
    'Diabetes Mellitus',
    'Asthma',
    'Malaria',
    'Tuberculosis',
    'HIV/AIDS',
    'Heart Disease',
    'Cancer',
    'Sickle Cell Disease',
    'Epilepsy',
    'Arthritis',
    'Peptic Ulcer Disease',
    'Kidney Disease',
    'Hepatitis',
    'Other'
  ];

  // Status options
  const statusOptions = [
    'Ongoing',
    'Resolved',
    'In Remission',
    'Chronic',
    'Acute'
  ];

  // Severity options
  const severityOptions = [
    'Mild',
    'Moderate',
    'Severe',
    'Life-threatening'
  ];

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      diagnosis_date: date
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Format date for API
    const formattedData = {
      ...formData,
      diagnosis_date: format(formData.diagnosis_date, 'yyyy-MM-dd')
    };
    
    // Mock API call for now
    // In a real app, replace with actual API call
    setTimeout(() => {
      onSaved({
        ...formattedData,
        id: Date.now() // Mock ID
      });
      onClose();
    }, 500);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle>Add Medical History</DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="condition-label">Medical Condition</InputLabel>
                <Select
                  labelId="condition-label"
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  label="Medical Condition"
                >
                  {commonConditions.map((condition) => (
                    <MenuItem key={condition} value={condition}>
                      {condition}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Diagnosis Date"
                  value={formData.diagnosis_date}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  maxDate={today}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="severity-label">Severity</InputLabel>
                <Select
                  labelId="severity-label"
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  label="Severity"
                >
                  {severityOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnosed By"
                name="diagnosed_by"
                value={formData.diagnosed_by}
                onChange={handleChange}
                placeholder="Doctor's name or healthcare facility"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Treatment History"
                name="treatment_history"
                value={formData.treatment_history}
                onChange={handleChange}
                multiline
                rows={2}
                placeholder="Previous and current treatments"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Additional details about the condition"
              />
            </Grid>
          </Grid>
        </form>
        
        {error && (
          <Box sx={{ mt: 2, color: 'error.main' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !formData.condition}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Record'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MedicalHistoryForm;