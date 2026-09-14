import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products');
  }

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="nav-brand">
          Voltage
        </Link>

        <form className="nav-search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search headphones, speakers, wearables..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <nav className="nav-links">
          <Link to="/products">Shop</Link>
          {user && <Link to="/orders">Orders</Link>}
          {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
          <Link to="/cart" className="nav-cart">
            Cart{itemCount > 0 && <span className="nav-cart-count">{itemCount}</span>}
          </Link>
          {user ? (
            <button className="nav-text-btn" onClick={logout}>
              Log out
            </button>
          ) : (
            <Link to="/login">Log in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
