import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategoryData } from '../../hooks/useCategoryData';
import './Navigation.css';

const ChevronIcon = () => (
  <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default function Navigation({ activeMenu, onCategoryHover }) {
  const [isOpen, setIsOpen] = useState(false);
  const { categories, loading } = useCategoryData();

  // Transform backend categories to navigation items
  const navItems = categories.map((category) => ({
    id: category._id || category.name.toLowerCase(),
    label: category.name,
    href: `/category/${category._id || category.name.toLowerCase()}`,
    subcategories: (category.subCategories || []).map((sub) => ({
      label: sub.name,
      href: `/category/${category._id || category.name.toLowerCase()}`,
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
    <nav className="navigation">
      {/* Hamburger for mobile */}
      <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
        <span className={isOpen ? 'open' : ''}></span>
        <span className={isOpen ? 'open' : ''}></span>
        <span className={isOpen ? 'open' : ''}></span>
      </button>

      <ul className={`nav-list ${isOpen ? 'active' : ''}`}>
        {navItems.map((item) => (
          <li
            key={item.id}
            className="nav-item"
            onMouseEnter={() => onCategoryHover(item.id)}
          >
            <Link
              to={item.href}
              className={`nav-link ${activeMenu === item.id ? 'active' : ''}`}
            >
              {item.label}
              {item.subcategories.length > 0 && <ChevronIcon />}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
