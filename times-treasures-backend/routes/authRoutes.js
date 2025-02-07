// watch-shop-backend/routes/authRoutes.js
// Purpose: Express router defining endpoints for authentication operations (e.g., register, login, get current user)

const express = require('express');
// Import controller functions for registration, login, and fetching current user data
const { register, login, getMe } = require('../controllers/authController');
// Import the protect middleware to secure routes that require authentication
const { protect } = require('../middleware/auth');
// Import express-validator's body function to validate and sanitize incoming request data
const { body } = require('express-validator');

// Create a new Express router instance
const router = express.Router();

// ------------------------------
// Validation Rules
// ------------------------------

// Validation rules for the registration endpoint:
// - 'name' must not be empty.
// - 'email' must be a valid email.
// - 'password' must be at least 6 characters long.
const registerValidation = [
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be 6 or more characters').isLength({ min: 6 })
];

// Validation rules for the login endpoint:
// - 'email' must be a valid email.
// - 'password' must exist.
const loginValidation = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
];

// ------------------------------
// Routes
// ------------------------------

// Public Route: User Registration
// Endpoint: POST /api/auth/register
// The registerValidation middleware checks the incoming data before calling the register controller function.
router.post('/register', registerValidation, register);

// Public Route: User Login
// Endpoint: POST /api/auth/login
// The loginValidation middleware ensures that valid email and password fields are provided before calling the login controller function.
router.post('/login', loginValidation, login);

// Protected Route: Get Current User Data
// Endpoint: GET /api/auth/me
// The protect middleware ensures that only authenticated users can access this endpoint.
// If the token is valid, the getMe controller function returns the user's data.
router.get('/me', protect, getMe);

// Export the router so it can be used in your main server file
module.exports = router;
