import './TopSpringPicks.css';

export default function TopSpringPicks() {
  const picks = [
    {
      id: 1,
      image: '/spring-picks/image.jpeg',
      title: 'Sectionals',
      price: '$379',
      buttonText: 'Shop Sectionals',
    },
    {
      id: 2,
      image: '/spring-picks/image3.jpeg',
      title: 'Beds',
      price: '$109',
      buttonText: 'Shop Beds',
    },
    {
      id: 3,
      image: '/spring-picks/image2.jpeg',
      title: 'Dining Sets',
      price: '$169',
      buttonText: 'Shop Dining Sets',
    },
  ];

  return (
    <section className="top-spring-picks">
      <div className="spring-picks-container">
        <h2 className="spring-picks-title">Top Spring Picks</h2>
        <div className="spring-picks-grid">
          {picks.map((pick) => (
            <div key={pick.id} className="spring-pick-card">
              <div className="pick-image-wrapper">
                <img 
                  src={pick.image} 
                  alt={pick.title}
                  className="pick-image"
                />
              </div>
              <div className="pick-content">
                <p className="pick-price">Starting at {pick.price}</p>
                <button className="pick-button">{pick.buttonText}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
