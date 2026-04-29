import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './ContactPage.css';

export default function ContactPage() {
  const [isTextSectionOpen, setIsTextSectionOpen] = useState(false);
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storesError, setStoresError] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setStoresLoading(true);
        setStoresError('');
        const res = await axios.get(`${apiUrl}/admin/stores/public/all`);
        const fetchedStores = Array.isArray(res.data) ? res.data : [];
        setStores(fetchedStores);
      } catch (err) {
        setStoresError('Failed to load stores');
        console.error(err);
      } finally {
        setStoresLoading(false);
      }
    };

    fetchStores();
  }, [apiUrl]);

  const formatStoreHours = (hours) => {
    if (!hours) return [];

    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = hours;
    const weekdaysSame = monday && monday === tuesday && tuesday === wednesday && wednesday === thursday && thursday === friday && friday === saturday;

    if (weekdaysSame && sunday) {
      return [`Monday - Saturday: ${monday}`, `Sunday: ${sunday}`];
    }

    return [
      monday && `Monday: ${monday}`,
      tuesday && `Tuesday: ${tuesday}`,
      wednesday && `Wednesday: ${wednesday}`,
      thursday && `Thursday: ${thursday}`,
      friday && `Friday: ${friday}`,
      saturday && `Saturday: ${saturday}`,
      sunday && `Sunday: ${sunday}`,
    ].filter(Boolean);
  };

  const getStoreImage = (store) => {
    if (!store.image) return '/stores.webp';
    if (store.image.startsWith('http')) return store.image;
    if (store.image.startsWith('/')) return store.image;
    return `${apiUrl}/${store.image}`;
  };

  return (
    <>
      <Header />
      <main className="contact-page">
        <section className="contact-hero">
          <div className="contact-hero-overlay" />
          <div className="contact-hero-content">
            <h1>Contact Us</h1>
          </div>
        </section>

        <section className="help-section">
          <div className="help-inner">
            <h2>We're Here to Help.</h2>
            <div className="contact-cards">
              <a
              href="mailto:customerservice@dimondmodernfurniture.com"
              className="contact-card contact-card-link"
              aria-label="Email us"
            >
              <div className="contact-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="6" width="16" height="12" rx="3" />
                  <path d="M4 8l8 6 8-6" />
                </svg>
              </div>
              <h3>E-Mail Us</h3>
              <p>customerservice@dimondmodernfurniture.com</p>
            </a>
            <a
              href="tel:+18329003800"
              className="contact-card contact-card-link"
              aria-label="Call us"
            >
              <div className="contact-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.91 19.91 0 0 1 2.08 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12.81.33 1.6.62 2.35a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.73-1.73a2 2 0 0 1 2.11-.45c.75.29 1.54.5 2.35.62A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h3>Call Us</h3>
              <p>(832) 900-3800</p>
            </a>
            <Link to="/faqs" className="contact-card contact-card-link" aria-label="FAQs">
              <div className="contact-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8a2 2 0 0 1 2 2c0 2-2 2-2 4" />
                  <circle cx="12" cy="17" r="1" />
                </svg>
              </div>
              <h3>FAQs</h3>
              <p>Get quick answers to common questions.</p>
            </Link>
            </div>
          </div>
        </section>

        <section className="support-hours">
          <div className="support-inner">
            <h3>Our customer service team is available to help you.</h3>
            <p>Monday to Saturday: 9 AM - 6 PM</p>
            <p>Sunday: 12 PM - 6 PM</p>
          </div>
        </section>

        <section className="condition-item">
          <button
            type="button"
            className={`condition-toggle ${isTextSectionOpen ? 'active' : ''}`}
            onClick={() => setIsTextSectionOpen((prev) => !prev)}
          >
            <span className="condition-icon">💬</span>
            Text Messaging Terms and Options
            <span className="toggle-arrow">⌄</span>
          </button>
          {isTextSectionOpen && (
            <div className="condition-content">
              <p><strong>CONSENT, OPT-IN & OPT-OUT for Text Messaging</strong></p>
              <p>
                Prefer to message us instead? Text us at <strong>(832) 900-3800</strong> if you need help. By texting us, you consent to receive text messages from Dimond Modern Furniture at the mobile number you use to text and you are opting-in to receive future messages or a phone call to the number you provided. Message & Data rates may apply. View our <Link to="/privacy-policy">Terms</Link> and <Link to="/privacy-policy">Privacy Policy</Link> for more information.
              </p>
              <p>
                Customers can opt-out of receiving SMS/text messages by replying with <strong>Stop</strong>, <strong>Unsubscribe</strong>, or <strong>Cancel</strong>.
              </p>
            </div>
          )}
        </section>

        <section className="store-section">
          <div className="store-section-left">
            <div className="store-section-header">
              <h1 className="store-section-tag">Our Stores & Warehouses </h1>
              <h2 className="store-section-title">Find a Dimond Modern Furniture location near you</h2>
            </div>

            {storesLoading ? (
              <div className="store-loading">Loading stores...</div>
            ) : storesError ? (
              <div className="store-error">{storesError}</div>
            ) : stores.length === 0 ? (
              <div className="store-loading">No stores available.</div>
            ) : (
              <div className="store-list">
                {stores.map((store) => {
                  const details = [];
                  if (store.location) details.push(store.location);
                  if (store.description) details.push(store.description);
                  details.push(...formatStoreHours(store.hours));

                  return (
                    <div key={store._id} className="store-card">
                      <div className="store-card-image">
                        <img src={getStoreImage(store)} alt={`${store.name} store`} />
                      </div>
                      <div className="store-card-info">
                        <p className="store-subtitle">Dimond Modern Furniture</p>
                        <h3>{store.name}</h3>
                        <ul className="store-details-list">
                          {details.map((detail, index) => (
                            <li key={index}>{detail}</li>
                          ))}
                        </ul>
                        <a
                          href={store.googleMapsLink || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="store-directions-btn"
                        >
                          Get Directions
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="contact-actions">
          <div className="contact-actions-inner">
            <div className="contact-actions-text">
              <h1>Your feedback matters.</h1>
              <h2>Your feedback helps us improve. Please share your thoughts and experiences with us. We are committed to providing you with the best possible service and quality products.</h2>
            </div>
            <div className="contact-actions-buttons">
              <a
                href="mailto:customer@diomonad.com?subject=Customer%20Inquiry"
                className="contact-action-btn"
              >
                Send E-Mail
              </a>
              <a href="tel:+1234567890" className="contact-action-link">
                Call Us
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
