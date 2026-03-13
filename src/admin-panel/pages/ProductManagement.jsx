import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../admin-panel.css'; 

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
        setSpecifications([...specifications, { title: '', fields: [{ name: '', values: [''] }] }]);
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
        updated[titleIndex].fields.push({ name: '', values: [''] });
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

    const handleValueChange = (titleIndex, fieldIndex, valueIndex, value) => {
        const updated = [...specifications];
        updated[titleIndex].fields[fieldIndex].values[valueIndex] = value;
        setSpecifications(updated);
    };

    const handleAddValue = (titleIndex, fieldIndex) => {
        const updated = [...specifications];
        updated[titleIndex].fields[fieldIndex].values.push('');
        setSpecifications(updated);
    };

    const handleRemoveValue = (titleIndex, fieldIndex, valueIndex) => {
        const updated = [...specifications];
        if (updated[titleIndex].fields[fieldIndex].values.length > 1) {
            updated[titleIndex].fields[fieldIndex].values = updated[titleIndex].fields[fieldIndex].values.filter((_, i) => i !== valueIndex);
            setSpecifications(updated);
        }
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
            quantity: '0',
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

            <form onSubmit={handleSubmit} className="admin-grid-main">
                {/* Left Column: Form Details */}
                <div className="form-left-col">
                    <section className="admin-card">
                        <div className="admin-card-title">
                            <span>General Information</span>
                            <button type="button" onClick={resetForm} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Reset Form</button>
                        </div>

                        <div className="admin-grid-3">
                            <div className="form-group">
                                <label>Product Name</label>
                                <input 
                                    className="form-control"
                                    placeholder="e.g. Luxury Velvet Sofa"
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>SKU Code</label>
                                <input 
                                    className="form-control"
                                    value={formData.sku} 
                                    readOnly
                                    style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Base Price ($)</label>
                                <input 
                                    type="number" 
                                    className="form-control"
                                    placeholder="0.00"
                                    value={formData.price} 
                                    onChange={e => setFormData({...formData, price: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Discount (%)</label>
                                <input 
                                    type="number" 
                                    className="form-control"
                                    value={formData.discount} 
                                    onChange={e => setFormData({...formData, discount: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Available Stock</label>
                                <input 
                                    type="number" 
                                    className="form-control"
                                    value={formData.quantity} 
                                    onChange={e => setFormData({...formData, quantity: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Parent Category</label>
                                <select 
                                    className="form-control"
                                    value={formData.categoryId} 
                                    onChange={e => setFormData({...formData, categoryId: e.target.value})} 
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Sub-category</label>
                                <select 
                                    className="form-control"
                                    value={formData.subCategoryName} 
                                    onChange={e => setFormData({...formData, subCategoryName: e.target.value})} 
                                    required
                                    disabled={!formData.categoryId}
                                >
                                    <option value="">Select Sub-category</option>
                                    {subCategories.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Collection</label>
                                <input 
                                    className="form-control"
                                    placeholder="Optional"
                                    value={formData.collectionName} 
                                    onChange={e => setFormData({...formData, collectionName: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Brand Reference</label>
                                <input 
                                    className="form-control"
                                    placeholder="Optional"
                                    value={formData.brandId} 
                                    onChange={e => setFormData({...formData, brandId: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Detailed Description</label>
                            <textarea 
                               className="form-control"
                               rows="5"
                               placeholder="Describe the product materials, craftsmanship, and features..."
                               value={formData.description} 
                               onChange={e => setFormData({...formData, description: e.target.value})} 
                               required 
                            />
                        </div>
                    </section>

                    <div className="spec-container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem', fontWeight: '800' }}>Specifications</h3>
                                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Add technical attributes like dimensions or fabric types.</p>
                            </div>
                            <button type="button" onClick={handleAddSpecTitle} className="btn-primary">
                                + Add Spec Group
                            </button>
                        </div>

                        {specifications.map((spec, sIdx) => (
                            <div key={sIdx} className="spec-group-card" style={{ border: '2px solid #f1f5f9' }}>
                                <div className="spec-group-header">
                                    <input 
                                        className="form-control"
                                        placeholder="Group Title (e.g. Dimensions)" 
                                        value={spec.title} 
                                        onChange={e => handleSpecTitleChange(sIdx, e.target.value)} 
                                        style={{ fontWeight: '700', flex: 1, border: 'none', background: '#f8fafc', paddingLeft: '15px' }}
                                    />
                                    <button type="button" onClick={() => handleRemoveSpecTitle(sIdx)} className="btn-secondary" style={{ color: '#ef4444', height: '40px' }}>
                                        Delete
                                    </button>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {spec.fields.map((field, fIdx) => (
                                        <div key={fIdx} className="spec-row" style={{ gridTemplateColumns: '150px 1fr 80px', padding: '15px' }}>
                                            <div>
                                                <span className="spec-label-tag">Label</span>
                                                <input 
                                                    className="form-control"
                                                    value={field.name} 
                                                    onChange={e => handleFieldChange(sIdx, fIdx, 'name', e.target.value)}
                                                    placeholder="e.g. Color" 
                                                    style={{ padding: '8px 12px' }}
                                                />
                                            </div>
                                            <div>
                                                <span className="spec-label-tag">Values</span>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {field.values.map((val, vIdx) => (
                                                        <div key={vIdx} className="spec-value-chip" style={{ background: '#f8fafc' }}>
                                                            <input 
                                                                value={val} 
                                                                onChange={e => handleValueChange(sIdx, fIdx, vIdx, e.target.value)}
                                                                style={{ background: 'transparent' }}
                                                            />
                                                            {field.values.length > 1 && (
                                                                <button type="button" onClick={() => handleRemoveValue(sIdx, fIdx, vIdx)}>×</button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button type="button" onClick={() => handleAddValue(sIdx, fIdx)} 
                                                            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px dashed #cbd5e1', background: '#fff', fontSize: '0.8rem' }}>
                                                        + Add
                                                    </button>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', paddingTop: '24px' }}>
                                                <button type="button" onClick={() => handleRemoveField(sIdx, fIdx)} style={{ color: '#ef4444', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={() => handleAddField(sIdx)} style={{ marginTop: '16px', width: '100%', padding: '10px', background: '#fff', color: '#4f46e5', border: '2px solid #eef2ff', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                                    + Add Attribute
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Media and Actions */}
                <div className="form-right-col">
                    <section className="admin-card">
                        <div className="admin-card-title">Media</div>
                        <div className="form-group">
                            <label>Product Hero Image</label>
                            <div className="image-upload-wrapper" 
                                 onClick={() => document.getElementById('imageInput').click()}>
                                <input id="imageInput" type="file" onChange={e => setProductImage(e.target.files[0])} style={{ display: 'none' }} />
                                {productImage ? (
                                    <div className="image-selection-preview">
                                        <img src={URL.createObjectURL(productImage)} alt="Preview" />
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{productImage.name}</p>
                                        <span style={{ color: '#4f46e5', fontWeight: '600', fontSize: '0.85rem' }}>Change Image</span>
                                    </div>
                                ) : (
                                    <div style={{ color: '#94a3b8' }}>
                                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>🖼️</span>
                                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>Drop image here or click</p>
                                        <p style={{ margin: '5px 0 0', fontSize: '0.8rem' }}>Supports JPG, PNG, AVIF</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button type="submit" className="btn-publish">
                            Publish Product
                        </button>
                    </section>
                </div>
            </form>

            <div className="product-inventory-list" style={{ marginTop: '4rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Inventory Catalog
                    <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'normal', background: '#f1f5f9', padding: '5px 15px', borderRadius: '20px' }}>Total: {products.length}</span>
                </h2>
                <div className="inventory-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '20px' }}>
                    {products.map(prod => (
                        <div key={prod._id} className="category-node" style={{ borderRadius: '20px', border: '1px solid #f1f5f9', background: 'white', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '20px' }}>
                            <div className="cat-info" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                                <img src={`${backendRoot}/${prod.image}`} alt="" style={{ width: '100px', height: '100px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #f1f5f9' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>{prod.name}</h3>
                                        <button className="btn-secondary" style={{ color: '#ef4444', padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleDelete(prod._id)}>Delete</button>
                                    </div>
                                    <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#64748b', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <span><b>SKU:</b> {prod.sku}</span>
                                        <span><b>Stock:</b> {prod.quantity || 0}</span>
                                        <span style={{ gridColumn: 'span 2' }}><b>Category:</b> {prod.category?.name} / {prod.subCategoryName}</span>
                                        <span style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '800' }}>${prod.price}</span>
                                    </div>
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