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
  const [showOnHomePage, setShowOnHomePage] = useState(false);
  const [promoEnabled, setPromoEnabled] = useState(false);
  const [promoHighlightText, setPromoHighlightText] = useState('Extra 5% OFF');
  const [promoNormalText, setPromoNormalText] = useState('A small boost for your tax refund season.');
  const [promoCode, setPromoCode] = useState('SS5OFF');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [images, setImages] = useState([]);
  const [imageActions, setImageActions] = useState([]);
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
    setShowOnHomePage(false);
    setPromoEnabled(false);
    setPromoHighlightText('Extra 5% OFF');
    setPromoNormalText('A small boost for your tax refund season.');
    setPromoCode('SS5OFF');
    setCategoryId('');
    setSubCategoryName('');
    setImages([]);
    setImageActions([]);
    setImagePreviews([]);
    setEditingId(null);
    setEditExistingImages([]);
  };

  const fetchCategories = async () => {
    const res = await axios.get(`${categoriesEndpoint}/all`);
    setCategories(Array.isArray(res.data) ? res.data : []);
  };

  const fetchDeals = async () => {
    const res = await axios.get(`${dealsEndpoint}/admin/all`, jsonConfig);
    setDeals(Array.isArray(res.data) ? res.data : []);
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
    setImageActions([
      ...imageActions,
      ...incomingFiles.map(() => ({ buttonName: '', subSubCategoryName: '' })),
    ]);
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

    if (imageActions.some((a) => !a.buttonName?.trim())) {
      setError('Please add button name for every selected image');
      return;
    }

    if (hasSubSubs && imageActions.some((a) => !a.subSubCategoryName?.trim())) {
      setError('Please select sub-sub-category for every selected image');
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
      formData.append('showOnHomePage', String(showOnHomePage));
      formData.append('promoEnabled', String(promoEnabled));
      formData.append('promoHighlightText', promoHighlightText);
      formData.append('promoNormalText', promoNormalText);
      formData.append('promoCode', promoCode);
      formData.append('categoryId', categoryId);
      formData.append('subCategoryName', subCategoryName);
      formData.append(
        'imageActions',
        JSON.stringify(
          images.length > 0
            ? imageActions
            : editExistingImages.map((img) => ({
                buttonName: img.buttonName || '',
                subSubCategoryName: img.subSubCategoryName || '',
              }))
        )
      );

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
    setShowOnHomePage(!!deal.showOnHomePage);
    setPromoEnabled(!!deal.promoStrip?.enabled);
    setPromoHighlightText(deal.promoStrip?.highlightText || 'Extra 5% OFF');
    setPromoNormalText(deal.promoStrip?.normalText || 'A small boost for your tax refund season.');
    setPromoCode(deal.promoStrip?.code || 'SS5OFF');
    setCategoryId(String(deal.redirectTarget.categoryId));
    setSubCategoryName(deal.redirectTarget.subCategoryName);
    setImages([]);
    setImageActions([]);
    setImagePreviews([]);
    const existing = (deal.images || []).map((img) =>
      typeof img === 'string'
        ? { image: img, buttonName: deal.buttonName || '', subSubCategoryName: deal.redirectTarget?.subSubCategoryName || '' }
        : img
    );
    setEditExistingImages(existing);
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

          <label className="form-label checkbox-label">
            <input
              type="checkbox"
              checked={showOnHomePage}
              onChange={(e) => setShowOnHomePage(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Show on Home Page (Yes/No)
          </label>

          <label className="form-label checkbox-label">
            <input
              type="checkbox"
              checked={promoEnabled}
              onChange={(e) => setPromoEnabled(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Show Promo Strip Between Deals
          </label>
          {promoEnabled && (
            <>
              <input
                value={promoHighlightText}
                onChange={(e) => setPromoHighlightText(e.target.value)}
                placeholder="Promo highlight text"
              />
              <input
                value={promoNormalText}
                onChange={(e) => setPromoNormalText(e.target.value)}
                placeholder="Promo normal text"
              />
              <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Promo code" />
            </>
          )}

          <div className="triple-select">
            <div>
              <label className="form-label">Category</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubCategoryName('');
                  setImageActions((prev) => prev.map((a) => ({ ...a, subSubCategoryName: '' })));
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
                  setImageActions((prev) => prev.map((a) => ({ ...a, subSubCategoryName: '' })));
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
              <label className="form-label">Sub-sub-category rule</label>
              <select
                value=""
                onChange={() => {}}
                disabled
              >
                <option value="">{hasSubSubs ? 'Select per image below' : 'No sub-sub-categories for this sub-category'}</option>
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
                {editExistingImages.map((img, idx) => (
                  <div key={`existing-${idx}`}>
                    <img src={img.image?.startsWith('http') ? img.image : `${backendRoot}/${img.image}`} alt="" />
                    <input
                      value={img.buttonName || ''}
                      onChange={(e) =>
                        setEditExistingImages((prev) =>
                          prev.map((x, i) => (i === idx ? { ...x, buttonName: e.target.value } : x))
                        )
                      }
                      placeholder="Button name"
                      style={{ marginTop: 6 }}
                    />
                    <select
                      value={img.subSubCategoryName || ''}
                      onChange={(e) =>
                        setEditExistingImages((prev) =>
                          prev.map((x, i) => (i === idx ? { ...x, subSubCategoryName: e.target.value } : x))
                        )
                      }
                      disabled={!hasSubSubs}
                    >
                      <option value="">{hasSubSubs ? 'Select sub-sub-category' : 'No sub-sub-categories'}</option>
                      {(selectedSub?.subSubCategories || []).map((ss) => (
                        <option key={ss.name} value={ss.name}>
                          {ss.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </>
            )}
            {imagePreviews.map((src, idx) => (
              <div key={`new-${idx}`}>
                <img src={src} alt="" />
                <input
                  value={imageActions[idx]?.buttonName || ''}
                  onChange={(e) =>
                    setImageActions((prev) => prev.map((a, i) => (i === idx ? { ...a, buttonName: e.target.value } : a)))
                  }
                  placeholder="Button name"
                  style={{ marginTop: 6 }}
                />
                <select
                  value={imageActions[idx]?.subSubCategoryName || ''}
                  onChange={(e) =>
                    setImageActions((prev) =>
                      prev.map((a, i) => (i === idx ? { ...a, subSubCategoryName: e.target.value } : a))
                    )
                  }
                  disabled={!hasSubSubs}
                >
                  <option value="">{hasSubSubs ? 'Select sub-sub-category' : 'No sub-sub-categories'}</option>
                  {(selectedSub?.subSubCategories || []).map((ss) => (
                    <option key={ss.name} value={ss.name}>
                      {ss.name}
                    </option>
                  ))}
                </select>
              </div>
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
                  <th>Buttons</th>
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
                          src={
                            (typeof deal.images[0] === 'string' ? deal.images[0] : deal.images[0]?.image)?.startsWith('http')
                              ? (typeof deal.images[0] === 'string' ? deal.images[0] : deal.images[0]?.image)
                              : `${backendRoot}/${typeof deal.images[0] === 'string' ? deal.images[0] : deal.images[0]?.image}`
                          }
                          alt=""
                        />
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>
                    <td>{deal.title}</td>
                    <td>{deal.dealOffer}</td>
                    <td>{(deal.images || []).map((img) => (typeof img === 'string' ? deal.buttonName || 'Button' : img.buttonName)).join(', ')}</td>
                    <td>
                      <div className="target-cell">
                        <div>
                          <strong>{deal.redirectTarget?.categoryName}</strong>
                        </div>
                        <div className="muted small">
                          {deal.redirectTarget?.subCategoryName}
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
