import './HeroSection.css';

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* Desktop Hero Image */}
        <picture className="hero-image-picture">
          <source 
            media="(max-width: 768px)" 
            srcSet="/spring-sale-mobile-campaign.jpeg"
          />
          <source 
            media="(min-width: 769px)" 
            srcSet="/images.jpeg"
          />
          <img 
            src="/images.jpeg" 
            alt="Spring Sale - Up to 70% Off" 
            className="hero-image"
          />
        </picture>

        {/* CTA Button Only - text is part of the image */}
        <div className="hero-content">
          <button className="cta-button">REFRESH YOUR SPACE</button>
        </div>
      </div>
    </section>
  );
}
