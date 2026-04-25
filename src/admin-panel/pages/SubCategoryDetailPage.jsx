import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import { API_BASE_URL } from '../../config/api';
import { getImageUrl, getAlternateImageUrl } from '../../utils/imageUrl';
import './CategoryManagement.css';

const SubCategoryDetailPage = () => {
    const { categoryId, subName } = useParams();
    const [subCategory, setSubCategory] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [newSubName, setNewSubName] = useState(subName);
    const [subCategoryImageFile, setSubCategoryImageFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { token } = useAdminAuth();
    const navigate = useNavigate();

    const apiEndpoint = `${API_BASE_URL}/categories`;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const multipartConfig = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };

    const goToProducts = (subSubCategoryName = '') => {
        const params = new URLSearchParams();
        const resolvedSubName = subCategory?.name || subName;
        if (resolvedSubName) params.set('subCategoryName', resolvedSubName);
        if (subSubCategoryName) params.set('subSubCategoryName', subSubCategoryName);
        const query = params.toString();
        navigate(`/admin/category/${categoryId}/products${query ? `?${query}` : ''}`);
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

    const fetchSubCategory = async () => {
        try {
            const res = await axios.get(`${apiEndpoint}/all`, config);
            const parent = res.data.find(c => c._id === categoryId);
            if (!parent) {
                setError('Parent category not found');
                return;
            }

            const sub = parent.subCategories.find(s => s.name === subName);
            if (sub) {
                setSubCategory(sub);
                setNewSubName(sub.name);
                setError('');
            } else {
                setError('Sub-category not found');
            }
        } catch (err) {
            setError('Failed to fetch sub-category');
        }
    };

    useEffect(() => {
        fetchSubCategory();
    }, [categoryId, subName]);

    const handleUpdate = async () => {
        try {
            await axios.put(`${apiEndpoint}/${categoryId}/sub/${encodeURIComponent(subName)}`, { name: newSubName }, config);
            navigate(`/admin/category/${categoryId}/sub/${encodeURIComponent(newSubName)}`, { replace: true });
            setEditMode(false);
            setMessage('Sub-category name updated');
        } catch (err) {
            setError('Update failed');
        }
    };

    const handleSubCategoryImageUpdate = async () => {
        if (!subCategoryImageFile) return;
        try {
            const formData = new FormData();
            formData.append('image', subCategoryImageFile);

            await axios.put(`${apiEndpoint}/${categoryId}/sub/${encodeURIComponent(subName)}`, formData, multipartConfig);
            setSubCategoryImageFile(null);
            setMessage('Sub-category image updated');
            fetchSubCategory();
        } catch (err) {
            setError('Failed to update sub-category image');
        }
    };

    const handleSubSubImageUpdate = async (subSubName, file) => {
        if (!file) return;
        try {
            const formData = new FormData();
            formData.append('image', file);

            const resolvedSubName = subCategory?.name || subName;
            await axios.put(
                `${apiEndpoint}/${categoryId}/sub/${encodeURIComponent(resolvedSubName)}/ss/${encodeURIComponent(subSubName)}`,
                formData,
                multipartConfig
            );

            setMessage('Sub-sub-category image updated');
            fetchSubCategory();
        } catch (err) {
            setError('Failed to update sub-sub-category image');
        }
    };

    if (!subCategory) return <div className="category-management">Loading...</div>;

    return (
        <div className="category-management">
            <button className="action-btn edit-btn" onClick={() => navigate(`/admin/category/${categoryId}`)}>← Back to {subName} Parent Category</button>
            {message && <div className="success-toast" onClick={() => setMessage('')}>{message}</div>}
            {error && <div className="error-toast" onClick={() => setError('')}>{error}</div>}
            <div className="category-header-detail" style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginTop: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <img src={getImageUrl(subCategory.image)} alt="" onError={handleImageError(subCategory.image)} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                        {editMode ? (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input value={newSubName} onChange={(e) => setNewSubName(e.target.value)} style={{ fontSize: '1.5rem', fontWeight: 'bold' }} />
                                <button className="action-btn" onClick={handleUpdate} style={{ background: '#27ae60' }}>Update Name</button>
                                <button className="action-btn edit-btn" onClick={() => setEditMode(false)}>Cancel</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h1>Sub-category: {subCategory.name}</h1>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="action-btn edit-btn" onClick={() => goToProducts()}>View Products</button>
                                    <button className="action-btn edit-btn" onClick={() => setEditMode(true)}>Rename Sub-category</button>
                                </div>
                            </div>
                        )}
                        <p style={{ color: '#666' }}>This sub-category is ready to be linked with products or banners.</p>
                    </div>
                </div>
            </div>

            <div className="management-sections" style={{ marginTop: '2rem' }}>
                <section>
                    <h2>Sub-category Image</h2>
                    <div className="file-input-group">
                        <label>Upload New Image</label>
                        <input type="file" accept="image/*" onChange={(e) => setSubCategoryImageFile(e.target.files[0] || null)} />
                    </div>
                    <button type="button" onClick={handleSubCategoryImageUpdate} disabled={!subCategoryImageFile}>
                        Update Image
                    </button>
                </section>
            </div>

            <div className="category-list" style={{ marginTop: '2rem' }}>
                <h2>Sub-sub-categories inside {subCategory.name}</h2>
                <div className="category-content">
                    {subCategory.subSubCategories?.length ? (
                        subCategory.subSubCategories.map((subSub, idx) => (
                            <div key={`${subSub.name}-${idx}`} className="subcategory-item">
                                <div className="sub-info">
                                    {subSub.image ? (
                                        <img
                                            src={getImageUrl(subSub.image)}
                                            alt=""
                                            className="sub-img"
                                            onError={handleImageError(subSub.image)}
                                        />
                                    ) : (
                                        <div className="sub-img" aria-hidden="true" />
                                    )}
                                    <span className="sub-name">{subSub.name}</span>
                                </div>
                                <div className="node-actions">
                                    <label className="action-btn edit-btn">
                                        Change Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleSubSubImageUpdate(subSub.name, e.target.files[0])}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    <button className="action-btn edit-btn" onClick={() => goToProducts(subSub.name)}>Products</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ color: '#999' }}>No sub-sub-categories found for this sub-category.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubCategoryDetailPage;