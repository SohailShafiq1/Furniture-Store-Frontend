import './TopBrands.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { getImageUrl, getAlternateImageUrl } from '../../utils/imageUrl';

export default function TopBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brokenBrandIds, setBrokenBrandIds] = useState({});

  const apiEndpoint = `${API_BASE_URL}/brands`;

  const handleImageError = (brandId, imagePath) => (event) => {
    const img = event.currentTarget;
    const hasTriedFallback = img.dataset.fallbackTried === 'true';

    if (!hasTriedFallback) {
      const fallbackSrc = getAlternateImageUrl(img.src, imagePath);
      if (fallbackSrc) {
        img.dataset.fallbackTried = 'true';
        img.src = fallbackSrc;
        return;
      }
    }

    setBrokenBrandIds((prev) => ({ ...prev, [brandId]: true }));
  };

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
                {brand.image && !brokenBrandIds[brand._id] ? (
                  <img 
                    src={getImageUrl(brand.image)}
                    alt={brand.name}
                    className="brand-logo"
                    title={brand.name}
                    onError={handleImageError(brand._id, brand.image)}
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
