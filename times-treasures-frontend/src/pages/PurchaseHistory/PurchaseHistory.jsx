// src/pages/PurchaseHistory/PurchaseHistory.jsx

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import styles from './PurchaseHistory.module.css';

const PurchaseHistory = () => {
  // Retrieve the JWT token from the AuthContext for secure API requests.
  const { token } = useContext(AuthContext);
  
  // State to store the fetched purchase history records.
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  
  // Loading state to display a loading indicator while data is fetched.
  const [loading, setLoading] = useState(true);

  // Function to fetch the user's purchase history from the backend.
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
      // Update state with the fetched purchase history records.
      setPurchaseHistory(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching purchase history:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch purchase history');
      setLoading(false);
    }
  };

  // useEffect to fetch purchase history when the component mounts or when the token changes.
  useEffect(() => {
    fetchPurchaseHistory();
  }, [token]);

  // Render a loading message if data is still being fetched.
  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.purchaseHistoryContainer}>
      <h2>Your Purchase History</h2>
      {/* Optional: Refresh button to manually reload purchase history */}
      <button className={styles.refreshBtn} onClick={fetchPurchaseHistory}>
        Refresh
      </button>
      {purchaseHistory.length === 0 ? (
        <p>You have no purchases yet.</p>
      ) : (
        <ul className={styles.purchaseList}>
          {purchaseHistory.map((purchase) => (
            <li key={purchase._id} className={styles.purchaseItem}>
              {/* Use optional chaining to safely access nested properties */}
              <img
                src={purchase.watch?.image || '/default-watch.png'}
                alt={purchase.watch?.name || 'Watch image'}
                className={styles.watchImage}
              />
              <div className={styles.purchaseDetails}>
                <h3>{purchase.watch?.name || 'Unknown Watch'}</h3>
                <p>Quantity: {purchase.quantity}</p>
                <p>
                  Total Price: $
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
