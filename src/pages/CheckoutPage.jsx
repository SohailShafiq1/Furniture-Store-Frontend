import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';
import { API_BASE_URL, BACKEND_URL } from '../config/api';
import axios from 'axios';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { token } = useUserAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Stripe');
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

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.items.length === 0) return alert('Cart is empty');

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/orders/checkout`, {
        orderDetails: {
          shippingAddress,
          paymentMethod
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        if (paymentMethod === 'COD') {
          alert('Order placed successfully (COD)');
          clearCart();
        } else if (res.data.url) {
          window.location.href = res.data.url;
        }
      }
    } catch (err) {
      alert('Checkout failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
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
                  className={`payment-group-option ${paymentMethod === 'GooglePay' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('GooglePay')}
                >
                  <div className="payment-radio-wrapper">
                    <input type="radio" name="paymentMethod" value="GooglePay" checked={paymentMethod === 'GooglePay'} readOnly />
                    <div className="payment-labels">
                      <span className="payment-main-label">Google Pay</span>
                    </div>
                  </div>
                  <div className="payment-logos">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" />
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
              {cart.items.map((item, idx) => (
                <div key={idx} className="summary-product-card">
                  <div className="summary-product-img">
                    <img src={getImageUrl(item.product.images?.[0] || item.product.image)} alt={item.product.name} />
                  </div>
                  <div className="summary-product-info">
                    <p className="summary-product-name">{item.product.name}</p>
                    {item.variation && <p className="summary-product-variant">Variation: {item.variation}</p>}
                    <p className="summary-product-qty">Qty: {item.quantity}</p>
                    <p className="summary-product-price">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
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
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
