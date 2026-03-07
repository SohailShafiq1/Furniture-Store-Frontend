import './SlidingBanner.css';

export default function SlidingBanner() {
  const items = [
    { id: 1, type: 'text', content: 'every room,' },
    { id: 2, type: 'image', src: '/category/bedroom_6b25cc7c-ac96-4ce7-a44f-504036ac840b.webp', alt: 'Bedroom' },
    { id: 3, type: 'text', content: 'every mood.' },
    { id: 4, type: 'image', src: '/category/living-room_da94c724-0fba-40fe-9384-303ada964589.jpg', alt: 'Living Room' },
    { id: 5, type: 'text', content: 'Furniture for' },
    { id: 6, type: 'image', src: '/download (1).jpeg', alt: 'Furniture' },
  ];

  // Duplicate items for seamless loop
  const allItems = [...items, ...items, ...items];

  return (
    <section className="sliding-banner">
      <div className="banner-track">
        <div className="banner-content">
          {allItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className="banner-item">
              {item.type === 'text' ? (
                <span className="banner-text">{item.content}</span>
              ) : (
                <div className="banner-image-wrapper">
                  <img 
                    src={item.src} 
                    alt={item.alt}
                    className="banner-image"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
