import { useEffect, useMemo, useRef, useState } from 'react';
import './TopSpringPicks.css';

const ChevronIcon = ({ direction }) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    aria-hidden="true"
    focusable="false"
    style={{ display: 'block' }}
  >
    {direction === 'left' ? (
      <path
        d="M15 6 9 12l6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="M9 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

export default function TopSpringPicks({ items = [], title = 'Top Spring Picks' }) {
  const trackRef = useRef(null);
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileScrollPercent, setMobileScrollPercent] = useState(0);

  useEffect(() => {
    const updateVisibleCount = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setVisibleCount(mobile ? 1 : 3);
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);

    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const handleMobileScroll = () => {
    if (!trackRef.current) return;

    const track = trackRef.current;
    const maxScroll = Math.max(1, track.scrollWidth - track.clientWidth);
    const scrolledPercent = (track.scrollLeft / maxScroll) * 100;
    setMobileScrollPercent(Math.max(6, Math.min(100, scrolledPercent)));
  };

  const scrollByCard = (direction) => {
    if (!isMobile || !trackRef.current) return;

    const card = trackRef.current.querySelector('.spring-pick-card');
    if (!card) return;

    const cardWidth = card.getBoundingClientRect().width;
    const trackStyles = window.getComputedStyle(trackRef.current);
    const gap = Number.parseFloat(trackStyles.gap || trackStyles.columnGap || '0') || 0;

    trackRef.current.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: 'smooth'
    });
  };

  const maxStart = Math.max(0, items.length - visibleCount);
  const effectiveStartIndex = Math.min(startIndex, maxStart);
  const visibleItems = useMemo(
    () => items.slice(effectiveStartIndex, effectiveStartIndex + visibleCount),
    [items, effectiveStartIndex, visibleCount]
  );

  const progressPercent = useMemo(() => {
    if (!items.length) return 0;
    if (items.length <= visibleCount) return 100;

    if (isMobile) {
      return mobileScrollPercent || 6;
    }

    const pagePercent = ((effectiveStartIndex + 1) / (maxStart + 1)) * 100;
    return Math.max(6, Math.min(100, pagePercent));
  }, [items.length, visibleCount, isMobile, mobileScrollPercent, effectiveStartIndex, maxStart]);

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
              onClick={() => {
                if (isMobile) {
                  scrollByCard(-1);
                  return;
                }

                setStartIndex((prev) => Math.max(0, prev - 1));
              }}
              disabled={effectiveStartIndex === 0}
              aria-label="Previous items"
            >
              <ChevronIcon direction="left" />
            </button>
          )}

          {isMobile ? (
            <div ref={trackRef} className="spring-picks-track is-mobile" onScroll={handleMobileScroll}>
              {items.map((pick) => (
                <div key={pick.id} className="spring-pick-card">
                  <div
                    className={`pick-image-wrapper ${pick.imageOnClick || pick.onClick ? 'pick-clickable' : ''}`}
                    onClick={() => {
                      const imageClick = pick.imageOnClick || pick.onClick;
                      if (imageClick) {
                        imageClick();
                      }
                    }}
                    role={pick.imageOnClick || pick.onClick ? 'button' : undefined}
                    tabIndex={pick.imageOnClick || pick.onClick ? 0 : -1}
                    onKeyDown={(event) => {
                      const imageClick = pick.imageOnClick || pick.onClick;
                      if (imageClick && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        imageClick();
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
                        const buttonClick = pick.buttonOnClick || pick.onClick;
                        if (buttonClick) {
                          buttonClick();
                        }
                      }}
                      disabled={!(pick.buttonOnClick || pick.onClick)}
                    >
                      {pick.buttonText || 'Shop now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="spring-picks-grid">
              {visibleItems.map((pick) => (
                <div key={pick.id} className="spring-pick-card">
                  <div
                    className={`pick-image-wrapper ${pick.imageOnClick || pick.onClick ? 'pick-clickable' : ''}`}
                    onClick={() => {
                      const imageClick = pick.imageOnClick || pick.onClick;
                      if (imageClick) {
                        imageClick();
                      }
                    }}
                    role={pick.imageOnClick || pick.onClick ? 'button' : undefined}
                    tabIndex={pick.imageOnClick || pick.onClick ? 0 : -1}
                    onKeyDown={(event) => {
                      const imageClick = pick.imageOnClick || pick.onClick;
                      if (imageClick && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        imageClick();
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
                        const buttonClick = pick.buttonOnClick || pick.onClick;
                        if (buttonClick) {
                          buttonClick();
                        }
                      }}
                      disabled={!(pick.buttonOnClick || pick.onClick)}
                    >
                      {pick.buttonText || 'Shop now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > visibleCount && (
            <button
              type="button"
              className="spring-picks-arrow"
              onClick={() => {
                if (isMobile) {
                  scrollByCard(1);
                  return;
                }

                setStartIndex((prev) => Math.min(maxStart, prev + 1));
              }}
              disabled={effectiveStartIndex >= maxStart}
              aria-label="Next items"
            >
              <ChevronIcon direction="right" />
            </button>
          )}
        </div>

        {items.length > 0 && (
          <div className="spring-picks-progress-bar-container" aria-hidden="true">
            <div
              className="spring-picks-progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
