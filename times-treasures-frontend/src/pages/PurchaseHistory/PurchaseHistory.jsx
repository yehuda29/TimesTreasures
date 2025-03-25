// src/pages/PurchaseHistory/PurchaseHistory.jsx

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import styles from './PurchaseHistory.module.css';
import { getImageURL } from '../../utils/imageUtil';

const PurchaseHistory = () => {
  // Get user and token from AuthContext
  const { user, token } = useContext(AuthContext);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch purchase history if a user is logged in.
    if (user) {
      const fetchPurchaseHistory = async () => {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/users/purchase-history`,
            config
          );
          setPurchaseHistory(response.data.data);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching purchase history:', err);
          toast.error(err.response?.data?.message || 'Failed to fetch purchase history');
          setLoading(false);
        }
      };

      fetchPurchaseHistory();
    } else {
      // If no user is logged in, simply stop loading.
      setLoading(false);
    }
  }, [token, user]);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div className={styles.purchaseHistoryContainer}>
        <h2>Your Purchase History</h2>
        <p className={styles.loginMessage}>
          Please <a href="/login">log in</a> in order to see this page.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.purchaseHistoryContainer}>
      <h2>Your Purchase History</h2>
      {purchaseHistory.length === 0 ? (
        <p>You have no purchases yet.</p>
      ) : (
        <ul className={styles.purchaseList}>
          {purchaseHistory.map((purchase) => (
            <li key={purchase._id} className={styles.purchaseItem}>
              <img
                src={
                  purchase.watch && purchase.watch.image
                    ? getImageURL(purchase.watch.image)
                    : '' // fallback image
                }
                alt={purchase.watch?.name || 'Deleted Watch'}
                className={styles.watchImage}
              />
              <div className={styles.purchaseDetails}>
                <h3>{purchase.watch?.name || 'Unknown Watch'}</h3>
                <p>Order Number: {purchase.orderNumber}</p>
                <p>Quantity: {purchase.quantity}</p>
                <p>
                  Total Price: ₪
                  {purchase.totalPrice !== undefined
                    ? Number(purchase.totalPrice).toFixed(2)
                    : '0.00'}
                </p>
                <p>
                  Purchased on:{' '}
                  {purchase.purchaseDate
                    ? new Date(purchase.purchaseDate).toLocaleDateString()
                    : 'Unknown Date'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PurchaseHistory;
