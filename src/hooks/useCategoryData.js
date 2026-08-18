import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

let memoryCategoryCache = null;

export const useCategoryData = () => {
  const [categories, setCategories] = useState(() => {
    if (memoryCategoryCache) return memoryCategoryCache;
    try {
      const stored = sessionStorage.getItem('cached_categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        memoryCategoryCache = parsed;
        return parsed;
      }
    } catch (_) {}
    return [];
  });
  const [loading, setLoading] = useState(!categories.length);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (memoryCategoryCache && memoryCategoryCache.length > 0) {
      setLoading(false);
      return;
    }

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const url = `${API_BASE_URL}/categories/all`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const categoryList = Array.isArray(data) ? data : [];
        memoryCategoryCache = categoryList;
        try {
          sessionStorage.setItem('cached_categories', JSON.stringify(categoryList));
        } catch (_) {}
        
        setCategories(categoryList);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};
