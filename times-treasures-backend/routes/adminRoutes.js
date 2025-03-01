// times-treasures-backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { getSalesStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// GET /api/admin/sales-stats
// This route is protected and only accessible to admin users.
router.get('/sales-stats', protect, authorize('admin'), getSalesStats);

module.exports = router;
