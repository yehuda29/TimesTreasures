import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './UpdatePersonalInformation.module.css'; // Create and adjust styling as needed

const UpdatePersonalInformation = () => {
  const { user, token, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Local state to hold the form values
  const [formData, setFormData] = useState({
    name: '',
    familyName: '',
    birthDate: '',
    sex: ''
  });

  // Populate the form with existing user data when available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        familyName: user.familyName || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().substr(0, 10) : '',
        sex: user.sex || ''
      });
    }
  }, [user]);

  // Handle input changes
  const onChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  // Handle form submission to update personal info
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };

      // Assuming your backend's update profile endpoint accepts these fields in the JSON body.
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/users/profile`, formData, config);
      
      // Update the AuthContext with the new user data
      setUser(response.data.data);
      toast.success('Personal information updated successfully!');
      navigate('/profile');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update personal information');
    }
  };

  return (
    <div className={styles.container}>
      <h2>Update Personal Information</h2>
      <form onSubmit={onSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">First Name:</label>
          <input 
            type="text" 
            name="name" 
            id="name" 
            value={formData.name} 
            onChange={onChange} 
            required 
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="familyName">Family Name (optional):</label>
          <input 
            type="text" 
            name="familyName" 
            id="familyName" 
            value={formData.familyName} 
            onChange={onChange} 
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="birthDate">Birth Date:</label>
          <input 
            type="date" 
            name="birthDate" 
            id="birthDate" 
            value={formData.birthDate} 
            onChange={onChange} 
            required 
          />
        </div>
        <div className={styles.formGroup}>
          <label>Sex:</label>
          <div className={styles.radioGroup}>
            <label htmlFor="male">
              <input
                type="radio"
                id="male"
                name="sex"
                value="male"
                checked={formData.sex === 'male'}
                onChange={onChange}
                required
              />
              Male
            </label>
            <label htmlFor="female">
              <input
                type="radio"
                id="female"
                name="sex"
                value="female"
                checked={formData.sex === 'female'}
                onChange={onChange}
                required
              />
              Female
            </label>
          </div>
        </div>
        <button type="submit" className={styles.submitBtn}>Update</button>
      </form>
    </div>
  );
};

export default UpdatePersonalInformation;
