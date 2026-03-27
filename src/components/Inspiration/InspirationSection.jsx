import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../../config/api';
import './InspirationSection.css';

const InspirationSection = () => {
  const [inspirations, setInspirations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInspirations = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BACKEND_URL}/api/home-content/inspiration/get-all`
        );
        setInspirations(res.data.slice(0, 4)); // Show 4 inspirations
      } catch (err) {
        console.error('Error fetching inspirations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInspirations();
  }, []);

  if (loading || inspirations.length === 0) {
    return null;
  }

  return (
    <section className="inspiration-updates">
      <div className="inspiration-container">
        <div className="inspiration-header-wrapper">
          <h2 className="inspiration-title">Inspiration</h2>
          <Link to="/inspiration" className="view-all-inspiration">View all</Link>
        </div>
        <div className="inspiration-grid">
          {inspirations.map((item) => (
            <Link key={item._id} to={`/inspiration/${item._id}`} className="inspiration-card-link">
              <div className="inspiration-card">
                <div className="inspiration-image-wrapper">
                  <img 
                    src={
                      item.image.startsWith('http')
                        ? item.image
                        : `${BACKEND_URL}/${item.image}`
                    }
                    alt={item.title}
                    className="inspiration-image"
                  />
                </div>
                <div className="inspiration-content">
                  <h3 className="inspiration-card-title">{item.title}</h3>
                  <p className="inspiration-description">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InspirationSection;
