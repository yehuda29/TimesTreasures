// src/pages/AdminDashboard/AdminDashboard.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from './AdminDashboard.module.css'; 

// AdminDashboard allows an admin user to upload a new watch to the shop.
// The form collects watch details like name, price, description, image URL, and category.
const AdminDashboard = () => {
  // Initialize state for the upload form with default values.
  // 'category' defaults to "men-watches", which can be changed via the dropdown.
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: 'men-watches'
  });

  // Destructure individual fields from formData for easy access.
  const { name, price, description, image, category } = formData;

  // onChange handler updates formData when the user changes an input.
  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // onSubmit handler is called when the form is submitted.
  const onSubmit = async e => {
    e.preventDefault(); // Prevent the default form submission behavior (page refresh)
    try {
      // Retrieve the token from localStorage (alternatively, you could use AuthContext)
      const token = localStorage.getItem('token');
      // Prepare configuration for the Axios request with proper headers
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
      // Send a POST request to the backend to upload the new watch
      await axios.post(
        `${import.meta.env.VITE_API_URL}/watches`,
        { name, price, description, image, category },
        config
      );
      // Show a success notification if the upload is successful
      toast.success('Watch uploaded successfully');
      // Reset the form to its default state
      setFormData({
        name: '',
        price: '',
        description: '',
        image: '',
        category: 'men-watches'
      });
    } catch (err) {
      // Log the error for debugging purposes
      console.error(err);
      // Display an error notification using toast, with the error message if available
      toast.error(err.response?.data?.message || 'Failed to upload watch');
    }
  };

  return (
    <div className={styles.adminDashboard}>
      <h2>Admin Dashboard</h2>
      {/* Form for uploading a new watch */}
      <form onSubmit={onSubmit} className={styles.uploadForm}>
        {/* Form group for Watch Name */}
        <div className={styles.formGroup}>
          <label htmlFor="name">Watch Name:</label>
          <input 
            type="text" 
            name="name" 
            value={name} 
            onChange={onChange} 
            required 
          />
        </div>
        {/* Form group for Price */}
        <div className={styles.formGroup}>
          <label htmlFor="price">Price:</label>
          <input 
            type="number" 
            name="price" 
            value={price} 
            onChange={onChange} 
            required 
            min="0" 
            step="0.01" 
          />
        </div>
        {/* Form group for Category with a dropdown selection */}
        <div className={styles.formGroup}>
          <label htmlFor="category">Category:</label>
          <select 
            name="category" 
            value={category} 
            onChange={onChange} 
            required
          >
            <option value="men-watches">Men's Watches</option>
            <option value="women-watches">Women's Watches</option>
            <option value="luxury-watches">Luxury Watches</option>
            <option value="smartwatches">Smartwatches</option>
          </select>
        </div>
        {/* Form group for Description */}
        <div className={styles.formGroup}>
          <label htmlFor="description">Description:</label>
          <textarea 
            name="description" 
            value={description} 
            onChange={onChange} 
            required 
          />
        </div>
        {/* Form group for Image URL */}
        <div className={styles.formGroup}>
          <label htmlFor="image">Image Name:</label>
          <input 
            type="text" 
            name="image" 
            value={image} 
            onChange={onChange} 
            required 
          />
        </div>
        {/* Submit button to upload the watch */}
        <button type="submit" className={styles.uploadBtn}>
          Upload Watch
        </button>
      </form>
    </div>
  );
};

export default AdminDashboard;
