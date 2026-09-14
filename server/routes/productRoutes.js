const express = require('express');
const router = express.Router();
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategories,
  addReview,
} = require('../controllers/productController');
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

router.get('/', listProducts);
router.get('/categories', listCategories);
router.get('/:id', getProduct);
router.post('/:id/reviews', protect, addReview);

router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
