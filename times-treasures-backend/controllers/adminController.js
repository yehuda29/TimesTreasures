const asyncHandler = require('express-async-handler');
const User = require('../models/User');

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
 * @desc    Get sales statistics including top-selling watches, sales by brand, and purchases by sex.
 * @route   GET /api/admin/sales-stats
 * @access  Private/Admin
 */
exports.getSalesStats = asyncHandler(async (req, res, next) => {
  // -------------------------------
  // Aggregate Top Selling Watches
  // -------------------------------
  const topSellingWatches = await User.aggregate([
    { $unwind: "$purchaseHistory" },
    {
      $group: {
        _id: "$purchaseHistory.watch",
        totalSold: { $sum: "$purchaseHistory.quantity" }
      }
    },
    {
      $lookup: {
        from: "watches",
        localField: "_id",
        foreignField: "_id",
        as: "watchDetails"
      }
    },
    { $unwind: "$watchDetails" },
    {
      $addFields: {
        name: "$watchDetails.name"
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 1,
        totalSold: 1,
        name: 1
      }
    }
  ]);

  // -------------------------------
  // Aggregate Sales by Brand
  // -------------------------------
  const brandSales = await User.aggregate([
    { $unwind: "$purchaseHistory" },
    {
      $lookup: {
        from: "watches",
        localField: "purchaseHistory.watch",
        foreignField: "_id",
        as: "watchDetails"
      }
    },
    { $unwind: "$watchDetails" },
    {
      $group: {
        _id: "$watchDetails.category",
        totalSold: { $sum: "$purchaseHistory.quantity" }
      }
    },
    { $sort: { totalSold: -1 } }
  ]);

  // -------------------------------------
  // Aggregate Purchases by Sex (Men/Women)
  // -------------------------------------
  // - Unwind purchaseHistory to get individual purchase records
  // - Group by the user's sex (e.g., "male" or "female")
  // - Sum up the quantity purchased
  const sexSales = await User.aggregate([
    { $unwind: "$purchaseHistory" },
    {
      $group: {
        _id: "$sex",  // Groups by "male" or "female"
        totalSold: { $sum: "$purchaseHistory.quantity" }
      }
    },
    { $sort: { totalSold: -1 } }
  ]);

  res.status(200).json({
    success: true,
    topSellingWatches,
    brandSales,
    sexSales
  });
});


// פונקציה חדשה לשליפת כל המשתמשים
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    console.log(users);  // הצגת המשתמשים בקונסול
    res.status(200).json({
      success: true,
      data: users
    });
}catch (error) {
  next(error);
}
});

// פונקציה למחיקת משתמש
// מחיקת משתמש לפי ID
exports.deleteUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// עריכת משתמש לפי ID
/**
 * Updates a user without replacing existing required fields.
 *
 * This function finds the user by ID, then updates only the fields provided in req.body.
 * Required fields such as phoneNumber and purchaseHistory.orderNumber remain intact if not updated.
 *
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  // 1. Find the existing user
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // 2. Apply only the fields in req.body
  Object.keys(req.body).forEach((key) => {
    user[key] = req.body[key];
  });

  // 3. Save, validating only the modified fields.
  //    This avoids requiring phoneNumber or orderNumber if they were missing from old data.
  const updatedUser = await user.save({
    runValidators: true,
    validateModifiedOnly: true
  });

  res.status(200).json({ success: true, data: updatedUser });
});



/**
 * @desc   Search for users by name (matches first name or family name) and return basic info.
 * @route  GET /api/admin/users/search?name=SEARCH_TERM
 * @access Private/Admin
 */
exports.getUsersByName = asyncHandler(async (req, res, next) => {
  // Retrieve the search term from the query parameters
  const nameQuery = req.query.name;
  
  // If no search term is provided, return an error
  if (!nameQuery) {
    return res.status(400).json({ success: false, message: "Name query parameter is required" });
  }
  
  // Use a case-insensitive regex to search in both 'name' and 'familyName'
  const users = await User.find({
    $or: [
      { name: { $regex: nameQuery, $options: 'i' } },
      { familyName: { $regex: nameQuery, $options: 'i' } }
      //I used regular expressions (regex) in the query to provide a flexible, 
      // case-insensitive search for user names.
    ]
  }).select('name familyName _id'); // Return only the needed fields
  
  // Return the list of matching users
  res.status(200).json({
    success: true,
    data: users
  });
});


/**
 * @desc   Get purchase history for a specific user by their ID.
 *         This endpoint populates the 'watch' field in each purchase record.
 * @route  GET /api/admin/purchase-history/:userId
 * @access Private/Admin
 */
exports.getUserPurchaseHistory = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;
  
  // Find the user by ID and populate the purchaseHistory's watch details
  const user = await User.findById(userId).populate('purchaseHistory.watch');
  
  // If the user is not found, send a 404 error
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  
  // Optionally, filter out any purchase history records if a watch has been removed/deleted
  const purchaseHistory = user.purchaseHistory.filter(purchase => purchase.watch !== null);
  
  // Return the user's purchase history
  res.status(200).json({
    success: true,
    data: purchaseHistory
  });
});