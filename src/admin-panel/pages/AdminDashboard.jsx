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
          <Link to="/admin/home-content" className="dashboard-card">
            <h3>Home Page Content</h3>
            <p>Manage promotion photos and featured products</p>
          </Link>
          <Link to="/admin/brands" className="dashboard-card">
            <h3>Manage Brands</h3>
            <p>Add, edit, and manage furniture brands</p>
          </Link>
          <Link to="/admin/financing-companies" className="dashboard-card">
            <h3>Financing Companies</h3>
            <p>Add and manage financing company options</p>
          </Link>
          <Link to="/admin/deals" className="dashboard-card">
            <h3>Manage Deals</h3>
            <p>Create deals with images and category redirect button</p>
          </Link>
          <Link to="/admin/collections" className="dashboard-card">
            <h3>Create a collection</h3>
            <p>Add main banner, multiple product buttons, and deal box</p>
          </Link>
          <Link to="/admin/categories" className="dashboard-card">
            <h3>Manage Categories</h3>
            <p>Add and manage categories and sub-categories</p>
          </Link>
          <Link to="/admin/products" className="dashboard-card">
            <h3>Manage Products</h3>
            <p>Add and manage inventory items</p>
          </Link>
          <Link to="/admin/stores" className="dashboard-card">
            <h3>Manage Stores</h3>
            <p>Add stores and view attribution IDs</p>
          </Link>
          <Link to="/admin/orders" className="dashboard-card">
            <h3>Manage Orders</h3>
            <p>View and manage customer orders, update status, send updates</p>
          </Link>
          <Link to="/admin/damage-claims" className="dashboard-card">
            <h3>Damage Claims</h3>
            <p>Review customer damage claim forms and uploaded evidence</p>
          </Link>
          <Link to="/admin/analytics" className="dashboard-card">
            <h3>Analytics Dashboard</h3>
            <p>View sales, revenue, products performance and trends</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
