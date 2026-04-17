import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import './DealsManagement.css';
import './InstagramPostsManager.css';

const createEmptyMediaAction = () => ({
  buttonName: '',
  redirectUrl: ''
});

const getMediaUrl = (raw, backendRoot) => {
  if (!raw) return '';
  return raw.startsWith('http') ? raw : `${backendRoot}/${raw}`;
};

const isVideoPath = (path) => /\.(mp4|webm|mov)$/i.test(String(path || ''));

const InstagramPostsManager = () => {
  const { token } = useAdminAuth();

  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [dealOffer, setDealOffer] = useState('');
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

  const postsEndpoint = useMemo(() => `${import.meta.env.VITE_API_URL}/home-content/instagram-posts`, []);
  const backendRoot = useMemo(() => import.meta.env.VITE_API_URL.replace('/api', ''), []);
  const authConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const resetForm = () => {
    mediaPreviews.forEach((preview) => {
      if (preview?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url);
      }
    });

    setTitle('');
    setDealOffer('');
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

  useEffect(() => {
    (async () => {
      try {
        setError('');
        await fetchPosts();
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

      if (!/^https?:\/\//i.test(action.redirectUrl || '')) {
        return `${label}: valid redirect URL is required`;
      }
    }
    return '';
  };

  const handleCreateOrUpdate = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!title.trim() || !dealOffer.trim()) {
      setError('Title and deal offer are required');
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
      formData.append('title', title);
      formData.append('dealOffer', dealOffer);
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
    setDealOffer(post.dealOffer || '');
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

    setExistingMedia(
      (post.media || []).map((item) => ({
        buttonName: item.buttonName || '',
        redirectUrl: item.redirectUrl || '',
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

          <label className="form-label">Deal Offer</label>
          <textarea
            value={dealOffer}
            onChange={(e) => setDealOffer(e.target.value)}
            placeholder="e.g. Save $1,300.00"
            rows={4}
            required
          />

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
                      <video src={getMediaUrl(item.file, backendRoot)} controls muted loop playsInline />
                    ) : (
                      <img src={getMediaUrl(item.file, backendRoot)} alt="" />
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
                      value={item.redirectUrl}
                      onChange={(e) =>
                        setExistingMedia((prev) =>
                          prev.map((entry, i) => (i === index ? { ...entry, redirectUrl: e.target.value } : entry))
                        )
                      }
                      placeholder="https://redirect-url.com"
                    />
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
                  value={mediaActions[index]?.redirectUrl || ''}
                  onChange={(e) =>
                    setMediaActions((prev) =>
                      prev.map((entry, i) => (i === index ? { ...entry, redirectUrl: e.target.value } : entry))
                    )
                  }
                  placeholder="https://redirect-url.com"
                />
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
                  const previewUrl = getMediaUrl(firstMedia?.file, backendRoot);

                  return (
                    <tr key={post._id}>
                      <td>
                        {firstMedia ? (
                          previewType === 'video' ? (
                            <video className="thumb" src={previewUrl} muted loop playsInline />
                          ) : (
                            <img className="thumb" src={previewUrl} alt="" />
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
