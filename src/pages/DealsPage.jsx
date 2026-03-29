import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import ShopByCategory from '../components/ShopByCategory/ShopByCategory';
import SlidingBanner from '../components/SlidingBanner/SlidingBanner';
import { API_BASE_URL, BACKEND_URL } from '../config/api';
import './DealsPage.css';

const buildDealRedirectPath = (deal) => {
  const catId = deal.redirectTarget?.categoryId;
  const subName = deal.redirectTarget?.subCategoryName;
  const subSub = deal.redirectTarget?.subSubCategoryName;

  const basePath = `/category/${catId}/sub/${encodeURIComponent(subName)}`;
  if (!subSub) return basePath;
  return `${basePath}?subSub=${encodeURIComponent(subSub)}`;
};

const imageUrl = (path) => {
  if (!path) return '/placeholder-image.png';
  return path.startsWith('http') ? path : `${BACKEND_URL}/${path}`;
};

function DealPromotionCard({ deal, onShop }) {
  const [idx, setIdx] = useState(0);
  const imgs = deal.images || [];

  useEffect(() => {
    setIdx(0);
  }, [deal._id]);

  return (
    <div className="promotion-item">
      <div className="promo-image-wrapper">
        <img
          src={imageUrl(imgs[idx])}
          alt={deal.title}
          className="promo-image"
          onError={(e) => {
            e.target.src = '/placeholder-image.png';
          }}
        />
        {imgs.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {imgs.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Show image ${i + 1}`}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  background: i === idx ? '#114b3d' : 'rgba(255,255,255,0.7)',
                }}
              />
            ))}
          </div>
        )}
      </div>
      <div className="promo-info">
        <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{deal.title}</h3>
        <p className="promo-discount" style={{ margin: 0 }}>
          {deal.dealOffer}
        </p>
        <button type="button" className="promo-btn" onClick={() => onShop(deal)}>
          {deal.buttonName}
        </button>
      </div>
    </div>
  );
}

export default function DealsPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [deals, setDeals] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [dealsError, setDealsError] = useState('');

  const dealsEndpoint = useMemo(() => `${API_BASE_URL}/deals/all`, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        setDealsLoading(true);
        setDealsError('');
        const res = await fetch(dealsEndpoint);
        if (!res.ok) throw new Error(`Failed to load deals (${res.status})`);
        const data = await res.json();
        setDeals(Array.isArray(data) ? data : []);
      } catch (e) {
        setDealsError(e.message || 'Failed to load deals');
        setDeals([]);
      } finally {
        setDealsLoading(false);
      }
    };
    loadDeals();
  }, [dealsEndpoint]);

  const handleCopy = () => {
    navigator.clipboard.writeText('SS5OFF');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShopDeal = (deal) => {
    navigate(buildDealRedirectPath(deal));
  };

  return (
    <>
      <Header />
      <div className="deals-page">
        <div className="deals-banner">
          <img src="/dealbanner.webp" alt="Spring Sale Banner" className="deals-banner-image" />
          <div className="deals-banner-overlay">
            <div className="deals-banner-content">
              <p className="deals-banner-subtitle">SPRING SALE IS HERE</p>
              <h1 className="deals-banner-title">UP TO 70% OFF</h1>
              <p className="deals-banner-description">Open the door to spring comfort.</p>
            </div>
          </div>
        </div>

        <div className="deals-container">
          <div className="promotions-wrapper">
            <div className="promotion-group">
              <h2 className="promotion-title">Featured Deals</h2>
              {dealsLoading && <div className="loading">Loading deals...</div>}
              {!dealsLoading && dealsError && <div className="error">{dealsError}</div>}
              {!dealsLoading && !dealsError && deals.length === 0 && (
                <div className="no-deals">No active deals yet. Check back soon!</div>
              )}
              {!dealsLoading && !dealsError && deals.length > 0 && (
                <div className="promotion-items-grid">
                  {deals.map((deal) => (
                    <DealPromotionCard key={deal._id} deal={deal} onShop={handleShopDeal} />
                  ))}
                </div>
              )}
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
                  <span className="copy-success">Copied!</span>
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
                  <img src="/living.jpg" alt="Living Room" className="bloom-image" />
                </div>
                <div className="bloom-info">
                  <p className="bloom-price">Up to 70% Off</p>
                  <button className="bloom-btn" onClick={() => navigate('/category/living-room')}>
                    Shop Living Room
                  </button>
                </div>
              </div>

              <div className="bloom-card">
                <div className="bloom-image-wrapper">
                  <img src="/dining2.jpg" alt="Dining Room" className="bloom-image" />
                </div>
                <div className="bloom-info">
                  <p className="bloom-price">Up to 70% Off</p>
                  <button className="bloom-btn" onClick={() => navigate('/category/dining-room')}>
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
                  <img src="/storage.jpg" alt="Storage" className="pick-image" />
                </div>
                <div className="pick-info">
                  <p className="pick-price">Starting at $99</p>
                  <button className="pick-btn" onClick={() => navigate('/category/storage')}>
                    Shop Storage
                  </button>
                </div>
              </div>

              <div className="fresh-pick-card">
                <div className="pick-image-wrapper">
                  <img src="/lighting.jpg" alt="Lighting" className="pick-image" />
                </div>
                <div className="pick-info">
                  <p className="pick-price">Starting at $49</p>
                  <button className="pick-btn" onClick={() => navigate('/category/lighting')}>
                    Shop Lighting
                  </button>
                </div>
              </div>

              <div className="fresh-pick-card">
                <div className="pick-image-wrapper">
                  <img src="/decor.jpg" alt="Decor" className="pick-image" />
                </div>
                <div className="pick-info">
                  <p className="pick-price">Starting at $39</p>
                  <button className="pick-btn" onClick={() => navigate('/category/decor')}>
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
            <button className="financing-btn" onClick={() => navigate('/financing')}>
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
