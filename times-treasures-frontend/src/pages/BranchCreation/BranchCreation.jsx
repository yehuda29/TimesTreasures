// src/pages/BranchCreation/BranchCreation.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import styles from './BranchCreation.module.css'; // Create this CSS module as needed

const BranchCreation = () => {
  // State for each branch field
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [openingHour, setOpeningHour] = useState('');
  const [closingHour, setClosingHour] = useState('');
  const [address, setAddress] = useState('');

  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation: Ensure required fields are not empty
    if (!name || !lat || !lng || !phoneNumber || !openingHour || !closingHour) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const branchData = {
      name,
      position: {
        lat: Number(lat),
        lng: Number(lng),
      },
      phoneNumber,
      openingHour,
      closingHour,
      address, // Optional field
    };

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/branches`,
        branchData,
        config
      );

      if (response.data && response.data.success) {
        toast.success('Branch created successfully!');
        navigate('/admin'); // Redirect to the admin dashboard or a branch list page
      } else {
        toast.error('Failed to create branch.');
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      toast.error(error.response?.data?.message || 'Server Error');
    }
  };

  return (
    <div className={styles.branchCreationContainer}>
      <h2>Create a New Branch</h2>
      <form onSubmit={handleSubmit} className={styles.branchForm}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Branch Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="lat">Latitude</label>
          <input
            type="number"
            id="lat"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="lng">Longitude</label>
          <input
            type="number"
            id="lng"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="openingHour">Opening Hour</label>
          <input
            type="time"
            id="openingHour"
            value={openingHour}
            onChange={(e) => setOpeningHour(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="closingHour">Closing Hour</label>
          <input
            type="time"
            id="closingHour"
            value={closingHour}
            onChange={(e) => setClosingHour(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Create Branch
        </button>
      </form>
    </div>
  );
};

export default BranchCreation;
