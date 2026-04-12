import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import './CollectionsManagement.css';

const emptyTarget = () => ({
  targetType: 'category',
  categoryId: '',
  subCategoryName: '',
  subSubCategoryName: '',
  productId: '',
});

const emptyCollectionItem = () => ({
  name: '',
  imageFile: null,
  imagePreview: '',
  existingImage: '',
  target: emptyTarget(),
});

const defaultForm = () => ({
  name: '',
  mainBannerTitle: '',
  mainBannerSaleSubtitle: '',
  mainBannerDescription: '',
  collectionItems: [emptyCollectionItem()],
  dealBox: {
    title: '',
    description: '',
    buttonName: '',
    imageFile: null,
    imagePreview: '',
    existingImage: '',
    buttonTarget: emptyTarget(),
  },
});

const targetTypeLabel = {
  category: 'Category',
  subCategory: 'Sub-Category',
  subSubCategory: 'Sub-Sub-Category',
  product: 'Product',
};

const CollectionsManagement = () => {
  const { token } = useAdminAuth();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [form, setForm] = useState(defaultForm());
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const apiBase = useMemo(() => import.meta.env.VITE_API_URL, []);
  const backendRoot = useMemo(() => import.meta.env.VITE_API_URL.replace('/api', ''), []);
  const jsonConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);
  const multipartConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const toImageUrl = (path) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${backendRoot}/${path}`;
  };

  const resetForm = () => {
    setForm(defaultForm());
    setEditingId(null);
  };

  const fetchBootstrapData = async () => {
    const [categoriesRes, productsRes, collectionsRes] = await Promise.all([
      axios.get(`${apiBase}/categories/all`),
      axios.get(`${apiBase}/products/all`),
      axios.get(`${apiBase}/collections/admin/all`, jsonConfig),
    ]);

    setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
    setCollections(Array.isArray(collectionsRes.data) ? collectionsRes.data : []);
  };

  useEffect(() => {
    (async () => {
      try {
        setError('');
        await fetchBootstrapData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load collection management data');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSubCategories = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category?.subCategories || [];
  };

  const getSubSubCategories = (categoryId, subCategoryName) => {
    const subCategories = getSubCategories(categoryId);
    const subCategory = subCategories.find((sub) => sub.name === subCategoryName);
    return subCategory?.subSubCategories || [];
  };

  const normalizeTarget = (target = {}) => ({
    targetType: target.targetType || 'category',
    categoryId: target.categoryId || '',
    subCategoryName: target.subCategoryName || '',
    subSubCategoryName: target.subSubCategoryName || '',
    productId: target.productId || '',
  });

  const updateTarget = (target, field, value) => {
    const next = { ...target, [field]: value };

    if (field === 'targetType') {
      if (value === 'product') {
        next.categoryId = '';
        next.subCategoryName = '';
        next.subSubCategoryName = '';
      } else {
        next.productId = '';
      }
      if (value === 'category') {
        next.subCategoryName = '';
        next.subSubCategoryName = '';
      }
      if (value === 'subCategory') {
        next.subSubCategoryName = '';
      }
    }

    if (field === 'categoryId') {
      next.subCategoryName = '';
      next.subSubCategoryName = '';
    }

    if (field === 'subCategoryName') {
      next.subSubCategoryName = '';
    }

    return next;
  };

  const setItemTargetField = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      collectionItems: prev.collectionItems.map((item, idx) =>
        idx === index ? { ...item, target: updateTarget(item.target, field, value) } : item
      ),
    }));
  };

  const setDealBoxTargetField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      dealBox: {
        ...prev.dealBox,
        buttonTarget: updateTarget(prev.dealBox.buttonTarget, field, value),
      },
    }));
  };

  const setItemField = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      collectionItems: prev.collectionItems.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleItemImageChange = (index, file) => {
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      collectionItems: prev.collectionItems.map((item, idx) =>
        idx === index
          ? { ...item, imageFile: file, imagePreview: preview, existingImage: item.existingImage || '' }
          : item
      ),
    }));
  };

  const addCollectionItem = () => {
    setForm((prev) => ({
      ...prev,
      collectionItems: [...prev.collectionItems, emptyCollectionItem()],
    }));
  };

  const removeCollectionItem = (index) => {
    setForm((prev) => ({
      ...prev,
      collectionItems: prev.collectionItems.filter((_, idx) => idx !== index),
    }));
  };

  const handleDealBoxImageChange = (file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,
      dealBox: {
        ...prev.dealBox,
        imageFile: file,
        imagePreview: preview,
        existingImage: prev.dealBox.existingImage || '',
      },
    }));
  };

  const validateTarget = (target) => {
    if (!target.targetType) return 'Target type is required';

    if (target.targetType === 'product' && !target.productId) {
      return 'Please select a product';
    }

    if (target.targetType !== 'product' && !target.categoryId) {
      return 'Please select a category';
    }

    if (target.targetType === 'subCategory' && !target.subCategoryName) {
      return 'Please select a sub-category';
    }

    if (target.targetType === 'subSubCategory') {
      if (!target.subCategoryName) {
        return 'Please select a sub-category before selecting sub-sub-category';
      }
      if (!target.subSubCategoryName) {
        return 'Please select a sub-sub-category';
      }
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.name.trim()) {
      setError('Collection name is required');
      return;
    }

    if (!form.mainBannerTitle.trim() || !form.mainBannerSaleSubtitle.trim() || !form.mainBannerDescription.trim()) {
      setError('Main banner title, sale subtitle, and description are required');
      return;
    }

    if (form.collectionItems.length === 0) {
      setError('At least one collection item is required');
      return;
    }

    for (let i = 0; i < form.collectionItems.length; i += 1) {
      const item = form.collectionItems[i];
      if (!item.name.trim()) {
        setError(`Collection item #${i + 1} name is required`);
        return;
      }
      if (!item.imageFile && !item.existingImage) {
        setError(`Collection item #${i + 1} image is required`);
        return;
      }

      const targetIssue = validateTarget(item.target);
      if (targetIssue) {
        setError(`Collection item #${i + 1}: ${targetIssue}`);
        return;
      }
    }

    if (!form.dealBox.title.trim() || !form.dealBox.description.trim() || !form.dealBox.buttonName.trim()) {
      setError('Deal box title, description, and button name are required');
      return;
    }

    if (!form.dealBox.imageFile && !form.dealBox.existingImage) {
      setError('Deal box image is required');
      return;
    }

    const dealBoxTargetIssue = validateTarget(form.dealBox.buttonTarget);
    if (dealBoxTargetIssue) {
      setError(`Deal box: ${dealBoxTargetIssue}`);
      return;
    }

    try {
      const payload = new FormData();
      payload.append('name', form.name.trim());
      payload.append('mainBannerTitle', form.mainBannerTitle.trim());
      payload.append('mainBannerSaleSubtitle', form.mainBannerSaleSubtitle.trim());
      payload.append('mainBannerDescription', form.mainBannerDescription.trim());

      const itemsPayload = form.collectionItems.map((item) => ({
        name: item.name.trim(),
        existingImage: item.existingImage || '',
        target: item.target,
      }));
      payload.append('collectionItems', JSON.stringify(itemsPayload));

      form.collectionItems.forEach((item, index) => {
        if (item.imageFile) {
          payload.append(`collectionItemImage_${index}`, item.imageFile);
        }
      });

      payload.append(
        'dealBox',
        JSON.stringify({
          title: form.dealBox.title.trim(),
          description: form.dealBox.description.trim(),
          buttonName: form.dealBox.buttonName.trim(),
          existingImage: form.dealBox.existingImage || '',
          buttonTarget: form.dealBox.buttonTarget,
        })
      );

      if (form.dealBox.imageFile) {
        payload.append('dealBoxImage', form.dealBox.imageFile);
      }

      if (editingId) {
        await axios.put(`${apiBase}/collections/${editingId}`, payload, multipartConfig);
        setMessage('Collection updated successfully');
      } else {
        await axios.post(`${apiBase}/collections/create`, payload, multipartConfig);
        setMessage('Collection created successfully');
      }

      resetForm();
      await fetchBootstrapData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save collection');
    }
  };

  const handleEdit = (collection) => {
    setError('');
    setMessage('');
    setEditingId(collection._id);

    setForm({
      name: collection.name || '',
      mainBannerTitle: collection.mainBanner?.title || '',
      mainBannerSaleSubtitle: collection.mainBanner?.saleSubtitle || '',
      mainBannerDescription: collection.mainBanner?.description || '',
      collectionItems: (collection.collectionItems || []).map((item) => ({
        name: item.name || '',
        imageFile: null,
        imagePreview: toImageUrl(item.image),
        existingImage: item.image || '',
        target: normalizeTarget(item.target),
      })),
      dealBox: {
        title: collection.dealBox?.title || '',
        description: collection.dealBox?.description || '',
        buttonName: collection.dealBox?.buttonName || '',
        imageFile: null,
        imagePreview: toImageUrl(collection.dealBox?.image || ''),
        existingImage: collection.dealBox?.image || '',
        buttonTarget: normalizeTarget(collection.dealBox?.buttonTarget),
      },
    });

    const formEl = document.getElementById('collection-form-card');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleToggleActive = async (collection) => {
    try {
      setError('');
      await axios.patch(
        `${apiBase}/collections/${collection._id}/active`,
        { isActive: !collection.isActive },
        jsonConfig
      );
      setMessage(`Collection ${collection.isActive ? 'hidden' : 'published'} successfully`);
      await fetchBootstrapData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update collection status');
    }
  };

  const handleDelete = async (collection) => {
    if (!window.confirm(`Delete collection "${collection.name}"?`)) {
      return;
    }

    try {
      setError('');
      await axios.delete(`${apiBase}/collections/${collection._id}`, jsonConfig);
      setMessage('Collection deleted successfully');
      if (editingId === collection._id) {
        resetForm();
      }
      await fetchBootstrapData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete collection');
    }
  };

  const renderTargetSelector = (target, onFieldChange, keyPrefix = '') => {
    const subCategories = getSubCategories(target.categoryId);
    const subSubCategories = getSubSubCategories(target.categoryId, target.subCategoryName);

    return (
      <div className="target-grid">
        <div>
          <label className="form-label">Target Type</label>
          <select
            value={target.targetType}
            onChange={(e) => onFieldChange('targetType', e.target.value)}
            name={`${keyPrefix}targetType`}
          >
            <option value="category">Category</option>
            <option value="subCategory">Sub-category</option>
            <option value="subSubCategory">Sub-sub-category</option>
            <option value="product">Product</option>
          </select>
        </div>

        {target.targetType !== 'product' && (
          <div>
            <label className="form-label">Category</label>
            <select
              value={target.categoryId}
              onChange={(e) => onFieldChange('categoryId', e.target.value)}
              name={`${keyPrefix}categoryId`}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {(target.targetType === 'subCategory' || target.targetType === 'subSubCategory') && (
          <div>
            <label className="form-label">Sub-category</label>
            <select
              value={target.subCategoryName}
              onChange={(e) => onFieldChange('subCategoryName', e.target.value)}
              disabled={!target.categoryId}
              name={`${keyPrefix}subCategoryName`}
            >
              <option value="">Select sub-category</option>
              {subCategories.map((subCategory) => (
                <option key={subCategory.name} value={subCategory.name}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {target.targetType === 'subSubCategory' && (
          <div>
            <label className="form-label">Sub-sub-category</label>
            <select
              value={target.subSubCategoryName}
              onChange={(e) => onFieldChange('subSubCategoryName', e.target.value)}
              disabled={!target.subCategoryName}
              name={`${keyPrefix}subSubCategoryName`}
            >
              <option value="">Select sub-sub-category</option>
              {subSubCategories.map((subSubCategory) => (
                <option key={subSubCategory.name} value={subSubCategory.name}>
                  {subSubCategory.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {target.targetType === 'product' && (
          <div>
            <label className="form-label">Product</label>
            <select
              value={target.productId}
              onChange={(e) => onFieldChange('productId', e.target.value)}
              name={`${keyPrefix}productId`}
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="collections-management">
      <h1>Collection Management</h1>

      <div className="top-action-row">
        <button
          type="button"
          className="secondary-btn"
          onClick={() => {
            if (editingId) {
              resetForm();
            }
            const formEl = document.getElementById('collection-form-card');
            if (formEl) {
              formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
        >
          Create a collection
        </button>
      </div>

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

      <div className="card" id="collection-form-card">
        <h2>{editingId ? 'Edit Collection' : 'Create a collection'}</h2>

        <form onSubmit={handleSubmit} className="admin-form">
          <label className="form-label">Collection Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Spring Comfort Collection"
            required
          />

          <section className="section-block">
            <h3>Main Banner</h3>
            <label className="form-label">Title</label>
            <input
              value={form.mainBannerTitle}
              onChange={(e) => setForm((prev) => ({ ...prev, mainBannerTitle: e.target.value }))}
              placeholder="Main banner title"
              required
            />

            <label className="form-label">Sale Subtitle</label>
            <input
              value={form.mainBannerSaleSubtitle}
              onChange={(e) => setForm((prev) => ({ ...prev, mainBannerSaleSubtitle: e.target.value }))}
              placeholder="Sale subtitle"
              required
            />

            <label className="form-label">Simple Description</label>
            <textarea
              rows={3}
              value={form.mainBannerDescription}
              onChange={(e) => setForm((prev) => ({ ...prev, mainBannerDescription: e.target.value }))}
              placeholder="Simple description"
              required
            />
          </section>

          <section className="section-block">
            <h3>Collection Buttons / Products</h3>
            <p className="helper">You can add multiple product cards, each with image and target.</p>

            {form.collectionItems.map((item, index) => (
              <div className="nested-card" key={`collection-item-${index}`}>
                <div className="nested-card-header">
                  <h4>Item {index + 1}</h4>
                  {form.collectionItems.length > 1 && (
                    <button type="button" className="mini danger" onClick={() => removeCollectionItem(index)}>
                      Remove
                    </button>
                  )}
                </div>

                <label className="form-label">Name</label>
                <input
                  value={item.name}
                  onChange={(e) => setItemField(index, 'name', e.target.value)}
                  placeholder="Button/item name"
                  required
                />

                <label className="form-label">Product Picture</label>
                {(item.imagePreview || item.existingImage) && (
                  <img
                    className="preview-image"
                    src={item.imagePreview || toImageUrl(item.existingImage)}
                    alt="Collection item"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleItemImageChange(index, e.target.files?.[0])}
                />

                {renderTargetSelector(
                  item.target,
                  (field, value) => setItemTargetField(index, field, value),
                  `item-${index}-`
                )}
              </div>
            ))}

            <button type="button" className="secondary-btn" onClick={addCollectionItem}>
              + Add another product button
            </button>
          </section>

          <section className="section-block">
            <h3>Deal Box</h3>

            <label className="form-label">Picture</label>
            {(form.dealBox.imagePreview || form.dealBox.existingImage) && (
              <img
                className="preview-image"
                src={form.dealBox.imagePreview || toImageUrl(form.dealBox.existingImage)}
                alt="Deal box"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleDealBoxImageChange(e.target.files?.[0])}
            />

            <label className="form-label">Title</label>
            <input
              value={form.dealBox.title}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  dealBox: { ...prev.dealBox, title: e.target.value },
                }))
              }
              placeholder="Deal box title"
              required
            />

            <label className="form-label">Description</label>
            <textarea
              rows={3}
              value={form.dealBox.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  dealBox: { ...prev.dealBox, description: e.target.value },
                }))
              }
              placeholder="Deal box description"
              required
            />

            <label className="form-label">Button Name</label>
            <input
              value={form.dealBox.buttonName}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  dealBox: { ...prev.dealBox, buttonName: e.target.value },
                }))
              }
              placeholder="e.g. Shop Offer"
              required
            />

            {renderTargetSelector(
              form.dealBox.buttonTarget,
              (field, value) => setDealBoxTargetField(field, value),
              'dealbox-'
            )}
          </section>

          <div className="form-actions-row">
            <button type="submit">{editingId ? 'Save Collection' : 'Create Collection'}</button>
            {editingId && (
              <button type="button" className="secondary-btn" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Existing Collections</h2>
        {collections.length === 0 ? (
          <p className="muted">No collections yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="collections-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Name</th>
                  <th>Main Banner</th>
                  <th>Items</th>
                  <th>Deal Box Target</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((collection) => (
                  <tr key={collection._id}>
                    <td>
                      {collection.collectionItems?.[0]?.image ? (
                        <img
                          className="table-thumb"
                          src={toImageUrl(collection.collectionItems[0].image)}
                          alt="Collection"
                        />
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>
                    <td>{collection.name}</td>
                    <td>
                      <strong>{collection.mainBanner?.title}</strong>
                      <div className="muted small">{collection.mainBanner?.saleSubtitle}</div>
                    </td>
                    <td>{collection.collectionItems?.length || 0}</td>
                    <td>
                      <span>
                        {targetTypeLabel[collection.dealBox?.buttonTarget?.targetType] || 'Target'}
                      </span>
                      <div className="muted small">{collection.dealBox?.buttonName || '-'}</div>
                    </td>
                    <td>{collection.isActive ? 'Active' : 'Hidden'}</td>
                    <td className="actions-col">
                      <button type="button" className="mini" onClick={() => handleEdit(collection)}>
                        Edit
                      </button>
                      <button type="button" className="mini" onClick={() => handleToggleActive(collection)}>
                        {collection.isActive ? 'Hide' : 'Publish'}
                      </button>
                      <button type="button" className="mini danger" onClick={() => handleDelete(collection)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsManagement;
