// watch-shop-backend/controllers/watchController.js
// Import the Watch model (Mongoose schema) for performing database operations
const Watch = require('../models/Watch');
// Import asyncHandler to handle errors in async route handlers without using try/catch in every function
const asyncHandler = require('express-async-handler');

const cloudinary = require('../cloudinaryConfig'); // Import your config

const fetchWatchesFromEbay = require("../utils/fetchWatchesFromEbay");



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
 * @desc    Get all watches with pagination, category filter, and sorting
 * @route   GET /api/watches?category=men-watches&sort=price&page=1&limit=20
 * @access  Public
 */
exports.getAllWatches = asyncHandler(async (req, res, next) => {
  // Destructure page, limit, category, and sort from the query parameters
  let { page, limit, category, sort } = req.query;

  // Convert page and limit to integers; set default values if not provided
  page = parseInt(page, 10) || 1;  // Default to page 1
  limit = parseInt(limit, 10) || 6; // Default to 20 items per page

  // Ensure page and limit are at least 1
  if (page < 1) page = 1;
  if (limit < 1) limit = 6;

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
 * @desc    Upload a new watch with an image uploaded to Cloudinary
 * @route   POST /api/watches
 * @access  Private/Admin
 */
exports.uploadWatch = asyncHandler(async (req, res, next) => {
  // Extract the required fields along with the special offer fields
  const { name, price, description, category, inventory, discountPercentage, offerStart, offerEnd } = req.body;

  // Validate required text fields including inventory.
  if (!name || !price || !description || !category || inventory === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, price, description, category, and inventory count'
    });
  }

  // Validate that an image file was uploaded
  if (!req.files || !req.files.image) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image file'
    });
  }

  try {
    // Upload the image file to Cloudinary
    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
      folder: 'assets'
    });

    // Create a new watch document including the specialOffer field.
    // Only set the specialOffer values if all three are provided; otherwise, defaults will be used.
    const watch = await Watch.create({
      name,
      price,
      description,
      image: result.secure_url,
      cloudinaryId: result.public_id,
      category,
      inventory,
      specialOffer: {
        discountPercentage: discountPercentage ? Number(discountPercentage) : 0,
        offerStart: offerStart || null,
        offerEnd: offerEnd || null
      }
    });

    res.status(201).json({
      success: true,
      data: watch
    });
  } catch (error) {
    console.error('Error uploading watch:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to upload watch.'
    });
  }
});


// upload endpoint using express-fileupload or multer to get the file path
exports.uploadImage = asyncHandler(async (req, res, next) => {
  // Assume the file is available as req.files.image
  if (!req.files || !req.files.image) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  // Upload the file to Cloudinary, specifying the "assets" folder
  const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
    folder: 'assets'
  });

  // Return the secure URL so it can be saved in your DB
  res.status(201).json({
    success: true,
    url: result.secure_url,
    public_id: result.public_id
  });
});

/**
 * @desc    Update an existing watch (including image update)
 * @route   PUT /api/watches/:id
 * @access  Private/Admin
 */
// watch-shop-backend/controllers/watchController.js

exports.updateWatch = asyncHandler(async (req, res, next) => {
  // Find the watch by its ID
  const watch = await Watch.findById(req.params.id);
  if (!watch) {
    return res.status(404).json({ success: false, message: 'Watch not found' });
  }

  // Update text fields if provided
  const { name, price, description, category } = req.body;
  if (name) watch.name = name;
  if (price) watch.price = price;
  if (description) watch.description = description;
  if (category) watch.category = category;
  
  // Update inventory if provided (even if it's 0)
  if (req.body.inventory !== undefined) {
    watch.inventory = Number(req.body.inventory);
  }

  // Update special offer details if provided in the request body
  if (req.body.specialOffer) {
    const { discountPercentage, offerStart, offerEnd } = req.body.specialOffer;
    if (discountPercentage !== undefined) {
      watch.specialOffer.discountPercentage = Number(discountPercentage);
    }
    if (offerStart !== undefined) {
      // Convert to Date object if a valid date string is provided; otherwise, set to null
      watch.specialOffer.offerStart = offerStart ? new Date(offerStart) : null;
    }
    if (offerEnd !== undefined) {
      watch.specialOffer.offerEnd = offerEnd ? new Date(offerEnd) : null;
    }
  }

  // If a new image file is provided, handle image update
  if (req.files && req.files.image) {
    // Delete the old image from Cloudinary if it exists
    if (watch.cloudinaryId) {
      await cloudinary.uploader.destroy(watch.cloudinaryId);
    }
    // Upload the new image to Cloudinary
    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
      folder: 'assets'
    });
    // Update the watch document with the new image info
    watch.image = result.secure_url;
    watch.cloudinaryId = result.public_id;
  }

  // Save the updated watch document
  await watch.save();
  res.status(200).json({ success: true, data: watch });
});


/**
 * @desc    Delete a watch and its associated image from Cloudinary
 * @route   DELETE /api/watches/:id
 * @access  Private/Admin
 */
exports.deleteWatch = asyncHandler(async (req, res, next) => {
  // Find the watch by its ID
  const watch = await Watch.findById(req.params.id);
  if (!watch) {
    return res.status(404).json({ success: false, message: 'Watch not found' });
  }

  // If the watch has an associated Cloudinary image, attempt to delete it
  if (watch.cloudinaryId) {
    console.log('Deleting image with public id:', watch.cloudinaryId);
    const deletionResult = await cloudinary.uploader.destroy(
      watch.cloudinaryId,
      { resource_type: 'image', invalidate: true }
    );

    if (deletionResult.result !== 'ok') {
      console.error('Failed to delete image from Cloudinary:', deletionResult);
    }
  }

  // Delete the watch from the database
  await watch.deleteOne();

  res.status(200).json({ success: true, message: 'Watch deleted successfully' });
});


// In watch-shop-backend/controllers/watchController.js

exports.fetchAndStoreEbayWatches = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  // Destructure the query, brand, and limit from the request body.
  const { query, brand, limit } = req.body;
  console.log("Received payload:", req.body);
  // Fetch watches using the updated function with brand filtering.
  const ebayWatches = await fetchWatchesFromEbay(query, brand, limit);

  if (ebayWatches.length === 0) {
    return res.status(400).json({ success: false, message: "No valid watches found from eBay" });
  }

  // Save the valid watches to the database.
  for (const watch of ebayWatches) {
    const existingWatch = await Watch.findOne({ name: watch.name });
    if (existingWatch) {
      console.log(`⚠️ Duplicate found: ${watch.name}. Deleting old entry.`);
      await Watch.deleteOne({ _id: existingWatch._id });
    }
    await Watch.create(watch);
  }

  res.status(200).json({ success: true, message: "Valid eBay watches fetched and stored." });
});


/**
 * @desc    Get unique watch brands from the database.
 * @route   GET /api/watches/brands
 * @access  Public
 */
exports.getUniqueBrands = asyncHandler(async (req, res, next) => {
  // Use Mongoose's distinct method on the 'category' field
  const brands = await Watch.distinct('category');
  
  // Return the unique brands in the response
  res.status(200).json({
    success: true,
    data: brands
  });
});

/**
 * @desc    Search watches by name based on a query parameter.
 *          The function looks for watches that contain the search term in their name (case-insensitive).
 *          If no matching watches are found, it returns an empty array.
 * @route   GET /api/watches/search?query=yourSearchTerm
 * @access  Public
 */
exports.searchWatches = asyncHandler(async (req, res, next) => {
  // Extract the search query from the request query parameters.
  // Expecting a URL like: /api/watches/search?query=rolex
  const { query } = req.query;

  // If no query is provided, send a 400 Bad Request response.
  if (!query || query.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  // Create a regular expression to perform a case-insensitive partial match.
  // This will match any watch name that contains the search term.
  const searchRegex = new RegExp(query, 'i');

  // Query the database to find watches whose name matches the regex.
  const matchingWatches = await Watch.find({ name: searchRegex });

  // Return the found watches.
  // If no matches are found, matchingWatches will be an empty array.
  return res.status(200).json({
    success: true,
    count: matchingWatches.length,
    data: matchingWatches
  });
});
