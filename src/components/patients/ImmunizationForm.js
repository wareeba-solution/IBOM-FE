// src/components/patients/ImmunizationForm.js
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
  Divider
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addMonths, addYears } from 'date-fns';
import { useApi } from '../../hooks/useApi';

const ImmunizationForm = ({ open, onClose, patientId, onSaved }) => {
  const { loading, error, execute } = useApi();
  const today = new Date();
  
  // Form state
  const [formData, setFormData] = useState({
    vaccine: '',
    date_administered: today,
    administered_by: '',
    batch_number: '',
    dose_number: 1,
    next_due_date: null,
    site: 'Left Arm',
    route: 'Intramuscular',
    adverse_reaction: false,
    reaction_details: '',
    notes: ''
  });

  // Common vaccines
  const vaccines = [
    { name: 'BCG', interval: null },
    { name: 'OPV', interval: 4 }, // 4 months
    { name: 'Pentavalent', interval: 2 }, // 2 months
    { name: 'PCV', interval: 2 },
    { name: 'Rotavirus', interval: 2 },
    { name: 'Measles', interval: null },
    { name: 'Yellow Fever', interval: null },
    { name: 'Meningococcal', interval: null },
    { name: 'HPV', interval: 6 },
    { name: 'Hepatitis B', interval: 6 },
    { name: 'Tetanus Toxoid', interval: 60 }, // 5 years
    { name: 'COVID-19', interval: 6 },
    { name: 'Influenza', interval: 12 }, // yearly
    { name: 'Other', interval: null }
  ];

  // Administration sites
  const sites = [
    'Left Arm',
    'Right Arm',
    'Left Thigh',
    'Right Thigh',
    'Left Buttock',
    'Right Buttock',
    'Oral',
    'Intranasal',
    'Other'
  ];

  // Administration routes
  const routes = [
    'Intramuscular',
    'Subcutaneous',
    'Intradermal',
    'Oral',
    'Intranasal',
    'Other'
  ];

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // If vaccine changes, update next due date based on vaccine interval
    if (name === 'vaccine') {
      updateNextDueDate(value);
    }
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
      date_administered: date
    });
    
    // Update next due date when administration date changes
    if (formData.vaccine) {
      updateNextDueDate(formData.vaccine, date);
    }
  };

  // Handle next due date change
  const handleNextDueDateChange = (date) => {
    setFormData({
      ...formData,
      next_due_date: date
    });
  };

  // Update next due date based on vaccine
  const updateNextDueDate = (vaccineName, administrationDate = formData.date_administered) => {
    const vaccine = vaccines.find(v => v.name === vaccineName);
    
    if (vaccine && vaccine.interval) {
      // If interval is in years (e.g., 5 years for Tetanus = 60 months)
      if (vaccine.interval >= 12) {
        const years = Math.floor(vaccine.interval / 12);
        setFormData(prev => ({
          ...prev,
          next_due_date: addYears(administrationDate, years)
        }));
      } else {
        // If interval is in months
        setFormData(prev => ({
          ...prev,
          next_due_date: addMonths(administrationDate, vaccine.interval)
        }));
      }
    } else {
      // No next due date for one-time vaccines
      setFormData(prev => ({
        ...prev,
        next_due_date: null
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Format dates for API
    const formattedData = {
      ...formData,
      date_administered: format(formData.date_administered, 'yyyy-MM-dd'),
      next_due_date: formData.next_due_date ? format(formData.next_due_date, 'yyyy-MM-dd') : null
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
      <DialogTitle>Record Immunization</DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="vaccine-label">Vaccine</InputLabel>
                <Select
                  labelId="vaccine-label"
                  id="vaccine"
                  name="vaccine"
                  value={formData.vaccine}
                  onChange={handleChange}
                  label="Vaccine"
                >
                  {vaccines.map((vaccine) => (
                    <MenuItem key={vaccine.name} value={vaccine.name}>
                      {vaccine.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date Administered"
                  value={formData.date_administered}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  maxDate={today}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Administered By"
                name="administered_by"
                value={formData.administered_by}
                onChange={handleChange}
                placeholder="Doctor or nurse name"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Batch Number"
                name="batch_number"
                value={formData.batch_number}
                onChange={handleChange}
                placeholder="Vaccine batch/lot number"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dose Number"
                name="dose_number"
                type="number"
                value={formData.dose_number}
                onChange={handleChange}
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Next Due Date"
                  value={formData.next_due_date}
                  onChange={handleNextDueDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={today}
                  disabled={formData.vaccine && !vaccines.find(v => v.name === formData.vaccine)?.interval}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
                Administration Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="site-label">Administration Site</InputLabel>
                <Select
                  labelId="site-label"
                  id="site"
                  name="site"
                  value={formData.site}
                  onChange={handleChange}
                  label="Administration Site"
                >
                  {sites.map((site) => (
                    <MenuItem key={site} value={site}>
                      {site}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="route-label">Administration Route</InputLabel>
                <Select
                  labelId="route-label"
                  id="route"
                  name="route"
                  value={formData.route}
                  onChange={handleChange}
                  label="Administration Route"
                >
                  {routes.map((route) => (
                    <MenuItem key={route} value={route}>
                      {route}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.adverse_reaction}
                    onChange={handleCheckboxChange}
                    name="adverse_reaction"
                  />
                }
                label="Adverse Reaction Observed"
              />
            </Grid>
            
            {formData.adverse_reaction && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reaction Details"
                  name="reaction_details"
                  value={formData.reaction_details}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  required={formData.adverse_reaction}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={2}
                placeholder="Additional notes or observations"
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
          disabled={loading || !formData.vaccine || !formData.administered_by}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Record'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImmunizationForm;