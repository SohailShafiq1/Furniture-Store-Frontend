import { useState, useEffect } from 'react';
import { BACKEND_URL } from '../../config/api';
import ProductCarousel from '../ProductCarousel/ProductCarousel';

export default function BedroomSets() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBedroomProducts = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/products/all?t=${Date.now()}`);
        const data = await response.json();
        
        // Validate data is an array before filtering
        if (!Array.isArray(data)) {
          setProducts([]);
          return;
        }
        
        // Filter bedroom products and map to carousel format
        const bedrooms = data
          .filter(p => p.subCategoryName?.toLowerCase().includes('bed') || p.subCategoryName?.toLowerCase().includes('bedroom'))
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
        
        setProducts(bedrooms);
      } catch (err) {
        console.error('Failed to fetch bedroom sets:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBedroomProducts();
  }, []);

  if (loading || products.length === 0) return null;

  return <ProductCarousel title="Bedroom Sets" products={products} />;
}
