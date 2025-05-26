// src/pages/patients/components/PersonalInfoStep.js
import React from 'react';
import { 
  Grid, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  InputAdornment
} from '@mui/material';
import DateRangeIcon from '@mui/icons-material/DateRange';import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const PersonalInfoStep = ({ formik }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          id="firstName"
          name="firstName"
          label="First Name *"
          value={formik.values.firstName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.firstName && Boolean(formik.errors.firstName)}
          helperText={formik.touched.firstName && formik.errors.firstName}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          id="lastName"
          name="lastName"
          label="Last Name *"
          value={formik.values.lastName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.lastName && Boolean(formik.errors.lastName)}
          helperText={formik.touched.lastName && formik.errors.lastName}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          id="otherNames"
          name="otherNames"
          label="Other Names"
          value={formik.values.otherNames}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl 
          fullWidth
          error={formik.touched.gender && Boolean(formik.errors.gender)}
        >
          <InputLabel id="gender-label">Gender *</InputLabel>
          <Select
            labelId="gender-label"
            id="gender"
            name="gender"
            value={formik.values.gender}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            label="Gender *"
          >
            <MenuItem value="">
              <em>Select Gender</em>
            </MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
          </Select>
          {formik.touched.gender && formik.errors.gender && (
            <FormHelperText>{formik.errors.gender}</FormHelperText>
          )}
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Date of Birth *"
            value={formik.values.dateOfBirth}
            onChange={(date) => formik.setFieldValue('dateOfBirth', date)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                name="dateOfBirth"
                onBlur={formik.handleBlur}
                error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <DateRangeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </LocalizationProvider>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel id="marital-status-label">Marital Status</InputLabel>
          <Select
            labelId="marital-status-label"
            id="maritalStatus"
            name="maritalStatus"
            value={formik.values.maritalStatus}
            onChange={formik.handleChange}
            label="Marital Status"
          >
            <MenuItem value="">
              <em>Select Status</em>
            </MenuItem>
            <MenuItem value="single">Single</MenuItem>
            <MenuItem value="married">Married</MenuItem>
            <MenuItem value="divorced">Divorced</MenuItem>
            <MenuItem value="widowed">Widowed</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="occupation"
          name="occupation"
          label="Occupation"
          value={formik.values.occupation}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </Grid>
      <Grid item xs={12}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Registration Date *"
            value={formik.values.registrationDate}
            onChange={(date) => formik.setFieldValue('registrationDate', date)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                name="registrationDate"
                onBlur={formik.handleBlur}
                error={formik.touched.registrationDate && Boolean(formik.errors.registrationDate)}
                helperText={formik.touched.registrationDate && formik.errors.registrationDate}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <DateRangeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </LocalizationProvider>
      </Grid>
    </Grid>
  );
};

export default PersonalInfoStep;