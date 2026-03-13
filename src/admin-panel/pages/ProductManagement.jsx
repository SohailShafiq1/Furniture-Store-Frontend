import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import './CategoryManagement.css'; // Reusing general styles

const ProductManagement = () => {
    const { token } = useAdminAuth();
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    // Form State
    const [subCategories, setSubCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        sku: 'SKU-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        price: '',
        discount: '0',
        description: '',
        categoryId: '',
        subCategoryName: '',
        collectionName: '',
        brandId: ''
    });
    const [productImage, setProductImage] = useState(null);

    // Dynamic Fields (Specifications)
    const [specifications, setSpecifications] = useState([]);

    const apiBase = import.meta.env.VITE_API_URL;
    const backendRoot = apiBase.replace('/api', '');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const multipartConfig = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [catsRes, productsRes] = await Promise.all([
                axios.get(`${apiBase}/categories/all`, config),
                axios.get(`${apiBase}/products/all`, config)
            ]);
            setCategories(catsRes.data);
            setProducts(productsRes.data);
        } catch (err) {
            setError('Failed to load data');
        }
    };

    // Update subcategories when parent category changes
    useEffect(() => {
        if (formData.categoryId) {
            const selected = categories.find(c => c._id === formData.categoryId);
            setSubCategories(selected ? selected.subCategories : []);
        } else {
            setSubCategories([]);
        }
    }, [formData.categoryId, categories]);

    const handleAddSpecTitle = () => {
        setSpecifications([...specifications, { title: '', fields: [{ name: '', value: '' }] }]);
    };

    const handleRemoveSpecTitle = (index) => {
        setSpecifications(specifications.filter((_, i) => i !== index));
    };

    const handleSpecTitleChange = (index, value) => {
        const updated = [...specifications];
        updated[index].title = value;
        setSpecifications(updated);
    };

    const handleAddField = (titleIndex) => {
        const updated = [...specifications];
        updated[titleIndex].fields.push({ name: '', value: '' });
        setSpecifications(updated);
    };

    const handleRemoveField = (titleIndex, fieldIndex) => {
        const updated = [...specifications];
        updated[titleIndex].fields = updated[titleIndex].fields.filter((_, i) => i !== fieldIndex);
        setSpecifications(updated);
    };

    const handleFieldChange = (titleIndex, fieldIndex, key, value) => {
        const updated = [...specifications];
        updated[titleIndex].fields[fieldIndex][key] = value;
        setSpecifications(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const fd = new FormData();
            Object.keys(formData).forEach(key => fd.append(key, formData[key]));
            fd.append('image', productImage);
            fd.append('specifications', JSON.stringify(specifications));

            await axios.post(`${apiBase}/products/add`, fd, multipartConfig);
            setMessage('Product added successfully!');
            resetForm();
            fetchInitialData();
        } catch (err) {
            setError(err.response?.data?.message || 'Error adding product');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            sku: 'SKU-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            price: '',
            discount: '0',
            description: '',
            categoryId: '',
            subCategoryName: '',
            collectionName: '',
            brandId: ''
        });
        setProductImage(null);
        setSpecifications([]);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await axios.delete(`${apiBase}/products/${id}`, config);
            fetchInitialData();
        } catch (err) {
            setError('Delete failed');
        }
    };

    return (
        <div className="category-management">
            <h1>Product Inventory Management</h1>
            {message && <div className="success-toast">{message}</div>}
            {error && <div className="error-toast">{error}</div>}

            <section style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h2>Create New Product</h2>
                <form onSubmit={handleSubmit} className="admin-form">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="file-input-group">
                            <label>Product Name</label>
                            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        </div>
                        <div className="file-input-group">
                            <label>SKU / Product Code</label>
                            <input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                        </div>
                        <div className="file-input-group">
                            <label>Price ($)</label>
                            <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                        </div>
                        <div className="file-input-group">
                            <label>Discount (%)</label>
                            <input type="number" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} />
                        </div>
                        <div className="file-input-group">
                            <label>Parent Category</label>
                            <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="file-input-group">
                            <label>Sub-category</label>
                            <select value={formData.subCategoryName} onChange={e => setFormData({...formData, subCategoryName: e.target.value})} required>
                                <option value="">Select Sub-category</option>
                                {subCategories.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="file-input-group">
                            <label>Collection (Optional)</label>
                            <input value={formData.collectionName} onChange={e => setFormData({...formData, collectionName: e.target.value})} />
                        </div>
                        <div className="file-input-group">
                            <label>Brand ID (Optional)</label>
                            <input value={formData.brandId} onChange={e => setFormData({...formData, brandId: e.target.value})} />
                        </div>
                    </div>

                    <div className="file-input-group" style={{ margin: '15px 0' }}>
                        <label>Short Description</label>
                        <textarea 
                           style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                           rows="3"
                           value={formData.description} 
                           onChange={e => setFormData({...formData, description: e.target.value})} 
                           required 
                        />
                    </div>

                    <div className="file-input-group">
                        <label>Hero Product Image</label>
                        <input type="file" onChange={e => setProductImage(e.target.files[0])} required />
                    </div>

                    <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: '#333' }}>Advanced Specifications</h3>
                            <button type="button" onClick={handleAddSpecTitle} style={{ background: '#27ae60', padding: '8px 16px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>+ Add Specification Group</button>
                        </div>

                        {specifications.map((spec, sIdx) => (
                            <div key={sIdx} style={{ background: 'white', padding: '20px', marginBottom: '20px', borderRadius: '10px', border: '1px solid #ddd', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '15px', alignItems: 'center' }}>
                                    <input 
                                        placeholder="Group Title (e.g. Dimensions)" 
                                        value={spec.title} 
                                        onChange={e => handleSpecTitleChange(sIdx, e.target.value)} 
                                        style={{ flex: 1, padding: '12px', border: '2px solid #eee', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', color: '#000000', background: '#ffffff', minWidth: '200px' }}
                                    />
                                    <button type="button" onClick={() => handleRemoveSpecTitle(sIdx)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Remove Group</button>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {spec.fields.map((field, fIdx) => (
                                        <div key={fIdx} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', padding: '10px', background: '#fcfcfc', borderRadius: '8px' }}>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <label style={{ fontSize: '0.8rem', color: '#555', fontWeight: 'bold' }}>Label (e.g. Width)</label>
                                                <input 
                                                    placeholder="Label" 
                                                    value={field.name} 
                                                    onChange={e => handleFieldChange(sIdx, fIdx, 'name', e.target.value)} 
                                                    style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', color: '#000000', background: '#ffffff', fontSize: '0.9rem' }}
                                                />
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <label style={{ fontSize: '0.8rem', color: '#555', fontWeight: 'bold' }}>Value (e.g. 100cm)</label>
                                                <input 
                                                    placeholder="Value" 
                                                    value={field.value} 
                                                    onChange={e => handleFieldChange(sIdx, fIdx, 'value', e.target.value)} 
                                                    style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', color: '#000000', background: '#ffffff', fontSize: '0.9rem' }}
                                                />
                                            </div>
                                            <button type="button" onClick={() => handleRemoveField(sIdx, fIdx)} style={{ background: '#f8f9fa', border: '1px solid #ddd', color: '#e74c3c', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>×</button>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={() => handleAddField(sIdx)} style={{ marginTop: '20px', background: '#3498db', padding: '10px 20px', color: 'white', border: 'none', fontSize: '0.9rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', width: '100%' }}>+ Add Row to {spec.title || 'this group'}</button>
                            </div>
                        ))}
                    </div>

                    <button type="submit" style={{ marginTop: '20px', padding: '15px', fontSize: '1.1rem' }}>Publish Product</button>
                </form>
            </section>

            <div className="category-list" style={{ marginTop: '3rem' }}>
                <h2>Recently Added Products</h2>
                <div className="category-accordion">
                    {products.map(prod => (
                        <div key={prod._id} className="category-node">
                            <div className="category-header">
                                <div className="cat-info">
                                    <img src={`${backendRoot}/${prod.image}`} alt="" className="cat-main-img" />
                                    <div className="cat-name-box">
                                        <h3>{prod.name}</h3>
                                        <span className="sub-count">{prod.sku} | {prod.category?.name} → {prod.subCategoryName} | ${prod.price}</span>
                                    </div>
                                </div>
                                <div className="node-actions">
                                    <button className="action-btn delete-btn" onClick={() => handleDelete(prod._id)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;