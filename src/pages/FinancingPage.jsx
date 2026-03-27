import React, { useState } from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import SlidingBanner from '../components/SlidingBanner/SlidingBanner';
import './FinancingPage.css';

const FinancingPage = () => {
  const [expandedCondition, setExpandedCondition] = useState(null);

  const financingOptions = [
    { name: 'Pop', logo: 'Ⓟ' },
    { name: 'Klarna', logo: '𝓚' },
    { name: 'Layaway Program', logo: '📦' },
    { name: 'Snap Finance', logo: '◆' },
    { name: 'Synchrony', logo: '📊' },
    { name: 'Affirm', logo: '✓' },
    { name: 'Shop Pay', logo: '🛍️' },
  ];

  const steps = [
    {
      title: 'Fill your cart.',
      description: 'Add your desired products to the cart and place your order today.',
      image: '/Financing/financing-cart.png'
    },
    {
      title: 'Choose payment.',
      description: 'Submit an online application and receive your result within minutes.',
      image: '/Financing/financing-payment.png'
    },
    {
      title: 'Pay over time.',
      description: 'Own the product of your dreams with monthly payment options that fit your budget.',
      image: '/Financing/financing-time.png'
    }
  ];

  const conditions = [
    {
      id: 1,
      title: 'What is Snap Finance?',
      content: 'Snap Finance offers lease-to-own financing that empowers credit-challenged shoppers with the buying power to get what they need, now. Snap was founded on the principle that you should thrive with financing that\'s accessible, affordable, and completely transparent. The application is easy, and you\'ll find out in seconds if you\'ve been approved.'
    },
    {
      id: 2,
      title: 'Requirements to Apply',
      content: 'To apply, you\'ll need to: Be of legal age to enter into a contract, Have a steady monthly income, Have an active checking account, Provide a valid email address and phone number. That\'s it! You can apply online or we can help you in-store. Snap offers flexible payment options that fit your pay schedule, so it\'s convenient too! With approvals up to $5,000 – get what you need today with Snap!'
    },
    {
      id: 3,
      title: 'Credit Worries?',
      content: 'Don\'t let a less-than-perfect credit score hold you back. Snap Finance offers lease-to-own financing, empowering those with credit challenges to get what they need, now. High-interest rates and fees may apply. No credit needed. Quick application process. The application does not affect your credit score. 100-Day option with no interest.'
    }
  ];

  const toggleCondition = (id) => {
    setExpandedCondition(expandedCondition === id ? null : id);
  };

  return (
    <div className="financing-page">
      <Header />
      
      {/* Hero Section */}
      <section className="financing-hero">
        <div className="financing-hero-content">
          <h1>Financing</h1>
          
        </div>
      </section>

      {/* Easy Financing Section */}
      <section className="easy-financing">
        <span className="section-tag">EASY FINANCING, ANYTIME!</span>
        <h2>We offer a range of flexible financing options tailored to your specific needs.</h2>
        <p>
          We're here to make your furniture shopping experience as flexible and stress-free as possible because 
          we understand that everyone's financial situation is unique. That's why we offer a range of flexible 
          financing options tailored to your specific needs.
        </p>
      </section>

      {/* Financing Options - Using SlidingBanner */}
      <SlidingBanner />

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How it works?</h2>
        <div className="steps-grid">
          {steps.map((step, idx) => (
            <div key={idx} className="step-card">
              <div className="step-image-wrapper">
                <img src={step.image} alt={step.title} className="step-image" />
              </div>
              <div className="step-bottom">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Snap Finance Section */}
      <section className="snap-finance-section">
        <div className="snap-header">
          <h2>Credit worries? No problem.</h2>
          <p>
            Don't let a less-than-perfect credit score hold you back. Snap Finance offers lease-to-own financing, 
            empowering those with credit challenges to get what they need, now.
          </p>
        </div>

        <div className="snap-details">
          <div className="snap-left">
            <div className="snap-logo-box">
              <div className="snap-logo-placeholder">🔷</div>
            </div>
          </div>
          <div className="snap-right">
            <h3>Flexible finance solutions to suit your needs.</h3>
            <p className="location-label">In-Store & Online</p>
            <ul className="snap-features">
              <li>No credit needed.</li>
              <li>Quick application process.</li>
              <li>The application does not affect your credit score.</li>
              <li>100-Day option with no interest.</li>
              <li>High-interest rates and fees may apply.</li>
            </ul>
            <button className="apply-now-btn">Apply Now</button>
          </div>
        </div>
      </section>

      {/* Conditions Section */}
      <section className="conditions-section">
        {conditions.map((condition) => (
          <div key={condition.id} className="condition-item">
            <button
              className={`condition-toggle ${expandedCondition === condition.id ? 'active' : ''}`}
              onClick={() => toggleCondition(condition.id)}
            >
              <span className="condition-icon">📋</span>
              {condition.title}
              <span className="toggle-arrow">⌄</span>
            </button>
            {expandedCondition === condition.id && (
              <div className="condition-content">
                <p>{condition.content}</p>
              </div>
            )}
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
};

export default FinancingPage;
