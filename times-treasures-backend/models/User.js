// watch-shop-backend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ---------------------------------------
// Define the Purchase Schema
// ---------------------------------------
const purchaseSchema = new mongoose.Schema({
  watch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Watch',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Quantity cannot be less than 1']
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  totalPrice: {
    type: Number,
    required: true
  },
  shippingAddress: {
    country: String,
    city: String,
    homeAddress: String,
    zipcode: String,
    phoneNumber: String
  },
  orderNumber: {
    type: String,
    required: true
  }
});

// ---------------------------------------
// Define the Address Schema (User Address)
// ---------------------------------------
const addressSchema = new mongoose.Schema({
  country: {
    type: String,
    required: [true, 'Please provide a country']
  },
  city: {
    type: String,
    required: [true, 'Please provide a city']
  },
  homeAddress: {
    type: String,
    required: [true, 'Please provide a home address']
  },
  zipcode: {
    type: String,
    required: [true, 'Please provide a zipcode']
  }
}, { _id: false });

// ---------------------------------------
// Define the User Schema
// ---------------------------------------
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  familyName: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  birthDate: {
    type: Date,
    required: [true, 'Please provide your birth date']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide a phone number']
  },
  sex: {
    type: String,
    required: [true, 'Please select your sex'],
    enum: ['male', 'female']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profilePicture: {
    type: String,
    default: 'defaultPFP.jpg'
  },
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
  purchaseHistory: [purchaseSchema],
  addresses: [addressSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
},
{ timestamps: true }
);

// ---------------------------------------
// Pre-save Middleware for Password Hashing
// ---------------------------------------
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
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
