import { useEffect, useState } from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';
import api from '../../api/axios';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import './admin.css';

function StatsOverview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p style={{ color: 'var(--text-muted)' }}>Loading stats...</p>;

  return (
    <div>
      <div className="admin-stats">
        <div className="admin-stat">
          <span>Revenue</span>
          <strong>${Number(stats.total_revenue).toFixed(2)}</strong>
        </div>
        <div className="admin-stat">
          <span>Orders</span>
          <strong>{stats.total_orders}</strong>
        </div>
        <div className="admin-stat">
          <span>Products</span>
          <strong>{stats.total_products}</strong>
        </div>
        <div className="admin-stat">
          <span>Customers</span>
          <strong>{stats.total_users}</strong>
        </div>
      </div>

      <div className="admin-panels">
        <div className="admin-panel">
          <h3>Low stock</h3>
          {stats.lowStock.length === 0 && <p className="admin-empty">Nothing running low.</p>}
          {stats.lowStock.map((p) => (
            <div key={p.id} className="admin-panel-row">
              <span>{p.name}</span>
              <span className="badge badge-low">{p.stock} left</span>
            </div>
          ))}
        </div>

        <div className="admin-panel">
          <h3>Recent orders</h3>
          {stats.recentOrders.map((o) => (
            <div key={o.id} className="admin-panel-row">
              <span>#{o.id} · {o.customer_name}</span>
              <span>${Number(o.total).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="container admin">
      <h1>Admin dashboard</h1>
      <nav className="admin-tabs">
        <NavLink to="/admin" end>
          Overview
        </NavLink>
        <NavLink to="/admin/products">Products</NavLink>
        <NavLink to="/admin/orders">Orders</NavLink>
      </nav>

      <Routes>
        <Route index element={<StatsOverview />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
      </Routes>
    </div>
  );
}
