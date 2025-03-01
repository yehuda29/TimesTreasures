// times-treasures-backend/controllers/adminController.js

const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * @desc    Get sales statistics including top-selling watches and sales by brand.
 * @route   GET /api/admin/sales-stats
 * @access  Private/Admin
 */
exports.getSalesStats = asyncHandler(async (req, res, next) => {
  // -------------------------------
  // Aggregate Top Selling Watches
  // -------------------------------
  // - Unwind the purchaseHistory array from each user.
  // - Group by the watch ID and sum the purchased quantities.
  // - Join with the Watch collection to get watch details.
  // - Add a "name" field from the joined data and sort by totalSold descending.
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
        from: "watches",            // The MongoDB collection name for watches
        localField: "_id",          // The watch ID from purchaseHistory
        foreignField: "_id",        // The _id field in the watches collection
        as: "watchDetails"
      }
    },
    { $unwind: "$watchDetails" },
    { 
      $addFields: { 
        name: "$watchDetails.name"  // Add a flat "name" field for easier access
      }
    },
    { $sort: { totalSold: -1 } },   // Sort descending by quantity sold
    { $limit: 10 },                 // Limit to the top 10 best-sellers
    { 
      $project: {                   // Only return necessary fields
        _id: 1,
        totalSold: 1,
        name: 1
      }
    }
  ]);

  // -------------------------------
  // Aggregate Sales by Brand
  // -------------------------------
  // - Unwind purchaseHistory and join with the Watch collection.
  // - Group by the watch's category (which represents the brand) and sum quantities.
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
        _id: "$watchDetails.category",   // Group by the category field (brand)
        totalSold: { $sum: "$purchaseHistory.quantity" }
      }
    },
    { $sort: { totalSold: -1 } }         // Sort descending by quantity sold
  ]);

  // Return the aggregated stats
  res.status(200).json({
    success: true,
    topSellingWatches,
    brandSales
  });
});
