import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductsByCategory } from '../hooks/useProductsByCategory';
import { BACKEND_URL } from '../config/api';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './ProductDetailPage.css';

const StarIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#FFB800" : "none"} stroke={filled ? "#FFB800" : "#D1D1D1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const ChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default function ProductDetailPage() {
  const { categoryId, productId } = useParams();
  const navigate = useNavigate();
  const { products: categoryProducts } = useProductsByCategory(categoryId);
  
  const product = categoryProducts.find(p => p._id === productId);
  
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(null);

  if (!product) {
    return (
      <div className="pd-page">
        <Header />
        <div className="pd-container">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2>Product not found</h2>
            <button onClick={() => navigate(-1)} className="pd-back-btn">
              ← Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Use actual product images from backend, fallback to single image if not available
  const galleryImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  // Helper to ensure full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    return imagePath.startsWith('http') ? imagePath : `${BACKEND_URL}/${imagePath}`;
  };

  const handlePrevImage = () => {
    setMainImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleNextImage = () => {
    setMainImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  // Get current price based on selected variation
  const getCurrentPrice = () => {
    if (selectedVariation !== null && product.variations && product.variations.length > 0) {
      const variation = product.variations[selectedVariation];
      return variation ? variation.price : product.price;
    }
    return product.price;
  };

  const currentPrice = getCurrentPrice();

  return (
    <div className="pd-page">
      <Header />
      
      <div className="pd-container">
        {/* Breadcrumb */}
        <nav className="pd-breadcrumb">
          <button onClick={() => navigate('/')}>Home</button>
          <span>/</span>
          <button onClick={() => navigate(`/category/${categoryId}`)}>Products</button>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="pd-content">
          {/* Left: Product Gallery */}
          <div className="pd-gallery-section">
            <div className="pd-main-image-wrapper">
              <button className="pd-nav-btn pd-nav-prev" onClick={handlePrevImage}>
                <ChevronLeft />
              </button>
              
              <div className="pd-main-image">
                <img src={getImageUrl(galleryImages[mainImageIndex])} alt={product.name} />
              </div>
              
              <button className="pd-nav-btn pd-nav-next" onClick={handleNextImage}>
                <ChevronRight />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="pd-thumbnails">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  className={`pd-thumbnail ${mainImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setMainImageIndex(idx)}
                >
                  <img src={getImageUrl(img)} alt={`View ${idx + 1}`} />
                </button>
              ))}
            </div>

            <p className="pd-disclaimer">Actual item may be lighter/darker than pictured.</p>
          </div>

          {/* Right: Product Details */}
          <div className="pd-details-section">
            {/* Title */}
            <h1 className="pd-title">{product.name}</h1>

            {/* Brand & Collection */}
            <div className="pd-meta">
              <span className="pd-collection">{product.collectionName || 'Luna Collection'}</span>
              <span className="pd-by">by {product.brandId || 'Luna'}</span>
            </div>

            {/* SKU */}
            <div className="pd-sku">SKU: {product.sku}</div>

            {/* Rating */}
            <div className="pd-rating">
              <div className="pd-stars">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} filled={i < 4} />
                ))}
              </div>
              <span className="pd-review-count">(0 reviews)</span>
            </div>

            {/* Variations Section */}
            {product.variations && product.variations.length > 0 && (
              <div className="pd-variations-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>CHOOSE VARIATION</h3>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {product.variations.map((variation, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariation(selectedVariation === idx ? null : idx)}
                      style={{
                        padding: '10px 16px',
                        border: selectedVariation === idx ? '2px solid #FF6B35' : '1px solid #D1D1D1',
                        borderRadius: '8px',
                        background: selectedVariation === idx ? '#fff' : '#fff',
                        boxShadow: selectedVariation === idx ? '0 0 0 1px #FF6B35' : 'none',
                        color: '#333',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '14px',
                        minWidth: '120px',
                        textAlign: 'left'
                      }}
                    >
                      {variation.name} <span style={{ marginLeft: '8px', fontWeight: '700' }}>${variation.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Section */}
            <div className="pd-price-section">
              <div className="pd-price-container">
                <span className="pd-current-price">${currentPrice}</span>
                {product.discount > 0 && (
                  <span className="pd-original-price">${(currentPrice / (1 - product.discount / 100)).toFixed(2)}</span>
                )}
              </div>
              <p className="pd-discount-text">Extra 5% off with code <span className="pd-code">55OFF</span></p>
            </div>

            {/* Add to Cart Button */}
            <button className="pd-add-cart-btn">ADD TO CART</button>

            {/* Shop Pay */}
            <p className="pd-shop-pay">
              From <span className="pd-shop-price">${(currentPrice / 12).toFixed(2)}</span>/mo with <span className="pd-shop-logo">Shop Pay</span>
              <br />
              <a href="#" className="pd-policy-link">Check your purchasing power</a>
            </p>

            {/* Benefits */}
            <div className="pd-benefits">
              <div className="pd-benefit">
                <div className="pd-benefit-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                  </svg>
                </div>
                <div className="pd-benefit-text">
                  <p className="pd-benefit-title">Fast Shipping</p>
                </div>
              </div>

              <div className="pd-benefit">
                <div className="pd-benefit-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="pd-benefit-text">
                  <p className="pd-benefit-title">30-Day Returns</p>
                </div>
              </div>

              <div className="pd-benefit">
                <div className="pd-benefit-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                    <path d="M2 10h20"></path>
                  </svg>
                </div>
                <div className="pd-benefit-text">
                  <p className="pd-benefit-title">Easy Financing</p>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="pd-shipping-info">
              <p>Ships to <span className="pd-location">LV-1001</span></p>
              <div className="pd-ship-date">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <div>
                  <p className="pd-ship-label">Estimated Ship Date</p>
                  <p className="pd-ship-value">In a week</p>
                </div>
              </div>
            </div>

            {/* Policy Links */}
            <p className="pd-policy-disclaimer">
              <a href="#" className="pd-policy-link-text">Check our Delivery Policy</a>
              <span>. *Conditions apply.</span>
            </p>

            {/* Share */}
            <div className="pd-share">
              <span>Share:</span>
              <a href="#" className="pd-share-btn pd-share-x" title="Share on X">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.694-5.833 6.694H2.882l7.432-8.496L1.24 2.25h6.777l4.592 6.063L16.537 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </a>
              <a href="#" className="pd-share-btn pd-share-fb" title="Share on Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                </svg>
              </a>
              <a href="#" className="pd-share-btn pd-share-pinterest" title="Share on Pinterest">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"></circle>
                  <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}