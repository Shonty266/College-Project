const mongoose = require('mongoose');
const moment = require('moment-timezone'); // Import moment-timezone

// Define the OTP schema
const otpSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    otpExpiry: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});





const OTPModel = mongoose.model('OTP', otpSchema);

module.exports = OTPModel;
