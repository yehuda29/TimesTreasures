import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const [query, setQuery] = useState("wrist watch"); // Default search term
  const [category, setCategory] = useState("all"); // Default category
  const [limit, setLimit] = useState(10); // Default fetch limit
  const [loading, setLoading] = useState(false);

  const fetchWatchesFromEbay = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // Ensure admin is authenticated

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/watches/fetch-ebay`,
        { query, category, limit }, // Send user-selected values
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch watches from eBay");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminDashboard}>
      <h2>Admin Dashboard</h2>

      {/* eBay Watch Fetch Form */}
      <div className={styles.formContainer}>
        <label>Search Query:</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter watch brand or keyword..."
        />

        <label>Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="men-watches">Men's Watches</option>
          <option value="women-watches">Women's Watches</option>
          <option value="luxury-watches">Luxury Watches</option>
          <option value="smartwatches">Smartwatches</option>
        </select>

        <label>Number of Watches:</label>
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          min="1"
          max="50"
        />

        <button onClick={fetchWatchesFromEbay} disabled={loading} className={styles.fetchEbayBtn}>
          {loading ? "Fetching..." : "Fetch Watches from eBay"}
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
