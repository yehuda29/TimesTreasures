// watch-shop-backend/routes/watchRoutes.js

// Import the express module to create a router
const express = require('express');
// Import required functions from the watch controller
const { 
  getAllWatches, 
  getWatch, 
  uploadWatch, 
  updateWatch, 
  deleteWatch, 
  fetchAndStoreEbayWatches, 
  getUniqueBrands,
  searchWatches
} = require('../controllers/watchController');
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

// NEW: Endpoint to get unique watch brands.
// This route returns an array of unique brands (extracted from the category field)
// so that the frontend (e.g., Navbar) can dynamically display them.
router.get('/brands', getUniqueBrands);

// URL example: /api/watches/search?query=rolex
router.get('/search', searchWatches);

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
  body('name', 'Watch name is required').not().isEmpty(),
  body('price', 'Price must be a number').isNumeric(),
  body('description', 'Description is required').not().isEmpty(),
  body('image', 'Image file is required').not().isEmpty(),
  // Updated: Validate that the watch brand (stored in category) is provided
  body('category', 'Watch brand is required').not().isEmpty(),
  // Validate that inventory is a non-negative integer.
  body('inventory', 'Inventory must be a non-negative integer').isInt({ min: 0 })
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

// Route to fetch and store watches from eBay
router.post("/fetch-ebay", protect, authorize("admin"), fetchAndStoreEbayWatches);

// Export the router to be used in the main server file
module.exports = router;
