import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, BACKEND_URL } from '../../config/api';
import { getImageUrl } from '../../utils/imageUrl';
import './SearchBar.css';

export default function SearchBar({ autoFocus = false, defaultValue = '' }) {
  const [query, setQuery] = useState(defaultValue);
  const [placeholder, setPlaceholder] = useState('');
  const [instantProducts, setInstantProducts] = useState([]);
  const [instantCollections, setInstantCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(defaultValue);
    setIsOpen(false);
  }, [defaultValue]);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
      setIsOpen(true);
    }
  }, [autoFocus]);

  // Click outside listener to close dropdown cleanly
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced instant search query backend fetch (< 15ms endpoint)
  useEffect(() => {
    if (!query.trim()) {
      setInstantProducts([]);
      setInstantCollections([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/products/search/instant?q=${encodeURIComponent(query.trim())}`);
        if (res.data) {
          setInstantProducts(res.data.products || []);
          setInstantCollections(res.data.collections || []);
          if (document.activeElement === inputRef.current) {
            setIsOpen(true);
          }
          setSelectedIndex(-1);
        }
      } catch (err) {
        console.error('Instant search error:', err);
      } finally {
        setLoading(false);
      }
    }, 120);

    return () => clearTimeout(handler);
  }, [query]);

  // Animated search placeholder typing loop
  useEffect(() => {
    const texts = ['Search for products', 'Find your dream furniture', 'Try "bed", "sofa", "table"...'];
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
          timeoutId = window.setTimeout(type, 110);
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
          timeoutId = window.setTimeout(type, 70);
        }
      }
    };

    type();
    return () => window.clearTimeout(timeoutId);
  }, []);

  const getProductImage = (product) => {
    const rawImage = product.image || product.images?.[0];
    if (!rawImage) return '/stores.webp';
    return getImageUrl(rawImage);
  };

  const handleSearchSubmit = (searchQuery) => {
    const finalQuery = (searchQuery || query).trim();
    if (!finalQuery) return;
    setIsOpen(false);
    inputRef.current?.blur();
    navigate(`/search?q=${encodeURIComponent(finalQuery)}`);
  };

  const goToProduct = (product) => {
    if (!product || !product._id) return;
    setIsOpen(false);
    inputRef.current?.blur();
    navigate(`/product/${product._id}`);
  };

  const goToCollection = (collection) => {
    if (!collection || !collection.link) return;
    setIsOpen(false);
    inputRef.current?.blur();
    navigate(collection.link);
  };

  // Helper to highlight matching text in title/name
  const renderHighlightedText = (text, highlightTerm) => {
    if (!text || !highlightTerm || !highlightTerm.trim()) return text;
    const term = highlightTerm.trim();
    const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <strong key={index} className="search-highlight">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  const totalSelectableItems = instantProducts.length + instantCollections.length;

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < instantProducts.length) {
        goToProduct(instantProducts[selectedIndex]);
      } else if (selectedIndex >= instantProducts.length && selectedIndex < totalSelectableItems) {
        goToCollection(instantCollections[selectedIndex - instantProducts.length]);
      } else {
        handleSearchSubmit();
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (isOpen && totalSelectableItems > 0) {
        setSelectedIndex((prev) => (prev + 1) % totalSelectableItems);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (isOpen && totalSelectableItems > 0) {
        setSelectedIndex((prev) => (prev - 1 + totalSelectableItems) % totalSelectableItems);
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="search-bar" ref={containerRef}>
      <button 
        type="button" 
        className="search-icon-button"
        onClick={() => handleSearchSubmit()}
        aria-label="Search"
      >
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </button>

      <div className="search-input-wrap">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
        {query.trim().length > 0 && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Luna Furniture-styled Live Autocomplete Dropdown (Matching Reference Image 1) */}
      {isOpen && query.trim().length > 0 && (
        <div className="search-dropdown-menu">
          {loading ? (
            <div className="search-dropdown-loading">
              <div className="search-spinner" />
              <span>Searching...</span>
            </div>
          ) : (
            <>
              {/* PRODUCTS SECTION */}
              {instantProducts.length > 0 && (
                <div className="search-dropdown-section">
                  <div className="search-dropdown-section-title">PRODUCTS</div>
                  <div className="search-dropdown-list">
                    {instantProducts.map((product, idx) => {
                      const isSelected = selectedIndex === idx;
                      const hasDiscount = product.discount > 0;
                      const originalPrice = hasDiscount
                        ? (product.price / (1 - product.discount / 100)).toFixed(2)
                        : null;

                      return (
                        <div
                          key={product._id}
                          className={`search-dropdown-item ${isSelected ? 'selected' : ''}`}
                          onMouseDown={() => goToProduct(product)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                        >
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="search-dropdown-thumb"
                            onError={(e) => {
                              e.currentTarget.src = '/stores.webp';
                            }}
                          />
                          <div className="search-dropdown-details">
                            <div className="search-dropdown-item-title">
                              {renderHighlightedText(product.name, query)}
                            </div>
                            {product.sku && (
                              <div className="search-dropdown-item-sub">
                                SKU: {product.sku}
                              </div>
                            )}
                          </div>
                          <div className="search-dropdown-price-box">
                            <div className="search-dropdown-current-price">
                              ${Number(product.price).toFixed(2)}
                            </div>
                            {originalPrice && (
                              <div className="search-dropdown-old-price">
                                ${originalPrice}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* COLLECTIONS & CATEGORIES SECTION */}
              {instantCollections.length > 0 && (
                <div className="search-dropdown-section">
                  <div className="search-dropdown-section-title">COLLECTIONS</div>
                  <div className="search-dropdown-list">
                    {instantCollections.map((col, idx) => {
                      const globalIdx = instantProducts.length + idx;
                      const isSelected = selectedIndex === globalIdx;

                      return (
                        <div
                          key={`${col.type}-${col.id}-${idx}`}
                          className={`search-dropdown-item collection-item ${isSelected ? 'selected' : ''}`}
                          onMouseDown={() => goToCollection(col)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                        >
                          <div className="search-dropdown-collection-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="7" height="7"></rect>
                              <rect x="14" y="3" width="7" height="7"></rect>
                              <rect x="14" y="14" width="7" height="7"></rect>
                              <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                          </div>
                          <div className="search-dropdown-item-title">
                            {renderHighlightedText(col.name, query)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {instantProducts.length === 0 && instantCollections.length === 0 && (
                <div className="search-dropdown-no-results">
                  No matching products or collections found for "<strong>{query}</strong>".
                </div>
              )}

              {/* FOOTER BUTTON */}
              <button
                type="button"
                className="search-dropdown-footer-btn"
                onMouseDown={() => handleSearchSubmit()}
              >
                View all results for "{query}" →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
