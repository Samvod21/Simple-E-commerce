const mongoose = require('mongoose');
const Product = require('../Models/Product');

const createProduct = async (req, res) => {
    try {
        const { title, category, price, stock, sizes, image, description } = req.body;

        const product = await Product.create({
            seller: req.user.id,
            title,
            category,
            price,
            stock,
            sizes,
            image,
            description
        });

        res.status(201).json({
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error creating product', error: error.message });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const filter = {};
        if (req.query.category) {
            filter.category = req.query.category;
        }

        const products = await Product.find(filter)
            .populate('seller', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ count: products.length, products });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching products', error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product id' });
        }

        const product = await Product.findById(req.params.id).populate('seller', 'name email');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching product', error: error.message });
    }
};

const getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ count: products.length, products });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching your products', error: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product id' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.seller.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied: you can only edit your own products' });
        }

        const editableFields = ['title', 'category', 'price', 'stock', 'sizes', 'image', 'description'];
        editableFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                product[field] = req.body[field];
            }
        });

        const updatedProduct = await product.save();

        res.status(200).json({
            message: 'Product updated successfully',
            product: updatedProduct
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error updating product', error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product id' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.seller.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied: you can only delete your own products' });
        }

        await product.deleteOne();

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting product', error: error.message });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    getMyProducts,
    updateProduct,
    deleteProduct
};