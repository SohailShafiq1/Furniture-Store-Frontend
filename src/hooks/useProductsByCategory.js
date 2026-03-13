import { useState, useEffect } from 'react';

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
        const response = await fetch(`http://localhost:5001/api/products/all`);
        
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
