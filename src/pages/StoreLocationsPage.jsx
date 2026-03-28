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

      <Footer />
    </div>
  );
};

export default StoreLocationsPage;
