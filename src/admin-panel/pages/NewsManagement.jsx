import { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../config/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import './NewsManagement.css';

export default function NewsManagement() {
  const { token } = useAdminAuth();
  const [news, setNews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/home-content/news/get-all`);
      setNews(res.data);
    } catch (err) {
      console.error('Error fetching news:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: null
    });
    setImagePreview('');
    setEditingId(null);
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      setMessage('Please fill in all fields');
      return;
    }

    if (!editingId && !formData.image) {
      setMessage('Image is required for new news');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      if (formData.image) {
        data.append('image', formData.image);
      }

      if (editingId) {
        // Update
        await axios.put(
          `${BACKEND_URL}/api/home-content/news/${editingId}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        setMessage('News updated successfully');
      } else {
        // Add
        await axios.post(
          `${BACKEND_URL}/api/home-content/news/add`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        setMessage('News added successfully');
      }

      fetchNews();
      setShowModal(false);
      resetForm();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error saving news');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      description: item.description,
      image: null
    });
    setImagePreview(item.image.startsWith('http') ? item.image : `${BACKEND_URL}/${item.image}`);
    setEditingId(item._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      await axios.delete(
        `${BACKEND_URL}/api/home-content/news/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchNews();
      setMessage('News deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error deleting news');
      console.error('Error:', err);
    }
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="news-management">
      <div className="news-management-header">
        <h2>Manage News</h2>
        <button className="add-btn" onClick={handleOpenModal}>
          + Add News
        </button>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="news-list">
        {news.map((item) => (
          <div key={item._id} className="news-item">
            <div className="news-item-image">
              <img
                src={item.image.startsWith('http') ? item.image : `${BACKEND_URL}/${item.image}`}
                alt={item.title}
              />
            </div>
            <div className="news-item-content">
              <h4>{item.title}</h4>
              <p>{item.description.substring(0, 100)}...</p>
            </div>
            <div className="news-item-actions">
              <button className="edit-btn" onClick={() => handleEdit(item)}>
                Edit
              </button>
              <button className="delete-btn" onClick={() => handleDelete(item._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit News' : 'Add New News'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleAddOrUpdate}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter news title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter detailed description"
                  rows="6"
                  required
                />
              </div>

              <div className="form-group">
                <label>Image {!editingId && '*'}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!editingId}
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Saving...' : editingId ? 'Update News' : 'Add News'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
