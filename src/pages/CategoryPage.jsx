import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCategoryData } from '../hooks/useCategoryData';
import { useProductsByCategory } from '../hooks/useProductsByCategory';
import { BACKEND_URL } from '../config/api';
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
  const { categoryId, subcategoryName } = useParams();
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useCategoryData();
  const { products: categoryProducts, loading: productsLoading } = useProductsByCategory(categoryId);
  
  // Find the current category from fetched categories
  const category = categories.find(cat => cat._id === categoryId);
  const subCategory = category?.subCategories?.find(s => s.name === subcategoryName);
  
  const [products, setProducts] = useState([]);
  const [activeSubSub, setActiveSubSub] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    productType: [],
    availability: [],
    color: [],
    price: { min: '', max: '' }
  });

  // Update products when categoryProducts change or subcategory changes
  useEffect(() => {
    setActiveSubSub(null); // Reset sub-sub filter when changing sub-category
    setAppliedFilters({
      productType: [],
      availability: [],
      color: [],
      price: { min: '', max: '' }
    });

    if (!subcategoryName) {
      setProducts(categoryProducts);
    } else {
      // Filter products by sub-category
      const filtered = categoryProducts.filter(
        p => p.subCategoryName?.trim().toLowerCase() === subcategoryName.trim().toLowerCase()
      );
      setProducts(filtered);
    }
  }, [categoryProducts, subcategoryName]);

  const handleFilterChange = (filterType, value) => {
    // Determine the base set of products to filter from
    // If we have a subcategory, we only filter within that subcategory
    let baseProducts = categoryProducts;
    if (subcategoryName) {
      baseProducts = categoryProducts.filter(
        p => p.subCategoryName?.trim().toLowerCase() === subcategoryName.trim().toLowerCase()
      );
    }
    // If we have an active sub-sub-category, further narrow the base
    if (activeSubSub) {
      baseProducts = baseProducts.filter(
        p => p.subSubCategoryName?.trim().toLowerCase() === activeSubSub.trim().toLowerCase()
      );
    }

    if (filterType === 'clearAll') {
      const newFilters = {
        productType: [],
        availability: [],
        color: [],
        price: { min: '', max: '' }
      };
      setAppliedFilters(newFilters);
      setProducts(baseProducts);
      return;
    }

    // Update filters state
    let newFilters = { ...appliedFilters };
    if (filterType === 'clear') {
      newFilters[value] = [];
    } else if (filterType === 'price') {
      newFilters.price = value;
    } else {
      const currentValues = appliedFilters[filterType] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      newFilters[filterType] = newValues;
    }
    setAppliedFilters(newFilters);

    // Apply filters to the base set
    let filtered = [...baseProducts];

    // Filter by type (this is tricky because Sidebar has hardcoded values currently)
    if (newFilters.productType.length > 0 && !newFilters.productType.includes('All')) {
      // For now, if Sidebar is hardcoded, we might not match actual product attributes
      // But we apply it anyway
      filtered = filtered.filter(p => newFilters.productType.includes(p.name) || newFilters.productType.some(t => p.description?.includes(t)));
    }

    // Filter by price
    if (newFilters.price.min) filtered = filtered.filter(p => p.price >= Number(newFilters.price.min));
    if (newFilters.price.max) filtered = filtered.filter(p => p.price <= Number(newFilters.price.max));

    setProducts(filtered);
  };

  // Handle Sub-Sub-Category Filtering logic separately to simplify clicks
  const handleSubSubFilter = (ssName) => {
    setActiveSubSub(ssName);
    const subNameFromUrl = subcategoryName;

    // Reset applied filters when switching sub-sub categories to avoid conflicts
    setAppliedFilters({
      productType: [],
      availability: [],
      color: [],
      price: { min: '', max: '' }
    });

    if (!ssName) {
      // Reset to all products in sub-category
      const filtered = categoryProducts.filter(
        p => p.subCategoryName?.trim().toLowerCase() === subNameFromUrl?.trim().toLowerCase()
      );
      setProducts(filtered);
    } else {
      const filtered = categoryProducts.filter(
        p => p.subCategoryName?.trim().toLowerCase() === subNameFromUrl?.trim().toLowerCase() && 
             p.subSubCategoryName?.trim().toLowerCase() === ssName.trim().toLowerCase()
      );
      setProducts(filtered);
    }
  };

  if (categoriesLoading || productsLoading) {
    return (
      <div className="luna-category-page">
        <Header />
        <div className="luna-page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p>Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="luna-category-page">
        <Header />
        <div className="luna-page-container">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2>Category not found</h2>
            <button onClick={() => navigate('/')} className="luna-clear-btn">
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="luna-category-page">
      <Header />
      
      <div className="luna-page-container">
        {/* Breadcrumb */}
        <nav className="luna-breadcrumb">
          <Link to="/">Home</Link>
          <span className="luna-sep">/</span>
          <Link to={`/category/${categoryId}`} style={{ color: subcategoryName ? 'inherit' : 'var(--luna-orange)' }}>
            {category.name}
          </Link>
          {subcategoryName && (
            <>
              <span className="luna-sep">/</span>
              <span style={{ color: 'var(--luna-orange)', fontWeight: '600' }}>{subcategoryName}</span>
            </>
          )}
        </nav>

        {/* Page Title & Count */}
        <div className="luna-page-header">
          <h1 className="luna-category-title">{subcategoryName || category.name}</h1>
          <p className="luna-product-count">{products.length} products found</p>
        </div>

        {/* Circular Sub-categories / Sub-Sub-categories */}
        <div className="luna-subcat-row">
          {subcategoryName ? (
            // IF IN A SUBCATEGORY: Show "All" + Sub-Sub-Categories
            <>
              {/* "All" Circle to reset sub-sub filter */}
              <button
                className={`luna-subcat-card ${!activeSubSub ? 'active' : ''}`}
                onClick={() => handleSubSubFilter(null)}
              >
                <div className="luna-subcat-img-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee' }}>
                  <span style={{ fontWeight: '700', fontSize: '12px' }}>ALL</span>
                </div>
                <span className="luna-subcat-label">All {subcategoryName}</span>
              </button>

              {category.subCategories?.find(s => s.name === subcategoryName)?.subSubCategories?.length > 0 ? (
                category.subCategories.find(s => s.name === subcategoryName).subSubCategories.map((ss, idx) => (
                  <button
                    key={idx}
                    className={`luna-subcat-card ${activeSubSub === ss.name ? 'active' : ''}`}
                    onClick={() => handleSubSubFilter(ss.name)}
                  >
                    <div className="luna-subcat-img-wrapper">
                      <img 
                        src={ss.image?.startsWith('http') ? ss.image : (ss.image ? `${BACKEND_URL}/${ss.image}` : '/placeholder-image.png')} 
                        alt={ss.name} 
                        onError={(e) => { e.target.src = '/placeholder-image.png'; }}
                      />
                    </div>
                    <span className="luna-subcat-label">{ss.name}</span>
                  </button>
                ))
              ) : null}
            </>
          ) : (
            // IF AT MAIN CATEGORY: Show ONLY Sub-Categories
            category.subCategories && category.subCategories.length > 0 ? (
              category.subCategories.map((sub, idx) => (
                <Link
                  key={idx}
                  to={`/category/${categoryId}/sub/${sub.name}`}
                  className="luna-subcat-card"
                >
                  <div className="luna-subcat-img-wrapper">
                    <img 
                      src={sub.image?.startsWith('http') ? sub.image : `${BACKEND_URL}/${sub.image}`} 
                      alt={sub.name} 
                      onError={(e) => { e.target.src = '/placeholder-image.png'; }}
                    />
                  </div>
                  <span className="luna-subcat-label">{sub.name}</span>
                </Link>
              ))
            ) : null
          )}
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
                  <div 
                    key={product._id} 
                    className="luna-product-card-btn"
                    onClick={() => navigate(`/product/${categoryId}/${product._id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        navigate(`/product/${categoryId}/${product._id}`);
                      }
                    }}
                  >
                    <div className="luna-product-card">
                    <div className="luna-card-media">
                      <img src={product.image?.startsWith('http') ? product.image : `${BACKEND_URL}/${product.image}`} alt={product.name} />
                      
                      {product.badge && (
                        <div className="luna-badge-container">
                          <span className={`luna-badge ${product.badge.toLowerCase().replace(' ', '-')}`}>
                            {product.badge}
                          </span>
                        </div>
                      )}
                      
                      <div 
                        className="luna-wishlist-btn" 
                        aria-label="Add to wishlist"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Added to wishlist:', product.name);
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </div>
                    </div>

                    <div className="luna-card-info">
                      <p className="luna-product-brand">{product.brandId || 'LUNA'}</p>
                      <h3 className="luna-product-name">{product.name}</h3>
                      
                      <div className="luna-rating-row">
                        <div className="luna-stars">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} filled={i < 4} />
                          ))}
                        </div>
                        <span className="luna-review-text">(0)</span>
                      </div>

                      <div className="luna-price-row">
                        <span className="luna-current-price">${product.price}</span>
                        {product.discount > 0 && (
                          <span className="luna-old-price">${product.price + (product.price * product.discount / 100)}</span>
                        )}
                      </div>
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
