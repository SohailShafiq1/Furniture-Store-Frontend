import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import SearchBar from '../common/SearchBar';
import Navigation from '../Navigation/Navigation';
import AuthModal from '../common/AuthModal';
import { useUserAuth } from '../../context/UserAuthContext';
import { useCart } from '../../context/CartContext';
import { useCategoryData } from '../../hooks/useCategoryData';
import { FiBox } from 'react-icons/fi';
import { BACKEND_URL } from '../../config/api';
import { getAlternateImageUrl, getImageUrl } from '../../utils/imageUrl';
import './Header.css';

export default function Header() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [previousBannerIndex, setPreviousBannerIndex] = useState(null);
  const [latestNewsId, setLatestNewsId] = useState(null);
  const { user, logout } = useUserAuth();
  const { cart } = useCart();
  const { categories } = useCategoryData();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMobileSearchOpen(false);
    setIsMobileNavOpen(false);
  }, [location.pathname]);

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
      setActiveBannerIndex((current) => {
        setPreviousBannerIndex(current);
        return (current + 1) % bannerItems.length;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [bannerItems.length, latestNewsId]);

  useEffect(() => {
    if (previousBannerIndex === null) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setPreviousBannerIndex(null);
    }, 850);

    return () => clearTimeout(timeout);
  }, [previousBannerIndex]);

  const activeBanner = bannerItems[activeBannerIndex];
  const previousBanner = previousBannerIndex !== null ? bannerItems[previousBannerIndex] : null;

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
  const navbarLocationIcon = '/navbar/28.svg';
  const navbarProfileIcon = '/navbar/29.svg';
  const navbarCartIcon = '/navbar/30.svg';
  const navbarPromoImageOne = '/navbar/Areeb Client 1 New Website Work.svg';
  const navbarPromoImageTwo = '/navbar/Areeb Client 1 New Website Work (1).svg';

  return (
    <header className="header" onMouseLeave={() => setActiveMenu(null)}>
      <div className="header-announcement-bar">
        <div className="header-announcement-inner">
          <button
            type="button"
            className="announcement-message"
            onClick={() => navigate(activeBanner.route)}
          >
            <span className="announcement-message-track">
              {previousBanner ? (
                <span
                  key={`previous-${previousBannerIndex}`}
                  className="announcement-message-content announcement-message-content--exit-right"
                >
                  {previousBanner.prefix}
                  <span className="announcement-highlight">{previousBanner.highlight}</span>
                  {previousBanner.suffix || ''}
                </span>
              ) : null}

              <span
                key={`active-${activeBannerIndex}`}
                className="announcement-message-content announcement-message-content--enter-left"
              >
                {activeBanner.prefix}
                <span className="announcement-highlight">{activeBanner.highlight}</span>
                {activeBanner.suffix || ''}
              </span>
            </span>
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
      <div className={`header-top-row ${isMobileSearchOpen ? 'mobile-search-open' : ''}`}>
        <button
          type="button"
          className="header-mobile-menu-toggle"
          onClick={() => {
            setIsMobileSearchOpen(false);
            setIsMobileNavOpen((prev) => !prev);
          }}
          aria-label="Toggle menu"
          aria-expanded={isMobileNavOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Logo */}
        <Link to="/" className="logo-container">
          <img src="/logo.svg" alt="Furniture Store" className="logo" />
        </Link>

        {/* Search Bar */}
        <SearchBar />

        {/* Right Icons */}
        <div className="icon-group">
          <button
            className={`header-icon-btn mobile-search-toggle ${isMobileSearchOpen ? 'active' : ''}`}
            title="Search"
            onClick={() => {
              setIsMobileNavOpen(false);
              setIsMobileSearchOpen((prev) => !prev);
            }}
            aria-label="Toggle search"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7"></circle>
              <path d="m20 20-3.5-3.5"></path>
            </svg>
          </button>

          <button 
            className="header-icon-btn" 
            title="Store Locations"
            onClick={() => navigate('/store-locations')}
          >
            <img src={navbarLocationIcon} alt="" aria-hidden="true" className="header-icon-image" />
          </button>
          
          <div className="user-account-container">
            {user ? (
              <div className="user-profile-nav">
                <button
                  type="button"
                  className="header-icon-btn user-profile-button"
                  title="Account"
                  onClick={() => navigate('/profile-settings')}
                >
                  <img src={navbarProfileIcon} alt="" aria-hidden="true" className="header-icon-image" />
                </button>
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
                <img src={navbarProfileIcon} alt="" aria-hidden="true" className="header-icon-image" />
              </button>
            )}
          </div>

          <button 
            className="header-icon-btn cart-icon-btn" 
            title="Cart"
            onClick={() => navigate('/cart')}
          >
            <div className="cart-icon-wrapper">
              <img src={navbarCartIcon} alt="" aria-hidden="true" className="header-icon-image header-cart-image" />
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
        <Navigation
          activeMenu={activeMenu}
          onCategoryHover={setActiveMenu}
          isOpen={isMobileNavOpen}
          onOpenChange={(nextOpen) => {
            setIsMobileSearchOpen(false);
            setIsMobileNavOpen(nextOpen);
          }}
        />
        <div className="nav-row-right">
          <Link to="/financing" className="financing-link">Financing / Lease to Own</Link>
          {/* <Link to="/premium" className="premium-action-btn">Luna Premium</Link> */}
        </div>
      </div>

      {/* Full-width mega-menu — positioned absolute relative to sticky header */}
      {activeNavItem?.subcategories?.length ? (
        <div className="mega-menu" role="region" aria-label={`${activeNavItem.label} subcategories`}>
          <div className="mega-menu-grid">
            <div className="mega-menu-left">
              <div className="mega-menu-left-list">
                {activeNavItem.subcategories.map((sub) => {
                  const imageUrl = getImageUrl(sub.image);
                  return (
                    <Link key={sub.label} to={sub.href} className="mega-menu-left-item">
                      <div className="mega-menu-left-icon">
                        {sub.image ? (
                          <img
                            src={imageUrl}
                            alt={sub.label}
                            loading="lazy"
                            onError={(e) => {
                              const currentSrc = e.currentTarget.src;
                              const alternateUrl = getAlternateImageUrl(currentSrc, sub.image);
                              if (alternateUrl && alternateUrl !== currentSrc) {
                                e.currentTarget.src = alternateUrl;
                              } else {
                                e.currentTarget.onerror = null;
                              }
                            }}
                          />
                        ) : (
                          <FiBox />
                        )}
                      </div>
                      <div className="mega-menu-left-text">
                        <span className="mega-menu-left-label">{sub.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <aside className="mega-menu-right">
              <Link to="/delivery-policy" className="mega-promo-box promo-shipping">
                <img
                  src={navbarPromoImageOne}
                  alt="Areeb Client 1 New Website Work"
                  className="promo-box-image"
                />
              </Link>
              <Link to="/financing" className="mega-promo-box promo-financing">
                <img
                  src={navbarPromoImageTwo}
                  alt="Areeb Client 1 New Website Work (1)"
                  className="promo-box-image"
                />
              </Link>
            </aside>
          </div>
        </div>
      ) : null}

    </header>
  );
}
