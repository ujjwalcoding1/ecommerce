import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './order.css';

export default function OrderHistory() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.get('/orders/mine').then((res) => setOrders(res.data));
  }, []);

  if (!orders) return <div className="container" style={{ padding: '60px 0' }}>Loading orders...</div>;

  return (
    <div className="container order-page">
      <h1>Your orders</h1>

      {orders.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', marginTop: 20 }}>You haven't placed any orders yet.</p>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`} className="order-list-row">
              <div>
                <strong>Order #{order.id}</strong>
                <span className="order-list-date">{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <span className="badge">{order.status}</span>
              <span className="order-list-total">${Number(order.total).toFixed(2)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
