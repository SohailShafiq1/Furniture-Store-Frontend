import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { API_BASE_URL, BACKEND_URL } from '../config/api';
import axios from 'axios';
import Header from '../components/Header/Header';
import HeroSection from '../components/HeroSection/HeroSection';
import Sectionals from '../components/Sectionals/Sectionals';
import PromoBanners from '../components/PromoBanners/PromoBanners';
import ShopByCategory from '../components/ShopByCategory/ShopByCategory';
import SlidingBanner from '../components/SlidingBanner/SlidingBanner';
import Inspiration from '../components/Inspiration/Inspiration';
import TopBrands from '../components/TopBrands/TopBrands';
import NewsUpdates from '../components/NewsUpdates/NewsUpdates';
import Footer from '../components/Footer/Footer';

// Dynamic PromoBanners Component that accepts custom data
const DynamicPromoBanners = ({ homeContent }) => {
  if (!homeContent?.promotionPhotos || homeContent.promotionPhotos.length === 0) {
    return null;
  }

  return (
    <div style={{ width: '100%', padding: '60px 40px', backgroundColor: '#f8f8f8' }}>
      <div style={{ maxWidth: '1480px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '24px'
        }}>
          {homeContent.promotionPhotos.map((banner, idx) => (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                position: 'relative',
                width: '100%',
                paddingBottom: '66.67%',
                overflow: 'hidden',
                backgroundColor: '#f5f5f5'
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
              <div style={{ padding: '24px' }}>
                {banner.heading && (
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 8px 0' }}>
                    {banner.heading}
                  </h3>
                )}
                {banner.subHeading && (
                  <p style={{ fontSize: '14px', color: '#666', margin: '0', lineHeight: '1.4' }}>
                    {banner.subHeading}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Dynamic Subcategory Component - Same as CategoryPage layout
const DynamicSubcategoryComponent = ({ subcategoryName, selectedProducts, categoryId }) => {
  const navigate = useNavigate();

  const StarIcon = ({ filled }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#FFB800" : "none"} stroke={filled ? "#FFB800" : "#D1D1D1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );

  if (!selectedProducts || selectedProducts.length === 0) {
    return null;
  }

  return (
    <section style={{ width: '100%', padding: '60px 40px', backgroundColor: '#ffffff' }}>
      <div style={{ maxWidth: '1480px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1a1a1a', marginBottom: '40px' }}>
          {subcategoryName}
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px'
        }}>
          {selectedProducts.map((product) => (
            <div
              key={product._id}
              onClick={() => navigate(`/product/${product.category}/${product._id}`)}
              style={{
                cursor: 'pointer',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5e5',
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
                backgroundColor: '#f5f5f5',
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
                        backgroundColor: '#555',
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
                    <StarIcon key={i} filled={i < 4} />
                  ))}
                </div>
                <span style={{ fontSize: '14px', color: '#999' }}>(0)</span>
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
                  color: '#FF6B35'
                }}>
                  ${parseFloat(product.price || 0).toFixed(2)}
                </span>
                {product.discount > 0 && (
                  <span style={{
                    fontSize: '14px',
                    color: '#999',
                    textDecoration: 'line-through'
                  }}>
                    ${(parseFloat(product.price || 0) * (1 + product.discount / 100)).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
          <button
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
              backgroundColor: '#FF6B35',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: categoryId ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              letterSpacing: '0.5px',
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
        const res = await axios.get(`${API_BASE_URL}/home/get-all-content`);
        // Filter only visible content and sort by createdAt
        const visibleContent = (res.data || [])
          .filter(item => item.isVisible)
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setHomeContent(visibleContent);
      } catch (err) {
        console.error('Error fetching home content:', err);
        setHomeContent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeContent();
  }, []);

  return (
    <div className="home-page">
      <Header />
      <HeroSection />
      <ShopByCategory />
      
      {/* Dynamically render HomeContent sections */}
      {homeContent.map((content, idx) => (
        <div key={content._id || idx}>
          {/* Show PromoBanners first */}
          <DynamicPromoBanners homeContent={content} />
          
          {/* Show Subcategory Component with selected products */}
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
        </div>
      ))}

      {/* Static components at the bottom */}
      <SlidingBanner />
      <Inspiration />
      <TopBrands />
      <NewsUpdates />
      <Footer />
    </div>
  );
}
