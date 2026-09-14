import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../api/axios';
import './order.css';

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const justPlaced = location.state?.justPlaced;

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data));
  }, [id]);

  if (!order) return <div className="container" style={{ padding: '60px 0' }}>Loading order...</div>;

  return (
    <div className="container order-page">
      {justPlaced && (
        <div className="order-success">
          <h1>Order placed</h1>
          <p>Thanks — your order is confirmed and on its way to processing.</p>
        </div>
      )}
      {!justPlaced && <h1>Order #{order.id}</h1>}

      <div className="order-card">
        <div className="order-meta">
          <span>Status: <strong>{order.status}</strong></span>
          <span>Placed: {new Date(order.created_at).toLocaleDateString()}</span>
        </div>
        <div className="order-items">
          {order.items.map((item) => (
            <div key={item.id} className="order-item-row">
              <span>{item.name} × {item.quantity}</span>
              <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="order-total">
          <span>Total</span>
          <span>${Number(order.total).toFixed(2)}</span>
        </div>
        {order.shipping_address && (
          <p className="order-address">Shipping to: {order.shipping_address}</p>
        )}
      </div>

      <Link to="/orders" className="pd-back">
        ← View all orders
      </Link>
    </div>
  );
}
