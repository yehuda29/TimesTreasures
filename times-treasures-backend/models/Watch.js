//times-treasures-backend/models/Watch.js

const mongoose = require('mongoose');

// -----------------------------------------------------------------------------
// Special Offer Sub-Schema
// -----------------------------------------------------------------------------
// This sub-schema defines the structure for special offer data on a watch.
// It includes the discount percentage as well as the offer start and end dates.
// The option { _id: false } prevents Mongoose from generating a separate ObjectId
// for this subdocument.
const specialOfferSchema = new mongoose.Schema({
  discountPercentage: {
    type: Number,
    default: 0, // A value of 0 indicates no discount is active.
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  offerStart: {
    type: Date,
    // Optionally, you can add custom validation to ensure a valid date is provided.
  },
  offerEnd: {
    type: Date,
    // Optionally, you can add custom validation to ensure offerEnd is after offerStart.
  }
}, { _id: false }); // Disables creation of a separate _id for the special offer subdocument

// -----------------------------------------------------------------------------
// Main Watch Schema
// -----------------------------------------------------------------------------
// This schema defines the structure for a Watch document in MongoDB.
// It includes fields for basic watch details (name, price, image, etc.) and
// embeds the specialOffer sub-schema to handle special discount offers.
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
  category: {
    type: String,
    required: [true, 'Please provide watch category'],
    enum: ['men-watches', 'women-watches', 'luxury-watches', 'smartwatches']
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
  // Embedded Special Offer Field
  // ---------------------------------------------------------------------------
  // The "specialOffer" field uses the specialOfferSchema defined above.
  // It groups all special offer data (if any) into a single subdocument.
  // The default value is an empty object, which implies no active special offer.
  specialOffer: {
    type: specialOfferSchema,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// -----------------------------------------------------------------------------
// Post-Middleware: Clean up Purchase History on Watch Deletion
// -----------------------------------------------------------------------------
// After a watch is deleted using findOneAndDelete, this middleware removes any
// references to that watch from users' purchaseHistory arrays.
WatchSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    try {
      // Import the User model here to avoid circular dependencies.
      const User = require('./User');
      await User.updateMany(
        {},
        { $pull: { purchaseHistory: { watch: doc._id } } }
      );
      console.log(`Cleaned up purchaseHistory entries for deleted watch: ${doc._id}`);
    } catch (err) {
      console.error('Error cleaning up purchaseHistory:', err);
    }
  }
});

// Export the Watch model to be used throughout the application.
module.exports = mongoose.model('Watch', WatchSchema);
