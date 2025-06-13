import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientById, updatePatient } from '../../services/patientService';
import PatientForm from './PatientForm'; // Your reusable form component

const PatientEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientById(id).then(response => {
      setInitialValues(response.data.data); // Adjust if your API shape differs
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (values) => {
    await updatePatient(id, values);
    navigate(`/patients/${id}`);
  };

  if (loading || !initialValues) return <div>Loading...</div>;

  return (
    <PatientForm
      initialValues={initialValues}
      onSubmit={handleSubmit}
      isEdit
    />
  );
};

export default PatientEdit;