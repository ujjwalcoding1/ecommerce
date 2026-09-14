const pool = require('../config/db');

// POST /api/orders  -- called after Stripe payment succeeds on the client
async function createOrder(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const { stripe_payment_intent_id, shipping_address } = req.body;

    const [cartRows] = await connection.query(
      `SELECT ci.product_id, ci.quantity, p.name, p.price, p.stock
       FROM cart_items ci JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [req.user.id]
    );

    if (cartRows.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    for (const item of cartRows) {
      if (item.stock < item.quantity) {
        connection.release();
        return res.status(400).json({ message: `${item.name} is out of stock` });
      }
    }

    const total = cartRows.reduce((sum, r) => sum + Number(r.price) * r.quantity, 0);

    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total, status, stripe_payment_intent_id, shipping_address)
       VALUES (?, ?, 'paid', ?, ?)`,
      [req.user.id, total, stripe_payment_intent_id || null, shipping_address || '']
    );
    const orderId = orderResult.insertId;

    for (const item of cartRows) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, name, price, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.name, item.price, item.quantity]
      );
      await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [
        item.quantity,
        item.product_id,
      ]);
    }

    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    await connection.commit();
    connection.release();

    res.status(201).json({ orderId, total, status: 'paid' });
  } catch (err) {
    await connection.rollback();
    connection.release();
    next(err);
  }
}

async function myOrders(req, res, next) {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    for (const order of orders) {
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
    }
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

async function getOrder(req, res, next) {
  try {
    const { id } = req.params;
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [
      id,
      req.user.id,
    ]);
    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
    res.json({ ...orders[0], items });
  } catch (err) {
    next(err);
  }
}

// --- Admin ---
async function listAllOrders(req, res, next) {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['processing', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order status updated' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, myOrders, getOrder, listAllOrders, updateOrderStatus };
