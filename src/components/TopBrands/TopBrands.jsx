import './TopBrands.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { getImageUrl, getAlternateImageUrl } from '../../utils/imageUrl';

export default function TopBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brokenBrandIds, setBrokenBrandIds] = useState({});

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/brands/all`);
        setBrands(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (fetchError) {
        console.error('Failed to fetch brands:', fetchError);
        setError('Failed to load brands');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

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

  return (
    <section className="top-brands">
      <div className="top-brands-container">
        <h2 className="top-brands-title">Top Brands at the Best Prices</h2>

        {loading && <div className="top-brands-message">Loading brands...</div>}
        {error && <div className="top-brands-message top-brands-message--error">{error}</div>}

        {!loading && !error && brands.length === 0 && (
          <div className="top-brands-message">No brands available yet.</div>
        )}

        {!loading && !error && brands.length > 0 && (
          <div className="brands-grid" aria-label="Top brands">
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