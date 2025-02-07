// src/pages/Register/Register.jsx

import React, { useState, useContext } from 'react';
// Import AuthContext to access authentication functions (e.g., register)
import { AuthContext } from '../../context/AuthContext';
// Import toast for displaying notifications
import { toast } from 'react-toastify';
// Import useNavigate for programmatic navigation and Link for routing links
import { useNavigate, Link } from 'react-router-dom';
// Import CSS module for styling the register page
import styles from './Register.module.css'; 

const Register = () => {
  // Extract the register function from AuthContext
  const { register } = useContext(AuthContext);
  // useNavigate hook allows redirection after registration
  const navigate = useNavigate();

  // Local state to hold form data for registration (name, email, password)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Destructure the formData for easier access
  const { name, email, password } = formData;

  // onChange handler updates the formData state as the user types in the form fields
  const onChange = e => 
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // onSubmit handler for form submission
  const onSubmit = async e => {
    e.preventDefault(); // Prevent the default form submission behavior (page refresh)
    try {
      // Call the register function from AuthContext with the form data
      await register(name, email, password);
      // Display a success notification if registration succeeds
      toast.success('Registration successful');
      // Navigate the user to the homepage after successful registration
      navigate('/');
    } catch (err) {
      console.error(err);
      // Display an error notification if registration fails, showing a message if available
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className={styles.registerContainer}>
      {/* Heading for the registration page */}
      <h2>Register</h2>
      {/* Registration form */}
      <form onSubmit={onSubmit} className={styles.registerForm}>
        {/* Form group for the Name input */}
        <div className={styles.formGroup}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={onChange}
            required
          />
        </div>
        {/* Form group for the Email input */}
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
        {/* Form group for the Password input */}
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
        {/* Submit button to trigger registration */}
        <button type="submit" className={styles.registerBtn}>
          Register
        </button>
      </form>
      {/* Link to navigate to the login page if the user already has an account */}
      <p>
        Already have an account? <Link to="/login">Login Here</Link>
      </p>
    </div>
  );
};

export default Register;
