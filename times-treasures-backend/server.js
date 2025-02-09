// watch-shop-backend/server.js

// Import core modules and dependencies
const express = require('express');                 // Express framework for building the server
const mongoose = require('mongoose');               // Mongoose for connecting to MongoDB
const dotenv = require('dotenv');                   // dotenv for loading environment variables
const cors = require('cors');                       // CORS middleware for cross-origin resource sharing
const helmet = require('helmet');                   // Helmet for securing HTTP headers
const rateLimit = require('express-rate-limit');      // express-rate-limit for limiting repeated requests
const authRoutes = require('./routes/authRoutes');    // Routes for authentication endpoints
const userRoutes = require('./routes/userRoutes');    // Routes for user-related endpoints
const watchRoutes = require('./routes/watchRoutes');  // Routes for watch-related endpoints
const path = require('path');                         // path module for working with file paths

// Load environment variables from a .env file into process.env
dotenv.config();

// Initialize the Express app
const app = express();

// -----------------------
// Middleware Configuration
// -----------------------

// CORS Configuration: Allow requests from the specified frontend URL and allow specific HTTP methods
app.use(cors({
  origin: 'http://localhost:5173', // Update with your frontend URL if needed
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true                // Allows cookies and authentication headers
}));
// Parse incoming JSON bodies in requests
app.use(express.json());

// Security Middleware: Helmet helps secure your app by setting various HTTP headers
app.use(helmet());

// Rate Limiting: Limit each IP to a maximum number of requests per time window
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100                // Limit each IP to 100 requests per window
});
app.use(limiter);


// -----------------------
// Database Connection
// -----------------------

// Connect to MongoDB using the URI specified in the environment variables
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error(err.message);
  process.exit(1); // Exit the process with failure if the DB connection fails
});

// -----------------------
// Routes Setup
// -----------------------

// Mount the authentication routes under /api/auth
app.use('/api/auth', authRoutes);

// Mount the user-related routes under /api/users
app.use('/api/users', userRoutes);

// Mount the watch-related routes under /api/watches
app.use('/api/watches', watchRoutes);

// Simple route to verify that the API server is running
app.get('/', (req, res) => res.send('Watch Shop API is running'));

// -----------------------
// Production: Serve Client Build
// -----------------------

// If running in production, serve static files from the React client's build folder
if (process.env.NODE_ENV === 'production') {
  // Set the static folder for serving assets
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  // For any routes not handled by the server, send back index.html so the React app can handle routing
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// -----------------------
// Error Handling Middleware
// -----------------------

// Generic error handling middleware that logs errors and sends a JSON error response
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// -----------------------
// Start the Server
// -----------------------

// Use the PORT from environment variables or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
