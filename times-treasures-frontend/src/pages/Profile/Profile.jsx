// src/pages/Profile/Profile.jsx

import React, { useContext, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from './Profile.module.css';
import { AuthContext } from '../../context/AuthContext';
// Utility function to generate full image URL from a file name.
import { getImageURL } from '../../utils/imageUtil';

const Profile = () => {
  // Retrieve user, token, and setUser from AuthContext.
  const { user, token, setUser } = useContext(AuthContext);
  
  // Local state for the profile picture URL.
  const [profilePic, setProfilePic] = useState('');
  
  // useRef for the hidden file input.
  const fileInputRef = useRef(null);

  // When user data changes, set the profile picture using the stored filename.
  useEffect(() => {
    if (user && user.profilePicture) {
      setProfilePic(getImageURL(user.profilePicture));
    }
  }, [user]);

  // Handle file selection to update the profile picture.
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Use the file name to generate the full URL.
      const fileName = file.name;
      const imageUrl = getImageURL(fileName);
      // Update local preview.
      setProfilePic(imageUrl);

      try {
        // Prepare config with JSON content type and authorization header.
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        };
        // Update the user's profile picture by calling the new endpoint.
        // Note: We use /api/users/profile instead of /api/auth/me.
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/users/profile`,
          { profilePicture: fileName },
          config
        );
        // Update the user context if new data is returned.
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

  // Trigger the file input when the button is clicked.
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        {/* Display the profile picture (either updated or from the default from the user's record) */}
        <img src={profilePic} alt="Profile" className={styles.profilePicture} />
        <h1 className={styles.userName}>{user ? user.name : 'Guest'}</h1>
        {/* Hidden file input for selecting a new profile picture */}
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
