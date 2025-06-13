// src/pages/patients/PatientFormSteps.js
import React from 'react';
import PersonalInfoStep from './components/PersonalInfoStep';
import ContactDetailsStep from './components/ContactDetailsStep';
import MedicalInfoStep from './components/MedicalInfoStep';
import EmergencyContactStep from './components/EmergencyContactStep';

// Steps validation helpers
export const isStepComplete = (step, formik) => {
  if (step === 0) {
    // Personal Information
    return Boolean(
      formik.values.firstName &&
      formik.values.lastName &&
      formik.values.gender &&
      formik.values.dateOfBirth &&
      !formik.errors.firstName &&
      !formik.errors.lastName &&
      !formik.errors.gender &&
      !formik.errors.dateOfBirth
    );
  } else if (step === 1) {
    // Contact Details - removed facilityId requirement
    return Boolean(
      formik.values.address &&
      formik.values.city &&
      formik.values.state &&
      formik.values.lgaResidence && // <-- keep only lgaResidence
      !formik.errors.address &&
      !formik.errors.city &&
      !formik.errors.state &&
      !formik.errors.lgaResidence && // <-- keep only lgaResidence
      !formik.errors.phoneNumber &&
      !formik.errors.email
    );
  } else if (step === 2) {
    // Medical Information - Optional fields, but check for errors
    return Boolean(
      !formik.errors.bloodGroup &&
      !formik.errors.genotype &&
      !formik.errors.medicalNotes &&
      !formik.errors.status
    );
  } else if (step === 3) {
    // Emergency Contact - Optional fields, but check for errors
    return Boolean(
      !formik.errors.emergencyContactName &&
      !formik.errors.emergencyContactRelationship &&
      !formik.errors.emergencyContactPhone
    );
  }
  
  return false;
};

// Check if the form can be submitted - removed facilityId requirement
export const canSubmit = (formik) => {
  console.log('canSubmit check:', {
    firstName: formik.values.firstName,
    lastName: formik.values.lastName,
    gender: formik.values.gender,
    dateOfBirth: formik.values.dateOfBirth,
    address: formik.values.address,
    city: formik.values.city,
    state: formik.values.state,
    lgaResidence: formik.values.lgaResidence,
    errors: Object.keys(formik.errors),
    errorsCount: Object.keys(formik.errors).length
  });
  
  return (
    formik.values.firstName &&
    formik.values.lastName &&
    formik.values.gender &&
    formik.values.dateOfBirth &&
    formik.values.address &&
    formik.values.city &&
    formik.values.state &&
    formik.values.lgaResidence && // <-- keep only lgaResidence
    Object.keys(formik.errors).length === 0
  );
};

// Step definitions
export const STEPS = [
  'Personal Information', 
  'Contact Details', 
  'Medical Information', 
  'Emergency Contact'
];

// Render step content based on active step - removed facilities parameter
export const renderStepContent = (step, formik, locationData) => {
  // Extract the needed data and functions from locationData
  const { 
    statesList, 
    allLGAs, 
    stateLGAs, 
    handleStateChange 
  } = locationData;

  switch (step) {
    case 0:
      return <PersonalInfoStep formik={formik} />;
    case 1:
      return (
        <ContactDetailsStep 
          formik={formik} 
          statesList={statesList}
          lgaOriginList={allLGAs}
          lgaResidenceList={stateLGAs}
          handleStateChange={handleStateChange}
          // Removed facilities prop - backend handles facilityId
        />
      );
    case 2:
      return <MedicalInfoStep formik={formik} />;
    case 3:
      return <EmergencyContactStep formik={formik} />;
    default:
      return null;
  }
};