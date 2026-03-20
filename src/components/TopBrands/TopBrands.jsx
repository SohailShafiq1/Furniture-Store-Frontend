import './TopBrands.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TopBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiEndpoint = `${import.meta.env.VITE_API_URL}/brands`;
  const backendRoot = import.meta.env.VITE_API_URL.replace('/api', '');

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiEndpoint}/all`);
        setBrands(res.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch brands:', err);
        setError('Failed to load brands');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return (
    <section className="top-brands">
      <div className="top-brands-container">
        <h2 className="top-brands-title">Top Brands at the Best Prices</h2>
        
        {loading && <div className="loading-message">Loading brands...</div>}
        {error && <div className="error-message">{error}</div>}
        
        {!loading && brands.length === 0 && (
          <div className="no-brands-message">No brands available yet.</div>
        )}
        
        {!loading && brands.length > 0 && (
          <div className="brands-grid">
            {brands.map((brand) => (
              <div key={brand._id} className="brand-item">
                {brand.image ? (
                  <img 
                    src={`${backendRoot}/${brand.image}`} 
                    alt={brand.name}
                    className="brand-logo"
                    title={brand.name}
                  />
                ) : (
                  <div className="brand-placeholder">{brand.name}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
