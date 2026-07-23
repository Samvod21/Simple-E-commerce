const express = require('express');
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProductById,
    getMyProducts,
    updateProduct,
    deleteProduct
} = require('../Controllers/productController');
const { protect, authorizeRoles } = require('../Middleware/authMidddleware');

// Static/specific routes must come before the '/:id' dynamic route
router.get('/mine', protect, authorizeRoles('Supplier'), getMyProducts);

router.post('/', protect, authorizeRoles('Supplier'), createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id', protect, authorizeRoles('Supplier'), updateProduct);
router.delete('/:id', protect, authorizeRoles('Supplier'), deleteProduct);

module.exports = router;