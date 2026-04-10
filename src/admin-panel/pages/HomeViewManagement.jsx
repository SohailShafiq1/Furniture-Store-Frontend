import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import './HomeViewManagement.css';

const HomeViewManagement = () => {
  const [homeContent, setHomeContent] = useState({
    promoStripTitle: '',
    promoStripSubtitle: '',
    promoStripCode: '',
    promotionPhotos: [
      { image: null, heading: '', subHeading: '', buttonName: '', buttonSubcategory: '' },
      { image: null, heading: '', subHeading: '', buttonName: '', buttonSubcategory: '' },
    ],
    selectedCategory: '',
    selectedSubCategory: '',
    selectedSubSubCategory: '',
    selectedProducts: [],
    isVisible: true,
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState([null, null]);
  const [loading, setLoading] = useState(false);
  const [savedContent, setSavedContent] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(true);
  
  const { token } = useAdminAuth();
  const apiEndpoint = `${import.meta.env.VITE_API_URL}`;
  const backendRoot = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch all categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${apiEndpoint}/categories/all`);
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError('Failed to fetch categories');
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch all saved content
  useEffect(() => {
    const fetchSavedContent = async () => {
      try {
        const res = await axios.get(`${apiEndpoint}/home-content/get-all-content`);
        setSavedContent(res.data || []);
      } catch (err) {
        console.log('No saved content yet');
      }
    };
    fetchSavedContent();
  }, []);

  // Fetch sub-categories when a category is selected
  useEffect(() => {
    if (homeContent.selectedCategory) {
      const category = categories.find(cat => cat._id === homeContent.selectedCategory);
      if (category) {
        setSubCategories(category.subCategories || []);
        setSubSubCategories([]);
        setHomeContent(prev => ({
          ...prev,
          selectedSubCategory: '',
          selectedSubSubCategory: '',
          selectedProducts: []
        }));
      }
    }
  }, [homeContent.selectedCategory, categories]);

  // Fetch sub-sub-categories when a sub-category is selected
  useEffect(() => {
    if (homeContent.selectedCategory && homeContent.selectedSubCategory) {
      const category = categories.find(cat => cat._id === homeContent.selectedCategory);
      if (category) {
        const subCat = category.subCategories?.find(s => s.name === homeContent.selectedSubCategory);
        if (subCat) {
          setSubSubCategories(subCat.subSubCategories || []);
          setHomeContent(prev => ({
            ...prev,
            selectedSubSubCategory: '',
            selectedProducts: []
          }));
        }
      }
    }
  }, [homeContent.selectedCategory, homeContent.selectedSubCategory, categories]);

  // Fetch products when a sub-category is selected (and optionally sub-sub-category)
  useEffect(() => {
    const fetchProducts = async () => {
      if (homeContent.selectedCategory && homeContent.selectedSubCategory) {
        try {
          setLoading(true);
          const res = await axios.get(`${apiEndpoint}/products/all?t=${Date.now()}`);
          // Filter products by category ID, sub-category name, and optionally sub-sub-category name
          const filtered = res.data.filter(
            p => p.category && p.category._id === homeContent.selectedCategory && 
                 p.subCategoryName === homeContent.selectedSubCategory &&
                 (!homeContent.selectedSubSubCategory || p.subSubCategoryName === homeContent.selectedSubSubCategory)
          );
          setProducts(filtered);
        } catch (err) {
          setError('Failed to fetch products');
          setProducts([]);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProducts();
  }, [homeContent.selectedCategory, homeContent.selectedSubCategory, homeContent.selectedSubSubCategory]);

  // Handle promotion photo image upload
  const handlePromotionImageChange = (index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => {
          const newPreview = [...prev];
          newPreview[index] = reader.result;
          return newPreview;
        });
        
        setHomeContent(prev => {
          const newPhotos = [...prev.promotionPhotos];
          newPhotos[index].image = file;
          return { ...prev, promotionPhotos: newPhotos };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle promotion text changes
  const handlePromotionTextChange = (index, field, value) => {
    setHomeContent(prev => {
      const newPhotos = [...prev.promotionPhotos];
      newPhotos[index][field] = value;
      return { ...prev, promotionPhotos: newPhotos };
    });
  };

  // Toggle product selection
  const handleProductToggle = (productId) => {
    if (homeContent.selectedProducts.includes(productId)) {
      setHomeContent(prev => ({
        ...prev,
        selectedProducts: prev.selectedProducts.filter(id => id !== productId)
      }));
    } else {
      if (homeContent.selectedProducts.length < 4) {
        setHomeContent(prev => ({
          ...prev,
          selectedProducts: [...prev.selectedProducts, productId]
        }));
      } else {
        setError('You can select maximum 4 products');
      }
    }
  };

  // Save home content
  const handleSaveContent = async (e) => {
    e.preventDefault();
    
    // For new content, require both images. For editing, use existing if not changed
    const photo1HasValue = homeContent.promotionPhotos[0].image instanceof File || 
                          (typeof homeContent.promotionPhotos[0].image === 'string' && homeContent.promotionPhotos[0].image.length > 0);
    const photo2HasValue = homeContent.promotionPhotos[1].image instanceof File || 
                          (typeof homeContent.promotionPhotos[1].image === 'string' && homeContent.promotionPhotos[1].image.length > 0);

    if (!photo1HasValue || !photo2HasValue) {
      setError('Please upload both promotion photos');
      return;
    }

    if (!homeContent.promotionPhotos[0].heading || !homeContent.promotionPhotos[1].heading) {
      setError('Please enter headings for both promotion photos');
      return;
    }

    if (!homeContent.selectedSubCategory) {
      setError('Please select a sub-category');
      return;
    }

    if (homeContent.selectedProducts.length === 0) {
      setError('Please select at least one product');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      // Add promotion photos (only if they are File objects, not existing paths)
      if (homeContent.promotionPhotos[0].image instanceof File) {
        formData.append('promotionPhoto1', homeContent.promotionPhotos[0].image);
      }
      formData.append('promotionHeading1', homeContent.promotionPhotos[0].heading);
      formData.append('promotionSubHeading1', homeContent.promotionPhotos[0].subHeading);
      formData.append('promotionButtonName1', homeContent.promotionPhotos[0].buttonName);
      formData.append('promotionButtonSubcategory1', homeContent.promotionPhotos[0].buttonSubcategory);

      if (homeContent.promotionPhotos[1].image instanceof File) {
        formData.append('promotionPhoto2', homeContent.promotionPhotos[1].image);
      }
      formData.append('promotionHeading2', homeContent.promotionPhotos[1].heading);
      formData.append('promotionSubHeading2', homeContent.promotionPhotos[1].subHeading);
      formData.append('promotionButtonName2', homeContent.promotionPhotos[1].buttonName);
      formData.append('promotionButtonSubcategory2', homeContent.promotionPhotos[1].buttonSubcategory);

      formData.append('promoStripTitle', homeContent.promoStripTitle || '');
      formData.append('promoStripSubtitle', homeContent.promoStripSubtitle || '');
      formData.append('promoStripCode', homeContent.promoStripCode || '');

      // Add category, sub-category, and products
      formData.append('selectedCategory', homeContent.selectedCategory);
      formData.append('selectedSubCategory', homeContent.selectedSubCategory);
      formData.append('selectedProducts', JSON.stringify(homeContent.selectedProducts));
      formData.append('isVisible', String(homeContent.isVisible));
      
      // Add ID if editing
      if (editingId) {
        formData.append('contentId', editingId);
      }

      const url = editingId 
        ? `${apiEndpoint}/home-content/update-content/${editingId}`
        : `${apiEndpoint}/home-content/save-content`;
      const method = editingId ? 'put' : 'post';

      await axios[method](url, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage(editingId ? 'Content updated successfully!' : 'Home page content saved successfully!');
      setTimeout(() => setMessage(''), 3000);
      
      // Reset form
      resetForm();
      // Refresh the list
      await fetchSavedContent();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save home page content');
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved content
  const fetchSavedContent = async () => {
    try {
      const res = await axios.get(`${apiEndpoint}/home-content/get-all-content`);
      setSavedContent(res.data || []);
    } catch (err) {
      console.log('No saved content yet');
    }
  };

  // Reset form
  const resetForm = () => {
    setHomeContent({
      promoStripTitle: '',
      promoStripSubtitle: '',
      promoStripCode: '',
      promotionPhotos: [
        { image: null, heading: '', subHeading: '' },
        { image: null, heading: '', subHeading: '' },
      ],
      selectedCategory: '',
      selectedSubCategory: '',
      selectedSubSubCategory: '',
      selectedProducts: [],
      isVisible: true,
    });
    setImagePreview([null, null]);
    setEditingId(null);
    setShowForm(true);
  };

  // Edit handler
  const handleEdit = (content) => {
    setEditingId(content._id);
    setHomeContent({
      promoStripTitle: content.promoStripTitle || '',
      promoStripSubtitle: content.promoStripSubtitle || '',
      promoStripCode: content.promoStripCode || '',
      promotionPhotos: content.promotionPhotos,
      selectedCategory: content.selectedCategory?._id || '',
      selectedSubCategory: content.selectedSubCategoryName || '',
      selectedSubSubCategory: content.selectedSubSubCategoryName || '',
      selectedProducts: content.selectedProducts?.map(p => p._id) || [],
      isVisible: content.isVisible !== false,
    });
    setImagePreview([
      `${backendRoot}/${content.promotionPhotos[0]?.image}`,
      `${backendRoot}/${content.promotionPhotos[1]?.image}`
    ]);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  // Delete handler
  const handleDelete = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    
    try {
      setLoading(true);
      await axios.delete(`${apiEndpoint}/home-content/delete-content/${contentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Content deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
      await fetchSavedContent();
    } catch (err) {
      setError('Failed to delete content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-view-management">
      <h1>Home Page Content Management</h1>
      
      {message && (
        <div className="success-toast" onClick={() => setMessage('')}>
          {message}
        </div>
      )}
      {error && (
        <div className="error-toast" onClick={() => setError('')}>
          {error}
        </div>
      )}

      {/* Toggle Form Visibility */}
      {!showForm && (
        <div className="toggle-form-section">
          <button 
            type="button"
            className="add-new-button"
            onClick={() => {
              setShowForm(true);
              resetForm();
            }}
          >
            + Add New Content
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSaveContent} className="home-content-form">
        {/* Promo Strip Section */}
        <section className="promotion-section">
          <h2>Promo Strip</h2>
          <p className="section-subtitle">Configure the text and code for the home page promo strip</p>

          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              placeholder="e.g., Extra 5% OFF"
              value={homeContent.promoStripTitle}
              onChange={(e) => setHomeContent(prev => ({
                ...prev,
                promoStripTitle: e.target.value
              }))}
            />
          </div>

          <div className="form-group">
            <label>Subtitle</label>
            <input
              type="text"
              placeholder="e.g., A small boost for your tax refund season."
              value={homeContent.promoStripSubtitle}
              onChange={(e) => setHomeContent(prev => ({
                ...prev,
                promoStripSubtitle: e.target.value
              }))}
            />
          </div>

          <div className="form-group">
            <label>Promo Code</label>
            <input
              type="text"
              placeholder="e.g., 555OFF"
              value={homeContent.promoStripCode}
              onChange={(e) => setHomeContent(prev => ({
                ...prev,
                promoStripCode: e.target.value.toUpperCase()
              }))}
            />
          </div>
        </section>

        {/* Promotion Photos Section */}
        <section className="promotion-section">
          <h2>Promotion Photos (Banner Items)</h2>
          <p className="section-subtitle">
            Add 2 promotion items with photo, heading, sub-heading, button name, and target sub-category
            {editingId && <span> (Photos are optional - existing ones will be kept)</span>}
          </p>

          <div className="promotion-items">
            {homeContent.promotionPhotos.map((photo, index) => (
              <div key={index} className="promotion-item">
                <h3>Promotion Item {index + 1}</h3>

                <div className="file-input-group">
                  <label>Photo {editingId && <span className="optional">(Optional)</span>}</label>
                  {imagePreview[index] && (
                    <div className="image-preview">
                      <img src={imagePreview[index]} alt={`Preview ${index + 1}`} />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePromotionImageChange(index, e.target.files[0])}
                    required={!editingId}
                  />
                </div>

                <div className="form-group">
                  <label>Heading</label>
                  <input
                    type="text"
                    placeholder="e.g., Spring Collection"
                    value={photo.heading}
                    onChange={(e) => handlePromotionTextChange(index, 'heading', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Sub Heading</label>
                  <input
                    type="text"
                    placeholder="e.g., Discover new arrivals"
                    value={photo.subHeading}
                    onChange={(e) => handlePromotionTextChange(index, 'subHeading', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Button Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Shop Mattresses"
                    value={photo.buttonName}
                    onChange={(e) => handlePromotionTextChange(index, 'buttonName', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Button Redirects to Sub-Category</label>
                  <select
                    value={photo.buttonSubcategory}
                    onChange={(e) => handlePromotionTextChange(index, 'buttonSubcategory', e.target.value)}
                  >
                    <option value="">Select a sub-category (optional)</option>
                    {subCategories.map(subCat => (
                      <option key={subCat._id} value={subCat.name}>
                        {subCat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sub-Category Selection */}
        <section className="subcategory-section">
          <h2>Select Sub-Category</h2>
          <p className="section-subtitle">Choose a sub-category to display products from</p>

          <div className="form-group">
            <label>Category</label>
            <select
              value={homeContent.selectedCategory}
              onChange={(e) => setHomeContent(prev => ({
                ...prev,
                selectedCategory: e.target.value
              }))}
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {homeContent.selectedCategory && (
            <div className="form-group">
              <label>Sub-Category</label>
              <select
                value={homeContent.selectedSubCategory}
                onChange={(e) => setHomeContent(prev => ({
                  ...prev,
                  selectedSubCategory: e.target.value,
                  selectedSubSubCategory: '',
                  selectedProducts: []
                }))}
                required
              >
                <option value="">Select a sub-category</option>
                {subCategories.map(subCat => (
                  <option key={subCat._id} value={subCat.name}>
                    {subCat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {homeContent.selectedSubCategory && subSubCategories.length > 0 && (
            <div className="form-group">
              <label>Sub-Sub-Category (Optional)</label>
              <select
                value={homeContent.selectedSubSubCategory}
                onChange={(e) => setHomeContent(prev => ({
                  ...prev,
                  selectedSubSubCategory: e.target.value,
                  selectedProducts: []
                }))}
              >
                <option value="">All Sub-Categories</option>
                {subSubCategories.map(subSubCat => (
                  <option key={subSubCat._id} value={subSubCat.name}>
                    {subSubCat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        {/* Product Selection */}
        {homeContent.selectedSubCategory && (
          <section className="products-section">
            <h2>Select Products (Maximum 4)</h2>
            <p className="section-subtitle">
              Selected: {homeContent.selectedProducts.length} / 4 products
            </p>

            {loading ? (
              <div className="loading">Loading products...</div>
            ) : products.length > 0 ? (
              <div className="products-grid">
                {products.map(product => (
                  <div key={product._id} className="product-card">
                    <label className="product-checkbox">
                      <input
                        type="checkbox"
                        checked={homeContent.selectedProducts.includes(product._id)}
                        onChange={() => handleProductToggle(product._id)}
                        disabled={
                          !homeContent.selectedProducts.includes(product._id) &&
                          homeContent.selectedProducts.length >= 4
                        }
                      />
                      <div className="product-info">
                        {product.image && (
                          <img
                            src={`${backendRoot}/${product.image}`}
                            alt={product.name}
                            className="product-image"
                          />
                        )}
                        <div className="product-details">
                          <h4>{product.name}</h4>
                          <p className="product-price">₹{product.price}</p>
                          {product.discount > 0 && (
                            <span className="discount-badge">{product.discount}% OFF</span>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-products">No products found in this sub-category</div>
            )}
          </section>
        )}

        {/* Visibility Section */}
        <section className="visibility-section">
          <h2>Display Settings</h2>
          <div className="visibility-choice-group">
            <p>Show this content on home screen?</p>
            <div className="choice-buttons">
              <button
                type="button"
                className={`choice-btn ${homeContent.isVisible === true ? 'active' : ''}`}
                onClick={() => setHomeContent(prev => ({
                  ...prev,
                  isVisible: true
                }))}
              >
                ✓ Yes
              </button>
              <button
                type="button"
                className={`choice-btn ${homeContent.isVisible === false ? 'active' : ''}`}
                onClick={() => setHomeContent(prev => ({
                  ...prev,
                  isVisible: false
                }))}
              >
                ✕ No
              </button>
            </div>
          </div>
        </section>

        <button
          type="submit"
          className="save-button"
          disabled={loading}
        >
          {loading ? 'Saving...' : editingId ? 'Update Content' : 'Save Home Page Content'}
        </button>

        {editingId && (
          <button
            type="button"
            className="cancel-button"
            onClick={resetForm}
          >
            Cancel Edit
          </button>
        )}
      </form>
      )}

      {/* Saved Content List */}
      {savedContent.length > 0 && (
        <section className="saved-content-section">
          <h2>Saved Content ({savedContent.length})</h2>
          <div className="content-cards-grid">
            {savedContent.map((content) => (
              <div key={content._id} className="content-card">
                <div className="content-card-header">
                  <h3>
                    {content.selectedCategory?.name} - {content.selectedSubCategoryName}
                  </h3>
                  <div className="visibility-status">
                    {content.isVisible === true ? (
                      <span className="status-badge visible">✓ Visible</span>
                    ) : (
                      <span className="status-badge hidden">✕ Hidden</span>
                    )}
                  </div>
                </div>

                <div className="promotion-photos-preview">
                  {content.promotionPhotos.map((photo, idx) => (
                    <div key={idx} className="promotion-preview">
                      <img 
                        src={`${backendRoot}/${photo.image}`} 
                        alt={`Promotion ${idx + 1}`}
                      />
                      <div className="photo-info">
                        <h4>{photo.heading}</h4>
                        <p>{photo.subHeading}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="products-count">
                  <strong>{content.selectedProducts.length}</strong> Products Selected
                </div>

                <div className="content-actions">
                  <button 
                    className="edit-button"
                    onClick={() => handleEdit(content)}
                  >
                    ✎ Edit
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDelete(content._id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {savedContent.length === 0 && !showForm && (
        <div className="no-content-message">
          <p>No saved content yet. Click "Add New Content" to create your first home page content.</p>
        </div>
      )}
    </div>
  );
};

export default HomeViewManagement;
