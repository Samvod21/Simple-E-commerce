const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Delivery address/location is required'],
        trim: true
    },
    productName: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        required: [true, 'Order quantity is required'],
        min: [1, 'Quantity must be at least 1'],
        default: 1
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: [0, 'Total price cannot be negative']
    },
    status: {
        type: String,
        enum: {
            values: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            message: '{VALUE} is not a valid status'
        },
        default: 'Pending',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
