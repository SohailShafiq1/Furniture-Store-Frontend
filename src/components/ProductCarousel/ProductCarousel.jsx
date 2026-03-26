import './ProductCarousel.css';

export default function ProductCarousel({ title, products }) {
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
    <section className="product-carousel" data-aos="fade-up">
      <div className="product-carousel-container">
        <div className="product-carousel-header">
          <h2 className="product-carousel-title" data-aos="fade-right">{title}</h2>
          <a href="#" className="view-all-link">View all</a>
        </div>
        <div className="products-scroll-container">
          <div className="products-grid">
            {products.map((product, idx) => (
              <div key={product.id} className="product-card" data-aos="fade-up" data-aos-delay={idx * 100}>
                <div className="product-image-wrapper">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-badges">
                    {product.badge && (
                      <span className="badge spring-sale">
                        <svg className="badge-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                          <line x1="7" y1="7" x2="7.01" y2="7"></line>
                        </svg>
                        {product.badge}
                      </span>
                    )}
                    {product.stockStatus && (
                      <span className="badge in-stock">{product.stockStatus}</span>
                    )}
                  </div>
                </div>
                <div className="product-info">
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
        </div>
      </div>
    </section>
  );
}
