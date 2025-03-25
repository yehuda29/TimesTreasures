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
  
  // New state variables for special offer details
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [offerStart, setOfferStart] = useState('');
  const [offerEnd, setOfferEnd] = useState('');

  // Access cartItems and addToCart from CartContext
  const { cartItems, addToCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);

  // Fetch the watch data from the backend
  useEffect(() => {
    const fetchWatch = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/watches/${id}`);
        const fetchedWatch = response.data.data;
        if (!fetchedWatch || typeof fetchedWatch !== 'object') {
          throw new Error('Invalid watch data');
        }
        setWatch(fetchedWatch);
        // If admin, initialize inventory and special offer state
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

  // Update special offer state when the watch is fetched (for admin users)
  useEffect(() => {
    if (watch && user && user.role === 'admin') {
      setDiscountPercentage(watch.specialOffer?.discountPercentage || 0);
      setOfferStart(
        watch.specialOffer?.offerStart
          ? new Date(watch.specialOffer.offerStart).toISOString().substr(0, 10)
          : ''
      );
      setOfferEnd(
        watch.specialOffer?.offerEnd
          ? new Date(watch.specialOffer.offerEnd).toISOString().substr(0, 10)
          : ''
      );
    }
  }, [watch, user]);

  // Calculate final price using the helper function
  const finalPrice = watch ? calculateFinalPrice(watch) : 0;
  const isDiscounted = watch && finalPrice < Number(watch.price);

  // Handler for adding the watch to the cart with cumulative check
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
  
    // Calculate the current quantity of this watch already in the cart
    const existingCartItem = cartItems.find(item => {
      // Handle both object and string type for item.watch
      return (typeof item.watch === "object" ? item.watch._id : item.watch) === watch._id;
    });
    const currentQuantityInCart = existingCartItem ? existingCartItem.quantity : 0;
  
    // Check if adding the new quantity would exceed available inventory
    if (quantity + currentQuantityInCart > watch.inventory) {
      toast.error(`You can only add ${watch.inventory - currentQuantityInCart} more of this watch to your cart`);
      return;
    }
  
    console.log("🛒 Adding watch to cart:", { watch: watch._id, quantity });
  
    addToCart({ watch: String(watch._id), quantity }, token);
    toast.success(`${watch.name} (x${quantity}) added to your cart!`);
  };
  
  // Handler for updating stock (for admin)
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

  // Handler for updating the special offer (for admin)
  const handleUpdateSpecialOffer = async () => {
    try {
      // Build the specialOffer object from state
      const updatedOffer = {
        discountPercentage: Number(discountPercentage),
        offerStart: offerStart ? new Date(offerStart) : null,
        offerEnd: offerEnd ? new Date(offerEnd) : null,
      };
      const localToken = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localToken}`,
        },
      };
      // Send PUT request to update the watch with the new special offer
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/watches/${id}`,
        { specialOffer: updatedOffer },
        config
      );
      setWatch(response.data.data);
      toast.success('Special offer updated successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update special offer');
    }
  };

  // Handler for deleting the watch (for admin)
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
      {watch && (
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
                  <s>₪{watch.price ? (Number(watch.price)).toFixed(2) : "0.00"}</s>
                </p>
                <span className={styles.arrow}>→</span>
                <p className={styles.discountedPrice}>
                  ₪{(finalPrice).toFixed(2)}
                </p>
                <p className={styles.specialOfferBadge}>
                  {watch.specialOffer?.discountPercentage || 0}% OFF!
                </p>
              </div>
            ) : (
              <p className={styles.productPrice}>
                ₪{watch.price ? (Number(watch.price)).toFixed(2) : "0.00"}
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
                onClick={handleAddToCart}
                disabled={!watch._id || watch.inventory === 0}
              >
                {watch.inventory === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
  
              {/* Admin-only controls */}
              {user && user.role === "admin" && (
                <>
                  <button className={styles.deleteBtn} onClick={handleDeleteWatch}>
                    Delete Watch
                  </button>
                </>
              )}
              
              {user && user.role === "admin" && (
                <button 
                  className={styles.adminUpdateBtn} 
                  onClick={() => navigate(`/admin/watch-update/${id}`)}
                >
                  Update Watch Details
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductDetail;
