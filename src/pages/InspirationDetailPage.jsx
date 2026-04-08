import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config/api';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './InspirationDetailPage.css';

const InspirationDetailPage = () => {
  const { inspirationId } = useParams();
  const navigate = useNavigate();
  const [inspiration, setInspiration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allInspirations, setAllInspirations] = useState([]);

  useEffect(() => {
    const fetchInspiration = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BACKEND_URL}/api/home-content/inspiration/${inspirationId}`
        );
        setInspiration(res.data);
        
        // Fetch all inspirations to show related ones
        const allRes = await axios.get(
          `${BACKEND_URL}/api/home-content/inspiration/get-all`
        );
        const allInspArray = Array.isArray(allRes.data) ? allRes.data : [];
        setAllInspirations(allInspArray.filter(insp => insp._id !== inspirationId));
      } catch (err) {
        console.error('Error fetching inspiration:', err);
        setError('Inspiration not found');
      } finally {
        setLoading(false);
      }
    };

    fetchInspiration();
  }, [inspirationId]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="inspiration-detail-container">
          <div className="inspiration-detail-loading">Loading...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !inspiration) {
    return (
      <>
        <Header />
        <div className="inspiration-detail-container">
          <div className="inspiration-detail-error">
            <h2>{error || 'Something went wrong'}</h2>
            <Link to="/inspiration" className="back-link">
              ← Back to Inspirations
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="inspiration-detail-container">
      <div className="inspiration-detail-header">
        <Link to="/inspiration" className="back-link">
          ← Back
        </Link>
      </div>

      <article className="inspiration-detail-content">
        <div className="inspiration-detail-hero">
          <img
            src={
              inspiration.image.startsWith('http')
                ? inspiration.image
                : `${BACKEND_URL}/${inspiration.image}`
            }
            alt={inspiration.title}
            className="inspiration-detail-image"
          />
        </div>

        <div className="inspiration-detail-body">
          <header className="inspiration-detail-header-content">
            <h1 className="inspiration-detail-title">
              {inspiration.title}
            </h1>
            <div className="inspiration-detail-meta">
              <span className="inspiration-date">
                {new Date(inspiration.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </header>

          <div className="inspiration-detail-text">
            {inspiration.description.split('\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="inspiration-paragraph">
                  {paragraph}
                </p>
              )
            ))}
          </div>

          {/* Share buttons */}
          <div className="inspiration-share">
            <span className="share-label">Share:</span>
            <div className="share-buttons">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn facebook"
                title="Share on Facebook"
              >
                f
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${inspiration.title}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn twitter"
                title="Share on Twitter"
              >
                𝕏
              </a>
              <button
                className="share-btn copy"
                title="Copy link"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard');
                }}
              >
                🔗
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Related Inspirations */}
      {allInspirations.length > 0 && (
        <section className="related-inspirations">
          <h2>More Inspirations</h2>
          <div className="related-grid">
            {allInspirations.slice(0, 3).map(insp => (
              <Link
                key={insp._id}
                to={`/inspiration/${insp._id}`}
                className="related-card"
              >
                <div className="related-image">
                  <img
                    src={
                      insp.image.startsWith('http')
                        ? insp.image
                        : `${BACKEND_URL}/${insp.image}`
                    }
                    alt={insp.title}
                  />
                </div>
                <h3 className="related-title">{insp.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
      </div>
      <Footer />
    </>
  );
};

export default InspirationDetailPage;
