// src/pages/patients/PatientFormSchema.js
import * as Yup from 'yup';

// Patient form validation schema - removed backend-controlled fields
export const patientValidationSchema = Yup.object({
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  otherNames: Yup.string()
    .nullable(),
  gender: Yup.string()
    .required('Gender is required'),
  dateOfBirth: Yup.date()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future'),
  phoneNumber: Yup.string()
    .matches(/^[0-9+\s()-]{10,15}$/, 'Invalid phone number format')
    .nullable(),
  address: Yup.string()
    .required('Address is required'),
  city: Yup.string()
    .required('City is required'),
  state: Yup.string()
    .required('State is required'),
  lgaResidence: Yup.string()
    .required('LGA Residence is required'),
  // lgaOrigin, postalCode, etc. can be left as optional or removed if not needed
  email: Yup.string()
    .email('Invalid email format')
    .nullable(),
  bloodGroup: Yup.string()
    .nullable(),
  genotype: Yup.string()
    .nullable(),
  maritalStatus: Yup.string()
    .required('Marital status is required'),
  occupation: Yup.string()
    .required('Occupation is required'),
  emergencyContactRelationship: Yup.string()
    .nullable(),
  emergencyContactName: Yup.string()
    .nullable(),
  emergencyContactPhone: Yup.string()
    .matches(/^[0-9+\s()-]{10,15}$/, 'Invalid phone number format')
    .nullable(),
  emergencyContactAddress: Yup.string()
    .nullable(),
  allergies: Yup.string()
    .nullable(),
  chronicConditions: Yup.string()
    .nullable(),
  medicalNotes: Yup.string()
    .nullable(),
});

// Patient form initial values - removed backend-controlled fields
export const initialPatientValues = {
  firstName: '',
  lastName: '',
  otherNames: '',
  gender: '',
  dateOfBirth: null,
  phoneNumber: '',
  address: '',
  city: '',
  lgaResidence: '',
  state: '',
  email: '',
  bloodGroup: '',
  genotype: '',
  maritalStatus: '',
  occupation: '',
  medicalNotes: '',
  status: 'active',
  emergencyContactName: '',
  emergencyContactRelationship: '',
  emergencyContactPhone: '',
  emergencyContactAddress: '',
  allergies: '',
  chronicConditions: '',
  // ❌ Removed: facilityId - backend gets from user
  // ❌ Removed: registrationDate - backend sets current date
};