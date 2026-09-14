import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './cart.css';

export default function Cart() {
  const { items, total, updateQuantity, removeItem, loading } = useCart();
  const navigate = useNavigate();

  if (loading) return <div className="container" style={{ padding: '60px 0' }}>Loading cart...</div>;

  if (items.length === 0) {
    return (
      <div className="container cart-empty">
        <h1>Your cart is empty</h1>
        <p>Add something from the shop to see it here.</p>
        <Link to="/products" className="btn btn-primary">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container cart">
      <h1>Your cart</h1>
      <div className="cart-list">
        {items.map((item) => (
          <div key={item.cart_item_id} className="cart-row">
            <img src={item.image_url} alt={item.name} />
            <div className="cart-row-info">
              <Link to={`/products/${item.product_id}`}>{item.name}</Link>
              <span className="cart-row-price">${Number(item.price).toFixed(2)}</span>
            </div>
            <input
              type="number"
              min="1"
              max={item.stock}
              value={item.quantity}
              onChange={(e) => updateQuantity(item.cart_item_id, Number(e.target.value))}
            />
            <span className="cart-row-subtotal">${(Number(item.price) * item.quantity).toFixed(2)}</span>
            <button className="cart-row-remove" onClick={() => removeItem(item.cart_item_id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <span>Total</span>
        <span className="cart-total">${Number(total).toFixed(2)}</span>
      </div>
      <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
        Proceed to checkout
      </button>
    </div>
  );
}
