// src/pages/LuxuryWatches/LuxuryWatches.jsx

import React, { useState, useEffect } from 'react';
import styles from './LuxuryWatches.module.css';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import InfiniteScroll from 'react-infinite-scroll-component';
import axios from 'axios';

const LuxuryWatches = () => {
  // State to store all fetched watches from the backend.
  const [watches, setWatches] = useState([]);
  // State to control how many watches are currently visible on the page.
  const [visibleWatches, setVisibleWatches] = useState(12);
  // State to determine if more watches are available to load (for infinite scroll).
  const [hasMore, setHasMore] = useState(true);
  // State to store any error messages from the fetch.
  const [error, setError] = useState(null);
  // State to store the selected sort option (e.g., '', 'name', '-name', 'price', '-price').
  const [sort, setSort] = useState('');

  // useEffect to fetch watches when the component mounts or when the sort option changes.
  useEffect(() => {
    const fetchWatches = async () => {
      try {
        // Make a GET request to the watches API endpoint with query parameters:
        // - category: 'luxury-watches' to filter the results,
        // - sort: the selected sorting option,
        // - page: 1 and limit: 100 to fetch up to 100 luxury watches.
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/watches`, {
          params: {
            category: 'luxury-watches',
            sort: sort,
            page: 1,
            limit: 100,
          },
        });
        // Extract the array of watches from the API response.
        const fetchedWatches = response.data.data;

        // Check if the returned data is an array; if not, throw an error.
        if (!Array.isArray(fetchedWatches)) {
          throw new Error('Invalid data format from server');
        }
        // Save the fetched watches to state.
        setWatches(fetchedWatches);

        // Determine if there are more items to load:
        // If the number of fetched watches is less than or equal to the number of visible watches, then there is no more data.
        if (fetchedWatches.length <= 12) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        // Reset the number of visible watches to 12 when a new sort is applied.
        setVisibleWatches(12);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch luxury watches.');
      }
    };

    // Call fetchWatches whenever the sort option changes.
    fetchWatches();
  }, [sort]);

  // Function to load more data for infinite scroll.
  const fetchMoreData = () => {
    // If the visible watches count is greater than or equal to the total watches fetched, disable further loading.
    if (visibleWatches >= watches.length) {
      setHasMore(false);
      return;
    }
    // Simulate a delay before revealing more items.
    setTimeout(() => {
      setVisibleWatches((prev) => prev + 12);
    }, 500);
  };

  // Handler for when the user selects a new sort option from the dropdown.
  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  // If an error occurs during data fetching, display the error message.
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.luxuryWatches}>
      {/* Page Title */}
      <h2 className={styles.title}>Luxury Watches</h2>

      {/* Sorting Dropdown */}
      <div className={styles.sortContainer}>
        <label htmlFor="sortSelect">Sort by:</label>
        <select
          id="sortSelect"
          className={styles.sortSelect}
          value={sort}
          onChange={handleSortChange}
        >
          {/* Default sorting by newest */}
          <option value="">Newest (Default)</option>
          {/* Sorting by name in ascending order */}
          <option value="name">Name (A-Z)</option>
          {/* Sorting by name in descending order */}
          <option value="-name">Name (Z-A)</option>
          {/* Sorting by price in ascending order */}
          <option value="price">Price (Low to High)</option>
          {/* Sorting by price in descending order */}
          <option value="-price">Price (High to Low)</option>
        </select>
      </div>

      {/* Infinite Scroll Component to display watches */}
      <InfiniteScroll
        dataLength={visibleWatches} // Number of items currently visible
        next={fetchMoreData}        // Function to fetch more items when user scrolls down
        hasMore={hasMore}           // Boolean flag indicating if more items are available
        loader={<h4 className={styles.loader}>Loading...</h4>}  // Loader component while fetching
        endMessage={
          <p className={styles.endMessage}>
            <b>You have seen all our luxury watches!</b>
          </p>
        }
      >
        {/* Display the watches in a grid; only show the number specified by visibleWatches */}
        <div className={styles.productGrid}>
          {watches.slice(0, visibleWatches).map((watch) => (
            <ProductCard key={watch._id} watch={watch} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default LuxuryWatches;
