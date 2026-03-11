import { useState } from 'react';
import './FilterSidebar.css';

export default function FilterSidebar({ categoryId, onFilterChange, appliedFilters = {} }) {
  const [expandedSections, setExpandedSections] = useState({
    productType: true,
    availability: true,
    price: true,
    color: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCheckboxChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  const handlePriceChange = (type, value) => {
    onFilterChange('price', { ...appliedFilters.price, [type]: value });
  };

  const clearAllFilters = () => {
    onFilterChange('clearAll');
  };

  const clearFilter = (filterType) => {
    onFilterChange('clear', filterType);
  };

  // Count applied filters
  const appliedFiltersCount = Object.keys(appliedFilters).filter(key => {
    if (key === 'price') return false;
    return appliedFilters[key] && appliedFilters[key].length > 0;
  }).length;

  return (
    <div className="filter-sidebar">
      {/* Applied Filters */}
      {appliedFiltersCount > 0 && (
        <div className="applied-filters-section">
          <div className="section-header">
            <h3>{appliedFiltersCount} Applied Filter{appliedFiltersCount !== 1 ? 's' : ''}</h3>
            <button className="collapse-btn" onClick={() => toggleSection('applied')}>
              {expandedSections.applied ? '∧' : '∨'}
            </button>
          </div>
          <div className="applied-filters">
            {Object.entries(appliedFilters).map(([key, values]) => {
              if (key === 'price' || !values || values.length === 0) return null;
              return values.map(value => (
                <div key={`${key}-${value}`} className="applied-filter-tag">
                  <button className="remove-filter" onClick={() => handleCheckboxChange(key, value)}>
                    ✕
                  </button>
                  <span>{value}</span>
                </div>
              ));
            })}
            <button className="clear-all-btn" onClick={clearAllFilters}>Clear all</button>
          </div>
        </div>
      )}

      {/* Product Type */}
      <div className="filter-section">
        <div className="section-header" onClick={() => toggleSection('productType')}>
          <h3>Product Type</h3>
          <button className="collapse-btn">
            {expandedSections.productType ? '∧' : '∨'}
          </button>
        </div>
        {expandedSections.productType && (
          <div className="filter-options">
            <label className="filter-option">
              <input
                type="checkbox"
                checked={appliedFilters.productType?.includes('All') || false}
                onChange={() => handleCheckboxChange('productType', 'All')}
              />
              <span>All Products</span>
              <span className="count">(900)</span>
            </label>
            <label className="filter-option">
              <input
                type="checkbox"
                checked={appliedFilters.productType?.includes('Sofas') || false}
                onChange={() => handleCheckboxChange('productType', 'Sofas')}
              />
              <span>Sofas</span>
              <span className="count">(253)</span>
            </label>
            <label className="filter-option">
              <input
                type="checkbox"
                checked={appliedFilters.productType?.includes('Loveseats') || false}
                onChange={() => handleCheckboxChange('productType', 'Loveseats')}
              />
              <span>Loveseats</span>
              <span className="count">(127)</span>
            </label>
            <label className="filter-option">
              <input
                type="checkbox"
                checked={appliedFilters.productType?.includes('Sectionals') || false}
                onChange={() => handleCheckboxChange('productType', 'Sectionals')}
              />
              <span>Sectionals</span>
              <span className="count">(178)</span>
            </label>
            <label className="filter-option">
              <input
                type="checkbox"
                checked={appliedFilters.productType?.includes('Chairs') || false}
                onChange={() => handleCheckboxChange('productType', 'Chairs')}
              />
              <span>Chairs</span>
              <span className="count">(342)</span>
            </label>
            {appliedFilters.productType?.length > 0 && (
              <button className="clear-section-btn" onClick={() => clearFilter('productType')}>
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="filter-section">
        <div className="section-header" onClick={() => toggleSection('availability')}>
          <h3>Availability</h3>
          <button className="collapse-btn">
            {expandedSections.availability ? '∧' : '∨'}
          </button>
        </div>
        {expandedSections.availability && (
          <div className="filter-options">
            <label className="filter-option">
              <input
                type="checkbox"
                checked={appliedFilters.availability?.includes('In Stock') || false}
                onChange={() => handleCheckboxChange('availability', 'In Stock')}
              />
              <span>In Stock</span>
              <span className="count">(658)</span>
            </label>
            <label className="filter-option">
              <input
                type="checkbox"
                checked={appliedFilters.availability?.includes('In 2 Weeks') || false}
                onChange={() => handleCheckboxChange('availability', 'In 2 Weeks')}
              />
              <span>In 2 Weeks</span>
              <span className="count">(142)</span>
            </label>
            <label className="filter-option">
              <input
                type="checkbox"
                checked={appliedFilters.availability?.includes('3 Weeks or more') || false}
                onChange={() => handleCheckboxChange('availability', '3 Weeks or more')}
              />
              <span>3 Weeks or more</span>
              <span className="count">(100)</span>
            </label>
            {appliedFilters.availability?.length > 0 && (
              <button className="clear-section-btn" onClick={() => clearFilter('availability')}>
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="filter-section">
        <div className="section-header" onClick={() => toggleSection('price')}>
          <h3>Price</h3>
          <button className="collapse-btn">
            {expandedSections.price ? '∧' : '∨'}
          </button>
        </div>
        {expandedSections.price && (
          <div className="filter-options">
            <div className="price-inputs">
              <div className="price-input-group">
                <span className="currency">$</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={appliedFilters.price?.min || ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                />
              </div>
              <span className="separator">—</span>
              <div className="price-input-group">
                <span className="currency">$</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={appliedFilters.price?.max || ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                />
              </div>
            </div>
            <div className="price-slider">
              <input
                type="range"
                min="0"
                max="5000"
                value={appliedFilters.price?.max || 5000}
                onChange={(e) => handlePriceChange('max', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Color */}
      <div className="filter-section">
        <div className="section-header" onClick={() => toggleSection('color')}>
          <h3>Color</h3>
          <button className="collapse-btn">
            {expandedSections.color ? '∧' : '∨'}
          </button>
        </div>
        {expandedSections.color && (
          <div className="filter-options">
            {[
              { name: 'Blacks', color: '#000000', count: 8 },
              { name: 'Grays', color: '#808080', count: 40 },
              { name: 'Browns', color: '#8B4513', count: 31 },
              { name: 'Blues', color: '#0000FF', count: 4 },
              { name: 'Reds', color: '#FF6B6B', count: 0 },
              { name: 'Greens', color: '#4CAF50', count: 0 },
              { name: 'Off-whites', color: '#F5F5DC', count: 12 },
            ].map(colorOption => (
              <label key={colorOption.name} className="filter-option color-option">
                <input
                  type="checkbox"
                  checked={appliedFilters.color?.includes(colorOption.name) || false}
                  onChange={() => handleCheckboxChange('color', colorOption.name)}
                  disabled={colorOption.count === 0}
                />
                <span className="color-dot" style={{ backgroundColor: colorOption.color }}></span>
                <span className={colorOption.count === 0 ? 'disabled' : ''}>{colorOption.name}</span>
                <span className="count">({colorOption.count})</span>
              </label>
            ))}
            {appliedFilters.color?.length > 0 && (
              <button className="clear-section-btn" onClick={() => clearFilter('color')}>
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
