const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Add regex for basic email validation if needed
    username: {
        type: String,
        required: true,
        unique: true,
        match: /^[\w\W]{3,30}$/,
        trim: true
    },
    password: {
        type: String,
        required: true,
        // match: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_]).{8,30}$/
    },
    contact: { 
        type: String,
        match: /^[0-9]{10}$/ // Optional: Basic regex for 10-digit phone numbers
    },
    profileImage: { type: String },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order' // Make sure this matches the model name defined in your Order model
    }],
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    otp: { type: String }, // Store the OTP
    otpExpiry: { type: Date },
});

module.exports = mongoose.model('User', userSchema);
