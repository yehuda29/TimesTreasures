// src/pages/Cart/Cart.jsx

import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from './Cart.module.css';
import PaymentButton from '../../components/PaymentButton/PaymentButton.jsx';

const Cart = () => {
  const { user, token } = useContext(AuthContext);
  const { cartItems, removeFromCart, clearCart, updateCartItemQuantity } = useContext(CartContext);

  // Helper: Extract watch ID
  const getWatchId = (item) =>
    typeof item.watch === 'object' ? item.watch._id : item.watch;

  if (!user) {
    return (
      <div className={styles.cartContainer}>
        <h2>Your Cart</h2>
        <p>Please <a href="/login">login</a> to view your cart.</p>
      </div>
    );
  }

  const totalPrice = cartItems.reduce((acc, item) => {
    const price = item.watch?.price ? Number(item.watch.price) : 0;
    return acc + price * item.quantity;
  }, 0);

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
            Authorization: `Bearer ${token}`,
          },
        };
        await axios.post(
          `${import.meta.env.VITE_API_URL}/purchase`,
          {
            watchId: getWatchId(item),
            quantity: item.quantity,
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
                    <p>
                      Price: $
                      {item.watch.price
                        ? Number(item.watch.price).toFixed(2)
                        : '0.00'}
                    </p>
                    <div className={styles.quantity}>
                      <label>Quantity:</label>
                      {/* Quantity is now read-only */}
                      <span>{item.quantity}</span>
                    </div>
                    <button
                      onClick={() => removeFromCart(getWatchId(item), token)}
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
