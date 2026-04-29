import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategoryData } from '../../hooks/useCategoryData';
import './Navigation.css';

const ChevronIcon = ({ open }) => (
  <svg
    className={`chevron ${open ? 'open' : ''}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default function Navigation({ activeMenu, onCategoryHover, isOpen: controlledIsOpen, onOpenChange }) {
  const { categories, loading } = useCategoryData();
  const isOpen = typeof controlledIsOpen === 'boolean' ? controlledIsOpen : false;
  const [openItem, setOpenItem] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setOpenItem(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        if (openItem) {
          setOpenItem(null);
        }
        if (isOpen && typeof onOpenChange === 'function') {
          onOpenChange(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, openItem, onOpenChange]);

  const toggleMenu = () => {
    if (typeof onOpenChange === 'function') {
      onOpenChange(!isOpen);
    }
  };

  // Transform backend categories to navigation items
  const navItems = categories.map((category) => ({
    id: category._id || category.name.toLowerCase(),
    label: category.name,
    href: `/category/${category._id || category.name.toLowerCase()}`,
    subcategories: (category.subCategories || []).map((sub) => ({
      label: sub.name,
      href: `/category/${category._id || category.name.toLowerCase()}/sub/${encodeURIComponent(sub.name)}`,
      image: sub.image,
    })),
  }));

  if (loading) {
    return (
      <nav className="navigation">
        <div style={{ color: '#666', padding: '10px' }}>Loading...</div>
      </nav>
    );
  }

  return (
    <nav className="navigation" ref={navRef}>
      {/* Hamburger for mobile */}
      <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu" aria-expanded={isOpen}>
        <span className={isOpen ? 'open' : ''}></span>
        <span className={isOpen ? 'open' : ''}></span>
        <span className={isOpen ? 'open' : ''}></span>
      </button>

      <ul className={`nav-list ${isOpen ? 'active' : ''}`}>
        {navItems.map((item) => {
          const isExpanded = openItem === item.id;
          return (
            <li
              key={item.id}
              className={`nav-item ${isExpanded ? 'open' : ''}`}
              onMouseEnter={() => onCategoryHover(item.id)}
            >
              <div className="nav-item-header">
                <Link
                  to={item.href}
                  className={`nav-link ${activeMenu === item.id ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
                {item.subcategories.length > 0 && (
                  <button
                    type="button"
                    className="submenu-toggle"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenItem((prev) => (prev === item.id ? null : item.id));
                    }}
                    aria-label={isExpanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
                  >
                    <ChevronIcon open={isExpanded} />
                  </button>
                )}
              </div>
              {item.subcategories.length > 0 && (
                <ul className={`mobile-submenu ${isExpanded ? 'open' : ''}`}>
                  {item.subcategories.map((sub) => (
                    <li key={sub.label} className="mobile-submenu-item">
                      <Link to={sub.href} className="mobile-submenu-link">
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
