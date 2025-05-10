// src/components/patients/AntenatalForm.js
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
  Checkbox,
  Typography,
  Box,
  CircularProgress,
  Divider,
  RadioGroup,
  Radio
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, differenceInWeeks } from 'date-fns';
import { useApi } from '../../hooks/useApi';

const AntenatalForm = ({ open, onClose, patientId, patient, onSaved }) => {
  const { loading, error, execute } = useApi();
  const today = new Date();
  
  // Form state
  const [formData, setFormData] = useState({
    visit_date: today,
    visit_number: 1,
    last_menstrual_period: new Date(today.getFullYear(), today.getMonth() - 2, today.getDate()),
    gestational_age: '8 weeks', // Will be calculated
    weight: '',
    blood_pressure: '',
    fetal_heart_rate: '',
    fundal_height: '',
    presentation: 'Cephalic',
    urinalysis_results: '',
    hemoglobin_level: '',
    blood_sugar: '',
    high_risk_factors: false,
    risk_details: '',
    interventions: '',
    medications_prescribed: '',
    advice_given: '',
    next_appointment: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14), // Default 2 weeks
    notes: ''
  });

  // Calculate gestational age based on LMP
  const calculateGestationalAge = (lmp) => {
    const weeks = differenceInWeeks(today, lmp);
    return `${weeks} weeks`;
  };

  // Initialize with calculated gestational age
  useState(() => {
    setFormData(prev => ({
      ...prev,
      gestational_age: calculateGestationalAge(prev.last_menstrual_period)
    }));
  }, []);

  // Presentation options
  const presentationOptions = [
    'Cephalic',
    'Breech',
    'Transverse',
    'Oblique',
    'Not Determined'
  ];

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      visit_date: date
    });
  };

  // Handle LMP date change and update gestational age
  const handleLMPChange = (date) => {
    const gestAge = calculateGestationalAge(date);
    setFormData({
      ...formData,
      last_menstrual_period: date,
      gestational_age: gestAge
    });
  };

  // Handle next appointment date change
  const handleNextAppointmentChange = (date) => {
    setFormData({
      ...formData,
      next_appointment: date
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Format dates for API
    const formattedData = {
      ...formData,
      visit_date: format(formData.visit_date, 'yyyy-MM-dd'),
      last_menstrual_period: format(formData.last_menstrual_period, 'yyyy-MM-dd'),
      next_appointment: format(formData.next_appointment, 'yyyy-MM-dd')
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
      <DialogTitle>Record Antenatal Visit</DialogTitle>
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
              <TextField
                fullWidth
                label="Visit Number"
                name="visit_number"
                type="number"
                value={formData.visit_number}
                onChange={handleChange}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
                Pregnancy Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Last Menstrual Period (LMP)"
                  value={formData.last_menstrual_period}
                  onChange={handleLMPChange}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  maxDate={today}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Gestational Age"
                value={formData.gestational_age}
                InputProps={{
                  readOnly: true,
                }}
                helperText="Calculated based on LMP"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
                Examination Results
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: <Typography variant="caption">kg</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Blood Pressure"
                name="blood_pressure"
                value={formData.blood_pressure}
                onChange={handleChange}
                required
                placeholder="e.g., 120/80"
                InputProps={{
                  endAdornment: <Typography variant="caption">mmHg</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Fetal Heart Rate"
                name="fetal_heart_rate"
                value={formData.fetal_heart_rate}
                onChange={handleChange}
                placeholder="e.g., 140"
                InputProps={{
                  endAdornment: <Typography variant="caption">bpm</Typography>
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fundal Height"
                name="fundal_height"
                value={formData.fundal_height}
                onChange={handleChange}
                placeholder="e.g., 20"
                InputProps={{
                  endAdornment: <Typography variant="caption">cm</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="presentation-label">Fetal Presentation</InputLabel>
                <Select
                  labelId="presentation-label"
                  id="presentation"
                  name="presentation"
                  value={formData.presentation}
                  onChange={handleChange}
                  label="Fetal Presentation"
                >
                  {presentationOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
                Laboratory Tests
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Urinalysis Results"
                name="urinalysis_results"
                value={formData.urinalysis_results}
                onChange={handleChange}
                placeholder="e.g., Normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Hemoglobin Level"
                name="hemoglobin_level"
                value={formData.hemoglobin_level}
                onChange={handleChange}
                placeholder="e.g., 12.5"
                InputProps={{
                  endAdornment: <Typography variant="caption">g/dL</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Blood Sugar"
                name="blood_sugar"
                value={formData.blood_sugar}
                onChange={handleChange}
                placeholder="e.g., 5.2"
                InputProps={{
                  endAdornment: <Typography variant="caption">mmol/L</Typography>
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
                Risk Assessment and Plan
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.high_risk_factors}
                    onChange={handleCheckboxChange}
                    name="high_risk_factors"
                  />
                }
                label="High Risk Pregnancy Factors Identified"
              />
            </Grid>
            
            {formData.high_risk_factors && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Risk Details"
                  name="risk_details"
                  value={formData.risk_details}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  required={formData.high_risk_factors}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Interventions"
                name="interventions"
                value={formData.interventions}
                onChange={handleChange}
                placeholder="Interventions performed during this visit"
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medications Prescribed"
                name="medications_prescribed"
                value={formData.medications_prescribed}
                onChange={handleChange}
                placeholder="Medicines prescribed, if any"
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Advice Given"
                name="advice_given"
                value={formData.advice_given}
                onChange={handleChange}
                placeholder="Counseling and advice provided"
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Next Appointment"
                  value={formData.next_appointment}
                  onChange={handleNextAppointmentChange}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  minDate={today}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Any other observations or comments"
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
          disabled={loading || !formData.blood_pressure || !formData.weight}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Record'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AntenatalForm;