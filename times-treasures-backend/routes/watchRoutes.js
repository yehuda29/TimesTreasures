// watch-shop-backend/routes/watchRoutes.js

// Import the express module to create a router
const express = require('express');
// Destructure the controller functions for watches from the watchController
const { getAllWatches, getWatch, uploadWatch, updateWatch, deleteWatch } = require('../controllers/watchController');
// Import the authentication middleware functions: protect (to ensure the user is authenticated)
// and authorize (to ensure the user has the proper role, e.g., 'admin')
const { protect, authorize } = require('../middleware/auth');
// Import the express-validator's body function to validate incoming request data
const { body } = require('express-validator');

// Create a new Express router instance
const router = express.Router();

// ----------------------------------------
// Public Routes for Watches
// ----------------------------------------

// GET /api/watches
// This route retrieves all watches with pagination, filtering, and sorting (if provided)
// It is public, so no authentication is required.
router.get('/', getAllWatches);

// GET /api/watches/:id
// This route retrieves a single watch by its ID from the URL parameter.
// It is also public.
router.get('/:id', getWatch);

// ----------------------------------------
// Admin Routes for Watches
// ----------------------------------------

// Define validation rules for uploading a new watch using express-validator.
// These rules ensure that all required fields are provided and valid.
const uploadValidation = [
  // Check that the 'name' field is not empty.
  body('name', 'Watch name is required').not().isEmpty(),
  // Check that the 'price' field is numeric.
  body('price', 'Price must be a number').isNumeric(),
  // Check that the 'description' field is not empty.
  body('description', 'Description is required').not().isEmpty(),
  // Check that the 'image' field is not empty.
  body('image', 'Image URL is required').not().isEmpty(),
  // Check that the 'category' field is one of the allowed values.
  body('category', 'Valid category is required').isIn(['men-watches', 'women-watches', 'luxury-watches', 'smartwatches'])
];

// POST /api/watches
// This route allows an admin to upload a new watch.
// It is protected using the 'protect' middleware to ensure the user is authenticated,
// and the 'authorize' middleware to ensure the user has the 'admin' role.
// The 'uploadValidation' array validates the incoming request body.
router.post('/', protect, authorize('admin'), uploadValidation, uploadWatch);

// Upload a new watch (already updated to use Cloudinary)
router.post('/', protect, authorize('admin'), uploadWatch);
// New: Update an existing watch
router.put('/:id', protect, authorize('admin'), updateWatch);
// Delete an existing watch
router.delete('/:id', protect, authorize('admin'), deleteWatch);

// Export the router to be used in the main server file
module.exports = router;
