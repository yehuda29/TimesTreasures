// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Create the Auth Context which will be used by other components
export const AuthContext = createContext();

// AuthProvider wraps your app and provides authentication state and functions to its children
export const AuthProvider = ({ children }) => {
  // 'user' holds the authenticated user's information; initially null (no user logged in)
  const [user, setUser] = useState(null);
  
  // 'token' holds the JWT token; initially, we try to load it from localStorage
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  // 'loading' indicates whether authentication data is being fetched (e.g., on app start)
  const [loading, setLoading] = useState(true);

  // useEffect to fetch the currently logged-in user's info when the token changes
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          // Prepare config with Authorization header using the token
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };

          // Make a request to the auth endpoint to get current user info
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/auth/me`,
            config
          );

          // Assuming the API returns user data in response.data.data
          setUser(response.data.data);
        } catch (err) {
          console.error(err);
          // If there's an error (e.g., token invalid), clear user and token
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          toast.error('Authentication failed. Please log in again.');
        }
      }
      // Set loading to false after attempting to fetch user data
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  // login function: attempts to log in a user given email and password
  const login = async (email, password) => {
    // Make a POST request to the login endpoint
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/login`,
      { email, password }
    );
    // Destructure token and user data from the response
    const { token: receivedToken, data } = response.data;
    // Save token and user in state
    setToken(receivedToken);
    setUser(data);
    // Persist the token to localStorage
    localStorage.setItem('token', receivedToken);
  };

  // register function: attempts to create a new user account
  const register = async (name, email, password) => {
    // Make a POST request to the registration endpoint
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/register`,
      { name, email, password }
    );
    // Destructure token and user data from the response
    const { token: receivedToken, data } = response.data;
    // Save token and user in state
    setToken(receivedToken);
    setUser(data);
    // Persist the token to localStorage
    localStorage.setItem('token', receivedToken);
  };

  // logout function: logs out the user by clearing user and token from state and localStorage
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  };

  // The AuthContext.Provider makes the authentication data and functions
  // (user, token, login, register, logout, and loading) available to all child components.
  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
