import { useState } from 'react';
import './FilterSidebar.css';

const FALLBACK_COLOR_BY_NAME = {
  black: '#111111',
  white: '#f5f5f5',
  gray: '#8d8d8d',
  grey: '#8d8d8d',
  brown: '#8b5a2b',
  blue: '#2f6fed',
  green: '#3b9b4a',
  red: '#d94a4a',
  beige: '#d8c6a5',
  cream: '#efe6d2',
  tan: '#c6a67d',
  orange: '#f57c00'
};

const getColorSwatch = (value, hex) => {
  if (hex) return hex;
  const lower = String(value || '').toLowerCase();
  const matched = Object.entries(FALLBACK_COLOR_BY_NAME).find(([name]) => lower.includes(name));
  return matched ? matched[1] : '#d7d7d7';
};

export default function FilterSidebar({ onFilterChange, appliedFilters = {}, filterSections = [] }) {
  const [expandedSections, setExpandedSections] = useState({ applied: true, price: true });

  const priceSection = filterSections.find((section) => section.key === 'price');
  const priceBounds = priceSection?.meta || { min: 0, max: 10000, step: 1 };
  const rangeMin = Number(priceBounds.min || 0);
  const rangeMax = Number(priceBounds.max || 10000);
  const rangeStep = Number(priceBounds.step || 1);

  const selectedMin = appliedFilters?.price?.min === '' || appliedFilters?.price?.min === undefined
    ? rangeMin
    : Number(appliedFilters.price.min);
  const selectedMax = appliedFilters?.price?.max === '' || appliedFilters?.price?.max === undefined
    ? rangeMax
    : Number(appliedFilters.price.max);

  const safeMin = Math.max(rangeMin, Math.min(selectedMin, selectedMax));
  const safeMax = Math.min(rangeMax, Math.max(selectedMax, safeMin));

  const sliderPercentMin = ((safeMin - rangeMin) / Math.max(1, rangeMax - rangeMin)) * 100;
  const sliderPercentMax = ((safeMax - rangeMin) / Math.max(1, rangeMax - rangeMin)) * 100;

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
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

  const handlePriceInputChange = (type, rawValue) => {
    const parsed = rawValue === '' ? '' : Number(rawValue);

    if (parsed === '') {
      handlePriceChange(type, '');
      return;
    }

    let clamped = Math.max(rangeMin, Math.min(parsed, rangeMax));
    if (type === 'min') clamped = Math.min(clamped, safeMax);
    if (type === 'max') clamped = Math.max(clamped, safeMin);

    handlePriceChange(type, clamped);
  };

  const clearAllFilters = () => {
    onFilterChange('clearAll');
  };

  const clearFilter = (filterType) => {
    onFilterChange('clear', filterType);
  };

  const appliedFilterEntries = Object.entries(appliedFilters).flatMap(([key, values]) => {
    if (key === 'price' || !Array.isArray(values) || values.length === 0) return [];
    return values.map((value) => ({ key, value }));
  });

  const hasPriceFilter = Boolean(appliedFilters?.price?.min || appliedFilters?.price?.max);
  const appliedFiltersCount = appliedFilterEntries.length + (hasPriceFilter ? 1 : 0);

  return (
    <div className="filter-sidebar">
      {appliedFiltersCount > 0 && (
        <div className="applied-filters-section">
          <div className="section-header">
            <h3>{appliedFiltersCount} Applied Filter{appliedFiltersCount !== 1 ? 's' : ''}</h3>
            <button type="button" className="collapse-btn" onClick={() => toggleSection('applied')}>
              {expandedSections.applied ? '∧' : '∨'}
            </button>
          </div>

          {expandedSections.applied && (
            <div className="applied-filters">
              {appliedFilterEntries.map(({ key, value }) => (
                <div key={`${key}-${value}`} className="applied-filter-tag">
                  <button type="button" className="remove-filter" onClick={() => handleCheckboxChange(key, value)}>
                    ✕
                  </button>
                  <span>{value}</span>
                </div>
              ))}

              {hasPriceFilter && (
                <div className="applied-filter-tag">
                  <button type="button" className="remove-filter" onClick={() => clearFilter('price')}>
                    ✕
                  </button>
                  <span>
                    ${appliedFilters.price?.min || 0} - ${appliedFilters.price?.max || 'Any'}
                  </span>
                </div>
              )}

              <button type="button" className="clear-all-btn" onClick={clearAllFilters}>Clear all</button>
            </div>
          )}
        </div>
      )}

      {filterSections.map((section) => {
        const isOpen = expandedSections[section.key] ?? true;
        const selectedValues = Array.isArray(appliedFilters[section.key]) ? appliedFilters[section.key] : [];

        return (
          <div key={section.key} className="filter-section">
            <div className="section-header" onClick={() => toggleSection(section.key)}>
              <h3>{section.label}</h3>
              <button type="button" className="collapse-btn">
                {isOpen ? '∧' : '∨'}
              </button>
            </div>

            {isOpen && section.type === 'price' && (
              <div className="filter-options">
                <div className="price-inputs">
                  <div className="price-input-group">
                    <span className="currency">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Min"
                      value={safeMin}
                      min={rangeMin}
                      max={safeMax}
                      onChange={(event) => handlePriceInputChange('min', event.target.value)}
                    />
                  </div>
                  <span className="separator">-</span>
                  <div className="price-input-group">
                    <span className="currency">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Max"
                      value={safeMax}
                      min={safeMin}
                      max={rangeMax}
                      onChange={(event) => handlePriceInputChange('max', event.target.value)}
                    />
                  </div>
                </div>

                <div className="price-slider price-slider-dual">
                  <div className="price-slider-track" />
                  <div
                    className="price-slider-range"
                    style={{ left: `${sliderPercentMin}%`, width: `${Math.max(0, sliderPercentMax - sliderPercentMin)}%` }}
                  />
                  <input
                    type="range"
                    min={rangeMin}
                    max={rangeMax}
                    step={rangeStep}
                    value={safeMin}
                    onChange={(event) => handlePriceInputChange('min', event.target.value)}
                    className="price-range-input price-range-input-min"
                  />
                  <input
                    type="range"
                    min={rangeMin}
                    max={rangeMax}
                    step={rangeStep}
                    value={safeMax}
                    onChange={(event) => handlePriceInputChange('max', event.target.value)}
                    className="price-range-input price-range-input-max"
                  />
                </div>

                <div className="price-hint">
                  Showing ${safeMin} - ${safeMax}
                </div>

                {(appliedFilters.price?.min !== '' || appliedFilters.price?.max !== '') && (
                  <button type="button" className="clear-section-btn" onClick={() => clearFilter('price')}>
                    Clear
                  </button>
                )}
              </div>
            )}

            {isOpen && section.type !== 'price' && (
              <div className="filter-options">
                {section.options.map((option) => (
                  <label key={`${section.key}-${option.value}`} className={`filter-option ${section.type === 'color' ? 'color-option' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      onChange={() => handleCheckboxChange(section.key, option.value)}
                    />

                    {section.type === 'color' && (
                      <span
                        className="color-dot"
                        style={{ backgroundColor: getColorSwatch(option.value, option.hex) }}
                      />
                    )}

                    <span>{option.value}</span>
                    <span className="count">({option.count})</span>
                  </label>
                ))}

                {selectedValues.length > 0 && (
                  <button type="button" className="clear-section-btn" onClick={() => clearFilter(section.key)}>
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
