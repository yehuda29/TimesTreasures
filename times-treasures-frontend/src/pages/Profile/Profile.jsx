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

  useEffect(() => {
    if (user && user.profilePicture) {
      setProfilePic(user.profilePicture);
    }
  }, [user]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const now = new Date();
    const diff = now - birth;
    const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    return age;
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePic(URL.createObjectURL(file));
      try {
        const formData = new FormData();
        formData.append('profilePicture', file);
        const config = {
          headers: { Authorization: `Bearer ${token}` }
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

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <Box sx={{ 
      maxWidth: 600, 
      margin: '2rem auto', 
      padding: 2, 
      backgroundColor: 'var(--background-color)', 
      color: 'var(--primary-color)' 
    }}>
      <Card sx={{ 
        backgroundColor: 'var(--background-color)', 
        color: 'var(--primary-color)' 
      }}>
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
              <IconButton 
                onClick={handleUploadClick}
                sx={{ 
                  color: 'var(--primary-color)',
                  "&:hover": { color: 'var(--accent-color)' }
                }}
              >
                <PhotoCamera />
              </IconButton>
            </Tooltip>
          }
          title={
            <Typography variant="h5" sx={{ color: 'var(--primary-color)' }}>
              {user ? `${user.name} ${user.familyName}` : 'Guest'}
            </Typography>
          }
          subheader={user && user.email ? user.email : ''}
        />
        <CardContent>
          {user && user.role !== 'admin' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, color: 'var(--primary-color)' }}>
                Personal Information
              </Typography>
              <Box 
                sx={{ 
                  mb: 3, 
                  p: 2, 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 2, 
                  backgroundColor: 'var(--input-bg)' 
                }}
              >
                <Typography variant="body1" sx={{ color: 'var(--primary-color)' }}>
                  <strong>Full Name:</strong> {user ? `${user.name}${user.familyName ? ' ' + user.familyName : ''}` : 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ color: 'var(--primary-color)' }}>
                  <strong>Age:</strong> {user ? calculateAge(user.birthDate) : 'N/A'}
                </Typography>
              </Box>
            </Box>
          )}
          {user && user.addresses && user.addresses.length > 0 && user.role !== 'admin' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, color: 'var(--primary-color)' }}>
                Your Addresses
              </Typography>
              {user.addresses.map((address, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    mb: 2, 
                    p: 2, 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 2, 
                    backgroundColor: 'var(--input-bg)' 
                  }}
                >
                  <Typography variant="body1" sx={{ color: 'var(--primary-color)' }}>
                    <strong>Country:</strong> {address.country}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'var(--primary-color)' }}>
                    <strong>City:</strong> {address.city}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'var(--primary-color)' }}>
                    <strong>Home Address:</strong> {address.homeAddress}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'var(--primary-color)' }}>
                    <strong>Zip Code:</strong> {address.zipcode}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'var(--primary-color)' }}>
                    <strong>Phone Number:</strong> {address.phoneNumber}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ mt: 2, mb: 2 }} />
            </Box>
          )}
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={6}>
              <Button 
                component={Link} 
                to="/purchase-history" 
                variant="outlined" 
                fullWidth
                sx={{
                  color: 'var(--primary-color)',
                  borderColor: 'var(--primary-color)',
                  "&:hover": {
                    color: 'var(--accent-color)',
                  }
                }}
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
                sx={{
                  color: 'var(--primary-color)',
                  borderColor: 'var(--primary-color)',
                  "&:hover": {
                    color: 'var(--accent-color)',
                  }
                }}
              >
                Update Your Addresses
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button 
                component={Link} 
                to="/update-personal-info" 
                variant="outlined" 
                fullWidth
                sx={{
                  color: 'var(--primary-color)',
                  borderColor: 'var(--primary-color)',
                  "&:hover": {
                    color: 'var(--accent-color)',
                  }
                }}
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
                sx={{
                  color: 'var(--primary-color)',
                  borderColor: 'var(--primary-color)',
                  "&:hover": {
                    color: 'var(--accent-color)',
                  }
                }}
              >
                Order Tracking
              </Button>
            </Grid>
            {user && user.role === 'admin' && (
              <>
                <Grid item xs={12} sm={6}>
                  <Button 
                    component={Link} 
                    to="/admin/branch-creation" 
                    variant="outlined" 
                    fullWidth
                    sx={{
                      color: 'var(--primary-color)',
                      borderColor: 'var(--primary-color)',
                      "&:hover": {
                        color: 'var(--accent-color)',
                      }
                    }}
                  >
                    Create Branch
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    component={Link} 
                    to="/discounted-watches" 
                    variant="outlined" 
                    fullWidth
                    sx={{
                      color: 'var(--primary-color)',
                      borderColor: 'var(--primary-color)',
                      "&:hover": {
                        color: 'var(--accent-color)',
                      }
                    }}
                  >
                    Discounted Watches
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Button 
                    component={Link} 
                    to= "/admin/users-table" 
                    variant="outlined" 
                    fullWidth
                    sx={{
                      color: 'var(--primary-color)',
                      borderColor: 'var(--primary-color)',
                      "&:hover": {
                        color: 'var(--accent-color)',
                      }
                    }}
                  >
                    Users Table
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Button 
                    component={Link} 
                    to="/admin/analytics" 
                    variant="outlined" 
                    fullWidth
                    sx={{
                      color: 'var(--primary-color)',
                      borderColor: 'var(--primary-color)',
                      "&:hover": {
                        color: 'var(--accent-color)',
                      }
                    }}
                  >
                    Admin Analytics
                  </Button>
                </Grid>
                <Grid item xs={12} sm={7}>
                  <Button 
                    component={Link} 
                    to="/admin" 
                    variant="outlined" 
                    fullWidth
                    sx={{
                      color: 'var(--primary-color)',
                      borderColor: 'var(--primary-color)',
                      "&:hover": {
                        color: 'var(--accent-color)',
                      }
                    }}
                  >
                    Admin Watch Fetching Interface
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
