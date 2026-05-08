import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductCarousel.css';

export default function ProductCarousel({
  title,
  products,
  showViewAll = true,
  onProductClick,
  maxDesktopVisible,
  className = ''
}) {
  const navigate = useNavigate();
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    setStartIndex(0);
  }, [products]);

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
      } else if (width <= 1500) {
        nextVisibleCount = 4;
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
      <div className="product-carousel-container">
        <div className="product-carousel-header">
          <h2 className="product-carousel-title" data-aos="fade-right">{title}</h2>
          {showViewAll && <a href="#" className="view-all-link">View all</a>}
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
                  {product.badge && (
                    <div className="product-badges">
                      <span className="badge spring-sale">
                        <svg className="badge-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M20 10.6V6a2 2 0 0 0-2-2h-4.6a2 2 0 0 0-1.4.59L4.59 12a2 2 0 0 0 0 2.82l4.59 4.59a2 2 0 0 0 2.82 0L19.41 12a2 2 0 0 0 .59-1.4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="15" cy="9" r="1.5" fill="currentColor"/>
                        </svg>
                        {product.badge}
                      </span>
                    </div>
                  )}
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
