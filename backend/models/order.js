const mongoose = require('mongoose');

const gpsDataSchema = new mongoose.Schema({
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now // Automatically sets the current time when GPS data is added
    },
    unique_key: {
        type: String,
        required: true
    }
});

const orderSchema = mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    size: {
        type: String,
        required: true
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    deliveryTime: {
        type: Date
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderEmail: { // Reference to the User (sender)
        ref: 'User',
        required: true,
        type: String,
    },
    receiverEmail: { // New field for receiver's email
        type: String,
        required: true
    },
    receiverName: { // New field for receiver's name
        type: String,
        required: true
    },
    receiverContactNumber: { // New field for receiver's contact number
        type: String,
        required: true
    },
    deliveryBoyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'deliveryBoy',
        default: null,
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    currentAddress: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    esp32_id: { // Optional field for ESP32 ID
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: false
    },
    boxStatus: {
        type: String,
        enum: ['Closed', 'Opened'],
        default: 'Closed'
    },
    receiverBoxStatus: { // New field for receiver's box status
        type: String,
        enum: ['Closed', 'Opened'],
        default: 'Closed'
    },
    gpsData: {
        type: [gpsDataSchema], // Array of GPS data points
        default: [] // Start with an empty array
    }
    
});

module.exports = mongoose.model('Order', orderSchema);
