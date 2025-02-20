// src/pages/SetAddress/SetAddress.jsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from './SetAddress.module.css';
import { AuthContext } from '../../context/AuthContext';

/**
 * SetAddress Page Component
 * This page allows the user to view and update their address.
 * If a field is left empty, the old value will be retained.
 */
const SetAddress = () => {
  const { token, user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Determine the user's current address (if available) from the user object.
  const initialAddress =
    user && user.addresses && user.addresses.length > 0
      ? user.addresses[0]
      : {
          country: '',
          city: '',
          homeAddress: '',
          zipcode: '',
          phoneNumber: ''
        };

  // Initialize form state with the user's current address.
  const [formData, setFormData] = useState(initialAddress);

  const { country, city, homeAddress, zipcode, phoneNumber } = formData;

  // Update formData when an input changes.
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission.
  const onSubmit = async (e) => {
    e.preventDefault();

    // For each field, if the user input is empty after trimming, use the initial value.
    const updatedAddress = {
      country: formData.country.trim() === "" ? initialAddress.country : formData.country,
      city: formData.city.trim() === "" ? initialAddress.city : formData.city,
      homeAddress: formData.homeAddress.trim() === "" ? initialAddress.homeAddress : formData.homeAddress,
      zipcode: formData.zipcode.trim() === "" ? initialAddress.zipcode : formData.zipcode,
      phoneNumber: formData.phoneNumber.trim() === "" ? initialAddress.phoneNumber : formData.phoneNumber
    };

    const payload = { addresses: [updatedAddress] };

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        payload,
        config
      );
      if (response.data && response.data.data) {
        setUser(response.data.data);
      }
      toast.success('Address updated successfully!');
      navigate('/profile');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update address');
    }
  };

  return (
    <div className={styles.setAddressContainer}>
      <h2>Set Your Address</h2>
      <form onSubmit={onSubmit} className={styles.addressForm}>
        <div className={styles.formGroup}>
          <label htmlFor="country">Country:</label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            placeholder={initialAddress.country || "Country"}
            onChange={onChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="city">City:</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            placeholder={initialAddress.city || "City"}
            onChange={onChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="homeAddress">Home Address:</label>
          <input
            type="text"
            id="homeAddress"
            name="homeAddress"
            value={formData.homeAddress}
            placeholder={initialAddress.homeAddress || "Home Address"}
            onChange={onChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="zipcode">Zip Code:</label>
          <input
            type="text"
            id="zipcode"
            name="zipcode"
            value={formData.zipcode}
            placeholder={initialAddress.zipcode || "Zip Code"}
            onChange={onChange}
            pattern="\d+"
            title="Zipcode must contain only numbers"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            placeholder={initialAddress.phoneNumber || "Phone Number"}
            onChange={onChange}
            pattern="\d{10}"
            title="Phone number must be exactly 10 digits"
          />
        </div>
        <button type="submit" className={styles.submitBtn}>
          Update Address
        </button>
      </form>
    </div>
  );
};

export default SetAddress;
