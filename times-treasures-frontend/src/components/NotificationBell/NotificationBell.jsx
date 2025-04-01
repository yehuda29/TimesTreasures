import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { IconButton, Badge, Menu, MenuItem, ListItemText, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import styles from './NotificationBell.module.css';
import { AuthContext } from '../../context/AuthContext';

const NotificationBell = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  // Function to fetch out-of-stock notifications and add a prompt for incomplete profile info.
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/watches`);
      const outOfStock = response.data.data.filter(watch => Number(watch.inventory) === 0);
      let notificationsArray = [];
      if (user.role === "admin") {
        notificationsArray = [...outOfStock];
      }
      // If the user is logged in and is missing a birthDate or sex, add a profile prompt notification.
      if (user && (!user.birthDate || !user.sex || !user.addresses || user.addresses.length === 0)) {
        notificationsArray.unshift({
          _id: "profile-incomplete",
          message: "Your profile is incomplete. Please update your personal information (missing Personal Information or Addresses)."
        });
      }
      setNotifications(notificationsArray);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Re-fetch notifications on mount and every 30 seconds. Also re-run if user changes.
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className={styles.notificationContainer}>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon className={styles.bellIcon} />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 300,
            width: '350px',
            whiteSpace: 'normal'
          },
        }}
      >
        {notifications.length > 0 ? (
          notifications.map((notification) => {
            if (notification._id === "profile-incomplete") {
              return (
                <MenuItem key="profile-incomplete" onClick={handleClose}>
                  <ListItemText 
                    primary={`🔔 ${notification.message}`}
                    primaryTypographyProps={{ style: { whiteSpace: 'normal' } }}
                  />
                </MenuItem>
              );
            } else {
              return (
                <MenuItem key={notification._id} onClick={handleClose}>
                  <ListItemText 
                    primary={`🚨 ${notification.name} is out of stock!`}
                    primaryTypographyProps={{ style: { whiteSpace: 'normal' } }}
                  />
                </MenuItem>
              );
            }
          })
        ) : (
          <MenuItem onClick={handleClose}>
            <Typography variant="body1">No new notifications</Typography>
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

export default NotificationBell;
