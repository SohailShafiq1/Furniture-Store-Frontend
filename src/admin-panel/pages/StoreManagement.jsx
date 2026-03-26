import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import { BACKEND_URL } from '../../config/api';
import './StoreManagement.css';

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const { token: adminToken } = useAdminAuth();

  const fetchStores = async () => {
    if (!adminToken) return; // Prevent extra calls without token
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/stores`, {
        headers: { 
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json' 
        }
      });
      setStores(res.data);
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [adminToken]);

  const handleAddStore = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/admin/store`, 
        { name, location, isDefault },
        { headers: { 
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json' 
        }}
      );
      setName('');
      setLocation('');
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
      
      <div className="store-form-section">
        <h3>Add New Store</h3>
        <form onSubmit={handleAddStore} className="store-form">
          <input 
            type="text" 
            placeholder="Store Name (e.g. Dubai, Meta Ads)" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="store-input"
          />
          <input 
            type="text" 
            placeholder="Location/Description" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="store-input"
          />
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
                <tr key={store._id}>
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
                    <span className="attribution-code">?store={store._id}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDeleteStore(store._id)} 
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
    </div>
  );
};

export default StoreManagement;

