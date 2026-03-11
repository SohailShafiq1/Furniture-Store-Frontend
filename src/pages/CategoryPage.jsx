import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORIES, getProducts } from '../data/categoryData';
import FilterSidebar from '../components/FilterSidebar/FilterSidebar';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './CategoryPage.css';

export default function CategoryPage() {
  const { categoryId } = useParams();
  const category = CATEGORIES[categoryId];
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [products, setProducts] = useState([]);
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
    return <div>Category not found</div>;
  }

  return (
    <div className="category-page">
      <Header />
      
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="separator">/</span>
          <span>{category.name}</span>
        </div>

        <h1 className="category-title">
          {category.name}
          <span className="product-count">({products.length} products)</span>
        </h1>

        {/* Instagram-style circular filters */}
        <div className="category-filters-container">
          <div className="category-filters">
            {category.subcategories.map((sub) => (
              <button
                key={sub.id}
                className={`filter-circle ${sub.theme} ${selectedSubcategory === sub.id ? 'active' : ''}`}
                onClick={() => setSelectedSubcategory(sub.id)}
              >
                <div className="filter-circle-inner">
                  <img src={sub.image} alt={sub.label} className="filter-image" />
                </div>
                <span className="filter-label">{sub.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter and Sort Bar */}
        <div className="filter-sort-bar">
          <button className="filter-btn mobile-filter-btn" onClick={() => setShowMobileFilters(true)}>
            <span>🔍</span>
            <span>Filters</span>
          </button>
          
          <div className="sort-by">
            <span>Sort by:</span>
            <select className="sort-select">
              <option>Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Name: A-Z</option>
              <option>Newest</option>
            </select>
          </div>

          <div className="view-toggle">
            <span>View:</span>
            <button className="view-btn active">⊞</button>
            <button className="view-btn">☰</button>
          </div>
        </div>

        {/* Main Content with Sidebar and Products */}
        <div className="category-content">
          {/* Desktop Sidebar */}
          <div className="desktop-sidebar">
            <FilterSidebar
              categoryId={categoryId}
              onFilterChange={handleFilterChange}
              appliedFilters={appliedFilters}
            />
          </div>

          {/* Products Section */}
          <div className="products-section">
            <div className="products-grid">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      <img src={product.image} alt={product.name} />
                      {product.badge && (
                        <div className="product-badges">
                          <span className={`badge ${product.badge === 'In Stock' ? 'badge-stock' : 'badge-sale'}`}>
                            {product.badge}
                          </span>
                        </div>
                      )}
                      <button className="wishlist-btn">♡</button>
                    </div>
                    <div className="product-info">
                      <span className="product-brand">{product.brand}</span>
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-rating">
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`star ${i < Math.floor(product.rating) ? 'filled' : ''}`}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="review-count">({product.reviews})</span>
                      </div>
                      <div className="product-pricing">
                        <span className="product-price">${product.price}</span>
                        {product.originalPrice && (
                          <span className="original-price">${product.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-products">No products found</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="mobile-filter-modal">
          <div className="mobile-filter-header">
            <h2>Filters</h2>
            <button className="close-btn" onClick={() => setShowMobileFilters(false)}>✕</button>
          </div>
          <div className="mobile-filter-content">
            <FilterSidebar
              categoryId={categoryId}
              onFilterChange={handleFilterChange}
              appliedFilters={appliedFilters}
            />
          </div>
          <div className="mobile-filter-footer">
            <button className="apply-filters-btn" onClick={() => setShowMobileFilters(false)}>
              View {products.length} Results
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
