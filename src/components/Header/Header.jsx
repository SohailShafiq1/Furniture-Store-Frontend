import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import SearchBar from '../common/SearchBar';
import Navigation from '../Navigation/Navigation';
import AuthModal from '../common/AuthModal';
import { useUserAuth } from '../../context/UserAuthContext';
import { useCart } from '../../context/CartContext';
import { useCategoryData } from '../../hooks/useCategoryData';
import { BACKEND_URL } from '../../config/api';
import './Header.css';

export default function Header() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [latestNewsId, setLatestNewsId] = useState(null);
  const { user, logout } = useUserAuth();
  const { cart } = useCart();
  const { categories } = useCategoryData();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/home-content/news/get-all`);
        const newsItems = Array.isArray(res.data) ? res.data.filter((item) => item.isVisible !== false) : [];
        if (newsItems.length > 0) {
          const sortedNews = newsItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setLatestNewsId(sortedNews[0]._id);
        }
      } catch (error) {
        console.error('Error fetching latest news:', error);
      }
    };

    fetchLatestNews();
  }, []);

  const bannerItems = [
    {
      prefix: 'Shop with Confidence: ',
      highlight: '30-DAY RETURNS*',
      route: '/return-policy',
    },
    {
      prefix: 'Spring Sale continues: ',
      highlight: 'Up to 70% Off',
      route: '/deals',
    },
    {
      prefix: '',
      highlight: 'Ranked top 100',
      suffix: ' among US furniture stores!',
      route: latestNewsId ? `/news/${latestNewsId}` : '/news',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBannerIndex((current) => (current + 1) % bannerItems.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [bannerItems.length, latestNewsId]);

  const activeBanner = bannerItems[activeBannerIndex];

  // Calculate total items in cart
  const cartItemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  // Transform backend categories to have the structure needed for mega-menu
  const navItems = categories.map((category) => ({
    id: category._id || category.name.toLowerCase(),
    label: category.name,
    href: `/category/${category._id || category.name.toLowerCase()}`,
    subcategories: (category.subCategories || []).map((sub) => ({
      label: sub.name,
      href: `/category/${category._id}/sub/${sub.name}`,
      image: sub.image,
    })),
  }));

  const activeNavItem = navItems.find((item) => item.id === activeMenu);

  return (
    <header className="header" onMouseLeave={() => setActiveMenu(null)}>
      <div className="header-announcement-bar">
        <div className="header-announcement-inner">
          <button
            type="button"
            className="announcement-message"
            onClick={() => navigate(activeBanner.route)}
          >
            {activeBanner.prefix}
            <span className="announcement-highlight">{activeBanner.highlight}</span>
            {activeBanner.suffix || ''}
          </button>
          <div className="announcement-links">
            <button
              type="button"
              className="announcement-link"
              onClick={() => navigate('/track-order')}
            >
              Track My Order
            </button>
            <h3 style={{color:'white'}}>|</h3>
            <button
              type="button"
              className="announcement-link"
              onClick={() => navigate('/contact-us')}
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {/* Row 1: Logo | Search | Icons */}
      <div className="header-top-row">
        {/* Logo */}
        <Link to="/" className="logo-container">
          <img src="/logo.svg" alt="Furniture Store" className="logo" />
        </Link>

        {/* Search Bar */}
        <SearchBar />

        {/* Right Icons */}
        <div className="icon-group">
          <button 
            className="header-icon-btn" 
            title="Store Locations"
            onClick={() => navigate('/store-locations')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </button>
          
          <div className="user-account-container">
            {user ? (
              <div className="user-profile-nav">
                <span className="user-name-bubble">{user.name.charAt(0).toUpperCase()}</span>
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{user.name}</strong>
                    <p>{user.email}</p>
                  </div>
                  <button 
                    className="dropdown-item"
                    onClick={() => navigate('/my-orders')}
                  >
                    My Orders
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => navigate('/profile-settings')}
                  >
                    Profile Settings
                  </button>
                  <button 
                    className="dropdown-item logout-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      logout();
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className="header-icon-btn" 
                title="Account"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>
            )}
          </div>

          <button 
            className="header-icon-btn cart-icon-btn" 
            title="Cart"
            onClick={() => navigate('/cart')}
          >
            <div className="cart-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
            </div>
          </button>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* Row 2: Nav links | Financing + Luna Premium */}
      <div className="header-nav-row">
        <Navigation activeMenu={activeMenu} onCategoryHover={setActiveMenu} />
        <div className="nav-row-right">
          <Link to="/financing" className="financing-link">Financing / Lease to Own</Link>
          {/* <Link to="/premium" className="premium-action-btn">Luna Premium</Link> */}
        </div>
      </div>

      {/* Full-width mega-menu — positioned absolute relative to sticky header */}
      {activeNavItem?.subcategories?.length ? (
        <div className="mega-menu" role="region" aria-label={`${activeNavItem.label} subcategories`}>
          <div className="mega-menu-grid">
            {activeNavItem.subcategories.map((sub) => {
              const imageUrl = sub.image?.startsWith('http') ? sub.image : `${BACKEND_URL}/${sub.image}`;
              return (
                <Link key={sub.label} to={sub.href} className="mega-menu-item">
                  <img src={imageUrl} alt={sub.label} className="mega-menu-image" loading="lazy" />
                  <span className="mega-menu-label">{sub.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

    </header>
  );
}
