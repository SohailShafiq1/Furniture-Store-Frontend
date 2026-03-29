import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import './DealsManagement.css';

const DealsManagement = () => {
  const { token } = useAdminAuth();

  const [categories, setCategories] = useState([]);
  const [deals, setDeals] = useState([]);

  const [title, setTitle] = useState('');
  const [dealOffer, setDealOffer] = useState('');
  const [buttonName, setButtonName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [subSubCategoryName, setSubSubCategoryName] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editExistingImages, setEditExistingImages] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const categoriesEndpoint = useMemo(() => `${import.meta.env.VITE_API_URL}/categories`, []);
  const dealsEndpoint = useMemo(() => `${import.meta.env.VITE_API_URL}/deals`, []);
  const backendRoot = useMemo(() => import.meta.env.VITE_API_URL.replace('/api', ''), []);

  const jsonConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);
  const multipartConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const resetForm = () => {
    imagePreviews.forEach((p) => URL.revokeObjectURL(p));
    setTitle('');
    setDealOffer('');
    setButtonName('');
    setCategoryId('');
    setSubCategoryName('');
    setSubSubCategoryName('');
    setImages([]);
    setImagePreviews([]);
    setEditingId(null);
    setEditExistingImages([]);
  };

  const fetchCategories = async () => {
    const res = await axios.get(`${categoriesEndpoint}/all`);
    setCategories(res.data);
  };

  const fetchDeals = async () => {
    const res = await axios.get(`${dealsEndpoint}/admin/all`, jsonConfig);
    setDeals(res.data);
  };

  useEffect(() => {
    (async () => {
      try {
        setError('');
        await fetchCategories();
        await fetchDeals();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load deals data');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((c) => c._id === categoryId),
    [categories, categoryId]
  );

  const selectedSub = useMemo(
    () => selectedCategory?.subCategories?.find((s) => s.name === subCategoryName),
    [selectedCategory, subCategoryName]
  );

  const hasSubSubs = (selectedSub?.subSubCategories?.length || 0) > 0;

  const handleImagesChange = (e) => {
    const incomingFiles = Array.from(e.target.files || []);
    if (!incomingFiles.length) return;

    // Allow users to pick files in multiple selections without replacing previous ones.
    const mergedFiles = [...images, ...incomingFiles];
    if (mergedFiles.length > 3) {
      setError('You can upload up to 3 images (minimum 2 for new deals)');
      e.target.value = '';
      return;
    }

    const mergedPreviews = [...imagePreviews, ...incomingFiles.map((f) => URL.createObjectURL(f))];
    setImages(mergedFiles);
    setImagePreviews(mergedPreviews);
    setError('');
    e.target.value = '';
  };

  const buildDealRedirectPath = (deal) => {
    const catId = deal.redirectTarget?.categoryId;
    const subName = deal.redirectTarget?.subCategoryName;
    const subSub = deal.redirectTarget?.subSubCategoryName;

    const basePath = `/category/${catId}/sub/${encodeURIComponent(subName)}`;
    if (!subSub) return basePath;
    return `${basePath}?subSub=${encodeURIComponent(subSub)}`;
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!token) {
      setError('Not authenticated. Please log in again.');
      return;
    }

    if (!categoryId || !subCategoryName) {
      setError('Please select a category and sub-category');
      return;
    }

    if (hasSubSubs && !subSubCategoryName) {
      setError('Please select a sub-sub-category for this sub-category');
      return;
    }

    if (!editingId) {
      if (images.length < 2 || images.length > 3) {
        setError('Please upload 2 or 3 images for new deals');
        return;
      }
    } else if (images.length > 0 && (images.length < 2 || images.length > 3)) {
      setError('If replacing images, upload 2 or 3 images');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('dealOffer', dealOffer);
      formData.append('buttonName', buttonName);
      formData.append('categoryId', categoryId);
      formData.append('subCategoryName', subCategoryName);
      if (subSubCategoryName) formData.append('subSubCategoryName', subSubCategoryName);

      images.forEach((file) => formData.append('images', file));

      if (editingId) {
        await axios.put(`${dealsEndpoint}/${editingId}`, formData, multipartConfig);
        setMessage('Deal updated successfully');
      } else {
        await axios.post(`${dealsEndpoint}/create`, formData, multipartConfig);
        setMessage('Deal created successfully');
      }

      resetForm();
      await fetchDeals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save deal');
    }
  };

  const startEdit = (deal) => {
    setMessage('');
    setError('');
    imagePreviews.forEach((p) => URL.revokeObjectURL(p));

    setEditingId(deal._id);
    setTitle(deal.title);
    setDealOffer(deal.dealOffer);
    setButtonName(deal.buttonName);
    setCategoryId(String(deal.redirectTarget.categoryId));
    setSubCategoryName(deal.redirectTarget.subCategoryName);
    setSubSubCategoryName(deal.redirectTarget.subSubCategoryName || '');
    setImages([]);
    setImagePreviews([]);
    setEditExistingImages(deal.images || []);
  };

  const handleToggleActive = async (deal) => {
    try {
      const formData = new FormData();
      formData.append('isActive', (!deal.isActive).toString());
      await axios.put(`${dealsEndpoint}/${deal._id}`, formData, multipartConfig);
      setMessage(`Deal ${deal.isActive ? 'hidden' : 'published'}`);
      await fetchDeals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update deal visibility');
    }
  };

  const handleDelete = async (deal) => {
    if (!window.confirm(`Delete deal "${deal.title}"?`)) return;
    try {
      await axios.delete(`${dealsEndpoint}/${deal._id}`, jsonConfig);
      setMessage('Deal deleted');
      if (editingId === deal._id) resetForm();
      await fetchDeals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete deal');
    }
  };

  return (
    <div className="deals-management">
      <h1>Deals Management</h1>

      {message && <div className="success-toast" onClick={() => setMessage('')}>{message}</div>}
      {error && <div className="error-toast" onClick={() => setError('')}>{error}</div>}

      <div className="deals-form-card">
        <h2>{editingId ? 'Edit Deal' : 'Create New Deal'}</h2>
        <form onSubmit={handleCreateOrUpdate} className="admin-form">
          <label className="form-label">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Deal title" required />

          <label className="form-label">Deal Offer</label>
          <textarea value={dealOffer} onChange={(e) => setDealOffer(e.target.value)} placeholder="e.g. Up to 40% off select items" rows={4} required />

          <label className="form-label">Button Name</label>
          <input value={buttonName} onChange={(e) => setButtonName(e.target.value)} placeholder="e.g. Shop Nightstands" required />

          <div className="triple-select">
            <div>
              <label className="form-label">Category</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubCategoryName('');
                  setSubSubCategoryName('');
                }}
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Sub-category</label>
              <select
                value={subCategoryName}
                onChange={(e) => {
                  setSubCategoryName(e.target.value);
                  setSubSubCategoryName('');
                }}
                required
                disabled={!categoryId}
              >
                <option value="">Select sub-category</option>
                {(selectedCategory?.subCategories || []).map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Sub-sub-category</label>
              <select
                value={subSubCategoryName}
                onChange={(e) => setSubSubCategoryName(e.target.value)}
                disabled={!subCategoryName || !hasSubSubs}
              >
                <option value="">{hasSubSubs ? 'Optional / select one' : 'None for this sub-category'}</option>
                {(selectedSub?.subSubCategories || []).map((ss) => (
                  <option key={ss.name} value={ss.name}>
                    {ss.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="form-label">Images (2-3)</label>
          <input type="file" accept="image/*" multiple onChange={handleImagesChange} />
          <p className="helper">
            {editingId
              ? 'Leave images empty to keep existing images. If you upload new images, upload 2-3 files.'
              : 'Upload exactly 2 or 3 images.'}
          </p>

          <div className="preview-grid">
            {editingId && editExistingImages.length > 0 && images.length === 0 && (
              <>
                {editExistingImages.map((imgPath, idx) => (
                  <img
                    key={`existing-${idx}`}
                    src={imgPath?.startsWith('http') ? imgPath : `${backendRoot}/${imgPath}`}
                    alt=""
                  />
                ))}
              </>
            )}
            {imagePreviews.map((src, idx) => (
              <img key={`new-${idx}`} src={src} alt="" />
            ))}
          </div>

          <div className="form-actions-row">
            <button type="submit">{editingId ? 'Save Changes' : 'Publish Deal'}</button>
            {editingId && (
              <button type="button" className="secondary-btn" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="deals-list-card">
        <h2>Existing Deals</h2>
        {deals.length === 0 ? (
          <p className="muted">No deals yet.</p>
        ) : (
          <div className="deals-table-wrap">
            <table className="deals-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Title</th>
                  <th>Offer</th>
                  <th>Button</th>
                  <th>Target</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal._id}>
                    <td>
                      {deal.images?.[0] ? (
                        <img
                          className="thumb"
                          src={deal.images[0]?.startsWith('http') ? deal.images[0] : `${backendRoot}/${deal.images[0]}`}
                          alt=""
                        />
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>
                    <td>{deal.title}</td>
                    <td>{deal.dealOffer}</td>
                    <td>{deal.buttonName}</td>
                    <td>
                      <div className="target-cell">
                        <div>
                          <strong>{deal.redirectTarget?.categoryName}</strong>
                        </div>
                        <div className="muted small">
                          {deal.redirectTarget?.subCategoryName}
                          {deal.redirectTarget?.subSubCategoryName ? ` / ${deal.redirectTarget.subSubCategoryName}` : ''}
                        </div>
                        <div className="muted small mono">{buildDealRedirectPath(deal)}</div>
                      </div>
                    </td>
                    <td>{deal.isActive ? 'Active' : 'Hidden'}</td>
                    <td className="actions-col">
                      <button type="button" className="mini" onClick={() => startEdit(deal)} disabled={!!editingId && editingId !== deal._id}>
                        Edit
                      </button>
                      <button type="button" className="mini" onClick={() => handleToggleActive(deal)}>
                        {deal.isActive ? 'Hide' : 'Publish'}
                      </button>
                      <button type="button" className="mini danger" onClick={() => handleDelete(deal)}>
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

export default DealsManagement;
