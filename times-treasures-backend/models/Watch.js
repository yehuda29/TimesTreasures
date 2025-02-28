// times-treasures-backend/models/Watch.js

const mongoose = require('mongoose');

// -----------------------------------------------------------------------------
// Special Offer Sub-Schema (unchanged)
// -----------------------------------------------------------------------------
const specialOfferSchema = new mongoose.Schema({
  discountPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  offerStart: { type: Date },
  offerEnd: { type: Date }
}, { _id: false });

// -----------------------------------------------------------------------------
// Main Watch Schema
// -----------------------------------------------------------------------------
const WatchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide watch name'],
    trim: true,
    maxlength: [100, 'Watch name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide watch price'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    required: [true, 'Please provide watch image']
  },
  cloudinaryId: {
    type: String
  },
  // ---------------------------------------------------------------------------
  // Updated Category Field:
  // Now used to store the watch's brand/model (e.g., "Rolex", "Apple")
  // Removed enum restriction to allow dynamic brand names.
  // ---------------------------------------------------------------------------
  category: {
    type: String,
    required: [true, 'Please provide watch brand/model'],
    trim: true,
    default: 'Unknown Brand'
  },
  description: {
    type: String,
    required: [true, 'Please provide watch description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  inventory: {
    type: Number,
    required: [true, 'Please provide inventory count'],
    min: [0, 'Inventory cannot be negative']
  },
  // ---------------------------------------------------------------------------
  // Embedded Special Offer Field (unchanged)
  // ---------------------------------------------------------------------------
  specialOffer: {
    type: specialOfferSchema,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Post-middleware to clean up purchase history on watch deletion (unchanged)
WatchSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    try {
      const User = require('./User');
      await User.updateMany({}, { $pull: { purchaseHistory: { watch: doc._id } } });
      console.log(`Cleaned up purchaseHistory entries for deleted watch: ${doc._id}`);
    } catch (err) {
      console.error('Error cleaning up purchaseHistory:', err);
    }
  }
});

module.exports = mongoose.model('Watch', WatchSchema);
