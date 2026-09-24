const { Order, Product, User, Category, toApi } = require('../models');

async function getDashboardStats(req, res, next) {
  try {
    const [revenue, totalOrders, totalProducts, totalUsers, lowStock, recentOrders] = await Promise.all([
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(5).lean(),
      Order.find().sort({ created_at: -1 }).limit(5).lean(),
    ]);
    const users = await User.find({ _id: { $in: recentOrders.map((order) => order.user_id) } }).lean();
    const usersById = new Map(users.map((user) => [String(user._id), user]));
    res.json({ total_revenue: revenue[0]?.total || 0, total_orders: totalOrders, total_products: totalProducts, total_users: totalUsers, lowStock: lowStock.map(toApi), recentOrders: recentOrders.map((order) => ({ id: String(order._id), total: order.total, status: order.status, created_at: order.created_at, customer_name: usersById.get(String(order.user_id))?.name || '' })) });
  } catch (err) { next(err); }
}

async function listUsers(req, res, next) {
  try { res.json((await User.find().select('-password').sort({ created_at: -1 }).lean()).map(toApi)); } catch (err) { next(err); }
}

async function createCategory(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ message: 'Category name is required' });
    res.status(201).json(toApi(await Category.create({ name: req.body.name })));
  } catch (err) { next(err); }
}

module.exports = { getDashboardStats, listUsers, createCategory };
