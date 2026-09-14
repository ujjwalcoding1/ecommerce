import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import './home.css';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/products?limit=8&sort=rating').then((res) => setFeatured(res.data.products));
    api.get('/products/categories').then((res) => setCategories(res.data));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="hero-eyebrow">New season lineup</span>
            <h1>
              Sound and gear
              <br />
              built for the day
              <br />
              you actually have.
            </h1>
            <p className="hero-sub">
              Headphones, speakers and wearables tested for real commutes, real workouts,
              and real battery anxiety.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary">
                Shop the store
              </Link>
              <Link to="/products?category=Headphones" className="btn">
                Browse headphones
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900"
              alt="Aria wireless headphones"
            />
          </div>
        </div>
      </section>

      <section className="container cat-strip">
        {categories.map((c) => (
          <Link key={c.id} to={`/products?category=${encodeURIComponent(c.name)}`} className="cat-chip">
            {c.name}
          </Link>
        ))}
      </section>

      <section className="container">
        <div className="section-heading">
          <h2>Highest rated</h2>
          <Link to="/products">View all</Link>
        </div>
        <div className="product-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
