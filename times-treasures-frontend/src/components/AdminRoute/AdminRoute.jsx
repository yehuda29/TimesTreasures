// src/components/AdminRoute.jsx

import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
// Import Navigate from react-router-dom to programmatically redirect users
import { Navigate } from 'react-router-dom';

// AdminRoute is a Higher-Order Component (HOC) that protects admin-only routes
const AdminRoute = ({ children }) => {
  // Retrieve the current user and loading state from the AuthContext
  const { user, loading } = useContext(AuthContext);

  // While authentication status is still loading, show a loading message
  if (loading) return <div>Loading...</div>;

  // If there is no user logged in, or the logged-in user is not an admin,
  // redirect them to the homepage (or any other public route)
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // If the user is an admin, render the child components (protected route content)
  return children;
};

export default AdminRoute;
