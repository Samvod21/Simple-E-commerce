const mongoose = require('mongoose');

// A single line item inside an order (one product, from the order's seller)
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    quantity: {
        type: Number,
        required: [true, 'Order quantity is required'],
        min: [1, 'Quantity must be at least 1'],
        default: 1
    },
    price: {
        type: Number,
        required: [true, 'Unit price is required'],
        min: [0, 'Price cannot be negative']
    },
    subtotal: {
        type: Number,
        required: [true, 'Subtotal is required'],
        min: [0, 'Subtotal cannot be negative']
    }
}, { _id: false });

// One Order document = one seller's share of a buyer's checkout.
// If a buyer checks out with products from 2 different sellers, 2 Order
// documents are created (one per seller), each containing that seller's items.
const orderSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Buyer reference is required']
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Seller reference is required']
    },
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
    items: {
        type: [orderItemSchema],
        required: true,
        validate: {
            validator: (items) => Array.isArray(items) && items.length > 0,
            message: 'An order must contain at least one item'
        }
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