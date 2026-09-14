import { useEffect, useState } from 'react';
import api from '../../api/axios';

const STATUSES = ['processing', 'paid', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  function loadOrders() {
    api.get('/orders').then((res) => setOrders(res.data));
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(id, status) {
    await api.put(`/orders/${id}/status`, { status });
    loadOrders();
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Order</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id}>
            <td>#{o.id}</td>
            <td>
              {o.customer_name}
              <br />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{o.customer_email}</span>
            </td>
            <td>${Number(o.total).toFixed(2)}</td>
            <td>
              <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
