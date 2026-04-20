import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import ShopByCategory from '../components/ShopByCategory/ShopByCategory';
import SlidingBanner from '../components/SlidingBanner/SlidingBanner';
import { API_BASE_URL, BACKEND_URL } from '../config/api';
import './DealsPage.css';

const buildDealRedirectPath = (deal, imageItem) => {
  const itemTarget = imageItem?.target || null;
  const isValidCollectionTarget =
    itemTarget?.targetType === 'collection' && !!itemTarget?.collectionName;
  const isValidCategoryTarget =
    itemTarget?.targetType === 'category' && !!itemTarget?.categoryId && !!itemTarget?.subCategoryName;
  const redirectSource = isValidCollectionTarget || isValidCategoryTarget ? itemTarget : deal.redirectTarget || {};
  const redirectType = redirectSource.targetType || 'category';

  if (redirectType === 'collection') {
    const collectionName = redirectSource.collectionName;
    if (!collectionName) return '/deals/collection';
    return `/deals/collection?name=${encodeURIComponent(collectionName)}`;
  }

  const catId = redirectSource.categoryId;
  const subName = redirectSource.subCategoryName;
  const subSub =
    redirectSource.subSubCategoryName || imageItem?.subSubCategoryName || deal.redirectTarget?.subSubCategoryName;

  const basePath = `/category/${catId}/sub/${encodeURIComponent(subName)}`;
  if (!subSub) return basePath;
  return `${basePath}?subSub=${encodeURIComponent(subSub)}`;
};

const imageUrl = (path) => {
  if (!path) return '/placeholder-image.png';
  return path.startsWith('http') ? path : `${BACKEND_URL}/${path}`;
};

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

  const normalizedDeals = useMemo(
    () =>
      deals.map((deal) => ({
        ...deal,
        images: (deal.images || []).map((img) =>
          typeof img === 'string'
            ? {
                image: img,
                buttonName: deal.buttonName || 'Shop Now',
                subSubCategoryName: deal.redirectTarget?.subSubCategoryName || '',
              }
            : img
        ),
      })),
    [deals]
  );

  const featuredDeal = useMemo(
    () =>
      normalizedDeals.find((deal) => deal.isFeaturedDeal && (deal.images?.length || 0) >= 3) ||
      normalizedDeals.find((deal) => (deal.images?.length || 0) >= 3),
    [normalizedDeals]
  );

  const threeDeals = useMemo(
    () => normalizedDeals.filter((deal) => deal.images.length >= 3 && deal._id !== featuredDeal?._id),
    [normalizedDeals, featuredDeal?._id]
  );

  const twoDeals = useMemo(
    () => normalizedDeals.filter((deal) => deal.images.length === 2),
    [normalizedDeals]
  );

  const promoSource = useMemo(() => {
    return (
      threeDeals.find((deal) => deal.promoStrip?.enabled) ||
      normalizedDeals.find((deal) => deal.promoStrip?.enabled)
    );
  }, [threeDeals, normalizedDeals]);

  const [dealStartIndices, setDealStartIndices] = useState({});
  const [featuredStartIndex, setFeaturedStartIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setFeaturedStartIndex(0);
  }, [featuredDeal?._id]);

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  useEffect(() => {
    const next = {};
    threeDeals.forEach((deal) => {
      next[deal._id] = 0;
    });
    setDealStartIndices(next);
  }, [threeDeals]);

  const handleShopDeal = (onClick) => {
    onClick();
  };

  const featuredVisibleCount = isMobile ? 1 : 3;
  const featuredMaxStart = Math.max(0, (featuredDeal?.images?.length || 0) - featuredVisibleCount);

  useEffect(() => {
    setFeaturedStartIndex((prev) => Math.min(prev, featuredMaxStart));
  }, [featuredMaxStart]);

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
          {dealsLoading && <div className="loading">Loading deals...</div>}
          {!dealsLoading && dealsError && <div className="error">{dealsError}</div>}
          {!dealsLoading && !dealsError && threeDeals.length === 0 && twoDeals.length === 0 && <div className="no-deals">No deals available.</div>}
          {!dealsLoading &&
            !dealsError &&
            threeDeals.map((deal, idx) => {
              const isThree = deal.images.length >= 3;
              const sectionClass = isThree ? 'fresh-picks-section' : 'home-bloom-section';
              const titleClass = isThree ? 'fresh-picks-title' : 'home-bloom-title';
              const gridClass = isThree ? 'fresh-picks-grid' : 'home-bloom-grid';
              const cardClass = isThree ? 'fresh-pick-card' : 'bloom-card';
              const imageWrapperClass = isThree ? 'pick-image-wrapper' : 'bloom-image-wrapper';
              const imageClass = isThree ? 'pick-image' : 'bloom-image';
              const infoClass = isThree ? 'pick-info' : 'bloom-info';
              const offerClass = isThree ? 'pick-price' : 'bloom-price';
              const buttonClass = isThree ? 'pick-btn' : 'bloom-btn';
              const dealStart = dealStartIndices[deal._id] || 0;
              const maxDealStart = Math.max(0, deal.images.length - 3);
              const visibleImages = isThree ? deal.images.slice(dealStart, dealStart + 3) : deal.images;

              return (
                <div key={deal._id} style={{ marginTop: idx === 0 ? 0 : 40 }}>
                  <div className={sectionClass}>
                    <h2 className={titleClass}>{deal.title}</h2>
                    {isThree && deal.images.length > 3 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <button
                          type="button"
                          onClick={() =>
                            setDealStartIndices((prev) => ({
                              ...prev,
                              [deal._id]: Math.max(0, (prev[deal._id] || 0) - 1),
                            }))
                          }
                          disabled={dealStart === 0}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            border: '2px solid #222',
                            background: 'white',
                            fontSize: 30,
                            lineHeight: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            cursor: dealStart === 0 ? 'not-allowed' : 'pointer',
                            opacity: dealStart === 0 ? 0.35 : 1,
                          }}
                          aria-label="Previous deal images"
                        >
                          <span style={{ transform: 'translateY(-1px)' }}>&lsaquo;</span>
                        </button>
                        <div className={gridClass} style={{ flex: 1 }}>
                          {visibleImages.map((img) => (
                            <div key={`${deal._id}-${img.image}`} className={cardClass}>
                              <div className={imageWrapperClass}>
                                <img
                                  src={imageUrl(img.image)}
                                  alt={deal.title}
                                  className={imageClass}
                                  onError={(e) => {
                                    e.target.src = '/placeholder-image.png';
                                  }}
                                />
                              </div>
                              <div className={infoClass}>
                                <p className={offerClass}>{deal.dealOffer}</p>
                                <button
                                  className={buttonClass}
                                  onClick={() => handleShopDeal(() => navigate(buildDealRedirectPath(deal, img)))}
                                >
                                  {img.buttonName}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setDealStartIndices((prev) => ({
                              ...prev,
                              [deal._id]: Math.min(maxDealStart, (prev[deal._id] || 0) + 1),
                            }))
                          }
                          disabled={dealStart >= maxDealStart}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            border: '2px solid #222',
                            background: 'white',
                            fontSize: 30,
                            lineHeight: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            cursor: dealStart >= maxDealStart ? 'not-allowed' : 'pointer',
                            opacity: dealStart >= maxDealStart ? 0.35 : 1,
                          }}
                          aria-label="Next deal images"
                        >
                          <span style={{ transform: 'translateY(-1px)' }}>&rsaquo;</span>
                        </button>
                      </div>
                    ) : (
                      <div className={gridClass}>
                        {visibleImages.map((img) => (
                          <div key={`${deal._id}-${img.image}`} className={cardClass}>
                            <div className={imageWrapperClass}>
                              <img
                                src={imageUrl(img.image)}
                                alt={deal.title}
                                className={imageClass}
                                onError={(e) => {
                                  e.target.src = '/placeholder-image.png';
                                }}
                              />
                            </div>
                            <div className={infoClass}>
                              <p className={offerClass}>{deal.dealOffer}</p>
                              <button
                                className={buttonClass}
                                onClick={() => handleShopDeal(() => navigate(buildDealRedirectPath(deal, img)))}
                              >
                                {img.buttonName}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          {!dealsLoading && !dealsError && promoSource && (
            <div className="promo-strip-container" style={{ marginTop: 40 }}>
              <div className="promo-strip-content">
                <div className="promo-strip-text">
                  <span className="highlight-text">{promoSource.promoStrip?.highlightText || 'Extra 5% OFF'}</span>
                  <span className="normal-text">
                    {promoSource.promoStrip?.normalText || 'A small boost for your tax refund season.'}
                  </span>
                </div>
                <div className="promo-code-box" onClick={handleCopy}>
                  <div className="promo-code">{promoSource.promoStrip?.code || 'SS5OFF'}</div>
                  <div className="promo-copy">
                    {copied ? (
                      <span className="copy-success">Copied!</span>
                    ) : (
                      <>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
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
          )}

          {!dealsLoading &&
            !dealsError &&
            twoDeals.map((deal) => {
              const sectionClass = 'home-bloom-section';
              const titleClass = 'home-bloom-title';
              const gridClass = 'home-bloom-grid';
              const cardClass = 'bloom-card';
              const imageWrapperClass = 'bloom-image-wrapper';
              const imageClass = 'bloom-image';
              const infoClass = 'bloom-info';
              const offerClass = 'bloom-price';
              const buttonClass = 'bloom-btn';

              return (
                <div key={deal._id} style={{ marginTop: 40 }}>
                  <div className={sectionClass}>
                    <h2 className={titleClass}>{deal.title}</h2>
                    <div className={gridClass}>
                      {deal.images.map((img) => (
                        <div key={`${deal._id}-${img.image}`} className={cardClass}>
                          <div className={imageWrapperClass}>
                            <img
                              src={imageUrl(img.image)}
                              alt={deal.title}
                              className={imageClass}
                              onError={(e) => {
                                e.target.src = '/placeholder-image.png';
                              }}
                            />
                          </div>
                          <div className={infoClass}>
                            <p className={offerClass}>{deal.dealOffer}</p>
                            <button
                              className={buttonClass}
                              onClick={() => handleShopDeal(() => navigate(buildDealRedirectPath(deal, img)))}
                            >
                              {img.buttonName}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="deals-spring-banner">
          <picture>
            <source media="(max-width: 768px)" srcSet="/springsale-mob.webp" />
            <source media="(min-width: 769px)" srcSet="/springsale-web.jpeg" />
            <img src="/springsale-web.jpeg" alt="Spring Sale Banner" className="deals-banner-image" />
          </picture>
          <div className="deals-spring-banner-cta">
            <h3>Up to 70% Off</h3>
            <button type="button" onClick={() => navigate('/deals/collection?name=Bedroom')}>
              Shop Bedroom
            </button>
          </div>
        </div>

        {featuredDeal && (
          <div className="fresh-picks-section" style={{ maxWidth: 1500, margin: '40px auto 0', padding: '0 40px' }}>
            <h2 className="fresh-picks-title">{featuredDeal.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                type="button"
                onClick={() => setFeaturedStartIndex((prev) => Math.max(0, prev - 1))}
                disabled={featuredStartIndex === 0}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: '2px solid #222',
                  background: 'white',
                  fontSize: 30,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  cursor: featuredStartIndex === 0 ? 'not-allowed' : 'pointer',
                  opacity: featuredStartIndex === 0 ? 0.35 : 1,
                }}
                aria-label="Previous featured images"
              >
                <span style={{ transform: 'translateY(-1px)' }}>&lsaquo;</span>
              </button>

              <div className="fresh-picks-grid" style={{ flex: 1 }}>
                {featuredDeal.images
                  .slice(featuredStartIndex, featuredStartIndex + featuredVisibleCount)
                  .map((img) => (
                    <div key={`featured-${featuredDeal._id}-${img.image}`} className="fresh-pick-card">
                      <div className="pick-image-wrapper">
                        <img
                          src={imageUrl(img.image)}
                          alt={featuredDeal.title}
                          className="pick-image"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.png';
                          }}
                        />
                      </div>
                      <div className="pick-info">
                        <p className="pick-price">{featuredDeal.dealOffer}</p>
                        <button
                          className="pick-btn"
                          onClick={() => handleShopDeal(() => navigate(buildDealRedirectPath(featuredDeal, img)))}
                        >
                          {img.buttonName}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              <button
                type="button"
                onClick={() => setFeaturedStartIndex((prev) => Math.min(featuredMaxStart, prev + 1))}
                disabled={featuredStartIndex >= featuredMaxStart}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: '2px solid #222',
                  background: 'white',
                  fontSize: 30,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  cursor: featuredStartIndex >= featuredMaxStart ? 'not-allowed' : 'pointer',
                  opacity: featuredStartIndex >= featuredMaxStart ? 0.35 : 1,
                }}
                aria-label="Next featured images"
              >
                <span style={{ transform: 'translateY(-1px)' }}>&rsaquo;</span>
              </button>
            </div>
          </div>
        )}

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
