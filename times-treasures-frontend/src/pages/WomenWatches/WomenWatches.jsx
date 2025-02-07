// src/pages/WomenWatches/WomenWatches.jsx

import React, { useState, useEffect } from 'react';
// Import CSS module for styling the WomenWatches page
import styles from './WomenWatches.module.css';
// Import the ProductCard component to display each watch
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
// Import InfiniteScroll to enable lazy loading as the user scrolls
import InfiniteScroll from 'react-infinite-scroll-component';
// Axios is used for making HTTP requests to the backend API
import axios from 'axios';

const WomenWatches = () => {
  // State to store the list of watches fetched from the backend
  const [watches, setWatches] = useState([]);
  // State to control how many watches are visible on the page (for infinite scroll)
  const [visibleWatches, setVisibleWatches] = useState(12);
  // Flag indicating if there are more watches to load for infinite scrolling
  const [hasMore, setHasMore] = useState(true);
  // State for holding any error message during data fetching
  const [error, setError] = useState(null);

  // State to store the current sort option (e.g., '', 'name', '-name', 'price', '-price')
  const [sort, setSort] = useState('');

  // useEffect to fetch the watches when the component mounts or when the sort option changes.
  // The dependency on [sort] ensures that when the user selects a different sort option, we re-fetch the data.
  useEffect(() => {
    const fetchWatches = async () => {
      try {
        // Make a GET request to the backend endpoint with query parameters:
        // category filters to "women-watches", sort option, page=1, and limit=100 (to fetch up to 100 items)
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/watches`, {
          params: {
            category: 'women-watches',
            sort: sort,       // Pass the current sort option from state
            page: 1,
            limit: 100,
          },
        });
        // Extract the array of watches from the API response (assumed to be in response.data.data)
        const fetchedWatches = response.data.data;

        // Validate that the fetched data is an array
        if (!Array.isArray(fetchedWatches)) {
          throw new Error('Invalid data format from server');
        }

        // Save the fetched watches in state
        setWatches(fetchedWatches);

        // Determine if there are more items to load:
        // If the number of fetched watches is less than or equal to the initial visible count (12),
        // then no additional items are available.
        if (fetchedWatches.length <= 12) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        // Reset the number of visible watches to 12 whenever a new sort option is applied.
        setVisibleWatches(12);
      } catch (err) {
        // Log any errors and update the error state to display an error message
        console.error(err);
        setError("Failed to fetch women's watches.");
      }
    };

    // Call the fetchWatches function whenever the sort option changes
    fetchWatches();
  }, [sort]);

  // Function to handle fetching more items when the user scrolls down
  const fetchMoreData = () => {
    // If the number of visible watches is greater than or equal to the total watches fetched,
    // set hasMore to false to stop further fetching.
    if (visibleWatches >= watches.length) {
      setHasMore(false);
      return;
    }
    // Simulate a delay (e.g., for a loading animation) before increasing the visible count
    setTimeout(() => {
      setVisibleWatches((prev) => prev + 12);
    }, 500);
  };

  // Handler for changes in the sort dropdown
  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  // If an error occurred during fetching, display the error message
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.womenWatches}>
      {/* Page Title */}
      <h2 className={styles.title}>Women's Watches</h2>

      {/* Sorting Dropdown */}
      <div className={styles.sortContainer}>
        <label htmlFor="sortSelect">Sort by:</label>
        <select
          id="sortSelect"
          className={styles.sortSelect}
          value={sort}
          onChange={handleSortChange}
        >
          <option value="">Newest (Default)</option>
          <option value="name">Name (A-Z)</option>
          <option value="-name">Name (Z-A)</option>
          <option value="price">Price (Low to High)</option>
          <option value="-price">Price (High to Low)</option>
        </select>
      </div>

      {/* InfiniteScroll to display the product cards with lazy loading */}
      <InfiniteScroll
        dataLength={visibleWatches} // Number of items currently visible
        next={fetchMoreData}        // Function to call to load more items
        hasMore={hasMore}           // Whether there are more items to load
        loader={<h4 className={styles.loader}>Loading...</h4>} // Loader component while fetching
        endMessage={
          <p className={styles.endMessage}>
            <b>You have seen all our women's watches!</b>
          </p>
        }
      >
        {/* Render the product grid by slicing the watches array to only show "visibleWatches" items */}
        <div className={styles.productGrid}>
          {watches.slice(0, visibleWatches).map((watch) => (
            // Each ProductCard is keyed by the unique watch._id
            <ProductCard key={watch._id} watch={watch} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default WomenWatches;
