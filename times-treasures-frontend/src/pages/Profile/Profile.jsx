// src/pages/Profile/Profile.jsx

import React, { useContext, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from './Profile.module.css';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
  const { user, token, setUser } = useContext(AuthContext);
  const [profilePic, setProfilePic] = useState('');
  const fileInputRef = useRef(null);

  // For a local preview, use URL.createObjectURL (optional)
  useEffect(() => {
    if (user && user.profilePicture) {
      // Assume user.profilePicture is now a full Cloudinary URL
      setProfilePic(user.profilePicture);
    }
  }, [user]);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Optionally update the preview immediately
      setProfilePic(URL.createObjectURL(file));

      try {
        // Create FormData and append the file with key "profilePicture"
        const formData = new FormData();
        formData.append('profilePicture', file);

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            // Let the browser set the correct multipart/form-data header
          }
        };

        // Send the file to the backend's profile update endpoint.
        // Ensure that your backend updateProfile endpoint checks for req.files.profilePicture.
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/users/profile`,
          formData,
          config
        );
        if (response.data && response.data.data) {
          setUser(response.data.data);
        }
        toast.success('Profile picture updated successfully!');
      } catch (err) {
        console.error('Error updating profile picture:', err);
        toast.error('Failed to update profile picture.');
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <img src={profilePic} alt="Profile" className={styles.profilePicture} />
        <h1 className={styles.userName}>{user ? user.name : 'Guest'}</h1>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleFileChange}
        />
        <button onClick={handleUploadClick} className={styles.uploadBtn}>
          Upload Picture
        </button>
      </div>
      <div className={styles.buttonContainer}>
        <Link to="/purchase-history" className={styles.profileButton}>
          Purchase History
        </Link>
        <Link to="/current-order" className={styles.profileButton}>
          Current Order
        </Link>
        <Link to="/address" className={styles.profileButton}>
          Your Addresses
        </Link>
      </div>
    </div>
  );
};

export default Profile;
