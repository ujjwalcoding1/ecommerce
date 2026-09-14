const express = require('express');
const router = express.Router();
const { getDashboardStats, listUsers, createCategory } = require('../controllers/adminController');
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', listUsers);
router.post('/categories', createCategory);

module.exports = router;
