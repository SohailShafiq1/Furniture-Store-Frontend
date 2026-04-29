import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useCategoryData } from '../../hooks/useCategoryData';
import { getAlternateImageUrl, getImageUrl } from '../../utils/imageUrl';
import './ShopByCategory.css';

export default function ShopByCategory({ showArrows = true, allCategories = false }) {
  const { categories, loading } = useCategoryData();
  const visibleCategories = allCategories
    ? categories
    : categories.filter((cat) => cat.showInShopByCategory !== false);
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollLeft(track.scrollLeft > 8);
    setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 8);
  };

  useEffect(() => {
    if (!showArrows) return;
    updateScrollState();
    const handleResize = () => updateScrollState();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [visibleCategories.length, showArrows]);

  const scrollByOffset = (offset) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: offset, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="shop-by-category">
        <h2 className="category-heading">Shop by Category</h2>
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading categories...</div>
      </section>
    );
  }

  return (
    <section className={`shop-by-category ${showArrows ? '' : 'no-arrows'}`}>
      <h2 className="category-heading" data-aos="fade-up">Shop by Category</h2>
      <div className="category-carousel">
        {showArrows && (
          <button
            type="button"
            className={`carousel-arrow carousel-arrow-left ${canScrollLeft ? '' : 'disabled'}`}
            onClick={() => scrollByOffset(-420)}
            disabled={!canScrollLeft}
            aria-label="Scroll categories left"
          >
            <FiChevronLeft />
          </button>
        )}

        <div className={`category-track-wrapper ${showArrows ? '' : 'no-arrows'}`}>
          <div
            className="category-track"
            ref={trackRef}
            onScroll={showArrows ? updateScrollState : undefined}
          >
            {visibleCategories.map((cat, idx) => {
              const displayName = (cat.shopByCategoryName || '').trim() || cat.name;
              const imageUrl = getImageUrl(cat.image);
              return (
                <Link
                  key={cat._id}
                  to={`/category/${cat._id}`}
                  className="category-item"
                  data-aos="zoom-in"
                  data-aos-delay={idx * 50}
                >
                  <div className="category-circle">
                    <img
                      src={imageUrl}
                      alt={displayName}
                      className="category-image"
                      loading="lazy"
                      onError={(e) => {
                        const currentSrc = e.currentTarget.src;
                        const alternateUrl = getAlternateImageUrl(currentSrc, cat.image);

                        if (alternateUrl && alternateUrl !== currentSrc) {
                          e.currentTarget.src = alternateUrl;
                        } else {
                          e.currentTarget.onerror = null;
                        }
                      }}
                    />
                  </div>
                  <span className="category-label">{displayName}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {showArrows && (
          <button
            type="button"
            className={`carousel-arrow carousel-arrow-right ${canScrollRight ? '' : 'disabled'}`}
            onClick={() => scrollByOffset(420)}
            disabled={!canScrollRight}
            aria-label="Scroll categories right"
          >
            <FiChevronRight />
          </button>
        )}
      </div>
    </section>
  );
}
