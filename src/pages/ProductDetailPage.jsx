import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { useCart } from '../context/CartContext';
import { useProductsByCategory } from '../hooks/useProductsByCategory';
import { BACKEND_URL } from '../config/api';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Modal from '../components/Modal/Modal';
import ReviewSection from '../components/ReviewSection/ReviewSection';
import ProductCarousel from '../components/ProductCarousel/ProductCarousel';
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

const ChevronDown = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const ChevronUp = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
);

const AccordionItem = ({ title, isOpen, onClick, children }) => (
  <div className="pd-accordion-item">
    <button className="pd-accordion-header" onClick={onClick}>
      <span>{title}</span>
      {isOpen ? <ChevronUp /> : <ChevronDown />}
    </button>
    {isOpen && <div className="pd-accordion-content">{children}</div>}
  </div>
);

export default function ProductDetailPage() {
  const { categoryId, productId } = useParams();
  const navigate = useNavigate();
  const { products: categoryProducts } = useProductsByCategory(categoryId);
  const { user } = useUserAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const fetchProductData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/products/all`);
      const allProducts = await res.json();
      const foundProduct = allProducts.find(p => p._id === productId);
      setProduct(foundProduct);
    } catch (err) {
      console.error('Error fetching product details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId]);
  
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [openAccordion, setOpenAccordion] = useState('Overview');

  if (loading) {
    return (
      <div className="pd-page">
        <Header />
        <div className="pd-container" style={{ textAlign: 'center', padding: '100px 0' }}>
          <p>Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

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

  const handleAddToCart = async () => {
    const variationName = selectedVariation !== null && product.variations 
      ? product.variations[selectedVariation].name 
      : null;
    
    setAddingToCart(true);
    // Pass product details for guest checkout display
    const productDetails = {
      name: product.name,
      image: product.images?.[0]
    };
    const success = await addToCart(product._id, variationName, quantity, currentPrice, productDetails, selectedColor);
    setAddingToCart(false);

    if (success) {
      setModal({
        isOpen: true,
        title: 'Added to Cart',
        message: `${product.name}${selectedColor ? ` in ${selectedColor}` : ''} has been added to your cart successfully!`,
        type: 'success'
      });
    }
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  return (
    <div className="pd-page">
      <Header />
      
      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={closeModal}
        onCancel={closeModal}
        showCancelButton={false}
      />
      
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

            {/* Description & Specifications Section */}
            <div className="pd-description-section">
              <h2 className="pd-section-title">Description</h2>
              
              {/* Product Overview Accordion */}
              <AccordionItem 
                title="OVERVIEW" 
                isOpen={openAccordion === 'Overview'} 
                onClick={() => setOpenAccordion(openAccordion === 'Overview' ? '' : 'Overview')}
              >
                <div className="pd-overview-content">
                   <ul className="pd-overview-list">
                    <li><strong>Item Name:</strong> {product.name}</li>
                    <li><strong>SKU:</strong> {product.sku}</li>
                    {product.collectionName && <li><strong>Collection Name:</strong> {product.collectionName}</li>}
                    {product.brandId && <li><strong>Brand:</strong> {product.brandId}</li>}
                  </ul>
                  <div className="pd-description-text" dangerouslySetInnerHTML={{ __html: product.description }} style={{ marginTop: '16px' }} />
                </div>
              </AccordionItem>

              {/* Dimensions Accordion */}
              {(product.dimensions && Object.keys(product.dimensions).length > 0) || (product.customDimensions && product.customDimensions.length > 0) ? (
                <AccordionItem 
                  title="DIMENSIONS" 
                  isOpen={openAccordion === 'Dimensions'} 
                  onClick={() => setOpenAccordion(openAccordion === 'Dimensions' ? '' : 'Dimensions')}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {product.dimensions && Object.keys(product.dimensions).length > 0 && (
                      <>
                        {product.dimensions.overallDimensions && <div><strong>Overall Dimensions:</strong> <span style={{ color: '#666' }}>{product.dimensions.overallDimensions}</span></div>}
                        {product.dimensions.itemWeight && <div><strong>Item Weight:</strong> <span style={{ color: '#666' }}>{product.dimensions.itemWeight}</span></div>}
                        {product.dimensions.unitWidth && <div><strong>Unit Width:</strong> <span style={{ color: '#666' }}>{product.dimensions.unitWidth}</span></div>}
                        {product.dimensions.unitDepth && <div><strong>Unit Depth:</strong> <span style={{ color: '#666' }}>{product.dimensions.unitDepth}</span></div>}
                        {product.dimensions.unitHeight && <div><strong>Unit Height:</strong> <span style={{ color: '#666' }}>{product.dimensions.unitHeight}</span></div>}
                        {product.dimensions.itemsPerCase && <div><strong>Items Per Case:</strong> <span style={{ color: '#666' }}>{product.dimensions.itemsPerCase}</span></div>}
                        {product.dimensions.shippingWeight && <div><strong>Shipping Weight:</strong> <span style={{ color: '#666' }}>{product.dimensions.shippingWeight}</span></div>}
                        {product.dimensions.cartonDepth && <div><strong>Carton Depth:</strong> <span style={{ color: '#666' }}>{product.dimensions.cartonDepth}</span></div>}
                        {product.dimensions.cartonHeight && <div><strong>Carton Height:</strong> <span style={{ color: '#666' }}>{product.dimensions.cartonHeight}</span></div>}
                        {product.dimensions.cartonWidth && <div><strong>Carton Width:</strong> <span style={{ color: '#666' }}>{product.dimensions.cartonWidth}</span></div>}
                      </>
                    )}
                    {product.customDimensions && product.customDimensions.length > 0 && (
                      <>
                        {product.customDimensions.map((dim, idx) => (
                          <div key={idx}><strong>{dim.label}:</strong> <span style={{ color: '#666' }}>{dim.value}</span></div>
                        ))}
                      </>
                    )}
                  </div>
                </AccordionItem>
              ) : null}

              {/* Colors Accordion */}
              {(product.selectedColors?.length > 0 || product.customColors?.length > 0) && (
                <AccordionItem 
                  title="COLORS" 
                  isOpen={openAccordion === 'Colors'} 
                  onClick={() => setOpenAccordion(openAccordion === 'Colors' ? '' : 'Colors')}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '16px' }}>
                    {/* Predefined Colors */}
                    {product.selectedColors?.length > 0 && product.selectedColors.map((colorName) => {
                      const predefinedColors = {
                        'Red': '#C1121F', 'Blue': '#007AFF', 'Green': '#34C759', 'Yellow': '#FFCC00', 'Orange': '#FF9500',
                        'Purple': '#AF52DE', 'Pink': '#FF1493', 'Brown': '#8B4513', 'Black': '#000000', 'White': '#FFFFFF',
                        'Gray': '#A9A9A9', 'Beige': '#F5F5DC', 'Navy': '#000080', 'Teal': '#008080', 'Gold': '#FFD700',
                        'Silver': '#C0C0C0', 'Cream': '#FFFDD0', 'Charcoal': '#36454F', 'Burgundy': '#800020', 'Olive': '#808000'
                      };
                      const hexCode = predefinedColors[colorName] || '#000000';
                      
                      return (
                        <button
                          key={colorName}
                          onClick={() => setSelectedColor(selectedColor === colorName ? null : colorName)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px',
                            border: selectedColor === colorName ? '2px solid #4f46e5' : '1px solid #d1d1d1',
                            borderRadius: '8px',
                            background: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div
                            style={{
                              width: '50px',
                              height: '50px',
                              backgroundColor: hexCode,
                              borderRadius: '6px',
                              border: hexCode === '#FFFFFF' ? '1px solid #d0d0d0' : 'none'
                            }}
                          />
                          <span style={{ fontSize: '0.75rem', color: '#333', fontWeight: '500', textAlign: 'center' }}>{colorName}</span>
                        </button>
                      );
                    })}
                    
                    {/* Custom Colors */}
                    {product.customColors?.length > 0 && product.customColors.map((customColor) => (
                      <button
                        key={customColor.name}
                        onClick={() => setSelectedColor(selectedColor === customColor.name ? null : customColor.name)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px',
                          border: selectedColor === customColor.name ? '2px solid #4f46e5' : '1px solid #d1d1d1',
                          borderRadius: '8px',
                          background: 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div
                          style={{
                            width: '50px',
                            height: '50px',
                            backgroundColor: customColor.hex,
                            borderRadius: '6px',
                            border: customColor.hex === '#FFFFFF' ? '1px solid #d0d0d0' : 'none'
                          }}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#333', fontWeight: '500', textAlign: 'center' }}>{customColor.name}</span>
                      </button>
                    ))}
                  </div>
                </AccordionItem>
              )}

              {/* Dynamic Specifications */}
              {product.specifications && product.specifications.map((spec, index) => (
                <AccordionItem 
                  key={index}
                  title={spec.title.toUpperCase()} 
                  isOpen={openAccordion === spec.title} 
                  onClick={() => setOpenAccordion(openAccordion === spec.title ? '' : spec.title)}
                >
                  <div className="pd-spec-grid">
                    {spec.fields.map((field, fIdx) => (
                      <div key={fIdx} className="pd-spec-row">
                        <span className="pd-spec-name">{field.name}:</span>
                        <span className="pd-spec-value">{field.values.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
              ))}

              <AccordionItem 
                title="DELIVERY" 
                isOpen={openAccordion === 'Delivery'} 
                onClick={() => setOpenAccordion(openAccordion === 'Delivery' ? '' : 'Delivery')}
              >
                <div className="pd-faq-content">
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">How long will it take to receive my order?</p>
                    <p className="pd-faq-answer">Delivery times vary based on the item and your location. Most orders are processed and shipped within 1-2 weeks.</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">Which delivery method should I select?</p>
                    <p className="pd-faq-answer">We offer various delivery methods from standard curbside to white-glove assembly. Choose the one that best fits your needs during checkout.</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">I want to know the exact time of when the delivery will occur!</p>
                    <p className="pd-faq-answer">Once your order is ready for delivery, our team will contact you to schedule a specific window. You'll receive updates as the date approaches.</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">How can I help to ensure a smooth delivery process?</p>
                    <p className="pd-faq-answer">Ensure the delivery path is clear, measure doorways/hallways in advance, and have someone over 18 available to sign for the delivery.</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">I was not home when the delivery team showed up. What can I do?</p>
                    <p className="pd-faq-answer">Please contact our customer service team immediately to reschedule. Re-delivery fees may apply.</p>
                  </div>
                </div>
              </AccordionItem>

              <AccordionItem 
                title="FINANCING / LEASE TO OWN" 
                isOpen={openAccordion === 'Financing'} 
                onClick={() => setOpenAccordion(openAccordion === 'Financing' ? '' : 'Financing')}
              >
                <div className="pd-faq-content">
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">Do you offer Financing?</p>
                    <p className="pd-faq-answer">Yes! We offer various financing and lease-to-own options through partners like Shop Pay, Affirm, and others. You can see available options at checkout.</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">What are the accepted payment methods?</p>
                    <p className="pd-faq-answer">We accept all major credit cards, PayPal, and various financing options.</p>
                  </div>
                </div>
              </AccordionItem>

              <AccordionItem 
                title="FREQUENTLY ASKED QUESTIONS" 
                isOpen={openAccordion === 'FAQ'} 
                onClick={() => setOpenAccordion(openAccordion === 'FAQ' ? '' : 'FAQ')}
              >
                <div className="pd-faq-content">
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">What is my order number?</p>
                    <p className="pd-faq-answer">Your order number can be found in your confirmation email or by logging into your account.</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">How do I know if the item is available/ in stock?</p>
                    <p className="pd-faq-answer">Stock status is updated in real-time on each product page. If an item is out of stock, it will be labeled accordingly.</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">Can I see the furniture in person?</p>
                    <p className="pd-faq-answer">Furniture Store is primarily an online retailer, but we have select showroom locations. Please check our store locator for details.</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">Will you take my old furniture?</p>
                    <p className="pd-faq-answer">We generally do not offer furniture removal services. We recommend contacting local charities or waste management for disposal.</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">Will the item look the same as in the picture?</p>
                    <p className="pd-faq-answer">While we strive for color accuracy, actual items may vary slightly due to lighting and monitor settings. Fabric samples may be available upon request.</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">I have received a defective/damaged item. What can I do?</p>
                    <p className="pd-faq-answer">Please report any damage within 24 hours of delivery. Take photos and contact our support team immediately.</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">Can I cancel my order?</p>
                    <p className="pd-faq-answer">Orders can be canceled within 24 hours of placement without penalty. After that, cancellation fees may apply if the item has already shipped.</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">What should I do if I receive the wrong item?</p>
                    <p className="pd-faq-answer">Please report the error within 24 hours. Do not assemble or use the item, and keep all original packaging.</p>
                  </div>
                </div>
              </AccordionItem>
            </div>
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
                  <StarIcon key={i} filled={i < (product.numReviews === 0 ? 5 : Math.round(product.rating || 0))} />
                ))}
              </div>
              <span className="pd-review-count">({product.numReviews || 0} review{product.numReviews !== 1 ? 's' : ''})</span>
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

            {/* Apply Now Section */}
            <div className="pd-apply-wrapper">
              <button 
                className="pd-apply-btn"
                onClick={() => window.open('https://subscribe.podium.com/Diamond-Modern-Furniture', '_blank')}
              >
                Apply Now
              </button>
              <p className="pd-no-credit">No Credit Needed.</p>
            </div>

            {/* Add to Cart Button */}
            <button 
              className="pd-add-cart-btn" 
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart ? 'ADDING...' : 'ADD TO CART'}
            </button>

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

        {/* Similar Products Section */}
        {categoryProducts && categoryProducts.filter(p => p._id !== product._id).length > 0 && (
          <div className="pd-similar-section">
            <ProductCarousel 
              title="You may also like" 
              products={categoryProducts
                .filter(p => p._id !== productId)
                .slice(0, 5)
                .map(p => ({
                  id: p._id,
                  name: p.name,
                  brand: p.brandId || 'Luna',
                  currentPrice: `$${p.price}`,
                  originalPrice: p.discount > 0 ? `$${(p.price / (1 - p.discount / 100)).toFixed(2)}` : '',
                  image: getImageUrl(p.images?.[0] || p.image),
                  rating: p.rating || 0,
                  reviews: p.numReviews || 0,
                  badge: p.discount > 0 ? 'Spring Sale' : ''
                }))
              } 
            />
          </div>
        )}

        {/* Customer Reviews Section */}
        <ReviewSection product={product} onReviewAdded={fetchProductData} />
      </div>

      <Footer />
    </div>
  );
}
