import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import styles from './SearchResults.module.css';

const SearchResults = () => {
  // Retrieve the query parameter from the URL
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');

  // State to store the fetched watches, loading status, and any error messages
  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // If no query is provided, update the error and stop loading
    if (!query || query.trim() === '') {
      setError('No search query provided.');
      setLoading(false);
      return;
    }

    // Define an asynchronous function to fetch search results from the backend
    const fetchSearchResults = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/watches/search`, {
          params: { query }
        });
        // Update state with the fetched watches
        setWatches(response.data.data);
      } catch (err) {
        // If an error occurs, set an error message
        setError(err.response?.data?.message || 'Error fetching search results.');
      } finally {
        // Set loading to false once the request is complete
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  // Render loading state
  if (loading) {
    return <div className={styles.loader}>Loading...</div>;
  }

  // Render error message if any
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  // Render search results
  return (
    <div className={styles.searchResults}>
      <h2>Search Results for "{query}"</h2>
      {watches.length === 0 ? (
        <p>No watches found matching your query.</p>
      ) : (
        <div className={styles.resultsGrid}>
          {watches.map((watch) => (
            <ProductCard key={watch._id} watch={watch} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
