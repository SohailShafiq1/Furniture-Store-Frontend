import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import FilterSidebar from '../components/FilterSidebar/FilterSidebar';
import SearchBar from '../components/common/SearchBar';
import { useCart } from '../context/CartContext';
import { useCategoryData } from '../hooks/useCategoryData';
import { API_BASE_URL, BACKEND_URL } from '../config/api';
import { getImageUrl, getAlternateImageUrl } from '../utils/imageUrl';
import './SearchPage.css';

// SVG Icons
const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#FFB800" : "none"} stroke={filled ? "#FFB800" : "#D1D1D1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const normalizeFilterText = (value) => String(value || '').trim();

const CODE_NAME_MAP = {
  'ca-1004': 'Beds & Bedroom Furniture',
  'ca-1011': 'Tables & Sideboards',
  'ca-2199': 'Home Accents & Decor',
  'general': ''
};

// Best UI/UX Pagination Range Generator (Truncates pages with ellipses e.g. 1 ... 14 15 16 ... 32)
const getPaginationRange = (currentPage, totalPages, siblingCount = 1) => {
  const totalPageNumbers = siblingCount + 5;

  if (totalPageNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblingCount;
    let leftRange = Array.from({ length: leftItemCount }, (_, idx) => idx + 1);
    return [...leftRange, '...', totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    let rightRange = Array.from({ length: rightItemCount }, (_, idx) => totalPages - rightItemCount + idx + 1);
    return [firstPageIndex, '...', ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, idx) => leftSiblingIndex + idx
    );
    return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
  }

  return [];
};

const addOptionCount = (sectionMap, key, label, value, type = 'text', extra = {}) => {
  const cleanLabel = normalizeFilterText(label);
  const cleanValue = normalizeFilterText(value);
  if (!cleanLabel || !cleanValue) return;

  if (!sectionMap.has(key)) {
    sectionMap.set(key, {
      key,
      label: cleanLabel,
      type,
      optionsMap: new Map()
    });
  }

  const section = sectionMap.get(key);
  const current = section.optionsMap.get(cleanValue) || { value: cleanValue, count: 0, ...extra };
  section.optionsMap.set(cleanValue, {
    ...current,
    ...extra,
    count: current.count + 1
  });
};

const getValuesForFilterKey = (product, filterKey, categoryMap) => {
  if (!product) return [];

  if (filterKey === 'productType') {
    const list = [];
    if (product.subSubCategoryName) {
      const mapped = CODE_NAME_MAP[product.subSubCategoryName.toLowerCase()];
      if (mapped) list.push(mapped);
      else if (!product.subSubCategoryName.toLowerCase().includes('general')) list.push(product.subSubCategoryName);
    }
    if (product.subCategoryName) {
      const lower = product.subCategoryName.toLowerCase();
      const mapped = CODE_NAME_MAP[lower];
      if (mapped) list.push(mapped);
      else if (!lower.includes('general')) list.push(product.subCategoryName);
    }

    const catId = typeof product.category === 'object' ? product.category?._id : product.category;
    if (catId && categoryMap && categoryMap.has(String(catId))) {
      list.push(categoryMap.get(String(catId)));
    }

    return [...new Set(list)].filter(Boolean).map(normalizeFilterText);
  }

  if (filterKey === 'availability') {
    return [Number(product.quantity || 0) > 0 ? 'In Stock' : 'Out of Stock'];
  }

  if (filterKey === 'color') {
    const selectedColors = Array.isArray(product.selectedColors) ? product.selectedColors : [];
    const customColors = Array.isArray(product.customColors) ? product.customColors.map((c) => c?.name) : [];
    return [...selectedColors, ...customColors].filter(Boolean).map(normalizeFilterText);
  }

  if (filterKey === 'variation') {
    return (Array.isArray(product.variations) ? product.variations : [])
      .map((variation) => variation?.name)
      .filter(Boolean)
      .map(normalizeFilterText);
  }

  return [];
};

const buildDynamicFilterSections = (products, categoryMap) => {
  const sectionMap = new Map();
  const priceValues = products
    .map((product) => Number(product?.price))
    .filter((value) => Number.isFinite(value) && value >= 0);

  products.forEach((product) => {
    const seenBySection = new Map();

    const markSeen = (sectionKey, optionValue) => {
      const cleanValue = normalizeFilterText(optionValue);
      if (!cleanValue) return false;
      if (!seenBySection.has(sectionKey)) seenBySection.set(sectionKey, new Set());
      const set = seenBySection.get(sectionKey);
      if (set.has(cleanValue)) return false;
      set.add(cleanValue);
      return true;
    };

    getValuesForFilterKey(product, 'productType', categoryMap).forEach((value) => {
      if (!markSeen('productType', value)) return;
      addOptionCount(sectionMap, 'productType', 'Product Type', value);
    });

    getValuesForFilterKey(product, 'availability', categoryMap).forEach((value) => {
      if (!markSeen('availability', value)) return;
      addOptionCount(sectionMap, 'availability', 'Availability', value);
    });

    const customColorHexByName = new Map(
      (Array.isArray(product.customColors) ? product.customColors : [])
        .filter((color) => color?.name)
        .map((color) => [normalizeFilterText(color.name).toLowerCase(), color.hex || ''])
    );

    getValuesForFilterKey(product, 'color', categoryMap).forEach((value) => {
      if (!markSeen('color', value)) return;
      addOptionCount(sectionMap, 'color', 'Color', value, 'color', {
        hex: customColorHexByName.get(value.toLowerCase()) || ''
      });
    });

    getValuesForFilterKey(product, 'variation', categoryMap).forEach((value) => {
      if (!markSeen('variation', value)) return;
      addOptionCount(sectionMap, 'variation', 'Variation', value);
    });
  });

  const fixedOrder = ['productType', 'availability', 'price', 'color', 'variation'];
  const sections = Array.from(sectionMap.values()).map((section) => ({
    key: section.key,
    label: section.label,
    type: section.type,
    options: Array.from(section.optionsMap.values()).sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
  }));

  const derivedMin = priceValues.length > 0 ? Math.floor(Math.min(...priceValues)) : 0;
  const derivedMaxRaw = priceValues.length > 0 ? Math.ceil(Math.max(...priceValues)) : 10000;
  const derivedMax = derivedMaxRaw <= derivedMin ? derivedMin + 1 : derivedMaxRaw;

  const withPrice = [
    ...sections,
    {
      key: 'price',
      label: 'Price',
      type: 'price',
      options: [],
      meta: {
        min: derivedMin,
        max: derivedMax,
        step: 1
      }
    }
  ];

  return withPrice.sort((a, b) => {
    const ia = fixedOrder.indexOf(a.key);
    const ib = fixedOrder.indexOf(b.key);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.label.localeCompare(b.label);
  });
};

const applyFilters = (products, filters, categoryMap) => {
  let filtered = [...products];

  if (filters?.price?.min !== '' && filters?.price?.min !== undefined) {
    filtered = filtered.filter((product) => Number(product.price) >= Number(filters.price.min));
  }

  if (filters?.price?.max !== '' && filters?.price?.max !== undefined) {
    filtered = filtered.filter((product) => Number(product.price) <= Number(filters.price.max));
  }

  Object.entries(filters || {}).forEach(([filterKey, selectedValues]) => {
    if (filterKey === 'price' || !Array.isArray(selectedValues) || selectedValues.length === 0) return;

    const selectedSet = new Set(selectedValues.map((value) => normalizeFilterText(value).toLowerCase()));
    filtered = filtered.filter((product) => {
      const values = getValuesForFilterKey(product, filterKey, categoryMap).map((value) => value.toLowerCase());
      return values.some((value) => selectedSet.has(value));
    });
  });

  return filtered;
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { categories } = useCategoryData();

  const [searchInput, setSearchInput] = useState(queryParam);
  const [allMatchedProducts, setAllMatchedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const itemsPerPage = 16;

  const categoryMap = useMemo(() => {
    const map = new Map();
    (categories || []).forEach((cat) => {
      map.set(String(cat._id), cat.name);
    });
    return map;
  }, [categories]);

  // Sync search input when URL param changes
  useEffect(() => {
    setSearchInput(queryParam);
    setCurrentPage(1);
    setAppliedFilters({});
  }, [queryParam]);

  // Fetch full matched search dataset from backend
  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/products/search?q=${encodeURIComponent(queryParam)}&limit=500`);
        const data = res.data;
        setAllMatchedProducts(Array.isArray(data.products) ? data.products : []);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setAllMatchedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [queryParam]);

  // Handle local Search Bar submission inside the page
  const handlePageSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  // Build dynamic filter sections based on all matched products
  const filterSections = useMemo(() => {
    return buildDynamicFilterSections(allMatchedProducts, categoryMap);
  }, [allMatchedProducts, categoryMap]);

  // Apply filters client-side
  const filteredProducts = useMemo(() => {
    return applyFilters(allMatchedProducts, appliedFilters, categoryMap);
  }, [allMatchedProducts, appliedFilters, categoryMap]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];
    if (sortBy === 'price-asc') {
      return products.sort((a, b) => Number(a.price) - Number(b.price));
    }
    if (sortBy === 'price-desc') {
      return products.sort((a, b) => Number(b.price) - Number(a.price));
    }
    if (sortBy === 'rating') {
      return products.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }
    if (sortBy === 'newest') {
      return products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    // Default relevance
    return products;
  }, [filteredProducts, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const paginationRange = useMemo(() => {
    return getPaginationRange(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
    if (filterType === 'clearAll') {
      setAppliedFilters({});
      return;
    }

    if (filterType === 'clear') {
      setAppliedFilters((prev) => {
        const next = { ...prev };
        delete next[value];
        return next;
      });
      return;
    }

    if (filterType === 'price') {
      setAppliedFilters((prev) => ({
        ...prev,
        price: value
      }));
      return;
    }

    setAppliedFilters((prev) => {
      const currentValues = Array.isArray(prev[filterType]) ? prev[filterType] : [];
      const exists = currentValues.includes(value);

      const nextValues = exists
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      if (nextValues.length === 0) {
        const copy = { ...prev };
        delete copy[filterType];
        return copy;
      }

      return {
        ...prev,
        [filterType]: nextValues
      };
    });
  };

  const popularTags = ['Beds', 'Sofas', 'Dining Tables', 'Recliners', 'Nightstands', 'Sectionals', 'Coffee Tables'];

  return (
    <div className="search-page">
      <Header />

      <main className="search-page-container">
        {/* Page Title & Centered Search Field */}
        <section className="search-hero-section">
          <h1 className="search-hero-title">Search</h1>
          <div className="search-hero-bar-wrap">
            <SearchBar defaultValue={queryParam} />
          </div>
        </section>

        {/* Toolbar & Controls Bar */}
        <section className="search-controls-bar">
          <div className="search-summary">
            {queryParam ? (
              <span>
                Showing <strong>{sortedProducts.length}</strong> result{sortedProducts.length !== 1 ? 's' : ''} for "<strong>{queryParam}</strong>"
              </span>
            ) : (
              <span>Enter a search term to find products</span>
            )}
          </div>

          <div className="search-controls-right">
            <button
              type="button"
              className="search-mobile-filter-toggle"
              onClick={() => setIsMobileFilterOpen(true)}
            >
              <FilterIcon />
              <span>Filters</span>
            </button>

            <div className="search-sort-group">
              <label htmlFor="search-sort-select">Sort by</label>
              <select
                id="search-sort-select"
                className="search-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            <div className="search-view-mode-toggle">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <GridIcon />
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <ListIcon />
              </button>
            </div>
          </div>
        </section>

        {/* Content Layout: Sidebar Filters + Main Product Grid */}
        <div className="search-content-grid">
          {/* Desktop Filter Sidebar */}
          <aside className="search-sidebar-desktop">
            <FilterSidebar
              onFilterChange={handleFilterChange}
              appliedFilters={appliedFilters}
              filterSections={filterSections}
            />
          </aside>

          {/* Mobile Filter Modal */}
          {isMobileFilterOpen && (
            <div className="search-mobile-filter-modal">
              <div className="search-mobile-filter-overlay" onClick={() => setIsMobileFilterOpen(false)} />
              <div className="search-mobile-filter-content">
                <div className="search-mobile-filter-header">
                  <h3>Filter Results</h3>
                  <button
                    type="button"
                    className="close-filter-btn"
                    onClick={() => setIsMobileFilterOpen(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="search-mobile-filter-body">
                  <FilterSidebar
                    onFilterChange={handleFilterChange}
                    appliedFilters={appliedFilters}
                    filterSections={filterSections}
                  />
                </div>
                <div className="search-mobile-filter-footer">
                  <button
                    type="button"
                    className="apply-filters-btn"
                    onClick={() => setIsMobileFilterOpen(false)}
                  >
                    Apply Filters ({filteredProducts.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Product Grid / Cards List */}
          <div className="search-main-content">
            {loading ? (
              <div className="search-loading-state">
                <div className="search-spinner" />
                <p>Searching catalog...</p>
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <div className={`search-products-grid ${viewMode}`}>
                  {paginatedProducts.map((product) => {
                    const hasDiscount = product.discount > 0;
                    const originalPrice = hasDiscount
                      ? (product.price / (1 - product.discount / 100)).toFixed(2)
                      : null;
                    const imageUrl = getImageUrl(product.image || product.images?.[0]);

                    return (
                      <div key={product._id} className="search-product-card">
                        <div
                          className="search-card-image-wrap"
                          onClick={() => navigate(`/product/${product._id}`)}
                        >
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="search-card-img"
                            loading="lazy"
                            onError={(e) => {
                              const currentSrc = e.currentTarget.src;
                              const alternateUrl = getAlternateImageUrl(currentSrc, product.image);
                              if (alternateUrl && alternateUrl !== currentSrc) {
                                e.currentTarget.src = alternateUrl;
                              } else {
                                e.currentTarget.onerror = null;
                              }
                            }}
                          />
                          {/* Standard product badge if set on model */}
                          {product.badge && (
                            <div className="search-card-badges">
                              <span className="badge badge-sale">{product.badge}</span>
                            </div>
                          )}
                        </div>

                        <div className="search-card-info">
                          <h3
                            className="search-card-title"
                            onClick={() => navigate(`/product/${product._id}`)}
                          >
                            {product.name}
                          </h3>

                          {product.rating > 0 && (
                            <div className="search-card-rating">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} filled={i < Math.round(product.rating)} />
                              ))}
                              <span className="rating-count">({product.numReviews || 0})</span>
                            </div>
                          )}

                          <div className="search-card-price-row">
                            <span className="search-card-price">
                              ${Number(product.price).toFixed(2)}
                            </span>
                            {originalPrice && (
                              <span className="search-card-old-price">
                                ${originalPrice}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            className="search-card-add-btn"
                            onClick={() => addToCart(product, 1)}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Best UX Pagination Controls */}
                {totalPages > 1 && (
                  <nav className="search-pagination" aria-label="Search results pagination">
                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage((prev) => Math.max(1, prev - 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                    >
                      ← Previous
                    </button>

                    <div className="pagination-pages">
                      {paginationRange.map((pageNumber, idx) => {
                        if (pageNumber === '...') {
                          return (
                            <span key={`dots-${idx}`} className="pagination-dots">
                              ...
                            </span>
                          );
                        }

                        return (
                          <button
                            key={pageNumber}
                            type="button"
                            className={`pagination-num ${currentPage === pageNumber ? 'active' : ''}`}
                            onClick={() => {
                              setCurrentPage(pageNumber);
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                    >
                      Next →
                    </button>
                  </nav>
                )}
              </>
            ) : (
              /* Clean Empty State */
              <div className="search-empty-state">
                <div className="empty-search-icon">🔍</div>
                <h2>No products found for "{queryParam}"</h2>
                <p>Try adjusting your search query or clearing applied filters to see more results.</p>

                {Object.keys(appliedFilters).length > 0 && (
                  <button
                    type="button"
                    className="clear-filters-btn-primary"
                    onClick={() => handleFilterChange('clearAll')}
                  >
                    Clear All Applied Filters
                  </button>
                )}

                <div className="popular-searches-box">
                  <h4>Popular Searches:</h4>
                  <div className="popular-tags-list">
                    {popularTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="popular-tag-chip"
                        onClick={() => {
                          setSearchInput(tag);
                          setSearchParams({ q: tag });
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
