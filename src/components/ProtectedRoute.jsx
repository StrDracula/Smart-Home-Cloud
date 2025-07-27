import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole, loading } = useAuth();
  const params = useParams();
  
  // If requiredRole is not provided, use the role from URL params (if available)
  const roleToCheck = requiredRole || params.role;

  if (loading) {
    // You could show a loading spinner here
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    // Redirect to homepage if not authenticated
    return <Navigate to="/" />;
  }

  // If a specific role is required and the user doesn't have it
  if (roleToCheck && userRole !== roleToCheck) {
    // Redirect to a permission denied page or their appropriate dashboard
    return <Navigate to={`/dashboard/${userRole}`} />;
  }

  return children;
};

export default ProtectedRoute;