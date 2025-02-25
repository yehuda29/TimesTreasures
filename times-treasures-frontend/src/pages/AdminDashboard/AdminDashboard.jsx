// src/pages/AdminDashboard/AdminDashboard.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  // Include 'inventory' in the initial form data
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'men-watches',
    inventory: '' // New field for inventory count
  });
  // Store the selected image file
  const [imageFile, setImageFile] = useState(null);

  // Destructure fields from formData, including inventory
  const { name, price, description, category, inventory } = formData;

  // Update form data state when inputs change
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle file selection from the file input
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Handle form submission to create a new watch
  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      // Create a FormData object and append all fields, including inventory
      const data = new FormData();
      data.append('name', name);
      data.append('price', price);
      data.append('description', description);
      data.append('category', category);
      data.append('inventory', inventory); // Append inventory field
      if (imageFile) {
        data.append('image', imageFile);
      }

      // Let the browser set the Content-Type header automatically
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // POST to the watch creation endpoint
      await axios.post(`${import.meta.env.VITE_API_URL}/watches`, data, config);
      toast.success('Watch uploaded successfully');

      // Reset the form including the inventory field
      setFormData({
        name: '',
        price: '',
        description: '',
        category: 'men-watches',
        inventory: ''
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
        {/* New: Inventory input field */}
        <div className={styles.formGroup}>
          <label htmlFor="inventory">Inventory:</label>
          <input
            type="number"
            name="inventory"
            value={inventory}
            onChange={onChange}
            required
            min="0"
            step="1"
          />
        </div>
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
