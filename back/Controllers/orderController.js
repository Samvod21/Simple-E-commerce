const mongoose = require('mongoose');
const Order = require('../Models/Order');
const Product = require('../Models/Product');

const createOrder = async (req, res) => {
    try {
        const { customerName, location, items } = req.body;

        if (!customerName || !location) {
            return res.status(400).json({ message: 'Customer name and location are required' });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }

        // Group requested items by seller
        const groupedBySeller = new Map(); // sellerId -> [{ product, quantity }]

        for (const item of items) {
            const { productId, quantity } = item;

            if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ message: `Invalid product id: ${productId}` });
            }
            if (!quantity || quantity < 1) {
                return res.status(400).json({ message: 'Each item must have a quantity of at least 1' });
            }

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${productId}` });
            }
            if (product.stock < quantity) {
                return res.status(400).json({ message: `Insufficient stock for "${product.title}"` });
            }

            const sellerId = product.seller.toString();
            if (!groupedBySeller.has(sellerId)) {
                groupedBySeller.set(sellerId, []);
            }
            groupedBySeller.get(sellerId).push({ product, quantity });
        }

        // Create one order per seller
        const createdOrders = [];

        for (const [sellerId, sellerItems] of groupedBySeller.entries()) {
            const orderItems = sellerItems.map(({ product, quantity }) => ({
                product: product._id,
                productName: product.title,
                quantity,
                price: product.price,
                subtotal: product.price * quantity
            }));

            const totalPrice = orderItems.reduce((sum, it) => sum + it.subtotal, 0);

            const order = await Order.create({
                buyer: req.user.id,
                seller: sellerId,
                customerName,
                location,
                items: orderItems,
                totalPrice
            });

            // Decrement stock for each product in this seller's order
            for (const { product, quantity } of sellerItems) {
                product.stock -= quantity;
                await product.save();
            }

            createdOrders.push(order);
        }

        res.status(201).json({
            message: `Order placed successfully (split into ${createdOrders.length} seller order(s))`,
            orders: createdOrders
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error creating order', error: error.message });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user.id })
            .populate('seller', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ count: orders.length, orders });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching your orders', error: error.message });
    }
};

const getSellerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ seller: req.user.id })
            .populate('buyer', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ count: orders.length, orders });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching seller orders', error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid order id' });
        }

        const { status } = req.body;
        const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({ message: `Status must be one of: ${allowedStatuses.join(', ')}` });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.seller.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied: you can only manage orders for your own products' });
        }

        order.status = status;
        const updatedOrder = await order.save();

        res.status(200).json({
            message: 'Order status updated successfully',
            order: updatedOrder
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating order status', error: error.message });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getSellerOrders,
    updateOrderStatus
};