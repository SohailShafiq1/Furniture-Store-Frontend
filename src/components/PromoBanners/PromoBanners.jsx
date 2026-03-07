import './PromoBanners.css';

export default function PromoBanners() {
  const banners = [
    {
      id: 1,
      image: '/download.jpeg',
      title: 'Up to 70% Off',
      description: 'The living room upgrade your refund was waiting for.',
      buttonText: 'Shop Living Room',
    },
    {
      id: 2,
      image: '/download (3).jpeg',
      title: 'Starting at $249',
      description: 'Kick back with comfort your wallet will like too.',
      buttonText: 'Shop Recliners',
    },
  ];

  return (
    <section className="promo-banners">
      <div className="promo-banners-container">
        <div className="banners-grid">
          {banners.map((banner) => (
            <div key={banner.id} className="promo-banner-card">
              <div className="banner-image-section">
                <img 
                  src={banner.image} 
                  alt={banner.title}
                  className="banner-image"
                />
              </div>
              <div className="banner-content-section">
                <h3 className="banner-title">{banner.title}</h3>
                <p className="banner-description">{banner.description}</p>
                <button className="banner-button">{banner.buttonText}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
