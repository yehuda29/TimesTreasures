import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './NotificationBell.module.css';
import { FaBell } from 'react-icons/fa';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch out-of-stock notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/watches`);
        const outOfStock = response.data.data.filter(watch => Number(watch.inventory) === 0);
        setNotifications(outOfStock);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  // Toggle notification dropdown
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.notificationContainer}>
      <div className={styles.notificationBell} onClick={toggleNotifications}>
        <FaBell className={styles.bellIcon} />
        {notifications.length > 0 && (
          <span className={styles.notificationBadge}>{notifications.length}</span>
        )}
      </div>

      {isOpen && (
        <div className={styles.notificationDropdown}>
          <ul>
            {notifications.length > 0 ? (
              notifications.map((watch) => (
                <li key={watch._id}>
                  🚨 {watch.name} is out of stock!
                </li>
              ))
            ) : (
              <li className={styles.noNotifications}>No new notifications</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
