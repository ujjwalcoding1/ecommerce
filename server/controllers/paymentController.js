const Stripe = require('stripe');
const pool = require('../config/db');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/payment/create-intent
// Creates a Stripe PaymentIntent for the user's current cart total (in test mode).
async function createPaymentIntent(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT ci.quantity, p.price FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    const total = rows.reduce((sum, r) => sum + Number(r.price) * r.quantity, 0);
    const amountInPaise = Math.round(total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { user_id: String(req.user.id) },
    });

    res.json({ clientSecret: paymentIntent.client_secret, total });
  } catch (err) {
    next(err);
  }
}

module.exports = { createPaymentIntent };
