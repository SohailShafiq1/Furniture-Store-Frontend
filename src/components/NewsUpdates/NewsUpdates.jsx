import './NewsUpdates.css';

export default function NewsUpdates() {
  const news = [
    {
      id: 1,
      image: '/download.jpeg',
      title: 'Luna Premium Store Opens in Chantilly, VA – A New Standard of Luxury Living',
      description: 'CHANTILLY, VA – October 2025 – Luna Furniture proudly announces the grand opening of its newest concept showroom, Luna Premium Store, located at 4437 Brookfield Corporate Dr, Suite 207A, Chantilly,...',
    },
    {
      id: 2,
      image: '/download (1).jpeg',
      title: 'Ranked in the Top 100 US Furniture Stores — Thank You!',
      description: '📊 As of May 2025, Luna Furniture is Ranked #98 in the US Furniture Category* We are proud to announce that Luna Furniture has officially entered the Top 100 Furniture...',
    },
    {
      id: 3,
      image: '/download (2).jpeg',
      title: 'Luna Furniture Expands Houston Presence with New Parkshire Store!',
      description: 'We are proud to announce the grand opening of our newest showroom in Houston, Texas! This marks our second location in the vibrant Houston area and our third in the great...',
    },
  ];

  return (
    <section className="news-updates">
      <div className="news-container">
        <h2 className="news-title">Luna Furniture News & Updates</h2>
        <div className="news-grid">
          {news.map((item) => (
            <div key={item.id} className="news-card">
              <div className="news-image-wrapper">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="news-image"
                />
              </div>
              <div className="news-content">
                <h3 className="news-card-title">{item.title}</h3>
                <p className="news-description">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
