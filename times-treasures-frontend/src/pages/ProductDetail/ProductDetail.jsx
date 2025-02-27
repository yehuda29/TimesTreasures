// src/pages/ProductDetail/ProductDetail.jsx

import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ProductDetail.module.css';
import axios from 'axios';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { getImageURL } from '../../utils/imageUtil';
import { calculateFinalPrice } from '../../utils/priceUtil';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [watch, setWatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [newInventory, setNewInventory] = useState('');

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
        if (user && user.role === 'admin') {
          setNewInventory(fetchedWatch.inventory);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchWatch();
  }, [id, user]);

  // Calculate final price using the helper function
  const finalPrice = watch ? calculateFinalPrice(watch) : 0;
  const isDiscounted = watch && finalPrice < Number(watch.price);

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to make a purchase");
      navigate("/login");
      return;
    }
  
    if (!watch || !watch._id) {
      console.error("❌ Cannot add to cart: Watch is missing or invalid", watch);
      toast.error("Invalid watch. Please try again.");
      return;
    }
  
    if (watch.inventory === 0) {
      toast.error("This watch is out of stock");
      return;
    }
  
    if (quantity > watch.inventory) {
      toast.error(`Only ${watch.inventory} available in stock`);
      return;
    }
  
    console.log("🛒 Adding watch to cart:", { watch: watch._id, quantity });
  
    addToCart({ watch: String(watch._id), quantity }, token);
    toast.success(`${watch.name} (x${quantity}) added to your cart!`);
  };
  
  

  const handleUpdateStock = async () => {
    try {
      const updatedInventory = Number(newInventory);
      if (isNaN(updatedInventory) || updatedInventory < 0) {
        toast.error('Please enter a valid non-negative number for stock');
        return;
      }
      const localToken = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localToken}`,
        },
      };
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/watches/${id}`,
        { inventory: updatedInventory },
        config
      );
      setWatch(response.data.data);
      toast.success('Stock updated successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update stock');
    }
  };

  const handleInventoryChange = (e) => {
    setNewInventory(e.target.value);
  };

  const handleDeleteWatch = async () => {
    if (!window.confirm('Are you sure you want to delete this watch?')) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`${import.meta.env.VITE_API_URL}/watches/${id}`, config);
      toast.success('Watch deleted successfully');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete watch');
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
      {/* Ensure watch exists before rendering */}
      {watch ? (
        <>
          <img
            src={getImageURL(watch.image) || "https://via.placeholder.com/150"}
            alt={watch.name || "Unnamed Watch"}
            className={styles.productImage}
          />
          <div className={styles.productInfo}>
            <h2 className={styles.productName}>{watch.name || "Unnamed Watch"}</h2>
  
            {isDiscounted ? (
              <div className={styles.priceContainer}>
                <p className={styles.originalPrice}>
                  <s>${watch.price ? Number(watch.price).toFixed(2) : "0.00"}</s>
                </p>
                <span className={styles.arrow}>→</span>
                <p className={styles.discountedPrice}>
                  ${finalPrice.toFixed(2)}
                </p>
                <p className={styles.specialOfferBadge}>
                  {watch.specialOffer?.discountPercentage || 0}% OFF!
                </p>
              </div>
            ) : (
              <p className={styles.productPrice}>
                ${watch.price ? Number(watch.price).toFixed(2) : "0.00"}
              </p>
            )}
  
            <p className={styles.productDescription}>
              {watch.description || "No description available."}
            </p>
            <p className={styles.stockInfo}>
              {watch.inventory > 0 ? `In Stock: ${watch.inventory}` : "Out of Stock"}
            </p>
  
            {watch.inventory > 0 && (
              <div className={styles.quantitySelector}>
                <label htmlFor="quantity">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  max={watch.inventory}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                />
              </div>
            )}
  
            <div className={styles.buttonGroup}>
              <button
                className={styles.addToCartBtn}
                onClick={() => {
                  if (!watch || !watch._id) {
                    console.error("❌ Cannot add to cart: Watch is missing or invalid", watch);
                    return;
                  }
                  handleAddToCart();
                }}
                disabled={!watch._id || watch.inventory === 0}
              >
                {watch.inventory === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
  
              {user && user.role === "admin" && (
                <>
                  <button className={styles.deleteBtn} onClick={handleDeleteWatch}>
                    Delete Watch
                  </button>
                  <div className={styles.updateStock}>
                    <label htmlFor="inventoryUpdate">Update Stock:</label>
                    <input
                      type="number"
                      id="inventoryUpdate"
                      name="inventoryUpdate"
                      min="0"
                      value={newInventory}
                      onChange={handleInventoryChange}
                    />
                    <button className={styles.updateStockBtn} onClick={handleUpdateStock}>
                      Update Stock
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className={styles.errorMessage}>❌ Watch not found.</p>
      )}
    </div>
  );
  
};

export default ProductDetail;
