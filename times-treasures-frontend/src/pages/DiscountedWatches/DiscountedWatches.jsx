// src/pages/DiscountedWatches/DiscountedWatches.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../../components/ProductCard/ProductCard';
import styles from './DiscountedWatches.module.css';
import { toast } from 'react-toastify';

const DiscountedWatches = () => {
  const [discountedWatches, setDiscountedWatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscountedWatches = async () => {
      try {
        // Fetch all watches from the backend
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/watches`);
        const allWatches = response.data.data;
        const now = new Date();
        // Filter to include only watches with a valid discount (nonzero discount and within offer period)
        const filtered = allWatches.filter((watch) => {
          if (watch.specialOffer && watch.specialOffer.discountPercentage > 0) {
            if (watch.specialOffer.offerStart && watch.specialOffer.offerEnd) {
              const start = new Date(watch.specialOffer.offerStart);
              const end = new Date(watch.specialOffer.offerEnd);
              return now >= start && now <= end;
            }
          }
          return false;
        });
        setDiscountedWatches(filtered);
      } catch (error) {
        console.error('Error fetching discounted watches:', error);
        toast.error('Failed to fetch discounted watches');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountedWatches();
  }, []);

  if (loading) return <p>Loading discounted watches...</p>;

  return (
    <div className={styles.discountedWatchesContainer}>
      <h2>Discounted Watches</h2>
      {discountedWatches.length === 0 ? (
        <p>No discounted watches available at the moment.</p>
      ) : (
        <div className={styles.productGrid}>
          {discountedWatches.map((watch) => (
            <ProductCard key={watch._id} watch={watch} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscountedWatches;
