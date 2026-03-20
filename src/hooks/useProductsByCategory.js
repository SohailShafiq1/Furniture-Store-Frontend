import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

export const useProductsByCategory = (categoryId) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categoryId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Add timestamp to bypass cache
        const response = await fetch(`${API_BASE_URL}/products/all?t=${Date.now()}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const allProducts = await response.json();
        
        // Filter products by category ID
        const categoryProducts = allProducts.filter(
          (product) => product.category === categoryId || product.category?._id === categoryId
        );
        
        setProducts(categoryProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  return { products, loading, error };
};
