import './FinancingCarousel.css';

export default function FinancingCarousel({ title, options }) {
  // Duplicate options 3 times for seamless infinite loop
  const allOptions = [...options, ...options, ...options];

  return (
    <section className="financing-carousel" data-aos="fade-up">
      <div className="financing-carousel-container">
        <div className="financing-carousel-header">
          <h2 className="financing-carousel-title" data-aos="fade-right">{title}</h2>
        </div>
        <div className="financing-carousel-track">
          <div className="financing-carousel-content">
            {allOptions.map((option, idx) => (
              <div key={`${option.name}-${idx}`} className="financing-card">
                <div className="financing-logo-wrapper">
                  <div className="financing-logo">{option.logo}</div>
                </div>
                <h3 className="financing-name">{option.name}</h3>
                {option.description && (
                  <p className="financing-description">{option.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
