// watch-shop-backend/routes/userRoutes.js
// Purpose: Express router for user-specific endpoints (e.g., purchase history, persistent cart, and processing purchases)

const express = require('express');
// Import controller functions for handling user actions:
// - getPurchaseHistory: Fetches the logged-in user's purchase history.
// - getCart: Retrieves the user's persistent cart.
// - updateCart: Updates the user's persistent cart.
// - purchaseCart: Processes the purchase for all items in the cart and clears it.
const { getPurchaseHistory, getCart, updateCart, purchaseCart, updateProfile, trackOrder } = require('../controllers/userController');
// Import the protect middleware to ensure that only authenticated users can access these endpoints.
const { protect } = require('../middleware/auth');

const router = express.Router();

// ---------------------------------------------------------------------
// Purchase History Endpoint
// ---------------------------------------------------------------------
// GET /api/users/purchase-history
// Retrieves the purchase history for the authenticated user.
router.get('/purchase-history', protect, getPurchaseHistory);

// ---------------------------------------------------------------------
// Persistent Cart Endpoints
// ---------------------------------------------------------------------
// GET /api/users/cart
// Retrieves the persistent cart for the authenticated user.
router.get('/cart', protect, getCart);

// POST /api/users/cart
// Updates the persistent cart for the authenticated user.
// The request body should contain the new cart array.
router.post('/cart', protect, updateCart);

// ---------------------------------------------------------------------
// Purchase Endpoint
// ---------------------------------------------------------------------
// POST /api/users/purchase
// Processes the purchase for all items in the user's persistent cart.
// After successful purchase, the user's cart is cleared.
router.post('/purchase', protect, purchaseCart);

// PUT /api/users/profile updates fields such as name, profilePicture, and addresses.
router.put('/profile', protect, updateProfile);

router.get('/track-order/:orderNumber', protect, trackOrder);

module.exports = router;
