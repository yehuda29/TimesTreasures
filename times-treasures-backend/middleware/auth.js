// watch-shop-backend/middleware/auth.js
// Purpose: Provides authentication and authorization middleware for protecting routes 
// and verifying user roles.

const jwt = require('jsonwebtoken'); // Import jsonwebtoken to handle JWT token verification.
const asyncHandler = require('express-async-handler'); // Import asyncHandler to simplify error handling in async route handlers.
const User = require('../models/User'); // Import the User model to retrieve user details from the database.

// ---------------------------------------------
// Middleware to Protect Routes (Authentication)
// ---------------------------------------------
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the request has an Authorization header that starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract the token from the header.
    // The header format is expected to be: "Bearer <token>"
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token is found, return a 401 Unauthorized response.
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify the token using the secret key stored in environment variables.
    // If the token is valid, jwt.verify returns the decoded payload.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Authenticated user id:", decoded.id); // Debug: log the user id for troubleshooting.

    // Find the user by the ID stored in the token payload.
    // The .select('-password') part ensures that the password field is excluded from the result.
    req.user = await User.findById(decoded.id).select('-password');

    // If the user is not found in the database, return a 401 Unauthorized response.
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // If everything is good, proceed to the next middleware or route handler.
    next();
  } catch (err) {
    // Log the error and return a 401 Unauthorized response if token verification fails.
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
  // This higher-order function returns a middleware that checks if the authenticated user
  // has one of the allowed roles. The allowed roles are passed as arguments.
  return (req, res, next) => {
    // If the user's role is not included in the allowed roles, return a 403 Forbidden response.
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
