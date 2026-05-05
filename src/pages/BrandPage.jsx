import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { getImageUrl } from '../utils/imageUrl';
import './BrandPage.css';

export default function BrandPage() {
  const { brandId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/products/all`);
        const list = Array.isArray(res.data) ? res.data : [];
        const filtered = list.filter((p) => String(p.brandId) === String(decodeURIComponent(brandId)));
        setProducts(filtered);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch products for brand', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [brandId]);

  return (
    <div>
      <Header />
      <main className="brand-page container">
        <div className="brand-header">
          <h1>{decodeURIComponent(brandId)}</h1>
          <p className="brand-sub">Products from {decodeURIComponent(brandId)}</p>
        </div>

        {loading && <div className="loading">Loading products...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && products.length === 0 && (
          <div className="no-products">No products found for this brand.</div>
        )}

        <div className="brand-products-grid">
          {products.map((p) => (
            <Link key={p._id} to={`/product/${p._id}`} className="brand-product-card">
              <div className="img-wrap">
                {p.images && p.images[0] ? (
                  <img src={getImageUrl(p.images[0])} alt={p.name} />
                ) : (
                  <div className="img-placeholder">No image</div>
                )}
              </div>
              <div className="card-body">
                <div className="name">{p.name}</div>
                <div className="price">₹{p.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
