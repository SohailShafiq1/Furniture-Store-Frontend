import { useState } from 'react';
import './Navigation.css';

const NAV_ITEMS = [
  { label: 'Living', href: '#living' },
  { label: 'Bedroom', href: '#bedroom' },
  { label: 'Mattresses', href: '#mattresses' },
  { label: 'Dining', href: '#dining' },
  { label: 'Home Decor', href: '#home-decor' },
  { label: 'Office', href: '#office' },
  { label: 'Outdoor', href: '#outdoor' },
  { label: 'Premium', href: '#premium', isPremium: true },
];

const ChevronIcon = () => (
  <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navigation">
      {/* Hamburger for mobile */}
      <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
        <span className={isOpen ? 'open' : ''}></span>
        <span className={isOpen ? 'open' : ''}></span>
        <span className={isOpen ? 'open' : ''}></span>
      </button>

      <ul className={`nav-list ${isOpen ? 'active' : ''}`}>
        {NAV_ITEMS.map((item) => (
          <li key={item.label} className="nav-item">
            <a
              href={item.href}
              className={`nav-link ${item.isPremium ? 'premium' : ''}`}
            >
              {item.label}
              <ChevronIcon />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
