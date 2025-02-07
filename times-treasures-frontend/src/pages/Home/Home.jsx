// src/pages/Home/Home.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Import the ProductCard component to display individual watch items
import ProductCard from '../../components/ProductCard/ProductCard';
// Import InfiniteScroll to enable lazy loading of watch cards as the user scrolls
import InfiniteScroll from 'react-infinite-scroll-component';
// Import CSS module for styling this page
import styles from './Home.module.css';
// Import HeroSection component for the top banner area
import HeroSection from '../../components/HeroSection/HeroSection';

const Home = () => {
  // State to store all fetched watches
  const [watches, setWatches] = useState([]);
  // State to control how many watches are currently visible on the page
  const [page, setPage] = useState(1);         // Current page number for pagination
  const [limit] = useState(12);                // Number of watches to fetch per request
  // State that indicates whether there are more watches to load (for infinite scroll)
  const [hasMore, setHasMore] = useState(true);
  // State to hold any error messages during fetching
  const [error, setError] = useState(null);
  
  // State to store the previous page number, to help avoid duplicate fetches
  const [prevPage, setPrevPage] = useState(null);

  // useEffect that runs whenever 'page', 'hasMore', 'limit', or 'prevPage' changes.
  // It fetches the watch data from the backend.
  useEffect(() => {
    const fetchWatches = async () => {
      try {
        // If there is no more data to fetch, exit early
        if (!hasMore) return;
        // If the page hasn't changed compared to the previous fetch, skip fetching
        if (page === prevPage) return;

        // Update prevPage to the current page to prevent duplicate requests
        setPrevPage(page);

        // Make an HTTP GET request to the backend API to fetch watches
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/watches`, {
          params: {
            page,   // Current page number
            limit,  // Number of items per page
          },
        });

        console.log(`Fetching page=${page}`, response.data);

        // Destructure the fetched data and total count from the API response
        const fetchedWatches = response.data.data; // Expected to be an array of watch objects
        const totalWatches = response.data.total;    // Total number of watches in the database

        // If the response data is an array, update the watches state
        if (Array.isArray(fetchedWatches)) {
          setWatches((prevWatches) => {
            // Filter out duplicates in case the backend returned the same watch again
            const newUniqueItems = fetchedWatches.filter(
              (newItem) => !prevWatches.some((oldItem) => oldItem._id === newItem._id)
            );

            const updatedWatches = [...prevWatches, ...newUniqueItems];

            // If the total number of items in updatedWatches meets or exceeds the total count,
            // set hasMore to false so no further fetches occur.
            if (updatedWatches.length >= totalWatches) {
              setHasMore(false);
            }
            return updatedWatches;
          });
        } else {
          // If fetchedWatches is not an array, throw an error
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        // Log any errors to the console and update the error state
        console.error('Error fetching watches:', err);
        setError('Failed to fetch watches.');
      }
    };

    // Call the fetchWatches function whenever the dependencies change
    fetchWatches();
  }, [page, hasMore, limit, prevPage]);

  // Function called by the InfiniteScroll component to load more data
  const fetchMoreData = () => {
    // If the number of visible watches is greater than or equal to total fetched, disable further fetching
    if (visibleWatches >= watches.length) {
      setHasMore(false);
      return;
    }
    // Simulate a delay before showing more items (could be replaced by a real fetch)
    setTimeout(() => {
      setVisibleWatches((prev) => prev + 12);
    }, 500);
  };

  // If an error occurred during data fetching, display an error message
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.home}>
      {/* Render the HeroSection component at the top */}
      <HeroSection />

      {/* Featured Watches Section */}
      <section className={styles.featured}>
        <h2 className={styles.sectionTitle}>Featured Watches</h2>
        {/* InfiniteScroll handles lazy loading: as the user scrolls, next pages are loaded */}
        <InfiniteScroll
          dataLength={watches.length} // Total number of items currently loaded
          next={fetchMoreData}        // Function to load more data
          hasMore={hasMore}           // Whether there is more data to load
          loader={<h4 className={styles.loader}>Loading...</h4>} // Loader UI while fetching
          endMessage={
            <p className={styles.endMessage}>
              <b>You've seen all our featured watches!</b>
            </p>
          }
        >
          {/* Display the currently visible watches */}
          <div className={styles.productGrid}>
            {watches.slice(0, visibleWatches).map((watch) => (
              <ProductCard key={watch._id} watch={watch} />
            ))}
          </div>
        </InfiniteScroll>
      </section>
    </div>
  );
};

export default Home;
