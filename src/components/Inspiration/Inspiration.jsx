import './Inspiration.css';

export default function Inspiration() {
  const articles = [
    {
      id: 1,
      image: '/download.jpeg',
      category: 'SPRING CLEANING',
      title: 'Spring Cleaning: A Fresh Start for Your Home',
      description: "Let's be honest—spring cleaning always sounds like a great idea until you actually start. One moment you're ready to conquer the world with a mop in one hand and a...",
    },
    {
      id: 2,
      image: '/download (1).jpeg',
      category: 'WORLD SLEEP DAY',
      title: 'Better Sleep Starts Here: Tips Everyone Should Know',
      description: 'World Sleep Day is here, reminding us how important good sleep truly is. While we might view sleep as simply a way to rest after a tiring day, its benefits...',
    },
    {
      id: 3,
      image: '/download (2).jpeg',
      category: 'LIVING ROOM',
      title: 'How to Pick the Perfect Coffee Table for Your Sectional',
      description: 'A sectional sofa is often the heart of a living room—where people gather, unwind, and create memories. But what truly completes this setup? The perfect coffee table. The right coffee...',
    },
    {
      id: 4,
      image: '/download (3).jpeg',
      category: 'GAME DAY',
      title: 'Game Day Setup at Home',
      description: "The Super Bowl isn't just about football—it's about bringing people together, enjoying great food, and making unforgettable memories. Whether you're hosting a big crowd or planning a cozy night in...",
    },
  ];

  return (
    <section className="inspiration">
      <div className="inspiration-container">
        <div className="inspiration-header">
          <h2 className="inspiration-title">Inspiration</h2>
          <a href="#" className="view-all-link">View all</a>
        </div>
        <div className="articles-grid">
          {articles.map((article) => (
            <div key={article.id} className="article-card">
              <div className="article-image-wrapper">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="article-image"
                />
                <div className="article-category">
                  <span className="category-label">{article.category}</span>
                </div>
              </div>
              <div className="article-content">
                <h3 className="article-title">{article.title}</h3>
                <p className="article-description">{article.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
