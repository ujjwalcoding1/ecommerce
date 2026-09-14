require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./config/db');

const categories = ['Headphones', 'Speakers', 'Wearables', 'Accessories'];

const products = [
  {
    name: 'Aria Wireless Headphones',
    description: 'Over-ear wireless headphones with active noise cancellation and 40-hour battery life.',
    price: 99.0,
    stock: 40,
    category: 'Headphones',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
  },
  {
    name: 'Pulse Earbuds Pro',
    description: 'True wireless earbuds with adaptive EQ and a compact charging case.',
    price: 59.0,
    stock: 60,
    category: 'Headphones',
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
  },
  {
    name: 'Orbit Mini Speaker',
    description: 'Portable Bluetooth speaker with 12-hour playtime and IPX7 water resistance.',
    price: 39.5,
    stock: 75,
    category: 'Speakers',
    image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600',
  },
  {
    name: 'Voyage Home Speaker',
    description: 'Room-filling smart speaker with rich bass and voice assistant support.',
    price: 129.0,
    stock: 25,
    category: 'Speakers',
    image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600',
  },
  {
    name: 'Pace Fitness Band',
    description: 'Slim fitness tracker with heart-rate monitoring and a 10-day battery.',
    price: 45.0,
    stock: 50,
    category: 'Wearables',
    image_url: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600',
  },
  {
    name: 'Nova Smartwatch',
    description: 'AMOLED smartwatch with GPS, sleep tracking, and 100+ workout modes.',
    price: 149.0,
    stock: 30,
    category: 'Wearables',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
  },
  {
    name: 'Flux Fast Charger 65W',
    description: 'Compact GaN charger with dual USB-C ports for phones and laptops.',
    price: 29.0,
    stock: 100,
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600',
  },
  {
    name: 'Drift Carry Case',
    description: 'Hard-shell protective case for earbuds and small electronics.',
    price: 14.0,
    stock: 120,
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600',
  },
];

async function seed() {
  try {
    console.log('Seeding database...');

    // Admin user
    const [existingAdmin] = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@voltage.com']);
    if (existingAdmin.length === 0) {
      const hashed = await bcrypt.hash('Admin@123', 10);
      await pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [
        'Store Admin',
        'admin@voltage.com',
        hashed,
        'admin',
      ]);
      console.log('Created admin user -> email: admin@voltage.com  password: Admin@123');
    }

    // Categories
    const categoryIds = {};
    for (const name of categories) {
      const [existing] = await pool.query('SELECT id FROM categories WHERE name = ?', [name]);
      if (existing.length > 0) {
        categoryIds[name] = existing[0].id;
      } else {
        const [result] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
        categoryIds[name] = result.insertId;
      }
    }

    // Products
    for (const p of products) {
      const [existing] = await pool.query('SELECT id FROM products WHERE name = ?', [p.name]);
      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO products (name, description, price, stock, category_id, image_url, rating)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [p.name, p.description, p.price, p.stock, categoryIds[p.category], p.image_url, 4.3]
        );
      }
    }

    console.log('Seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
