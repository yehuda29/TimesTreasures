// src/pages/WatchDetail/WatchDetail.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import styles from './WatchDetail.module.css'; 

const WatchDetail = () => {
  const { id } = useParams(); // Watch ID from URL
  const { user, token } = useContext(AuthContext);
  const [watch, setWatch] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatch = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/watches/${id}`);
        setWatch(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching watch:', err);
        toast.error('Failed to fetch watch details');
        setLoading(false);
      }
    };

    fetchWatch();
  }, [id]);

  const addToCart = () => {
    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = existingCart.findIndex(item => item.watch._id === watch._id);
    if (itemIndex > -1) {
      existingCart[itemIndex].quantity += quantity;
    } else {
      existingCart.push({ watch, quantity });
    }
    localStorage.setItem('cart', JSON.stringify(existingCart));
    toast.success('Added to cart');
  };

  const makePurchase = async () => {
    if (!user) {
      toast.error('Please login to make a purchase');
      return;
    }
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
      await axios.post(`${import.meta.env.VITE_API_URL}/purchase`, { watchId: watch._id, quantity }, config);
      toast.success('Purchase successful');
      // Optionally, redirect or update purchase history
    } catch (err) {
      console.error('Error making purchase:', err);
      toast.error(err.response?.data?.message || 'Purchase failed');
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!watch) return <div>Watch not found</div>;

  return (
    <div className={styles.watchDetailContainer}>
      <img src={watch.image} alt={watch.name} className={styles.watchImage} />
      <div className={styles.watchInfo}>
        <h2>{watch.name}</h2>
        <p className={styles.price}>${watch.price.toFixed(2)}</p>
        <p className={styles.description}>{watch.description}</p>
        <div className={styles.actions}>
          <label htmlFor="quantity">Quantity:</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={quantity}
            min="1"
            onChange={e => setQuantity(parseInt(e.target.value))}
          />
          <button onClick={addToCart} className={styles.addToCartBtn}>Add to Cart</button>
          <button onClick={makePurchase} className={styles.purchaseBtn}>Buy Now</button>
        </div>
      </div>
    </div>
  );
};

export default WatchDetail;
