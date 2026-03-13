import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import './App.css';
import './admin-panel/admin-panel.css';
import AdminLogin from './admin-panel/pages/AdminLogin';
import SubAdminManagement from './admin-panel/pages/SubAdminManagement';
import AdminDashboard from './admin-panel/pages/AdminDashboard';
import CategoryManagement from './admin-panel/pages/CategoryManagement';
import ProductManagement from './admin-panel/pages/ProductManagement';
import CategoryDetailPage from './admin-panel/pages/CategoryDetailPage';
import SubCategoryDetailPage from './admin-panel/pages/SubCategoryDetailPage';
import ProtectedRoute from './admin-panel/components/ProtectedRoute';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/subadmins" 
          element={
            <ProtectedRoute role="superadmin">
              <SubAdminManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/categories" 
          element={
            <ProtectedRoute>
              <CategoryManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/products" 
          element={
            <ProtectedRoute>
              <ProductManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/category/:categoryId" 
          element={
            <ProtectedRoute>
              <CategoryDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/category/:categoryId/sub/:subName" 
          element={
            <ProtectedRoute>
              <SubCategoryDetailPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;


