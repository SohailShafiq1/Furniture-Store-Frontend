import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';
import { API_BASE_URL, BACKEND_URL } from '../config/api';
import { STRIPE_PUBLISHABLE_KEY } from '../config/stripe';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { FaCcAmex, FaCcMastercard, FaCcVisa } from 'react-icons/fa';
import axios from 'axios';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Modal from '../components/Modal/Modal';
import './CheckoutPage.css';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const stripeElementOptions = {
  style: {
    base: {
      fontSize: '18px',
      color: '#1f2937',
      '::placeholder': {
        color: '#9ca3af'
      }
    },
    invalid: {
      color: '#dc2626'
    }
  }
};

const InlineStripeCardForm = ({
  user,
  token,
  guestEmail,
  cart,
  attribution,
  shippingAddress,
  tipAmount,
  finalTotal,
  loading,
  setLoading,
  onPaymentSuccess,
  onPaymentError,
  validateCheckoutInputs
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [billingName, setBillingName] = useState('');
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
  const [cardError, setCardError] = useState('');

  const handleInlineCardPayment = async () => {
    setCardError('');

    const validationError = validateCheckoutInputs();
    if (validationError) {
      onPaymentError(validationError, 'warning');
      return;
    }

    if (!stripe || !elements) {
      onPaymentError('Payment form is still loading. Please try again in a moment.');
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      onPaymentError('Card details are required.');
      return;
    }

    try {
      setLoading(true);

      const orderDetails = {
        shippingAddress,
        paymentMethod: 'Stripe',
        tipAmount,
        totalWithTip: finalTotal,
        inlineCard: true
      };

      if (!user) {
        orderDetails.guestEmail = guestEmail;
        orderDetails.items = cart.items;
        orderDetails.totalPrice = finalTotal;
      }

      const checkoutRes = await axios.post(
        `${API_BASE_URL}/orders/checkout`,
        {
          orderDetails,
          attribution: attribution || cart.attribution
        },
        {
          ...(user && token && { headers: { Authorization: `Bearer ${token}` } })
        }
      );

      if (!checkoutRes.data?.clientSecret || !checkoutRes.data?.orderId) {
        throw new Error('Could not initialize card payment.');
      }

      const billingNameToUse = useShippingAsBilling
        ? `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim()
        : billingName;

      const confirmResult = await stripe.confirmCardPayment(checkoutRes.data.clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: billingNameToUse || undefined,
            email: user?.email || guestEmail || undefined,
            phone: shippingAddress.phone || undefined,
            address: {
              line1: shippingAddress.address || undefined,
              city: shippingAddress.city || undefined,
              state: shippingAddress.state || undefined,
              postal_code: shippingAddress.zipCode || undefined,
              country: 'US'
            }
          }
        }
      });

      if (confirmResult.error) {
        setCardError(confirmResult.error.message || 'Card payment failed.');
        return;
      }

      const paymentIntentId = confirmResult.paymentIntent?.id;
      if (!paymentIntentId) {
        throw new Error('Payment did not complete successfully.');
      }

      await axios.post(
        `${API_BASE_URL}/orders/confirm-inline-payment`,
        {
          orderId: checkoutRes.data.orderId,
          paymentIntentId
        },
        {
          ...(user && token && { headers: { Authorization: `Bearer ${token}` } })
        }
      );

      await onPaymentSuccess();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Inline card payment failed.';
      onPaymentError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-card-panel">
      <div className="inline-card-header">
        <span className="inline-card-title">Credit card</span>
        <div className="inline-card-brands">
          <FaCcVisa className="card-brand-icon visa" title="Visa" aria-label="Visa" />
          <FaCcMastercard className="card-brand-icon mastercard" title="Mastercard" aria-label="Mastercard" />
          <FaCcAmex className="card-brand-icon amex" title="American Express" aria-label="American Express" />
        </div>
      </div>

      <div className="inline-card-field full-width">
        <label>Card number</label>
        <CardNumberElement options={stripeElementOptions} />
      </div>

      <div className="inline-card-grid-two">
        <div className="inline-card-field">
          <label>Expiration date (MM / YY)</label>
          <CardExpiryElement options={stripeElementOptions} />
        </div>
        <div className="inline-card-field">
          <label>Security code</label>
          <CardCvcElement options={stripeElementOptions} />
        </div>
      </div>

      {!useShippingAsBilling && (
        <div className="inline-card-field full-width">
          <label>Name on card</label>
          <input
            type="text"
            value={billingName}
            onChange={(e) => setBillingName(e.target.value)}
            placeholder="Name on card"
          />
        </div>
      )}

      <label className="inline-card-billing-checkbox">
        <input
          type="checkbox"
          checked={useShippingAsBilling}
          onChange={(e) => setUseShippingAsBilling(e.target.checked)}
        />
        <span>Use shipping address as billing address</span>
      </label>

      {cardError && <p className="inline-card-error">{cardError}</p>}

      <button type="button" className="place-order-btn inline-card-pay-btn" onClick={handleInlineCardPayment} disabled={loading || !stripe}>
        {loading ? 'Processing...' : 'Pay Securely'}
      </button>
    </div>
  );
};

const CheckoutPage = () => {
  const { cart, clearCart, removeFromCart, attribution } = useCart();
  const { user, token } = useUserAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [tipEnabled, setTipEnabled] = useState(false);
  const [selectedTipOption, setSelectedTipOption] = useState('none');
  const [customTipInput, setCustomTipInput] = useState('');
  const [appliedCustomTip, setAppliedCustomTip] = useState(0);
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

  const validateCheckoutInputs = () => {
    if (cart.items.length === 0) {
      return 'Your cart is empty. Please add items before checking out.';
    }

    if (!user && !guestEmail) {
      return 'Please enter your email address to proceed with checkout.';
    }

    const requiredFields = ['firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field] || shippingAddress[field].trim() === '');

    if (missingFields.length > 0) {
      return `Please fill in all shipping address fields: ${missingFields.join(', ')}`;
    }

    return null;
  };

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

  const handleKlarnaAffirmRedirect = () => {
    window.location.href = 'https://payments.klarna.com/prequalification/index.html?prequal_session_id=b0b10762-00f2-4b1d-b55d-91a2176cb94b&token=eyJwcmVxdWFsX3Nlc3Npb25faWQiOiJiMGIxMDc2Mi0wMGYyLTRiMWQtYjU1ZC05MWEyMTc2Y2I5NGIiLCJyZWdpb24iOiJ1cyIsImxvY2FsZSI6ImVuX1VTIn0&locale=en_US&show_close_button=true';
  };

  const handleGooglePayRedirect = () => {
    // TODO: Integrate with Stripe's Google Pay API or your Google Pay setup
    alert('Google Pay integration coming soon!');
    // For now: window.location.href = 'your-google-pay-checkout-url';
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    const validationError = validateCheckoutInputs();
    if (validationError) {
      setModal({
        isOpen: true,
        title: 'Checkout Details Required',
        message: validationError,
        type: 'warning'
      });
      return;
    }

    if (paymentMethod === 'Stripe') {
      return;
    }

    if (paymentMethod === 'ShopPay') {
      handleShopPayRedirect();
      return;
    }

    if (paymentMethod === 'Klarna' || paymentMethod === 'Affirm') {
      handleKlarnaAffirmRedirect();
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
        paymentMethod,
        tipAmount,
        totalWithTip: finalTotal
      };

      // For guest users, include email and cart items
      if (!user) {
        orderDetails.guestEmail = guestEmail;
        orderDetails.items = cart.items;
        orderDetails.totalPrice = finalTotal;
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

  const subtotal = Number(cart.totalPrice || 0);
  const parsedCustomTip = Number.parseFloat(customTipInput) || 0;
  const selectedTipPercent = Number.parseFloat(selectedTipOption) || 0;

  const tipAmount = !tipEnabled
    ? 0
    : selectedTipOption === 'custom'
      ? Math.max(0, appliedCustomTip)
      : selectedTipOption === 'none'
        ? 0
        : (subtotal * selectedTipPercent) / 100;

  const finalTotal = subtotal + tipAmount;

  const formatCurrency = (amount) => `$${Number(amount || 0).toFixed(2)}`;

  const handleTipToggle = (checked) => {
    setTipEnabled(checked);
    if (!checked) {
      setSelectedTipOption('none');
      setCustomTipInput('');
      setAppliedCustomTip(0);
    }
  };

  const handleSelectTipOption = (option) => {
    setSelectedTipOption(option);
    if (option !== 'custom') {
      setAppliedCustomTip(0);
    }
  };

  const updateCustomTipBy = (delta) => {
    const nextValue = Math.max(0, parsedCustomTip + delta);
    setCustomTipInput(nextValue === 0 ? '' : nextValue.toFixed(2));
  };

  const handleApplyCustomTip = () => {
    const nextValue = Math.max(0, parsedCustomTip);
    setAppliedCustomTip(nextValue);
    setSelectedTipOption(nextValue > 0 ? 'custom' : 'none');
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
                      <span className="payment-main-label">Credit card</span>
                      <span className="payment-sub-label">Pay directly on this page</span>
                    </div>
                  </div>
                  <div className="payment-logos">
                    <FaCcVisa className="card-brand-icon visa" title="Visa" aria-label="Visa" />
                    <FaCcMastercard className="card-brand-icon mastercard" title="Mastercard" aria-label="Mastercard" />
                    <FaCcAmex className="card-brand-icon amex" title="American Express" aria-label="American Express" />
                  </div>
                </div>

                {paymentMethod === 'Stripe' && (
                  <div className="payment-inline-card-wrap">
                    <Elements stripe={stripePromise}>
                      <InlineStripeCardForm
                        user={user}
                        token={token}
                        guestEmail={guestEmail}
                        cart={cart}
                        attribution={attribution}
                        shippingAddress={shippingAddress}
                        tipAmount={tipAmount}
                        finalTotal={finalTotal}
                        loading={loading}
                        setLoading={setLoading}
                        validateCheckoutInputs={validateCheckoutInputs}
                        onPaymentSuccess={async () => {
                          await clearCart();
                          setModal({
                            isOpen: true,
                            title: 'Payment Successful',
                            message: 'Your card payment was successful and your order is confirmed.',
                            type: 'success'
                          });
                        }}
                        onPaymentError={(message, type = 'error') => {
                          setModal({
                            isOpen: true,
                            title: type === 'warning' ? 'Checkout Details Required' : 'Payment Failed',
                            message,
                            type
                          });
                        }}
                      />
                    </Elements>
                  </div>
                )}

                <div 
                  className={`payment-group-option ${paymentMethod === 'ShopPay' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('ShopPay')}
                >
                  <div className="payment-radio-wrapper">
                    <input type="radio" name="paymentMethod" value="ShopPay" checked={paymentMethod === 'ShopPay'} readOnly />
                    <div className="payment-labels">
                      <span className="payment-main-label">Shop Pay</span>
                      <span className="payment-sub-label">Pay in full or in installments</span>
                    </div>
                  </div>
                  <div className="payment-logos">
                    <span className="payment-text-logo shop">shop</span>
                  </div>
                </div>

                <div 
                  className={`payment-group-option ${paymentMethod === 'Klarna' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('Klarna')}
                >
                  <div className="payment-radio-wrapper">
                    <input type="radio" name="paymentMethod" value="Klarna" checked={paymentMethod === 'Klarna'} readOnly />
                    <div className="payment-labels">
                      <span className="payment-main-label">Klarna</span>
                      <span className="payment-sub-label">Flexible payments</span>
                    </div>
                  </div>
                  <div className="payment-logos">
                    <span className="payment-text-logo klarna">Klarna</span>
                  </div>
                </div>

                <div 
                  className={`payment-group-option ${paymentMethod === 'Affirm' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('Affirm')}
                >
                  <div className="payment-radio-wrapper">
                    <input type="radio" name="paymentMethod" value="Affirm" checked={paymentMethod === 'Affirm'} readOnly />
                    <div className="payment-labels">
                      <span className="payment-main-label">Affirm</span>
                      <span className="payment-sub-label">Pay over time</span>
                    </div>
                  </div>
                  <div className="payment-logos">
                    <span className="payment-text-logo affirm">affirm</span>
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

            <section className="form-section tip-section">
              <h3>Add tip</h3>
              <div className="tip-box">
                <label className="tip-support-row">
                  <input
                    type="checkbox"
                    checked={tipEnabled}
                    onChange={(e) => handleTipToggle(e.target.checked)}
                  />
                  <span>Show your support for the team at Dimond Modern Furniture</span>
                </label>

                {tipEnabled && (
                  <>
                    <div className="tip-options-grid">
                      {[1, 3, 5].map((percent) => (
                        <button
                          key={percent}
                          type="button"
                          className={`tip-option-btn ${selectedTipOption === String(percent) ? 'selected' : ''}`}
                          onClick={() => handleSelectTipOption(String(percent))}
                        >
                          <span className="tip-percent">{percent}%</span>
                          <span className="tip-value">{formatCurrency((subtotal * percent) / 100)}</span>
                        </button>
                      ))}

                      <button
                        type="button"
                        className={`tip-option-btn ${selectedTipOption === 'none' ? 'selected' : ''}`}
                        onClick={() => handleSelectTipOption('none')}
                      >
                        <span className="tip-percent">None</span>
                      </button>
                    </div>

                    <div className="tip-custom-row">
                      <div className="tip-custom-input-wrap">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Custom tip"
                          value={customTipInput}
                          onChange={(e) => setCustomTipInput(e.target.value)}
                        />
                        <div className="tip-custom-stepper">
                          <button type="button" onClick={() => updateCustomTipBy(-1)} aria-label="Decrease tip">-</button>
                          <button type="button" onClick={() => updateCustomTipBy(1)} aria-label="Increase tip">+</button>
                        </div>
                      </div>

                      <button type="button" className="tip-apply-btn" onClick={handleApplyCustomTip}>
                        Add tip
                      </button>
                    </div>

                    <p className="tip-thankyou">Thank you, we appreciate it.</p>
                  </>
                )}
              </div>
            </section>

            {paymentMethod !== 'Stripe' && (
              <button type="submit" className="place-order-btn" disabled={loading}>
                {loading ? 'Processing...' : paymentMethod === 'COD' ? 'Place Order' : 'Proceed to Payment'}
              </button>
            )}
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
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="summary-line">
                <span>Tip</span>
                <span>{formatCurrency(tipAmount)}</span>
              </div>
              <div className="summary-line">
                <span>Shipping</span>
                <span className="free-shipping">FREE</span>
              </div>
              <div className="summary-total-line">
                <span>Total</span>
                <span>{formatCurrency(finalTotal)}</span>
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
