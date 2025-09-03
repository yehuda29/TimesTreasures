// routes/branchRoutes.js
const express = require('express');
const router = express.Router();
const { getBranches, createBranch } = require('../controllers/branchController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getBranches);
router.post('/', protect, authorize('admin'), createBranch);

module.exports = router;
