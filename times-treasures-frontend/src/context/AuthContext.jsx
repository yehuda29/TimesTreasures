import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Create the Auth Context to share auth-related data and functions across the app
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // State for the authenticated user, JWT token, and a loading flag
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Fetch the current user info whenever the token changes
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/auth/me`,
            config
          );
          setUser(response.data.data);
        } catch (err) {
          console.error(err);
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          toast.error('Authentication failed. Please log in again.');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  // Login function remains unchanged
  const login = async (email, password) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/login`,
      { email, password }
    );
    const { token: receivedToken, data } = response.data;
    setToken(receivedToken);
    setUser(data);
    localStorage.setItem('token', receivedToken);
  };

  // Updated register function to accept additional fields:
  // name, familyName, birthDate, sex, email, and password
  const register = async (name, familyName, birthDate, sex, email, password, phoneNumber) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/register`,
      { name, familyName, birthDate, sex, email, password, phoneNumber }
    );
    const { token: receivedToken, data } = response.data;
    setToken(receivedToken);
    setUser(data);
    localStorage.setItem('token', receivedToken);
  };

  // Logout clears user and token from state and localStorage
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
