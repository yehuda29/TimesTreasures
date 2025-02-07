// Purpose: Contains User-related actions beyond auth, such as purchase history and profile updates.

const User = require('../models/User'); // Import the User model for database interactions.
const asyncHandler = require('express-async-handler'); // Simplifies error handling in async functions.

// @desc    Get purchase history for the logged-in user
// @route   GET /api/users/purchase-history
// @access  Private
exports.getPurchaseHistory = asyncHandler(async (req, res, next) => {
  // Retrieve the user by the ID attached to the request by the authentication middleware.
  // The .populate('purchaseHistory.watch') call replaces the watch ObjectId in each purchase history
  // record with the full watch document.
  const user = await User.findById(req.user.id).populate('purchaseHistory.watch');

  // Return a JSON response with success flag and the user's purchase history.
  res.status(200).json({
    success: true,
    data: user.purchaseHistory
  });
});
