import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IconButton, Badge, Menu, MenuItem, ListItemText, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import styles from './NotificationBell.module.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  // Function to fetch out-of-stock notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/watches`);
      const outOfStock = response.data.data.filter(watch => Number(watch.inventory) === 0);
      setNotifications(outOfStock);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Poll for new notifications every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

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
          notifications.map((watch) => (
            <MenuItem key={watch._id} onClick={handleClose}>
              <ListItemText 
                primary={`🚨 ${watch.name} is out of stock!`}
                primaryTypographyProps={{ style: { whiteSpace: 'normal' } }}
              />
            </MenuItem>
          ))
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
