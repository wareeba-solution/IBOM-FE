// src/pages/patients/components/MedicalInfoStep.js
import React from 'react';
import { 
  Grid, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText 
} from '@mui/material';

const MedicalInfoStep = ({ formik }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel id="blood-group-label">Blood Group</InputLabel>
          <Select
            labelId="blood-group-label"
            id="bloodGroup"
            name="bloodGroup"
            value={formik.values.bloodGroup}
            onChange={formik.handleChange}
            label="Blood Group"
          >
            <MenuItem value="">
              <em>Select Blood Group</em>
            </MenuItem>
            <MenuItem value="A+">A+</MenuItem>
            <MenuItem value="A-">A-</MenuItem>
            <MenuItem value="B+">B+</MenuItem>
            <MenuItem value="B-">B-</MenuItem>
            <MenuItem value="AB+">AB+</MenuItem>
            <MenuItem value="AB-">AB-</MenuItem>
            <MenuItem value="O+">O+</MenuItem>
            <MenuItem value="O-">O-</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel id="genotype-label">Genotype</InputLabel>
          <Select
            labelId="genotype-label"
            id="genotype"
            name="genotype"
            value={formik.values.genotype}
            onChange={formik.handleChange}
            label="Genotype"
          >
            <MenuItem value="">
              <em>Select Genotype</em>
            </MenuItem>
            <MenuItem value="AA">AA</MenuItem>
            <MenuItem value="AS">AS</MenuItem>
            <MenuItem value="SS">SS</MenuItem>
            <MenuItem value="AC">AC</MenuItem>
            <MenuItem value="SC">SC</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="medicalNotes"
          name="medicalNotes"
          label="Medical Notes"
          multiline
          rows={4}
          value={formik.values.medicalNotes}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Enter any relevant medical history, allergies, or chronic conditions"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl 
          fullWidth
          error={formik.touched.status && Boolean(formik.errors.status)}
        >
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            id="status"
            name="status"
            value={formik.values.status}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            label="Status"
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
          {formik.touched.status && formik.errors.status && (
            <FormHelperText>{formik.errors.status}</FormHelperText>
          )}
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default MedicalInfoStep;