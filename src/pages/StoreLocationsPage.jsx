import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './StoreLocationsPage.css';

const StoreLocationsPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/admin/stores/public/all`);
      const storesArray = Array.isArray(res.data) ? res.data : [];
      setStores(storesArray);
      setError('');
    } catch (err) {
      setError('Failed to load stores');
      setStores([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatStoreHours = (hours) => {
    if (!hours) return [];

    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = hours;
    const weekdaySame = monday && monday === tuesday && tuesday === wednesday && wednesday === thursday && thursday === friday;

    const lines = [];
    if (weekdaySame) {
      lines.push(`Monday - Friday: ${monday}`);
    } else {
      monday && lines.push(`Monday: ${monday}`);
      tuesday && lines.push(`Tuesday: ${tuesday}`);
      wednesday && lines.push(`Wednesday: ${wednesday}`);
      thursday && lines.push(`Thursday: ${thursday}`);
      friday && lines.push(`Friday: ${friday}`);
    }

    saturday && lines.push(`Saturday: ${saturday}`);
    sunday && lines.push(`Sunday: ${sunday}`);
    return lines.filter(Boolean);
  };

  const renderLocationItem = (location) => {
    if (!location) return null;
    const parts = location.split(', ');
    if (parts.length > 1) {
      return (
        <li className="store-location-item">
          <span>{parts[0]}</span>
          <span className="store-location-subline">{parts.slice(1).join(', ')}</span>
        </li>
      );
    }
    return <li>{location}</li>;
  };

  const getStoreImage = (store) => {
    if (!store.image) return '/stores.webp';
    if (store.image.startsWith('http')) return store.image;
    if (store.image.startsWith('/')) return store.image;
    return `${apiUrl}/${store.image}`;
  };

  const getMapLink = (link) => {
    if (!link) return '#';
    const srcMatch = link.match(/src=["']([^"']+)["']/);
    return srcMatch ? srcMatch[1] : link;
  };

  return (
    <div className="store-locations-page">
      <Header />

      <main className="store-locations-content">
        <section className="locations-hero">
          <div className="hero-copy">
            <h1>Our Stores & Warehouses</h1>
            <p>Come explore our stores for a firsthand experience of our quality furniture.</p>
          </div>
        </section>

        <section className="stores-list-section">
          {loading ? (
            <div className="status-message">Loading stores...</div>
          ) : error ? (
            <div className="status-message error">{error}</div>
          ) : stores.length === 0 ? (
            <div className="status-message">No store data available.</div>
          ) : (
            <div className="store-card-container">
              {(() => {
                const store = stores[0];
                const hours = formatStoreHours(store.hours);
                return (
                  <article className="store-card" key={store._id}>
                    <div className="store-card-image">
                      <img src={getStoreImage(store)} alt={store.name} />
                    </div>
                    <div className="store-card-text">
                      <p className="store-card-brand">DIMOND MODERN FURNITURE</p>
                      <h2>{store.name}</h2>
                      <ul className="store-card-details">
                        {renderLocationItem(store.location)}
                        {hours.map((line, index) => (
                          <li key={index}>{line}</li>
                        ))}
                      </ul>
                      {store.googleMapsLink && (
                        <a
                          href={getMapLink(store.googleMapsLink)}
                          target="_blank"
                          rel="noreferrer"
                          className="store-card-button"
                        >
                          Get Directions
                        </a>
                      )}
                    </div>
                  </article>
                );
              })()}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default StoreLocationsPage;
