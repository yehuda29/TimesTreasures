// src/pages/CategoryWatches/CategoryWatches.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import ProductCard from '../../components/ProductCard/ProductCard';
import styles from './CategoryWatches.module.css';

const CategoryWatches = () => {
  // Get the category parameter from the URL (e.g., /shop/rolex)
  const { category } = useParams();
  const [watches, setWatches] = useState([]);
  const [visibleWatches, setVisibleWatches] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('');

  // Helper to capitalize the first letter of the category for display
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Fetch watches for the given category whenever 'category' or 'sort' changes
  useEffect(() => {
    const fetchWatches = async () => {
      try {
        // We'll request all items for this category in one go (page=1, limit=100)
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/watches`, {
          params: {
            category: category,  // Filter by the category from the URL
            sort: sort,          // Sorting option (e.g., "name", "-price")
            page: 1,
            limit: 100,
          },
        });
        const fetchedWatches = response.data.data;
        if (!Array.isArray(fetchedWatches)) {
          throw new Error('Invalid data format from server');
        }
        setWatches(fetchedWatches);
        // Determine if there is more data to show
        if (fetchedWatches.length <= visibleWatches) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (err) {
        console.error(err);
        setError(`Failed to fetch ${capitalize(category)} watches.`);
      }
    };

    // Reset visible items and fetch data whenever sort or category changes
    setVisibleWatches(12);
    fetchWatches();
  }, [category, sort]);

  // Function to load more items (used by InfiniteScroll)
  const fetchMoreData = () => {
    if (visibleWatches >= watches.length) {
      setHasMore(false);
      return;
    }
    setTimeout(() => {
      setVisibleWatches((prev) => prev + 12);
    }, 500);
  };

  // Handle sort option changes
  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.categoryWatches}>
      <h2 className={styles.title}>{capitalize(category)} Watches</h2>
      
      {/* Sorting Dropdown */}
      <div className={styles.sortContainer}>
        <label htmlFor="sortSelect">Sort by:</label>
        <select id="sortSelect" value={sort} onChange={handleSortChange}>
          <option value="">Newest (Default)</option>
          <option value="name">Name (A-Z)</option>
          <option value="-name">Name (Z-A)</option>
          <option value="price">Price (Low to High)</option>
          <option value="-price">Price (High to Low)</option>
        </select>
      </div>

      <InfiniteScroll
        dataLength={visibleWatches}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<h4 className={styles.loader}>Loading...</h4>}
        endMessage={
          <p className={styles.endMessage}>
            <b>You've seen all the {capitalize(category)} watches!</b>
          </p>
        }
      >
        <div className={styles.productGrid}>
          {watches.slice(0, visibleWatches).map((watch) => (
            <ProductCard key={watch._id} watch={watch} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default CategoryWatches;
