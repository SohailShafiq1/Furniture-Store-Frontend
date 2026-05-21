import './SlidingBanner.css';

export default function SlidingBanner() {
  const items = [
    { id: 1, type: 'image', src: '/Financing Companies/Gemini_Generated_Image_23za9423za9423za.png', alt: 'Financing company 1' },
    { id: 2, type: 'image', src: '/Financing Companies/Gemini_Generated_Image_5hjrcc5hjrcc5hjr.png', alt: 'Financing company 2' },
    { id: 3, type: 'image', src: '/Financing Companies/Gemini_Generated_Image_9mxnxb9mxnxb9mxn.png', alt: 'Financing company 3' },
    { id: 4, type: 'image', src: '/Financing Companies/Gemini_Generated_Image_gafu2mgafu2mgafu (1).png', alt: 'Financing company 4' },
    { id: 5, type: 'image', src: '/Financing Companies/Gemini_Generated_Image_n2wrjsn2wrjsn2wr.png', alt: 'Financing company 5' },
    { id: 6, type: 'image', src: '/Financing Companies/Gemini_Generated_Image_p2q74xp2q74xp2q7.png', alt: 'Financing company 6' },
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
