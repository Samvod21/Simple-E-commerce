const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Product must have a seller']
    },
    title: {
        type: String,
        required: [true, 'Product title is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: {
            values: [
                'Handicrafts & Decor',
                'Textiles & Apparel',
                'Electronics & Tech',
                'Agriculture & Spices',
                'Industrial Goods',
                'Beauty & Wellness'
            ],
            message: '{VALUE} is not a valid category'
        }
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0.01, 'Price must be greater than 0']
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    sizes: {
        type: String,
        trim: true,
        default: ''
    },
    image: {
        type: String,
        required: [true, 'Product image is required']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
