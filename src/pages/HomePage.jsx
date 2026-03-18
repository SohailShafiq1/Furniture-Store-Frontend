import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { API_BASE_URL, BACKEND_URL } from '../config/api';
import axios from 'axios';
import Header from '../components/Header/Header';
import HeroSection from '../components/HeroSection/HeroSection';
import TopSpringPicks from '../components/TopSpringPicks/TopSpringPicks';
import Sectionals from '../components/Sectionals/Sectionals';
import PromoBanners from '../components/PromoBanners/PromoBanners';
import BedroomSets from '../components/BedroomSets/BedroomSets';
import ShopByCategory from '../components/ShopByCategory/ShopByCategory';
import DiningTable from '../components/BedroomSets/DiningTable';
import SlidingBanner from '../components/SlidingBanner/SlidingBanner';
import Inspiration from '../components/Inspiration/Inspiration';
import TopBrands from '../components/TopBrands/TopBrands';
import NewsUpdates from '../components/NewsUpdates/NewsUpdates';
import Footer from '../components/Footer/Footer';
import ProductCarousel from '../components/ProductCarousel/ProductCarousel';

// Component mapping for dynamic rendering
const componentMap = {
  'Sectionals': Sectionals,
  'BedroomSets': BedroomSets,
  'DiningTable': DiningTable,
  'TopSpringPicks': TopSpringPicks
};

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

// Dynamic Subcategory Component that renders selected products
const DynamicSubcategoryComponent = ({ subcategoryName, selectedProducts }) => {
  const formatProductForDisplay = (product) => {
    // Extract image URL
    const imageUrl = product.images && product.images.length > 0
      ? (product.images[0].startsWith('http') ? product.images[0] : `${BACKEND_URL}/${product.images[0]}`)
      : '/placeholder.png';

    // Calculate pricing
    const originalPrice = product.price || 0;
    const currentPrice = product.discountedPrice || product.price || 0;

    // Determine stock status
    let stockStatus = null;
    if (product.stock > 0) {
      stockStatus = product.stock > 5 ? 'In Stock | Ready to Go' : 'In Stock';
    } else {
      stockStatus = 'Out of Stock';
    }

    return {
      id: product._id || product.id,
      image: imageUrl,
      brand: product.brand || 'Ashley',
      name: product.name || 'Product Name',
      rating: product.rating || 4.5,
      reviews: product.reviews || 0,
      currentPrice: `$${currentPrice.toFixed(2)}`,
      originalPrice: `$${originalPrice.toFixed(2)}`,
      badge: 'Spring Sale', // Default badge - can be customized
      stockStatus: stockStatus
    };
  };

  const formattedProducts = selectedProducts?.map(formatProductForDisplay) || [];

  if (formattedProducts.length === 0) {
    return null;
  }

  return (
    <ProductCarousel 
      title={subcategoryName} 
      products={formattedProducts}
    />
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
