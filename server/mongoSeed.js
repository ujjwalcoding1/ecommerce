require('dotenv').config();
const bcrypt = require('bcrypt');
const connectDatabase = require('./config/db');
const { User, Category, Product } = require('./models');

const demoProducts = [
  {
    name: 'Echo Studio Headphones',
    description: 'Premium over-ear headphones with spatial audio and a comfortable memory-foam fit.',
    price: 179,
    stock: 22,
    category: 'Headphones',
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=900',
  },
  {
    name: 'Pulse Earbuds Pro',
    description: 'True wireless earbuds with adaptive EQ, transparency mode, and a compact charging case.',
    price: 79,
    stock: 48,
    category: 'Headphones',
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900',
  },
  {
    name: 'Beacon Outdoor Speaker',
    description: 'Rugged portable speaker with 20-hour battery life and clear 360-degree sound.',
    price: 89,
    stock: 35,
    category: 'Speakers',
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=900',
  },
  {
    name: 'Orbit Mini Speaker',
    description: 'Portable Bluetooth speaker with punchy bass, 12-hour playtime, and water resistance.',
    price: 39.5,
    stock: 75,
    category: 'Speakers',
    rating: 4.4,
    image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900',
  },
  {
    name: 'Halo Smart Ring',
    description: 'Lightweight smart ring that tracks sleep, recovery, and daily activity.',
    price: 199,
    stock: 18,
    category: 'Wearables',
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=900',
  },
  {
    name: 'Nova Smartwatch',
    description: 'Bright AMOLED smartwatch with GPS, sleep tracking, and 100+ workout modes.',
    price: 149,
    stock: 30,
    category: 'Wearables',
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900',
  },
  {
    name: 'Link USB-C Hub',
    description: 'Seven-in-one aluminum hub with HDMI, USB 3.0, SD card, and power delivery ports.',
    price: 49,
    stock: 70,
    category: 'Accessories',
    rating: 4.3,
    image_url: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=900',
  },
  {
    name: 'Volt Wireless Charging Stand',
    description: 'Adjustable wireless charging stand for phones, earbuds, and bedside desks.',
    price: 34,
    stock: 55,
    category: 'Accessories',
    rating: 4.2,
    image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=900',
  },
];

async function seedMongo() {
  await connectDatabase();

  const categories = [...new Set(demoProducts.map((product) => product.category))];
  const categoryIds = {};
  for (const name of categories) {
    const category = await Category.findOneAndUpdate({ name }, { name }, { new: true, upsert: true, setDefaultsOnInsert: true });
    categoryIds[name] = category._id;
  }

  for (const demoProduct of demoProducts) {
    const { category, ...product } = demoProduct;
    await Product.findOneAndUpdate(
      { name: product.name },
      { ...product, category_id: categoryIds[category] },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );
  }

  const adminEmail = 'admin@voltage.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({ name: 'Store Admin', email: adminEmail, password: await bcrypt.hash('Admin@123', 10), role: 'admin' });
    console.log('Created admin user: admin@voltage.com / Admin@123');
  }

  console.log(`MongoDB demo catalog ready: ${demoProducts.length} products`);
  process.exit(0);
}

seedMongo().catch((error) => {
  console.error('MongoDB demo seed failed:', error.message);
  process.exit(1);
});
