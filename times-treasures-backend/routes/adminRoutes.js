// times-treasures-backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { getSalesStats, getAllUsers } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// GET /api/admin/sales-stats
// This route is protected and only accessible to admin users.
router.get('/sales-stats', protect, authorize('admin'), getSalesStats);

router.get('/users', protect, authorize('admin'), getAllUsers);


//This Routers for deleting and editing users

const { deleteUser, updateUser } = require('../controllers/adminController');

router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.put('/users/:id', protect, authorize('admin'), updateUser);


module.exports = router;
