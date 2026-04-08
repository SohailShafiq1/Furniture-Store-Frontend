import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import { BACKEND_URL } from '../../config/api';
import './InspirationManagement.css';

const InspirationManagement = () => {
  const [inspirations, setInspirations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const { token: adminToken } = useAdminAuth();

  // Fetch all inspirations
  const fetchInspirations = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/home-content/inspiration/get-all`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      setInspirations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching inspirations:', err);
      setSubmitError('Failed to load inspirations');
      setInspirations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspirations();
  }, [adminToken]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', image: null });
    setImagePreview(null);
    setEditingId(null);
    setSubmitMessage('');
    setSubmitError('');
  };

  const handleOpenModal = (inspiration = null) => {
    if (inspiration) {
      setEditingId(inspiration._id);
      setFormData({
        title: inspiration.title,
        description: inspiration.description,
        image: null
      });
      setImagePreview(
        inspiration.image.startsWith('http')
          ? inspiration.image
          : `${BACKEND_URL}/${inspiration.image}`
      );
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitMessage('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setSubmitError('Title and description are required');
      return;
    }

    if (!editingId && !formData.image) {
      setSubmitError('Image is required for new inspirations');
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      if (formData.image) {
        data.append('image', formData.image);
      }

      if (editingId) {
        // Update inspiration
        const res = await axios.put(
          `${BACKEND_URL}/api/home-content/inspiration/${editingId}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        setSubmitMessage('Inspiration updated successfully');
        setTimeout(() => {
          handleCloseModal();
          fetchInspirations();
        }, 1000);
      } else {
        // Add new inspiration
        const res = await axios.post(
          `${BACKEND_URL}/api/home-content/inspiration/add`,
          data,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        setSubmitMessage('Inspiration added successfully');
        setTimeout(() => {
          handleCloseModal();
          fetchInspirations();
        }, 1000);
      }
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || 'Error saving inspiration'
      );
    }
  };

  const handleDelete = async (inspirationId) => {
    if (!window.confirm('Are you sure you want to delete this inspiration?')) return;

    try {
      await axios.delete(
        `${BACKEND_URL}/api/home-content/inspiration/${inspirationId}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setSubmitMessage('Inspiration deleted successfully');
      setTimeout(() => {
        setSubmitMessage('');
        fetchInspirations();
      }, 1000);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || 'Error deleting inspiration'
      );
    }
  };

  return (
    <div className="inspiration-mgmt-container">
      <div className="inspiration-mgmt-header">
        <h1>Inspiration Management</h1>
        <p>Add and manage home page inspirations with images and descriptions</p>
      </div>

      <div className="inspiration-actions">
        <button
          className="inspiration-add-btn"
          onClick={() => handleOpenModal()}
        >
          + Add Inspiration
        </button>
      </div>

      {loading ? (
        <div className="inspiration-loading">Loading inspirations...</div>
      ) : inspirations.length > 0 ? (
        <div className="inspiration-grid">
          {inspirations.map(inspiration => (
            <div key={inspiration._id} className="inspiration-card">
              <div className="inspiration-image-wrapper">
                <img
                  src={
                    inspiration.image.startsWith('http')
                      ? inspiration.image
                      : `${BACKEND_URL}/${inspiration.image}`
                  }
                  alt={inspiration.title}
                  className="inspiration-image"
                />
              </div>
              <div className="inspiration-content">
                <h3 className="inspiration-title">{inspiration.title}</h3>
                <p className="inspiration-description">
                  {inspiration.description.substring(0, 100)}
                  {inspiration.description.length > 100 ? '...' : ''}
                </p>
                <div className="inspiration-actions-group">
                  <button
                    className="inspiration-edit-btn"
                    onClick={() => handleOpenModal(inspiration)}
                  >
                    Edit
                  </button>
                  <button
                    className="inspiration-delete-btn"
                    onClick={() => handleDelete(inspiration._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="inspiration-empty">
          <p>No inspirations yet. Create your first one!</p>
        </div>
      )}

      {showModal && (
        <div className="inspiration-modal-overlay" onClick={handleCloseModal}>
          <div className="inspiration-modal" onClick={e => e.stopPropagation()}>
            <div className="inspiration-modal-header">
              <h2>
                {editingId ? 'Edit Inspiration' : 'Add New Inspiration'}
              </h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="inspiration-form">
              <div className="inspiration-form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Spring Cleaning Tips"
                  className="inspiration-input"
                  required
                />
              </div>

              <div className="inspiration-form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter detailed description"
                  className="inspiration-textarea"
                  rows="6"
                  required
                />
              </div>

              <div className="inspiration-form-group">
                <label>Image {!editingId && '*'}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="inspiration-file-input"
                  required={!editingId}
                />
                {imagePreview && (
                  <div className="inspiration-image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>

              {submitError && (
                <div className="inspiration-error">{submitError}</div>
              )}

              {submitMessage && (
                <div className="inspiration-success">{submitMessage}</div>
              )}

              <div className="inspiration-form-actions">
                <button
                  type="button"
                  className="inspiration-cancel-btn"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className="inspiration-submit-btn">
                  {editingId ? 'Update Inspiration' : 'Add Inspiration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspirationManagement;
