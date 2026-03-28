import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import InspirationPage from './pages/InspirationPage';
import InspirationDetailPage from './pages/InspirationDetailPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import FinancingPage from './pages/FinancingPage';
import StoreLocationsPage from './pages/StoreLocationsPage';
import DealsPage from './pages/DealsPage';
import './App.css';
import './admin-panel/admin-panel.css';
import AdminLogin from './admin-panel/pages/AdminLogin';
import SubAdminManagement from './admin-panel/pages/SubAdminManagement';
import AdminDashboard from './admin-panel/pages/AdminDashboard';
import BrandManagement from './admin-panel/pages/BrandManagement';
import CategoryManagement from './admin-panel/pages/CategoryManagement';
import ProductManagement from './admin-panel/pages/ProductManagement';
import CategoryDetailPage from './admin-panel/pages/CategoryDetailPage';
import SubCategoryDetailPage from './admin-panel/pages/SubCategoryDetailPage';
import HomeViewManagement from './admin-panel/pages/HomeViewManagement';
import OrderManagement from './admin-panel/pages/OrderManagement';
import StoreManagement from './admin-panel/pages/StoreManagement';
import FinancingManagement from './admin-panel/pages/FinancingManagement';
import AnalyticsDashboard from './admin-panel/pages/AnalyticsDashboard';
import ProtectedRoute from './admin-panel/components/ProtectedRoute';
import CheckoutPage from './pages/CheckoutPage';
import CartPage from './pages/CartPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000, // Slightly slower for more premium feel
      easing: 'ease-in-out',
      once: true,
      offset: 150, // Higher offset so it doesn't trigger too early while scrolling
      delay: 50 // Adds a tiny base delay for stability
    });
  }, []);

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/category/:categoryId/sub/:subcategoryName" element={<CategoryPage />} />
        <Route path="/product/:categoryId/:productId" element={<ProductDetailPage />} />
        <Route path="/inspiration" element={<InspirationPage />} />
        <Route path="/inspiration/:inspirationId" element={<InspirationDetailPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:newsId" element={<NewsDetailPage />} />
        <Route path="/financing" element={<FinancingPage />} />
        <Route path="/store-locations" element={<StoreLocationsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success/:sessionId" element={<OrderSuccessPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/profile-settings" element={<ProfileSettingsPage />} />
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
          path="/admin/brands" 
          element={
            <ProtectedRoute>
              <BrandManagement />
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
        <Route 
          path="/admin/home-content" 
          element={
            <ProtectedRoute>
              <HomeViewManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/orders" 
          element={
            <ProtectedRoute>
              <OrderManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/stores" 
          element={
            <ProtectedRoute>
              <StoreManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/financing-companies" 
          element={
            <ProtectedRoute>
              <FinancingManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/analytics" 
          element={
            <ProtectedRoute>
              <AnalyticsDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;


