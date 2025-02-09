// watch-shop-backend/models/User.js

// Import Mongoose to define schemas and create models
const mongoose = require('mongoose');
// Import bcrypt for password hashing
const bcrypt = require('bcrypt');

// ---------------------------------------
// Define the Purchase Schema
// ---------------------------------------
// This schema defines the structure for each purchase record that will be embedded
// in a user's document (i.e., the user's purchase history).
const purchaseSchema = new mongoose.Schema({
  // 'watch' is a reference to a Watch document (using its ObjectId)
  watch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Watch',
    required: true
  },
  // 'quantity' indicates how many of the watch were purchased;
  // defaults to 1 and must be at least 1.
  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Quantity cannot be less than 1']
  },
  // 'purchaseDate' records when the purchase was made;
  // defaults to the current date and time.
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  // 'totalPrice' is the total cost for this purchase (calculated externally)
  // and is required.
  totalPrice: {
    type: Number,
    required: true
  }
});

// ---------------------------------------
// Define the User Schema
// ---------------------------------------
// This schema defines the structure for a User document in MongoDB.
const userSchema = new mongoose.Schema({
  // 'name' is a required string that is trimmed and must be between 2 and 50 characters.
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  // 'email' is a required, unique, trimmed, and lowercased string that must match a basic email regex.
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
  },
  // 'password' is a required string with a minimum length of 6 characters.
  // The 'select: false' option prevents the password field from being returned in queries by default.
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  // 'role' determines the user's role in the application, which can be either 'user' or 'admin'.
  // It defaults to 'user'.
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // ---------------------------------------
  // Persistent Cart
  // ---------------------------------------
  // The 'cart' field stores the user's current cart as an array of objects.
  // Each object contains a reference to a Watch and a quantity.
  cart: [
    {
      watch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Watch',
        required: true
      },
      quantity: {
        type: Number,
        default: 1,
        min: [1, 'Quantity cannot be less than 1']
      }
    }
  ],
  // 'purchaseHistory' is an array of purchase records (each following the purchaseSchema).
  purchaseHistory: [purchaseSchema],
  // 'createdAt' records when the user was created.
  // Although we enable timestamps below, this field is explicitly defined here as well.
  createdAt: {
    type: Date,
    default: Date.now
  }
},
// Enable automatic creation and updating of 'createdAt' and 'updatedAt' fields.
{ timestamps: true }
);

// ---------------------------------------
// Pre-save Middleware for Password Hashing
// ---------------------------------------
// Before saving a User document, this middleware checks if the password field has been modified.
// If it has, the middleware generates a salt and hashes the password using bcrypt.
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------
// Instance Method: matchPassword
// ---------------------------------------
// This method compares an entered password with the user's hashed password.
// It returns true if they match, otherwise false.
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
