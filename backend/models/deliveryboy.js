const mongoose = require('mongoose');
const Order = require('../models/order')

const deliveryBoySchema = mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        // Optional: Add regex for password validation if needed
    },
    contact: { 
        type: String, 
        trim: true
    },
    profileImage: { 
        type: String,
        // Optional: Add regex for URL validation if storing URLs
    },
    assignedOrders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'  // Assuming 'Order' is the correct model name
    }],
    vehicleDetails: {
        type: String,
        required: true  // Assuming vehicle details are required
    },
    role: { 
        type: String, 
        enum: ['deliveryBoy'], 
        default: 'deliveryBoy' 
    },
    earnings: {
        type: Number,
        default: 0, 
    },
})

module.exports = mongoose.model('deliveryBoy', deliveryBoySchema);
