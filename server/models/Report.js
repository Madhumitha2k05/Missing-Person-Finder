// File: server/models/Report.js
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  photoURL: { type: String, required: true },
  lastSeenLocation: { type: String, required: true },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },

  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Missing', 'Found'],
    default: 'Missing'
  },

  // ✅ --- ADDED PHONE NUMBER FIELD --- ✅
  // Making it optional (not required)
  contactPhone: {
    type: String,
    trim: true // Removes extra whitespace
  }
});

ReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Report', ReportSchema);