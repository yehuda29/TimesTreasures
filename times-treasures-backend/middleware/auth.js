// watch-shop-backend/middleware/auth.js
// Purpose: Provides authentication & authorization middleware for protecting routes and verifying user roles.

const jwt = require('jsonwebtoken'); // Import jsonwebtoken to verify JWT tokens.
const asyncHandler = require('express-async-handler'); // Middleware to simplify error handling in async functions.
const User = require('../models/User'); // Import the User model to retrieve user details from the database.

// ---------------------------------------------
// Middleware to Protect Routes (Authentication)
// ---------------------------------------------
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract the token from the header. The header is in the format "Bearer <token>".
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token is found, return a 401 Unauthorized response
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify the token using the secret key from environment variables.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Authenticated user id:", decoded.id); // Debug: log the user id

    // Find the user by the ID stored in the token payload.
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
});

// --------------------------------------------------
// Middleware to Authorize Based on User Roles
// --------------------------------------------------
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};
