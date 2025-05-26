// src/pages/patients/components/EmergencyContactStep.js
import React from 'react';
import { Grid, TextField } from '@mui/material';

const EmergencyContactStep = ({ formik }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="emergencyContactName"
          name="emergencyContactName"
          label="Next of Kin Name"
          value={formik.values.emergencyContactName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.emergencyContactName && Boolean(formik.errors.emergencyContactName)}
          helperText={formik.touched.emergencyContactName && formik.errors.emergencyContactName}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="emergencyContactRelationship"
          name="emergencyContactRelationship"
          label="Relationship"
          value={formik.values.emergencyContactRelationship}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.emergencyContactRelationship && Boolean(formik.errors.emergencyContactRelationship)}
          helperText={formik.touched.emergencyContactRelationship && formik.errors.emergencyContactRelationship}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="emergencyContactPhone"
          name="emergencyContactPhone"
          label="Phone Number"
          value={formik.values.emergencyContactPhone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.emergencyContactPhone && Boolean(formik.errors.emergencyContactPhone)}
          helperText={formik.touched.emergencyContactPhone && formik.errors.emergencyContactPhone}
        />
      </Grid>
    </Grid>
  );
};

export default EmergencyContactStep;