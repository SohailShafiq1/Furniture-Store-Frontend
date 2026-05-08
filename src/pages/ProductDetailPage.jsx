import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MdLocalShipping } from 'react-icons/md';
import { IoPricetagSharp } from 'react-icons/io5';
import { useUserAuth } from '../context/UserAuthContext';
import { useCart } from '../context/CartContext';
import { useProductsByCategory } from '../hooks/useProductsByCategory';
import { API_BASE_URL, BACKEND_URL } from '../config/api';
import { getAlternateImageUrl, getImageUrl as buildImageUrl } from '../utils/imageUrl';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Modal from '../components/Modal/Modal';
import ReviewSection from '../components/ReviewSection/ReviewSection';
import ProductCarousel from '../components/ProductCarousel/ProductCarousel';
import InspirationSection from '../components/Inspiration/InspirationSection';
import ShopByCategory from '../components/ShopByCategory/ShopByCategory';
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
  const [allProducts, setAllProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const deliveryOptions = [
    {
      id: 'outdoor-drop-off',
      image: '/d1.png',
      heading: 'Outdoor Drop-Off',
      description: 'Your items will be delivered at the exterior entrance of your residence or building on the ground floor. Appointment required; does not include assembly, demonstration, or cleanup.'
    },
    {
      id: 'indoor-drop-off',
      image: '/d2.png',
      heading: 'Indoor Drop-Off',
      description: 'Your items will be delivered inside the front door of your home. Appointment required; does not include assembly, demonstration, or cleanup.'
    },
    {
      id: 'room-of-choice',
      image: '/d3.png',
      heading: 'Room of Choice',
      description: 'Nationwide in-room delivery available across the contiguous U.S. Appointment required. Service does not include assembly, demonstration, or cleanup.'
    },
    {
      id: 'white-glove',
      image: '/d4.png',
      heading: 'White Glove',
      description: 'Experience our premium White Glove service - available nationwide across the U.S. Includes delivery to your room of choice, assembly, demonstration, and cleanup. Appointment needed.'
    },
    {
      id: 'pick-up',
      image: '/d5.png',
      heading: 'Pick Up',
      description: 'Choose to pick up your order directly from our warehouses free of charge and enjoy the convenience of collecting your furniture at your schedule. Unable to pick it up? We offer delivery services in your area for a fee.'
    }
  ];

  const getCategoryId = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value._id || '';
  };

  const normalizeName = (value) => String(value || '').trim().toLowerCase();

  const isMatchingTarget = (target = {}, currentProduct = null) => {
    if (!currentProduct) return false;

    const targetType = target?.targetType;
    const currentCategoryId = getCategoryId(currentProduct.category);
    const currentSubCategory = normalizeName(currentProduct.subCategoryName);
    const currentSubSubCategory = normalizeName(currentProduct.subSubCategoryName);

    if (targetType === 'product') {
      return String(target?.productId || '') === String(currentProduct._id || '');
    }

    if (String(target?.categoryId || '') !== String(currentCategoryId || '')) {
      return false;
    }

    if (targetType === 'category') return true;

    if (targetType === 'subCategory') {
      return normalizeName(target?.subCategoryName) === currentSubCategory;
    }

    if (targetType === 'subSubCategory') {
      return (
        normalizeName(target?.subCategoryName) === currentSubCategory &&
        normalizeName(target?.subSubCategoryName) === currentSubSubCategory
      );
    }

    return false;
  };

  const resolveProductsFromTarget = (target = {}, products = []) => {
    const targetType = target?.targetType;
    const targetCategoryId = String(target?.categoryId || '');
    const targetSubCategory = normalizeName(target?.subCategoryName);
    const targetSubSubCategory = normalizeName(target?.subSubCategoryName);

    if (!Array.isArray(products) || products.length === 0) return [];

    if (targetType === 'product') {
      return products.filter((p) => String(p._id) === String(target?.productId || ''));
    }

    if (targetType === 'category') {
      return products.filter((p) => String(getCategoryId(p.category)) === targetCategoryId);
    }

    if (targetType === 'subCategory') {
      return products.filter(
        (p) =>
          String(getCategoryId(p.category)) === targetCategoryId &&
          normalizeName(p.subCategoryName) === targetSubCategory
      );
    }

    if (targetType === 'subSubCategory') {
      return products.filter(
        (p) =>
          String(getCategoryId(p.category)) === targetCategoryId &&
          normalizeName(p.subCategoryName) === targetSubCategory &&
          normalizeName(p.subSubCategoryName) === targetSubSubCategory
      );
    }

    return [];
  };

  const toCarouselProduct = (p, options = {}) => ({
    id: p._id,
    name: p.name,
    brand: p.brandId || 'Dimond Modern Furniture',
    currentPrice: `$${p.price}`,
    originalPrice: p.discount > 0 ? `$${(p.price / (1 - p.discount / 100)).toFixed(2)}` : '',
    image: buildImageUrl(p.images?.[0] || p.image),
    rating: p.rating || 0,
    reviews: p.numReviews || 0,
    badge: p.discount > 0 ? (options.saleBadge || 'Spring Sale') : '',
    stockStatus: options.includeStock ? 'In Stock' : undefined,
    targetPath: `/product/${getCategoryId(p.category)}/${p._id}`
  });
  
  const fetchProductData = async () => {
    try {
      setLoading(true);
      const [productsRes, collectionsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/products/all`),
        fetch(`${API_BASE_URL}/collections/all`)
      ]);

      const productsData = await productsRes.json();
      const collectionsData = collectionsRes.ok ? await collectionsRes.json() : [];

      const productsList = Array.isArray(productsData) ? productsData : [];
      const foundProduct = productsList.find(p => p._id === productId);

      setProduct(foundProduct);
      setAllProducts(productsList);
      setCollections(Array.isArray(collectionsData) ? collectionsData : []);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setCollections([]);
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

  const recommendationPool = allProducts.length > 0 ? allProducts : categoryProducts;
  const currentCategoryId = getCategoryId(product.category);
  const currentSubCategoryName = normalizeName(product.subCategoryName);
  const productCollectionName = normalizeName(product.collectionName);

  const exploreCollectionProducts = (() => {
    const sameCollection = (collections || []).find(
      (collection) =>
        normalizeName(collection?.name) === productCollectionName ||
        normalizeName(collection?.mainBanner?.title) === productCollectionName
    );

    const fallbackCollections = (collections || []).filter((collection) =>
      (collection?.collectionItems || []).some((item) => isMatchingTarget(item?.target, product))
    );

    const sourceCollections = sameCollection ? [sameCollection] : fallbackCollections;
    const linkedCollectionItems = sourceCollections
      .flatMap((collection) => collection?.collectionItems || [])
      .sort((a, b) => {
        const priority = {
          product: 1,
          subSubCategory: 2,
          subCategory: 3,
          category: 4
        };
        const aPriority = priority[a?.target?.targetType] || 99;
        const bPriority = priority[b?.target?.targetType] || 99;
        return aPriority - bPriority;
      });

    const seen = new Set();
    const result = [];
    const priority = {
      product: 1,
      subSubCategory: 2,
      subCategory: 3,
      category: 4
    };

    const addCandidates = (items = []) => {
      items.forEach((candidate) => {
        if (!candidate || String(candidate._id) === String(product._id)) return;
        if (seen.has(candidate._id)) return;
        seen.add(candidate._id);
        result.push(candidate);
      });
    };

    linkedCollectionItems.forEach((item) => {
      const targetProducts = resolveProductsFromTarget(item?.target, recommendationPool);
      addCandidates(targetProducts);
    });

    if (result.length === 0) {
      const otherCollections = (collections || []).filter(
        (collection) => String(collection?._id || '') !== String(sameCollection?._id || '')
      );

      const fallbackCollectionList = otherCollections.length > 0 ? otherCollections : collections || [];

      const otherCollectionItems = fallbackCollectionList
        .flatMap((collection) => collection?.collectionItems || [])
        .sort((a, b) => {
          const aPriority = priority[a?.target?.targetType] || 99;
          const bPriority = priority[b?.target?.targetType] || 99;
          return aPriority - bPriority;
        });

      otherCollectionItems.forEach((item) => {
        const targetProducts = resolveProductsFromTarget(item?.target, recommendationPool);
        addCandidates(targetProducts);
      });
    }

    if (result.length === 0) {
      const nonCurrentProducts = recommendationPool.filter(
        (p) => p && String(p._id) !== String(product._id)
      );
      addCandidates(nonCurrentProducts);
    }

    return result.slice(0, 5).map((p) =>
      toCarouselProduct(p, { saleBadge: 'Anniversary Sale', includeStock: true })
    );
  })();

  const exploreCollectionIds = new Set(exploreCollectionProducts.map((p) => String(p.id)));

  const youMayAlsoLikeProducts = (() => {
    const seen = new Set();
    const matched = [];

    const addItems = (items = []) => {
      items.forEach((item) => {
        if (!item || String(item._id) === String(product._id)) return;
        if (exploreCollectionIds.has(String(item._id))) return;
        if (seen.has(item._id)) return;
        seen.add(item._id);
        matched.push(item);
      });
    };

    const strictSubCategoryMatches = recommendationPool.filter(
      (p) =>
        p &&
        String(p._id) !== String(product._id) &&
        String(getCategoryId(p.category)) === String(currentCategoryId) &&
        normalizeName(p.subCategoryName) === currentSubCategoryName
    );

    const otherCategoryProducts = recommendationPool.filter(
      (p) =>
        p &&
        String(p._id) !== String(product._id) &&
        String(getCategoryId(p.category)) !== String(currentCategoryId)
    );

    const sameCategoryFallback = recommendationPool.filter(
      (p) =>
        p &&
        String(p._id) !== String(product._id) &&
        String(getCategoryId(p.category)) === String(currentCategoryId)
    );

    // Keep recommendations highly relevant first.
    addItems(strictSubCategoryMatches.slice(0, 3));

    // Blend in products from other categories.
    addItems(otherCategoryProducts.slice(0, 2));

    if (matched.length < 5) {
      addItems(strictSubCategoryMatches);
    }

    if (matched.length < 5) {
      addItems(sameCategoryFallback);
    }

    if (matched.length < 5) {
      addItems(otherCategoryProducts);
    }

    return matched.slice(0, 5).map((p) => toCarouselProduct(p));
  })();

  // Ready Made Sets - Filter products from readyMadeProducts array
  const readyMadeProducts = (() => {
    if (!product?.readyMadeProducts || product.readyMadeProducts.length === 0) {
      return [];
    }
    
    const readyMadeIds = product.readyMadeProducts.map(id => String(id));
    const matched = allProducts.filter(p => 
      p && readyMadeIds.includes(String(p._id))
    );
    
    return matched.map((p) => toCarouselProduct(p, { saleBadge: 'Ready Made Set', includeStock: true }));
  })();

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

  // Media/video banner logic
  const videoSource = product?.videoUrl || product?.videoFile || product?.video || product?.video_link || '';
  const getYouTubeEmbed = (url) => {
    if (!url) return '';
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) {
        return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
      }
      if (u.hostname.includes('youtube.com')) {
        return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
      }
    } catch (e) {
      return '';
    }
    return '';
  };
  const videoEmbedUrl = (videoSource && (String(videoSource).includes('youtube') || String(videoSource).includes('youtu.be'))) ? getYouTubeEmbed(videoSource) : '';
  const hasVideo = !!videoSource;


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
                <img
                  src={buildImageUrl(galleryImages[mainImageIndex])}
                  alt={product.name}
                  onError={(e) => {
                    const originalPath = galleryImages[mainImageIndex];
                    const currentSrc = e.currentTarget.src;
                    const alternateUrl = getAlternateImageUrl(currentSrc, originalPath);
                    if (alternateUrl && alternateUrl !== currentSrc) {
                      e.currentTarget.src = alternateUrl;
                    } else {
                      e.currentTarget.onerror = null;
                    }
                  }}
                />
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
                  <img
                    src={buildImageUrl(img)}
                    alt={`View ${idx + 1}`}
                    onError={(e) => {
                      const currentSrc = e.currentTarget.src;
                      const alternateUrl = getAlternateImageUrl(currentSrc, img);
                      if (alternateUrl && alternateUrl !== currentSrc) {
                        e.currentTarget.src = alternateUrl;
                      } else {
                        e.currentTarget.onerror = null;
                      }
                    }}
                  />
                </button>
              ))}
            </div>

            <p className="pd-disclaimer">Actual item may be lighter/darker than pictured.</p>

            <div className="pd-cta-group pd-cta-mobile">
              <div className="pd-apply-wrapper">
                <button 
                  className="pd-apply-btn"
                  onClick={() => window.open('https://subscribe.podium.com/Diamond-Modern-Furniture', '_blank')}
                >
                  Apply Now
                </button>
                <p className="pd-no-credit">No Credit Needed.</p>
              </div>

              <button 
                className="pd-add-cart-btn" 
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? 'ADDING...' : 'ADD TO CART'}
              </button>
            </div>

            {/* Description & Specifications Section */}
            <div className="pd-description-section">
              {/* <h2 className="pd-section-title">Description</h2> */}
              
              {/* Product Overview Accordion */}
              <AccordionItem 
                title="Description" 
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
                <div className="pd-delivery-cards">
                  {deliveryOptions.map((option) => (
                    <div key={option.id} className="pd-delivery-card">
                      <img src={option.image} alt={option.heading} className="pd-delivery-card-image" loading="lazy" />
                      <div className="pd-delivery-card-body">
                        <h3>{option.heading}</h3>
                        <p>{option.description}</p>
                      </div>
                    </div>
                  ))}
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
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">What are the accepted payment methods?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">Do you offer Financing?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">How do I know if the item is available/ in stock?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">Can I see the furniture in person?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">Will you take my old furniture?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">Where do I leave my old furniture?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">Will the item look the same as in the picture?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">How long will it take to receive my order?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">Which delivery method should I select?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">I want to know the exact time of when the delivery will occur!</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">How can I help to ensure a smooth delivery process?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">I was not home when the delivery team showed up. What can I do?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">Can I upgrade my delivery method?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">I do not like the item delivered or the item did not fit in my home. What can I do?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">I have received a defective/damaged item. What can I do?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">I have received a missing item. What can I do?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">Can I pick up my furniture?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">Why is Luna Furniture requesting additional information to fulfill my order?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">Can I cancel my order?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">How long does it take to receive my refund?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">I want to know more about your policies!</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">What should I do if I receive the wrong item?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">How can I report a wrong item?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">What happens if I don't report the wrong item within 24 hours?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">What should I do with the wrong item?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">Can I still get a refund if I dispose of the wrong item?</p>
                  </div>
                  <div className="pd-faq-item">
                    <p className="pd-faq-question">Can I exchange the wrong item for the correct one?</p>
                  </div>
                </div>
              </AccordionItem>
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="pd-details-section">
            <div className="pd-status-badges">
              <span className="pd-status-pill pd-status-pill-stock">In Stock</span>
              <span className="pd-status-pill pd-status-pill-anniversary"><IoPricetagSharp className="pd-pill-icon" /> Anniversary Sale</span>
            </div>

            {/* Title */}
            <h1 className="pd-title">{product.name}</h1>

            {/* Brand & Collection */}
            <div className="pd-meta">
              {/* <span className="pd-collection">{product.collectionName || 'Dimond Modern Collection'}</span> */}
              <span className="pd-by">By {product.brandId ? <Link to={`/brand/${encodeURIComponent(product.brandId)}`}>{product.brandId}</Link> : 'Dimond Modern Furniture'}</span>
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

          

            {/* Price Section */}
            <div className="pd-price-section">
              <div className="pd-price-container">
                <span className="pd-current-price">${currentPrice}</span>
                {product.discount > 0 && (
                  <span className="pd-original-price">${(currentPrice / (1 - product.discount / 100)).toFixed(2)}</span>
                )}
              </div>
          <p className="pd-discount-text">
            Add to cart to see your automatic savings
          </p>
              <p className="pd-discount-text">Extra 5% off with code <span className="pd-code">55OFF</span></p>
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
                        padding: '20px 40px',
                        border: selectedVariation === idx ? '2px solid #FF6B35' : '1px solid #D1D1D1',
                        borderRadius: '8px',
                        background: selectedVariation === idx ? '#fff' : '#fff',
                        boxShadow: selectedVariation === idx ? '0 0 0 1px #FF6B35' : 'none',
                        color: '#333',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '20px',
                        minWidth: '120px',
                        textAlign: 'left',
                         boxShadow: '0 6px 10px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {variation.name}
                       {/* <span style={{ marginLeft: '8px', fontWeight: '700' }}>${variation.price}</span> */}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="pd-cta-group pd-cta-desktop">
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

              {/* Financing Options */}
              <div className="pd-financing-options">
                {/* Klarna */}
                <div className="pd-financing-card">
                  <p className="pd-financing-text">
                    From <span className="pd-financing-price">$49</span>/month, or 4 payments at 0% interest with <span className="pd-financing-provider">Klarna</span>
                  </p>
                  <a href="https://subscribe.podium.com/Diamond-Modern-Furniture" target="_blank" rel="noopener noreferrer" className="pd-financing-link">Check purchase power</a>
                </div>

                {/* Shop Pay */}
                <div className="pd-financing-card">
                  <p className="pd-financing-text">
                    From <span className="pd-financing-price">${(currentPrice / 12).toFixed(2)}</span>/mo with <span className="pd-financing-provider">shop<span className="pd-shop-pay-badge">Pay</span></span>
                  </p>
                  <a href="https://subscribe.podium.com/Diamond-Modern-Furniture" target="_blank" rel="noopener noreferrer" className="pd-financing-link">View sample plans</a>
                </div>
              </div>
            </div>

            {/* Old Shop Pay Section - Removed as it's now in financing options */}

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
                <MdLocalShipping className="pd-ship-icon" />
                <div>
                  <p className="pd-ship-label">Estimated Ship Date</p>
                  <p className="pd-ship-value">In 2 weeks</p>
                </div>
              </div>
              
              {/* Policy Links */}
              <p className="pd-policy-disclaimer">
                *Check our <Link to="/delivery-policy" className="pd-policy-link-text">Delivery Policy</Link> . *Conditions apply.
              </p>
            </div>

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

        <div className="pd-fast-banner-rank-box">
          <div className="pd-fast-banner-rank-inner">
            <img
              src="/ranked.png"
              alt="Ranked top 100 among US furniture stores"
              className="pd-fast-banner-rank-image"
            />
          </div>
        </div>
        {/* Fast Nationwide Banner */}
        <div className="pd-fast-banner">
          <div className="pd-fast-banner-inner">
            <h3>FAST NATIONWIDE WHITE GLOVE DELIVERY - AND MORE</h3>
            <p>Free Express Shipping • Outdoor Drop-Off • Indoor Drop-Off • Room of Choice</p>
          </div>
        </div>


        {/* Discover the Look Section with Video (if available) */}
        {hasVideo && (
          <div className="pd-discover-section">
            <h2 className="pd-discover-title">Discover the Look</h2>
            {videoEmbedUrl ? (
              <div className="pd-video-wrapper">
                <iframe
                  src={videoEmbedUrl}
                  title="Product video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="pd-video-wrapper">
                <video controls className="pd-video">
                  <source src={videoSource} />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>
        )}

        {/* Similar Products Section */}
        {(youMayAlsoLikeProducts.length > 0 || exploreCollectionProducts.length > 0) && (
          <div className="pd-similar-section">
            {/* {youMayAlsoLikeProducts.length > 0 && (
              <ProductCarousel 
                title="You may also like" 
                products={youMayAlsoLikeProducts}
                className="pd-reference-carousel"
                maxDesktopVisible={4}
                onProductClick={(clickedProduct) => {
                  if (clickedProduct?.targetPath) {
                    navigate(clickedProduct.targetPath);
                  }
                }}
              />
            )} */}

            {exploreCollectionProducts.length > 0 && (
              <div className="pd-explore-collections-section">
                <ProductCarousel 
                  title="Explore the collections" 
                  showViewAll={false}
                  products={exploreCollectionProducts}
                  className="pd-reference-carousel"
                  maxDesktopVisible={4}
                  onProductClick={(clickedProduct) => {
                    if (clickedProduct?.targetPath) {
                      navigate(clickedProduct.targetPath);
                    }
                  }}
                />
              </div>
            )}


          </div>
        )}


{readyMadeProducts.length > 0 && (
          <div className="pd-explore-collections-section">
            <ProductCarousel 
              title="Ready made sets" 
              showViewAll={false}
              products={readyMadeProducts}
              className="pd-reference-carousel"
              maxDesktopVisible={4}
              onProductClick={(clickedProduct) => {
                if (clickedProduct?.targetPath) {
                  navigate(clickedProduct.targetPath);
                }
              }}
            />
          </div>
        )}

  {/* Similar Products Section */}
        {(youMayAlsoLikeProducts.length > 0 || exploreCollectionProducts.length > 0) && (
          <div className="pd-similar-section">
            {youMayAlsoLikeProducts.length > 0 && (
              <ProductCarousel 
                title="You may also like" 
                products={youMayAlsoLikeProducts}
                className="pd-reference-carousel"
                maxDesktopVisible={4}
                onProductClick={(clickedProduct) => {
                  if (clickedProduct?.targetPath) {
                    navigate(clickedProduct.targetPath);
                  }
                }}
              />
            )}

            {/* {exploreCollectionProducts.length > 0 && (
              <div className="pd-explore-collections-section">
                <ProductCarousel 
                  title="Explore the collections" 
                  showViewAll={false}
                  products={exploreCollectionProducts}
                  className="pd-reference-carousel"
                  maxDesktopVisible={4}
                  onProductClick={(clickedProduct) => {
                    if (clickedProduct?.targetPath) {
                      navigate(clickedProduct.targetPath);
                    }
                  }}
                />
              </div>
            )} */}


          </div>
        )}

        <InspirationSection />

        {/* Customer Reviews Section */}
        <ReviewSection product={product} onReviewAdded={fetchProductData} />

        {/* Shop by Category Section */}
        <ShopByCategory />

        
      </div>

      <Footer />
    </div>
  );
}
