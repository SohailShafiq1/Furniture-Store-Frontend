import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

export const useProductsByCategory = (categoryId, options = {}) => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const limit = options.limit || 16;
  const subCategory = options.subCategory || '';
  const subSubCategory = options.subSubCategory || '';
  const sort = options.sort || '';

  // Initial fetch or filter change
  useEffect(() => {
    if (!categoryId) {
      setProducts([]);
      setTotalProducts(0);
      setLoading(false);
      setHasMore(false);
      return;
    }

    let isMounted = true;

    const fetchInitialProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        setPage(1);

        const params = new URLSearchParams({
          page: 1,
          limit: limit
        });
        if (subCategory) params.append('subCategory', subCategory);
        if (subSubCategory) params.append('subSubCategory', subSubCategory);
        if (sort) params.append('sort', sort);

        const response = await fetch(`${API_BASE_URL}/products/category/${categoryId}?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (isMounted) {
          if (Array.isArray(data.products)) {
            setProducts(data.products);
            setTotalProducts(data.totalProducts || 0);
            setHasMore(data.hasMore || false);
          } else if (Array.isArray(data)) {
            // Fallback for array response
            setProducts(data);
            setTotalProducts(data.length);
            setHasMore(false);
          } else {
            setProducts([]);
            setTotalProducts(0);
            setHasMore(false);
          }
        }
      } catch (err) {
        console.error('Error fetching category products:', err);
        if (isMounted) {
          setError(err.message);
          setProducts([]);
          setTotalProducts(0);
          setHasMore(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInitialProducts();

    return () => { isMounted = false; };
  }, [categoryId, subCategory, subSubCategory, sort, limit]);

  // Load next page function
  const loadMore = async () => {
    if (loading || loadingMore || !hasMore || !categoryId) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;

      const params = new URLSearchParams({
        page: nextPage,
        limit: limit
      });
      if (subCategory) params.append('subCategory', subCategory);
      if (subSubCategory) params.append('subSubCategory', subSubCategory);
      if (sort) params.append('sort', sort);

      const response = await fetch(`${API_BASE_URL}/products/category/${categoryId}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data.products)) {
        setProducts(prev => [...prev, ...data.products]);
        setPage(nextPage);
        setHasMore(data.hasMore || false);
      }
    } catch (err) {
      console.error('Error loading more products:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  return { products, totalProducts, loading, loadingMore, hasMore, loadMore };
};
