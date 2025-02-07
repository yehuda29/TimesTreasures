// src/pages/SmartWatches/SmartWatches.jsx

import React, { useState, useEffect } from 'react';
// Import CSS module for styling this page
import styles from './SmartWatches.module.css';
// Import the ProductCard component to render individual watch cards
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
// Import InfiniteScroll to enable lazy loading of the product list
import InfiniteScroll from 'react-infinite-scroll-component';
// Axios is used for making HTTP requests to the backend API
import axios from 'axios';

const SmartWatches = () => {
  // State to hold the fetched smartwatches
  const [watches, setWatches] = useState([]);
  // State to control how many watches are visible on the page (for infinite scroll)
  const [visibleWatches, setVisibleWatches] = useState(12);
  // Flag indicating whether there are more watches to load
  const [hasMore, setHasMore] = useState(true);
  // State to store any error that occurs during data fetching
  const [error, setError] = useState(null);
  // State to store the current sort option; an empty string means default sorting (newest)
  const [sort, setSort] = useState('');

  // useEffect to fetch smartwatches when the component mounts or when the sort option changes
  useEffect(() => {
    const fetchWatches = async () => {
      try {
        // Make a GET request to the API endpoint for watches,
        // including query parameters for category, sort, page, and limit.
        // In this case, we're filtering for 'smartwatches' and requesting up to 100 items.
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/watches`, {
          params: {
            category: 'smartwatches',
            sort: sort,  // sort parameter can be 'name', '-name', 'price', or '-price'
            page: 1,
            limit: 100,
          },
        });

        // Extract the array of watch objects from the response data
        const fetchedWatches = response.data.data;

        // Check if the fetched data is indeed an array; if not, throw an error
        if (!Array.isArray(fetchedWatches)) {
          throw new Error('Invalid data format from server');
        }

        // Save the fetched watches to state
        setWatches(fetchedWatches);

        // Determine if there are more watches to load.
        // If the total number of fetched watches is less than or equal to 12,
        // then we have no more items to load.
        if (fetchedWatches.length <= 12) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        // Reset the visible watches count to 12 whenever the sort option changes
        setVisibleWatches(12);
      } catch (err) {
        // Log the error and update the error state
        console.error(err);
        setError('Failed to fetch smartwatches.');
      }
    };

    // Call the fetchWatches function whenever the sort state changes
    fetchWatches();
  }, [sort]);

  // Function to load more watches for infinite scrolling
  const fetchMoreData = () => {
    // If the number of visible watches is already equal to or exceeds the number of fetched watches,
    // then disable further loading.
    if (visibleWatches >= watches.length) {
      setHasMore(false);
      return;
    }
    // Simulate a delay (e.g., to show a loader) before revealing more items
    setTimeout(() => {
      setVisibleWatches((prev) => prev + 12);
    }, 500);
  };

  // Handler for when the user selects a new sort option from the dropdown.
  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  // If there is an error fetching the data, display the error message
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.smartwatches}>
      {/* Page title */}
      <h2 className={styles.title}>Smartwatches</h2>

      {/* Sorting Dropdown */}
      <div className={styles.sortContainer}>
        <label htmlFor="sortSelect">Sort by:</label>
        <select
          id="sortSelect"
          className={styles.sortSelect}
          value={sort}
          onChange={handleSortChange}
        >
          {/* Default sort: newest watches first */}
          <option value="">Newest (Default)</option>
          {/* Sort by name in ascending order (A-Z) */}
          <option value="name">Name (A-Z)</option>
          {/* Sort by name in descending order (Z-A) */}
          <option value="-name">Name (Z-A)</option>
          {/* Sort by price in ascending order (Low to High) */}
          <option value="price">Price (Low to High)</option>
          {/* Sort by price in descending order (High to Low) */}
          <option value="-price">Price (High to Low)</option>
        </select>
      </div>

      {/* InfiniteScroll component to lazily load the watches */}
      <InfiniteScroll
        dataLength={visibleWatches}    // Number of items currently visible
        next={fetchMoreData}           // Function to load more items when user scrolls down
        hasMore={hasMore}              // Boolean indicating if more items can be loaded
        loader={<h4 className={styles.loader}>Loading...</h4>}  // Loader shown during fetch
        endMessage={
          <p className={styles.endMessage}>
            <b>You have seen all our smartwatches!</b>
          </p>
        }
      >
        {/* Display the currently visible watches in a grid layout */}
        <div className={styles.productGrid}>
          {watches.slice(0, visibleWatches).map((watch) => (
            <ProductCard key={watch._id} watch={watch} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default SmartWatches;
