import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import { API_BASE_URL } from '../../config/api';
import { getImageUrl, getAlternateImageUrl } from '../../utils/imageUrl';
import './CategoryManagement.css';

const CategoryDetailPage = () => {
    const { categoryId } = useParams();
    const [category, setCategory] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { token } = useAdminAuth();
    const navigate = useNavigate();

    const apiEndpoint = `${API_BASE_URL}/categories`;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const handleImageError = (originalPath) => (event) => {
        const img = event.currentTarget;
        if (img.dataset.fallbackTried === 'true') return;

        const fallbackSrc = getAlternateImageUrl(img.src, originalPath);
        if (fallbackSrc) {
            img.dataset.fallbackTried = 'true';
            img.src = fallbackSrc;
        }
    };

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await axios.get(`${apiEndpoint}/all`, config);
                const found = res.data.find(c => c._id === categoryId);
                if (found) {
                    setCategory(found);
                    setEditedName(found.name);
                }
            } catch (err) {
                setError('Failed to fetch category details');
            }
        };
        fetchCategory();
    }, [categoryId]);

    const handleUpdate = async () => {
        try {
            await axios.put(`${apiEndpoint}/${categoryId}`, { name: editedName }, config);
            setMessage('Category name updated!');
            setCategory({ ...category, name: editedName });
            setEditMode(false);
        } catch (err) {
            setError('Update failed');
        }
    };

    const handleDeleteSub = async (subName) => {
        if (!window.confirm(`Delete sub-category "${subName}"?`)) return;
        try {
            await axios.delete(`${apiEndpoint}/${categoryId}/sub/${encodeURIComponent(subName)}`, config);
            setCategory({
                ...category,
                subCategories: category.subCategories.filter(s => s.name !== subName)
            });
            setMessage('Sub-category removed');
        } catch (err) {
            setError('Delete failed');
        }
    };

    if (!category) return <div className="category-management">Loading...</div>;

    return (
        <div className="category-management">
            <button className="action-btn edit-btn" onClick={() => navigate('/admin/categories')}>← Back to Catalog</button>
            <div className="category-header-detail" style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginTop: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <img src={getImageUrl(category.image)} alt="" onError={handleImageError(category.image)} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                        {editMode ? (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input value={editedName} onChange={(e) => setEditedName(e.target.value)} style={{ fontSize: '1.5rem', fontWeight: 'bold' }} />
                                <button className="action-btn" onClick={handleUpdate} style={{ background: '#27ae60' }}>Save</button>
                                <button className="action-btn edit-btn" onClick={() => setEditMode(false)}>Cancel</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h1>{category.name}</h1>
                                <button className="action-btn edit-btn" onClick={() => setEditMode(true)}>Rename Category</button>
                            </div>
                        )}
                        <p style={{ color: '#666' }}>{category.subCategories.length} Sub-categories found</p>
                    </div>
                </div>
            </div>

            <div className="category-list" style={{ marginTop: '2rem' }}>
                <h2>Sub-categories inside {category.name}</h2>
                <div className="category-accordion">
                    {category.subCategories.map((sub, i) => (
                        <div key={i} className="category-node" style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/category/${categoryId}/sub/${encodeURIComponent(sub.name)}`)}>
                            <div className="category-header">
                                <div className="cat-info">
                                    <img src={getImageUrl(sub.image)} alt="" className="cat-main-img" onError={handleImageError(sub.image)} />
                                    <div className="cat-name-box">
                                        <h3>{sub.name}</h3>
                                        <span className="sub-count">Click to view/manage content</span>
                                    </div>
                                </div>
                                <div className="node-actions" onClick={(e) => e.stopPropagation()}>
                                    <button className="action-btn delete-btn" onClick={() => handleDeleteSub(sub.name)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryDetailPage;