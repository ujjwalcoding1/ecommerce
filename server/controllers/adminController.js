const pool = require('../config/db');

async function getDashboardStats(req, res, next) {
  try {
    const [[{ total_revenue }]] = await pool.query(
      "SELECT COALESCE(SUM(total), 0) AS total_revenue FROM orders WHERE status != 'cancelled'"
    );
    const [[{ total_orders }]] = await pool.query('SELECT COUNT(*) AS total_orders FROM orders');
    const [[{ total_products }]] = await pool.query('SELECT COUNT(*) AS total_products FROM products');
    const [[{ total_users }]] = await pool.query(
      "SELECT COUNT(*) AS total_users FROM users WHERE role = 'customer'"
    );
    const [lowStock] = await pool.query(
      'SELECT id, name, stock FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT 5'
    );
    const [recentOrders] = await pool.query(
      `SELECT o.id, o.total, o.status, o.created_at, u.name AS customer_name
       FROM orders o JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC LIMIT 5`
    );

    res.json({
      total_revenue,
      total_orders,
      total_products,
      total_users,
      lowStock,
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    const [result] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboardStats, listUsers, createCategory };
