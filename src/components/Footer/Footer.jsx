import { Link } from 'react-router-dom';
import './Footer.css';
import StayInTouch from './StayInTouch';
export default function Footer() {
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <StayInTouch />

      <div className="benefits-strip">
        <div className="benefit">
          <div className="icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="6" width="18" height="11" rx="1"/>
              <path d="M19 9h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-2"/>
              <circle cx="6" cy="19" r="2"/>
              <circle cx="16" cy="19" r="2"/>
            </svg>
          </div>
          <div className="text"><strong>Fast Shipping, Nationwide!</strong><div className="sub">Right to your location.</div></div>
        </div>
        <div className="benefit">
          <div className="icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </div>
          <div className="text"><strong>Easy Returns & Exchanges</strong><div className="sub">30 days for easy returns.</div></div>
        </div>
        <div className="benefit">
          <div className="icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 8v13H3V8"/>
              <path d="M1 3h22v5H1z"/>
              <path d="M10 12h4"/>
            </svg>
          </div>
          <div className="text"><strong>Order Updates & Tracking</strong><div className="sub">Check your order status.</div></div>
        </div>
        <div className="benefit">
          <div className="icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <path d="M2 10h20"/>
            </svg>
          </div>
          <div className="text"><strong>Easy Financing Options</strong><div className="sub">Flexible payments, your way.</div></div>
        </div>
      </div>

      <div
        className="back-to-top"
        role="button"
        tabIndex={0}
        onClick={handleBackToTop}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBackToTop();
          }
        }}
      >
        Back to top
      </div>

      <div className="footer-main">
        <div className="footer-col about">
          <Link to="/">
            <img src="/logo.svg" alt="Furniture Store" className="footer-logo" />
          </Link>
          <p className="about-text">Our Furniture Store, a top 100 U.S. furniture retailer, offers stylish and affordable furniture with fast delivery and a seamless shopping experience. Shop our wide selection of high-quality furniture, including sofas, beds, dining sets, and more.</p>

          <div className="payment-icons" aria-label="Accepted payment methods">
            <span className="pay-pill">Amazon</span>
            <span className="pay-pill">AMEX</span>
            <span className="pay-pill">Apple Pay</span>
            <span className="pay-pill">Diners</span>
            <span className="pay-pill">Discover</span>
            <span className="pay-pill">Google Pay</span>
            <span className="pay-pill">Mastercard</span>
            <span className="pay-pill">Shop Pay</span>
            <span className="pay-pill">Visa</span>
          </div>
        </div>
        <div className="footer-col">
          <h4>About Us</h4>
          <ul>
            <li>Our Story</li>
            <li>Why Dimond Modern Furniture?</li>
            <li>Reviews</li>
            <li>Financing</li>
            <li>News & Blog</li>
            <li>Careers</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Resources</h4>
          <ul>
            <li>Track My Order</li>
            <li>Damage Claim</li>
            <li>Return Policy</li>
            <li>Delivery Policy</li>
            <li>Shipping Protection Plan</li>
            <li>FAQs</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Need Help?</h4>
          <p><strong>Email:</strong> customerservice@lunafurn.com</p>
          <p><strong>Call/Text:</strong> (832) 900-3800</p>
          <Link to="/contact-us" className="footer-link" style={{marginTop: '16px'}}>Contact Us</Link>
          <Link to="/store-locations" className="footer-link">Store Locator</Link>

          <div className="social-row" aria-label="Social media links">
            <span className="social" title="Facebook">f</span>
            <span className="social" title="YouTube">▶</span>
            <span className="social" title="Instagram">◉</span>
            <span className="social" title="TikTok">♪</span>
            <span className="social" title="Pinterest">P</span>
            <span className="social" title="X/Twitter">✕</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="left">© 2026 Furniture Store.</div>
        <div className="right">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <a href="#">Terms Of Use</a>
        </div>
      </div>
    </footer>
  );
}
