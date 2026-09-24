const { CartItem, Product, Order, User, toApi } = require('../models');

function orderResponse(order) {
  return { ...toApi(order), orderId: String(order._id), items: order.items || [] };
}

async function createOrder(req, res, next) {
  try {
    const { stripe_payment_intent_id, shipping_address } = req.body;
    const cart = await CartItem.find({ user_id: req.user.id }).lean();
    if (!cart.length) return res.status(400).json({ message: 'Your cart is empty' });
    const products = await Product.find({ _id: { $in: cart.map((item) => item.product_id) } });
    const productMap = new Map(products.map((product) => [String(product._id), product]));
    for (const item of cart) {
      const product = productMap.get(String(item.product_id));
      if (!product || product.stock < item.quantity) return res.status(400).json({ message: `${product?.name || 'Product'} is out of stock` });
    }
    const items = cart.map((item) => { const product = productMap.get(String(item.product_id)); return { product_id: product._id, name: product.name, price: product.price, quantity: item.quantity }; });
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({ user_id: req.user.id, total, status: 'paid', stripe_payment_intent_id: stripe_payment_intent_id || null, shipping_address: shipping_address || '', items });
    await Promise.all(items.map((item) => Product.updateOne({ _id: item.product_id }, { $inc: { stock: -item.quantity } })));
    await CartItem.deleteMany({ user_id: req.user.id });
    res.status(201).json({ orderId: String(order._id), total, status: order.status });
  } catch (err) { next(err); }
}

async function myOrders(req, res, next) {
  try { res.json((await Order.find({ user_id: req.user.id }).sort({ created_at: -1 }).lean()).map(orderResponse)); } catch (err) { next(err); }
}

async function getOrder(req, res, next) {
  try {
    const order = await Order.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(orderResponse(order));
  } catch (err) { next(err); }
}

async function listAllOrders(req, res, next) {
  try {
    const orders = await Order.find().sort({ created_at: -1 }).lean();
    const users = await User.find({ _id: { $in: orders.map((order) => order.user_id) } }).lean();
    const usersById = new Map(users.map((user) => [String(user._id), user]));
    res.json(orders.map((order) => ({ ...orderResponse(order), customer_name: usersById.get(String(order.user_id))?.name || '', customer_email: usersById.get(String(order.user_id))?.email || '' })));
  } catch (err) { next(err); }
}

async function updateOrderStatus(req, res, next) {
  try {
    const allowed = ['processing', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid status' });
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order status updated' });
  } catch (err) { next(err); }
}

module.exports = { createOrder, myOrders, getOrder, listAllOrders, updateOrderStatus };
