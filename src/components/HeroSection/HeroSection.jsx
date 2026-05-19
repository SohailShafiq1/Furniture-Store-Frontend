import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './HeroSection.css';

// Dynamically import all images from Desktop and Phone folders
const desktopImages = import.meta.glob('/public/Desktop/*.{jpg,jpeg,png,webp}', { eager: true });
const phoneImages = import.meta.glob('/public/Phone/*.{jpg,jpeg,png,webp}', { eager: true });

const DESKTOP_IMAGES = Object.values(desktopImages)
  .map((module) => module.default)
  .sort();

const PHONE_IMAGES = Object.values(phoneImages)
  .map((module) => module.default)
  .sort();

export default function HeroSection() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Determine which images to use
  const images = isMobile ? PHONE_IMAGES : DESKTOP_IMAGES;

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
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

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
            className="hero-image"
            style={{ cursor: 'pointer' }}
            key={currentImageIndex}
          />
        </div>

        {/* CTA Button Only - text is part of the image
        <div className="hero-content">
          <button className="cta-button">REFRESH YOUR SPACE</button>
        </div> */}
      </div>
    </section>
  );
}
