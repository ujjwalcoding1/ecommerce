import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import './product-listing.css';

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [requestFailed, setRequestFailed] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    api.get('/products/categories').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    setRequestFailed(false);
    const params = { page, limit: 12 };
    if (search) params.search = search;
    if (category) params.category = category;
    if (sort) params.sort = sort;

    api
      .get('/products', { params })
      .then((res) => {
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch(() => {
        setProducts([]);
        setRequestFailed(true);
      })
      .finally(() => setLoading(false));
  }, [search, category, sort, page]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  }

  return (
    <div className="container listing">
      <div className="listing-intro">
        <div>
          <span className="listing-kicker">The Voltage edit</span>
          <h1>{category || 'All products'}</h1>
          <p>Everyday tech with a little more character.</p>
        </div>
        <div className="listing-count">{loading ? 'Finding your next favorite' : `${products.length} pieces on view`}</div>
      </div>
      <div className="listing-header">
        <div className="listing-context">{search ? `Results for “${search}”` : 'Curated audio, wearables, and useful extras'}</div>
        <div className="listing-controls">
          <select value={category} onChange={(e) => updateParam('category', e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
            <option value="">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="listing-empty listing-empty-loading"><span className="loading-orb" />Loading the collection...</div>
      ) : products.length === 0 ? (
        <div className="listing-empty">
          <span className="empty-mark">—</span>
          <strong>{requestFailed ? 'The collection is taking a breather.' : 'No products match that search.'}</strong>
          <p>{requestFailed ? 'Connect the store API to bring the latest pieces back into view.' : 'Try another category or clear your search.'}</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={p === page ? 'page-btn active' : 'page-btn'}
              onClick={() => updateParam('page', String(p))}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
