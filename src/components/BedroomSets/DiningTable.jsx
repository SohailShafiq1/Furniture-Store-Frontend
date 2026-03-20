import { useState, useEffect } from 'react';
import { BACKEND_URL } from '../../config/api';
import ProductCarousel from '../ProductCarousel/ProductCarousel';

export default function DiningTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiningProducts = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/products/all?t=${Date.now()}`);
        const data = await response.json();
        
        // Filter dining products and map to carousel format
        const dining = data
          .filter(p => p.subCategoryName?.toLowerCase().includes('dining') || p.subCategoryName?.toLowerCase().includes('table'))
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
        
        setProducts(dining);
      } catch (err) {
        console.error('Failed to fetch dining products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiningProducts();
  }, []);

  if (loading || products.length === 0) return null;

  return <ProductCarousel title="Dining Table Sets" products={products} />;
}
