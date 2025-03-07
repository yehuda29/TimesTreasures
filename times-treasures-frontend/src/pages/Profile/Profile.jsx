import React, { useContext, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { 
  Avatar, 
  Card, 
  CardHeader, 
  CardContent, 
  Button, 
  IconButton, 
  Grid, 
  Typography, 
  Box, 
  Tooltip,
  Divider
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const Profile = () => {
  const { user, token, setUser } = useContext(AuthContext);
  const [profilePic, setProfilePic] = useState('');
  const fileInputRef = useRef(null);

  // Update local profile picture when user data changes
  useEffect(() => {
    if (user && user.profilePicture) {
      setProfilePic(user.profilePicture);
    }
  }, [user]);

  // Helper to calculate age from birthDate
  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const now = new Date();
    const diff = now - birth;
    const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    return age;
  };

  // Handle profile picture file changes and update profile via API
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Update the preview immediately
      setProfilePic(URL.createObjectURL(file));

      try {
        const formData = new FormData();
        formData.append('profilePicture', file);

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        };

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

  // Trigger the file input click event
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '2rem auto', padding: 2 }}>
      <Card>
        <CardHeader
          avatar={
            <Avatar
              src={profilePic}
              sx={{ width: 100, height: 100 }}
            >
              {user?.name?.charAt(0)}
            </Avatar>
          }
          action={
            <Tooltip title="Upload new picture">
              <IconButton onClick={handleUploadClick} color="primary">
                <PhotoCamera />
              </IconButton>
            </Tooltip>
          }
          title={
            <Typography variant="h5">
              {user ? `${user.name} ${user.familyName}` : 'Guest'}
            </Typography>
          }
          subheader={user && user.email ? user.email : ''}
        />
        <CardContent>
          {/* Personal Information Section */}
          <Typography variant="h6" sx={{ mb: 1 }}>
              Personal Information
          </Typography>
          <Box 
            sx={{ 
              mb: 3, 
              p: 2, 
              border: '1px solid #e0e0e0', 
              borderRadius: 2, 
              backgroundColor: '#fafafa' 
            }}
          >
            <Typography variant="body1">
              <strong>Full Name:</strong> {user ? `${user.name}${user.familyName ? ' ' + user.familyName : ''}` : 'N/A'}
            </Typography>
            <Typography variant="body1">
              <strong>Age:</strong> {user ? calculateAge(user.birthDate) : 'N/A'}
            </Typography>
          </Box>

          {/* Addresses Section */}
          {user && user.addresses && user.addresses.length > 0 && user.role !== 'admin' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Your Addresses
              </Typography>
              {user.addresses.map((address, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    mb: 2, 
                    p: 2, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 2, 
                    backgroundColor: '#fafafa'
                  }}
                >
                  <Typography variant="body1">
                    <strong>Country:</strong> {address.country}
                  </Typography>
                  <Typography variant="body1">
                    <strong>City:</strong> {address.city}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Home Address:</strong> {address.homeAddress}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Zip Code:</strong> {address.zipcode}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Phone Number:</strong> {address.phoneNumber}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ mt: 2, mb: 2 }} />
            </Box>
          )}

          {/* Action Buttons */}
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={6}>
              <Button 
                component={Link} 
                to="/purchase-history" 
                variant="outlined" 
                fullWidth
              >
                Purchase History
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button 
                component={Link} 
                to="/address" 
                variant="outlined" 
                fullWidth
              >
                Update Your Addresses
              </Button>
            </Grid>
            {/* New button for updating personal information */}
            <Grid item xs={12} sm={6}>
              <Button 
                component={Link} 
                to="/update-personal-info" 
                variant="outlined" 
                fullWidth
              >
                Update PI
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button 
                component={Link} 
                to="/order-tracking" 
                variant="outlined" 
                fullWidth
              >
                Order Tracking
              </Button>
            </Grid>
            {user && user.role === 'admin' && (
              <>
                <Grid item xs={12} sm={6}>
                  <Button 
                    component={Link} 
                    to="/discounted-watches" 
                    variant="outlined" 
                    fullWidth
                  >
                    Discounted Watches
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    component={Link} 
                    to="/admin/analytics" 
                    variant="outlined" 
                    fullWidth
                  >
                    Admin Analytics
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleFileChange}
        />
      </Card>
    </Box>
  );
};

export default Profile;
