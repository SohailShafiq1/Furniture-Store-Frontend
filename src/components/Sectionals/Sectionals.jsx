import { useState, useEffect } from 'react';
import { BACKEND_URL } from '../../config/api';
import ProductCarousel from '../ProductCarousel/ProductCarousel';

export default function Sectionals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectionals = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/products/all?t=${Date.now()}`);
        const data = await response.json();
        
        // Filter sectional products and map to carousel format
        const sectionals = data
          .filter(p => p.subCategoryName?.toLowerCase().includes('sectional'))
          .slice(0, 5)
          .map(p => ({
            id: p._id,
            name: p.name,
            brand: p.brandId || 'Luna',
            currentPrice: `$${p.price}`,
            originalPrice: p.discount > 0 ? `$${(p.price / (1 - p.discount / 100)).toFixed(2)}` : '',
            image: p.images?.[0] || p.image,
            rating: p.rating || 0,
            reviews: p.numReviews || 0,
            badge: p.discount > 0 ? 'Spring Sale' : 'In Stock'
          }));
        
        setProducts(sectionals);
      } catch (err) {
        console.error('Failed to fetch sectionals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSectionals();
  }, []);

  if (loading || products.length === 0) return null;

  return <ProductCarousel title="Sectionals" products={products} />;
}
