// src/pages/ProductDetail/ProductDetail.jsx

import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ProductDetail.module.css';
import axios from 'axios';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { getImageURL } from '../../utils/imageUtil';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [watch, setWatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  // New state for updating inventory (for admin use)
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
        // If admin, prefill the newInventory field with current stock
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

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to make a purchase');
      navigate('/login');
      return;
    }
    if (watch) {
      // Check available stock before adding to cart
      if (watch.inventory === 0) {
        toast.error('This watch is out of stock');
        return;
      }
      if (quantity > watch.inventory) {
        toast.error(`Only ${watch.inventory} available in stock`);
        return;
      }
      const validQuantity = quantity < 1 ? 1 : quantity;
      addToCart({ _id: watch._id, quantity: validQuantity }, token);
      toast.success(`${watch.name} (x${validQuantity}) added to your cart!`);
    }
  };

  // Handler for admin to update the stock/inventory
  const handleUpdateStock = async () => {
    try {
      // Prepare payload with updated inventory value.
      const updatedInventory = Number(newInventory);
      if (isNaN(updatedInventory) || updatedInventory < 0) {
        toast.error('Please enter a valid non-negative number for stock');
        return;
      }
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      // Send a PUT request to update the watch. We only send the inventory field.
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/watches/${id}`,
        { inventory: updatedInventory },
        config
      );
      // Update local state with new watch data
      setWatch(response.data.data);
      toast.success('Stock updated successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update stock');
    }
  };

  // New handler for admin inventory input change
  const handleInventoryChange = (e) => {
    setNewInventory(e.target.value);
  };

  // Handler for admin deletion of the watch.
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
      <img src={getImageURL(watch.image)} alt={watch.name} className={styles.productImage} />
      <div className={styles.productInfo}>
        <h2 className={styles.productName}>{watch.name}</h2>
        <p className={styles.productPrice}>${Number(watch.price).toFixed(2)}</p>
        <p className={styles.productDescription}>{watch.description}</p>
        <p className={styles.stockInfo}>
          {watch.inventory > 0 ? `In Stock: ${watch.inventory}` : 'Out of Stock'}
        </p>
        {/* Only show quantity selector if the item is in stock */}
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
            disabled={watch.inventory === 0}
          >
            {watch.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          {user && user.role === 'admin' && (
            <>
              <button className={styles.deleteBtn} onClick={handleDeleteWatch}>
                Delete Watch
              </button>
              {/* Admin: Update Stock Section */}
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
    </div>
  );
};

export default ProductDetail;
