const pool = require('../config/db');

async function getCart(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT ci.id AS cart_item_id, ci.quantity, p.id AS product_id, p.name, p.price, p.image_url, p.stock
       FROM cart_items ci JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [req.user.id]
    );
    const total = rows.reduce((sum, r) => sum + Number(r.price) * r.quantity, 0);
    res.json({ items: rows, total });
  } catch (err) {
    next(err);
  }
}

async function addToCart(req, res, next) {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) return res.status(400).json({ message: 'product_id is required' });

    const [product] = await pool.query('SELECT stock FROM products WHERE id = ?', [product_id]);
    if (product.length === 0) return res.status(404).json({ message: 'Product not found' });
    if (product[0].stock < quantity) return res.status(400).json({ message: 'Not enough stock available' });

    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.user.id, product_id, quantity]
    );

    res.status(201).json({ message: 'Added to cart' });
  } catch (err) {
    next(err);
  }
}

async function updateCartItem(req, res, next) {
  try {
    const { id } = req.params; // cart_item_id
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [id, req.user.id]);
      return res.json({ message: 'Item removed' });
    }
    await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [
      quantity,
      id,
      req.user.id,
    ]);
    res.json({ message: 'Cart updated' });
  } catch (err) {
    next(err);
  }
}

async function removeCartItem(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ message: 'Item removed' });
  } catch (err) {
    next(err);
  }
}

async function clearCart(req, res, next) {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
