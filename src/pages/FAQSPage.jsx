import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './AboutUsPage.css';
import './FAQSPage.css';

export default function FAQSPage() {
  const [openItem, setOpenItem] = useState('');

  const orderingFaqs = [
    {
      id: 'accepted-payment-methods',
      icon: '$',
      question: 'What are the accepted payment methods?',
      answer: (
        <>
          <p>
            We accept debit, credit, cash, and financing payment methods. Please
            see a list of the accepted payments here:
          </p>
          <ul>
            <li>Visa</li>
            <li>Mastercard</li>
            <li>Amex</li>
            <li>Apple Pay</li>
            <li>Discover</li>
            <li>Meta</li>
            <li>Google Pay</li>
            <li>Shop Pay</li>
          </ul>
        </>
      )
    },
    {
      id: 'offer-financing',
      icon: '▭',
      question: 'Do you offer Financing?',
      answer: (
        <p>
          Surely, we do. Luna Furniture has partnered with several companies to
          offer our customers a lot of great financing options. Please see your
          options <Link to="/financing">HERE</Link>.
        </p>
      )
    },
    {
      id: 'stock-availability',
      icon: '✓',
      question: 'How do I know if the item is available/in stock?',
      answer: (
        <>
          <p>While browsing for your product, if you see a label:</p>
          <ul>
            <li>
              In-Stock | Ready to Go: This means that the item is ready for
              delivery.
            </li>
            <li>
              In-Stock: This means that the item will be available in around one
              week.
            </li>
            <li>
              Available for Backorder: Please contact us to get to know the
              estimated time (usually 4-8 weeks).
            </li>
          </ul>
        </>
      )
    },
    {
      id: 'see-in-person',
      icon: '◉',
      question: 'Can I see the furniture in person?',
      answer: (
        <>
          <p>
            Luna Furniture has two locations in the Houston area, offering a
            wide variety of display products of your liking for you to see.
          </p>
          <p>Locations:</p>
          <ul>
            <li>
              Harwin Store: 7010 Harwin Dr. Unit A, Houston, TX 77036 | Store
              Hours: Monday to Saturday 10 am-8 pm and Sunday 12 pm-6 pm
            </li>
            <li>
              Parkshire Store: 11621 Southwest Fwy, Houston, TX 77031 | Store
              Hours: Monday to Saturday 10 am-8 pm and Sunday 12 pm-6 pm
            </li>
            <li>
              Dallas Store: 945 Walnut Hill Ln, #108 Dallas, TX 75229 | Store
              Hours: Monday to Sunday 10 am-8 pm
            </li>
          </ul>
          <p>
            *Call us to see if a specific item is available in one of our
            stores!
          </p>
        </>
      )
    },
    {
      id: 'pickup-furniture',
      icon: '◈',
      question: 'Can I pick up my furniture?',
      answer: (
        <p>
          Want to get your furniture even faster? You can pick it up yourself at
          one of our warehouses. See the full list <Link to="/store-locations">here</Link>.
        </p>
      )
    },
    {
      id: 'extra-info-order',
      icon: '⎔',
      question:
        'Why is Luna Furniture requesting additional information to fulfill my order?',
      answer: (
        <p>
          Our system may flag your order as a medium or high-risk order,
          meaning we need to take extra measures to confirm your identity and
          protect you and our company from possible fraudulent activity. In
          order to do so, we kindly ask for your cooperation in providing us
          with a screenshot of your ID, the card used on the checkout, and a
          screenshot of the payment authorization from the bank. We understand
          that this may be an inconvenience, but please know that these
          measures are necessary to ensure your transaction&apos;s security and
          prevent any potential issues. We take the security and privacy of our
          customers very seriously, and we want to ensure that you can shop
          confidently with us. Rest assured that any information you provide
          will be kept confidential and secure and only used for verification
          purposes.
        </p>
      )
    },
    {
      id: 'cancel-order',
      icon: '⤫',
      question: 'Can I cancel my order?',
      answer: (
        <>
          <p>
            In the event that an order must be canceled, we highly encourage
            you to review our refund and return policy. Please note that our
            policy varies depending on the order date, processing time, payment
            authorization, and item availability.
          </p>
          <p>
            In some cases, we may be able to cancel an order before it has been
            processed, and a full refund will be issued to you in a timely
            manner. However, once an order has been processed, we may be unable
            to cancel it, and a refund may not be possible.
          </p>
          <p>
            If an item you have ordered is unavailable, we will make every
            effort to inform you as soon as possible and issue a full refund if
            requested. Additionally, if there are any issues with payment
            authorization or other factors that prevent us from fulfilling your
            order, we may need to cancel the order and issue a refund.
          </p>
          <p>
            We understand that cancellations can be disappointing, and we
            apologize for any inconvenience this may cause. Please be assured
            that we will do our best to process any cancellations and refunds
            promptly and efficiently.
          </p>
        </>
      )
    },
    {
      id: 'order-number',
      icon: '#',
      question: 'What is my order number?',
      answer: (
        <p>
          Once the order is placed, an order confirmation email will be sent to
          your email.
        </p>
      )
    }
  ];

  const shippingFaqs = [
    {
      id: 'shipping-which-delivery',
      icon: '→',
      question: 'Which delivery method should I select?',
      answer: (
        <>
          <p>Luna Furniture offers 4 methods of delivery:</p>
          <ul>
            <li>
              <strong>Indoor Drop-Off:</strong> We will bring your delivery inside the front door of your home. You must assemble the item on your own.
            </li>
            <li>
              <strong>In-Room Delivery:</strong> Want us to bring the item to the room of your choice? This is the right option for you. You must assemble the item on your own.
            </li>
            <li>
              <strong>White Glove Delivery:</strong> Want us to take care of everything? We will deliver in the room of your choice. We will professionally unpack and assemble your new furniture and put it exactly where you want it. YES, we will remove all packaging materials and put them back on the truck for recycling &amp; disposal.
            </li>
            <li>
              <strong>Outdoor Drop-Off:</strong> This option is the only available option for out-of-state (out of Texas) customers. Your items will be delivered at the exterior entrance of your residence or building on the ground floor.
            </li>
          </ul>
          <p>
            *** In-room delivery, white glove delivery, and indoor drop-off are available only to customers in the following Texas cities and their surrounding areas: Houston, Austin, Bryan, College Station, Dallas, Fort Worth, Killeen, San Antonio, Temple, and Waco. Customers outside of Texas may select outdoor drop-off delivery. Please review our <Link to="/delivery-policy">delivery policy</Link>.
          </p>
        </>
      )
    },
    {
      id: 'shipping-how-long',
      icon: '⏱',
      question: 'How long will it take to receive my order?',
      answer: (
        <>
          <p>
            The delivery date may vary depending on the availability of the products from vendor companies, destination, weather conditions, shipping volumes, and force majeure.
          </p>
          <ul>
            <li>
              <strong>Houston Area:</strong> We offer next-day delivery in the Houston area for most items. Next-Day Delivery is not available Sundays, Mondays, and Wednesdays.
            </li>
            <li>
              <strong>Austin, Bryan, College Station, Dallas, Fort Worth, Killeen, San Antonio, Temple, Waco, and their areas &amp; surroundings:</strong> It usually takes 1 to 10 business days to receive your delivery.
            </li>
            <li>
              <strong>Out of State (includes El Paso and surroundings):</strong> It usually takes 1 to 6 weeks to receive your delivery for the other states.
            </li>
          </ul>
          <p>
            Changes in inventory or delivery capacity, as well as unforeseen circumstances beyond our control, may delay the delivery of your order.
          </p>
          <p>
            *Please note that unforeseen circumstances beyond our control, such as changes in delivery capacity and shipping volumes, may delay the delivery of your order.
          </p>
        </>
      )
    },
    {
      id: 'shipping-exact-time',
      icon: '🕐',
      question: 'I want to know the exact time of when the delivery will occur!',
      answer: (
        <p>
          We will make sure to notify you one day prior to the delivery. You will receive a three-hour timeframe of when the delivery is expected to arrive in your residence. Luckily, our drivers will call you 15-30 minutes ahead to notify you that they are almost there.
        </p>
      )
    },
    {
      id: 'shipping-smooth-delivery',
      icon: '✓',
      question: 'How can I help to ensure a smooth delivery process?',
      answer: (
        <>
          <p>
            There are steps you can take to help us provide you a satisfactory delivery process, such as:
          </p>
          <ul>
            <li>Review the delivery method that you have selected.</li>
            <li>Provide an accurate address during checkout.</li>
            <li>Provide any notes that you feel it might be beneficial for the delivery team to know.</li>
            <li>There is a gate code? Let us know prior to your delivery.</li>
            <li>Please confirm the delivery via text/email/or call.</li>
            <li>Ensure to be home during the three-hour timeframe, as the driver will only wait 10-15 minutes ONLY.</li>
            <li>Watch out for a call from the delivery team and answer accordingly.</li>
            <li>Have your ID ready for confirmation, and note that a signature will be required.</li>
          </ul>
        </>
      )
    },
    {
      id: 'shipping-same-as-picture',
      icon: '📸',
      question: 'Will the item look the same as in the picture?',
      answer: (
        <>
          <p>
            We proudly offer high-quality pictures for you to see the furniture of your liking. There are a few factors that might affect the look of the furniture. Please note that the color of the item might look brighter/darker than in the pictures.
          </p>
          <p><strong>TIPS:</strong></p>
          <ul>
            <li>Ensure you look at high-quality images of the furniture from multiple angles, as provided on the website. Look for images that show the furniture in a room similar to yours, so you can better understand how it will fit in.</li>
            <li>Carefully read the furniture description to ensure you understand the materials and finishes used, as well as any special care instructions. This can give you a better idea of how the furniture will look and hold up over time.</li>
            <li>Review the dimensions and make sure it will fit comfortably in your space. You can use measuring tape or a piece of string to measure the area where you plan to put the furniture.</li>
          </ul>
        </>
      )
    },
    {
      id: 'shipping-not-home',
      icon: '🚪',
      question: 'I was not home when the delivery team showed up. What can I do?',
      answer: (
        <p>
          Please call us immediately to schedule another delivery date. Please note that you will be responsible for a second delivery fee.
        </p>
      )
    },
    {
      id: 'shipping-upgrade-delivery',
      icon: '⬆',
      question: 'Can I upgrade my delivery method?',
      answer: (
        <p>
          Absolutely! Call us so we can assist you in upgrading/changing the delivery method selected.
        </p>
      )
    },
    {
      id: 'shipping-old-furniture',
      icon: '♻',
      question: 'Will you take my old furniture?',
      answer: (
        <p>
          Luna Furniture will not take your old furniture or disassemble it.
        </p>
      )
    },
    {
      id: 'shipping-where-old-furniture',
      icon: '🗑',
      question: 'Where do I leave my old furniture?',
      answer: (
        <p>
          If the item is in good/usable condition, we highly recommend donating it to a charity. However, you can always dispose of your old furniture. Please contact your city or town to know about your options.
        </p>
      )
    }
  ];

  const returnsFaqs = [
    {
      id: 'returns-not-like-item',
      icon: '↩',
      question: 'I do not like the item delivered or the item did not fit in my home. What can I do?',
      answer: (
        <>
          <p>
            We strive for your complete satisfaction with every purchase. If you are not happy with your order, you may return eligible items within 30 days of delivery for a refund, subject to the following conditions:
          </p>
          <p><strong>Eligibility Requirements:</strong></p>
          <ul>
            <li>You have 30 days from the date of delivery to initiate a return.</li>
            <li>Items must be in new, unused condition and in their original packaging with all accessories.</li>
            <li>Items should be unassembled and unmodified.</li>
            <li>A Return Merchandise Authorization (RMA) number must be obtained before returning any item. Contact us via email to request an RMA.</li>
          </ul>
          <p><strong>Exclusions:</strong> Some items are non-returnable, including:</p>
          <ul>
            <li>Final Sale or Special Order items</li>
            <li>Mattresses, foundations, bedding, linens</li>
            <li>Individual portions of sectionals</li>
            <li>Cordless power packs</li>
          </ul>
          <p><strong>Refunds and Fees:</strong></p>
          <ul>
            <li><strong>Restocking Fee:</strong> A 30% restocking fee applies to returned items.</li>
            <li><strong>Return Shipping:</strong> You are responsible for return shipping costs. We can arrange a pickup for an estimated fee of $2.50 per pound.</li>
            <li><strong>Additional Fees:</strong> Fees may apply for missing parts, refused deliveries, or invalid addresses.</li>
          </ul>
        </>
      )
    },
    {
      id: 'returns-defective-damaged',
      icon: '⚠',
      question: 'I have received a defective/damaged item. What can I do?',
      answer: (
        <>
          <p>
            <strong>CLICK <Link to="/damage-claim">HERE</Link> to report the damage right away!</strong> We understand that sometimes things can go wrong, and an item may arrive damaged. If you receive a damaged item, it is essential to report it to us as soon as possible because we have a strict policy that requires customers to report any damage within 24 hours of delivery. Please note that we will not be able to process any claim that is reported after 24 hours of delivery. We strongly encourage you to inspect your items as soon as they arrive and notify us of any damage immediately.
          </p>
          <p>
            In the event that a product is damaged and deemed fixable by our manufacturer, we will assign a technician to your residence to repair the item at no cost to you. We want to ensure you are completely satisfied with your purchase and will do everything we can to make it right. Ensure to keep the original packaging of damaged merchandise as required if the manufacturer accepts replacement.
          </p>
        </>
      )
    },
    {
      id: 'returns-missing-item',
      icon: '❓',
      question: 'I have received a missing item. What can I do?',
      answer: (
        <p>
          Bummer!!! Please contact us immediately so we can resolve the issue. Most likely, if the item is available, you will receive the missing item on the next available delivery date. You will not be charged a second delivery fee.
        </p>
      )
    },
    {
      id: 'returns-how-long-refund',
      icon: '💰',
      question: 'How long does it take to receive my refund?',
      answer: (
        <p>
          If the order cancellation has been confirmed, depending on your payment method, it will take three to five business days for the amount to show on the original payment method. We are not able to process cash, check, or refunds in a different payment method.
        </p>
      )
    }
  ];

  const policiesFaqs = [
    {
      id: 'policies-more-about',
      icon: '📋',
      question: 'I want to know more about your policies!',
      answer: (
        <>
          <p>Please review our policies here:</p>
          <ul>
            <li><Link to="/delivery-policy">Delivery Policy</Link></li>
            <li><Link to="/return-policy">Refund &amp; Return Policy</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
          </ul>
        </>
      )
    },
    {
      id: 'policies-report-wrong-item',
      icon: '🚫',
      question: 'How can I report a wrong item?',
      answer: (
        <p>
          You can report a wrong item by contacting our customer service team through email or phone. Please provide your order number, a description of the wrong item, and any relevant photos.
        </p>
      )
    },
    {
      id: 'policies-24-hours-wrong',
      icon: '⏰',
      question: 'What happens if I don\'t report the wrong item within 24 hours?',
      answer: (
        <p>
          We cannot guarantee a refund if you do not report the wrong item within 24 hours of receiving it. Please contact us as soon as possible so we can resolve the issue promptly.
        </p>
      )
    },
    {
      id: 'policies-do-with-wrong',
      icon: '📦',
      question: 'What should I do with the wrong item?',
      answer: (
        <p>
          Please do not dispose of the wrong item until our customer service team has instructed you to do so. In some cases, we may ask you to return the wrong item to us.
        </p>
      )
    },
    {
      id: 'policies-refund-dispose',
      icon: '✋',
      question: 'Can I still get a refund if I dispose of the wrong item?',
      answer: (
        <p>
          No, we cannot refund you if you dispose of the wrong item without reporting it to us.
        </p>
      )
    },
    {
      id: 'policies-exchange-wrong',
      icon: '🔄',
      question: 'Can I exchange the wrong item for the correct one?',
      answer: (
        <p>
          Yes, we are able to exchange the wrong item for the correct one. Please contact our customer service team to discuss this option.
        </p>
      )
    }
  ];

  const toggleItem = (id) => {
    setOpenItem((prev) => (prev === id ? '' : id));
  };

  return (
    <>
      <Header />
      <main className="faqs-page">
        <section className="about-hero" aria-label="FAQs hero section">
          <h1>FAQS</h1>
        </section>

        <section className="faqs-intro" aria-label="FAQs intro section">
          <div className="faqs-intro-content">
            <p className="faqs-kicker">HERE TO ASSIST YOU</p>
            <h2>How can we help?</h2>
            <p className="faqs-subtitle">
              Navigate through our FAQs for quick answers on ordering, delivery,
              returns, and more, ensuring a seamless experience.
            </p>
          </div>
        </section>

        <section className="faqs-ordering" aria-label="Ordering frequently asked questions">
          <div className="faqs-ordering-wrap">
            <h3>Ordering</h3>

            {orderingFaqs.map((item) => {
              const isOpen = openItem === item.id;

              return (
                <div key={item.id} className="faqs-item">
                  <button
                    type="button"
                    className={`faqs-toggle ${isOpen ? 'active' : ''}`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <span className="faqs-icon" aria-hidden="true">{item.icon}</span>
                    <span className="faqs-question">{item.question}</span>
                    <span className="faqs-arrow" aria-hidden="true">⌄</span>
                  </button>

                  {isOpen && <div className="faqs-content">{item.answer}</div>}
                </div>
              );
            })}
          </div>
        </section>

        <section className="faqs-ordering" aria-label="Shipping and delivery frequently asked questions">
          <div className="faqs-ordering-wrap">
            <h3>Shipping / Delivery</h3>

            {shippingFaqs.map((item) => {
              const isOpen = openItem === item.id;

              return (
                <div key={item.id} className="faqs-item">
                  <button
                    type="button"
                    className={`faqs-toggle ${isOpen ? 'active' : ''}`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <span className="faqs-icon" aria-hidden="true">{item.icon}</span>
                    <span className="faqs-question">{item.question}</span>
                    <span className="faqs-arrow" aria-hidden="true">⌄</span>
                  </button>

                  {isOpen && <div className="faqs-content">{item.answer}</div>}
                </div>
              );
            })}
          </div>
        </section>

        <section className="faqs-ordering" aria-label="Returns and refunds frequently asked questions">
          <div className="faqs-ordering-wrap">
            <h3>Returns and Refunds</h3>

            {returnsFaqs.map((item) => {
              const isOpen = openItem === item.id;

              return (
                <div key={item.id} className="faqs-item">
                  <button
                    type="button"
                    className={`faqs-toggle ${isOpen ? 'active' : ''}`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <span className="faqs-icon" aria-hidden="true">{item.icon}</span>
                    <span className="faqs-question">{item.question}</span>
                    <span className="faqs-arrow" aria-hidden="true">⌄</span>
                  </button>

                  {isOpen && <div className="faqs-content">{item.answer}</div>}
                </div>
              );
            })}
          </div>
        </section>

        <section className="faqs-ordering" aria-label="Policies and procedures frequently asked questions">
          <div className="faqs-ordering-wrap">
            <h3>Policies and Procedures</h3>

            {policiesFaqs.map((item) => {
              const isOpen = openItem === item.id;

              return (
                <div key={item.id} className="faqs-item">
                  <button
                    type="button"
                    className={`faqs-toggle ${isOpen ? 'active' : ''}`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <span className="faqs-icon" aria-hidden="true">{item.icon}</span>
                    <span className="faqs-question">{item.question}</span>
                    <span className="faqs-arrow" aria-hidden="true">⌄</span>
                  </button>

                  {isOpen && <div className="faqs-content">{item.answer}</div>}
                </div>
              );
            })}
          </div>
        </section>
         <section className="contact-actions">
          <div className="contact-actions-inner">
            <div className="contact-actions-text">
              <h1>Still looking for answers?</h1>
              <h2>If you need further assistance or have specific questions, please don't hesitate to contact us.</h2>
            </div>
            <div className="contact-actions-buttons">
              <a
                href="mailto:customer@diomonad.com?subject=Customer%20Inquiry"
                className="contact-action-btn"
              >
                Send E-Mail
              </a>
              <a href="tel:+1234567890" className="contact-action-link">
                Call Us
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}