import './HeroSection.css';

export default function HeroSection() {
  return (
    <section className="hero-section" data-aos="fade-in">
      <div className="hero-container" data-aos="zoom-out" data-aos-delay="200">
        {/* Desktop Hero Image */}
        <picture className="hero-image-picture">
          <source 
            media="(max-width: 768px)" 
            srcSet="/spring-sale-mobile-campaign.jpeg"
          />
          <source 
            media="(min-width: 769px)" 
            srcSet="/sale.webp"
          />
          <img
            src="/images.jpeg" 
            alt="Spring Sale - Up to 70% Off" 
            className="hero-image"
          />
        </picture>

        {/* CTA Button Only - text is part of the image
        <div className="hero-content">
          <button className="cta-button">REFRESH YOUR SPACE</button>
        </div> */}
      </div>
    </section>
  );
}
