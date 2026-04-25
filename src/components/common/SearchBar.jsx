import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, BACKEND_URL } from '../../config/api';
import './SearchBar.css';

export default function SearchBar({ autoFocus = false }) {
  const [query, setQuery] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
      setIsOpen(true);
    }
  }, [autoFocus]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/products/all?t=${Date.now()}`);
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Search products load failed', error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const searchTerm = query.trim().toLowerCase();
    const matched = products
      .filter((product) => {
        const name = product.name?.toLowerCase() || '';
        const sku = product.sku?.toLowerCase() || '';
        return name.includes(searchTerm) || sku.includes(searchTerm);
      })
      .slice(0, 10);

    setSuggestions(matched);
  }, [query, products]);

  useEffect(() => {
    const texts = ['Search for products', 'Find your dream furniture'];
    let currentTextIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let timeoutId;

    const type = () => {
      const currentText = texts[currentTextIndex];

      if (!isDeleting) {
        currentCharIndex += 1;
        setPlaceholder(currentText.slice(0, currentCharIndex));

        if (currentCharIndex === currentText.length) {
          isDeleting = true;
          timeoutId = window.setTimeout(type, 1400);
        } else {
          timeoutId = window.setTimeout(type, 120);
        }
      } else {
        currentCharIndex -= 1;
        setPlaceholder(currentText.slice(0, currentCharIndex));

        if (currentCharIndex === 0) {
          isDeleting = false;
          currentTextIndex = (currentTextIndex + 1) % texts.length;
          setPlaceholder('');
          timeoutId = window.setTimeout(type, 400);
        } else {
          timeoutId = window.setTimeout(type, 80);
        }
      }
    };

    type();
    return () => window.clearTimeout(timeoutId);
  }, []);

  const getProductImage = (product) => {
    const image = product.image || product.images?.[0];
    if (!image) return '/stores.webp';
    if (image.startsWith('http')) return image;
    if (image.startsWith('/')) return image;
    return `${BACKEND_URL}/${image}`;
  };

  const goToProduct = (product) => {
    if (!product) return;
    navigate(`/product/${product.category}/${product._id}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleBlur = () => {
    window.setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div className="search-bar" onBlur={handleBlur}>
      <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className="search-input"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />

      {isOpen && query.trim().length > 0 && (
        <div className="search-results">
          <div className="search-results-header">
            Did you mean <span>"{query}"</span>?
          </div>

          {suggestions.length > 0 ? (
            <div className="search-result-list">
              {suggestions.map((product) => (
                <button
                  key={product._id}
                  type="button"
                  className="search-result-item"
                  onMouseDown={() => goToProduct(product)}
                >
                  <img src={getProductImage(product)} alt={product.name} />
                  <div className="search-result-info">
                    <div className="search-result-title">{product.name}</div>
                    <div className="search-result-tag">PRODUCTS</div>
                  </div>
                  <div className="search-result-price">
                    <span>${product.price?.toFixed(0)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="search-result-old">${product.originalPrice?.toFixed(0)}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="search-no-results">No matching products found.</div>
          )}
        </div>
      )}
    </div>
  );
}
