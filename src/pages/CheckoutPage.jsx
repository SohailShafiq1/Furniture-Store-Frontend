import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';
import { API_BASE_URL, BACKEND_URL } from '../config/api';
import axios from 'axios';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Modal from '../components/Modal/Modal';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cart, clearCart, removeFromCart, attribution } = useCart();
  const { user, token } = useUserAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [guestEmail, setGuestEmail] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', action: null });
  const [pendingRemoveId, setPendingRemoveId] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  const handleInputChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleRemoveItem = (itemId) => {
    setPendingRemoveId(itemId);
    setModal({
      isOpen: true,
      title: 'Remove Item',
      message: 'Are you sure you want to remove this item from your cart?',
      type: 'warning',
      action: 'remove'
    });
  };

  const confirmRemoveItem = async () => {
    if (pendingRemoveId) {
      await removeFromCart(pendingRemoveId);
      setPendingRemoveId(null);
    }
    closeModal();
  };

  const handleShopPayRedirect = () => {
    window.location.href = 'https://shop.app/checkout/70294831400/cn/hWNALQaLzoPDaXKClxvrGQZo/en-us/shoppay_login?_cs=3.AMPS&_r=AQABhJnE0Q6d8xdadaJ9zbkvPQ7O_-5J9WDqTwN3WoXeaXU&redirect_source=direct_checkout_cart&tracking_unique=54d14bfd-b392-4631-80c3-7d52a566ccbf&tracking_visit=bc86648d-209a-4fa6-9a98-8d2296b8d750';
  };

  const handleGooglePayRedirect = () => {
    // TODO: Integrate with Stripe's Google Pay API or your Google Pay setup
    alert('Google Pay integration coming soon!');
    // For now: window.location.href = 'your-google-pay-checkout-url';
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (cart.items.length === 0) {
      setModal({
        isOpen: true,
        title: 'Empty Cart',
        message: 'Your cart is empty. Please add items before checking out.',
        type: 'warning'
      });
      return;
    }

    // Validate email for guest users
    if (!user && !guestEmail) {
      setModal({
        isOpen: true,
        title: 'Email Required',
        message: 'Please enter your email address to proceed with checkout.',
        type: 'warning'
      });
      return;
    }

    // Validate shipping address fields
    const requiredFields = ['firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field] || shippingAddress[field].trim() === '');
    
    if (missingFields.length > 0) {
      setModal({
        isOpen: true,
        title: 'Incomplete Address',
        message: `Please fill in all shipping address fields: ${missingFields.join(', ')}`,
        type: 'warning'
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Submitting checkout with:', {
        hasUser: !!user,
        hasGuestEmail: !!guestEmail,
        cartItemsCount: cart.items.length,
        paymentMethod,
        shippingAddress
      });

      const orderDetails = {
        shippingAddress,
        paymentMethod
      };

      // For guest users, include email and cart items
      if (!user) {
        orderDetails.guestEmail = guestEmail;
        orderDetails.items = cart.items;
        orderDetails.totalPrice = cart.totalPrice;
      }

      const res = await axios.post(`${API_BASE_URL}/orders/checkout`, {
        orderDetails,
        attribution: attribution || cart.attribution
      }, {
        ...(user && token && { headers: { Authorization: `Bearer ${token}` } })
      });

      if (res.data.success) {
        if (paymentMethod === 'COD') {
          setModal({
            isOpen: true,
            title: 'Order Placed Successfully',
            message: 'Your order has been placed. You will receive your items soon.',
            type: 'success',
            action: 'clearCart'
          });
          clearCart();
        } else if (res.data.url) {
          window.location.href = res.data.url;
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          err.message || 
                          'An error occurred during checkout';
      
      setModal({
        isOpen: true,
        title: 'Checkout Failed',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info', action: null });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    return imagePath.startsWith('http') ? imagePath : `${BACKEND_URL}/${imagePath}`;
  };

  return (
    <div className="checkout-page">
      <Header />
      <div className="checkout-container">
        <h1>Checkout</h1>
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleCheckout}>
            {/* Express Checkout Section */}
            <section className="express-checkout-section">
              <h3>Express checkout</h3>
              <div className="express-buttons-group">
                <button 
                  type="button" 
                  className="express-btn shop-pay-btn"
                  onClick={handleShopPayRedirect}
                >
                  <span>Shop Pay</span>
                </button>
                <button 
                  type="button" 
                  className="express-btn google-pay-btn"
                  onClick={handleGooglePayRedirect}
                >
                  <svg viewBox="0 0 533.5 544.3" width="18" height="18" aria-hidden="true">
                    <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.3h146.9c-6.4 34.7-25.8 64.1-55 83.7v69.5h88.7c51.9-47.8 81.9-118.1 81.9-198.1z"/>
                    <path fill="#34A853" d="M272 544.3c74.4 0 136.9-24.6 182.5-66.8l-88.7-69.5c-24.6 16.5-56.1 26.3-93.8 26.3-72 0-133-48.5-154.7-113.6H28.6v71.4C73.9 483.8 166.9 544.3 272 544.3z"/>
                    <path fill="#FBBC04" d="M117.3 320.7c-10.6-31.7-10.6-65.7 0-97.4V151.9H28.6c-38.4 76.8-38.4 167.6 0 244.4l88.7-71.4z"/>
                    <path fill="#EA4335" d="M272 107.7c39.5-.6 77 13.9 105.6 40.9l79-79C413.5 24.3 344.8-1 272 0 166.9 0 73.9 60.5 28.6 151.9l88.7 71.4C139 158.2 200 107.7 272 107.7z"/>
                  </svg>
                  <span>Google Pay</span>
                </button>
              </div>
              <div className="express-divider">
                <span>OR</span>
              </div>
            </section>

            {/* Email field for guest users */}
            {!user && (
              <section className="form-section">
                <h3>Your Email</h3>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required={!user}
                />
                <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                  We'll send your order confirmation to this email address.
                </p>
              </section>
            )}

            <section className="form-section">
              <h3>Shipping Address</h3>
              <div className="form-row">
                <input type="text" name="firstName" placeholder="First Name" required onChange={handleInputChange} />
                <input type="text" name="lastName" placeholder="Last Name" required onChange={handleInputChange} />
              </div>
              <input type="text" name="address" placeholder="Address" required onChange={handleInputChange} />
              <div className="form-row">
                <input type="text" name="city" placeholder="City" required onChange={handleInputChange} />
                <input type="text" name="state" placeholder="State/Province" required onChange={handleInputChange} />
              </div>
              <div className="form-row">
                <input type="text" name="zipCode" placeholder="ZIP Code" required onChange={handleInputChange} />
                <input type="tel" name="phone" placeholder="Phone" required onChange={handleInputChange} />
              </div>
            </section>

            <section className="form-section">
              <h3>Payment Method</h3>
              <div className="payment-options">
                <div 
                  className={`payment-group-option ${paymentMethod === 'Stripe' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('Stripe')}
                >
                  <div className="payment-radio-wrapper">
                    <input type="radio" name="paymentMethod" value="Stripe" checked={paymentMethod === 'Stripe'} readOnly />
                    <div className="payment-labels">
                      <span className="payment-main-label">Credit / Debit Card</span>
                      <span className="payment-sub-label">Secure payment with Stripe</span>
                    </div>
                  </div>
                  <div className="payment-logos">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" />
                  </div>
                </div>

                <div 
                  className={`payment-group-option ${paymentMethod === 'ApplePay' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('ApplePay')}
                >
                  <div className="payment-radio-wrapper">
                    <input type="radio" name="paymentMethod" value="ApplePay" checked={paymentMethod === 'ApplePay'} readOnly />
                    <div className="payment-labels">
                      <span className="payment-main-label">Apple Pay</span>
                    </div>
                  </div>
                  <div className="payment-logos">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" alt="Apple Pay" />
                  </div>
                </div>

                <div 
                  className={`payment-group-option ${paymentMethod === 'COD' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('COD')}
                >
                  <div className="payment-radio-wrapper">
                    <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} readOnly />
                    <div className="payment-labels">
                      <span className="payment-main-label">Cash on Delivery (COD)</span>
                      <span className="payment-sub-label">Pay when you receive the items</span>
                    </div>
                  </div>
                  <div className="payment-logos">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                </div>
              </div>
            </section>

            <button type="submit" className="place-order-btn" disabled={loading}>
              {loading ? 'Processing...' : paymentMethod === 'COD' ? 'Place Order' : 'Proceed to Payment'}
            </button>
          </form>

          <aside className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cart.items.map((item, idx) => {
                // Handle both logged-in user items (item.product is object) and guest items (item.productDetails)
                const product = typeof item.product === 'object' ? item.product : null;
                const details = item.productDetails || product || {};
                const productName = details.name || 'Product';
                const productImage = details.image || product?.images?.[0];
                
                return (
                  <div key={idx} className="summary-product-card">
                    <div className="summary-product-img">
                      {productImage && <img src={getImageUrl(productImage)} alt={productName} />}
                    </div>
                    <div className="summary-product-info">
                      <p className="summary-product-name">{productName}</p>
                      {item.variation && <p className="summary-product-variant">Variation: {item.variation}</p>}
                      <p className="summary-product-qty">Qty: {item.quantity}</p>
                      <p className="summary-product-price">${(item.price * item.quantity).toFixed(2)}</p>
                      {/* <button 
                        type="button"
                        className="remove-item-btn"
                        onClick={() => handleRemoveItem(item._id)}
                      >
                        ✕ Remove
                      </button> */}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="summary-totals-box">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>${cart.totalPrice.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Shipping</span>
                <span className="free-shipping">FREE</span>
              </div>
              <div className="summary-total-line">
                <span>Total</span>
                <span>${cart.totalPrice.toFixed(2)}</span>
              </div>
            </div>
            {/* <button 
              type="button" 
              className="shop-pay-btn"
              onClick={handleShopPayRedirect}
            >
              <span style={{ color: 'white', fontWeight: '600' }}>shop</span> Pay
            </button> */}
          </aside>
        </div>

        <Modal
          isOpen={modal.isOpen}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          confirmText={modal.action === 'remove' ? 'Remove' : modal.action === 'clearCart' ? 'Continue' : 'OK'}
          cancelText={modal.action ? 'Cancel' : 'Close'}
          showCancelButton={modal.action ? true : false}
          onConfirm={modal.action === 'remove' ? confirmRemoveItem : closeModal}
          onCancel={closeModal}
        />
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
