// src/pages/Shop/Shop.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from './Shop.module.css';

const Shop = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatches = async () => {
      try {
        // Fetch a sufficient number of watches to cover most categories
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/watches`, {
          params: { page: 1, limit: 100 }
        });
        if (response.data.success) {
          const watches = response.data.data;
          // Group watches by category; pick the first watch encountered per category.
          const grouped = {};
          watches.forEach((watch) => {
            if (!grouped[watch.category]) {
              grouped[watch.category] = watch;
            }
          });
          // Convert the grouped object to an array of category objects
          const categoriesArr = Object.keys(grouped).map((category) => ({
            category,
            image: grouped[category].image,
          }));
          setCategories(categoriesArr);
        }
      } catch (error) {
        console.error('Error fetching watches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatches();
  }, []);

  if (loading) return <p>Loading categories...</p>;

  return (
    <div className={styles.shopContainer}>
      <h1>Shop Categories</h1>
      <div className={styles.categoriesGrid}>
        {categories.map((cat) => (
          <Link
            key={cat.category}
            to={`/shop/${cat.category.toLowerCase()}`}
            className={styles.categoryCard}
          >
            <img
              src={cat.image}
              alt={cat.category}
              className={styles.categoryImage}
            />
            <p className={styles.categoryName}>{cat.category}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Shop;
