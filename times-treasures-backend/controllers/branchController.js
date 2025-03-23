// controllers/branchController.js
const Branch = require('../models/Branch');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Get all branches
 * @route   GET /api/branches
 * @access  Public
 */
exports.getBranches = asyncHandler(async (req, res) => {
  const branches = await Branch.find({});
  res.status(200).json({
    success: true,
    count: branches.length,
    data: branches,
  });
});

/**
 * @desc    Create a new branch
 * @route   POST /api/branches
 * @access  Private/Admin
 */
exports.createBranch = asyncHandler(async (req, res) => {
  const { name, position, phoneNumber, openingHour, closingHour, address } = req.body;

  // Basic validation (more complex validation can be added as needed)
  if (!name || !position || position.lat === undefined || position.lng === undefined || !phoneNumber || !openingHour || !closingHour) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: name, position (lat & lng), phoneNumber, openingHour, and closingHour',
    });
  }

  const branch = await Branch.create({
    name,
    position,
    phoneNumber,
    openingHour,
    closingHour,
    address: address || '',
  });

  res.status(201).json({
    success: true,
    data: branch,
  });
});
