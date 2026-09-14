import { Link } from 'react-router-dom';
import './product-card.css';

export default function ProductCard({ product }) {
  const lowStock = product.stock > 0 && product.stock <= 5;
  const outOfStock = product.stock === 0;

  return (
    <Link to={`/products/${product.id}`} className="p-card">
      <div className="p-card-image">
        <img src={product.image_url} alt={product.name} loading="lazy" />
        {outOfStock && <span className="p-card-tag p-card-tag-out">Out of stock</span>}
        {!outOfStock && lowStock && <span className="p-card-tag p-card-tag-low">Only {product.stock} left</span>}
      </div>
      <div className="p-card-body">
        <h3>{product.name}</h3>
        <div className="p-card-meta">
          <span className="p-card-price">${Number(product.price).toFixed(2)}</span>
          {Number(product.rating) > 0 && <span className="p-card-rating">★ {Number(product.rating).toFixed(1)}</span>}
        </div>
      </div>
    </Link>
  );
}
