// controllers/branchController.js
const Branch = require('../models/Branch');
const asyncHandler = require('express-async-handler');


/*
req (short for request):
      Represents the HTTP request object.
      Contains information about the incoming request such as headers, query parameters, 
      body data (for POST/PUT requests), and URL parameters.
res (short for response):
      Represents the HTTP response object.
      Used to send data back to the client—for example, sending JSON, HTML, or other types of responses.
      Provides methods like res.status(), res.json(), res.send(), etc.

next (short for “next middleware”):
      A function that, when called, moves the request handling process to the next middleware
      or next route handler in the chain.
      Often used for error handling—if you pass an error to next(), 
      Express knows to move on to the error-handling middleware.


 */



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
