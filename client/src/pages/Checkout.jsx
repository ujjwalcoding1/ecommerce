import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import './checkout.css';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_replace_with_your_publishable_key'
);

function CheckoutForm({ shippingAddress }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!shippingAddress.trim()) {
      setError('Please enter a shipping address.');
      return;
    }

    setSubmitting(true);
    setError('');

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message);
      setSubmitting(false);
      return;
    }

    try {
      const res = await api.post('/orders', {
        stripe_payment_intent_id: paymentIntent.id,
        shipping_address: shippingAddress,
      });
      await refreshCart();
      navigate(`/orders/${res.data.orderId}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Payment succeeded but the order could not be saved.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <PaymentElement />
      {error && <p className="error-text" style={{ marginTop: 14 }}>{error}</p>}
      <button className="btn btn-primary btn-block" disabled={!stripe || submitting} style={{ marginTop: 20 }}>
        {submitting ? 'Processing payment...' : 'Pay now'}
      </button>
      <p className="checkout-note">
        Test mode — use card <strong>4242 4242 4242 4242</strong>, any future date, any CVC.
      </p>
    </form>
  );
}

export default function Checkout() {
  const { items, total } = useCart();
  const [clientSecret, setClientSecret] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (items.length === 0) return;
    api.post('/payment/create-intent').then((res) => setClientSecret(res.data.clientSecret));
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h1>Nothing to check out</h1>
        <p style={{ color: 'var(--text-muted)', margin: '10px 0 26px' }}>Your cart is empty right now.</p>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>
          Back to shop
        </button>
      </div>
    );
  }

  return (
    <div className="container checkout">
      <h1>Checkout</h1>
      <div className="checkout-grid">
        <div className="checkout-main">
          <div className="field">
            <label>Shipping address</label>
            <textarea
              rows={3}
              placeholder="House no, street, city, state, PIN"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
            />
          </div>

          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm shippingAddress={shippingAddress} />
            </Elements>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Preparing payment...</p>
          )}
        </div>

        <aside className="checkout-summary">
          <h2>Order summary</h2>
          {items.map((item) => (
            <div key={item.cart_item_id} className="checkout-line">
              <span>{item.name} × {item.quantity}</span>
              <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="checkout-line checkout-total">
            <span>Total</span>
            <span>${Number(total).toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
