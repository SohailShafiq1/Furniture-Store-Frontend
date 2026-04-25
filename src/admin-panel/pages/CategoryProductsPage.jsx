import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import { API_BASE_URL } from '../../config/api';
import { getAlternateImageUrl, getImageUrl } from '../../utils/imageUrl';
import '../admin-panel.css';
import './CategoryProductsPage.css';

const CategoryProductsPage = () => {
    const { categoryId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { token } = useAdminAuth();

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceSort, setPriceSort] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const subCategoryName = params.get('subCategoryName') || '';
    const subSubCategoryName = params.get('subSubCategoryName') || '';

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
        const fetchData = async () => {
            try {
                setLoading(true);
                const [catsRes, productsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/categories/all`, config),
                    axios.get(`${API_BASE_URL}/products/all`, config),
                ]);
                setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
                setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
                setError('');
            } catch (err) {
                setError('Failed to load category products');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryId]);

    const activeCategory = categories.find((cat) => cat._id === categoryId);

    const viewParts = [];
    if (activeCategory?.name) viewParts.push(activeCategory.name);
    if (subCategoryName) viewParts.push(subCategoryName);
    if (subSubCategoryName) viewParts.push(subSubCategoryName);
    const viewLabel = viewParts.join(' / ');

    const filteredProducts = products
        .filter((prod) => {
            const matchesSearch = prod.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prod.sku?.toLowerCase().includes(searchTerm.toLowerCase());
            const productCategoryId = prod.category?._id || prod.category;
            const matchesCategory = productCategoryId === categoryId;
            const matchesSub = !subCategoryName || prod.subCategoryName === subCategoryName;
            const matchesSubSub = !subSubCategoryName || prod.subSubCategoryName === subSubCategoryName;
            return matchesSearch && matchesCategory && matchesSub && matchesSubSub;
        })
        .sort((a, b) => {
            if (priceSort === 'low') return a.price - b.price;
            if (priceSort === 'high') return b.price - a.price;
            return 0;
        });

    const goBack = () => {
        if (subCategoryName) {
            navigate(`/admin/category/${categoryId}/sub/${encodeURIComponent(subCategoryName)}`);
            return;
        }
        navigate(`/admin/category/${categoryId}`);
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/products/${productId}`, config);
            setProducts((prev) => prev.filter((prod) => prod._id !== productId));
            setMessage('Product deleted');
        } catch (err) {
            setError('Delete failed');
        }
    };

    const handleEdit = (productId) => {
        navigate(`/admin/products?editProductId=${encodeURIComponent(productId)}`);
    };

    if (loading) {
        return (
            <div className="category-products">
                <div className="category-products-card">Loading products...</div>
            </div>
        );
    }

    return (
        <div className="category-products">
            <div className="category-products-header">
                <div>
                    <h1>Category Products</h1>
                    <p className="category-products-subtitle">
                        {viewLabel || 'All products for this category'}
                    </p>
                </div>
                <div className="category-products-actions">
                    <button className="btn-secondary" type="button" onClick={goBack}>
                        Back
                    </button>
                </div>
            </div>

            {message && <div className="success-toast" onClick={() => setMessage('')}>{message}</div>}
            {error && <div className="error-toast" onClick={() => setError('')}>{error}</div>}

            <div className="category-products-card">
                <div className="category-products-filters">
                    <div className="form-group">
                        <label>Search</label>
                        <input
                            className="form-control"
                            placeholder="Search by name or SKU"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Sort</label>
                        <select
                            className="form-control"
                            value={priceSort}
                            onChange={(e) => setPriceSort(e.target.value)}
                        >
                            <option value="">Sort by price</option>
                            <option value="low">Low to high</option>
                            <option value="high">High to low</option>
                        </select>
                    </div>
                    <div className="category-products-count">
                        Showing {filteredProducts.length} of {products.filter((prod) => (prod.category?._id || prod.category) === categoryId).length}
                    </div>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="category-products-empty">No products found for this view.</div>
                ) : (
                    <div className="category-products-grid">
                        {filteredProducts.map((prod) => (
                            <div key={prod._id} className="category-products-item">
                                <div className="category-products-media">
                                    <img
                                        src={getImageUrl(prod.image)}
                                        alt={prod.name}
                                        onError={handleImageError(prod.image)}
                                    />
                                </div>
                                <div className="category-products-info">
                                    <div className="category-products-title">
                                        <h3>{prod.name}</h3>
                                        <span className="category-products-price">${prod.price}</span>
                                    </div>
                                    <div className="category-products-meta">
                                        <span><b>SKU:</b> {prod.sku}</span>
                                        <span><b>Category:</b> {prod.category?.name || 'Category'}</span>
                                        <span><b>Sub:</b> {prod.subCategoryName || 'N/A'}</span>
                                        <span><b>Sub-sub:</b> {prod.subSubCategoryName || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="category-products-buttons">
                                    <button className="btn-secondary" type="button" onClick={() => handleEdit(prod._id)}>
                                        Edit
                                    </button>
                                    <button className="btn-danger" type="button" onClick={() => handleDelete(prod._id)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryProductsPage;
