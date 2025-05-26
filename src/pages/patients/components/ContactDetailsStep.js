// src/pages/patients/components/ContactDetailsStep.js
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

const ContactDetailsStep = ({ 
  formik, 
  statesList = [], 
  lgaOriginList = [], 
  lgaResidenceList = [], 
  handleStateChange
  // Removed: facilities prop - backend handles facilityId
}) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="phoneNumber"
          name="phoneNumber"
          label="Phone Number"
          value={formik.values.phoneNumber || ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
          helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email"
          type="email"
          value={formik.values.email || ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="address"
          name="address"
          label="Address *"
          multiline
          rows={2}
          value={formik.values.address || ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.address && Boolean(formik.errors.address)}
          helperText={formik.touched.address && formik.errors.address}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          id="city"
          name="city"
          label="City/Town *"
          value={formik.values.city || ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.city && Boolean(formik.errors.city)}
          helperText={formik.touched.city && formik.errors.city}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl 
          fullWidth
          error={formik.touched.state && Boolean(formik.errors.state)}
        >
          <InputLabel id="state-label">State *</InputLabel>
          <Select
            labelId="state-label"
            id="state"
            name="state"
            value={formik.values.state || ''}
            onChange={handleStateChange || formik.handleChange}
            onBlur={formik.handleBlur}
            label="State *"
          >
            <MenuItem value="">Select State</MenuItem>
            {Array.isArray(statesList) && statesList.length > 0 ? (
              statesList.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>No states available</MenuItem>
            )}
          </Select>
          {formik.touched.state && formik.errors.state && (
            <FormHelperText>{formik.errors.state}</FormHelperText>
          )}
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          id="postalCode"
          name="postalCode"
          label="Postal Code"
          value={formik.values.postalCode || ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.postalCode && Boolean(formik.errors.postalCode)}
          helperText={formik.touched.postalCode && formik.errors.postalCode}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl 
          fullWidth
          error={formik.touched.lgaOrigin && Boolean(formik.errors.lgaOrigin)}
        >
          <InputLabel id="lgaOrigin-label">LGA Origin *</InputLabel>
          <Select
            labelId="lgaOrigin-label"
            id="lgaOrigin"
            name="lgaOrigin"
            value={formik.values.lgaOrigin || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            label="LGA Origin *"
          >
            <MenuItem value="">Select LGA of Origin</MenuItem>
            {Array.isArray(lgaOriginList) && lgaOriginList.length > 0 ? (
              lgaOriginList.map((lga) => (
                <MenuItem key={lga} value={lga}>
                  {lga}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>No LGAs available</MenuItem>
            )}
          </Select>
          {formik.touched.lgaOrigin && formik.errors.lgaOrigin && (
            <FormHelperText>{formik.errors.lgaOrigin}</FormHelperText>
          )}
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl 
          fullWidth
          error={formik.touched.lgaResidence && Boolean(formik.errors.lgaResidence)}
        >
          <InputLabel id="lgaResidence-label">LGA Residence *</InputLabel>
          <Select
            labelId="lgaResidence-label"
            id="lgaResidence"
            name="lgaResidence"
            value={formik.values.lgaResidence || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            label="LGA Residence *"
            disabled={!formik.values.state} // Only enable if state is selected
          >
            <MenuItem value="">Select LGA of Residence</MenuItem>
            {Array.isArray(lgaResidenceList) && lgaResidenceList.length > 0 ? (
              lgaResidenceList.map((lga) => (
                <MenuItem key={lga} value={lga}>
                  {lga}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>
                {formik.values.state ? "No LGAs available for this state" : "Select a state first"}
              </MenuItem>
            )}
          </Select>
          {formik.touched.lgaResidence && formik.errors.lgaResidence && (
            <FormHelperText>{formik.errors.lgaResidence}</FormHelperText>
          )}
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default ContactDetailsStep;