// watch-shop-backend/controllers/watchController.js
// Import the Watch model (Mongoose schema) for performing database operations
const Watch = require('../models/Watch');
// Import asyncHandler to handle errors in async route handlers without using try/catch in every function
const asyncHandler = require('express-async-handler');

const cloudinary = require('../cloudinaryConfig'); // Import your config
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
 * @desc    Upload a new watch with an image uploaded to Cloudinary
 * @route   POST /api/watches
 * @access  Private/Admin
 */
exports.uploadWatch = asyncHandler(async (req, res, next) => {
  const { name, price, description, category, inventory } = req.body; // include inventory

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

  // Validate category against allowed values
  const allowedCategories = ['men-watches', 'women-watches', 'luxury-watches', 'smartwatches'];
  if (!allowedCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Invalid category. Allowed categories are: ${allowedCategories.join(', ')}`
    });
  }

  try {
    // Upload the image file to Cloudinary
    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
      folder: 'assets'
    });

    // Create a new watch document including the inventory field
    const watch = await Watch.create({
      name,
      price,
      description,
      image: result.secure_url,
      cloudinaryId: result.public_id,
      category,
      inventory // store the provided inventory value
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
  
  // NEW: Update inventory if provided (even if it's 0)
  if (req.body.inventory !== undefined) {
    watch.inventory = Number(req.body.inventory);
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