// src/pages/Cart/Cart.jsx

import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from './Cart.module.css';
import PaymentButton from '../../components/PaymentButton/PaymentButton.jsx';

const Cart = () => {
  // Retrieve user and token from AuthContext
  const { user, token } = useContext(AuthContext);
  // Retrieve cart items and manipulation functions from CartContext
  const { cartItems, removeFromCart, clearCart, updateCartItemQuantity } = useContext(CartContext);

  // If user is not logged in, inform them (or you could also redirect to /login)
  if (!user) {
    return (
      <div className={styles.cartContainer}>
        <h2>Your Cart</h2>
        <p>Please <a href="/login">login</a> to view your cart.</p>
      </div>
    );
  }

  // Calculate the total price of all cart items.
  // Assume the backend populates each cart item so that item.watch contains the full watch document.
  const totalPrice = cartItems.reduce((acc, item) => {
    // Use optional chaining in case the watch is not populated
    const price = item.watch?.price ? Number(item.watch.price) : 0;
    return acc + (price * item.quantity);
  }, 0);

  // Function to handle purchase (e.g., via PayPal)
  const makePurchase = async () => {
    if (!user) {
      toast.error('Please login to make a purchase');
      return;
    }
    try {
      for (const item of cartItems) {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        };
        await axios.post(
          `${import.meta.env.VITE_API_URL}/purchase`,
          {
            watchId: item._id, // or item.watch._id if populated
            quantity: item.quantity
          },
          config
        );
      }
      toast.success('Purchase successful');
      clearCart(token);
    } catch (err) {
      console.error('Error making purchase:', err);
      toast.error(err.response?.data?.message || 'Purchase failed');
    }
  };

  return (
    <div className={styles.cartContainer}>
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className={styles.cartList}>
            {cartItems.map((item, index) => {
              // Check if the watch field is populated
              if (!item.watch || typeof item.watch !== 'object') return null;
              return (
                <li key={index} className={styles.cartItem}>
                  <img
                    src={item.watch.image}
                    alt={item.watch.name}
                    className={styles.watchImage}
                  />
                  <div className={styles.itemDetails}>
                    <h3>{item.watch.name}</h3>
                    <p>Price: ${item.watch.price ? Number(item.watch.price).toFixed(2) : '0.00'}</p>
                    <div className={styles.quantity}>
                      <label>Quantity:</label>
                      <input
                        type="number"
                        value={item.quantity}
                        min="1"
                        onChange={(e) =>
                          updateCartItemQuantity(item.watch._id, parseInt(e.target.value, 10), token)
                        }
                      />
                    </div>
                    <button
                      onClick={() => removeFromCart(item.watch._id, token)}
                      className={styles.removeBtn}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className={styles.cartSummary}>
            <h3>Total: ${totalPrice.toFixed(2)}</h3>
            <PaymentButton amount={totalPrice.toFixed(2)} onSuccess={() => makePurchase()} />
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
