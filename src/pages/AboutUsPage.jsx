import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { Link } from 'react-router-dom';
import './AboutUsPage.css';

export default function AboutUsPage() {
  const handleNavigateTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  return (
    <>
      <Header />
      <main className="about-us-page">
        <section className="about-hero" aria-label="About us hero section">
          <h1>About Us</h1>
        </section>

        <section className="about-intro" aria-label="About us intro">
          <p className="about-intro-brand">DIOMOND MODER FURNITURE</p>
          <h2>Furniture for every room, every mood.</h2>
          <p className="about-intro-subheading">
            Enjoy a wide range of products, flexible financing, and top-notch
            service to create the home you love.
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

        <section className="about-split about-split-story" aria-label="Our story section">
          <div className="about-split-image-wrap">
            <img src="/stores.webp" alt="Luna Furniture store" className="about-split-image" />
          </div>
          <div className="about-split-text">
            <h3>Our Story</h3>
            <p>
              Our story begins with the Ilhan family, who brought a multi-generational legacy and over 40 years of collective experience from the European furniture sector to the United States. This deep industry knowledge allowed them to identify a common problem for American consumers: the often slow, complex, and expensive process of furnishing a home. They saw a clear opportunity to solve it.
            </p>
            <p>
              Bringing their family&#39;s passion for service and value, they established Luna Furniture in Houston in April 2016. From day one, their mission was to help people transform their houses into dream spaces with ease and joy. We pioneered a model of both online and retail sales built on a simple promise: offering quality furniture at fair prices.
            </p>
            <p>
              This commitment to value and customer satisfaction has been the cornerstone of our growth. By focusing on an efficient business model that partners with trusted brands, we are able to deliver the styles you love without the long waits and high markups of traditional retail.
            </p>
            <p>
              Today, we are proud to have become one of the largest online furniture retailers in the USA-a testament to the trust our customers place in us. Our journey, rooted in the Ilhan family&#39;s passion and decades of experience, is one of a relentless drive to offer a better way to shop for your home.
            </p>
            <p>
              We are Luna Furniture, and we are here to help you create a space you love.
            </p>
          </div>
        </section>

        <section className="about-marquee" aria-label="Ranking highlight">
          <div className="about-marquee-track">
            <span>
              <img src="/scroll-28.png" alt="" aria-hidden="true" className="about-marquee-icon" />
              Ranked top 100 among US furniture stores!*
            </span>
            <span>
              <img src="/scroll-28.png" alt="" aria-hidden="true" className="about-marquee-icon" />
              Ranked top 100 among US furniture stores!*
            </span>
          </div>
        </section>

        <section className="about-split about-split-customer" aria-label="Customer first section">
          <div className="about-split-text">
            <h3>Customer First, Always.</h3>
            <p>
              At Luna Furniture, our customers are at the heart of everything we do.
              We understand the excitement and apprehension that come with buying
              furniture online for the first time. That&#39;s why we ensure a seamless
              shopping experience from product discovery to delivery. We promise to
              enrich your shopping experience with both physical and digital tools,
              providing the quality service you deserve at every step.
            </p>
          </div>
          <div className="about-split-image-wrap">
            <img src="/stores.webp" alt="Customer service at Luna Furniture" className="about-split-image" />
          </div>
        </section>

        <section className="about-features" aria-label="Service highlights">
          <div className="about-features-grid">
            <article className="about-feature-card">
              <div className="about-feature-media">
                <img src="/1.png" alt="Affordable prices" className="about-feature-icon" />
              </div>
              <h4>Affordable Prices</h4>
              <p>Quality furniture at fair prices made for every home and budget.</p>
            </article>

            <article className="about-feature-card">
              <div className="about-feature-media">
                <img src="/2.gif" alt="Wide product range" className="about-feature-icon" />
              </div>
              <h4>Wide Product Range</h4>
              <p>Explore sofas, beds, dining sets, and more in styles you love.</p>
            </article>

            <article className="about-feature-card">
              <div className="about-feature-media">
                <img src="/3.png" alt="Flexible financing" className="about-feature-icon" />
              </div>
              <h4>Flexible Financing</h4>
              <p>Choose easy payment options designed to fit your lifestyle.</p>
            </article>

            <article className="about-feature-card">
              <div className="about-feature-media">
                <img src="/4.png" alt="Fast delivery" className="about-feature-icon" />
              </div>
              <h4>Fast Delivery</h4>
              <p>We partner with experienced delivery professionals to ensure your furniture arrives quickly and safely. If any issues arise, our team is always here to help.</p>
            </article>

            <article className="about-feature-card">
              <div className="about-feature-media">
                <img src="/5.png" alt="Stock availability" className="about-feature-icon" />
              </div>
              <h4>Stock Availability</h4>
              <p>Unlike many online retailers, we do not drop-ship. All orders ship directly from our own warehouses.</p>
            </article>

            <article className="about-feature-card">
              <div className="about-feature-media">
                <img src="/6.png" alt="Customer service" className="about-feature-icon" />
              </div>
              <h4>Customer Service</h4>
              <p>Our dedicated team is committed to providing a 5-star experience. If we make a mistake, we will do everything we can to make it right.</p>
            </article>
          </div>
        </section>

        <section className="about-end-banner" aria-label="About page banner">
          <picture>
            <source media="(max-width: 640px)" srcSet="/aboutbanner-mob.jpeg" />
            <img src="/aboutbanner-web.jpeg" alt="About us banner" className="about-end-banner-image" />
          </picture>
        </section>

        <section className="about-cta" aria-label="Transform your home">
          <div className="about-cta-container">
            <h3>Transform Your Home with Luna.</h3>
            <p>
              Luna Furniture believes in making it easy for everyone to create a home they love. Through innovation and a customer-centric approach, we offer a seamless shopping experience that covers everything from product discovery to delivery. Join us in transforming your living space with quality, style, and convenience.
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
