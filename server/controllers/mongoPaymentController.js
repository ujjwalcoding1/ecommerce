const Stripe = require('stripe');
const { CartItem, Product } = require('../models');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent(req, res, next) {
  try {
    const cart = await CartItem.find({ user_id: req.user.id }).lean();
    const products = await Product.find({ _id: { $in: cart.map((item) => item.product_id) } }).lean();
    const productMap = new Map(products.map((product) => [String(product._id), product]));
    if (!cart.length) return res.status(400).json({ message: 'Your cart is empty' });
    const total = cart.reduce((sum, item) => sum + (productMap.get(String(item.product_id))?.price || 0) * item.quantity, 0);
    const paymentIntent = await stripe.paymentIntents.create({ amount: Math.round(total * 100), currency: 'usd', automatic_payment_methods: { enabled: true }, metadata: { user_id: String(req.user.id) } });
    res.json({ clientSecret: paymentIntent.client_secret, total });
  } catch (err) { next(err); }
}

module.exports = { createPaymentIntent };
