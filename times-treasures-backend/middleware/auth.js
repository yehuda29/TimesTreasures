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
    // Extract the token part from the header. The header is in the format "Bearer <token>".
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
    // If the token is valid, jwt.verify returns the decoded payload.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by the ID stored in the token payload.
    // .select('-password') ensures that the password field is not returned.
    req.user = await User.findById(decoded.id).select('-password');

    // Proceed to the next middleware or route handler.
    next();
  } catch (err) {
    // If token verification fails, log the error and return a 401 Unauthorized response.
    console.error(err);
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
});

// --------------------------------------------------
// Middleware to Authorize Based on User Roles
// --------------------------------------------------
// 'authorize' is a higher-order function that returns a middleware function.
// It checks if the authenticated user's role is included in the allowed roles.
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // If the user's role is not among the allowed roles, return a 403 Forbidden response.
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    // If the role is allowed, proceed to the next middleware or route handler.
    next();
  };
};
