import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import { API_BASE_URL } from '../../config/api';
import { getImageUrl, getAlternateImageUrl } from '../../utils/imageUrl';
import './DealsManagement.css';

const DealsManagement = () => {
  const { token } = useAdminAuth();

  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [deals, setDeals] = useState([]);

  const [title, setTitle] = useState('');
  const [dealOffer, setDealOffer] = useState('');
  const [showOnHomePage, setShowOnHomePage] = useState(false);
  const [isFeaturedDeal, setIsFeaturedDeal] = useState(false);
  const [promoEnabled, setPromoEnabled] = useState(false);
  const [promoHighlightText, setPromoHighlightText] = useState('Extra 5% OFF');
  const [promoNormalText, setPromoNormalText] = useState('A small boost for your tax refund season.');
  const [promoCode, setPromoCode] = useState('SS5OFF');
  const [images, setImages] = useState([]);
  const [imageActions, setImageActions] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [showHomePanel, setShowHomePanel] = useState(false);
  const [homeDealId, setHomeDealId] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editExistingImages, setEditExistingImages] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const categoriesEndpoint = useMemo(() => `${API_BASE_URL}/categories`, []);
  const collectionsEndpoint = useMemo(() => `${API_BASE_URL}/collections`, []);
  const dealsEndpoint = useMemo(() => `${API_BASE_URL}/deals`, []);

  const jsonConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);
  const multipartConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const toImageUrl = (path) => {
    if (!path) return '';
    if (String(path).startsWith('blob:')) return path;
    return getImageUrl(path);
  };

  const handleImageError = (originalPath) => (event) => {
    const img = event.currentTarget;
    if (img.dataset.fallbackTried === 'true') return;

    const fallbackSrc = getAlternateImageUrl(img.src, originalPath);
    if (fallbackSrc) {
      img.dataset.fallbackTried = 'true';
      img.src = fallbackSrc;
    }
  };

  const createEmptyImageAction = () => ({
    buttonName: '',
    dealOffer: '',
    targetType: 'category',
    categoryId: '',
    subCategoryName: '',
    subSubCategoryName: '',
    collectionId: '',
  });

  const resetForm = () => {
    imagePreviews.forEach((p) => URL.revokeObjectURL(p));
    setTitle('');
    setDealOffer('');
    setShowOnHomePage(false);
    setIsFeaturedDeal(false);
    setPromoEnabled(false);
    setPromoHighlightText('Extra 5% OFF');
    setPromoNormalText('A small boost for your tax refund season.');
    setPromoCode('SS5OFF');
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

  const fetchCollections = async () => {
    const res = await axios.get(`${collectionsEndpoint}/all`);
    setCollections(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    const currentHome = deals.find((deal) => deal.showOnHomePage);
    setHomeDealId(currentHome?._id || '');
  }, [deals]);

  useEffect(() => {
    (async () => {
      try {
        setError('');
        await fetchCategories();
        await fetchCollections();
        await fetchDeals();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load deals data');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCategoryById = (id) => categories.find((c) => c._id === id);

  const getSubCategoryByAction = (action) => {
    const category = getCategoryById(action?.categoryId);
    return category?.subCategories?.find((sub) => sub.name === action?.subCategoryName) || null;
  };

  const hasSubSubsForAction = (action) => {
    const sub = getSubCategoryByAction(action);
    return (sub?.subSubCategories?.length || 0) > 0;
  };

  const handleImagesChange = (e) => {
    const incomingFiles = Array.from(e.target.files || []);
    if (!incomingFiles.length) return;

    // Allow users to pick files in multiple selections without replacing previous ones.
    const mergedFiles = [...images, ...incomingFiles];
    if (mergedFiles.length > 10) {
      setError('You can upload up to 10 images (minimum 2 for new deals)');
      e.target.value = '';
      return;
    }

    const mergedPreviews = [...imagePreviews, ...incomingFiles.map((f) => URL.createObjectURL(f))];
    setImages(mergedFiles);
    setImageActions([
      ...imageActions,
      ...incomingFiles.map(() => createEmptyImageAction()),
    ]);
    setImagePreviews(mergedPreviews);
    setError('');
    e.target.value = '';
  };

  const removeExistingImage = (index) => {
    if (editExistingImages.length <= 2) {
      setError('A deal must keep at least 2 images');
      return;
    }
    setError('');
    setEditExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setError('');
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageActions((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const buildDealRedirectPath = (deal) => {
    const redirectType = deal.redirectTarget?.targetType || 'category';
    if (redirectType === 'collection') {
      const name = deal.redirectTarget?.collectionName;
      if (!name) return '/deals/collection';
      return `/deals/collection?name=${encodeURIComponent(name)}`;
    }

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

    const activeActions = images.length > 0 ? imageActions : editExistingImages;

    if (activeActions.some((a) => !a.buttonName?.trim())) {
      setError('Please add button name for every image');
      return;
    }

    if (activeActions.some((a) => !a.dealOffer?.trim())) {
      setError('Please add deal offer for every image');
      return;
    }

    const fallbackDealOffer =
      activeActions.find((a) => a.dealOffer?.trim())?.dealOffer?.trim() || '';

    for (let i = 0; i < activeActions.length; i += 1) {
      const action = activeActions[i] || {};
      const label = `Image ${i + 1}`;

      if (action.targetType === 'collection') {
        if (!action.collectionId) {
          setError(`${label}: please select a collection`);
          return;
        }
      } else {
        if (!action.categoryId || !action.subCategoryName) {
          setError(`${label}: please select category and sub-category`);
          return;
        }
        if (hasSubSubsForAction(action) && !action.subSubCategoryName?.trim()) {
          setError(`${label}: please select sub-sub-category`);
          return;
        }
      }
    }

    if (!editingId) {
      if (images.length < 2 || images.length > 10) {
        setError('Please upload between 2 and 10 images for new deals');
        return;
      }
    } else if (images.length > 0 && (images.length < 2 || images.length > 10)) {
      setError('If replacing images, upload between 2 and 10 images');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('dealOffer', fallbackDealOffer);
      formData.append('showOnHomePage', String(showOnHomePage));
      formData.append('isFeaturedDeal', String(isFeaturedDeal));
      formData.append('promoEnabled', String(promoEnabled));
      formData.append('promoHighlightText', promoHighlightText);
      formData.append('promoNormalText', promoNormalText);
      formData.append('promoCode', promoCode);
      formData.append(
        'imageActions',
        JSON.stringify(
          images.length > 0
            ? imageActions
            : editExistingImages.map((img) => ({
                buttonName: img.buttonName || '',
                dealOffer: img.dealOffer || '',
                targetType: img.targetType || 'category',
                categoryId: img.targetType === 'category' ? img.categoryId || '' : '',
                subCategoryName: img.targetType === 'category' ? img.subCategoryName || '' : '',
                subSubCategoryName: img.targetType === 'category' ? img.subSubCategoryName || '' : '',
                collectionId: img.targetType === 'collection' ? img.collectionId || '' : '',
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
    setIsFeaturedDeal(!!deal.isFeaturedDeal);
    setPromoEnabled(!!deal.promoStrip?.enabled);
    setPromoHighlightText(deal.promoStrip?.highlightText || 'Extra 5% OFF');
    setPromoNormalText(deal.promoStrip?.normalText || 'A small boost for your tax refund season.');
    setPromoCode(deal.promoStrip?.code || 'SS5OFF');
    setImages([]);
    setImageActions([]);
    setImagePreviews([]);
    const fallbackTarget = {
      targetType: deal.redirectTarget?.targetType || 'category',
      categoryId: deal.redirectTarget?.categoryId ? String(deal.redirectTarget.categoryId) : '',
      subCategoryName: deal.redirectTarget?.subCategoryName || '',
      subSubCategoryName: deal.redirectTarget?.subSubCategoryName || '',
      collectionId: deal.redirectTarget?.collectionId ? String(deal.redirectTarget.collectionId) : '',
    };

    const existing = (deal.images || []).map((img) => {
      if (typeof img === 'string') {
        return {
          image: img,
          buttonName: deal.buttonName || '',
          dealOffer: deal.dealOffer || '',
          targetType: fallbackTarget.targetType,
          categoryId: fallbackTarget.categoryId,
          subCategoryName: fallbackTarget.subCategoryName,
          subSubCategoryName: fallbackTarget.subSubCategoryName,
          collectionId: fallbackTarget.collectionId,
        };
      }

      const imgTarget = img.target || {};
      const imgTargetType = imgTarget.targetType || fallbackTarget.targetType;
      return {
        ...img,
        buttonName: img.buttonName || '',
        dealOffer: img.dealOffer || deal.dealOffer || '',
        targetType: imgTargetType,
        categoryId:
          imgTargetType === 'category'
            ? String(imgTarget.categoryId || fallbackTarget.categoryId || '')
            : '',
        subCategoryName: imgTargetType === 'category' ? imgTarget.subCategoryName || fallbackTarget.subCategoryName || '' : '',
        subSubCategoryName:
          imgTargetType === 'category'
            ? imgTarget.subSubCategoryName || img.subSubCategoryName || fallbackTarget.subSubCategoryName || ''
            : '',
        collectionId:
          imgTargetType === 'collection'
            ? String(imgTarget.collectionId || fallbackTarget.collectionId || '')
            : '',
      };
    });
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

  const handleSetHomeDeal = async () => {
    if (!homeDealId) {
      setError('Please select a deal to show on the home page');
      return;
    }

    try {
      setError('');
      await axios.put(`${dealsEndpoint}/set-home/${homeDealId}`, {}, jsonConfig);
      setMessage('Home page deal updated');
      await fetchDeals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set home page deal');
    }
  };

  return (
    <div className="deals-management">
      <h1>Deals Management</h1>

      <div style={{ margin: '10px 0 20px 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => setShowHomePanel((prev) => !prev)}
        >
          Home Page Deals
        </button>
      </div>

      {showHomePanel && (
        <div className="deals-form-card">
          <h2>Home Page Deal</h2>
          <p className="helper">
            Select an existing deal to show on the home page or create a new deal using the form below.
          </p>
          <div className="form-actions-row" style={{ alignItems: 'center' }}>
            <select
              value={homeDealId}
              onChange={(e) => setHomeDealId(e.target.value)}
              style={{ minWidth: 280 }}
            >
              <option value="">Select existing deal</option>
              {deals.map((deal) => (
                <option key={deal._id} value={deal._id}>
                  {deal.title}
                </option>
              ))}
            </select>
            <button type="button" onClick={handleSetHomeDeal}>
              Set Home Page Deal
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setShowOnHomePage(true);
                const formEl = document.getElementById('deals-form-card');
                if (formEl) {
                  formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              Create New Home Deal
            </button>
          </div>
        </div>
      )}

      {message && <div className="success-toast" onClick={() => setMessage('')}>{message}</div>}
      {error && <div className="error-toast" onClick={() => setError('')}>{error}</div>}

      <div className="deals-form-card" id="deals-form-card">
        <h2>{editingId ? 'Edit Deal' : 'Create New Deal'}</h2>
        <form onSubmit={handleCreateOrUpdate} className="admin-form">
          <label className="form-label">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Deal title" required />

          <label className="form-label">Deal offers are entered per image below</label>
          <p className="helper">Each image has its own deal offer text. The form will still submit a fallback top-level offer for legacy compatibility.</p>

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
              checked={isFeaturedDeal}
              onChange={(e) => setIsFeaturedDeal(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Mark as Featured Deal
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

          <p className="helper">Set button name, deal offer, and target route separately for each image below.</p>

          <label className="form-label">Images (2-10)</label>
          <input type="file" accept="image/*" multiple onChange={handleImagesChange} />
          <p className="helper">
            {editingId
              ? 'Leave images empty to keep existing images. If you upload new images, upload 2 to 10 files.'
              : 'Upload between 2 and 10 images.'}
          </p>

          <div className="preview-grid">
            {editingId && editExistingImages.length > 0 && images.length === 0 && (
              <>
                {editExistingImages.map((img, idx) => (
                  <div key={`existing-${idx}`} style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      title="Remove image"
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 2,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: 'none',
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      ×
                    </button>
                    <img src={toImageUrl(img.image)} alt="" onError={handleImageError(img.image)} />
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
                    <input
                      value={img.dealOffer || ''}
                      onChange={(e) =>
                        setEditExistingImages((prev) =>
                          prev.map((x, i) => (i === idx ? { ...x, dealOffer: e.target.value } : x))
                        )
                      }
                      placeholder="Deal offer"
                      style={{ marginTop: 6 }}
                    />
                    <select
                      value={img.targetType || 'category'}
                      onChange={(e) =>
                        setEditExistingImages((prev) =>
                          prev.map((x, i) =>
                            i === idx
                              ? {
                                  ...x,
                                  targetType: e.target.value,
                                  categoryId: e.target.value === 'category' ? x.categoryId || '' : '',
                                  subCategoryName: e.target.value === 'category' ? x.subCategoryName || '' : '',
                                  subSubCategoryName: '',
                                  collectionId: e.target.value === 'collection' ? x.collectionId || '' : '',
                                }
                              : x
                          )
                        )
                      }
                    >
                      <option value="category">Category / Sub-category</option>
                      <option value="collection">Collection</option>
                    </select>
                    {img.targetType === 'collection' ? (
                      <select
                        value={img.collectionId || ''}
                        onChange={(e) =>
                          setEditExistingImages((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, collectionId: e.target.value } : x))
                          )
                        }
                      >
                        <option value="">Select collection</option>
                        {collections.map((collection) => (
                          <option key={collection._id} value={collection._id}>
                            {collection.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <select
                          value={img.categoryId || ''}
                          onChange={(e) =>
                            setEditExistingImages((prev) =>
                              prev.map((x, i) =>
                                i === idx
                                  ? {
                                      ...x,
                                      categoryId: e.target.value,
                                      subCategoryName: '',
                                      subSubCategoryName: '',
                                    }
                                  : x
                              )
                            )
                          }
                        >
                          <option value="">Select category</option>
                          {categories.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <select
                          value={img.subCategoryName || ''}
                          onChange={(e) =>
                            setEditExistingImages((prev) =>
                              prev.map((x, i) =>
                                i === idx ? { ...x, subCategoryName: e.target.value, subSubCategoryName: '' } : x
                              )
                            )
                          }
                          disabled={!img.categoryId}
                        >
                          <option value="">Select sub-category</option>
                          {(getCategoryById(img.categoryId)?.subCategories || []).map((s) => (
                            <option key={s.name} value={s.name}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                    <select
                      value={img.subSubCategoryName || ''}
                      onChange={(e) =>
                        setEditExistingImages((prev) =>
                          prev.map((x, i) => (i === idx ? { ...x, subSubCategoryName: e.target.value } : x))
                        )
                      }
                      disabled={img.targetType === 'collection' || !hasSubSubsForAction(img)}
                    >
                      <option value="">
                        {img.targetType === 'collection'
                          ? 'Not required for collection target'
                          : hasSubSubsForAction(img)
                          ? 'Select sub-sub-category'
                          : 'No sub-sub-categories'}
                      </option>
                      {(getSubCategoryByAction(img)?.subSubCategories || []).map((ss) => (
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
              <div key={`new-${idx}`} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => removeNewImage(idx)}
                  title="Remove image"
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
                <img src={src} alt="" />
                <input
                  value={imageActions[idx]?.buttonName || ''}
                  onChange={(e) =>
                    setImageActions((prev) => prev.map((a, i) => (i === idx ? { ...a, buttonName: e.target.value } : a)))
                  }
                  placeholder="Button name"
                  style={{ marginTop: 6 }}
                />
                <input
                  value={imageActions[idx]?.dealOffer || ''}
                  onChange={(e) =>
                    setImageActions((prev) => prev.map((a, i) => (i === idx ? { ...a, dealOffer: e.target.value } : a)))
                  }
                  placeholder="Deal offer"
                  style={{ marginTop: 6 }}
                />
                <select
                  value={imageActions[idx]?.targetType || 'category'}
                  onChange={(e) =>
                    setImageActions((prev) =>
                      prev.map((a, i) =>
                        i === idx
                          ? {
                              ...a,
                              targetType: e.target.value,
                              categoryId: e.target.value === 'category' ? a.categoryId || '' : '',
                              subCategoryName: e.target.value === 'category' ? a.subCategoryName || '' : '',
                              subSubCategoryName: '',
                              collectionId: e.target.value === 'collection' ? a.collectionId || '' : '',
                            }
                          : a
                      )
                    )
                  }
                >
                  <option value="category">Category / Sub-category</option>
                  <option value="collection">Collection</option>
                </select>
                {(imageActions[idx]?.targetType || 'category') === 'collection' ? (
                  <select
                    value={imageActions[idx]?.collectionId || ''}
                    onChange={(e) =>
                      setImageActions((prev) =>
                        prev.map((a, i) => (i === idx ? { ...a, collectionId: e.target.value } : a))
                      )
                    }
                  >
                    <option value="">Select collection</option>
                    {collections.map((collection) => (
                      <option key={collection._id} value={collection._id}>
                        {collection.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    <select
                      value={imageActions[idx]?.categoryId || ''}
                      onChange={(e) =>
                        setImageActions((prev) =>
                          prev.map((a, i) =>
                            i === idx
                              ? {
                                  ...a,
                                  categoryId: e.target.value,
                                  subCategoryName: '',
                                  subSubCategoryName: '',
                                }
                              : a
                          )
                        )
                      }
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={imageActions[idx]?.subCategoryName || ''}
                      onChange={(e) =>
                        setImageActions((prev) =>
                          prev.map((a, i) =>
                            i === idx ? { ...a, subCategoryName: e.target.value, subSubCategoryName: '' } : a
                          )
                        )
                      }
                      disabled={!imageActions[idx]?.categoryId}
                    >
                      <option value="">Select sub-category</option>
                      {(getCategoryById(imageActions[idx]?.categoryId)?.subCategories || []).map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </>
                )}
                <select
                  value={imageActions[idx]?.subSubCategoryName || ''}
                  onChange={(e) =>
                    setImageActions((prev) =>
                      prev.map((a, i) => (i === idx ? { ...a, subSubCategoryName: e.target.value } : a))
                    )
                  }
                  disabled={
                    (imageActions[idx]?.targetType || 'category') === 'collection' ||
                    !hasSubSubsForAction(imageActions[idx])
                  }
                >
                  <option value="">
                    {(imageActions[idx]?.targetType || 'category') === 'collection'
                      ? 'Not required for collection target'
                      : hasSubSubsForAction(imageActions[idx])
                      ? 'Select sub-sub-category'
                      : 'No sub-sub-categories'}
                  </option>
                  {(getSubCategoryByAction(imageActions[idx])?.subSubCategories || []).map((ss) => (
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
                  <th>Offers</th>
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
                          src={toImageUrl(typeof deal.images[0] === 'string' ? deal.images[0] : deal.images[0]?.image)}
                          onError={handleImageError(typeof deal.images[0] === 'string' ? deal.images[0] : deal.images[0]?.image)}
                          alt=""
                        />
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>
                    <td>{deal.title}</td>
                    <td>
                      {(deal.images || [])
                        .map((img) =>
                          typeof img === 'string'
                            ? deal.dealOffer
                            : img.dealOffer || deal.dealOffer
                        )
                        .filter(Boolean)
                        .join(', ')}
                    </td>
                    <td>{(deal.images || []).map((img) => (typeof img === 'string' ? deal.buttonName || 'Button' : img.buttonName)).join(', ')}</td>
                    <td>
                      <div className="target-cell">
                        {deal.redirectTarget?.targetType === 'collection' ? (
                          <>
                            <div>
                              <strong>Collection</strong>
                            </div>
                            <div className="muted small">{deal.redirectTarget?.collectionName}</div>
                          </>
                        ) : (
                          <>
                            <div>
                              <strong>{deal.redirectTarget?.categoryName}</strong>
                            </div>
                            <div className="muted small">{deal.redirectTarget?.subCategoryName}</div>
                          </>
                        )}
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
