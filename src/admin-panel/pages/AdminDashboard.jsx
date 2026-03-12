import React from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <div className="admin-info">
          <span>Welcome, <strong>{admin?.name}</strong> ({admin?.role})</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1>Dashboard Overview</h1>
        <div className="dashboard-grid">
          {admin?.role === 'superadmin' && (
            <Link to="/admin/subadmins" className="dashboard-card">
              <h3>Manage Sub-Admins</h3>
              <p>Create and delete administrative accounts</p>
            </Link>
          )}
          <Link to="/admin/categories" className="dashboard-card">
            <h3>Manage Categories</h3>
            <p>Add and manage categories and sub-categories</p>
          </Link>
          <div className="dashboard-card">
            <h3>Manage Products</h3>
            <p>Add, edit or remove furniture items (Coming soon)</p>
          </div>
          <div className="dashboard-card">
            <h3>Orders</h3>
            <p>View and manage client orders (Coming soon)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
