// src/components/patients/VisitForm.js
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
  Typography,
  Divider,
  Box,
  CircularProgress
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/patientService';

const VisitForm = ({ open, onClose, patientId, onSaved }) => {
  const { loading, error, execute } = useApi();
  const today = new Date();
  
  // Form state
  const [formData, setFormData] = useState({
    visit_date: today,
    purpose: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    vital_signs: {
      temperature: '',
      blood_pressure: '',
      pulse: '',
      respiratory_rate: '',
      weight: '',
      height: ''
    }
  });

  // Visit purpose options
  const purposeOptions = [
    'Routine Checkup',
    'Illness',
    'Follow-up',
    'Vaccination',
    'Prenatal',
    'Postnatal',
    'Emergency',
    'Surgical',
    'Consultation',
    'Other'
  ];

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle vital signs changes
  const handleVitalSignChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      vital_signs: {
        ...formData.vital_signs,
        [name]: value
      }
    });
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      visit_date: date
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Format date for API
    const formattedData = {
      ...formData,
      visit_date: format(formData.visit_date, 'yyyy-MM-dd')
    };
    
    await execute(
      patientService.createPatientVisit,
      [patientId, formattedData],
      (response) => {
        onSaved(response);
        onClose();
      }
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle>Record New Visit</DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Visit Date"
                  value={formData.visit_date}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  maxDate={today}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="purpose-label">Visit Purpose</InputLabel>
                <Select
                  labelId="purpose-label"
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  label="Visit Purpose"
                >
                  {purposeOptions.map((option) => (
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
                label="Diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Treatment"
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                multiline
                rows={2}
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
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 2 }}>
                Vital Signs
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Temperature (°C)"
                    name="temperature"
                    value={formData.vital_signs.temperature}
                    onChange={handleVitalSignChange}
                    placeholder="e.g., 36.8"
                    InputProps={{
                      endAdornment: <Typography variant="caption">°C</Typography>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Blood Pressure"
                    name="blood_pressure"
                    value={formData.vital_signs.blood_pressure}
                    onChange={handleVitalSignChange}
                    placeholder="e.g., 120/80"
                    InputProps={{
                      endAdornment: <Typography variant="caption">mmHg</Typography>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Pulse"
                    name="pulse"
                    value={formData.vital_signs.pulse}
                    onChange={handleVitalSignChange}
                    placeholder="e.g., 75"
                    InputProps={{
                      endAdornment: <Typography variant="caption">bpm</Typography>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Respiratory Rate"
                    name="respiratory_rate"
                    value={formData.vital_signs.respiratory_rate}
                    onChange={handleVitalSignChange}
                    placeholder="e.g., 18"
                    InputProps={{
                      endAdornment: <Typography variant="caption">breaths/min</Typography>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Weight"
                    name="weight"
                    value={formData.vital_signs.weight}
                    onChange={handleVitalSignChange}
                    placeholder="e.g., 70"
                    InputProps={{
                      endAdornment: <Typography variant="caption">kg</Typography>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Height"
                    name="height"
                    value={formData.vital_signs.height}
                    onChange={handleVitalSignChange}
                    placeholder="e.g., 175"
                    InputProps={{
                      endAdornment: <Typography variant="caption">cm</Typography>
                    }}
                  />
                </Grid>
              </Grid>
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
          disabled={loading || !formData.purpose}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Visit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VisitForm;