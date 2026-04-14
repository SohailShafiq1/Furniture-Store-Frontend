import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { Link } from 'react-router-dom';
import './AboutUsPage.css';
import './WhyDimondFurniturePage.css';

export default function WhyDimondFurniturePage() {
  const handleNavigateTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  return (
    <>
      <Header />
      <main className="about-us-page">
        <section className="about-hero" aria-label="Why Dimond Furniture hero section">
          <h1>Why Dimond Modern? </h1>
        </section>

        <section className="about-intro" aria-label="Why Dimond Furniture intro">
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

        <section className="about-split about-split-story why-dimond-section" aria-label="Why Dimond Furniture section">
          <div className="about-split-image-wrap why-dimond-image-wrap">
            <img src="/stores.webp" alt="Why Dimond Furniture" className="about-split-image" />
          </div>
          <div className="about-split-text why-dimond-text">
            <h3>Extensive Warehouse Inventory</h3>
            {/* <h4>WELCOME TO LUNA</h4> */}
           
            <p>
                 We take pride in our diverse selection. From sleek modern sofas to
             classic dining sets, we have something for every style. Our well-stocked warehouse means your orders are fulfilled quickly, so you can start enjoying your new furniture without waiting.


            </p>
            <Link to="/all-collections" className="why-dimond-collections-btn">All Collections</Link>
          </div>
        </section>

        <section className="about-split about-split-story why-dimond-section" aria-label="Why Dimond Furniture section mirrored">
          <div className="about-split-text why-dimond-text">
            <h3>Fast Nationwide Delivery</h3>
            {/* <h4>WELCOME TO LUNA</h4> */}

            <p>
                 Your satisfaction is our priority, and that includes getting your furniture to you quickly. Whether you live in a busy city or a quiet town, our fast nationwide delivery ensures you can enjoy Luna Furniture’s offerings no matter where you are.

            </p>
            <Link to="/all-collections" className="why-dimond-collections-btn">Delivery Options</Link>
          </div>
          <div className="about-split-image-wrap why-dimond-image-wrap">
            <img src="/stores.webp" alt="Why Dimond Furniture" className="about-split-image" />
          </div>
        </section>
            <section className="about-split about-split-story why-dimond-section" aria-label="Why Dimond Furniture section">
          <div className="about-split-image-wrap why-dimond-image-wrap">
            <img src="/stores.webp" alt="Why Dimond Furniture" className="about-split-image" />
          </div>
          <div className="about-split-text why-dimond-text">
            <h3>Affordable Prices</h3>
            {/* <h4>WELCOME TO LUNA</h4> */}
           
            <p>
                We believe quality furniture should be affordable. At Luna Furniture, you’ll find stylish and durable pieces at prices that make decorating your home easy on your budget.

            </p>
            <Link to="/deals" className="why-dimond-collections-btn">Shop Sale</Link>
          </div>
        </section>
         <section className="about-split about-split-story why-dimond-section" aria-label="Why Dimond Furniture section mirrored">
          <div className="about-split-text why-dimond-text">
            <h3>Top 100 in the US*</h3>
            {/* <h4>WELCOME TO LUNA</h4> */}

            <p>
                 We’re proud to be recognized as one of the top 100 furniture stores in the US. This shows the trust and preference our customers have for us, and we’re always striving to be even better.

* Website Traffic Rankings by SimilarWeb (May 2025)

            </p>
            {/* <Link to="/all-collections" className="why-dimond-collections-btn">Delivery Options</Link> */}
          </div>
          <div className="about-split-image-wrap why-dimond-image-wrap">
            <img src="/stores.webp" alt="Why Dimond Furniture" className="about-split-image" />
          </div>
        </section>
        <section className="about-split about-split-story why-dimond-section" aria-label="Why Dimond Furniture section">
          <div className="about-split-image-wrap why-dimond-image-wrap">
            <img src="/stores.webp" alt="Why Dimond Furniture" className="about-split-image" />
          </div>
          <div className="about-split-text why-dimond-text">
            <h3>Easy Online Shopping</h3>
            {/* <h4>WELCOME TO LUNA</h4> */}
           
            <p>
              Our website sees a lot of visitors, a sign of our satisfied customers. Our secure and robust IT infrastructure means you can browse, order, and track your deliveries with confidence.


            </p>
            <Link to="/" className="why-dimond-collections-btn">Shop Now</Link>
          </div>
        </section>
        <section className="about-split about-split-story why-dimond-section" aria-label="Why Dimond Furniture section mirrored">
          <div className="about-split-text why-dimond-text">
            <h3>Friendly, Professional Team</h3>
            {/* <h4>WELCOME TO LUNA</h4> */}

            <p>
                Our team is here to make your shopping experience enjoyable. We love helping you find the perfect furniture for your home, answering your questions, and guiding you through the selection process.

            </p>
            <Link to="/contact-us" className="why-dimond-collections-btn">Contact Us</Link>
          </div>
          <div className="about-split-image-wrap why-dimond-image-wrap">
            <img src="/stores.webp" alt="Why Dimond Furniture" className="about-split-image" />
          </div>
        </section>
        <section className="about-cta" aria-label="Transform your home">
          <div className="about-cta-container">
            <h3>At Luna Furniture, we believe everyone deserves a beautiful and comfortable home.
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
