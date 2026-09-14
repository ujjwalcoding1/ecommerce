const pool = require('../config/db');

// GET /api/products?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=
async function listProducts(req, res, next) {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    const where = [];
    const params = [];

    if (search) {
      where.push('p.name LIKE ?');
      params.push(`%${search}%`);
    }
    if (category) {
      where.push('c.name = ?');
      params.push(category);
    }
    if (minPrice) {
      where.push('p.price >= ?');
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      where.push('p.price <= ?');
      params.push(Number(maxPrice));
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    let orderSql = 'ORDER BY p.created_at DESC';
    if (sort === 'price_asc') orderSql = 'ORDER BY p.price ASC';
    if (sort === 'price_desc') orderSql = 'ORDER BY p.price DESC';
    if (sort === 'rating') orderSql = 'ORDER BY p.rating DESC';

    const offset = (Number(page) - 1) * Number(limit);

    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereSql}
       ${orderSql}
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereSql}`,
      params
    );

    res.json({
      products: rows,
      total: countRows[0].total,
      page: Number(page),
      totalPages: Math.ceil(countRows[0].total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });

    const [images] = await pool.query('SELECT image_url FROM product_images WHERE product_id = ?', [id]);
    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name
       FROM reviews r JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? ORDER BY r.created_at DESC`,
      [id]
    );
    const [related] = await pool.query(
      `SELECT id, name, price, image_url, rating FROM products
       WHERE category_id = ? AND id != ? LIMIT 4`,
      [rows[0].category_id, id]
    );

    res.json({ ...rows[0], images: images.map((i) => i.image_url), reviews, related });
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const { name, description, price, stock, category_id, image_url } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, stock, category_id, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description || '', price, stock || 0, category_id || null, image_url || '']
    );
    res.status(201).json({ id: result.insertId, name, description, price, stock, category_id, image_url });
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category_id, image_url } = req.body;

    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Product not found' });

    await pool.query(
      `UPDATE products SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        stock = COALESCE(?, stock),
        category_id = COALESCE(?, category_id),
        image_url = COALESCE(?, image_url)
       WHERE id = ?`,
      [name, description, price, stock, category_id, image_url, id]
    );

    res.json({ message: 'Product updated' });
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}

async function listCategories(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function addReview(req, res, next) {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    await pool.query(
      'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [id, req.user.id, rating, comment || '']
    );

    const [avg] = await pool.query('SELECT AVG(rating) AS avg_rating FROM reviews WHERE product_id = ?', [id]);
    await pool.query('UPDATE products SET rating = ? WHERE id = ?', [avg[0].avg_rating, id]);

    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategories,
  addReview,
};
