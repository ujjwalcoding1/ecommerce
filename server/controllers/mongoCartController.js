const { CartItem, Product, toApi } = require('../models');

function cartResponse(item, product) {
  return { cart_item_id: String(item._id), quantity: item.quantity, product_id: String(product._id), name: product.name, price: product.price, image_url: product.image_url, stock: product.stock };
}

async function getCart(req, res, next) {
  try {
    const items = await CartItem.find({ user_id: req.user.id }).lean();
    const products = await Product.find({ _id: { $in: items.map((item) => item.product_id) } }).lean();
    const productMap = new Map(products.map((product) => [String(product._id), product]));
    const rows = items.filter((item) => productMap.has(String(item.product_id))).map((item) => cartResponse(item, productMap.get(String(item.product_id))));
    res.json({ items: rows, total: rows.reduce((sum, item) => sum + item.price * item.quantity, 0) });
  } catch (err) { next(err); }
}

async function addToCart(req, res, next) {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) return res.status(400).json({ message: 'product_id is required' });
    const product = await Product.findById(product_id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const current = await CartItem.findOne({ user_id: req.user.id, product_id });
    if (product.stock < (current?.quantity || 0) + Number(quantity)) return res.status(400).json({ message: 'Not enough stock available' });
    await CartItem.findOneAndUpdate({ user_id: req.user.id, product_id }, { $inc: { quantity: Number(quantity) } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(201).json({ message: 'Added to cart' });
  } catch (err) { next(err); }
}

async function updateCartItem(req, res, next) {
  try {
    const quantity = Number(req.body.quantity);
    if (!quantity || quantity < 1) await CartItem.deleteOne({ _id: req.params.id, user_id: req.user.id });
    else await CartItem.updateOne({ _id: req.params.id, user_id: req.user.id }, { quantity });
    res.json({ message: quantity > 0 ? 'Cart updated' : 'Item removed' });
  } catch (err) { next(err); }
}

async function removeCartItem(req, res, next) {
  try { await CartItem.deleteOne({ _id: req.params.id, user_id: req.user.id }); res.json({ message: 'Item removed' }); } catch (err) { next(err); }
}

async function clearCart(req, res, next) {
  try { await CartItem.deleteMany({ user_id: req.user.id }); res.json({ message: 'Cart cleared' }); } catch (err) { next(err); }
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
