import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import './CategoryManagement.css';

const SubCategoryDetailPage = () => {
    const { categoryId, subName } = useParams();
    const [subCategory, setSubCategory] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [newSubName, setNewSubName] = useState(subName);
    const [error, setError] = useState('');
    const { token } = useAdminAuth();
    const navigate = useNavigate();

    const apiEndpoint = `${import.meta.env.VITE_API_URL}/categories`;
    const backendRoot = import.meta.env.VITE_API_URL.replace('/api', '');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        const fetchSub = async () => {
            try {
                const res = await axios.get(`${apiEndpoint}/all`, config);
                const parent = res.data.find(c => c._id === categoryId);
                const sub = parent.subCategories.find(s => s.name === subName);
                if (sub) {
                    setSubCategory(sub);
                    setNewSubName(sub.name);
                }
            } catch (err) {
                setError('Failed to fetch sub-category');
            }
        };
        fetchSub();
    }, [categoryId, subName]);

    const handleUpdate = async () => {
        try {
            // Placeholder: Assume PUT /categories/:id/sub/:oldSubName updates it
            await axios.put(`${apiEndpoint}/${categoryId}/sub/${encodeURIComponent(subName)}`, { name: newSubName }, config);
            navigate(`/admin/category/${categoryId}/sub/${encodeURIComponent(newSubName)}`, { replace: true });
            setEditMode(false);
        } catch (err) {
            setError('Update failed. Backend update logic may be missing.');
        }
    };

    if (!subCategory) return <div className="category-management">Loading...</div>;

    return (
        <div className="category-management">
            <button className="action-btn edit-btn" onClick={() => navigate(`/admin/category/${categoryId}`)}>← Back to {subName} Parent Category</button>
            <div className="category-header-detail" style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginTop: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <img src={`${backendRoot}/${subCategory.image}`} alt="" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} />
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
                                <button className="action-btn edit-btn" onClick={() => setEditMode(true)}>Rename Sub-category</button>
                            </div>
                        )}
                        <p style={{ color: '#666' }}>This sub-category is ready to be linked with products or banners.</p>
                    </div>
                </div>
            </div>

            <div className="category-list" style={{ marginTop: '2rem' }}>
                <div style={{ padding: '3rem', textAlign: 'center', background: '#fcfcfc', borderRadius: '12px', border: '2px dashed #eee' }}>
                    <h3>Future Product List Section</h3>
                    <p style={{ color: '#999' }}>This is where you'll be able to manage items from {subCategory.name}.</p>
                </div>
            </div>
        </div>
    );
};

export default SubCategoryDetailPage;