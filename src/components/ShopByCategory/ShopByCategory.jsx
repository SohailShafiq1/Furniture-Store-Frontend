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
  const [isMobileView, setIsMobileView] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const updateViewport = () => setIsMobileView(window.innerWidth <= 768);

    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const updateScrollState = () => {
    const track = trackRef.current;
    if (!track) return;
    const overflow = track.scrollWidth > track.clientWidth + 8;
    setHasOverflow(overflow);
    setCanScrollLeft(track.scrollLeft > 8);
    setCanScrollRight(overflow && track.scrollLeft + track.clientWidth < track.scrollWidth - 8);
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

  const scrollByOneCategory = (direction) => {
    const track = trackRef.current;
    if (!track) return;

    const firstItem = track.querySelector('.category-item');
    const itemWidth = firstItem?.getBoundingClientRect().width || 180;
    const gap = window.innerWidth <= 768 ? 15 : 22;
    scrollByOffset(direction * (itemWidth + gap));
  };

  if (loading) {
    return (
      <>
        <h2 className="category-heading">Shop by Category</h2>
        <section className="shop-by-category">
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading categories...</div>
        </section>
      </>
    );
  }

  const shouldShowArrows = showArrows && hasOverflow && !isMobileView;

  return (
    <>
      <h2 className="category-heading" data-aos="fade-up">Shop by Category</h2>
      <section className={`shop-by-category ${shouldShowArrows ? '' : 'no-arrows'}`}>
        <div className="category-carousel">
          {shouldShowArrows && (
            <button
              type="button"
              className={`carousel-arrow carousel-arrow-left ${canScrollLeft ? '' : 'disabled'}`}
              onClick={() => scrollByOneCategory(-1)}
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
          {shouldShowArrows && (
            <button
              type="button"
              className={`carousel-arrow carousel-arrow-right ${canScrollRight ? '' : 'disabled'}`}
              onClick={() => scrollByOneCategory(1)}
              disabled={!canScrollRight}
              aria-label="Scroll categories right"
            >
              <FiChevronRight />
            </button>
          )}
        </div>
      </section>
    </>
  );
}
