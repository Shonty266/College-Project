const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema({
    esp32_id: {
        type: String,
        required: true 
    },
    product_name: {
        type: String,
        required: true
    },
    product_Size: {
        type: String,
        required: true
    },
    product_Description: {
        type: String,
        required: false // Optional field
    },
    status: {
        type: String,
        enum: ['available', 'assigned'],
        default: 'available'
    },
    assignedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional field, only populated when assigned
    }
});

module.exports = mongoose.model('Products', productsSchema);
