// src/pages/Login/Login.jsx

import React, { useState, useContext } from 'react';

import { AuthContext } from '../../context/AuthContext';
// Import toast from react-toastify for displaying notifications
import { toast } from 'react-toastify';
// Import useNavigate for programmatic navigation and Link for links
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css';

const Login = () => {
  // Extract the 'login' function from AuthContext
  const { login } = useContext(AuthContext);
  // useNavigate hook allows redirecting after login
  const navigate = useNavigate();

  // State for form inputs: email and password
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Destructure formData for easier access
  const { email, password } = formData;

  // onChange handler updates the formData state as the user types
  const onChange = e => 
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // onSubmit handler for the login form
  const onSubmit = async e => {
    e.preventDefault(); // Prevent the default form submission behavior
    try {
      // Call the login function from AuthContext with email and password
      await login(email, password);
      // Show a success notification if login is successful
      toast.success('Login successful');
      // Navigate to the home page after successful login
      navigate('/');
    } catch (err) {
      // Log any error to the console for debugging
      console.error(err);
      // Display an error notification to the user
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* Heading for the login page */}
      <h2>Login</h2>
      {/* Login form */}
      <form onSubmit={onSubmit} className={styles.loginForm}>
        {/* Form group for email input */}
        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        {/* Form group for password input */}
        <div className={styles.formGroup}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
          />
        </div>
        {/* Submit button */}
        <button type="submit" className={styles.loginBtn}>Login</button>
      </form>
      {/* Link to the registration page */}
      <p className={styles.registerMsg}>
        Don't have an account? <Link to="/register">Register Here</Link>
      </p>
    </div>
  );
};

export default Login;
