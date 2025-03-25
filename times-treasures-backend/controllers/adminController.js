const asyncHandler = require('express-async-handler');
const User = require('../models/User');

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


// get all users ---->
