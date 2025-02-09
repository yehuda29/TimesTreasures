// watch-shop-backend/routes/userRoutes.js
// Purpose: Express router for user-specific endpoints (e.g., purchase history and persistent cart)

const express = require('express');
const { getPurchaseHistory, getCart, updateCart } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/purchase-history', protect, getPurchaseHistory);

// Persistent Cart Endpoints:
router.get('/cart', protect, getCart);
router.post('/cart', protect, updateCart);

module.exports = router;
