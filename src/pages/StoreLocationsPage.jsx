import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './StoreLocationsPage.css';

const StoreLocationsPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/admin/stores/public/all`);
      setStores(res.data);
      if (res.data.length > 0) {
        setSelectedStore(res.data[0]);
      }
      setError('');
    } catch (err) {
      setError('Failed to load stores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const extractMapSrc = (link) => {
    const srcMatch = link?.match(/src=["']([^"']+)["']/);
    return srcMatch ? srcMatch[1] : link;
  };

  return (
    <div className="store-locations-page">
      <Header />

      {/* Hero Section */}
      <section className="locations-hero">
        <div className="locations-hero-content">
          <h1>Our Stores & Warehouses</h1>
          <p>Find us in your area</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="stores-section">
        {loading ? (
          <div className="loading">Loading stores...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="stores-wrapper">
            {/* Left Sidebar */}
            <div className="stores-sidebar">
              {/* Search Box */}
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Type a postcode or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button className="search-btn">🔍</button>
              </div>

              {/* Filters */}
              <div className="filter-checkboxes">
                <label>
                  <input type="checkbox" defaultChecked /> Store
                </label>
                <label>
                  <input type="checkbox" defaultChecked /> Warehouse
                </label>
                <label>
                  <input type="checkbox" defaultChecked /> Premium Store
                </label>
              </div>

              {/* Stores List */}
              <div className="stores-list">
                {filteredStores.length === 0 ? (
                  <div className="no-stores-msg">No stores found</div>
                ) : (
                  filteredStores.map((store) => (
                    <div
                      key={store._id}
                      className={`store-list-card ${selectedStore?._id === store._id ? 'active' : ''}`}
                      onClick={() => setSelectedStore(store)}
                    >
                      <div className="store-card-header">
                        <svg className="pin-icon" viewBox="0 0 24 24" fill="#333">
                          <path d="M12 0C7.03 0 3 4.03 3 9c0 5.25 9 15 9 15s9-9.75 9-15c0-4.97-4.03-9-9-9zm0 12c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
                        </svg>
                        <h3>{store.name}</h3>
                      </div>
                      
                      {store.location && (
                        <p className="store-address">{store.location}</p>
                      )}

                      {store.description && (
                        <p className="store-description">{store.description}</p>
                      )}

                      {store.googleMapsLink && (
                        <a href={store.googleMapsLink} target="_blank" rel="noopener noreferrer" className="store-directions-link">
                          Directions
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Map */}
            <div className="stores-map-area">
              {selectedStore?.googleMapsLink ? (
                <iframe
                  key={selectedStore._id}
                  title={`${selectedStore.name} Location`}
                  src={extractMapSrc(selectedStore.googleMapsLink)}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="no-map">
                  <p>Select a store to view map</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Contact & Info Section */}
      <section className="contact-info-section">
        <div className="contact-info-container">
          <h2 className="contact-brand-title">DIAMOND MODERN FURNITURE</h2>
          <p className="contact-intro-text">Come explore our stores for a firsthand experience of our quality furniture.</p>

          {/* Contact Options */}
          <div className="contact-options">
            <div className="contact-option">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              </div>
              <h3>E-Mail Us</h3>
              <p>customerservice@lunafurn.com</p>
            </div>

            <div className="contact-option">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <h3>Call Us</h3>
              <p>(832) 900-3800</p>
            </div>

            <div className="contact-option">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4M12 8h.01"></path>
                </svg>
              </div>
              <h3>FAQs</h3>
              <p>Get quick answers</p>
            </div>
          </div>

          {/* Service Team Message */}
          <div className="service-team-message">
            <h2>Our customer service team is available to help you.</h2>
            <p>Monday to Saturday: 9 AM - 6 PM</p>
            <p>Sunday: 12 PM - 6 PM</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StoreLocationsPage;
