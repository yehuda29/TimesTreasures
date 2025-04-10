import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import styles from './PurchaseHistoryTable.module.css'; // Import your CSS module for styling

const PurchaseHistoryTable = () => {
  // Get the JWT token from authentication context
  const { token } = useContext(AuthContext);

  // State for managing the search input and results
  const [searchTerm, setSearchTerm] = useState('');
  const [userResults, setUserResults] = useState([]);

  // Track the currently selected user to display their purchase history
  const [selectedUser, setSelectedUser] = useState(null);
  // Purchase history state for the selected user
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  // Loading state to show a loading indicator during API calls
  const [loading, setLoading] = useState(false);

  /**
   * Handle the search form submission.
   * Sends a GET request to the backend admin endpoint (/api/admin/users/search) 
   * using the provided searchTerm to retrieve matching users.
   */
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) {
      toast.error("Please enter a search term.");
      return;
    }
    try {
      setLoading(true);
      // Perform a GET request to search for users by name
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/users/search?name=${encodeURIComponent(searchTerm)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setUserResults(response.data.data);
        if (response.data.data.length === 0) {
          toast.info("No users found matching the search term.");
        }
      }
    } catch (error) {
      console.error('Error searching for users', error);
      toast.error("Error searching for users.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch the purchase history for a given user by calling the admin endpoint.
   */
  const fetchPurchaseHistory = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/purchase-history/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setPurchaseHistory(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching purchase history", error);
      toast.error("Error fetching purchase history.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user selection from the search results.
   * Sets the user as the currently selected one and fetches its purchase history.
   */
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchPurchaseHistory(user._id);
  };

  /**
   * Reset the view to allow a new search.
   */
  const handleClearSelection = () => {
    setSelectedUser(null);
    setPurchaseHistory([]);
  };

  return (
    <div className={styles.container}>
      <h2>Purchase History Table</h2>
      
      {/* If no user is selected, show the search form and list of search results */}
      {!selectedUser && (
        <div className={styles.searchSection}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Enter user name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
          {userResults.length > 0 && (
            <div className={styles.results}>
              <h3>Search Results:</h3>
              <ul className={styles.userList}>
                {userResults.map((user) => (
                  <li
                    key={user._id}
                    onClick={() => handleUserSelect(user)}
                    className={styles.userItem}
                  >
                    {user.name} {user.familyName} ({user._id})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* If a user is selected, show a button to go back to the search and render the purchase history table */}
      {selectedUser && (
        <div className={styles.historySection}>
          <button onClick={handleClearSelection} className={styles.backButton}>
            &larr; Back to Search
          </button>
          <h3>
            Purchase History for {selectedUser.name} {selectedUser.familyName} ({selectedUser._id})
          </h3>
          {loading ? (
            <p>Loading purchase history...</p>
          ) : (
            <>
              {purchaseHistory.length === 0 ? (
                <p>No purchase history found for this user.</p>
              ) : (
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th>Order Number</th>
                      <th>Watch</th>
                      <th>Quantity</th>
                      <th>Total Price</th>
                      <th>Purchase Date</th>
                      <th>Shipping Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseHistory.map((purchase, index) => (
                      <tr key={index}>
                        <td>{purchase.orderNumber}</td>
                        <td>{purchase.watch ? purchase.watch.name : "Deleted Watch"}</td>
                        <td>{purchase.quantity}</td>
                        <td>₪{purchase.totalPrice.toFixed(2)}</td>
                        <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                        <td>
                          {purchase.shippingAddress
                            ? `${purchase.shippingAddress.homeAddress}, ${purchase.shippingAddress.city}, ${purchase.shippingAddress.country}`
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseHistoryTable;
