import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { Link } from 'react-router-dom';
import './AboutUsPage.css';
import './WhyDimondFurniturePage.css';

export default function WhyDimondFurniturePage() {
  const handleNavigateTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  const mediaItems = [
    { type: 'image', src: '/Why Diamond Final Pictures /1.svg', alt: 'Why Dimond Furniture media 1' },
    { type: 'image', src: '/Why Diamond Final Pictures /2.svg', alt: 'Why Dimond Furniture media 2' },
    { type: 'video', src: '/Why Diamond Final Pictures /3.mp4', alt: 'Why Dimond Furniture media 3' },
    { type: 'video', src: '/Why Diamond Final Pictures /4.mp4', alt: 'Why Dimond Furniture media 4' },
    { type: 'video', src: '/Why Diamond Final Pictures /5.mp4', alt: 'Why Dimond Furniture media 5' },
    { type: 'video', src: '/Why Diamond Final Pictures /6.mp4', alt: 'Why Dimond Furniture media 6' },
  ];

  return (
    <>
      <Header />
      <main className="about-us-page">
        <section className="about-hero" aria-label="Why Dimond Modern Furniture hero section">
          <h1>Why Dimond Modern Furniture? </h1>
        </section>

        <section className="about-intro" aria-label="Why Dimond Modern Furniture intro">
          <p className="about-intro-brand">DIOMOND MODER FURNITURE</p>
          <h2>Where beautiful and affordable furniture is just a click away.</h2>
          <p className="about-intro-subheading">
           Since 2016, we’ve been helping customers create beautiful spaces with seamless nationwide delivery. Recognized as one of the top 100 furniture stores in the US, we offer great prices, fast deliveries, and a delightful shopping experience.
          </p>
          <div className="about-intro-video-wrap">
            <iframe
              className="about-intro-video"
              src="https://www.youtube.com/embed/VOWwkDXWuFA"
              title="Home is more than a place"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </section>

        {[
          {
            title: 'Extensive Warehouse Inventory',
            body: 'We take pride in our diverse selection. From sleek modern sofas to classic dining sets, we have something for every style. Our well-stocked warehouse means your orders are fulfilled quickly, so you can start enjoying your new furniture without waiting.',
            cta: 'All Collections',
            to: '/all-collections',
          },
          {
            title: 'Fast Nationwide Delivery',
            body: 'Your satisfaction is our priority, and that includes getting your furniture to you quickly. Whether you live in a busy city or a quiet town, our fast nationwide delivery ensures you can enjoy Dimond Modern Furniture’s offerings no matter where you are.',
            cta: 'Delivery Options',
            to: '/all-collections',
            mirrored: true,
          },
          {
            title: 'Affordable Prices',
            body: 'We believe quality furniture should be affordable. At Dimond Modern Furniture, you’ll find stylish and durable pieces at prices that make decorating your home easy on your budget.',
            cta: 'Shop Sale',
            to: '/deals',
          },
          {
            title: 'Top 100 in the US*',
            body: 'We’re proud to be recognized as one of the top 100 furniture stores in the US. This shows the trust and preference our customers have for us, and we’re always striving to be even better.\n\n* Website Traffic Rankings by SimilarWeb (May 2025)',
            mirrored: true,
          },
          {
            title: 'Easy Online Shopping',
            body: 'Our website sees a lot of visitors, a sign of our satisfied customers. Our secure and robust IT infrastructure means you can browse, order, and track your deliveries with confidence.',
            cta: 'Shop Now',
            to: '/',
          },
          {
            title: 'Friendly, Professional Team',
            body: 'Our team is here to make your shopping experience enjoyable. We love helping you find the perfect furniture for your home, answering your questions, and guiding you through the selection process.',
            cta: 'Contact Us',
            to: '/contact-us',
            mirrored: true,
          },
        ].map((section, index) => {
          const media = mediaItems[index];
          return (
            <section
              key={section.title}
              className="about-split about-split-story why-dimond-section"
              aria-label="Why Dimond Modern Furniture section"
            >
              {section.mirrored ? null : (
                <div className="about-split-image-wrap why-dimond-image-wrap">
                  {media.type === 'video' ? (
                    <video className="about-split-image" autoPlay muted loop playsInline preload="metadata">
                      <source src={media.src} type="video/mp4" />
                    </video>
                  ) : (
                    <img src={media.src} alt={media.alt} className="about-split-image" />
                  )}
                </div>
              )}

              <div className="about-split-text why-dimond-text">
                <h3>{section.title}</h3>
                <p>{section.body}</p>
                {section.cta ? (
                  <Link to={section.to} className="why-dimond-collections-btn">
                    {section.cta}
                  </Link>
                ) : null}
              </div>

              {section.mirrored ? (
                <div className="about-split-image-wrap why-dimond-image-wrap">
                  {media.type === 'video' ? (
                    <video className="about-split-image" autoPlay muted loop playsInline preload="metadata">
                      <source src={media.src} type="video/mp4" />
                    </video>
                  ) : (
                    <img src={media.src} alt={media.alt} className="about-split-image" />
                  )}
                </div>
              ) : null}
            </section>
          );
        })}
        <section className="about-cta" aria-label="Transform your home">
          <div className="about-cta-container">
            <h3>At Dimond Modern Furniture, we believe everyone deserves a beautiful and comfortable home.
</h3>
            <p>
            Explore our collections, enjoy our fast nationwide delivery, and see why so many people love shopping with us. Your dream home is just a click away!
            </p>
            <div className="about-cta-actions">
              <Link to="/" className="about-cta-btn about-cta-btn-primary" onClick={handleNavigateTop}>Let&apos;s Shop</Link>
              <Link to="/financing" className="about-cta-btn about-cta-btn-secondary" onClick={handleNavigateTop}>Financing</Link>
            </div>
          </div>
        </section>
        
      </main>
      <Footer />
    </>
  );
}
