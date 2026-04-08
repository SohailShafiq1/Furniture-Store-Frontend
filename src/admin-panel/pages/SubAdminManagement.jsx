import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';

const SubAdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token, admin: currentAdmin } = useAdminAuth();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchAdmins = async () => {
    try {
      const res = await axios.get(`${apiUrl}/admin/subadmins`, config);
      setAdmins(res.data);
    } catch (err) {
      setError('Failed to fetch sub-admins');
    }
  };

  useEffect(() => {
    if (currentAdmin?.role === 'superadmin') {
      fetchAdmins();
    }
  }, [currentAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/admin/create-subadmin`, formData, config);
      setMessage('Sub-admin created successfully');
      setFormData({ name: '', email: '', password: '' });
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create sub-admin');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`${apiUrl}/admin/subadmin/${id}`, config);
      fetchAdmins();
    } catch (err) {
      setError('Failed to delete admin');
    }
  };

  if (currentAdmin?.role !== 'superadmin') {
    return <h2>Access Denied. Superadmin only.</h2>;
  }

  return (
    <div className="sub-admin-management">
      <h1>Sub-Admin Management</h1>
      <form onSubmit={handleSubmit} className="admin-form">
        <input 
          type="text" 
          placeholder="Name" 
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})} 
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={formData.email} 
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={formData.password} 
          onChange={(e) => setFormData({...formData, password: e.target.value})} 
          required 
        />
        <button type="submit">Add Sub-Admin</button>
      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="admin-list">
        <h2>Existing Sub-Admins</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(adm => (
              <tr key={adm._id}>
                <td>{adm.name}</td>
                <td>{adm.email}</td>
                <td><button onClick={() => handleDelete(adm._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubAdminManagement;
