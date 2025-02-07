// src/pages/Cart/Cart.jsx

import React, { useContext } from 'react';
// Import AuthContext to access authentication info (user, token)
import { AuthContext } from '../../context/AuthContext';
// Import CartContext to access cart-related state and actions
import { CartContext } from '../../context/CartContext';
import axios from 'axios';
// Import toast for displaying notifications
import { toast } from 'react-toastify';
import styles from './Cart.module.css';

const Cart = () => {
  // Retrieve user and token from the AuthContext for authentication
  const { user, token } = useContext(AuthContext);

  // Retrieve cart items and cart manipulation functions from CartContext
  const {
    cartItems,
    removeFromCart,
    clearCart,
    updateCartItemQuantity
  } = useContext(CartContext);

  // Function to handle the purchase process for the items in the cart
  const makePurchase = async () => {
    // If the user is not logged in, show an error notification
    if (!user) {
      toast.error('Please login to make a purchase');
      return;
    }
    try {
      // Loop through each item in the cart
      for (const item of cartItems) {
        // Configure the request headers with content type and authorization token
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        };

        // Send a POST request to the purchase endpoint for each cart item
        await axios.post(
          `${import.meta.env.VITE_API_URL}/purchase`,
          {
            watchId: item._id, // Use the watch's _id as identifier
            quantity: item.quantity
          },
          config
        );
      }
      // If all purchase requests succeed, show a success message and clear the cart
      toast.success('Purchase successful');
      clearCart(); // Clears the cart in the context (and subsequently in localStorage)
    } catch (err) {
      // Log any errors and display an error notification with a message
      console.error('Error making purchase:', err);
      toast.error(err.response?.data?.message || 'Purchase failed');
    }
  };

  // Calculate the total price of all cart items (price multiplied by quantity)
  const totalPrice = cartItems.reduce((acc, item) => {
    return acc + (item.price * item.quantity);
  }, 0);

  return (
    <div className={styles.cartContainer}>
      <h2>Your Cart</h2>
      {/* If the cart is empty, display a message; otherwise, render the cart items */}
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {/* List of cart items */}
          <ul className={styles.cartList}>
            {cartItems.map((item, index) => (
              <li key={index} className={styles.cartItem}>
                {/* Display the watch image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className={styles.watchImage}
                />
                <div className={styles.itemDetails}>
                  {/* Display the watch name */}
                  <h3>{item.name}</h3>
                  {/* Display the watch price formatted to two decimals */}
                  <p>Price: ${item.price.toFixed(2)}</p>
                  {/* Quantity selector for the cart item */}
                  <div className={styles.quantity}>
                    <label>Quantity:</label>
                    <input
                      type="number"
                      value={item.quantity}
                      min="1"
                      // Update the cart item's quantity on change using the context function
                      onChange={(e) =>
                        updateCartItemQuantity(item._id, parseInt(e.target.value, 10))
                      }
                    />
                  </div>
                  {/* Button to remove the item from the cart using the context function */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className={styles.removeBtn}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {/* Cart summary showing the total price and a button to proceed to purchase */}
          <div className={styles.cartSummary}>
            <h3>Total: ${totalPrice.toFixed(2)}</h3>
            <button onClick={makePurchase} className={styles.purchaseBtn}>
              Proceed to Purchase
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
