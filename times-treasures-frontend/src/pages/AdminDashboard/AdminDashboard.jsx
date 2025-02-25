// src/pages/AdminDashboard/AdminDashboard.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  // Extend form state to include special offer fields:
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'men-watches',
    inventory: '',
    discountPercentage: '', // Optional: percentage discount (e.g., 20 for 20% off)
    offerStart: '',         // Optional: start date of the offer (YYYY-MM-DD format)
    offerEnd: ''            // Optional: end date of the offer (YYYY-MM-DD format)
  });
  // State to hold the selected image file
  const [imageFile, setImageFile] = useState(null);

  // Destructure all fields from formData
  const { name, price, description, category, inventory, discountPercentage, offerStart, offerEnd } = formData;

  // Handler to update form data state when any input field changes
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle file selection for the image file
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Handler for form submission to create a new watch with special offer details
  const onSubmit = async (e) => {
    e.preventDefault();

    // ----- Special Offer Fields Validation -----
    // If any one of the special offer fields is filled in, ensure that all are provided.
    if (discountPercentage || offerStart || offerEnd) {
      if (!(discountPercentage && offerStart && offerEnd)) {
        toast.error("Please provide discount percentage, offer start date, and offer end date together, or leave all empty.");
        return;
      }
    }
    // ---------------------------------------------

    try {
      const token = localStorage.getItem('token');
      // Create a FormData object to handle file upload and text data
      const data = new FormData();
      data.append('name', name);
      data.append('price', price);
      data.append('description', description);
      data.append('category', category);
      data.append('inventory', inventory);
      // Append special offer fields. These are optional; if left blank, the backend defaults will apply.
      data.append('discountPercentage', discountPercentage);
      data.append('offerStart', offerStart);
      data.append('offerEnd', offerEnd);
      if (imageFile) {
        data.append('image', imageFile);
      }

      // Set up the configuration for the request with the authorization token.
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // POST the FormData to the watches endpoint.
      // The backend is expected to parse these fields and use the specialOffer sub-schema.
      await axios.post(`${import.meta.env.VITE_API_URL}/watches`, data, config);
      toast.success('Watch uploaded successfully');

      // Reset the form state (including special offer fields) and clear the file input.
      setFormData({
        name: '',
        price: '',
        description: '',
        category: 'men-watches',
        inventory: '',
        discountPercentage: '',
        offerStart: '',
        offerEnd: ''
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
        {/* Watch Name */}
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
        {/* Price */}
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
        {/* Category */}
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
        {/* Description */}
        <div className={styles.formGroup}>
          <label htmlFor="description">Description:</label>
          <textarea
            name="description"
            value={description}
            onChange={onChange}
            required
          />
        </div>
        {/* Inventory */}
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
        {/* Special Offer: Discount Percentage */}
        <div className={styles.formGroup}>
          <label htmlFor="discountPercentage">Discount Percentage (optional):</label>
          <input
            type="number"
            name="discountPercentage"
            value={discountPercentage}
            onChange={onChange}
            min="0"
            max="100"
            step="1"
          />
        </div>
        {/* Special Offer: Offer Start Date */}
        <div className={styles.formGroup}>
          <label htmlFor="offerStart">Offer Start Date (optional):</label>
          <input
            type="date"
            name="offerStart"
            value={offerStart}
            onChange={onChange}
          />
        </div>
        {/* Special Offer: Offer End Date */}
        <div className={styles.formGroup}>
          <label htmlFor="offerEnd">Offer End Date (optional):</label>
          <input
            type="date"
            name="offerEnd"
            value={offerEnd}
            onChange={onChange}
          />
        </div>
        {/* Image File */}
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
        {/* Submit Button */}
        <button type="submit" className={styles.uploadBtn}>
          Upload Watch
        </button>
      </form>
    </div>
  );
};

export default AdminDashboard;
