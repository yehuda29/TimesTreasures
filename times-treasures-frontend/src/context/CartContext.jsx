// src/context/CartContext.jsx

import React, { createContext, useState, useEffect } from 'react';

// Create the Cart Context
export const CartContext = createContext();

// Create a Provider Component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart items from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Function to add an item to the cart
  const addToCart = (watch) => {
    setCartItems((prevItems) => {
      // Check if the item is already in the cart
      const existingItem = prevItems.find(item => item._id === watch._id);
      if (existingItem) {
        // If it exists, increase the quantity
        return prevItems.map(item =>
          item._id === watch._id ? { ...item, quantity: item.quantity + watch.quantity } : item
        );
      } else {
        // If it doesn't exist, add it with the specified quantity
        return [...prevItems, { ...watch, quantity: watch.quantity }];
      }
    });
  };

  // Function to remove an item from the cart
  const removeFromCart = (watchId) => {
    setCartItems((prevItems) => prevItems.filter(item => item._id !== watchId));
  };

  // Function to clear the cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Function to update the quantity of a specific cart item
  const updateCartItemQuantity = (watchId, newQuantity) => {
    setCartItems((prevItems) => {
      return prevItems.map(item =>
        item._id === watchId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, updateCartItemQuantity }}>
      {children}
    </CartContext.Provider>
  );
};
