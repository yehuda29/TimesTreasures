// src/pages/ProductDetail/ProductDetail.jsx

import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ProductDetail.module.css';
import axios from 'axios';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [watch, setWatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    const fetchWatch = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/watches/${id}`);
        const fetchedWatch = response.data.data;
        if (!fetchedWatch || typeof fetchedWatch !== 'object') {
          throw new Error('Invalid watch data');
        }
        setWatch(fetchedWatch);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchWatch();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please Login to make a purchase');
      navigate('/login');
      return;
    }
    if (watch) {
      const validQuantity = quantity < 1 ? 1 : quantity;
      // Only store the watch's _id and quantity in the persistent cart.
      addToCart({ _id: watch._id, quantity: validQuantity }, token);
      toast.success(`${watch.name} (x${validQuantity}) added to your cart!`);
    }
  };

  if (loading) return <p className={styles.loader}>Loading...</p>;
  if (error || !watch) {
    return (
      <div className={styles.productDetail}>
        <h2>Watch Not Found</h2>
        <p>The watch you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className={styles.productDetail}>
      <img src={watch.image} alt={watch.name} className={styles.productImage} />
      <div className={styles.productInfo}>
        <h2 className={styles.productName}>{watch.name}</h2>
        <p className={styles.productPrice}>${Number(watch.price).toFixed(2)}</p>
        <p className={styles.productDescription}>{watch.description}</p>
        <div className={styles.quantitySelector}>
          <label htmlFor="quantity">Quantity:</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="1"
            max="100"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
          />
        </div>
        <button className={styles.addToCartBtn} onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
