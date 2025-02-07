// src/pages/WatchList/WatchList.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../../components/ProductCard/ProductCard';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';
import styles from './WatchList.module.css'; 


const WatchList = () => {
  const { category } = useParams(); // e.g., 'men-watches'
  const [watches, setWatches] = useState([]);
  const [visibleWatches, setVisibleWatches] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWatches = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/watches`, {
          params: {
            category,
            page: 1,
            limit: 100
          }
        });
        setWatches(response.data.data);
        if (response.data.data.length <= visibleWatches) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (err) {
        console.error('Error fetching watches:', err);
        setError('Failed to fetch watches.');
      }
    };

    fetchWatches();
  }, [category, visibleWatches]);

  const fetchMoreData = () => {
    if (visibleWatches >= watches.length) {
      setHasMore(false);
      return;
    }
    // Simulate fetching data
    setTimeout(() => {
      setVisibleWatches(prev => prev + 12);
    }, 500);
  };

  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.watchListContainer}>
      <h2>{category.replace('-', ' ').toUpperCase()}</h2>
      <InfiniteScroll
        dataLength={visibleWatches}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<h4 className={styles.loader}>Loading...</h4>}
        endMessage={
          <p className={styles.endMessage}>
            <b>You've seen all watches in this category!</b>
          </p>
        }
      >
        <div className={styles.productGrid}>
          {watches.slice(0, visibleWatches).map(watch => (
            <ProductCard key={watch._id} watch={watch} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default WatchList;
