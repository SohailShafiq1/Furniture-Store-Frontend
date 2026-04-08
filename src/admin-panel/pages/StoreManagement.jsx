import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import { BACKEND_URL } from '../../config/api';
import Modal from '../../components/Modal/Modal';
import InspirationManagement from './InspirationManagement';
import NewsManagement from './NewsManagement';
import './StoreManagement.css';

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [copyStatus, setCopyStatus] = useState({});
  const [activeTab, setActiveTab] = useState('stores'); // 'stores', 'inspirations' or 'news'
  
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [hours, setHours] = useState({
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: ''
  });
  const [isDefault, setIsDefault] = useState(false);
  const { token: adminToken } = useAdminAuth();

  const fetchStores = async () => {
    if (!adminToken) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/stores`, {
        headers: { 
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json' 
        }
      });
      setStores(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching stores:', err);
      setStores([]);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [adminToken]);

  const handleCopyProductLink = (product, storeId) => {
    const frontendUrl = window.location.origin;
    // Fix route mismatch by including category ID as required by App.jsx
    const link = `${frontendUrl}/product/${product.category}/${product._id}?store=${storeId}`;
    
    // Create temporary input for cross-browser copy support
    const el = document.createElement('textarea');
    el.value = link;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    setCopyStatus({ ...copyStatus, [product._id]: true });
    setTimeout(() => {
      setCopyStatus({ ...copyStatus, [product._id]: false });
    }, 2000);
  };

  const openStoreProducts = async (store) => {
    setSelectedStore(store);
    setShowProductModal(true);
    setLoadingProducts(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/store-products/${store._id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching store products:', err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/admin/store`, 
        { name, location, description, googleMapsLink, phone, email, hours, isDefault },
        { headers: { 
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json' 
        }}
      );
      setName('');
      setLocation('');
      setDescription('');
      setGoogleMapsLink('');
      setPhone('');
      setEmail('');
      setHours({
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: ''
      });
      setIsDefault(false);
      fetchStores();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding store');
    }
  };

  const handleDeleteStore = async (id) => {
    if (!window.confirm('Are you sure you want to delete this store?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/store/${id}`, {
        headers: { 
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json' 
        }
      });
      fetchStores();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting store');
    }
  };

  return (
    <div className="store-mgmt-container">
      <div className="store-mgmt-header">
        <h1>Store & Ad Attribution Management</h1>
        <p>Create stores to generate unique tracking links for your ad campaigns.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="store-mgmt-tabs">
        <button
          className={`store-mgmt-tab ${activeTab === 'stores' ? 'active' : ''}`}
          onClick={() => setActiveTab('stores')}
        >
          Store Management
        </button>
        <button
          className={`store-mgmt-tab ${activeTab === 'inspirations' ? 'active' : ''}`}
          onClick={() => setActiveTab('inspirations')}
        >
          Add Inspiration
        </button>
        <button
          className={`store-mgmt-tab ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          Add News
        </button>
      </div>

      {/* Stores Tab */}
      {activeTab === 'stores' && (
        <>
          <div className="store-form-section">
            <h3>Add New Store</h3>
            <form onSubmit={handleAddStore} className="store-form">
              <div className="form-row">
                <input 
                  type="text" 
                  placeholder="Store Name (e.g. Houston Store)" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="store-input"
                />
                <input 
                  type="text" 
                  placeholder="Location/Address" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="store-input"
                />
              </div>

              <div className="form-row">
                <textarea 
                  placeholder="Store Description (shown in list, e.g., features luxury brands...)" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="store-input"
                  rows="2"
                />
              </div>

              <div className="form-row">
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="store-input"
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="store-input"
                />
              </div>

              <div className="form-row">
                <textarea 
                  placeholder="Google Maps Embed Code (paste the entire iframe code here)" 
                  value={googleMapsLink}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Extract src from iframe tag if pasted
                    const srcMatch = value.match(/src=["']([^"']+)["']/);
                    if (srcMatch) {
                      value = srcMatch[1];
                    }
                    setGoogleMapsLink(value);
                  }}
                  className="store-input maps-textarea"
                  rows="3"
                  title="Paste the entire iframe code or just the src URL"
                />
              </div>

              <div className="hours-section">
                <h4>Store Hours</h4>
                <div className="hours-grid">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <input
                      key={day}
                      type="text"
                      placeholder={`${day.charAt(0).toUpperCase() + day.slice(1)} (e.g., 10:00 AM - 8:00 PM)`}
                      value={hours[day]}
                      onChange={(e) => setHours({ ...hours, [day]: e.target.value })}
                      className="hours-input"
                    />
                  ))}
                </div>
              </div>

              <label className="store-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                Default Store
              </label>
              <button type="submit" className="store-add-btn">
                Add Store
              </button>
            </form>
          </div>

          <div className="store-table-wrapper">
            <table className="store-table">
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th>Location</th>
                  <th style={{ textAlign: 'center' }}>Type</th>
                  <th style={{ textAlign: 'center' }}>Ad Attribution Link</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.length > 0 ? (
                  stores.map(store => (
                    <tr key={store._id} className="store-row clickable" onClick={() => openStoreProducts(store)}>
                      <td><strong>{store.name}</strong></td>
                      <td>{store.location || 'N/A'}</td>
                      <td style={{ textAlign: 'center' }}>
                        {store.isDefault ? (
                          <span className="badge-default">DEFAULT</span>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#999' }}>Standard</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="link-group">
                          <span className="attribution-code">?store={store._id}</span>
                          <button 
                            className="copy-mini-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              const frontendUrl = window.location.origin;
                              navigator.clipboard.writeText(`${frontendUrl}?store=${store._id}`);
                            }}
                          >
                            Copy Home Link
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStore(store._id);
                          }} 
                          className="store-delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                      No stores found. Create your first store above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {showProductModal && selectedStore && (
            <div className="store-products-overlay" onClick={() => setShowProductModal(false)}>
              <div className="store-products-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Ad Links for: {selectedStore.name}</h2>
                  <button className="close-btn" onClick={() => setShowProductModal(false)}>×</button>
                </div>
                <div className="modal-body">
                  <p className="modal-instruction">Copy these direct product links to track attribution for specific product ads.</p>
                  <div className="product-links-list">
                    {loadingProducts ? (
                      <div className="modal-loading">Loading store products...</div>
                    ) : products.length > 0 ? (
                      products.map(product => (
                        <div key={product._id} className="product-link-item">
                          <div className="product-info">
                            <img 
                              src={product.images && product.images[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${BACKEND_URL}/${product.images[0]}`) : '/placeholder.png'} 
                              alt={product.name} 
                              className="product-mini-img"
                            />
                            <div className="product-details">
                              <span className="product-name">{product.name}</span>
                              <span className="product-price">${product.price} ({product.stock} in stock)</span>
                            </div>
                          </div>
                          <button 
                            className={`copy-link-btn ${copyStatus[product._id] ? 'copied' : ''}`}
                            onClick={() => handleCopyProductLink(product, selectedStore._id)}
                          >
                            {copyStatus[product._id] ? '✓ Link Copied' : 'Copy Ad Link'}
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="no-products">No stock assigned to this store yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Inspirations Tab */}
      {activeTab === 'inspirations' && (
        <InspirationManagement />
      )}

      {/* News Tab */}
      {activeTab === 'news' && (
        <NewsManagement />
      )}
    </div>
  );
};

export default StoreManagement;

