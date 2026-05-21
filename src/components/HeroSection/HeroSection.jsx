import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './HeroSection.css';

// Public assets are referenced by absolute paths from the Vite public folder.
const DESKTOP_IMAGES = [
  '/Desktop/6.jpg',
  '/Desktop/7.jpg',
  '/Desktop/8.jpg',
  '/Desktop/9.jpg',
  '/Desktop/10.jpg'
];

const PHONE_IMAGES = [
  '/Phone/1.jpg',
  '/Phone/2.jpg',
  '/Phone/3.jpg',
  '/Phone/4.jpg',
  '/Phone/5.jpg'
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(null);
  const [isFading, setIsFading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Determine which images to use
  const images = isMobile ? PHONE_IMAGES : DESKTOP_IMAGES;

  useEffect(() => {
    setCurrentImageIndex(0);
    setNextImageIndex(null);
    setIsFading(false);
  }, [images]);

  // Handle window resize to switch between mobile and desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cycle through images every 5 seconds with smooth transition
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      if (isFading) return;

      const upcomingIndex = (currentImageIndex + 1) % images.length;
      const preloadImage = new Image();

      preloadImage.src = images[upcomingIndex];
      preloadImage.onload = () => {
        setNextImageIndex(upcomingIndex);
        requestAnimationFrame(() => setIsFading(true));
      };

      preloadImage.onerror = () => {
        setCurrentImageIndex(upcomingIndex);
      };
    }, 5000);

    return () => clearInterval(interval);
  }, [images, currentImageIndex, isFading]);

  useEffect(() => {
    if (!isFading || nextImageIndex === null) return;

    const cleanupTimeout = setTimeout(() => {
      setCurrentImageIndex(nextImageIndex);
      setNextImageIndex(null);
      setIsFading(false);
    }, 1150);

    return () => clearTimeout(cleanupTimeout);
  }, [isFading, nextImageIndex]);

  const handleBannerClick = () => {
    navigate('/deals');
  };

  return (
    <section className="hero-section" data-aos="fade-in">
      <div className="hero-container" data-aos="zoom-out" data-aos-delay="200">
        {/* Desktop Hero Image - Carousel */}
        <div 
          className="hero-image-picture"
          onClick={handleBannerClick}
          style={{ cursor: 'pointer' }}
        >
          <img
            src={images[currentImageIndex]}
            alt="Hero Banner"
            className="hero-image hero-image--current"
            style={{ cursor: 'pointer' }}
          />

          {nextImageIndex !== null && (
            <img
              src={images[nextImageIndex]}
              alt="Hero Banner"
              className={`hero-image hero-image--next ${isFading ? 'is-visible' : ''}`}
            />
          )}
        </div>

        {/* CTA Button Only - text is part of the image
        <div className="hero-content">
          <button className="cta-button">REFRESH YOUR SPACE</button>
        </div> */}
      </div>
    </section>
  );
}
