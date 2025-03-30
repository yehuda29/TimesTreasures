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
exports.updateUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});
