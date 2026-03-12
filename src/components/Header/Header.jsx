import { useState } from 'react';
import SearchBar from '../common/SearchBar';
import Navigation, { NAV_ITEMS } from '../Navigation/Navigation';
import './Header.css';

export default function Header() {
  const [activeMenu, setActiveMenu] = useState(null);
  const activeNavItem = NAV_ITEMS.find((item) => item.id === activeMenu);

  return (
    <header className="header" onMouseLeave={() => setActiveMenu(null)}>

      {/* Row 1: Logo | Search | Icons */}
      <div className="header-top-row">
        {/* Logo */}
        <div className="logo-container">
          <img src="/logo.avif" alt="Luna Furniture" className="logo" />
        </div>

        {/* Search Bar */}
        <SearchBar />

        {/* Right Icons */}
        <div className="icon-group">
          <button className="header-icon-btn" title="Location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </button>
          <button className="header-icon-btn" title="Account">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
          <button className="header-icon-btn" title="Cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Row 2: Nav links | Financing + Luna Premium */}
      <div className="header-nav-row">
        <Navigation activeMenu={activeMenu} onCategoryHover={setActiveMenu} />
        <div className="nav-row-right">
          <span className="financing-text">Financing / Lease to Own</span>
          <button className="luna-premium-btn">Luna Premium</button>
        </div>
      </div>

      {/* Full-width mega-menu — positioned absolute relative to sticky header */}
      {activeNavItem?.subcategories?.length ? (
        <div className="mega-menu" role="region" aria-label={`${activeNavItem.label} subcategories`}>
          <div className="mega-menu-grid">
            {activeNavItem.subcategories.map((sub) => (
              <a key={sub.label} href={sub.href} className="mega-menu-item">
                <img src={sub.image} alt={sub.label} className="mega-menu-image" loading="lazy" />
                <span className="mega-menu-label">{sub.label}</span>
              </a>
            ))}
          </div>
        </div>
      ) : null}

    </header>
  );
}
