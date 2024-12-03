const mongoose = require('mongoose');

const boxeSchema = new mongoose.Schema({
  unique_key: { type: String, required: true, unique: true },
  latitude: { type: Number },
  longitude: { type: Number },
  status: { type: String, default: 'available' } // Example status
});


module.exports =  mongoose.model('Box', boxSchema);
