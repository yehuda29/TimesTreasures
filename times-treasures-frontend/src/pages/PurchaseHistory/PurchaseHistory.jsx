// src/pages/PurchaseHistory/PurchaseHistory.jsx

import React, { useEffect, useState, useContext } from 'react';
// Axios is used to make HTTP requests to the backend API
import axios from 'axios';
// Import AuthContext to access the authentication token for secure requests
import { AuthContext } from '../../context/AuthContext';
// toast is used to display notifications to the user (e.g., errors)
import { toast } from 'react-toastify';
// Import the CSS module for styling the purchase history page
import styles from './PurchaseHistory.module.css';

const PurchaseHistory = () => {
  // Extract the token from the AuthContext; used for authenticated API calls
  const { token } = useContext(AuthContext);
  
  // State to store the list of purchase history records
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  // State to track the loading status while data is being fetched
  const [loading, setLoading] = useState(true);

  // useEffect to fetch the purchase history data when the component mounts or when the token changes
  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      try {
        // Set up the headers with the token for authorization
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        // Make a GET request to the purchase history endpoint
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/purchase-history`, config);
        // Set the fetched purchase history data into state
        setPurchaseHistory(response.data.data);
        // Mark loading as false after the data is fetched
        setLoading(false);
      } catch (err) {
        // Log any error to the console and show an error notification
        console.error(err);
        toast.error(err.response?.data?.message || 'Failed to fetch purchase history');
        // Even on error, mark loading as false to allow the UI to update
        setLoading(false);
      }
    };

    // Call the function to fetch purchase history data
    fetchPurchaseHistory();
  }, [token]);

  // If the data is still loading, show a loading message
  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.purchaseHistoryContainer}>
      <h2>Your Purchase History</h2>
      {purchaseHistory.length === 0 ? (
        // If there are no purchases, display a message indicating so
        <p>You have no purchases yet.</p>
      ) : (
        // Otherwise, display the list of purchase records
        <ul className={styles.purchaseList}>
          {purchaseHistory.map(purchase => (
            // Use purchase._id as the key for each list item
            <li key={purchase._id} className={styles.purchaseItem}>
              {/* Display the image of the purchased watch */}
              <img
                src={purchase.watch.image}
                alt={purchase.watch.name}
                className={styles.watchImage}
              />
              <div className={styles.purchaseDetails}>
                {/* Display the name of the watch */}
                <h3>{purchase.watch.name}</h3>
                {/* Display the quantity purchased */}
                <p>Quantity: {purchase.quantity}</p>
                {/* Display the total price, formatted to two decimal places */}
                <p>Total Price: ${purchase.totalPrice.toFixed(2)}</p>
                {/* Display the purchase date, formatted to a locale-specific date string */}
                <p>Purchased on: {new Date(purchase.purchaseDate).toLocaleDateString()}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PurchaseHistory;
