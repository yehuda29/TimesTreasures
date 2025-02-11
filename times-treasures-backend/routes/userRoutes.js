// watch-shop-backend/routes/userRoutes.js
// Purpose: Express router for user-specific endpoints (e.g., purchase history and persistent cart)

const express = require('express');
const { getPurchaseHistory, getCart, updateCart, purchaseCart } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Purchase history endpoint
router.get('/purchase-history', protect, getPurchaseHistory);

// Persistent Cart Endpoints:
router.get('/cart', protect, getCart);
router.post('/cart', protect, updateCart);

// New endpoint: Purchase all items in the persistent cart
router.post('/purchase', protect, purchaseCart);

module.exports = router;
