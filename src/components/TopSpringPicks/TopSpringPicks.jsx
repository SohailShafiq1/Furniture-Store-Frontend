import { useEffect, useMemo, useState } from 'react';
import './TopSpringPicks.css';

export default function TopSpringPicks({ items = [], title = 'Top Spring Picks' }) {
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    setStartIndex(0);
  }, [items]);

  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(window.innerWidth <= 768 ? 1 : 3);
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);

    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const maxStart = Math.max(0, items.length - visibleCount);
  const visibleItems = useMemo(
    () => items.slice(startIndex, startIndex + visibleCount),
    [items, startIndex, visibleCount]
  );

  if (!items.length) {
    return null;
  }

  return (
    <section className="top-spring-picks">
      <div className="spring-picks-container">
        <h2 className="spring-picks-title">{title}</h2>
        <div className="spring-picks-carousel-row">
          {items.length > visibleCount && (
            <button
              type="button"
              className="spring-picks-arrow"
              onClick={() => setStartIndex((prev) => Math.max(0, prev - 1))}
              disabled={startIndex === 0}
              aria-label="Previous items"
            >
              <span>&lsaquo;</span>
            </button>
          )}

          <div className="spring-picks-grid">
            {visibleItems.map((pick) => (
            <div key={pick.id} className="spring-pick-card">
              <div
                className={`pick-image-wrapper ${pick.onClick ? 'pick-clickable' : ''}`}
                onClick={() => {
                  if (pick.onClick) {
                    pick.onClick();
                  }
                }}
                role={pick.onClick ? 'button' : undefined}
                tabIndex={pick.onClick ? 0 : -1}
                onKeyDown={(event) => {
                  if (pick.onClick && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    pick.onClick();
                  }
                }}
              >
                {pick.mediaType === 'video' ? (
                  <video
                    src={pick.image}
                    className="pick-image"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={pick.image}
                    alt={pick.title || 'Deal item'}
                    className="pick-image"
                  />
                )}
              </div>
              <div className="pick-content">
                {pick.priceLabel && <p className="pick-price">{pick.priceLabel}</p>}
                <button
                  className="pick-button"
                  onClick={() => {
                    if (pick.onClick) {
                      pick.onClick();
                    }
                  }}
                  disabled={!pick.onClick}
                >
                  {pick.buttonText || 'Shop now'}
                </button>
              </div>
            </div>
            ))}
          </div>

          {items.length > visibleCount && (
            <button
              type="button"
              className="spring-picks-arrow"
              onClick={() => setStartIndex((prev) => Math.min(maxStart, prev + 1))}
              disabled={startIndex >= maxStart}
              aria-label="Next items"
            >
              <span>&rsaquo;</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
