import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './ProductCarousel.css';

export default function ProductCarousel({
  title,
  products,
  showViewAll = true,
  onViewAllClick,
  onProductClick,
  maxDesktopVisible,
  className = ''
}) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);
  const [cartPopup, setCartPopup] = useState('');

  useEffect(() => {
    setStartIndex(0);
  }, [products]);

  useEffect(() => {
    if (!cartPopup) return undefined;

    const timer = window.setTimeout(() => setCartPopup(''), 2200);
    return () => window.clearTimeout(timer);
  }, [cartPopup]);

  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      let nextVisibleCount;

      if (width <= 768) {
        nextVisibleCount = 1;
      } else if (width <= 1024) {
        nextVisibleCount = 2;
      } else if (width <= 1280) {
        nextVisibleCount = 3;
      } else if (width <= 1800) {
        nextVisibleCount = 5;
      } else {
        nextVisibleCount = 6;
      }

      if (typeof maxDesktopVisible === 'number' && width > 1024) {
        nextVisibleCount = Math.min(nextVisibleCount, maxDesktopVisible);
      }

      setVisibleCount(nextVisibleCount);
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);

    return () => window.removeEventListener('resize', updateVisibleCount);
  }, [maxDesktopVisible]);

  const maxStart = Math.max(0, products.length - visibleCount);
  const visibleProducts = useMemo(
    () => products.slice(startIndex, startIndex + visibleCount),
    [products, startIndex, visibleCount]
  );

  const handleProductClick = (product) => {
    if (onProductClick) {
      onProductClick(product);
      return;
    }

    if (product?.targetPath) {
      navigate(product.targetPath);
    }
  };

  const handleAddToCart = async (product, event) => {
    event?.stopPropagation();

    const parsedPrice = typeof product.price === 'number'
      ? product.price
      : Number.parseFloat(String(product.currentPrice || '').replace(/[^0-9.]/g, '')) || 0;
    const discount = typeof product.discount === 'number' ? product.discount : 0;

    const added = await addToCart(
      product.id,
      null,
      1,
      parsedPrice,
      {
        name: product.name,
        image: product.image,
        brand: product.brand,
        price: parsedPrice
      },
      null,
      discount
    );

    if (added) {
      setCartPopup(`${product.name} added to cart`);
    } else {
      setCartPopup('Unable to add item to cart');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    // If no rating (0 stars), show 5 full stars by default
    const displayRating = rating === 0 ? 5 : rating;
    const fullStars = Math.floor(displayRating);
    const hasHalfStar = displayRating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    const emptyStars = 5 - Math.ceil(displayRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }
    return stars;
  };

  return (
    <section className={`product-carousel ${className}`.trim()} data-aos="fade-up">
      {cartPopup && (
        <div className="product-cart-popup" role="status" aria-live="polite">
          {cartPopup}
        </div>
      )}
      <div className="product-carousel-container">
        <div className="product-carousel-header">
          <h2 className="product-carousel-title" data-aos="fade-right">{title}</h2>
          {showViewAll && (
            <a
              href="#"
              className="view-all-link"
              onClick={(event) => {
                if (!onViewAllClick) return;
                event.preventDefault();
                onViewAllClick(event);
              }}
            >
              View all
            </a>
          )}
        </div>
        <div className="products-scroll-container">
          <div className="products-carousel-row">
            {products.length > visibleCount && (
              <button
                type="button"
                className="products-arrow"
                onClick={() => setStartIndex((prev) => Math.max(0, prev - 1))}
                disabled={startIndex === 0}
                aria-label="Previous products"
              >
                <span>&lsaquo;</span>
              </button>
            )}

            <div className="products-grid" style={{ gridTemplateColumns: `repeat(${visibleCount}, minmax(0, 1fr))` }}>
              {visibleProducts.map((product, idx) => (
              <div
                key={product.id}
                className="product-card"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
                role={onProductClick || product?.targetPath ? 'button' : undefined}
                tabIndex={onProductClick || product?.targetPath ? 0 : undefined}
                onClick={onProductClick || product?.targetPath ? () => handleProductClick(product) : undefined}
                onKeyDown={
                  onProductClick || product?.targetPath
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleProductClick(product);
                        }
                      }
                    : undefined
                }
              >
                <div className="product-image-wrapper">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="product-image"
                  />
                </div>
                <div className="product-info">
                  <div className="product-top-row">
                    <div className="product-badges">
                      {product.badge && (
                        <span className="badge spring-sale">
                          <svg className="badge-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M20 10.6V6a2 2 0 0 0-2-2h-4.6a2 2 0 0 0-1.4.59L4.59 12a2 2 0 0 0 0 2.82l4.59 4.59a2 2 0 0 0 2.82 0L19.41 12a2 2 0 0 0 .59-1.4Z" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="15" cy="9" r="1.4" fill="#ffffff"/>
                          </svg>
                          {product.badge}
                        </span>
                      )}
                      {product.anniversary && (
                        <span className="badge anniversary">
                          <svg className="badge-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M20 10.6V6a2 2 0 0 0-2-2h-4.6a2 2 0 0 0-1.4.59L4.59 12a2 2 0 0 0 0 2.82l4.59 4.59a2 2 0 0 0 2.82 0L19.41 12a2 2 0 0 0 .59-1.4Z" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="15" cy="9" r="1.4" fill="#ffffff"/>
                          </svg>
                          {product.saleTitle || 'Anniversary Sale'}
                        </span>
                      )}
                      {product.quantity > 0 && (
                        <span className="badge in-stock">In Stock</span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="product-cart-overlay"
                      aria-label={`Add ${product.name} to cart`}
                      onClick={(event) => handleAddToCart(product, event)}
                    >
                      <svg viewBox="0 0 24 24" className="product-cart-icon" aria-hidden="true">
                        <path d="M7 7h14l-2 8H8L7 7Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M7 7 6.2 4.6A1 1 0 0 0 5.24 4H3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="9" cy="19" r="1.5" fill="currentColor"/>
                        <circle cx="17" cy="19" r="1.5" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                  <p className="product-brand">{product.brand}</p>
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-rating">
                    <div className="stars">{renderStars(product.rating)}</div>
                    <span className="reviews-count">({product.reviews})</span>
                  </div>
                  <div className="product-pricing">
                    <span className="current-price">{product.currentPrice}</span>
                    <span className="original-price">{product.originalPrice}</span>
                  </div>
                  {/* In-stock CTA removed — keep only badge to avoid extra button at carousel end */}
                </div>
              </div>
              ))}
            </div>

            {products.length > visibleCount && (
              <button
                type="button"
                className="products-arrow"
                onClick={() => setStartIndex((prev) => Math.min(maxStart, prev + 1))}
                disabled={startIndex >= maxStart}
                aria-label="Next products"
              >
                <span>&rsaquo;</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
