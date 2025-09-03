// src/pages/AdminDashboard/AdminDashboard.jsx

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const [query, setQuery] = useState("wrist watch"); // Default search term
  const [brand, setBrand] = useState(""); // New: Brand filter provided by admin
  const [limit, setLimit] = useState(10); // Default fetch limit
  const [loading, setLoading] = useState(false);

  const fetchWatchesFromEbay = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // Ensure admin is authenticated

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/watches/fetch-ebay`,
        { query, brand, limit }, // Pass the brand filter in the request payload
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
          placeholder="Enter search keywords..."
        />

        <label>Brand Filter:</label>
        <input
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Enter desired brand (e.g., Rolex, Apple)..."
        />

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
