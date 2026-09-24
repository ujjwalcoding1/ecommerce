const mongoose = require('mongoose');
const { Product, Category, Review, toApi } = require('../models');

function idOrNull(value) { return value && mongoose.isValidObjectId(value) ? value : null; }
function productResponse(product, category) { const result = toApi(product); result.category_id = product.category_id ? String(product.category_id) : null; result.category_name = category?.name || null; return result; }

async function listProducts(req, res, next) {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) { filter.price = {}; if (minPrice) filter.price.$gte = Number(minPrice); if (maxPrice) filter.price.$lte = Number(maxPrice); }
    if (category) { const categoryDoc = await Category.findOne({ name: category }); filter.category_id = categoryDoc?._id || null; }
    const pageNumber = Math.max(Number(page), 1); const pageSize = Math.max(Number(limit), 1);
    const sortBy = sort === 'price_asc' ? { price: 1 } : sort === 'price_desc' ? { price: -1 } : sort === 'rating' ? { rating: -1 } : { created_at: -1 };
    const [products, total] = await Promise.all([Product.find(filter).sort(sortBy).skip((pageNumber - 1) * pageSize).limit(pageSize).lean(), Product.countDocuments(filter)]);
    const categories = await Category.find({ _id: { $in: products.map((item) => item.category_id).filter(Boolean) } }).lean();
    const categoryMap = new Map(categories.map((item) => [String(item._id), item]));
    res.json({ products: products.map((product) => productResponse(product, categoryMap.get(String(product.category_id)))), total, page: pageNumber, totalPages: Math.ceil(total / pageSize) });
  } catch (err) { next(err); }
}

async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const [category, reviews, related] = await Promise.all([product.category_id ? Category.findById(product.category_id).lean() : null, Review.find({ product_id: product._id }).populate('user_id', 'name').sort({ created_at: -1 }).lean(), Product.find({ category_id: product.category_id, _id: { $ne: product._id } }).limit(4).lean()]);
    res.json({ ...productResponse(product, category), images: [], reviews: reviews.map((review) => ({ id: String(review._id), rating: review.rating, comment: review.comment, created_at: review.created_at, user_name: review.user_id?.name || 'Customer' })), related: related.map((item) => ({ id: String(item._id), name: item.name, price: item.price, image_url: item.image_url, rating: item.rating })) });
  } catch (err) { next(err); }
}

async function createProduct(req, res, next) {
  try { const { name, description, price, stock, category_id, image_url } = req.body; if (!name || price === undefined) return res.status(400).json({ message: 'Name and price are required' }); const product = await Product.create({ name, description: description || '', price, stock: stock || 0, category_id: idOrNull(category_id), image_url: image_url || '' }); res.status(201).json(productResponse(product)); } catch (err) { next(err); }
}

async function updateProduct(req, res, next) {
  try { const { name, description, price, stock, category_id, image_url } = req.body; const product = await Product.findByIdAndUpdate(req.params.id, { $set: { name, description, price, stock, category_id: idOrNull(category_id), image_url } }, { new: true, runValidators: true }); if (!product) return res.status(404).json({ message: 'Product not found' }); res.json({ message: 'Product updated' }); } catch (err) { next(err); }
}

async function deleteProduct(req, res, next) {
  try { const product = await Product.findByIdAndDelete(req.params.id); if (!product) return res.status(404).json({ message: 'Product not found' }); await Review.deleteMany({ product_id: product._id }); res.json({ message: 'Product deleted' }); } catch (err) { next(err); }
}
async function listCategories(req, res, next) { try { res.json((await Category.find().sort({ name: 1 }).lean()).map(toApi)); } catch (err) { next(err); } }
async function addReview(req, res, next) {
  try { const { rating, comment } = req.body; if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' }); if (!(await Product.exists({ _id: req.params.id }))) return res.status(404).json({ message: 'Product not found' }); await Review.create({ product_id: req.params.id, user_id: req.user.id, rating, comment: comment || '' }); const stats = await Review.aggregate([{ $match: { product_id: new mongoose.Types.ObjectId(req.params.id) } }, { $group: { _id: null, average: { $avg: '$rating' } } }]); await Product.findByIdAndUpdate(req.params.id, { rating: stats[0]?.average || 0 }); res.status(201).json({ message: 'Review added' }); } catch (err) { next(err); }
}
module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct, listCategories, addReview };
