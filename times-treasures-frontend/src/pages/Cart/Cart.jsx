// src/pages/Cart/Cart.jsx

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { toast } from 'react-toastify';
import styles from './Cart.module.css';
import { getImageURL } from '../../utils/imageUtil';
import { calculateFinalPrice } from '../../utils/priceUtil';

const Cart = () => {
  const { user, token } = useContext(AuthContext);
  const { cartItems, removeFromCart } = useContext(CartContext);

  // Helper: Extract the watch ID from a cart item.
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
    const unitPrice = calculateFinalPrice(item.watch);
    return acc + unitPrice * item.quantity;
  }, 0);

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
              const unitPrice = calculateFinalPrice(item.watch);
              const isDiscounted = unitPrice < Number(item.watch.price);
              return (
                <li key={index} className={styles.cartItem}>
                  <img
                    src={getImageURL(item.watch.image)}
                    alt={item.watch.name}
                    className={styles.watchImage}
                  />
                  <div className={styles.itemDetails}>
                    <h3>{item.watch.name}</h3>
                    {isDiscounted ? (
                      <div className={styles.priceContainer}>
                        <p className={styles.originalPrice}>
                          <s>₪{(Number(item.watch.price)).toFixed(2)}</s>
                        </p>
                        <span className={styles.arrow}>→</span>
                        <p className={styles.discountedPrice}>
                          ₪{(unitPrice).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p>Price: ₪{(Number(item.watch.price)).toFixed(2)}</p>
                    )}
                    <div className={styles.quantity}>
                      <label>Quantity:</label>
                      <span>{item.quantity}</span>
                    </div>
                    <p>Subtotal: ₪{(unitPrice * item.quantity).toFixed(2)}</p>
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
            <h3>Total: ₪{(totalPrice).toFixed(2)}</h3>
            <Link to="/checkout">
              <button className={styles.checkoutBtn}>Proceed to Checkout</button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
