import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import './App.css';
import './admin-panel/admin-panel.css';
import AdminLogin from './admin-panel/pages/AdminLogin';
import SubAdminManagement from './admin-panel/pages/SubAdminManagement';
import AdminDashboard from './admin-panel/pages/AdminDashboard';
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
      </Routes>
    </div>
  );
}

export default App;


