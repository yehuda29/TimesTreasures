// Import Mongoose to define schemas and interact with MongoDB
const mongoose = require('mongoose');

// Define the schema for a Watch document in MongoDB
const WatchSchema = new mongoose.Schema({
  // 'name' field: a required string with whitespace trimmed and a maximum length of 100 characters.
  name: {
    type: String,
    required: [true, 'Please provide watch name'],
    trim: true,
    maxlength: [100, 'Watch name cannot exceed 100 characters']
  },
  // 'price' field: a required number that cannot be negative.
  price: {
    type: Number,
    required: [true, 'Please provide watch price'],
    min: [0, 'Price cannot be negative']
  },
  // 'image' field: a required string representing the name of the image itself
  image: {
    type: String, // URL or path to the image
    required: [true, 'Please provide watch image']
  },
  // 'category' field: a required string that must be one of the specified enum values.
  category: {
    type: String,
    required: [true, 'Please provide watch category'],
    enum: ['men-watches', 'women-watches', 'luxury-watches', 'smartwatches']
  },
  // 'description' field: a required string with a maximum length of 1000 characters.
  description: {
    type: String,
    required: [true, 'Please provide watch description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  // 'createdAt' field: a date indicating when the watch was created.
  // Although timestamps are enabled below, this field is explicitly defined with a default value.
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  // The timestamps option automatically adds and manages 'createdAt' and 'updatedAt' fields.
  timestamps: true 
});

// Export the Watch model, making it available for CRUD operations elsewhere in your application.
module.exports = mongoose.model('Watch', WatchSchema);
