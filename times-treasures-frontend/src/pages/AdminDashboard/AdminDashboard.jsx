// src/pages/AdminDashboard/AdminDashboard.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  // Form fields for watch details (excluding the image file)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'men-watches'
  });
  // Store the selected image file
  const [imageFile, setImageFile] = useState(null);

  const { name, price, description, category } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle file selection from the file input
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      // Create a FormData object and append all fields
      const data = new FormData();
      data.append('name', name);
      data.append('price', price);
      data.append('description', description);
      data.append('category', category);
      if (imageFile) {
        data.append('image', imageFile);
      }

      // Do not manually set the Content-Type header; let the browser set it
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // POST to the watch creation endpoint (which now expects a file upload)
      await axios.post(`${import.meta.env.VITE_API_URL}/watches`, data, config);
      toast.success('Watch uploaded successfully');

      // Reset the form
      setFormData({
        name: '',
        price: '',
        description: '',
        category: 'men-watches'
      });
      setImageFile(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload watch');
    }
  };

  return (
    <div className={styles.adminDashboard}>
      <h2>Admin Dashboard</h2>
      <form onSubmit={onSubmit} className={styles.uploadForm}>
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
        <div className={styles.formGroup}>
          <label htmlFor="description">Description:</label>
          <textarea
            name="description"
            value={description}
            onChange={onChange}
            required
          />
        </div>
        {/* Replace the image text input with a file input */}
        <div className={styles.formGroup}>
          <label htmlFor="image">Image File:</label>
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            accept="image/*"
            required
          />
        </div>
        <button type="submit" className={styles.uploadBtn}>
          Upload Watch
        </button>
      </form>
    </div>
  );
};

export default AdminDashboard;
