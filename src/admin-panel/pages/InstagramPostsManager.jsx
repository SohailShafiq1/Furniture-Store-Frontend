import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import { API_BASE_URL } from '../../config/api';
import { getImageUrl, getAlternateImageUrl } from '../../utils/imageUrl';
import './DealsManagement.css';
import './InstagramPostsManager.css';

const createEmptyMediaAction = () => ({
  buttonName: '',
  dealOffer: '',
  redirectUrl: '',
  targetType: '',
  categoryId: '',
  subCategoryName: '',
  subSubCategoryName: '',
  collectionId: ''
});

const getMediaUrl = (raw) => {
  if (!raw) return '';
  if (raw.startsWith('blob:')) return raw;
  return getImageUrl(raw);
};

const isVideoPath = (path) => /\.(mp4|webm|mov)$/i.test(String(path || ''));

const InstagramPostsManager = () => {
  const { token } = useAdminAuth();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [title, setTitle] = useState('');
  const [showOnHomePage, setShowOnHomePage] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [promoEnabled, setPromoEnabled] = useState(false);
  const [promoHighlightText, setPromoHighlightText] = useState('Extra 5% OFF');
  const [promoNormalText, setPromoNormalText] = useState('A small boost for your tax refund season.');
  const [promoCode, setPromoCode] = useState('SS5OFF');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaActions, setMediaActions] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [existingMedia, setExistingMedia] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const postsEndpoint = useMemo(() => `${API_BASE_URL}/home-content/instagram-posts`, []);
  const categoriesEndpoint = useMemo(() => `${API_BASE_URL}/categories`, []);
  const collectionsEndpoint = useMemo(() => `${API_BASE_URL}/collections`, []);
  const authConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const handleImageError = (originalPath) => (event) => {
    const img = event.currentTarget;
    if (img.dataset.fallbackTried === 'true') return;

    const fallbackSrc = getAlternateImageUrl(img.src, originalPath);
    if (fallbackSrc) {
      img.dataset.fallbackTried = 'true';
      img.src = fallbackSrc;
    }
  };

  const resetForm = () => {
    mediaPreviews.forEach((preview) => {
      if (preview?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url);
      }
    });

    setTitle('');
    setShowOnHomePage(false);
    setIsVisible(true);
    setPromoEnabled(false);
    setPromoHighlightText('Extra 5% OFF');
    setPromoNormalText('A small boost for your tax refund season.');
    setPromoCode('SS5OFF');
    setMediaFiles([]);
    setMediaActions([]);
    setMediaPreviews([]);
    setEditingId(null);
    setExistingMedia([]);
  };

  const fetchPosts = async () => {
    const res = await axios.get(`${postsEndpoint}/get-all`, authConfig);
    setPosts(Array.isArray(res.data) ? res.data : []);
  };

  const fetchCategories = async () => {
    const res = await axios.get(`${categoriesEndpoint}/all`);
    setCategories(Array.isArray(res.data) ? res.data : []);
  };

  const fetchCollections = async () => {
    const res = await axios.get(`${collectionsEndpoint}/all`);
    setCollections(Array.isArray(res.data) ? res.data : []);
  };

  const getCategoryById = (id) => categories.find((category) => category._id === id);

  const getSubCategoryByAction = (action) => {
    const category = getCategoryById(action?.categoryId);
    return category?.subCategories?.find((sub) => sub.name === action?.subCategoryName) || null;
  };

  const getSubCategoriesForCategory = (categoryId) => {
    const category = getCategoryById(categoryId);
    return category?.subCategories || [];
  };

  const getSubSubCategoriesForAction = (action) => {
    return getSubCategoryByAction(action)?.subSubCategories || [];
  };

  const hasSubSubsForAction = (action) => {
    const sub = getSubCategoryByAction(action);
    return (sub?.subSubCategories?.length || 0) > 0;
  };

  useEffect(() => {
    (async () => {
      try {
        setError('');
        await Promise.all([fetchPosts(), fetchCategories(), fetchCollections()]);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load instagram posts');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMediaChange = (event) => {
    const incoming = Array.from(event.target.files || []);
    if (!incoming.length) return;

    const merged = [...mediaFiles, ...incoming];
    if (merged.length > 10) {
      setError('You can upload up to 10 media files (minimum 2).');
      event.target.value = '';
      return;
    }

    const nextPreviews = [
      ...mediaPreviews,
      ...incoming.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type?.startsWith('video/') ? 'video' : 'image'
      }))
    ];

    setMediaFiles(merged);
    setMediaActions([...mediaActions, ...incoming.map(() => createEmptyMediaAction())]);
    setMediaPreviews(nextPreviews);
    setError('');
    event.target.value = '';
  };

  const validateActions = (actions) => {
    for (let i = 0; i < actions.length; i += 1) {
      const action = actions[i] || {};
      const label = `Media ${i + 1}`;

      if (!action.buttonName?.trim()) {
        return `${label}: button name is required`;
      }

      if (!action.dealOffer?.trim()) {
        return `${label}: deal offer is required`;
      }

      const hasUrl = !!action.redirectUrl?.trim();
      const hasTarget = !!action.targetType;

      if (!hasUrl && !hasTarget) {
        return `${label}: add a redirect URL or select an internal target`;
      }

      if (hasUrl && !/^https?:\/\//i.test(action.redirectUrl || '')) {
        return `${label}: valid redirect URL is required`;
      }

      if (action.targetType === 'collection' && !action.collectionId) {
        return `${label}: select a collection`;
      }

      if (action.targetType === 'category') {
        if (!action.categoryId) {
          return `${label}: select a category`;
        }

        if (action.subSubCategoryName && !action.subCategoryName) {
          return `${label}: select a sub-category first`;
        }

        if (action.subCategoryName) {
          const subCategory = getSubCategoryByAction(action);
          if (!subCategory) {
            return `${label}: select a valid sub-category`;
          }
          if (action.subSubCategoryName) {
            const hasSubSub = subCategory.subSubCategories?.some(
              (ss) => ss.name === action.subSubCategoryName
            );
            if (!hasSubSub) {
              return `${label}: select a valid sub-sub-category`;
            }
          }
        }
      }
    }
    return '';
  };

  const handleCreateOrUpdate = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const activeActions = mediaFiles.length > 0 ? mediaActions : existingMedia;
    const actionError = validateActions(activeActions);
    if (actionError) {
      setError(actionError);
      return;
    }

    if (!editingId && (mediaFiles.length < 2 || mediaFiles.length > 10)) {
      setError('Please upload between 2 and 10 media files');
      return;
    }

    if (editingId && mediaFiles.length > 0 && (mediaFiles.length < 2 || mediaFiles.length > 10)) {
      setError('If replacing media, upload between 2 and 10 files');
      return;
    }

    try {
      const formData = new FormData();
      const fallbackDealOffer =
        activeActions.find((action) => action.dealOffer?.trim())?.dealOffer?.trim() || '';
      formData.append('title', title);
      formData.append('dealOffer', fallbackDealOffer);
      formData.append('showOnHomePage', String(showOnHomePage));
      formData.append('isVisible', String(isVisible));
      formData.append('promoEnabled', String(promoEnabled));
      formData.append('promoHighlightText', promoHighlightText);
      formData.append('promoNormalText', promoNormalText);
      formData.append('promoCode', promoCode);
      formData.append('mediaActions', JSON.stringify(activeActions));

      mediaFiles.forEach((file) => formData.append('media', file));

      const requestConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (editingId) {
        await axios.put(`${postsEndpoint}/${editingId}`, formData, requestConfig);
        setMessage('Instagram post updated successfully');
      } else {
        await axios.post(`${postsEndpoint}/add`, formData, requestConfig);
        setMessage('Instagram post created successfully');
      }

      resetForm();
      await fetchPosts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save instagram post');
    }
  };

  const startEdit = (post) => {
    setMessage('');
    setError('');

    setEditingId(post._id);
    setTitle(post.title || '');
    setShowOnHomePage(!!post.showOnHomePage);
    setIsVisible(post.isVisible !== false);
    setPromoEnabled(!!post.promoStrip?.enabled);
    setPromoHighlightText(post.promoStrip?.highlightText || 'Extra 5% OFF');
    setPromoNormalText(post.promoStrip?.normalText || 'A small boost for your tax refund season.');
    setPromoCode(post.promoStrip?.code || 'SS5OFF');
    setMediaFiles([]);

    mediaPreviews.forEach((preview) => {
      if (preview?.url?.startsWith('blob:')) URL.revokeObjectURL(preview.url);
    });

    setMediaPreviews([]);

    const fallbackDealOffer = post.dealOffer || '';
    setExistingMedia(
      (post.media || []).map((item) => ({
        buttonName: item.buttonName || '',
        dealOffer: item.dealOffer || fallbackDealOffer,
        redirectUrl: item.redirectUrl || '',
        targetType: item.target?.targetType || '',
        categoryId: item.target?.categoryId ? String(item.target.categoryId) : '',
        subCategoryName: item.target?.subCategoryName || '',
        subSubCategoryName: item.target?.subSubCategoryName || '',
        collectionId: item.target?.collectionId ? String(item.target.collectionId) : '',
        file: item.file,
        mediaType: item.mediaType || (isVideoPath(item.file) ? 'video' : 'image')
      }))
    );

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete instagram post "${post.title}"?`)) return;

    try {
      await axios.delete(`${postsEndpoint}/${post._id}`, authConfig);
      if (editingId === post._id) {
        resetForm();
      }
      setMessage('Instagram post deleted');
      await fetchPosts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleToggleVisibility = async (post) => {
    try {
      await axios.patch(
        `${postsEndpoint}/${post._id}/toggle-visibility`,
        { isVisible: !post.isVisible },
        authConfig
      );
      setMessage(`Post ${post.isVisible ? 'hidden' : 'shown'} successfully`);
      await fetchPosts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update visibility');
    }
  };

  return (
    <div className="instagram-posts-manager">
      {message && <div className="success-toast" onClick={() => setMessage('')}>{message}</div>}
      {error && <div className="error-toast" onClick={() => setError('')}>{error}</div>}

      <div className="deals-form-card" id="instagram-posts-form">
        <h2>{editingId ? 'Edit Instagram Post' : 'Instagram Posts Adding'}</h2>
        <p className="helper">
          Same flow as Deals: title, offer, strip, and per-card button details. This version accepts images and videos with redirect URLs.
        </p>

        <form onSubmit={handleCreateOrUpdate} className="admin-form">
          <label className="form-label">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" required />

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
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Is Visible
          </label>

          <label className="form-label checkbox-label">
            <input
              type="checkbox"
              checked={promoEnabled}
              onChange={(e) => setPromoEnabled(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Add Strip (Same as Deals)
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

          <label className="form-label">Media (Images + Videos, 2-10)</label>
          <input type="file" accept="image/*,video/mp4,video/webm,video/quicktime" multiple onChange={handleMediaChange} />
          <p className="helper">
            {editingId
              ? 'Leave media empty to keep existing files. If replacing, upload 2 to 10 files.'
              : 'Upload between 2 and 10 files.'}
          </p>

          <div className="preview-grid">
            {editingId && existingMedia.length > 0 && mediaFiles.length === 0 && (
              <>
                {existingMedia.map((item, index) => (
                  <div key={`existing-${index}`} className="instagram-media-card">
                    {item.mediaType === 'video' ? (
                      <video src={getMediaUrl(item.file)} controls muted loop playsInline />
                    ) : (
                      <img src={getMediaUrl(item.file)} alt="" onError={handleImageError(item.file)} />
                    )}
                    <input
                      value={item.buttonName}
                      onChange={(e) =>
                        setExistingMedia((prev) =>
                          prev.map((entry, i) => (i === index ? { ...entry, buttonName: e.target.value } : entry))
                        )
                      }
                      placeholder="Button name"
                      style={{ marginTop: 6 }}
                    />
                    <input
                      value={item.dealOffer}
                      onChange={(e) =>
                        setExistingMedia((prev) =>
                          prev.map((entry, i) => (i === index ? { ...entry, dealOffer: e.target.value } : entry))
                        )
                      }
                      placeholder="Deal offer"
                    />
                    <input
                      value={item.redirectUrl}
                      onChange={(e) =>
                        setExistingMedia((prev) =>
                          prev.map((entry, i) => (i === index ? { ...entry, redirectUrl: e.target.value } : entry))
                        )
                      }
                      placeholder="https://redirect-url.com"
                    />
                    <select
                      value={item.targetType || ''}
                      onChange={(e) =>
                        setExistingMedia((prev) =>
                          prev.map((entry, i) =>
                            i === index
                              ? {
                                  ...entry,
                                  targetType: e.target.value,
                                  categoryId: e.target.value !== 'category' ? '' : entry.categoryId,
                                  collectionId: e.target.value !== 'collection' ? '' : entry.collectionId,
                                  subCategoryName: e.target.value === 'category' ? entry.subCategoryName : '',
                                  subSubCategoryName: e.target.value === 'category' ? entry.subSubCategoryName : ''
                                }
                              : entry
                          )
                        )
                      }
                    >
                      <option value="">No internal target</option>
                      <option value="collection">Collection</option>
                      <option value="category">Category / Sub-category</option>
                      <option value="financing">Financing</option>
                    </select>
                    {item.targetType === 'collection' && (
                      <select
                        value={item.collectionId || ''}
                        onChange={(e) =>
                          setExistingMedia((prev) =>
                            prev.map((entry, i) =>
                              i === index ? { ...entry, collectionId: e.target.value } : entry
                            )
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
                    )}
                    {item.targetType === 'category' && (
                      <>
                        <select
                          value={item.categoryId || ''}
                          onChange={(e) =>
                            setExistingMedia((prev) =>
                              prev.map((entry, i) =>
                                i === index
                                  ? {
                                      ...entry,
                                      categoryId: e.target.value,
                                      subCategoryName: '',
                                      subSubCategoryName: ''
                                    }
                                  : entry
                              )
                            )
                          }
                        >
                          <option value="">Select category</option>
                          {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {item.categoryId && (
                          <select
                            value={item.subCategoryName || ''}
                            onChange={(e) =>
                              setExistingMedia((prev) =>
                                prev.map((entry, i) =>
                                  i === index
                                    ? {
                                        ...entry,
                                        subCategoryName: e.target.value,
                                        subSubCategoryName: ''
                                      }
                                    : entry
                                )
                              )
                            }
                          >
                            <option value="">Select sub-category</option>
                            {getSubCategoriesForCategory(item.categoryId).map((sub) => (
                              <option key={sub.name} value={sub.name}>
                                {sub.name}
                              </option>
                            ))}
                          </select>
                        )}
                        {item.categoryId && item.subCategoryName && getSubSubCategoriesForAction(item).length > 0 && (
                          <select
                            value={item.subSubCategoryName || ''}
                            onChange={(e) =>
                              setExistingMedia((prev) =>
                                prev.map((entry, i) =>
                                  i === index ? { ...entry, subSubCategoryName: e.target.value } : entry
                                )
                              )
                            }
                          >
                            <option value="">Select sub-sub-category</option>
                            {getSubSubCategoriesForAction(item).map((subSub) => (
                              <option key={subSub.name} value={subSub.name}>
                                {subSub.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </>
            )}

            {mediaPreviews.map((preview, index) => (
              <div key={`new-${index}`} className="instagram-media-card">
                {preview.type === 'video' ? (
                  <video src={preview.url} controls muted loop playsInline />
                ) : (
                  <img src={preview.url} alt="" />
                )}
                <input
                  value={mediaActions[index]?.buttonName || ''}
                  onChange={(e) =>
                    setMediaActions((prev) =>
                      prev.map((entry, i) => (i === index ? { ...entry, buttonName: e.target.value } : entry))
                    )
                  }
                  placeholder="Button name"
                />
                <input
                  value={mediaActions[index]?.dealOffer || ''}
                  onChange={(e) =>
                    setMediaActions((prev) =>
                      prev.map((entry, i) => (i === index ? { ...entry, dealOffer: e.target.value } : entry))
                    )
                  }
                  placeholder="Deal offer"
                />
                <input
                  value={mediaActions[index]?.redirectUrl || ''}
                  onChange={(e) =>
                    setMediaActions((prev) =>
                      prev.map((entry, i) => (i === index ? { ...entry, redirectUrl: e.target.value } : entry))
                    )
                  }
                  placeholder="https://redirect-url.com"
                />
                <select
                  value={mediaActions[index]?.targetType || ''}
                  onChange={(e) =>
                    setMediaActions((prev) =>
                      prev.map((entry, i) =>
                        i === index
                          ? {
                              ...entry,
                              targetType: e.target.value,
                              categoryId: e.target.value !== 'category' ? '' : entry.categoryId,
                              collectionId: e.target.value !== 'collection' ? '' : entry.collectionId,
                              subCategoryName: e.target.value === 'category' ? entry.subCategoryName : '',
                              subSubCategoryName: e.target.value === 'category' ? entry.subSubCategoryName : ''
                            }
                          : entry
                      )
                    )
                  }
                >
                  <option value="">No internal target</option>
                  <option value="collection">Collection</option>
                  <option value="category">Category / Sub-category</option>
                  <option value="financing">Financing</option>
                </select>
                {mediaActions[index]?.targetType === 'collection' && (
                  <select
                    value={mediaActions[index]?.collectionId || ''}
                    onChange={(e) =>
                      setMediaActions((prev) =>
                        prev.map((entry, i) =>
                          i === index ? { ...entry, collectionId: e.target.value } : entry
                        )
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
                )}
                {mediaActions[index]?.targetType === 'category' && (
                  <>
                    <select
                      value={mediaActions[index]?.categoryId || ''}
                      onChange={(e) =>
                        setMediaActions((prev) =>
                          prev.map((entry, i) =>
                            i === index
                              ? {
                                  ...entry,
                                  categoryId: e.target.value,
                                  subCategoryName: '',
                                  subSubCategoryName: ''
                                }
                              : entry
                          )
                        )
                      }
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {mediaActions[index]?.categoryId && (
                      <select
                        value={mediaActions[index]?.subCategoryName || ''}
                        onChange={(e) =>
                          setMediaActions((prev) =>
                            prev.map((entry, i) =>
                              i === index
                                ? { ...entry, subCategoryName: e.target.value, subSubCategoryName: '' }
                                : entry
                            )
                          )
                        }
                      >
                        <option value="">Select sub-category</option>
                        {getSubCategoriesForCategory(mediaActions[index]?.categoryId).map((sub) => (
                          <option key={sub.name} value={sub.name}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {mediaActions[index]?.categoryId && mediaActions[index]?.subCategoryName && getSubSubCategoriesForAction(mediaActions[index]).length > 0 && (
                      <select
                        value={mediaActions[index]?.subSubCategoryName || ''}
                        onChange={(e) =>
                          setMediaActions((prev) =>
                            prev.map((entry, i) =>
                              i === index ? { ...entry, subSubCategoryName: e.target.value } : entry
                            )
                          )
                        }
                      >
                        <option value="">Select sub-sub-category</option>
                        {getSubSubCategoriesForAction(mediaActions[index]).map((subSub) => (
                          <option key={subSub.name} value={subSub.name}>
                            {subSub.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="form-actions-row">
            <button type="submit">{editingId ? 'Save Changes' : 'Publish Instagram Post'}</button>
            {editingId && (
              <button type="button" className="secondary-btn" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="deals-list-card">
        <h2>Existing Instagram Posts</h2>
        {posts.length === 0 ? (
          <p className="muted">No instagram posts yet.</p>
        ) : (
          <div className="deals-table-wrap">
            <table className="deals-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Title</th>
                  <th>Offer</th>
                  <th>Media Count</th>
                  <th>Home</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const firstMedia = post.media?.[0];
                  const previewType = firstMedia?.mediaType || (isVideoPath(firstMedia?.file) ? 'video' : 'image');
                  const previewUrl = getMediaUrl(firstMedia?.file);

                  return (
                    <tr key={post._id}>
                      <td>
                        {firstMedia ? (
                          previewType === 'video' ? (
                            <video className="thumb" src={previewUrl} muted loop playsInline />
                          ) : (
                            <img className="thumb" src={previewUrl} alt="" onError={handleImageError(firstMedia?.file)} />
                          )
                        ) : (
                          <span className="muted">-</span>
                        )}
                      </td>
                      <td>{post.title}</td>
                      <td>{post.dealOffer}</td>
                      <td>{post.media?.length || 0}</td>
                      <td>{post.showOnHomePage ? 'Yes' : 'No'}</td>
                      <td>{post.isVisible ? 'Visible' : 'Hidden'}</td>
                      <td className="actions-col">
                        <button
                          type="button"
                          className="mini"
                          onClick={() => startEdit(post)}
                          disabled={!!editingId && editingId !== post._id}
                        >
                          Edit
                        </button>
                        <button type="button" className="mini" onClick={() => handleToggleVisibility(post)}>
                          {post.isVisible ? 'Hide' : 'Show'}
                        </button>
                        <button type="button" className="mini danger" onClick={() => handleDelete(post)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramPostsManager;
