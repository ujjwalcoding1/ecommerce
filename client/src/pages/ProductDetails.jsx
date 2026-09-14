import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import './product-details.css';

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  function load() {
    api.get(`/products/${id}`).then((res) => setProduct(res.data));
  }

  useEffect(() => {
    load();
    setActiveImage(0);
  }, [id]);

  if (!product) return <div className="container" style={{ padding: '60px 0' }}>Loading...</div>;

  const gallery = [product.image_url, ...(product.images || [])].filter(Boolean);

  async function handleAddToCart() {
    if (!user) {
      setStatus('Please log in to add items to your cart.');
      return;
    }
    await addToCart(product.id, quantity);
    setStatus('Added to cart.');
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    await api.post(`/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment });
    setReviewComment('');
    load();
  }

  return (
    <div className="container pd">
      <div className="pd-grid">
        <div className="pd-gallery">
          <div className="pd-main-image">
            <img src={gallery[activeImage]} alt={product.name} />
          </div>
          {gallery.length > 1 && (
            <div className="pd-thumbs">
              {gallery.map((src, i) => (
                <button key={i} className={i === activeImage ? 'active' : ''} onClick={() => setActiveImage(i)}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pd-info">
          {product.category_name && <span className="pd-category">{product.category_name}</span>}
          <h1>{product.name}</h1>
          {Number(product.rating) > 0 && <div className="pd-rating">★ {Number(product.rating).toFixed(1)} · {product.reviews.length} reviews</div>}
          <div className="pd-price">${Number(product.price).toFixed(2)}</div>
          <p className="pd-desc">{product.description}</p>

          <div className="pd-stock">
            {product.stock === 0 ? (
              <span className="badge badge-low">Out of stock</span>
            ) : product.stock <= 5 ? (
              <span className="badge badge-low">Only {product.stock} left</span>
            ) : (
              <span className="badge">In stock</span>
            )}
          </div>

          <div className="pd-add">
            <input
              type="number"
              min="1"
              max={product.stock || 1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              disabled={product.stock === 0}
            />
            <button className="btn btn-primary" onClick={handleAddToCart} disabled={product.stock === 0}>
              Add to cart
            </button>
          </div>
          {status && <p className="pd-status">{status}</p>}
        </div>
      </div>

      <section className="pd-reviews">
        <h2>Reviews</h2>
        {user && (
          <form className="pd-review-form" onSubmit={handleReviewSubmit}>
            <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} stars
                </option>
              ))}
            </select>
            <input
              placeholder="Share your thoughts..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
            <button className="btn" type="submit">
              Post review
            </button>
          </form>
        )}
        <div className="pd-review-list">
          {product.reviews.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No reviews yet.</p>}
          {product.reviews.map((r) => (
            <div key={r.id} className="pd-review-item">
              <div className="pd-review-head">
                <strong>{r.user_name}</strong>
                <span>★ {r.rating}</span>
              </div>
              <p>{r.comment}</p>
            </div>
          ))}
        </div>
      </section>

      {product.related?.length > 0 && (
        <section className="pd-related">
          <h2>You might also like</h2>
          <div className="product-grid">
            {product.related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <Link to="/products" className="pd-back">
        ← Back to shop
      </Link>
    </div>
  );
}
