// times-treasures-backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { getSalesStats, getAllUsers, deleteUser, updateUser,   getUsersByName, getUserPurchaseHistory }
 = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// GET /api/admin/sales-stats
// This route is protected and only accessible to admin users.
router.get('/sales-stats', protect, authorize('admin'), getSalesStats);

router.get('/users', protect, authorize('admin'), getAllUsers);

router.delete('/users/:id', protect, authorize('admin'), deleteUser);

router.put('/users/:id', protect, authorize('admin'), updateUser);

// Route to search for users by name; expects a query parameter ?name=...
router.get('/users/search', protect, authorize('admin'), getUsersByName);

// Route to get the purchase history for a selected user by user ID.
router.get('/purchase-history/:userId', protect, authorize('admin'), getUserPurchaseHistory);


module.exports = router;
