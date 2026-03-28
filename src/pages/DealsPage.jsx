import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import ShopByCategory from '../components/ShopByCategory/ShopByCategory';
import SlidingBanner from '../components/SlidingBanner/SlidingBanner';
import './DealsPage.css';

export default function DealsPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText('SS5OFF');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Header />
      <div className="deals-page">
        <div className="deals-banner">
          <img 
            src="/dealbanner.webp" 
            alt="Spring Sale Banner"
            className="deals-banner-image"
          />
          <div className="deals-banner-overlay">
            <div className="deals-banner-content">
              <p className="deals-banner-subtitle">SPRING SALE IS HERE</p>
              <h1 className="deals-banner-title">UP TO 70% OFF</h1>
              <p className="deals-banner-description">Open the door to spring comfort.</p>
            </div>
          </div>
        </div>
        
        <div className="deals-container">
          <div className="fresh-picks-section">
            <h2 className="fresh-picks-title">Fresh Start Picks</h2>
            <div className="fresh-picks-grid">
              <div className="fresh-pick-card">
                <div className="pick-image-wrapper">
                  <img 
                    src="/bedroom.jpg" 
                    alt="Mattresses"
                    className="pick-image"
                  />
                </div>
                <div className="pick-info">
                  <p className="pick-price">Starting at $139</p>
                  <button 
                    className="pick-btn"
                    onClick={() => navigate('/category/mattresses')}
                  >
                    Shop Mattresses
                  </button>
                </div>
              </div>

              <div className="fresh-pick-card">
                <div className="pick-image-wrapper">
                  <img 
                    src="/sofa.jpg" 
                    alt="Sofas"
                    className="pick-image"
                  />
                </div>
                <div className="pick-info">
                  <p className="pick-price">Starting at $179</p>
                  <button 
                    className="pick-btn"
                    onClick={() => navigate('/category/sofas')}
                  >
                    Shop Sofas
                  </button>
                </div>
              </div>

              <div className="fresh-pick-card">
                <div className="pick-image-wrapper">
                  <img 
                    src="/dining.jpg" 
                    alt="Dining Sets"
                    className="pick-image"
                  />
                </div>
                <div className="pick-info">
                  <p className="pick-price">Starting at $169</p>
                  <button 
                    className="pick-btn"
                    onClick={() => navigate('/category/dining-sets')}
                  >
                    Shop Dining Sets
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="promo-strip-container">
          <div className="promo-strip-content">
            <div className="promo-strip-text">
              <span className="highlight-text">Extra 5% OFF</span>
              <span className="normal-text">A small boost for your tax refund season.</span>
            </div>
            <div className="promo-code-box" onClick={handleCopy}>
              <div className="promo-code">SS5OFF</div>
              <div className="promo-copy">
                {copied ? (
                  <span className="copy-success">✓ Copied!</span>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>Copy code</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="deals-container" style={{ paddingTop: '40px' }}>
          <div className="home-bloom-section">
            <h2 className="home-bloom-title">Home in Bloom</h2>
            <div className="home-bloom-grid">
              <div className="bloom-card">
                <div className="bloom-image-wrapper">
                  <img 
                    src="/living.jpg" 
                    alt="Living Room"
                    className="bloom-image"
                  />
                </div>
                <div className="bloom-info">
                  <p className="bloom-price">Up to 70% Off</p>
                  <button 
                    className="bloom-btn"
                    onClick={() => navigate('/category/living-room')}
                  >
                    Shop Living Room
                  </button>
                </div>
              </div>

              <div className="bloom-card">
                <div className="bloom-image-wrapper">
                  <img 
                    src="/dining2.jpg" 
                    alt="Dining Room"
                    className="bloom-image"
                  />
                </div>
                <div className="bloom-info">
                  <p className="bloom-price">Up to 70% Off</p>
                  <button 
                    className="bloom-btn"
                    onClick={() => navigate('/category/dining-room')}
                  >
                    Shop Dining Room
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="fresh-picks-section" style={{ marginTop: '80px' }}>
            <h2 className="fresh-picks-title">More Top Picks</h2>
            <div className="fresh-picks-grid">
              <div className="fresh-pick-card">
                <div className="pick-image-wrapper">
                  <img 
                    src="/storage.jpg" 
                    alt="Storage"
                    className="pick-image"
                  />
                </div>
                <div className="pick-info">
                  <p className="pick-price">Starting at $99</p>
                  <button 
                    className="pick-btn"
                    onClick={() => navigate('/category/storage')}
                  >
                    Shop Storage
                  </button>
                </div>
              </div>

              <div className="fresh-pick-card">
                <div className="pick-image-wrapper">
                  <img 
                    src="/lighting.jpg" 
                    alt="Lighting"
                    className="pick-image"
                  />
                </div>
                <div className="pick-info">
                  <p className="pick-price">Starting at $49</p>
                  <button 
                    className="pick-btn"
                    onClick={() => navigate('/category/lighting')}
                  >
                    Shop Lighting
                  </button>
                </div>
              </div>

              <div className="fresh-pick-card">
                <div className="pick-image-wrapper">
                  <img 
                    src="/decor.jpg" 
                    alt="Decor"
                    className="pick-image"
                  />
                </div>
                <div className="pick-info">
                  <p className="pick-price">Starting at $39</p>
                  <button 
                    className="pick-btn"
                    onClick={() => navigate('/category/decor')}
                  >
                    Shop Decor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="deals-category-wrapper">
          <ShopByCategory />
        </div>


        <div className="deals-financing-section">
          <div className="financing-content">
            <p className="financing-subtitle">BUY NOW, PAY OVER TIME.</p>
            <h2 className="financing-title">
              We offer a range of flexible financing options tailored to your specific needs.
            </h2>
            <button 
              className="financing-btn"
              onClick={() => navigate('/financing')}
            >
              Check Purchase Options
            </button>
          </div>
        </div>
        <SlidingBanner />

      </div>
      <Footer />
    </>
  );
}
