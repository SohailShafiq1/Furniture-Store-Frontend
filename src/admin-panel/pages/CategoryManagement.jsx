import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import './CategoryManagement.css';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [catImage, setCatImage] = useState(null);
    const [subCatImage, setSubCatImage] = useState(null);
    const [subSubCatImage, setSubSubCatImage] = useState(null);
    const [subCategoryData, setSubCategoryData] = useState({ categoryId: '', name: '' });
    const [subSubCategoryData, setSubSubCategoryData] = useState({ categoryId: '', subCategoryName: '', name: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { token } = useAdminAuth();
    const navigate = useNavigate();

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
            setMessage('Category created successfully!');
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
            setMessage('Sub-category added successfully!');
            setSubCategoryData({ categoryId: '', name: '' });
            setSubCatImage(null);
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Error adding sub-category');
        }
    };

    const handleAddSubSubCategory = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('categoryId', subSubCategoryData.categoryId);
            formData.append('subCategoryName', subSubCategoryData.subCategoryName);
            formData.append('name', subSubCategoryData.name);
            if (subSubCatImage) formData.append('image', subSubCatImage);

            await axios.post(`${apiEndpoint}/add-sub-subcategory`, formData, multipartConfig);
            setMessage('Sub-sub-category added successfully!');
            setSubSubCategoryData({ categoryId: '', subCategoryName: '', name: '' });
            setSubSubCatImage(null);
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Error adding sub-sub-category');
        }
    };

    const handleDeleteMain = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure? This will delete the main category and all its contents.')) return;
        try {
            await axios.delete(`${apiEndpoint}/${id}`, config);
            setMessage('Category deleted');
            fetchCategories();
        } catch (err) {
            setError('Error deleting category');
        }
    };

    return (
        <div className="category-management">
            <h1>Catalog Management</h1>
            {message && <div className="success-toast" onClick={() => setMessage('')}>{message}</div>}
            {error && <div className="error-toast" onClick={() => setError('')}>{error}</div>}

            <div className="management-sections">
                <section>
                    <h2>New Main Category</h2>
                    <form onSubmit={handleCreateCategory} className="admin-form">
                        <input 
                            value={newCategory} 
                            onChange={(e) => setNewCategory(e.target.value)} 
                            placeholder="Category Name (e.g. Bedrooms)" 
                            required 
                        />
                        <div className="file-input-group">
                            <label>Display Image</label>
                            <input type="file" onChange={(e) => setCatImage(e.target.files[0])} required />
                        </div>
                        <button type="submit">Create Category</button>
                    </form>
                </section>

                <section>
                    <h2>New Sub-Category</h2>
                    <form onSubmit={handleAddSubCategory} className="admin-form">
                        <select 
                            value={subCategoryData.categoryId} 
                            onChange={(e) => setSubCategoryData({...subCategoryData, categoryId: e.target.value})}
                            required
                        >
                            <option value="">Select Parent</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                        <input 
                            value={subCategoryData.name} 
                            onChange={(e) => setSubCategoryData({...subCategoryData, name: e.target.value})} 
                            placeholder="Sub-category Name (e.g. Nightstands)" 
                            required 
                        />
                        <div className="file-input-group">
                            <label>Display Image</label>
                            <input type="file" onChange={(e) => setSubCatImage(e.target.files[0])} required />
                        </div>
                        <button type="submit">Add Sub-Category</button>
                    </form>
                </section>

                <section>
                    <h2>New Sub-Sub-Category</h2>
                    <form onSubmit={handleAddSubSubCategory} className="admin-form">
                        <select 
                            value={subSubCategoryData.categoryId} 
                            onChange={(e) => setSubSubCategoryData({...subSubCategoryData, categoryId: e.target.value, subCategoryName: ''})}
                            required
                        >
                            <option value="">Select Parent</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                        <select 
                            value={subSubCategoryData.subCategoryName} 
                            onChange={(e) => setSubSubCategoryData({...subSubCategoryData, subCategoryName: e.target.value})}
                            required
                            disabled={!subSubCategoryData.categoryId}
                        >
                            <option value="">Select Sub-category</option>
                            {categories.find(c => c._id === subSubCategoryData.categoryId)?.subCategories.map(sub => (
                                <option key={sub.name} value={sub.name}>{sub.name}</option>
                            ))}
                        </select>
                        <input 
                            value={subSubCategoryData.name} 
                            onChange={(e) => setSubSubCategoryData({...subSubCategoryData, name: e.target.value})} 
                            placeholder="Sub-sub-category Name" 
                            required 
                        />
                        <div className="file-input-group">
                            <label>Display Image (Optional)</label>
                            <input type="file" onChange={(e) => setSubSubCatImage(e.target.files[0])} />
                        </div>
                        <button type="submit">Add Sub-Sub-Category</button>
                    </form>
                </section>
            </div>

            <div className="category-list">
                <h2>Product Taxonomy</h2>
                <div className="category-accordion">
                    {categories.map(cat => (
                        <div key={cat._id} className="category-node" style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/category/${cat._id}`)}>
                            <div className="category-header">
                                <div className="cat-info">
                                    <img src={`${backendRoot}/${cat.image}`} alt="" className="cat-main-img" />
                                    <div className="cat-name-box">
                                        <h3>{cat.name}</h3>
                                        <span className="sub-count">{cat.subCategories.length} Sub-categories (Click to open)</span>
                                    </div>
                                </div>
                                <div className="node-actions" onClick={(e) => e.stopPropagation()}>
                                    <button className="action-btn delete-btn" onClick={(e) => handleDeleteMain(cat._id, e)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryManagement;