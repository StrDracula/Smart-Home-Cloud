import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import './App.css';
import Auth from './components/Auth';
import { AuthProvider } from './components/AuthContext';
import AdminDashboard from './components/dashboards/AdminDashboard';
import FamilyDashboard from './components/dashboards/FamilyDashboard';
import GuestDashboard from './components/dashboards/GuestDashboard';
import HomePage from './components/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import RoleSelection from './components/RoleSelection';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/signup/:role" element={<Auth />} />
          <Route path="/signin/:role" element={<Auth />} />
          
          {/* Protected routes with role requirements */}
          <Route 
            path="/dashboard/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/family" 
            element={
              <ProtectedRoute requiredRole="family">
                <FamilyDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/guest" 
            element={
              <ProtectedRoute requiredRole="guest">
                <GuestDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <ToastContainer />
      </AuthProvider>
    </Router>
  );
}

export default App;