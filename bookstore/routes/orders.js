const express = require('express');
const router = express.Router();
const {
    createOrder,
    getUserOrders,
    getAllOrders,
    getOrder,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');
const { validateOrder, handleValidationErrors } = require('../middleware/validation');

// User routes
router.route('/')
    .post(protect, validateOrder, handleValidationErrors, createOrder)
    .get(protect, getUserOrders);

// Admin routes
router.route('/admin/orders')
    .get(protect, admin, getAllOrders);

router.route('/:id')
    .get(protect, getOrder)
    .put(protect, cancelOrder);

// Admin order management
router.route('/admin/orders/:id/status')
    .put(protect, admin, updateOrderStatus);

router.route('/admin/orders/:id/payment-status')
    .put(protect, admin, updatePaymentStatus);

router.route('/admin/orders/:id/cancel')
    .put(protect, admin, cancelOrder);

module.exports = router;