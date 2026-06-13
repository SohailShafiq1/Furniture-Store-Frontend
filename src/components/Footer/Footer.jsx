import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaInstagram, FaYoutube, FaTiktok, FaPinterest, FaTwitter, FaGift, FaPencilAlt, FaRegHandshake, FaDollarSign, FaTags, FaMapMarkerAlt, FaFacebook } from 'react-icons/fa';
import { API_BASE_URL } from '../../config/api';
import './Footer.css';

const benefitItems = [
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="6" width="18" height="11" rx="1" />
        <path d="M19 9h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-2" />
        <circle cx="6" cy="19" r="2" />
        <circle cx="16" cy="19" r="2" />
      </svg>
    ),
    title: 'Fast Shipping, Nationwide!',
    sub: 'Right to your location.'
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    ),
    title: 'Easy Returns & Exchanges',
    sub: '30 days for easy returns.'
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 8v13H3V8" />
        <path d="M1 3h22v5H1z" />
        <path d="M10 12h4" />
      </svg>
    ),
    title: 'Order Updates & Tracking',
    sub: 'Check your order status.'
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
    title: 'Easy Financing Options',
    sub: 'Flexible payments, your way.'
  }
];

const actionCards = [
  {
    icon: <FaDollarSign />,
    title: 'FINANCING',
    description: 'Flexible payment plans to fit your world lifestyle.',
    link: '/financing',
    cta: 'LEARN MORE'
  },
  {
    icon: <FaTags />,
    title: 'THE DEALS BOX',
    description: 'Shop seasonal savings and exclusive offers.',
    link: '/deals',
    cta: 'SHOP DEALS'
  },
  {
    icon: <FaMapMarkerAlt />,
    title: 'STORE LOCATIONS',
    description: 'Find your nearest showroom and visit us today.',
    link: '/store-locations',
    cta: 'VIEW LOCATIONS'
  }
];

export default function Footer() {
  const [activeBenefit, setActiveBenefit] = useState(0);
  const [activeAction, setActiveAction] = useState(0);
  const [openFooterSections, setOpenFooterSections] = useState({
    aboutUs: true,
    resources: true
  });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const intervalRef = useRef(null);
  const actionIntervalRef = useRef(null);
  const newsletterEmailRef = useRef(null);
  const benefitTouchStartRef = useRef(null);
  const actionTouchStartRef = useRef(null);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToBenefit = (nextIndex) => {
    setActiveBenefit(nextIndex);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    intervalRef.current = window.setInterval(() => {
      setActiveBenefit((prev) => (prev + 1) % benefitItems.length);
    }, 2000);
  };

  const prevBenefit = () => goToBenefit((activeBenefit + benefitItems.length - 1) % benefitItems.length);
  const nextBenefit = () => goToBenefit((activeBenefit + 1) % benefitItems.length);

  const handleTouchStart = (touchStartRef) => (event) => {
    const touch = event.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };
  };

  const handleTouchEnd = (touchStartRef, onSwipeLeft, onSwipeRight) => (event) => {
    const startPoint = touchStartRef.current;
    if (!startPoint) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - startPoint.x;
    const deltaY = touch.clientY - startPoint.y;
    const swipeThreshold = 50;

    touchStartRef.current = null;

    if (Math.abs(deltaX) < swipeThreshold || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      onSwipeLeft();
      return;
    }

    onSwipeRight();
  };

  const toggleFooterSection = (sectionKey) => {
    setOpenFooterSections((prevState) => ({
      ...prevState,
      [sectionKey]: !prevState[sectionKey]
    }));
  };

  const goToAction = (nextIndex) => {
    setActiveAction(nextIndex);
    if (actionIntervalRef.current) {
      window.clearInterval(actionIntervalRef.current);
    }
    actionIntervalRef.current = window.setInterval(() => {
      setActiveAction((prev) => (prev + 1) % actionCards.length);
    }, 2000);
  };

  const prevAction = () => goToAction((activeAction + actionCards.length - 1) % actionCards.length);
  const nextAction = () => goToAction((activeAction + 1) % actionCards.length);

  const handleNewsletterSubmit = async (event) => {
    event.preventDefault();

    const trimmedEmail = newsletterEmail.trim();
    if (!trimmedEmail) {
      if (newsletterEmailRef.current) {
        newsletterEmailRef.current.setCustomValidity('Please add email first');
        newsletterEmailRef.current.reportValidity();
        newsletterEmailRef.current.setCustomValidity('');
        newsletterEmailRef.current.focus();
      } else {
        window.alert('Please add email first');
      }
      return;
    }

    if (newsletterEmailRef.current && !newsletterEmailRef.current.checkValidity()) {
      newsletterEmailRef.current.reportValidity();
      return;
    }

    setNewsletterSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/newsletter-subscribers/subscribe`, {
        email: trimmedEmail
      });

      window.alert(response.data?.message || 'Your email is saved successfully');
      setNewsletterEmail('');
    } catch (error) {
      window.alert(error.response?.data?.message || 'Failed to save email');
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setActiveBenefit((prev) => (prev + 1) % benefitItems.length);
    }, 2000);

    actionIntervalRef.current = window.setInterval(() => {
      setActiveAction((prev) => (prev + 1) % actionCards.length);
    }, 2000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      if (actionIntervalRef.current) {
        window.clearInterval(actionIntervalRef.current);
      }
    };
  }, []);

  return (
    <footer className="site-footer">
      <div
        className="benefits-carousel"
        onTouchStart={handleTouchStart(benefitTouchStartRef)}
        onTouchEnd={handleTouchEnd(benefitTouchStartRef, nextBenefit, prevBenefit)}
        onTouchCancel={() => {
          benefitTouchStartRef.current = null;
        }}
      >
        <button type="button" className="benefits-nav prev" onClick={prevBenefit} aria-label="Previous benefit">
          ‹
        </button>
        <div className="benefits-strip">
          {benefitItems.map((item, idx) => (
            <div key={item.title} className={`benefit ${activeBenefit === idx ? 'active' : ''}`}>
              <div className="icon">{item.icon}</div>
              <div className="text">
                <strong>{item.title}</strong>
                <div className="sub">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="benefits-nav next" onClick={nextBenefit} aria-label="Next benefit">
          ›
        </button>
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

      <div
        className="actions-carousel"
        onTouchStart={handleTouchStart(actionTouchStartRef)}
        onTouchEnd={handleTouchEnd(actionTouchStartRef, nextAction, prevAction)}
        onTouchCancel={() => {
          actionTouchStartRef.current = null;
        }}
      >
        <button type="button" className="actions-nav prev" onClick={prevAction} aria-label="Previous action">
          ‹
        </button>
        <div className="footer-actions">
          {actionCards.map((card, idx) => (
            <div key={card.title} className={`footer-action-card ${activeAction === idx ? 'active' : ''}`}>
              <div className="footer-action-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <Link to={card.link} className="footer-action-button">
                {card.cta}
              </Link>
            </div>
          ))}
        </div>
        <button type="button" className="actions-nav next" onClick={nextAction} aria-label="Next action">
          ›
        </button>
      </div>

      <div className="footer-main">
        <div className="footer-col footer-col-links footer-accordion-col">
          <button
            type="button"
            className="footer-accordion-trigger"
            aria-expanded={openFooterSections.aboutUs}
            onClick={() => toggleFooterSection('aboutUs')}
          >
            <h4>About Us</h4>
            <span className={`footer-accordion-arrow ${openFooterSections.aboutUs ? 'open' : ''}`} aria-hidden="true">⌄</span>
          </button>
          <ul className={`footer-accordion-panel ${openFooterSections.aboutUs ? 'open' : ''}`}>
            <li><Link to="/about-us" className="footer-list-link">Our Story</Link></li>
            <li><Link to="/why-dimond-modern-furniture" className="footer-list-link">Why Diamond Modern Furniture?</Link></li>
            <li><Link to="/reviews" className="footer-list-link">Reviews</Link></li>
            <li><Link to="/financing" className="footer-list-link">Financing</Link></li>
            <li><Link to="/news-blog" className="footer-list-link">News & Blog</Link></li>
            <li><Link to="/careers" className="footer-list-link">Careers</Link></li>
          </ul>
        </div>
        <div className="footer-col footer-col-links footer-accordion-col">
          <button
            type="button"
            className="footer-accordion-trigger"
            aria-expanded={openFooterSections.resources}
            onClick={() => toggleFooterSection('resources')}
          >
            <h4>Resources</h4>
            <span className={`footer-accordion-arrow ${openFooterSections.resources ? 'open' : ''}`} aria-hidden="true">⌄</span>
          </button>
          <ul className={`footer-accordion-panel ${openFooterSections.resources ? 'open' : ''}`}>
            <li><Link to="/track-order" className="footer-list-link">Track My Order</Link></li>
            <li><Link to="/damage-claim" className="footer-list-link">Damage Claim</Link></li>
            <li><Link to="/return-policy" className="footer-list-link">Return Policy</Link></li>
            <li><Link to="/delivery-policy" className="footer-list-link">Delivery Policy</Link></li>
            <li><Link to="/shipping-protection-plan" className="footer-list-link">Shipping Protection Plan</Link></li>
            <li><Link to="/faqs" className="footer-list-link">FAQs</Link></li>
          </ul>
        </div>
        <div className="footer-col footer-col-contact">
          <h4>Contact Us</h4>
          <Link to="/contact-us" className="footer-list-link">Contact Us</Link>
          <ul>
            <li><a href="tel:(877) 349-5003" className="footer-list-link"> <span style={{ fontWeight: 'bold' }}> Call/Text:</span>  (877) 349-5003</a></li>
            <li><a href="mailto:Management@3roompackages.com" className="footer-list-link"> <span style={{ fontWeight: 'bold' }}> Email:</span> Management@3roompackages.com</a></li>
          </ul>
        </div>
        <div className="footer-col footer-col-newsletter">  
          <h4>Drop your email to get first dibs on new arrivals, sales, and more.</h4>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit} noValidate>
            <div className="newsletter-field">
              <input
                ref={newsletterEmailRef}
                type="email"
                required
                placeholder="Your email"
                aria-label="Email address"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                autoComplete="email"
              />
              <button type="submit" aria-label="Submit email" disabled={newsletterSubmitting}>→</button>
            </div>
          </form>
          <div className="social-row" aria-label="Social media links">
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="YouTube"><FaYoutube /></a>
            <a href="#" aria-label="TikTok"><FaTiktok /></a>
            <a href="#" aria-label="Pinterest"><FaPinterest /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Twitter"><FaFacebook /></a>
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
