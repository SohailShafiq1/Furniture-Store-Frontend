import './TopSpringPicks.css';

export default function TopSpringPicks({ items = [], title = 'Top Spring Picks' }) {

  if (!items.length) {
    return null;
  }

  return (
    <section className="top-spring-picks">
      <div className="spring-picks-container">
        <h2 className="spring-picks-title">{title}</h2>
        <div className="spring-picks-grid">
          {items.map((pick) => (
            <div key={pick.id} className="spring-pick-card">
              <div className="pick-image-wrapper">
                <img 
                  src={pick.image} 
                  alt={pick.title || 'Deal item'}
                  className="pick-image"
                />
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
      </div>
    </section>
  );
}
