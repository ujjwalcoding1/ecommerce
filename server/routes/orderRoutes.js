const express = require('express');
const router = express.Router();
const { createOrder, myOrders, getOrder, listAllOrders, updateOrderStatus } = require('../controllers/mongoOrderController');
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

router.post('/', protect, createOrder);
router.get('/mine', protect, myOrders);
router.get('/:id', protect, getOrder);

router.get('/', protect, adminOnly, listAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
