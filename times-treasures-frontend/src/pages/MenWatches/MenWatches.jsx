// src/pages/MenWatches/MenWatches.jsx
import React, { useState, useEffect } from 'react';
import styles from './MenWatches.module.css';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import InfiniteScroll from 'react-infinite-scroll-component';
import axios from 'axios';

const MenWatches = () => {
  const [watches, setWatches] = useState([]);
  const [visibleWatches, setVisibleWatches] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // store the selected "sort" (defaults to empty => sort by createdAt desc)
  const [sort, setSort] = useState('');

  // This effect fetches data from the server whenever "sort" changes
  useEffect(() => {
    const fetchWatches = async () => {
      try {
        // We'll set "page"=1, "limit"=100 so we get all men-watches in one request
        // and then do local infinite scroll
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/watches`, {
          params: {
            category: 'men-watches',
            sort: sort,       // e.g. "name", "-price", etc.
            page: 1,
            limit: 100,
          },
        });
        const fetchedWatches = response.data.data;

        if (!Array.isArray(fetchedWatches)) {
          throw new Error('Invalid data format from server');
        }

        setWatches(fetchedWatches);

        // If fetchedWatches <= visibleWatches, no more to reveal
        if (fetchedWatches.length <= visibleWatches) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch men's watches.");
      }
    };

    // reset visibleWatches to 12 whenever we change sort
    setVisibleWatches(12);
    fetchWatches();
  }, [sort]);

  // The local infinite scroll that reveals more items
  const fetchMoreData = () => {
    if (visibleWatches >= watches.length) {
      setHasMore(false);
      return;
    }
    setTimeout(() => {
      setVisibleWatches((prev) => prev + 12);
    }, 500);
  };

  // Handler for user picking a sort option from a dropdown
  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.menWatches}>
      <h2 className={styles.title}>Men's Watches</h2>

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

      {/* Infinite Scroll from local array */}
      <InfiniteScroll
        dataLength={visibleWatches}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<h4 className={styles.loader}>Loading...</h4>}
        endMessage={
          <p className={styles.endMessage}>
            <b>You've seen all our men's watches!</b>
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

export default MenWatches;
