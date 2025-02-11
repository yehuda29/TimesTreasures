// watch-shop-backend/controllers/userController.js
// Purpose: Contains user-related actions beyond auth, such as purchase history and persistent cart management.

const mongoose = require('mongoose');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const Watch = require('../models/Watch'); // Used for verifying the existence of each watch

// @desc    Get purchase history for the logged-in user
// @route   GET /api/users/purchase-history
// @access  Private
exports.getPurchaseHistory = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('purchaseHistory.watch');
  res.status(200).json({
    success: true,
    data: user.purchaseHistory
  });
});

// @desc    Get the persistent cart for the logged-in user
// @route   GET /api/users/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('cart.watch');
  console.log("Fetched cart for user:", req.user.id, "Cart:", user.cart);
  res.status(200).json({
    success: true,
    data: user.cart
  });
});

// @desc    Update the persistent cart for the logged-in user
// @route   POST /api/users/cart
// @access  Private
exports.updateCart = asyncHandler(async (req, res, next) => {
  const { cart } = req.body;
  
  // Validate that "cart" is an array
  if (!Array.isArray(cart)) {
    res.status(400);
    throw new Error('Cart must be an array');
  }

  console.log("Updating cart for user:", req.user.id, "Cart payload:", cart);

  // Validate and cast each cart item
  const updatedCart = await Promise.all(
    cart.map(async (item) => {
      if (!item.watch) {
        throw new Error('Each cart item must have a watch field');
      }
      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        throw new Error('Quantity must be a positive number');
      }
      let watchId;
      try {
        watchId = new mongoose.Types.ObjectId(item.watch);
      } catch (err) {
        console.error("Invalid watch ID:", item.watch, err);
        throw new Error(`Invalid watch ID: ${item.watch}`);
      }
      // Optionally verify that the watch exists
      const existingWatch = await Watch.findById(watchId);
      if (!existingWatch) {
        throw new Error(`Watch not found for ID: ${item.watch}`);
      }
      return { watch: watchId, quantity: item.quantity };
    })
  );

  // Use findByIdAndUpdate with the $set operator for an atomic update.
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { cart: updatedCart } },
    { new: true, runValidators: true }
  ).populate('cart.watch');

  if (!updatedUser) {
    res.status(404);
    throw new Error('User not found');
  }

  console.log("Updated cart for user:", req.user.id, "Cart:", updatedUser.cart);

  res.status(200).json({
    success: true,
    data: updatedUser.cart
  });
});

// @desc    Purchase all items in the user's persistent cart
// @route   POST /api/users/purchase
// @access  Private
exports.purchaseCart = asyncHandler(async (req, res, next) => {
  // Retrieve the user and populate the cart to access watch details
  const user = await User.findById(req.user.id).populate('cart.watch');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (!user.cart || user.cart.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // For each cart item, create a purchase record in the purchaseHistory array
  user.cart.forEach((item) => {
    const totalPrice = item.quantity * (item.watch.price || 0);
    user.purchaseHistory.push({
      watch: item.watch._id,   // Store the watch reference
      quantity: item.quantity,
      totalPrice: totalPrice,
      purchaseDate: new Date()
    });
  });

  // Clear the cart after processing the purchase
  user.cart = [];
  
  // Save the updated user document (persisting the purchase history and cleared cart)
  await user.save();

  res.status(200).json({
    success: true,
    data: user.purchaseHistory
  });
});
