// watch-shop-backend/controllers/watchController.js

// Import the Watch model (Mongoose schema) for performing database operations
const Watch = require('../models/Watch');
// Import asyncHandler to handle errors in async route handlers without using try/catch in every function
const asyncHandler = require('express-async-handler');

/**
 * @desc    Get all watches with pagination, category filter, and sorting
 * @route   GET /api/watches?category=men-watches&sort=price&page=1&limit=20
 * @access  Public
 */
exports.getAllWatches = asyncHandler(async (req, res, next) => {
  // Destructure page, limit, category, and sort from the query parameters
  let { page, limit, category, sort } = req.query;

  // Convert page and limit to integers; set default values if not provided
  page = parseInt(page, 10) || 1;  // Default to page 1
  limit = parseInt(limit, 10) || 20; // Default to 20 items per page

  // Ensure page and limit are at least 1
  if (page < 1) page = 1;
  if (limit < 1) limit = 20;

  // Calculate the number of documents to skip for pagination
  const skip = (page - 1) * limit;

  try {
    // Build a Mongoose query object; if a category is provided, filter by it
    let query = {};
    if (category) {
      query.category = category;
    }

    // Build a sort option object; default sorting is by creation date descending (newest first)
    let sortOption = { createdAt: -1 };

    // If a sort parameter is provided, update the sortOption accordingly.
    // Expected values: 'name', '-name', 'price', '-price'
    if (sort) {
      switch (sort.toLowerCase()) {
        case 'name':
          sortOption = { name: 1 }; // Ascending by name (A-Z)
          break;
        case '-name':
          sortOption = { name: -1 }; // Descending by name (Z-A)
          break;
        case 'price':
          sortOption = { price: 1 }; // Ascending by price (low to high)
          break;
        case '-price':
          sortOption = { price: -1 }; // Descending by price (high to low)
          break;
        default:
          // If sort param is unrecognized, use the default sortOption
          break;
      }
    }

    // Count the total number of documents matching the query (for pagination)
    const total = await Watch.countDocuments(query);

    // Query the database to fetch watches based on the query, pagination, and sorting options
    const watches = await Watch.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sortOption);

    // Return a JSON response with success status, count, total available, and the fetched data
    res.status(200).json({
      success: true,
      count: watches.length,
      total,
      data: watches
    });
  } catch (error) {
    // Log any errors and send a 500 status response
    console.error('Error fetching watches:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to fetch watches.'
    });
  }
});

/**
 * @desc    Get single watch
 * @route   GET /api/watches/:id
 * @access  Public
 */
exports.getWatch = asyncHandler(async (req, res, next) => {
  // Find a watch by its ID (provided in the route parameter)
  const watch = await Watch.findById(req.params.id);

  // If the watch is not found, return a 404 status with an error message
  if (!watch) {
    return res.status(404).json({
      success: false,
      message: 'Watch not found'
    });
  }

  // Otherwise, return the found watch data
  res.status(200).json({
    success: true,
    data: watch
  });
});

/**
 * @desc    Upload a new watch
 * @route   POST /api/watches
 * @access  Private/Admin
 */
exports.uploadWatch = asyncHandler(async (req, res, next) => {
  // Destructure required fields from the request body
  const { name, price, description, image, category } = req.body;

  // Validate that all required fields are provided; if not, return a 400 status
  if (!name || !price || !description || !image || !category) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, price, description, image, and category'
    });
  }

  // Optional: Validate that the category is one of the allowed values
  const allowedCategories = ['men-watches', 'women-watches', 'luxury-watches', 'smartwatches'];
  if (!allowedCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Invalid category. Allowed categories are: ${allowedCategories.join(', ')}`
    });
  }

  try {
    // Create a new watch document in the database with the provided data
    const watch = await Watch.create({
      name,
      price,
      description,
      image,
      category
    });

    // Return a 201 status with the newly created watch data
    res.status(201).json({
      success: true,
      data: watch
    });
  } catch (error) {
    // Log any errors and return a 500 status with an error message
    console.error('Error uploading watch:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to upload watch.'
    });
  }
});
