// Import Mongoose to define schemas and interact with MongoDB
const mongoose = require('mongoose');

// Define the schema for a Watch document in MongoDB

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
  // NEW: Inventory field to track stock count
  inventory: {
    type: Number,
    required: [true, 'Please provide inventory quantity'],
    min: [0, 'Inventory cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });


// After a watch is deleted using findOneAndDelete, remove its references from users' purchaseHistory arrays.
WatchSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    try {
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

// Export the Watch model, making it available for CRUD operations elsewhere in your application.
module.exports = mongoose.model('Watch', WatchSchema);
