// watch-shop-backend/controllers/userController.js
// Purpose: Contains user-related actions beyond authentication, such as retrieving a user's purchase history,
// managing the persistent cart, and processing purchases.

const mongoose = require('mongoose'); // Import Mongoose for MongoDB interactions.
const User = require('../models/User'); // Import the User model.
const asyncHandler = require('express-async-handler'); // Utility to handle async errors in route handlers.
const Watch = require('../models/Watch'); // Import the Watch model, used to verify watch existence in cart items.

// -----------------------------------------------------------------------------
// GET PURCHASE HISTORY
// -----------------------------------------------------------------------------
// @desc    Get purchase history for the logged-in user
// @route   GET /api/users/purchase-history
// @access  Private
exports.getPurchaseHistory = asyncHandler(async (req, res, next) => {
  // Find the user by the ID (populated by the authentication middleware) and populate the 'watch' field
  // inside each purchase history record so that full watch details (like image, name, etc.) are available.
  const user = await User.findById(req.user.id).populate('purchaseHistory.watch');
  
  // Respond with a success flag and the user's purchase history.
  res.status(200).json({
    success: true,
    data: user.purchaseHistory
  });
});

// -----------------------------------------------------------------------------
// GET PERSISTENT CART
// -----------------------------------------------------------------------------
// @desc    Get the persistent cart for the logged-in user
// @route   GET /api/users/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
  // Find the user by their ID and populate the 'watch' field within the cart items
  const user = await User.findById(req.user.id).populate('cart.watch');
  
  // Log the fetched cart for debugging purposes.
  console.log("Fetched cart for user:", req.user.id, "Cart:", user.cart);
  
  // Return the user's cart in the response.
  res.status(200).json({
    success: true,
    data: user.cart
  });
});

// -----------------------------------------------------------------------------
// UPDATE PERSISTENT CART
// -----------------------------------------------------------------------------
// @desc    Update the persistent cart for the logged-in user
// @route   POST /api/users/cart
// @access  Private
exports.updateCart = asyncHandler(async (req, res, next) => {
  // Destructure the 'cart' array from the request body.
  const { cart } = req.body;
  
  // Validate that "cart" is an array.
  if (!Array.isArray(cart)) {
    res.status(400);
    throw new Error('Cart must be an array');
  }

  // Log the cart payload for debugging.
  console.log("Updating cart for user:", req.user.id, "Cart payload:", cart);

  // Process and validate each item in the incoming cart array.
  // For each cart item, we verify that it includes a valid watch ID and a positive quantity.
  const updatedCart = await Promise.all(
    cart.map(async (item) => {
      // Ensure the item includes a watch field.
      if (!item.watch) {
        throw new Error('Each cart item must have a watch field');
      }
      // Ensure the quantity is a positive number.
      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        throw new Error('Quantity must be a positive number');
      }
      let watchId;
      try {
        // Convert the watch field to a valid MongoDB ObjectId.
        watchId = new mongoose.Types.ObjectId(item.watch);
      } catch (err) {
        console.error("Invalid watch ID:", item.watch, err);
        throw new Error(`Invalid watch ID: ${item.watch}`);
      }
      // verify that the watch exists in the database.
      const existingWatch = await Watch.findById(watchId);
      if (!existingWatch) {
        throw new Error(`Watch not found for ID: ${item.watch}`);
      }
      // Return a new object containing the watch reference and its quantity.
      return { watch: watchId, quantity: item.quantity };
    })
  );

  // Atomically update the user's cart using the $set operator.
  // This replaces the existing cart with the validated updated cart.
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { cart: updatedCart } },
    { new: true, runValidators: true } // Return the updated document and run schema validations.
  ).populate('cart.watch'); // Populate the 'watch' field for the updated cart items.

  if (!updatedUser) {
    res.status(404);
    throw new Error('User not found');
  }

  // Log the updated cart for debugging purposes.
  console.log("Updated cart for user:", req.user.id, "Cart:", updatedUser.cart);

  // Return the updated cart in the response.
  res.status(200).json({
    success: true,
    data: updatedUser.cart
  });
});

// -----------------------------------------------------------------------------
// PURCHASE CART
// -----------------------------------------------------------------------------
// @desc    Purchase all items in the user's persistent cart
// @route   POST /api/users/purchase
// @access  Private
exports.purchaseCart = asyncHandler(async (req, res, next) => {
  // Retrieve the user by ID and populate the cart items so that we have full watch details.
  const user = await User.findById(req.user.id).populate('cart.watch');
  
  // If the user is not found, return a 404 error.
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  // If the cart is empty, return a 400 error.
  if (!user.cart || user.cart.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // For each item in the user's cart, create a purchase record.
  user.cart.forEach((item) => {
    // Calculate the total price for the item (quantity multiplied by the watch's price).
    const totalPrice = item.quantity * (item.watch.price || 0);
    // Push a new purchase record into the purchaseHistory array.
    user.purchaseHistory.push({
      watch: item.watch._id,   // Store only the watch's ObjectId.
      quantity: item.quantity,
      totalPrice: totalPrice,
      purchaseDate: new Date() // Use the current date/time.
    });
  });

  // After processing the purchase, clear the user's cart.
  user.cart = [];
  
  // Save the updated user document, which now includes new purchase records and an empty cart.
  await user.save();

  // Return a response with the updated purchase history.
  res.status(200).json({
    success: true,
    data: user.purchaseHistory
  });
});
