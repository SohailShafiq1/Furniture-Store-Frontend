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
    
    // Search and Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubCat, setFilterSubCat] = useState('');
    const [priceSort, setPriceSort] = useState(''); // 'low', 'high', ''

    // Use separate states for editing to avoid trigger resets
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [subCategories, setSubCategories] = useState([]);
    const [subSubCategories, setSubSubCategories] = useState([]);
    
    const [formData, setFormData] = useState({
        name: '',
        sku: 'SKU-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        price: '',
        discount: '0',
        quantity: '0',
        description: '',
        categoryId: '',
        subCategoryName: '',
        subSubCategoryName: '',
        collectionName: '',
        brandId: ''
    });
    const [productImages, setProductImages] = useState([]); // Array for multiple images

    // Dynamic Fields (Specifications)
    const [specifications, setSpecifications] = useState([]);
    
    // Product Variations
    const [variations, setVariations] = useState([]);
    
    // Track existing images separately from new images
    const [existingImages, setExistingImages] = useState([]);

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

    const handleCategoryChange = (catId) => {
        const selected = categories.find(c => c._id === catId);
        setSubCategories(selected ? selected.subCategories : []);
        setFormData(prev => ({ 
            ...prev, 
            categoryId: catId, 
            subCategoryName: '', 
            subSubCategoryName: '' 
        }));
        setSubSubCategories([]);
    };

    const handleSubCategoryChange = (subName) => {
        const parent = categories.find(c => c._id === formData.categoryId);
        const sub = parent?.subCategories.find(s => s.name === subName);
        setSubSubCategories(sub?.subSubCategories || []);
        setFormData(prev => ({ 
            ...prev, 
            subCategoryName: subName, 
            subSubCategoryName: '' 
        }));
    };

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

    // Variations Handlers
    const handleAddVariation = () => {
        setVariations([...variations, { name: '', price: '' }]);
    };

    const handleRemoveVariation = (index) => {
        setVariations(variations.filter((_, i) => i !== index));
    };

    const handleVariationChange = (index, key, value) => {
        const updated = [...variations];
        updated[index][key] = value === null ? '' : value;
        setVariations(updated);
    };

    const handleEditClick = (prod) => {
        setIsEditing(true);
        setCurrentProductId(prod._id);
        
        // Populate categories/subs first so the dropdowns have options to match against
        if (prod.category?._id) {
            const selected = categories.find(c => c._id === prod.category._id);
            const subs = selected ? selected.subCategories : [];
            setSubCategories(subs);
            
            if (prod.subCategoryName) {
                const sub = subs.find(s => s.name === prod.subCategoryName);
                setSubSubCategories(sub?.subSubCategories || []);
            }
        }

        // Populate form with product data
        setFormData({
            name: prod.name || '',
            sku: prod.sku || '',
            price: prod.price || '',
            discount: prod.discount || '0',
            quantity: prod.quantity || '0',
            description: prod.description || '',
            categoryId: prod.category?._id || '',
            subCategoryName: prod.subCategoryName || '',
            subSubCategoryName: prod.subSubCategoryName || '',
            collectionName: prod.collectionName || '',
            brandId: prod.brandId || ''
        });
        
        // Handle specifications safely
        let specs = [];
        try {
            specs = typeof prod.specifications === 'string' 
                ? JSON.parse(prod.specifications) 
                : (prod.specifications || []);
        } catch (e) {
            specs = [];
        }
        setSpecifications(specs);
        
        // Handle variations safely
        let vars = [];
        try {
            vars = typeof prod.variations === 'string' 
                ? JSON.parse(prod.variations) 
                : (prod.variations || []);
        } catch (e) {
            vars = [];
        }
        setVariations(vars);
        
        // Load existing images
        const existingImgs = prod.images && prod.images.length > 0 
            ? prod.images 
            : (prod.image ? [prod.image] : []);
        setExistingImages(existingImgs);
        setProductImages([]); // Reset new images array
        
        // Scroll to form for immediate visibility
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Filter Logic
    const filteredProducts = products.filter(prod => {
        const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            prod.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubCat = filterSubCat === '' || prod.subCategoryName === filterSubCat;
        return matchesSearch && matchesSubCat;
    }).sort((a, b) => {
        if (priceSort === 'low') return a.price - b.price;
        if (priceSort === 'high') return b.price - a.price;
        return 0; // Default: Order by creation/fetch
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Only require images for new products (no existing images)
        if (!isEditing && productImages.length === 0) {
            setError('Please upload at least one product image');
            return;
        }

        try {
            const fd = new FormData();
            Object.keys(formData).forEach(key => fd.append(key, formData[key]));
            
            // Only send new images if they were added
            if (productImages.length > 0) {
                productImages.forEach(img => {
                    fd.append('images', img);
                });
            }
            
            // For editing, if no new images, send the existing image paths to preserve them
            if (isEditing && productImages.length === 0 && existingImages.length > 0) {
                existingImages.forEach(imgPath => {
                    fd.append('existingImages', imgPath);
                });
            }
            
            // Always send variations for both new and edit
            const variationsJSON = JSON.stringify(variations);
            fd.append('specifications', JSON.stringify(specifications));
            fd.append('variations', variationsJSON);
            
            console.log('Submitting with variations:', variations, 'JSON:', variationsJSON);

            if (isEditing) {
                await axios.put(`${apiBase}/products/${currentProductId}`, fd, multipartConfig);
                setMessage('Product updated successfully!');
            } else {
                await axios.post(`${apiBase}/products/add`, fd, multipartConfig);
                setMessage('Product added successfully!');
            }

            resetForm();
            fetchInitialData();
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.response?.data?.message || 'Error saving product');
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentProductId(null);
        setFormData({
            name: '',
            sku: 'SKU-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            price: '',
            discount: '0',
            quantity: '0',
            description: '',
            categoryId: '',
            subCategoryName: '',
            subSubCategoryName: '',
            collectionName: '',
            brandId: ''
        });
        setProductImages([]);
        setExistingImages([]);
        setSpecifications([]);
        setVariations([]);
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span style={{ 
                                    padding: '6px 12px', 
                                    background: isEditing ? '#4f46e5' : '#0f172a', 
                                    color: 'white', 
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    fontWeight: '700'
                                }}>
                                    {isEditing ? 'EDITING PRODUCT' : 'CREATE NEW'}
                                </span>
                                <span>{isEditing ? `Modifying: ${formData.name}` : 'General Information'}</span>
                            </div>
                            <button type="button" onClick={resetForm} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                                {isEditing ? 'Cancel Edit' : 'Reset Form'}
                            </button>
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
                                    value={formData.categoryId || ''} 
                                    onChange={e => handleCategoryChange(e.target.value)} 
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
                                    value={formData.subCategoryName || ''} 
                                    onChange={e => handleSubCategoryChange(e.target.value)} 
                                    required
                                    disabled={!formData.categoryId}
                                >
                                    <option value="">Select Sub-category</option>
                                    {subCategories.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Sub-Sub-Category</label>
                                <select 
                                    className="form-control"
                                    value={formData.subSubCategoryName || ''} 
                                    onChange={e => setFormData({...formData, subSubCategoryName: e.target.value})} 
                                    disabled={!formData.subCategoryName}
                                >
                                    <option value="">Select Sub-Sub-Category (Optional)</option>
                                    {subSubCategories.map((ss, i) => <option key={i} value={ss.name}>{ss.name}</option>)}
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
                                                                style={{ background: 'transparent', color: '#0f172a', fontWeight: '500' }}
                                                            />
                                                            {field.values.length > 1 && (
                                                                <button type="button" onClick={() => handleRemoveValue(sIdx, fIdx, vIdx)}>×</button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button type="button" onClick={() => handleAddValue(sIdx, fIdx)} className="spec-add-value-btn">
                                                        + Add Val
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

                {/* Variations Section */}
                <div className="spec-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem', fontWeight: '800' }}>Product Variations</h3>
                            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Add different variations like sizes, colors, etc. with their own prices.</p>
                        </div>
                        <button type="button" onClick={handleAddVariation} className="btn-primary">
                            + Add Variation
                        </button>
                    </div>

                    {variations.length === 0 ? (
                        <div style={{ 
                            padding: '40px 20px', 
                            textAlign: 'center', 
                            background: '#f8fafc', 
                            borderRadius: '12px', 
                            border: '2px dashed #e2e8f0',
                            color: '#94a3b8'
                        }}>
                            <p style={{ margin: 0, fontSize: '1rem' }}>No variations added yet. Click "Add Variation" to add product variations.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {variations.map((variation, idx) => (
                                <div key={idx} className="spec-group-card" style={{ border: '2px solid #f1f5f9', padding: '20px', borderRadius: '12px', background: '#fff' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '16px', alignItems: 'flex-start' }}>
                                        <div className="form-group">
                                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px', display: 'block' }}>Variation Name</label>
                                            <input 
                                                className="form-control"
                                                placeholder="e.g. Queen, Red, Leather"
                                                value={variation.name}
                                                onChange={(e) => handleVariationChange(idx, 'name', e.target.value)}
                                                style={{ marginBottom: '0' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px', display: 'block' }}>Price ($)</label>
                                            <input 
                                                type="number"
                                                className="form-control"
                                                placeholder="0.00"
                                                value={variation.price}
                                                onChange={(e) => handleVariationChange(idx, 'price', e.target.value)}
                                                style={{ marginBottom: '0' }}
                                            />
                                        </div>
                                        <div style={{ paddingTop: '28px' }}>
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveVariation(idx)}
                                                style={{ 
                                                    width: '100%',
                                                    padding: '8px', 
                                                    background: '#fee2e2', 
                                                    color: '#dc2626', 
                                                    border: 'none', 
                                                    borderRadius: '6px', 
                                                    fontWeight: '600', 
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Media and Actions */}
                <div className="form-right-col">
                    <section className="admin-card">
                        <div className="admin-card-title">Media</div>
                        <div className="form-group">
                            <label>Product Images (Multiple Images Supported)</label>
                            <div className="image-upload-wrapper" 
                                 onClick={() => document.getElementById('imageInput').click()}>
                                <input 
                                    id="imageInput" 
                                    type="file" 
                                    multiple 
                                    onChange={e => setProductImages([...productImages, ...Array.from(e.target.files)])} 
                                    style={{ display: 'none' }} 
                                />
                                {existingImages.length > 0 || productImages.length > 0 ? (
                                    <div className="images-selection-preview">
                                        {existingImages.length > 0 && (
                                            <div style={{ marginBottom: '16px' }}>
                                                <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    ✓ Current Images ({existingImages.length})
                                                </p>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                                                    {existingImages.map((imgPath, idx) => (
                                                        <div key={idx} style={{ position: 'relative' }}>
                                                            <img 
                                                                src={`${backendRoot}/${imgPath}`} 
                                                                alt={`Existing ${idx + 1}`}
                                                                style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '5px', border: idx === 0 ? '2px solid #10b981' : '1px solid #d1d5db' }}
                                                            />
                                                            {idx === 0 && <span style={{ position: 'absolute', top: '2px', right: '2px', background: '#10b981', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '3px' }}>Main</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {productImages.length > 0 && (
                                            <div>
                                                <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    ⬆ New Images ({productImages.length})
                                                </p>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                                                    {productImages.map((img, idx) => (
                                                        <div key={idx} style={{ position: 'relative' }}>
                                                            <img 
                                                                src={URL.createObjectURL(img)} 
                                                                alt={`New ${idx + 1}`}
                                                                style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '5px', border: '2px solid #f59e0b' }}
                                                            />
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setProductImages(productImages.filter((_, i) => i !== idx));
                                                                }}
                                                                style={{ position: 'absolute', top: '0', right: '0', background: '#f44336', color: 'white', border: 'none', borderRadius: '0 5px 0 3px', padding: '2px 4px', cursor: 'pointer', fontSize: '12px' }}
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <span style={{ color: '#4f46e5', fontWeight: '600', fontSize: '0.85rem' }}>
                                            {productImages.length > 0 ? 'Add More Images' : 'Replace Images'}
                                        </span>
                                    </div>
                                ) : (
                                    <div style={{ color: '#94a3b8' }}>
                                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>🖼️</span>
                                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>Drop images here or click</p>
                                        <p style={{ margin: '5px 0 0', fontSize: '0.8rem' }}>Supports JPG, PNG, AVIF. Add multiple images for gallery</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button type="submit" className="btn-publish" style={{
                            background: isEditing ? '#4f46e5' : '#0f172a'
                        }}>
                            {isEditing ? '💾 Update Product Changes' : '🚀 Publish Product'}
                        </button>
                    </section>
                </div>
            </form>

            <div className="product-inventory-list" style={{ marginTop: '4rem' }}>
                <div style={{ background: '#fff', padding: '25px', borderRadius: '24px', border: '1px solid #f1f5f9', marginBottom: '25px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Inventory Catalog
                        <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'normal', background: '#f1f5f9', padding: '5px 15px', borderRadius: '20px' }}>Showing {filteredProducts.length} Of {products.length}</span>
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <input 
                                className="form-control" 
                                placeholder="Search by name or SKU..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ border: '2px solid #f1f5f9' }}
                            />
                        </div>
                        <div className="form-group">
                            <select 
                                className="form-control" 
                                value={filterSubCat}
                                onChange={(e) => setFilterSubCat(e.target.value)}
                                style={{ border: '2px solid #f1f5f9' }}
                            >
                                <option value="">Filter By Sub-category</option>
                                {/* Get all unique subcats from actual products */}
                                {[...new Set(products.map(p => p.subCategoryName))].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <select 
                                className="form-control" 
                                value={priceSort}
                                onChange={(e) => setPriceSort(e.target.value)}
                                style={{ border: '2px solid #f1f5f9' }}
                            >
                                <option value="">Sort By Price</option>
                                <option value="low">Price: Low to High</option>
                                <option value="high">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="inventory-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '20px' }}>
                    {filteredProducts.map(prod => (
                        <div key={prod._id} className="category-node" style={{ borderRadius: '20px', border: '1px solid #f1f5f9', background: 'white', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '20px' }}>
                            <div className="cat-info" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                                <img src={`${backendRoot}/${prod.image}`} alt="" style={{ width: '100px', height: '100px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #f1f5f9' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 
                                            onClick={() => handleEditClick(prod)}
                                            style={{ 
                                                margin: 0, 
                                                fontSize: '1.25rem', 
                                                fontWeight: '800', 
                                                color: '#0f172a', 
                                                cursor: 'pointer',
                                                transition: 'color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.color = '#4f46e5'}
                                            onMouseLeave={(e) => e.target.style.color = '#0f172a'}
                                        >
                                            {prod.name}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#ebf5ff', color: '#0070f3', borderColor: '#d0e8ff' }} onClick={() => handleEditClick(prod)}>Edit</button>
                                            <button className="btn-secondary" style={{ color: '#ef4444', padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleDelete(prod._id)}>Delete</button>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#64748b', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <span><b>SKU:</b> {prod.sku}</span>
                                        <span><b>Stock:</b> {prod.quantity || 0}</span>
                                        <span style={{ gridColumn: 'span 2' }}><b>Category:</b> {prod.category?.name} / {prod.subCategoryName}</span>
                                        <span style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '800' }}>${prod.price}</span>
                                        {prod.variations && prod.variations.length > 0 && (
                                            <span style={{ gridColumn: 'span 2', fontSize: '0.85rem', color: '#4f46e5', fontWeight: '600' }}>
                                                ✓ {prod.variations.length} variation{prod.variations.length !== 1 ? 's' : ''}: {prod.variations.map(v => `${v.name} ($${v.price})`).join(', ')}
                                            </span>
                                        )}
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