// src/pages/ProductDetail/ProductDetail.jsx

import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ProductDetail.module.css';
import axios from 'axios';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  // Extract the watch ID from the URL using useParams
  const { id } = useParams();
  const navigate = useNavigate();

  // State to store the fetched watch data; initially null
  const [watch, setWatch] = useState(null);
  // Loading state to indicate if the watch data is being fetched
  const [loading, setLoading] = useState(true);
  // Error state to track any issues during the fetch process
  const [error, setError] = useState(false);

  // State for managing the quantity of the watch the user wishes to add to the cart
  const [quantity, setQuantity] = useState(1);

  // Retrieve the addToCart function from CartContext so we can add the watch to the cart
  const { addToCart } = useContext(CartContext);
  // Retrieve the user and token from AuthContext
  const { user, token } = useContext(AuthContext);

  // useEffect to fetch the watch data when the component mounts or when the 'id' changes
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

  // Function to handle adding the current watch to the cart
  const handleAddToCart = () => {
    // If no user is logged in, display a toast message and do not add the item
    if (!user) {
      toast.error('Please Login to make a purchase');
      return;
    }
    if (watch) {
      const validQuantity = quantity < 1 ? 1 : quantity;
      // Call addToCart from CartContext, passing the watch's details and the selected quantity
      addToCart({
        _id: watch._id,
        name: watch.name,
        price: watch.price,
        image: watch.image,
        quantity: validQuantity,
      }, token);
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
