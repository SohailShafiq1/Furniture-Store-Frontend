import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORIES, getProducts } from '../data/categoryData';
import FilterSidebar from '../components/FilterSidebar/FilterSidebar';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './CategoryPage.css';

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

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#FFB800" : "none"} stroke={filled ? "#FFB800" : "#D1D1D1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

export default function CategoryPage() {
  const { categoryId } = useParams();
  const category = CATEGORIES[categoryId];
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    productType: [],
    availability: [],
    color: [],
    price: { min: '', max: '' }
  });

  useEffect(() => {
    if (category) {
      const categoryProducts = getProducts(categoryId, selectedSubcategory);
      setProducts(categoryProducts);
    }
  }, [categoryId, selectedSubcategory, category]);

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'clearAll') {
      setAppliedFilters({
        productType: [],
        availability: [],
        color: [],
        price: { min: '', max: '' }
      });
    } else if (filterType === 'clear') {
      setAppliedFilters(prev => ({
        ...prev,
        [value]: []
      }));
    } else if (filterType === 'price') {
      setAppliedFilters(prev => ({
        ...prev,
        price: value
      }));
    } else {
      setAppliedFilters(prev => {
        const currentValues = prev[filterType] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        
        return {
          ...prev,
          [filterType]: newValues
        };
      });
    }
  };

  if (!category) {
    return <div className="category-not-found">Category not found</div>;
  }

  return (
    <div className="luna-category-page">
      <Header />
      
      <div className="luna-page-container">
        {/* Breadcrumb */}
        <nav className="luna-breadcrumb">
          <Link to="/">Home</Link>
          <span className="luna-sep">/</span>
          <span>{category.name}</span>
        </nav>

        {/* Circular Sub-categories */}
        <div className="luna-subcat-row">
          {category.subcategories.map((sub) => (
            <button
              key={sub.id}
              className={`luna-subcat-card ${selectedSubcategory === sub.id ? 'active' : ''}`}
              onClick={() => setSelectedSubcategory(sub.id)}
            >
              <div className="luna-subcat-img-wrapper">
                <img src={sub.image} alt={sub.label} />
              </div>
              <span className="luna-subcat-label">{sub.label}</span>
            </button>
          ))}
        </div>

        {/* Page Title & Count */}
        <div className="luna-page-header">
          <h1 className="luna-category-title">{category.name}</h1>
          <p className="luna-product-count">{products.length} products found</p>
        </div>

        {/* Toolbar */}
        <div className="luna-toolbar">
          <button className="luna-filter-toggle-btn" onClick={() => setShowMobileFilters(true)}>
            <FilterIcon />
            <span>Filter</span>
          </button>

          <div className="luna-toolbar-right">
            <div className="luna-sort-dropdown">
              <span>Sort by:</span>
              <button className="luna-dropdown-trigger">
                Featured
                <ChevronDown />
              </button>
            </div>

            <div className="luna-view-toggle">
              <span>View as:</span>
              <button 
                className={`luna-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <GridIcon />
              </button>
              <button 
                className={`luna-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <ListIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="luna-main-layout">
          {/* Sidebar */}
          <aside className="luna-sidebar">
            <FilterSidebar
              categoryId={categoryId}
              onFilterChange={handleFilterChange}
              appliedFilters={appliedFilters}
            />
          </aside>

          {/* Product Grid */}
          <main className="luna-products-area">
            <div className={`luna-products-grid ${viewMode}`}>
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="luna-product-card">
                    <div className="luna-card-media">
                      <img src={product.image} alt={product.name} />
                      
                      {product.badge && (
                        <div className="luna-badge-container">
                          <span className={`luna-badge ${product.badge.toLowerCase().replace(' ', '-')}`}>
                            {product.badge}
                          </span>
                        </div>
                      )}
                      
                      <button className="luna-wishlist-btn" aria-label="Add to wishlist">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>
                    </div>

                    <div className="luna-card-info">
                      <p className="luna-product-brand">{product.brand || 'LUNA'}</p>
                      <h3 className="luna-product-name">{product.name}</h3>
                      
                      <div className="luna-rating-row">
                        <div className="luna-stars">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} filled={i < Math.floor(product.rating || 5)} />
                          ))}
                        </div>
                        <span className="luna-review-text">({product.reviews || 0})</span>
                      </div>

                      <div className="luna-price-row">
                        <span className="luna-current-price">${product.price}</span>
                        {product.originalPrice && (
                          <span className="luna-old-price">${product.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="luna-no-results">
                  <h3>No products found matching your criteria.</h3>
                  <button onClick={() => handleFilterChange('clearAll')} className="luna-clear-btn">
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="luna-mobile-modal">
          <div className="luna-modal-header">
            <h2>Filters</h2>
            <button className="luna-modal-close" onClick={() => setShowMobileFilters(false)}>✕</button>
          </div>
          <div className="luna-modal-body">
            <FilterSidebar
              categoryId={categoryId}
              onFilterChange={handleFilterChange}
              appliedFilters={appliedFilters}
            />
          </div>
          <div className="luna-modal-footer">
            <button className="luna-apply-btn" onClick={() => setShowMobileFilters(false)}>
              Show {products.length} Results
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
