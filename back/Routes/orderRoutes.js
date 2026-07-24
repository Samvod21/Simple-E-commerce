const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getSellerOrders,
    updateOrderStatus
} = require('../Controllers/orderController');
const { protect, authorizeRoles } = require('../Middleware/authMidddleware');

router.post('/', protect, authorizeRoles('Buyer', 'Supplier'), createOrder);
router.get('/mine', protect, authorizeRoles('Buyer', 'Supplier'), getMyOrders);
router.get('/seller', protect, authorizeRoles('Supplier'), getSellerOrders);
router.put('/:id/status', protect, authorizeRoles('Supplier'), updateOrderStatus);

module.exports = router;