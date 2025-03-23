// models/Branch.js
const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the branch name'],
    trim: true,
  },
  position: {
    lat: {
      type: Number,
      required: [true, 'Please provide the latitude'],
    },
    lng: {
      type: Number,
      required: [true, 'Please provide the longitude'],
    },
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide the branch phone number'],
  },
  openingHour: {
    type: String,
    required: [true, 'Please provide the opening hour (e.g., "09:00")'],
  },
  closingHour: {
    type: String,
    required: [true, 'Please provide the closing hour (e.g., "18:00")'],
  },
  // Optional: A human-readable address
  address: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);
