import { useState } from 'react';
import './Navigation.css';

export const NAV_ITEMS = [
  {
    id: 'living',
    label: 'Living',
    href: '#living',
    subcategories: [
      { label: 'Sofas', href: '#sofas', image: '/download.jpeg' },
      { label: 'Sectionals', href: '#sectionals', image: '/download (1).jpeg' },
      { label: 'Living Room Sets', href: '#living-room-sets', image: '/download (2).jpeg' },
      { label: 'Sleeper Sofas', href: '#sleeper-sofas', image: '/download (3).jpeg' },
      { label: 'Loveseats', href: '#loveseats', image: '/images.jpeg' },
      { label: 'Chairs & Recliners', href: '#chairs-recliners', image: '/download (1).jpeg' },
      { label: 'TV Stands', href: '#tv-stands', image: '/download (3).jpeg' },
      { label: 'Accent Cabinets', href: '#accent-cabinets', image: '/download (2).jpeg' },
      { label: 'Occasional Table Sets', href: '#occasional-table-sets', image: '/download.jpeg' },
      { label: 'Coffee & Cocktail Tables', href: '#coffee-cocktail-tables', image: '/images.jpeg' },
      { label: 'Console & Sofa Tables', href: '#console-sofa-tables', image: '/download (2).jpeg' },
      { label: 'Side & End Tables', href: '#side-end-tables', image: '/download (3).jpeg' },
      { label: 'Ottomans & Poufs', href: '#ottomans-poufs', image: '/download.jpeg' },
      { label: 'Chaises', href: '#chaises', image: '/download (1).jpeg' },
      { label: 'Massage Chair', href: '#massage-chair', image: '/images.jpeg' },
    ],
  },
  {
    id: 'bedroom',
    label: 'Bedroom',
    href: '#bedroom',
    subcategories: [
      { label: 'Beds', href: '#beds', image: '/download.jpeg' },
      { label: 'Dressers', href: '#dressers', image: '/download (1).jpeg' },
      { label: 'Nightstands', href: '#nightstands', image: '/download (2).jpeg' },
      { label: 'Bedroom Sets', href: '#bedroom-sets', image: '/download (3).jpeg' },
      { label: 'Mattress Sets', href: '#mattress-sets', image: '/categories/bedroom.jpg' },
      { label: 'Armoires & Wardrobes', href: '#armoires', image: '/images.jpeg' },
    ],
  },
  {
    id: 'mattresses',
    label: 'Mattresses',
    href: '#mattresses',
    subcategories: [
      { label: 'Memory Foam', href: '#memory-foam', image: '/download.jpeg' },
      { label: 'Hybrid', href: '#hybrid', image: '/download (1).jpeg' },
      { label: 'Innerspring', href: '#innerspring', image: '/download (2).jpeg' },
      { label: 'Mattress Bases', href: '#mattress-bases', image: '/download (3).jpeg' },
    ],
  },
  {
    id: 'dining',
    label: 'Dining',
    href: '#dining',
    subcategories: [
      { label: 'Dining Tables', href: '#dining-tables', image: '/download.jpeg' },
      { label: 'Dining Chairs', href: '#dining-chairs', image: '/download (1).jpeg' },
      { label: 'Dining Sets', href: '#dining-sets', image: '/download (2).jpeg' },
      { label: 'Bar Stools', href: '#bar-stools', image: '/download (3).jpeg' },
    ],
  },
  {
    id: 'home-decor',
    label: 'Home Decor',
    href: '#home-decor',
    subcategories: [
      { label: 'Rugs', href: '#rugs', image: '/download.jpeg' },
      { label: 'Lighting', href: '#lighting', image: '/download (1).jpeg' },
      { label: 'Mirrors', href: '#mirrors', image: '/download (2).jpeg' },
      { label: 'Wall Art', href: '#wall-art', image: '/download (3).jpeg' },
      { label: 'Decorative Accents', href: '#decorative-accents', image: '/images.jpeg' },
    ],
  },
  {
    id: 'office',
    label: 'Office',
    href: '#office',
    subcategories: [
      { label: 'Desks', href: '#desks', image: '/download.jpeg' },
      { label: 'Office Chairs', href: '#office-chairs', image: '/download (1).jpeg' },
      { label: 'Bookcases', href: '#bookcases', image: '/download (2).jpeg' },
      { label: 'Filing & Storage', href: '#office-storage', image: '/download (3).jpeg' },
    ],
  },
  {
    id: 'outdoor',
    label: 'Outdoor',
    href: '#outdoor',
    subcategories: [
      { label: 'Patio Sets', href: '#patio-sets', image: '/categories/outdoor.jpg' },
      { label: 'Lounge Chairs', href: '#lounge-chairs', image: '/download.jpeg' },
      { label: 'Umbrellas', href: '#umbrellas', image: '/download (1).jpeg' },
      { label: 'Fire Pits', href: '#fire-pits', image: '/download (2).jpeg' },
    ],
  },
  {
    id: 'premium',
    label: 'Premium',
    href: '#premium',
    isPremium: true,
    subcategories: [
      { label: 'Designer Sofas', href: '#designer-sofas', image: '/download.jpeg' },
      { label: 'Luxury Bedroom', href: '#luxury-bedroom', image: '/categories/bedroom.jpg' },
      { label: 'Artisan Dining', href: '#artisan-dining', image: '/categories/dining.jpg' },
      { label: 'Limited Collections', href: '#limited-collections', image: '/download (3).jpeg' },
    ],
  },
];

const ChevronIcon = () => (
  <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default function Navigation({ activeMenu, onCategoryHover }) {
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
          <li
            key={item.label}
            className="nav-item"
            onMouseEnter={() => onCategoryHover(item.id)}
          >
            <a
              href={item.href}
              className={`nav-link ${item.isPremium ? 'premium' : ''} ${activeMenu === item.id ? 'active' : ''}`}
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
