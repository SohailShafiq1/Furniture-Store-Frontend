import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../../../config/api';
import './ProductPickerModal.css';

const ProductPickerModal = ({ isOpen, onClose, onSelectProducts, selectedProductIds = [], categories = [] }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [localSelectedIds, setLocalSelectedIds] = useState(selectedProductIds);
  
  // Filters
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Derived lists for filtering
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);

  // Fetch all products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/products/all`);
        const data = await response.json();
        const productsArray = Array.isArray(data) ? data : [];
        setAllProducts(productsArray);
      } catch (err) {
        console.error('Error fetching products:', err);
        setAllProducts([]);
      }
    };

    if (isOpen) {
      fetchProducts();
      setLocalSelectedIds(selectedProductIds);
    }
  }, [isOpen, selectedProductIds]);

  // Update sub-categories when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      const category = categories.find(c => c._id === selectedCategoryId);
      const subs = category?.subCategories?.map(sub => sub.name) || [];
      setSubCategories(subs);
      setSelectedSubCategory('');
      setSubSubCategories([]);
      setSelectedSubSubCategory('');
    } else {
      setSubCategories([]);
      setSelectedSubCategory('');
      setSubSubCategories([]);
      setSelectedSubSubCategory('');
    }
  }, [selectedCategoryId, categories]);

  // Update sub-sub-categories when sub-category changes
  useEffect(() => {
    if (selectedCategoryId && selectedSubCategory) {
      const category = categories.find(c => c._id === selectedCategoryId);
      const subCat = category?.subCategories?.find(sub => sub.name === selectedSubCategory);
      const subSubs = subCat?.subSubCategories?.map(sub => sub.name) || [];
      setSubSubCategories(subSubs);
      setSelectedSubSubCategory('');
    } else {
      setSubSubCategories([]);
      setSelectedSubSubCategory('');
    }
  }, [selectedCategoryId, selectedSubCategory, categories]);

  // Filter products based on selected filters
  useEffect(() => {
    let filtered = [...allProducts];

    // Filter by category
    if (selectedCategoryId) {
      filtered = filtered.filter(p => String(p.category) === String(selectedCategoryId));
    }

    // Filter by sub-category
    if (selectedSubCategory) {
      filtered = filtered.filter(p => 
        p.subCategoryName?.toLowerCase() === selectedSubCategory.toLowerCase()
      );
    }

    // Filter by sub-sub-category
    if (selectedSubSubCategory) {
      filtered = filtered.filter(p => 
        p.subSubCategoryName?.toLowerCase() === selectedSubSubCategory.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(term) || 
        p.sku?.toLowerCase().includes(term)
      );
    }

    setFilteredProducts(filtered);
  }, [allProducts, selectedCategoryId, selectedSubCategory, selectedSubSubCategory, searchTerm]);

  const handleToggleProduct = (productId) => {
    setLocalSelectedIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (localSelectedIds.length === filteredProducts.length) {
      setLocalSelectedIds([]);
    } else {
      const allIds = filteredProducts.map(p => p._id);
      setLocalSelectedIds(allIds);
    }
  };

  const handleSubmit = () => {
    onSelectProducts(localSelectedIds);
    onClose();
  };

  const handleClear = () => {
    setLocalSelectedIds([]);
  };

  if (!isOpen) return null;

  return (
    <div className="product-picker-overlay">
      <div className="product-picker-modal">
        <div className="product-picker-header">
          <h2>Select Products for Ready Made Sets</h2>
          <button className="product-picker-close" onClick={onClose}>×</button>
        </div>

        <div className="product-picker-body">
          {/* Search and Filters */}
          <div className="product-picker-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by product name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="product-search-input"
              />
            </div>

            <div className="filter-row">
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>

              {subCategories.length > 0 && (
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Sub-Categories</option>
                  {subCategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              )}

              {subSubCategories.length > 0 && (
                <select
                  value={selectedSubSubCategory}
                  onChange={(e) => setSelectedSubSubCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Sub-Sub-Categories</option>
                  {subSubCategories.map(subSub => (
                    <option key={subSub} value={subSub}>{subSub}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Product List */}
          <div className="product-picker-list">
            {filteredProducts.length > 0 ? (
              <>
                <div className="product-picker-toolbar">
                  <label className="select-all-checkbox">
                    <input
                      type="checkbox"
                      checked={localSelectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                    />
                    Select All ({localSelectedIds.length}/{filteredProducts.length})
                  </label>
                </div>

                <div className="products-grid">
                  {filteredProducts.map(product => (
                    <div key={product._id} className="product-picker-item">
                      <label className="product-checkbox-label">
                        <input
                          type="checkbox"
                          checked={localSelectedIds.includes(product._id)}
                          onChange={() => handleToggleProduct(product._id)}
                        />
                        <div className="product-picker-info">
                          <div className="product-image">
                            <img 
                              src={product.images?.[0] || product.image} 
                              alt={product.name}
                              onError={(e) => {
                                e.target.src = '/placeholder.png';
                              }}
                            />
                          </div>
                          <div className="product-details">
                            <p className="product-name">{product.name}</p>
                            <p className="product-sku">SKU: {product.sku}</p>
                            <p className="product-price">${product.price}</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-products">
                <p>No products found matching your filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="product-picker-footer">
          <div className="footer-info">
            <span>{localSelectedIds.length} product(s) selected</span>
          </div>
          <div className="footer-actions">
            <button className="btn-secondary" onClick={handleClear}>Clear All</button>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit}>Confirm Selection</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPickerModal;
