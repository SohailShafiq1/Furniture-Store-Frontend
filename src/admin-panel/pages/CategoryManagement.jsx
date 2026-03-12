import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import './CategoryManagement.css';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [catImage, setCatImage] = useState(null);
    const [subCatImage, setSubCatImage] = useState(null);
    const [subCategoryData, setSubCategoryData] = useState({ categoryId: '', name: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { token } = useAdminAuth();

    // Endpoints
    const apiEndpoint = `${import.meta.env.VITE_API_URL}/categories`;
    const backendRoot = import.meta.env.VITE_API_URL.replace('/api', '');

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const multipartConfig = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${apiEndpoint}/all`, config);
            setCategories(res.data);
        } catch (err) {
            setError('Failed to fetch categories');
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', newCategory);
            formData.append('image', catImage);

            await axios.post(`${apiEndpoint}/create`, formData, multipartConfig);
            setMessage('Category created!');
            setNewCategory('');
            setCatImage(null);
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating category');
        }
    };

    const handleAddSubCategory = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('categoryId', subCategoryData.categoryId);
            formData.append('name', subCategoryData.name);
            formData.append('image', subCatImage);

            await axios.post(`${apiEndpoint}/add-subcategory`, formData, multipartConfig);
            setMessage('Sub-category added!');
            setSubCategoryData({ categoryId: '', name: '' });
            setSubCatImage(null);
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Error adding sub-category');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete category?')) return;
        try {
            await axios.delete(`${apiEndpoint}/${id}`, config);
            fetchCategories();
        } catch (err) {
            setError('Error deleting category');
        }
    };

    return (
        <div className="category-management">
            <h1>Category Management</h1>
            {message && <div className="success-toast">{message}</div>}
            {error && <div className="error-toast">{error}</div>}

            <div className="management-sections">
                <section>
                    <h2>Add Main Category</h2>
                    <form onSubmit={handleCreateCategory} className="admin-form">
                        <input 
                            value={newCategory} 
                            onChange={(e) => setNewCategory(e.target.value)} 
                            placeholder="e.g. Living Room" 
                            required 
                        />
                        <div className="file-input-group">
                            <label>Category Image</label>
                            <input type="file" onChange={(e) => setCatImage(e.target.files[0])} required />
                        </div>
                        <button type="submit">Create Category</button>
                    </form>
                </section>

                <section>
                    <h2>Add Sub-Category</h2>
                    <form onSubmit={handleAddSubCategory} className="admin-form">
                        <select 
                            value={subCategoryData.categoryId} 
                            onChange={(e) => setSubCategoryData({...subCategoryData, categoryId: e.target.value})}
                            required
                        >
                            <option value="">Select Parent Category</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                        <input 
                            value={subCategoryData.name} 
                            onChange={(e) => setSubCategoryData({...subCategoryData, name: e.target.value})} 
                            placeholder="e.g. Coffee Tables" 
                            required 
                        />
                        <div className="file-input-group">
                            <label>Sub-category Image</label>
                            <input type="file" onChange={(e) => setSubCatImage(e.target.files[0])} required />
                        </div>
                        <button type="submit">Add Sub-Category</button>
                    </form>
                </section>
            </div>

            <div className="category-list">
                <h2>Product Categories Overview</h2>
                <div className="category-grid">
                    {categories.map(cat => (
                        <div key={cat._id} className="category-item-card">
                            <div className="card-header">
                                <div className="title-with-img">
                                    <img src={`${backendRoot}/${cat.image}`} alt={cat.name} className="cat-thumb" />
                                    <h3>{cat.name}</h3>
                                </div>
                                <button className="delete-btn" onClick={() => handleDelete(cat._id)}>Remove</button>
                            </div>
                            <div className="card-body">
                                <h4>Sub-Categories</h4>
                                {cat.subCategories.length > 0 ? (
                                    <div className="subcat-list">
                                        {cat.subCategories.map((sub, i) => (
                                            <div key={i} className="subcat-chip">
                                                <img src={`${backendRoot}/${sub.image}`} alt={sub.name} className="subcat-thumb" />
                                                <span>{sub.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ fontSize: '0.85rem', color: '#ccc', fontStyle: 'italic' }}>No sub-categories added yet.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryManagement;