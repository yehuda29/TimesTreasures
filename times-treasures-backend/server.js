// times-treasures-backend/server.js

// Import core modules and dependencies
const express = require('express');                 // Express framework for building the server
const mongoose = require('mongoose');               // Mongoose for connecting to MongoDB
const dotenv = require('dotenv');                   // dotenv for loading environment variables
const cors = require('cors');                       // CORS middleware for cross-origin resource sharing
const rateLimit = require('express-rate-limit');    // Rate limiting middleware
const authRoutes = require('./routes/authRoutes');    // Routes for authentication endpoints
const userRoutes = require('./routes/userRoutes');    // Routes for user-related endpoints
const watchRoutes = require('./routes/watchRoutes');  // Routes for watch-related endpoints
const paypalRoutes = require('./routes/paypalRoutes'); // Routes for PayPal REST API endpoints
const adminRoutes = require('./routes/adminRoutes');   // Routes for admin-related endpoints
const branchRoutes = require('./routes/branchRoutes');
const path = require('path');                         // Module for working with file paths
const fileUpload = require('express-fileupload'); // <-- Added file upload middleware
const lusca = require('lusca');

// Load environment variables from a .env file into process.env
dotenv.config();

// Initialize the Express app
const app = express();

// -----------------------
// Middleware Configuration
// -----------------------

// CORS Configuration: Allow requests from the specified frontend URL and allow specific HTTP methods
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Parse incoming JSON bodies in requests
app.use(express.json());

// <-- Use express-fileupload middleware with temp files enabled
app.use(fileUpload({ useTempFiles: true }));

// Security Middleware: Lusca helps secure your app by setting various HTTP headers
// Disable the X-Powered-By header
app.disable('x-powered-by');

// Use Lusca's built-in middleware with default settings
app.use(lusca.xframe('DENY'));         // Prevent clickjacking by disallowing iframes
app.use(lusca.nosniff());              // Prevent MIME type sniffing
app.use(lusca.xssProtection(true));    // Enable basic XSS protection


// Telling express that we use the app through a proxy like Heroku
app.set('trust proxy', 1);

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
  process.exit(1); // Exit the process if the DB connection fails
});

// -----------------------
// Routes Setup
// -----------------------

// Mount the PayPal routes under /api/paypal
app.use('/api/paypal', paypalRoutes);

// Mount the authentication routes under /api/auth
app.use('/api/auth', authRoutes);

// Mount the user-related routes under /api/users
app.use('/api/users', userRoutes);

// Mount the watch-related routes under /api/watches
app.use('/api/watches', watchRoutes);

// Mount the admin routes under the /api/admin path
app.use('/api/admin', adminRoutes);

// Mount the branch routes under /api/branches
app.use('/api/branches', branchRoutes);

// -----------------------
// Production: Serve Client Build
// -----------------------

// If running in production, serve static files from the React client's build folder
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React client's build folder
  console.log("Serving static files from:", path.join(__dirname, 'client/build'));
  app.use(express.static(path.join(__dirname, 'client/build')));
  // For any routes not handled by the server, send back index.html so the React app can handle routing
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
} else {
  // In development, show a simple message at the root
  app.get('/', (req, res) => res.send('Watch Shop API is running'));
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
