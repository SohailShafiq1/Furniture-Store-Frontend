import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { getImageUrl, getAlternateImageUrl } from '../../utils/imageUrl';
import { useAdminAuth } from '../context/AdminAuthContext';
import './DamageClaimsManagement.css';

const toImageUrl = (path) => {
  if (!path) return null;
  return getImageUrl(String(path).replace(/\\/g, '/'));
};

const formatBool = (value) => (value ? 'Yes' : 'No');

export default function DamageClaimsManagement() {
  const { token } = useAdminAuth();
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);

  const handleImageError = (originalPath) => (event) => {
    const img = event.currentTarget;
    if (img.dataset.fallbackTried === 'true') return;

    const fallbackSrc = getAlternateImageUrl(img.src, originalPath);
    if (fallbackSrc) {
      img.dataset.fallbackTried = 'true';
      img.src = fallbackSrc;
    }
  };

  const selectedImages = useMemo(() => {
    if (!selectedClaim) return [];
    return [
      { label: 'Damage Picture', value: selectedClaim.damagePicture },
      { label: 'Close-Up Picture', value: selectedClaim.closeUpPicture },
      { label: 'Serial/SKU Picture', value: selectedClaim.serialSkuPicture },
      { label: 'Out of Texas Picture', value: selectedClaim.outOfTexasPicture }
    ].filter((item) => item.value);
  }, [selectedClaim]);

  const fetchClaims = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/damage-claims/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const records = Array.isArray(res.data?.claims) ? res.data.claims : [];
      setClaims(records);
      if (records.length && !selectedClaim) {
        setSelectedClaim(records[0]);
      }
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load damage claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [token]);

  const handleStatusChange = async (status) => {
    if (!selectedClaim) return;
    try {
      setStatusSaving(true);
      const res = await axios.put(
        `${API_BASE_URL}/damage-claims/admin/${selectedClaim._id}/status`,
        { status, adminNotes: selectedClaim.adminNotes || '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedClaim = res.data?.claim;
      if (!updatedClaim) return;

      setSelectedClaim(updatedClaim);
      setClaims((prev) => prev.map((item) => (item._id === updatedClaim._id ? updatedClaim : item)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update claim status');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleNotesSave = async () => {
    if (!selectedClaim) return;
    try {
      setStatusSaving(true);
      const res = await axios.put(
        `${API_BASE_URL}/damage-claims/admin/${selectedClaim._id}/status`,
        { status: selectedClaim.status, adminNotes: selectedClaim.adminNotes || '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedClaim = res.data?.claim;
      if (!updatedClaim) return;
      setSelectedClaim(updatedClaim);
      setClaims((prev) => prev.map((item) => (item._id === updatedClaim._id ? updatedClaim : item)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save notes');
    } finally {
      setStatusSaving(false);
    }
  };

  return (
    <div className="dcm-page">
      <div className="dcm-header">
        <h1>Damage Claims</h1>
        <p>Total Claims: {claims.length}</p>
      </div>

      {error && <div className="dcm-error">{error}</div>}

      {loading ? (
        <div className="dcm-loading">Loading damage claims...</div>
      ) : (
        <div className="dcm-layout">
          <aside className="dcm-list">
            {claims.length === 0 ? (
              <div className="dcm-empty">No damage claims submitted yet.</div>
            ) : (
              claims.map((claim) => (
                <button
                  key={claim._id}
                  className={`dcm-list-item ${selectedClaim?._id === claim._id ? 'active' : ''}`}
                  onClick={() => setSelectedClaim(claim)}
                  type="button"
                >
                  <strong>{claim.firstName} {claim.lastName}</strong>
                  <span>Order #{claim.orderNumber}</span>
                  <span>{new Date(claim.createdAt).toLocaleDateString()}</span>
                  <span className={`dcm-status ${claim.status}`}>{claim.status}</span>
                </button>
              ))
            )}
          </aside>

          <section className="dcm-detail">
            {!selectedClaim ? (
              <div className="dcm-empty">Select a claim to view details.</div>
            ) : (
              <>
                <div className="dcm-detail-head">
                  <h2>{selectedClaim.firstName} {selectedClaim.lastName}</h2>
                  <div className="dcm-status-actions">
                    <select
                      value={selectedClaim.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={statusSaving}
                    >
                      <option value="new">new</option>
                      <option value="in-review">in-review</option>
                      <option value="resolved">resolved</option>
                    </select>
                  </div>
                </div>

                <div className="dcm-grid">
                  <div><strong>Email:</strong> {selectedClaim.email}</div>
                  <div><strong>Order #:</strong> {selectedClaim.orderNumber}</div>
                  <div><strong>Delivery Date:</strong> {new Date(selectedClaim.deliveryDate).toLocaleDateString()}</div>
                  <div><strong>48 Hours Passed:</strong> {formatBool(selectedClaim.isAfter48Hours)}</div>
                  <div><strong>Original Packaging:</strong> {formatBool(selectedClaim.hasOriginalPackaging)}</div>
                  <div><strong>Marketing Opt-In:</strong> {formatBool(selectedClaim.acceptMarketing)}</div>
                  <div><strong>Items Damaged:</strong> {selectedClaim.damageItemsCount}</div>
                  <div><strong>Terms Name/Initials:</strong> {selectedClaim.termsAcceptedName}</div>
                </div>

                <div className="dcm-section">
                  <h3>Issue Description</h3>
                  <p>{selectedClaim.issueDescription}</p>
                </div>

                <div className="dcm-section">
                  <h3>Optional Checklist</h3>
                  <ul className="dcm-checklist">
                    <li>Order Number: {formatBool(selectedClaim.checklist?.orderNumber)}</li>
                    <li>Contact Information: {formatBool(selectedClaim.checklist?.contactInformation)}</li>
                    <li>Date of Delivery/Damage/Loss: {formatBool(selectedClaim.checklist?.dateOfDeliveryDamageLoss)}</li>
                    <li>Serial # and SKU: {formatBool(selectedClaim.checklist?.serialAndSku)}</li>
                    <li>Affected Items Count: {formatBool(selectedClaim.checklist?.affectedItemsCount)}</li>
                    <li>Pictures: {formatBool(selectedClaim.checklist?.pictures)}</li>
                    <li>Packaging Picture: {formatBool(selectedClaim.checklist?.packagingPicture)}</li>
                    <li>Brief Description: {formatBool(selectedClaim.checklist?.briefDescription)}</li>
                  </ul>
                </div>

                <div className="dcm-section">
                  <h3>Uploaded Images</h3>
                  <div className="dcm-images">
                    {selectedImages.map((item) => (
                      <a key={item.label} href={toImageUrl(item.value)} target="_blank" rel="noreferrer" className="dcm-image-card">
                        <img src={toImageUrl(item.value)} alt={item.label} onError={handleImageError(item.value)} />
                        <span>{item.label}</span>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="dcm-section">
                  <h3>Admin Notes</h3>
                  <textarea
                    value={selectedClaim.adminNotes || ''}
                    onChange={(e) => setSelectedClaim((prev) => ({ ...prev, adminNotes: e.target.value }))}
                    rows={4}
                  />
                  <button type="button" className="dcm-save-btn" onClick={handleNotesSave} disabled={statusSaving}>
                    {statusSaving ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
