import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdCheck, MdAssignment, MdLocalShipping, MdPerson, MdGavel, MdPhone } from 'react-icons/md';
import axios from 'axios';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { API_BASE_URL } from '../config/api';
import './AboutUsPage.css';
import './FAQSPage.css';
import './DeliveryPolicyPage.css';

export default function DeliveryPolicyPage() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [openItem, setOpenItem] = useState('');
  const [storeReviews, setStoreReviews] = useState([]);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  const deliveryOptions = [
    {
      id: 'outdoor-drop-off',
      image: '/d1.png',
      heading: 'Outdoor Drop-Off',
      description: 'Your items will be delivered at the exterior entrance of your residence or building on the ground floor. Appointment required; does not include assembly, demonstration, or cleanup.'
    },
    {
      id: 'indoor-drop-off',
      image: '/d2.png',
      heading: 'Indoor Drop-Off',
      description: 'Your items will be delivered inside the front door of your home. Appointment required; does not include assembly, demonstration, or cleanup.'
    },
    {
      id: 'room-of-choice',
      image: '/d3.png',
      heading: 'Room of Choice',
      description: 'Nationwide in-room delivery available across the contiguous U.S. Appointment required. Service does not include assembly, demonstration, or cleanup.'
    },
    {
      id: 'white-glove',
      image: '/d4.png',
      heading: 'White Glove',
      description: 'Experience our premium White Glove service - available nationwide across the U.S. Includes delivery to your room of choice, assembly, demonstration, and cleanup. Appointment needed.'
    },
    {
      id: 'pick-up',
      image: '/d5.png',
      heading: 'Pick Up',
      description: 'Choose to pick up your order directly from our warehouses free of charge and enjoy the convenience of collecting your furniture at your schedule. Unable to pick it up? We offer delivery services in your area for a fee.'
    }
  ];

  const cardsPerView = 3;
  const maxIndex = Math.max(0, deliveryOptions.length - cardsPerView);

  const handlePrevious = () => {
    setCarouselIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCarouselIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  useEffect(() => {
    const loadStoreReviews = async () => {
      try {
        const storeId = localStorage.getItem('storeId') || 'default-store';
        const response = await axios.get(`${API_BASE_URL}/reviews/store`, {
          params: { store: storeId, page: 1, limit: 8, sort: 'recent' }
        });

        const incomingReviews = Array.isArray(response.data?.reviews) ? response.data.reviews : [];
        const fiveStarOnly = incomingReviews.filter((review) => Number(review?.rating) === 5);
        setStoreReviews(fiveStarOnly);
        setActiveReviewIndex(0);
      } catch (error) {
        console.error('Error loading reviews for delivery policy page:', error);
      }
    };

    loadStoreReviews();
  }, []);

  const activeReview = storeReviews[activeReviewIndex] || null;
  const activeReviewRating = Number(activeReview?.rating || 0);
  const starRow = `${'★'.repeat(Math.max(0, Math.min(5, activeReviewRating)))}${'☆'.repeat(5 - Math.max(0, Math.min(5, activeReviewRating)))}`;

  const policySections = [
    {
      id: 'conditions',
      icon: <MdAssignment />,
      question: 'Conditions',
      answer: (
        <>
          <ul>
            <li>Estimated Ship Date is the estimated ship-out date from our warehouse. The final delivery date depends on transit time from TX, MD, CA, or IL warehouses (based on vendor/item availability and your address). Most items ship the next business day outside the Houston area; next-day delivery in Houston is available for most items (not on Sundays/Mondays).</li>
            <li>Parts and products not in stock in our warehouse or with our vendors will be back-ordered after receiving your order. If there are back-ordered items in an order, even if other items in the order are in stock, all items will be shipped to the customer together after they arrive at our warehouse.</li>
            <li>If an order includes both Free Express Shipping eligible items and non-eligible items, we do not split deliveries; all items will be delivered together once the full order is ready to ship.</li>
            <li>The delivery date may vary depending on the availability of the products from vendor companies, destination, weather conditions, shipping volumes, and force majeure.</li>
            <li>Changes in inventory or delivery capacity, as well as unforeseen circumstances beyond our control, may delay the delivery of your order.</li>
            <li>In case of refusing or returning the shipment, the buyer will be charged a 30% restocking fee as well as two-way freight costs.</li>
            <li>In case of refusal of shipment or failure to comply with the delivery requirements; attempted delivery, detention, and/or storage fees will be the sole responsibility of the consignee.</li>
            <li>Please make sure the furniture will fit in your home before placing an order. This includes checking that it can pass through doors, hallways, stairs, and that it fits in the space you plan to place it.</li>
            <li>If the dimensions are not listed on the product page, please contact us before ordering—we're happy to help!</li>
            <li>It is the customer's responsibility to confirm that the furniture will fit. If you decide to return an item because it doesn't fit, you will be responsible for a 30% restocking fee and return shipping costs.</li>
          </ul>
        </>
      )
    },
    {
      id: 'damaged-products',
      icon: <MdLocalShipping />,
      question: 'Damaged Products & Missing Pieces',
      answer: (
        <>
          <p>Damaged products and missing pieces must be reported within 24 hours of delivery. Please report damaged products via our Damage Claim page. After 24 hours of delivery, no claims will be allowed. Therefore, please inspect the merchandise for damages or missing parts as soon as you receive your product(s).</p>
          <ul>
            <li>Attach photos of the damaged product to the email</li>
            <li>Keep the original packaging of the damaged merchandise as it is required for replacement</li>
          </ul>
          <p><strong>Warranty Service:</strong></p>
          <p>In the event of a defective product covered under warranty, service will be carried out in accordance with the manufacturer's policies. An expert will first be dispatched with the necessary repair materials, and the product will be restored to a like-new condition. If the expert determines that the product cannot be repaired to a like-new condition, a written report will be issued, and replacement will proceed based on that report. The customer must allow a repair attempt before replacement can be authorized. If in-home repair is not feasible, Luna will arrange for the product to be collected, repaired, and delivered back to the customer.</p>
        </>
      )
    },
    {
      id: 'pickup-policy',
      icon: <MdPerson />,
      question: 'Pick-up Policy',
      answer: (
        <>
          <ol className="pickup-policy-list">
            <li>
              <strong>Order Confirmation and Pickup Arrangement:</strong>
              <ul>
                <li>Upon placing an order, a customer service representative will contact you to confirm your order details and schedule a convenient pickup time.</li>
                <li>Please ensure that you provide accurate contact information, including your phone number and email address.</li>
              </ul>
            </li>
            <li>
              <strong>Pickup Location:</strong>
              <ul>
                <li>Furniture can be picked up at our warehouses.</li>
                <li>Please arrive within the scheduled pickup time to avoid any delays or inconvenience.</li>
              </ul>
            </li>
            <li>
              <strong>Identification:</strong>
              <ul>
                <li>A valid government-issued ID is required for pickup.</li>
                <li>The ID must match the name on the order.</li>
              </ul>
            </li>
            <li>
              <strong>Inspection and Acceptance:</strong>
              <ul>
                <li>It is essential to inspect your furniture carefully upon pickup for any damages or defects.</li>
                <li>Please report any issues to our staff immediately.</li>
                <li>By signing the delivery receipt, you acknowledge that you have inspected the furniture and accepted it in good condition.</li>
              </ul>
            </li>
            <li>
              <strong>Pickup Assistance:</strong>
              <ul>
                <li>While we offer assistance in loading your furniture, we recommend bringing additional help if needed, as our staff may have other customers to assist.</li>
                <li>You are responsible for securing the furniture properly during transportation.</li>
              </ul>
            </li>
            <li>
              <strong>Cancellation or Rescheduling:</strong>
              <ul>
                <li>If you need to cancel or reschedule your pickup, please notify us at least 24 hours in advance.</li>
                <li>Failure to provide sufficient notice may result in additional fees or storage charges.</li>
              </ul>
            </li>
            <li>
              <strong>Delivery Options:</strong>
              <ul>
                <li>If you are unable to pick up your furniture, we offer delivery services. Please inquire about delivery options at the time of purchase.</li>
              </ul>
            </li>
            <li>
              <strong>Pickup Timeframe and Storage Policy:</strong>
              <ul>
                <li>Once you are notified that your order is ready for pickup, you will have 15 calendar days to collect your furniture at no additional cost.</li>
                <li>If the furniture is not picked up within 15 days, a storage fee of $10 per day will apply for each additional day up to 21 days.</li>
                <li>If the furniture remains uncollected beyond 21 days from the pickup notification date: The order will be cancelled, a storage fee for the overdue period will be deducted from your refund, and a 20% restocking fee will also be deducted from your refund.</li>
                <li>Storage fees and restocking fees are strictly enforced to ensure efficient warehouse management and space availability for all customers.</li>
                <li>Please pick up your order promptly to avoid additional charges.</li>
              </ul>
            </li>
          </ol>
        </>
      )
    },
    {
      id: 'disclaimer',
      icon: <MdGavel />,
      question: 'Disclaimer',
      answer: (
        <>
          <p>Luna Furniture reserves the right to cancel any orders or delay the shipments for reasons including but not limited to manufacturer, carrier, stock, and/or cost-related issues on out-of-state orders without prior notice. Additionally, due to unexpected high shipping costs resulting from carriers, customer might be required to pay an additional fee for shipping. If the customer denies to pay for additional surcharge fee, the order will be cancelled.</p>
          <p>We inspect and ship all merchandise in factory manufactured condition unless stated or requested otherwise. Likewise, we make every effort by meticulous palletizing and/or thorough packaging to prevent partial loss or damage of merchandise.</p>
          <p>In case of loss or damage of shipments en route, after the shipment leaves our warehouse, it is the buyer's responsibility to file a claim against the freight company. In certain cases, Luna Furniture, at its whole discretion, may choose to arrange a repair service when/where possible and/or applicable. Monetary compensation of any amount will never be an option if insurance or freight liability or repair is a possible remedy of any level or kind.</p>
          <p>By law, tax exemption does not apply to orders placed and/or fulfilled in the state of TX where our HQ is located.</p>
        </>
      )
    },
    {
      id: 'contact',
      icon: <MdPhone />,
      question: 'Contact',
      answer: (
        <p>For any questions about delivery services, please call us at <strong>(832) 900-3800</strong></p>
      )
    }
  ];

  return (
    <>
      <Header />
      <main className="faqs-page">
        <section className="about-hero" aria-label="Delivery Policy hero section">
          <h1>Delivery Policy</h1>
        </section>

        <section className="faqs-intro" aria-label="Delivery Policy intro section">
          <div className="faqs-intro-content">
            <p className="faqs-kicker">THANK YOU FOR CHOOSING US</p>
            <h2>We want to make the delivery process as simple as possible for you.</h2>
            <p className="faqs-subtitle">
              Luna Furniture provides a variety of delivery options, including Outdoor Drop-Off, Indoor Drop-Off, Room of Choice, White Glove, and Pick-Up.


            </p>
          </div>
        </section>

        <section className="delivery-options-section" aria-label="Delivery Options">
          <h2 className="delivery-options-title">Delivery Options</h2>
          <div className="delivery-carousel-wrapper">
            <button
              type="button"
              className="carousel-nav carousel-nav-prev"
              onClick={handlePrevious}
              disabled={carouselIndex === 0}
              aria-label="Previous delivery options"
            >
              <span>&lsaquo;</span>
            </button>

            <div className="delivery-carousel-grid">
              {deliveryOptions
                .slice(carouselIndex, carouselIndex + cardsPerView)
                .map((option) => (
                  <div key={option.id} className="delivery-option-card">
                    <div className="delivery-card-image">
                      <img
                        src={option.image}
                        alt={option.heading}
                        onError={(e) => {
                          e.target.src = '/placeholder-image.png';
                        }}
                      />
                    </div>
                    <div className="delivery-card-content">
                      <h3 className="delivery-card-heading">{option.heading}</h3>
                      <p className="delivery-card-description">{option.description}</p>
                    </div>
                  </div>
                ))}
            </div>

            <button
              type="button"
              className="carousel-nav carousel-nav-next"
              onClick={handleNext}
              disabled={carouselIndex >= maxIndex}
              aria-label="Next delivery options"
            >
              <span>&rsaquo;</span>
            </button>
          </div>

          <div className="carousel-progress-bar-container">
            <div 
              className="carousel-progress-bar" 
              style={{
                width: `${((carouselIndex + cardsPerView) / deliveryOptions.length) * 100}%`
              }}
            />
          </div>
        </section>

        <section className="about-marquee delivery-marquee-white" aria-label="Delivery highlight">
          <div className="about-marquee-track">
            <span>
              <MdCheck className="about-marquee-icon" aria-hidden="true" />
              One flat rate for unlimited items
            </span>
            <span>
              <MdCheck className="about-marquee-icon" aria-hidden="true" />
              One flat rate for unlimited items
            </span>
            
             <span>
              <MdCheck className="about-marquee-icon" aria-hidden="true" />
              One flat rate for unlimited items
            </span>
             <span>
              <MdCheck className="about-marquee-icon" aria-hidden="true" />
              One flat rate for unlimited items
            </span>
          </div>
        </section>

        
        <section className="about-split about-split-story why-dimond-section" aria-label="Outdoor Drop-Off Delivery">
          <div className="about-split-image-wrap why-dimond-image-wrap">
            <img src="/o1.png" alt="Outdoor Drop-Off Delivery" className="about-split-image" />
          </div>
          <div className="about-split-text why-dimond-text">
            <h3>Outdoor Drop-Off</h3>
            <p className="delivery-price">Starting at $99*</p>
            <p>Delivery at the exterior entrance of your residence or building on the ground floor.</p>
            <ul className="delivery-points">
              <li>No Assembly: Items arrive in factory packaging and may require assembly.</li>
              <li>Signature Required: Someone 18 years or older must sign at delivery.</li>
              <li>Report Damage: Call 832-900-3800 within 24 hours for any hidden damage.</li>
              <li>Your Task: Move items to your room of choice, assemble them, and discard packaging.</li>
            </ul>
            <p className="delivery-note">* Contiguous U.S. only (excludes Alaska, Hawaii, and U.S. territories). Delivery fees vary by location and are shown at checkout.</p>
          </div>
        </section>

        <section className="about-split about-split-story why-dimond-section" aria-label="Indoor Drop-Off Delivery">
          <div className="about-split-text why-dimond-text">
            <h3>Indoor Drop-Off</h3>
            <p className="delivery-price">Starting at $149*</p>
            <p>Delivery inside the front door of your home.</p>
            <ul className="delivery-points">
              <li>No Assembly: Items arrive in factory packaging and may require assembly.</li>
              <li>Signature Required: Someone 18 years or older must sign at delivery.</li>
              <li>Report Damage: Call 832-900-3800 within 24 hours for any hidden damage.</li>
              <li>Your Task: Move items to your room of choice, assemble them, and discard packaging.</li>
            </ul>
            <p className="delivery-note">* Contiguous U.S. only (excludes Alaska, Hawaii, and U.S. territories). Delivery fees vary by location and are shown at checkout.</p>
          </div>
          <div className="about-split-image-wrap why-dimond-image-wrap">
            <img src="/o2.png" alt="Indoor Drop-Off Delivery" className="about-split-image" />
          </div>
        </section>

        <section className="about-split about-split-story why-dimond-section" aria-label="Room of Choice Delivery">
          <div className="about-split-image-wrap why-dimond-image-wrap">
            <img src="/o3.png" alt="Room of Choice Delivery" className="about-split-image" />
          </div>
          <div className="about-split-text why-dimond-text">
            <h3>Room of Choice</h3>
            <p className="delivery-price">Starting at $199*</p>
            <p>We'll bring your delivery to any room you choose.</p>
            <ul className="delivery-points">
              <li>No Assembly: Items arrive in factory packaging and may require assembly.</li>
              <li>Signature Required: Someone 18 years or older must sign at delivery.</li>
              <li>Report Damage: Call 832-900-3800 within 24 hours for any hidden damage.</li>
              <li>Your Task: Open, assemble, and discard packaging.</li>
            </ul>
            <p className="delivery-note">* Contiguous U.S. only (excludes Alaska, Hawaii, and U.S. territories). Delivery fees vary by location and are shown at checkout.</p>
          </div>
        </section>

        <section className="about-split about-split-story why-dimond-section" aria-label="White Glove Delivery">
          <div className="about-split-text why-dimond-text">
            <h3>White Glove</h3>
            <p className="delivery-price">Starting at $249*</p>
            <p>Experience our premium service.</p>
            <ul className="delivery-points">
              <li>Room of Choice: Delivery to your chosen room.</li>
              <li>Real-Time Updates: Get email and text notifications.</li>
              <li>Signature Required: Someone 18 years or older must sign at delivery.</li>
              <li>Professional Setup: We unpack, assemble, and place your furniture.</li>
              <li>Inspection: We inspect, clean, and fix minor issues.</li>
              <li>Feature Demo: We'll show you how to use your new furniture.</li>
              <li>Packaging Removal: We take away all packaging for recycling.</li>
            </ul>
            <p className="delivery-note">* Contiguous U.S. only (excludes Alaska, Hawaii, and U.S. territories). Delivery fees vary by location and are shown at checkout.</p>
          </div>
          <div className="about-split-image-wrap why-dimond-image-wrap">
            <img src="/o4.png" alt="White Glove Delivery" className="about-split-image" />
          </div>
        </section>

        <section className="about-split about-split-story why-dimond-section" aria-label="Pick-Up Option">
          <div className="about-split-image-wrap why-dimond-image-wrap">
            <img src="/o5.png" alt="Pick-Up Option" className="about-split-image" />
          </div>
          <div className="about-split-text why-dimond-text">
            <h3>Pick-Up</h3>
            <p>Choose to pick up your order directly from our warehouses free of charge and enjoy the convenience of collecting your furniture at your schedule.</p>
            <ul className="delivery-points">
              <li>Pick-up Hours: 10am - 5pm</li>
              <li>Texas Warehouse: 4655 Wright Rd, Ste 140, Stafford, TX, 77477</li>
              <li>Maryland Warehouse: 5640 Sunnyside Avenue Suite H, Beltsville, Maryland 20705</li>
              <li>California Warehouse: 11312 Hartland Street, North Hollywood CA 91605</li>
              <li>Illinois Warehouse: 1801 Estes Ave, Elk Grove Village, IL 60007</li>
            </ul>
            <p>Unable to pick it up? We offer delivery services in your area for a fee.</p>
          </div>
        </section>

        <section className="faqs-ordering" aria-label="Delivery Policy Details">
          <div className="faqs-ordering-wrap">
            <h3>Delivery Policy Information</h3>
            {policySections.map((section) => (
              <div key={section.id} className="faqs-item">
                <button
                  className={openItem === section.id ? 'faqs-toggle active' : 'faqs-toggle'}
                  onClick={() => setOpenItem(openItem === section.id ? '' : section.id)}
                  aria-expanded={openItem === section.id}
                >
                  <span className="faqs-icon">{section.icon}</span>
                  <span className="faqs-question">{section.question}</span>
                  <span className="faqs-arrow" aria-hidden="true">⌄</span>
                </button>
                {openItem === section.id && (
                  <div className="faqs-answer">
                    {section.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="delivery-reviews-section" aria-label="Customer reviews">
          <div className="delivery-reviews-wrap">
            <h3>Reviews</h3>

            {activeReview ? (
              <>
                <p className="delivery-reviews-quote" aria-hidden="true">''</p>
                <p className="delivery-reviews-text">{activeReview.comment}</p>
                <p className="delivery-reviews-stars" aria-label={`Rated ${activeReviewRating} out of 5 stars`}>
                  {starRow}
                </p>
                <p className="delivery-reviews-author">{activeReview.userName || 'Verified Customer'}</p>

                {storeReviews.length > 1 && (
                  <div className="delivery-reviews-dots" role="tablist" aria-label="Choose review">
                    {storeReviews.slice(0, 8).map((review, index) => (
                      <button
                        key={review._id || `${review.userName}-${index}`}
                        type="button"
                        className={index === activeReviewIndex ? 'delivery-reviews-dot active' : 'delivery-reviews-dot'}
                        onClick={() => setActiveReviewIndex(index)}
                        aria-label={`Show review ${index + 1}`}
                        aria-selected={index === activeReviewIndex}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="delivery-reviews-empty">Reviews will appear here as soon as customers submit them.</p>
            )}

            <div className="delivery-reviews-actions">
              <Link to="/" className="delivery-reviews-btn delivery-reviews-btn-outline">Let's Shop</Link>
              <Link to="/reviews" className="delivery-reviews-btn delivery-reviews-btn-solid">See Customer Reviews</Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
