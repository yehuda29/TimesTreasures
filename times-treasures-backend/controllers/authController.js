// watch-shop-backend/controllers/authController.js
// Purpose: Contains authentication logic including registration, login, and retrieving the current user.

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');

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



// -------------------------------------------------------------------------
// Helper Function: generateToken
// Purpose: Generate a JWT token for a given user ID, using a secret and an expiration time from environment variables.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// -------------------------------------------------------------------------
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  // Validate the request body using express-validator.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map(err => err.msg).join(', '));
  }

  // Destructure the required fields from the request body, including new fields.
  const { name, familyName, birthDate, sex, email, password } = req.body;

  // Check if a user already exists with the provided email.
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Create a new user with the provided details.
  const user = await User.create({
    name,
    familyName,  // New: optional family name
    birthDate,   // New: required birth date
    sex,         // New: required sex (must be 'male' or 'female')
    email,
    password
  });

  // Generate a JWT token for the newly created user.
  const token = generateToken(user._id);

  // Respond with a 201 status (created), including the token and user data (excluding password).
  res.status(201).json({
    success: true,
    token,
    data: {
      id: user._id,
      name: user.name,
      familyName: user.familyName,
      birthDate: user.birthDate,
      sex: user.sex,
      email: user.email,
      role: user.role
    }
  });
});

// -------------------------------------------------------------------------
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  // Validate the incoming request for login credentials.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map(err => err.msg).join(', '));
  }

  // Destructure the email and password from the request body.
  const { email, password } = req.body;

  // Find the user by email. Use .select('+password') to include the password field.
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    res.status(400);
    throw new Error('Invalid credentials');
  }

  // Compare the entered password with the stored hashed password.
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(400);
    throw new Error('Invalid credentials');
  }

  // Generate a JWT token for the user.
  const token = generateToken(user._id);

  // Respond with a 200 status (OK), including the token and selected user data.
  res.status(200).json({
    success: true,
    token,
    data: {
      id: user._id,
      name: user.name,
      familyName: user.familyName,
      birthDate: user.birthDate,
      sex: user.sex,
      email: user.email,
      role: user.role
    }
  });
});

// -------------------------------------------------------------------------
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // Retrieve the current user's data using the id attached to req.user by the protect middleware.
  const user = await User.findById(req.user.id);

  // Respond with a 200 status and the user's data.
  res.status(200).json({
    success: true,
    data: user
  });
});
