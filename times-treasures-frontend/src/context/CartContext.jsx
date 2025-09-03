// src/context/CartContext.jsx

import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user, token } = useContext(AuthContext);

  // Helper: Extract the watch ID from a cart item.
  const getWatchId = (item) => {
    if (!item || !item.watch) {
      console.error("❌ Error: Trying to get _id from a null watch item:", item);
      return null; // Return null instead of crashing
    }
    return typeof item.watch === "object" ? item.watch._id : item.watch;
  };
  
  

  /**
   * Fetch the user's cart from the backend.
   * Expects the backend to populate the 'cart.watch' field.
   */
  const fetchCart = useCallback(async (token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/cart`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setCartItems(response.data.data);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  }, []);

  /**
   * Update the user's cart on the backend.
   * @param {string} token - The JWT token for authorization.
   * @param {Array} newCart - The new cart items array.
   */
  const updateCartOnServer = useCallback(async (token, newCart) => {
    try {
      console.log("📡 Sending Cart Update to Server:", newCart);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/cart`,
        { cart: newCart },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
  
      console.log("✅ Server Response:", response.data);
      setCartItems(response.data.data);
    } catch (err) {
      console.error("❌ Error updating cart on server:", err.response?.data || err);
      toast.error("Failed to update cart.");
    }
  }, []);
  

  const addToCart = (item, token) => {
    // Use getWatchId to retrieve the watch ID from the item.
    const incomingWatchId = getWatchId(item);
    if (!item || !item.watch || !incomingWatchId) {
      console.error("❌ Skipping invalid item (missing watch or _id):", item);
      return;
    }
  
    setCartItems((prevItems) => {
      // Find if an item with the same watch ID already exists.
      const existingItem = prevItems.find((i) => getWatchId(i) === incomingWatchId);
      let updatedCart;
      
      if (existingItem) {
        // If it exists, update its quantity.
        updatedCart = prevItems.map((i) =>
          getWatchId(i) === incomingWatchId
            ? { watch: item.watch, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        // Otherwise, add the new item.
        updatedCart = [...prevItems, { watch: item.watch, quantity: item.quantity }];
      }
  
      // Update the cart on the server using the correct watch ID.
      updateCartOnServer(
        token,
        updatedCart.map((cartItem) => ({
          watch: getWatchId(cartItem),
          quantity: cartItem.quantity,
        }))
      );
  
      return updatedCart;
    });
  };
  
  

  /**
   * Remove an item from the cart.
   */
  const removeFromCart = (watchId, token) => {
    setCartItems((prevItems) => {
      const updatedCart = prevItems.filter(
        (item) => getWatchId(item).toString() !== watchId.toString()
      );
      updateCartOnServer(token, updatedCart);
      return updatedCart;
    });
  };

  /**
   * Clear the cart on the backend.
   */
  const clearCart = async (token) => {
    setCartItems([]);
    await updateCartOnServer(token, []);
  };

  /**
   * Update the quantity of a specific cart item.
   */
  const updateCartItemQuantity = (watchId, newQuantity, token) => {
    setCartItems((prevItems) => {
      const updatedCart = prevItems.map((item) =>
        getWatchId(item).toString() === watchId.toString()
          ? { watch: getWatchId(item), quantity: newQuantity }
          : item
      );
      updateCartOnServer(token, updatedCart);
      return updatedCart;
    });
  };

  // Fetch the user's persistent cart on login or token change.
  useEffect(() => {
    if (user && token) {
      fetchCart(token);
    } else {
      setCartItems([]);
    }
  }, [user, token, fetchCart]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        fetchCart,
        addToCart,
        removeFromCart,
        clearCart,
        updateCartItemQuantity,
        updateCartOnServer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
