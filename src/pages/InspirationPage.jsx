import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config/api';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './InspirationPage.css';

const InspirationPage = () => {
  const [inspirations, setInspirations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllInspirations = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BACKEND_URL}/api/home-content/inspiration/get-all`
        );
        setInspirations(res.data);
      } catch (err) {
        console.error('Error fetching inspirations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllInspirations();
  }, []);

  return (
    <>
      <Header />
      <div className="inspiration-page">
      <div className="inspiration-page-header">
        <Link to="/" className="home-link">← Back Home</Link>
        <h1>Inspiration</h1>
        <p>Discover home design ideas and tips to create your perfect space</p>
      </div>

      {loading ? (
        <div className="inspiration-page-loading">Loading inspirations...</div>
      ) : inspirations.length > 0 ? (
        <div className="inspiration-page-grid">
          {inspirations.map(inspiration => (
            <Link
              key={inspiration._id}
              to={`/inspiration/${inspiration._id}`}
              className="inspiration-page-card"
            >
              <div className="inspiration-page-image-container">
                <img
                  src={
                    inspiration.image.startsWith('http')
                      ? inspiration.image
                      : `${BACKEND_URL}/${inspiration.image}`
                  }
                  alt={inspiration.title}
                  className="inspiration-page-image"
                />
              </div>
              <div className="inspiration-page-content">
                <h3 className="inspiration-page-title">
                  {inspiration.title}
                </h3>
                <p className="inspiration-page-description">
                  {inspiration.description.substring(0, 120)}...
                </p>
                <span className="read-more">Read More →</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="inspiration-page-empty">
          <p>No inspirations available yet.</p>
        </div>
      )}
    </div>
      <Footer />
    </>
  );
};

export default InspirationPage;
