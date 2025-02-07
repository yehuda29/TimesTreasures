// watch-shop-backend/routes/userRoutes.js
// Purpose: Express router for user-specific endpoints (e.g., purchase history)

const express = require('express');
// Import the getPurchaseHistory controller function, which handles fetching the purchase history for a user
const { getPurchaseHistory } = require('../controllers/userController');
// Import the protect middleware to ensure that the user is authenticated before accessing these routes
const { protect } = require('../middleware/auth');

// Create a new Express router instance
const router = express.Router();

// Route: GET /api/users/purchase-history
// Purpose: Retrieve the purchase history for the authenticated user
// The protect middleware ensures that only logged-in users can access this endpoint
router.get('/purchase-history', protect, getPurchaseHistory);

// Export the router to be used in the main server file
module.exports = router;
