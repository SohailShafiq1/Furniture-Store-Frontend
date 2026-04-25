import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { API_BASE_URL, BACKEND_URL } from '../config/api';
import axios from 'axios';
import Header from '../components/Header/Header';
import HeroSection from '../components/HeroSection/HeroSection';
import Sectionals from '../components/Sectionals/Sectionals';
import PromoBanners from '../components/PromoBanners/PromoBanners';
import ShopByCategory from '../components/ShopByCategory/ShopByCategory';
import PromoStrip from '../components/PromoStrip/PromoStrip';
import TopSpringPicks from '../components/TopSpringPicks/TopSpringPicks';
import FinancingPromo from '../components/FinancingPromo/FinancingPromo';
import SlidingBanner from '../components/SlidingBanner/SlidingBanner';
import InspirationSection from '../components/Inspiration/InspirationSection';
import TopBrands from '../components/TopBrands/TopBrands';
import NewsUpdates from '../components/NewsUpdates/NewsUpdates';
import Footer from '../components/Footer/Footer';
import StayInTouch from '../components/Footer/StayInTouch';


// checking is sohail 
const buildDealRedirectPath = (deal, imageItem) => {
  const itemTarget = imageItem?.target || null;
  const isValidCollectionTarget =
    itemTarget?.targetType === 'collection' && !!itemTarget?.collectionName;
  const isValidCategoryTarget =
    itemTarget?.targetType === 'category' && !!itemTarget?.categoryId && !!itemTarget?.subCategoryName;
  const redirectSource =
    isValidCollectionTarget || isValidCategoryTarget ? itemTarget : deal.redirectTarget || {};
  const redirectType = redirectSource.targetType || 'category';

  if (redirectType === 'collection') {
    const collectionName = redirectSource.collectionName;
    if (!collectionName) return '/deals/collection';
    return `/deals/collection?name=${encodeURIComponent(collectionName)}`;
  }

  if (redirectType === 'financing') {
    return '/financing';
  }

  const catId = redirectSource.categoryId;
  const subName = redirectSource.subCategoryName;
  const subSub =
    redirectSource.subSubCategoryName || imageItem?.subSubCategoryName || deal.redirectTarget?.subSubCategoryName;

  const basePath = `/category/${catId}/sub/${encodeURIComponent(subName || '')}`;
  if (!subSub) return basePath;
  return `${basePath}?subSub=${encodeURIComponent(subSub)}`;
};

const buildInstagramButtonAction = (navigate, mediaItem) => {
  const target = mediaItem?.target || null;

  if (target?.targetType === 'collection' && target.collectionName) {
    return () => navigate(`/deals/collection?name=${encodeURIComponent(target.collectionName)}`);
  }

  if (target?.targetType === 'category' && target.categoryId && target.subCategoryName) {
    const basePath = `/category/${target.categoryId}/sub/${encodeURIComponent(target.subCategoryName)}`;
    return () => {
      if (target.subSubCategoryName) {
        navigate(`${basePath}?subSub=${encodeURIComponent(target.subSubCategoryName)}`);
      } else {
        navigate(basePath);
      }
    };
  }

  if (target?.targetType === 'financing') {
    return () => navigate('/financing');
  }

  if (mediaItem?.redirectUrl && /^https?:\/\//i.test(mediaItem.redirectUrl)) {
    return () => {
      window.location.href = mediaItem.redirectUrl;
    };
  }

  return null;
};

const buildInstagramImageAction = (navigate, mediaItem) => {
  if (mediaItem?.redirectUrl && /^https?:\/\//i.test(mediaItem.redirectUrl)) {
    return () => {
      window.location.href = mediaItem.redirectUrl;
    };
  }

  return buildInstagramButtonAction(navigate, mediaItem);
};

const buildHomeContentBannerAction = (navigate, banner, homeContent) => {
  const target = banner.target || null;

  if (target?.targetType === 'collection') {
    const collectionName = target.collectionName;
    if (!collectionName) {
      return () => navigate('/deals/collection');
    }
    return () => navigate(`/deals/collection?name=${encodeURIComponent(collectionName)}`);
  }

  if (target?.targetType === 'category') {
    if (!target.categoryId) {
      return null;
    }

    if (!target.subCategoryName) {
      return () => navigate(`/category/${target.categoryId}`);
    }

    const basePath = `/category/${target.categoryId}/sub/${encodeURIComponent(target.subCategoryName)}`;
    return () => {
      if (target.subSubCategoryName) {
        navigate(`${basePath}?subSub=${encodeURIComponent(target.subSubCategoryName)}`);
      } else {
        navigate(basePath);
      }
    };
  }

  if (target?.targetType === 'financing') {
    return () => navigate('/financing');
  }

  if (banner.buttonSubcategory && homeContent.selectedCategory) {
    return () => {
      navigate(`/category/${homeContent.selectedCategory._id}`, {
        state: { subcategoryFilter: banner.buttonSubcategory }
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }

  return null;
};

// Dynamic PromoBanners Component that accepts custom data
const DynamicPromoBanners = ({ homeContent }) => {
  const navigate = useNavigate();
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(2);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setStartIndex(0);
  }, [homeContent?.promotionPhotos]);

  useEffect(() => {
    const updateVisibleCount = () => {
      const mobile = window.innerWidth <= 768;
      setVisibleCount(mobile ? 1 : 2);
      setIsMobile(mobile);
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);

    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);
  
  if (!homeContent?.promotionPhotos || homeContent.promotionPhotos.length === 0) {
    return null;
  }

  const maxStart = Math.max(0, homeContent.promotionPhotos.length - visibleCount);
  const visibleBanners = useMemo(
    () => isMobile ? homeContent.promotionPhotos : homeContent.promotionPhotos.slice(startIndex, startIndex + visibleCount),
    [homeContent.promotionPhotos, startIndex, visibleCount, isMobile]
  );

  return (
    <div style={{ width: '100%', padding: '60px 40px', backgroundColor: 'var(--color-background)' }}>
      <div style={{ maxWidth: '1480px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          {!isMobile && homeContent.promotionPhotos.length > visibleCount && (
            <button
              type="button"
              onClick={() => setStartIndex((prev) => Math.max(0, prev - 1))}
              disabled={startIndex === 0}
              aria-label="Previous promo banner"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '2px solid #222',
                background: '#fff',
                fontSize: '30px',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                cursor: 'pointer',
                flexShrink: 0,
                opacity: startIndex === 0 ? 0.35 : 1
              }}
            >
              &lsaquo;
            </button>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : `repeat(${visibleCount}, minmax(0, 1fr))`,
            gap: '32px',
            flex: 1
          }}>
            {visibleBanners.map((banner, idx) => {
              const bannerAction = buildHomeContentBannerAction(navigate, banner, homeContent);
              return (
                <div key={idx} data-aos="fade-up" data-aos-delay={idx * 100} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  height: '100%'
                }}>
              {/* Banner Image */}
              <div style={{
                position: 'relative',
                width: '100%',
                paddingBottom: '100%',
                overflow: 'hidden',
                backgroundColor: 'var(--color-secondary)',
                borderRadius: '8px 8px 0 0'
              }}>
                {banner.image && (
                  <img
                    src={banner.image.startsWith('http') ? banner.image : `${BACKEND_URL}/${banner.image}`}
                    alt={banner.heading || 'Promo Banner'}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                )}
              </div>

              {/* Banner Content */}
              <div style={{
                padding: '32px 24px',
                backgroundColor: '#F5EFE7',
                borderRadius: '0 0 8px 8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                flex: 1,
                alignItems: 'center',
                textAlign: 'center'
              }}>
                {banner.heading && (
                  <h3 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: 'var(--color-primary)',
                    margin: '0 0 8px 0',
                    lineHeight: '1.2'
                  }}>
                    {banner.heading}
                  </h3>
                )}

                {banner.subHeading && (
                  <p style={{
                    fontSize: '16px',
                    color: '#333',
                    margin: '0 0 16px 0',
                    lineHeight: '1.5'
                  }}>
                    {banner.subHeading}
                  </p>
                )}

                {banner.buttonName && (
                  <button
                    type="button"
                    onClick={() => bannerAction && bannerAction()}
                    style={{
                      padding: '12px 32px',
                      backgroundColor: 'var(--color-accent)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '15px',
                      fontWeight: '700',
                      cursor: bannerAction ? 'pointer' : 'default',
                      transition: 'all 0.3s ease',
                      marginTop: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (banner.buttonSubcategory) {
                        e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(193, 18, 31, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {banner.buttonName}
                  </button>
                )}
              </div>
            </div>
            );
          })}
          </div>
          {!isMobile && homeContent.promotionPhotos.length > visibleCount && (
            <button type="button"
              onClick={() => setStartIndex((prev) => Math.min(maxStart, prev + 1))}
              disabled={startIndex >= maxStart}
              aria-label="Next promo banner"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '2px solid #222',
                background: '#fff',
                fontSize: '30px',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                cursor: 'pointer',
                flexShrink: 0,
                opacity: startIndex >= maxStart ? 0.35 : 1
              }}
            >
              &rsaquo;
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Dynamic Subcategory Component - Same as CategoryPage layout
const DynamicSubcategoryComponent = ({ subcategoryName, selectedProducts, categoryId }) => {
  const navigate = useNavigate();
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateVisibleCount = () => {
      const mobile = window.innerWidth <= 768;
      setVisibleCount(mobile ? 1 : 4);
      setIsMobile(mobile);
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  useEffect(() => {
    setStartIndex(0);
  }, [selectedProducts]);

  const StarIcon = ({ filled }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#FFB800" : "none"} stroke={filled ? "#FFB800" : "#D1D1D1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );

  if (!selectedProducts || selectedProducts.length === 0) {
    return null;
  }

  const maxStart = Math.max(0, selectedProducts.length - visibleCount);
  const visibleProducts = useMemo(
    () => selectedProducts.slice(startIndex, startIndex + visibleCount),
    [selectedProducts, startIndex, visibleCount]
  );

  return (
    <section style={{ width: '100%', padding: '60px 40px', backgroundColor: 'var(--color-background)' }}>
      <div style={{ maxWidth: '1480px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '40px' }}>
          {subcategoryName}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {!isMobile && selectedProducts.length > visibleCount && (
            <button
              type="button"
              onClick={() => setStartIndex((prev) => Math.max(0, prev - visibleCount))}
              disabled={startIndex === 0}
              aria-label="Previous products"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '2px solid #222',
                background: '#fff',
                fontSize: '24px',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                cursor: 'pointer',
                flexShrink: 0,
                opacity: startIndex === 0 ? 0.35 : 1
              }}
            >
              &lsaquo;
            </button>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : `repeat(${visibleCount}, minmax(0, 1fr))`,
            gap: '24px',
            flex: 1
          }}>
            {visibleProducts.map((product) => (
            <div
              key={product._id}
              onClick={() => navigate(`/product/${product.category}/${product._id}`)}
              style={{
                cursor: 'pointer',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                padding: '12px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 transparent';
              }}
            >
              {/* Product Image */}
              <div style={{
                position: 'relative',
                width: '100%',
                paddingBottom: '100%',
                overflow: 'hidden',
                backgroundColor: 'var(--color-secondary)',
                borderRadius: '4px',
                marginBottom: '12px'
              }}>
                <img
                  src={product.image?.startsWith('http') ? product.image : `${BACKEND_URL}/${product.image}`}
                  alt={product.name}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />

                {/* Badge */}
                {(product.badge || (product.quantity > 0)) && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    {product.badge && (
                      <span style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {product.badge}
                      </span>
                    )}
                    {product.quantity > 0 && (
                      <span style={{
                        backgroundColor: '#84CFBE',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {product.quantity > 5 ? 'In Stock | Ready to Go' : 'In Stock'}
                      </span>
                    )}
                  </div>
                )}

                {/* Wishlist Button */}
                {/* Commented out - can be enabled with proper functionality */}
                {/* <button
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button> */}
              </div>

              {/* Product Info */}
              <p style={{ fontSize: '14px', color: '#999', margin: '0 0 8px 0' }}>
                {product.brand || product.brandId || 'LUNA'}
              </p>

              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a1a1a',
                margin: '0 0 8px 0',
                lineHeight: '1.4',
                minHeight: '28px'
              }}>
                {product.name}
              </h3>

              {/* Rating */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} filled={i < (product.numReviews === 0 ? 5 : Math.round(product.rating || 0))} />
                  ))}
                </div>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>({product.numReviews || 0})</span>
              </div>

              {/* Price */}
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'var(--color-accent)'
                }}>
                  ${parseFloat(product.price || 0).toFixed(2)}
                </span>
                {product.discount > 0 && (
                  <span style={{
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'line-through'
                  }}>
                    ${(parseFloat(product.price || 0) * (1 + product.discount / 100)).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {!isMobile && selectedProducts.length > visibleCount && (
          <button
            type="button"
            onClick={() => setStartIndex((prev) => Math.min(maxStart, prev + visibleCount))}
            disabled={startIndex >= maxStart}
            aria-label="Next products"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '2px solid #222',
              background: '#fff',
              fontSize: '24px',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              cursor: 'pointer',
              flexShrink: 0,
              opacity: startIndex >= maxStart ? 0.35 : 1
            }}
          >
            &rsaquo;
          </button>
        )}
      </div>

        {/* View All Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
          <button
            className="btn-primary"
            onClick={() => {
              // Navigate to category page
              if (categoryId) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate(`/category/${categoryId}`, { 
                  state: { subcategoryFilter: subcategoryName } 
                });
              } else {
                console.error('Category ID not found');
              }
            }}
            style={{
              padding: '12px 48px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: categoryId ? 'pointer' : 'not-allowed',
              opacity: categoryId ? 1 : 0.6
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e55a27';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FF6B35';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            View All {subcategoryName}
          </button>
        </div>
      </div>
    </section>
  );
};

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, token: currentToken } = useUserAuth();
  const [homeContent, setHomeContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [homeDeal, setHomeDeal] = useState(null);
  const [homeInstagramPost, setHomeInstagramPost] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userJson = params.get('user');

    if (token && userJson && token !== currentToken) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));
        login(token, user);
        navigate('/', { replace: true });
      } catch (err) {
        console.error("Failed to parse social login data:", err);
      }
    }
  }, [location, login, navigate, currentToken]);

  // Fetch home page content
  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        setLoading(true);
        const url = `${API_BASE_URL}/home-content/get-all-content`;
        console.log('Fetching home content from:', url);
        
        const res = await axios.get(url);
        console.log('Home content response:', res.data);
        
        // Filter only visible content and sort by createdAt
        const visibleContent = (Array.isArray(res.data) ? res.data : [])
          .filter(item => item?.isVisible)
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setHomeContent(visibleContent);
      } catch (err) {
        console.error('Error fetching home content:', err);
        console.error('Error response:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data ? err.response.data.substring?.(0, 100) : err.response?.data,
          message: err.message,
        });
        setHomeContent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeContent();
  }, []);

  useEffect(() => {
    const fetchHomeDeal = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/deals/all`);
        const deals = Array.isArray(res.data) ? res.data : [];
        const selected = deals.find((deal) => deal.showOnHomePage);
        setHomeDeal(selected || null);
      } catch (err) {
        console.error('Error fetching deals:', err);
        setHomeDeal(null);
      }
    };

    fetchHomeDeal();
  }, []);

  useEffect(() => {
    const fetchInstagramHomePost = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/home-content/instagram-posts/public`);
        const posts = Array.isArray(res.data) ? res.data : [];
        const selected = posts.find((post) => post.showOnHomePage);
        setHomeInstagramPost(selected || null);
      } catch (err) {
        console.error('Error fetching instagram posts:', err);
        setHomeInstagramPost(null);
      }
    };

    fetchInstagramHomePost();
  }, []);

  const prioritizedDealSource = homeInstagramPost || homeDeal;

  const buildInstagramClick = (url) => () => {
    if (!url) return;
    window.location.href = url;
  };

  const homeDealItems = homeInstagramPost
    ? (homeInstagramPost?.media || [])
        .map((mediaItem, idx) => {
          const rawFile = mediaItem?.file || '';
          const source = rawFile
            ? (rawFile.startsWith('http') ? rawFile : `${BACKEND_URL}/${rawFile}`)
            : '';
          const buttonOnClick = buildInstagramButtonAction(navigate, mediaItem);
          const imageOnClick = buildInstagramImageAction(navigate, mediaItem);

          return {
            id: `${homeInstagramPost?._id || 'instagram'}-${idx}`,
            image: source,
            mediaType:
              mediaItem?.mediaType ||
              (String(rawFile).toLowerCase().match(/\.(mp4|webm|mov)$/) ? 'video' : 'image'),
            title: homeInstagramPost?.title,
            priceLabel: mediaItem?.dealOffer || homeInstagramPost?.dealOffer,
            buttonText: mediaItem?.buttonName || 'Shop now',
            onClick: buttonOnClick,
            buttonOnClick,
            imageOnClick
          };
        })
        .filter((item) => item.image)
    : (homeDeal?.images || [])
    .map((img, idx) => {
      const rawImage = typeof img === 'string' ? img : img?.image;
      const image = rawImage
        ? (rawImage.startsWith('http') ? rawImage : `${BACKEND_URL}/${rawImage}`)
        : '';
      const buttonText = typeof img === 'string' ? 'Shop now' : img?.buttonName || homeDeal?.buttonName || 'Shop now';
      const priceLabel = typeof img === 'string' ? homeDeal?.dealOffer : img?.dealOffer || homeDeal?.dealOffer;

      return {
        id: `${homeDeal?._id || 'deal'}-${idx}`,
        image,
        mediaType: 'image',
        title: homeDeal?.title,
        priceLabel,
        buttonText,
        onClick: () => {
          if (homeDeal?.redirectTarget?.categoryId && homeDeal?.redirectTarget?.subCategoryName) {
            navigate(buildDealRedirectPath(homeDeal, img));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      };
    })
    .filter((item) => item.image);

  return (
    <div className="home-page">
      <Header />
      <HeroSection />
      <ShopByCategory />
      <PromoStrip
        title={prioritizedDealSource?.promoStrip?.enabled ? prioritizedDealSource?.promoStrip?.highlightText : ''}
        subtitle={prioritizedDealSource?.promoStrip?.enabled ? prioritizedDealSource?.promoStrip?.normalText : ''}
        code={prioritizedDealSource?.promoStrip?.enabled ? prioritizedDealSource?.promoStrip?.code : ''}
      />
      <TopSpringPicks
        items={homeDealItems}
        title={prioritizedDealSource?.title || 'Top Deals'}
      />
      <FinancingPromo />
      <SlidingBanner />
      
      {/* Dynamically render HomeContent sections */}
      {homeContent.map((content, idx) => (
        <div key={content._id || idx}>
          {/* Show Subcategory Component with selected products first */}
          {content.selectedSubCategoryName && content.selectedProducts && content.selectedProducts.length > 0 ? (
            <DynamicSubcategoryComponent 
              subcategoryName={content.selectedSubCategoryName}
              selectedProducts={content.selectedProducts}
              categoryId={content.selectedCategory?._id || content.selectedProducts[0]?.category}
            />
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              No products selected for: {content.selectedSubCategoryName}
            </div>
          )}

          {/* Show PromoBanners after subcategory */}
          <DynamicPromoBanners homeContent={content} />
        </div>
      ))}

      {/* Static components at the bottom */}
      <SlidingBanner />
      <InspirationSection />
      <TopBrands />
      <NewsUpdates />
      <StayInTouch/>
      <Footer />
    </div>
  );
}
