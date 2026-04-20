import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

export const useCategoryData = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const url = `${API_BASE_URL}/categories/all`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const text = await response.text();
          console.error('Response Status:', response.status);
          console.error('Response Text (first 100 chars):', text.substring(0, 100));
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        console.error('Full error:', err);
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
