const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controllers/mongoPaymentController');
const protect = require('../middleware/auth');

router.post('/create-intent', protect, createPaymentIntent);

module.exports = router;
