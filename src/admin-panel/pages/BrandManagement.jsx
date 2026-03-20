import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import './BrandManagement.css';

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandDescription, setNewBrandDescription] = useState('');
  const [brandImage, setBrandImage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', description: '', image: null });
  const { token } = useAdminAuth();
  const navigate = useNavigate();

  // Endpoints
  const apiEndpoint = `${import.meta.env.VITE_API_URL}/brands`;
  const backendRoot = import.meta.env.VITE_API_URL.replace('/api', '');

  const config = { headers: { Authorization: `Bearer ${token}` } };
  const multipartConfig = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };

  const fetchBrands = async () => {
    try {
      const res = await axios.get(`${apiEndpoint}/all`, config);
      setBrands(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch brands');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleCreateBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) {
      setError('Brand name is required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newBrandName);
      formData.append('description', newBrandDescription);
      if (brandImage) formData.append('image', brandImage);

      await axios.post(`${apiEndpoint}/create`, formData, multipartConfig);
      setMessage('Brand created successfully!');
      setNewBrandName('');
      setNewBrandDescription('');
      setBrandImage(null);
      setError('');
      fetchBrands();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating brand');
      setMessage('');
    }
  };

  const handleStartEdit = (brand) => {
    setEditingId(brand._id);
    setEditData({ name: brand.name, description: brand.description || '', image: null });
  };

  const handleUpdateBrand = async (e) => {
    e.preventDefault();
    if (!editData.name.trim()) {
      setError('Brand name is required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', editData.name);
      formData.append('description', editData.description);
      if (editData.image) formData.append('image', editData.image);

      await axios.put(`${apiEndpoint}/${editingId}`, formData, multipartConfig);
      setMessage('Brand updated successfully!');
      setEditingId(null);
      setEditData({ name: '', description: '', image: null });
      setError('');
      fetchBrands();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating brand');
      setMessage('');
    }
  };

  const handleDeleteBrand = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the brand "${name}"?`)) return;

    try {
      await axios.delete(`${apiEndpoint}/${id}`, config);
      setMessage('Brand deleted successfully!');
      setError('');
      fetchBrands();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting brand');
      setMessage('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ name: '', description: '', image: null });
  };

  return (
    <div className="brand-management">
      <div className="brand-header">
        <h1>Brand Management</h1>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Create/Edit Brand Form */}
      <div className="brand-form-section">
        <h2>{editingId ? 'Edit Brand' : 'Add New Brand'}</h2>
        <form onSubmit={editingId ? handleUpdateBrand : handleCreateBrand} className="brand-form">
          <div className="form-group">
            <label htmlFor="brand-name">Brand Name *</label>
            <input
              id="brand-name"
              type="text"
              placeholder="Enter brand name"
              value={editingId ? editData.name : newBrandName}
              onChange={(e) =>
                editingId
                  ? setEditData({ ...editData, name: e.target.value })
                  : setNewBrandName(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="brand-description">Description</label>
            <textarea
              id="brand-description"
              placeholder="Enter brand description (optional)"
              value={editingId ? editData.description : newBrandDescription}
              onChange={(e) =>
                editingId
                  ? setEditData({ ...editData, description: e.target.value })
                  : setNewBrandDescription(e.target.value)
              }
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="brand-image">Brand Logo/Image</label>
            <input
              id="brand-image"
              type="file"
              accept="image/*"
              onChange={(e) =>
                editingId
                  ? setEditData({ ...editData, image: e.target.files[0] })
                  : setBrandImage(e.target.files[0])
              }
            />
            {editingId && editData.image && <span className="file-name">{editData.image.name}</span>}
            {!editingId && brandImage && <span className="file-name">{brandImage.name}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {editingId ? 'Update Brand' : 'Create Brand'}
            </button>
            {editingId && (
              <button type="button" className="btn-cancel" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Brands List */}
      <div className="brands-list-section">
        <h2>All Brands ({brands.length})</h2>
        {brands.length === 0 ? (
          <p className="no-brands">No brands found. Create your first brand above.</p>
        ) : (
          <div className="brands-grid">
            {brands.map((brand) => (
              <div key={brand._id} className="brand-card">
                {brand.image && (
                  <div className="brand-image">
                    <img src={`${backendRoot}/${brand.image}`} alt={brand.name} />
                  </div>
                )}
                <div className="brand-content">
                  <h3>{brand.name}</h3>
                  {brand.description && <p className="brand-description">{brand.description}</p>}
                  <small className="brand-date">
                    Added on {new Date(brand.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <div className="brand-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleStartEdit(brand)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteBrand(brand._id, brand.name)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandManagement;
