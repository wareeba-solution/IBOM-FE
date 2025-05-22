// src/routes.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ApiConnectionTest from '../components/ApiConnectionTest';

// Layouts
import MainLayout from '../components/common/Layout/MainLayout';
import AdminLayout from '../components/common/Layout/AdminLayout';

// Auth pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Main pages
import Dashboard from '../pages/dashboard/Dashboard';

// Patient pages
import PatientsList from '../pages/patients/PatientsList';
import PatientDetail from '../pages/patients/PatientDetail';
import PatientForm from '../pages/patients/PatientForm';
import PatientVisits from '../pages/patients/PatientVisits';

// Birth pages
import BirthsList from '../pages/births/BirthsList';
import BirthDetail from '../pages/births/BirthDetail';
import BirthForm from '../pages/births/BirthForm';
import BirthStatistics from '../pages/births/BirthStatistics';

// Death pages
import DeathsList from '../pages/deaths/DeathsList';
import DeathDetail from '../pages/deaths/DeathDetail';
import DeathForm from '../pages/deaths/DeathForm';
import DeathStatistics from '../pages/deaths/DeathStatistics';

// Immunization pages
import ImmunizationList from '../pages/immunization/ImmunizationList';
import ImmunizationDetail from '../pages/immunization/ImmunizationDetail';
import ImmunizationForm from '../pages/immunization/ImmunizationForm';
import ImmunizationStatistics from '../pages/immunization/ImmunizationStatistics';

// Antenatal pages
import AntenatalList from '../pages/antenatal/AntenatalList';
import AntenatalDetail from '../pages/antenatal/AntenatalDetail';
import AntenatalForm from '../pages/antenatal/AntenatalForm';
import AntenatalStatistics from '../pages/antenatal/AntenatalStatistics';

// Disease pages
import DiseaseList from '../pages/diseases/DiseaseList';
import DiseaseDetail from '../pages/diseases/DiseaseDetail';
import DiseaseForm from '../pages/diseases/DiseaseForm';
import DiseaseStatistics from '../pages/diseases/DiseaseStatistics';

// Facility pages
import FacilitiesList from '../pages/facilities/FacilitiesList';
import FacilityDetail from '../pages/facilities/FacilityDetail';
import FacilityForm from '../pages/facilities/FacilityForm';
import FacilityStatistics from '../pages/facilities/FacilityStatistics';
import FacilityMap from '../pages/facilities/FacilityMap';

// Report pages
import CustomReports from '../pages/reports/CustomReports';
import ExportData from '../pages/reports/ExportData';
import GeneralStatistics from '../pages/reports/GeneralStatistics';

// Family planning pages
import FamilyPlanningList from '../pages/familyPlanning/FamilyPlanningList';
import FamilyPlanningDetail from '../pages/familyPlanning/FamilyPlanningDetail';
import FamilyPlanningForm from '../pages/familyPlanning/FamilyPlanningForm';
import FamilyPlanningStatistics from '../pages/familyPlanning/FamilyPlanningStatistics';

// Settings pages
import Settings from '../pages/settings';
import UserProfile from '../pages/settings/UserProfile';
import Preferences from '../pages/settings/Preferences';
import Security from '../pages/settings/Security';

// Admin pages
import AdminPage from '../pages/admin/AdminPage';
import UserManagement from '../pages/admin/UserManagement';
import RoleManagement from '../pages/admin/RoleManagement';
import AuditLogs from '../pages/admin/AuditLogs';
import SystemSettings from '../pages/admin/SystemSettings';

// Private route guard
import PrivateRoute from './PrivateRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes with main layout */}
      <Route path="/" element={
        <PrivateRoute />
         
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Add this route for API testing */}
  <Route path="api-test" element={<ApiConnectionTest />} />

        {/* Patient routes */}
        <Route path="patients" element={<PatientsList />} />
        <Route path="patients/new" element={<PatientForm />} />
        <Route path="patients/:id" element={<PatientDetail />} />
        <Route path="patients/:id/edit" element={<PatientForm />} />
        <Route path="patients/:id/visits" element={<PatientVisits />} />

        {/* Birth routes */}
        <Route path="births" element={<BirthsList />} />
        <Route path="births/new" element={<BirthForm />} />
        <Route path="births/:id" element={<BirthDetail />} />
        <Route path="births/:id/edit" element={<BirthForm />} />
        <Route path="births/statistics" element={<BirthStatistics />} />

        {/* Death routes */}
        <Route path="deaths" element={<DeathsList />} />
        <Route path="deaths/new" element={<DeathForm />} />
        <Route path="deaths/:id" element={<DeathDetail />} />
        <Route path="deaths/:id/edit" element={<DeathForm />} />
        <Route path="deaths/statistics" element={<DeathStatistics />} />

        {/* Immunization routes */}
        <Route path="immunizations" element={<ImmunizationList />} />
        <Route path="immunizations/new" element={<ImmunizationForm />} />
        <Route path="immunizations/:id" element={<ImmunizationDetail />} />
        <Route path="immunizations/:id/edit" element={<ImmunizationForm />} />
        <Route path="immunizations/statistics" element={<ImmunizationStatistics />} />

        {/* Antenatal routes */}
        <Route path="antenatal" element={<AntenatalList />} />
        <Route path="antenatal/new" element={<AntenatalForm />} />
        <Route path="antenatal/:id" element={<AntenatalDetail />} />
        <Route path="antenatal/:id/edit" element={<AntenatalForm />} />
        <Route path="antenatal/statistics" element={<AntenatalStatistics />} />

        {/* Disease routes */}
        <Route path="diseases" element={<DiseaseList />} />
        <Route path="diseases/new" element={<DiseaseForm />} />
        <Route path="diseases/:id" element={<DiseaseDetail />} />
        <Route path="diseases/:id/edit" element={<DiseaseForm />} />
        <Route path="diseases/statistics" element={<DiseaseStatistics />} />

        {/* Facility routes */}
        <Route path="facilities" element={<FacilitiesList />} />
        <Route path="facilities/new" element={<FacilityForm />} />
        <Route path="facilities/map" element={<FacilityMap />} />
        <Route path="facilities/statistics" element={<FacilityStatistics />} />
        <Route path="facilities/:id" element={<FacilityDetail />} />
        <Route path="facilities/:id/edit" element={<FacilityForm />} />

        {/* Report routes */}
        <Route path="reports" element={<CustomReports />} />
        <Route path="reports/new" element={<div>New Report</div>} />
        <Route path="reports/:id" element={<div>Report Detail</div>} />
        <Route path="reports/:id/edit" element={<div>Edit Report</div>} />

        {/* Family planning routes */}
        <Route path="family-planning" element={<FamilyPlanningList />} />
        <Route path="family-planning/new" element={<FamilyPlanningForm />} />
        <Route path="family-planning/:id" element={<FamilyPlanningDetail />} />
        <Route path="family-planning/:id/edit" element={<FamilyPlanningForm />} />
        <Route path="family-planning/statistics" element={<FamilyPlanningStatistics />} />

        {/* Settings routes */}
          <Route path="settings" element={<Settings />} />
          <Route path="settings/profile" element={<UserProfile />} />
          <Route path="settings/preferences" element={<Preferences />} />
          <Route path="settings/security" element={<Security />} />

        {/* Report routes */}
        <Route path="reports/export-data" element={<ExportData />} />
        <Route path="reports/general-statistics" element={<GeneralStatistics />} />
        <Route path="reports/custom-reports" element={<CustomReports />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={
        <PrivateRoute requiredRole="admin">
          <AdminLayout />
        </PrivateRoute>
      }>
        <Route index element={<AdminPage />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="roles" element={<RoleManagement />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="settings" element={<SystemSettings />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;