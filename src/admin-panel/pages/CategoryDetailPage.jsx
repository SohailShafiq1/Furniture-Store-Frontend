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
    const [shopByCategoryName, setShopByCategoryName] = useState('');
    const [showInShopByCategory, setShowInShopByCategory] = useState(true);
    const [categoryImageFile, setCategoryImageFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { token } = useAdminAuth();
    const navigate = useNavigate();

    const apiEndpoint = `${API_BASE_URL}/categories`;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const multipartConfig = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };

    const goToProducts = (subCategoryName = '', subSubCategoryName = '') => {
        const params = new URLSearchParams();
        if (subCategoryName) params.set('subCategoryName', subCategoryName);
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

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await axios.get(`${apiEndpoint}/all`, config);
                const found = res.data.find(c => c._id === categoryId);
                if (found) {
                    setCategory(found);
                    setEditedName(found.name);
                    setShopByCategoryName(found.shopByCategoryName || '');
                    setShowInShopByCategory(found.showInShopByCategory !== false);
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

    const handleShopByUpdate = async () => {
        try {
            await axios.put(`${apiEndpoint}/${categoryId}`, {
                showInShopByCategory,
                shopByCategoryName: shopByCategoryName.trim()
            }, config);
            setCategory({
                ...category,
                showInShopByCategory,
                shopByCategoryName: shopByCategoryName.trim()
            });
            setMessage('Shop by Category settings updated');
        } catch (err) {
            setError('Failed to update Shop by Category settings');
        }
    };

    const handleCategoryImageUpdate = async () => {
        if (!categoryImageFile) return;
        try {
            const formData = new FormData();
            formData.append('image', categoryImageFile);

            const res = await axios.put(`${apiEndpoint}/${categoryId}`, formData, multipartConfig);
            setCategory(res.data);
            setCategoryImageFile(null);
            setMessage('Category image updated');
        } catch (err) {
            setError('Failed to update category image');
        }
    };

    if (!category) return <div className="category-management">Loading...</div>;

    return (
        <div className="category-management">
            <button className="action-btn edit-btn" onClick={() => navigate('/admin/categories')}>← Back to Catalog</button>
            {message && <div className="success-toast" onClick={() => setMessage('')}>{message}</div>}
            {error && <div className="error-toast" onClick={() => setError('')}>{error}</div>}
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
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="action-btn edit-btn" onClick={() => goToProducts()}>View Products</button>
                                    <button className="action-btn edit-btn" onClick={() => setEditMode(true)}>Rename Category</button>
                                </div>
                            </div>
                        )}
                        <p style={{ color: '#666' }}>{category.subCategories.length} Sub-categories found</p>
                    </div>
                </div>
            </div>

            <div className="management-sections" style={{ marginTop: '2rem' }}>
                <section>
                    <h2>Category Image</h2>
                    <div className="file-input-group">
                        <label>Upload New Image</label>
                        <input type="file" accept="image/*" onChange={(e) => setCategoryImageFile(e.target.files[0] || null)} />
                    </div>
                    <button type="button" onClick={handleCategoryImageUpdate} disabled={!categoryImageFile}>
                        Update Image
                    </button>
                </section>
                <section>
                    <h2>Shop by Category Settings</h2>
                    <label className="shopby-toggle">
                        <input
                            type="checkbox"
                            checked={showInShopByCategory}
                            onChange={(e) => setShowInShopByCategory(e.target.checked)}
                        />
                        Show in Shop by Category
                    </label>
                    <input
                        className="shopby-input"
                        value={shopByCategoryName}
                        onChange={(e) => setShopByCategoryName(e.target.value)}
                        placeholder="Shop by Category label (optional)"
                    />
                    <button type="button" onClick={handleShopByUpdate}>
                        Save Settings
                    </button>
                </section>
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
                                    <button className="action-btn edit-btn" onClick={(e) => {
                                        e.stopPropagation();
                                        goToProducts(sub.name);
                                    }}>Products</button>
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