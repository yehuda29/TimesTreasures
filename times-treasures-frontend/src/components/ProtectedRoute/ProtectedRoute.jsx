// src/components/ProtectedRoute.jsx

import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

// ProtectedRoute is a higher-order component that wraps around routes/components
// which require the user to be authenticated.
const ProtectedRoute = ({ children }) => {
  // Retrieve the current user and loading state from the AuthContext.
  const { user, loading } = useContext(AuthContext);

  // While the authentication status is still loading, display a loading message.
  if (loading) return <div>Loading...</div>;

  // If no user is authenticated, redirect the user to the login page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the user is authenticated, render the child components.
  return children;
};

export default ProtectedRoute;
