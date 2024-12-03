const mongoose = require('mongoose');

const gpsSignalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model if you're tracking who the GPS data belongs to
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  altitude: {
    type: Number,
    default: null, // Optional field for altitude
  },
  speed: {
    type: Number,
    default: null, // Optional field for speed
  },
  heading: {
    type: Number,
    default: null, // Optional field for heading
  },
  accuracy: {
    type: Number,
    default: null, // Optional field for GPS accuracy
  },
  additionalInfo: {
    type: Map,
    of: String, // Optional field for any additional information you might want to store
  }
});


module.exports = mongoose.model('GpsSignal', gpsSignalSchema);
