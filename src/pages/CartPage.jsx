import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './CartPage.css';
import SlidingBanner from '../components/SlidingBanner/SlidingBanner';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart: cartData = { items: [], totalPrice: 0 }, removeFromCart, updateQuantity } = useCart();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    country: 'United States',
    province: '',
    zipcode: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cart = cartData.items || [];
  const subtotal = cart.reduce((total, item) => {
    return total + (parseFloat(item.price) * item.quantity);
  }, 0);

  const FREE_SHIPPING_THRESHOLD = 4550;
  const spendMoreFor = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleCheckout = () => {
    if (!termsAccepted) {
      alert('Please agree to the terms and conditions to proceed');
      return;
    }
    navigate('/checkout');
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  return (
    <>
      <Header />
      <div className="cart-page">
        <div className="cart-wrapper">
          <div className="cart-main">
            <h1 className="cart-title">Your cart</h1>

            {spendMoreFor > 0 && (
              <div className="shipping-progress">
                <p>Spend <strong>${spendMoreFor.toFixed(2)}</strong> more for <strong>free shipping</strong>!</p>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{
                      width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            )}

            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart is empty</p>
                <button 
                  className="continue-shopping-btn"
                  onClick={() => navigate('/')}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div key={item._id} className="cart-item">
                      <div className="item-image">
                        <img
                          src={
                            item.productDetails?.image
                              ? (item.productDetails.image.startsWith('http') ? item.productDetails.image : `${BACKEND_URL}/${item.productDetails.image}`)
                              : item.image
                                ? (item.image.startsWith('http') ? item.image : `${BACKEND_URL}/${item.image}`)
                                : item.product?.images?.[0]
                                  ? (item.product.images[0].startsWith('http') ? item.product.images[0] : `${BACKEND_URL}/${item.product.images[0]}`)
                                  : '/logo.avif'
                          }
                          alt={item.productDetails?.name || item.name || item.product?.name || 'Product image'}
                          onError={(event) => {
                            event.currentTarget.src = '/logo.avif';
                          }}
                        />
                      </div>
                      <div className="item-details">
                        <p className="item-brand">{item.brand || item.brandId || item.product?.brand || 'BRAND'}</p>
                        <p className="item-name">{item.productDetails?.name || item.name || item.product?.name || item.product?.title || 'Product'}</p>
                        <div className="item-pricing">
                          <span className="current-price">${parseFloat(item.price).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="item-quantity">
                        <button 
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          className="qty-btn"
                        >
                          −
                        </button>
                        <input 
                          type="number" 
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value))}
                          min="1"
                          className="qty-input"
                        />
                        <button 
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          className="qty-btn"
                        >
                          +
                        </button>
                      </div>
                      <div className="item-total">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </div>
                      <button 
                        onClick={() => handleRemoveItem(item._id)}
                        className="delete-btn"
                        title="Remove from cart"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                <div className="shipping-section">
                  <h2>Estimate shipping</h2>
                  <div className="shipping-form">
                    <div className="form-group">
                      <label>Country</label>
                      <select 
                        value={shippingInfo.country}
                        onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                      >
                        <option>United States</option>
                        <option>Canada</option>
                        <option>Mexico</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Province</label>
                      <select 
                        value={shippingInfo.province}
                        onChange={(e) => setShippingInfo({...shippingInfo, province: e.target.value})}
                      >
                        <option value="">Select Province</option>
                        <option value="alabama">Alabama</option>
                        <option value="alaska">Alaska</option>
                        <option value="arizona">Arizona</option>
                        <option value="california">California</option>
                        <option value="florida">Florida</option>
                        <option value="texas">Texas</option>
                        <option value="new-york">New York</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Zip/Postal Code</label>
                      <input 
                        type="text"
                        placeholder="Enter zip code"
                        value={shippingInfo.zipcode}
                        onChange={(e) => setShippingInfo({...shippingInfo, zipcode: e.target.value})}
                      />
                    </div>
                  </div>
                  <button className="calculate-btn">Calculate</button>
                </div>
              </>
            )}
          </div>

          <div className="cart-summary-panel">
            <h2 className="cart-summary-title">Order summary</h2>
            
            <div className="cart-summary-note-section">
              <button className="cart-summary-note-btn">
                <span>Add order note</span>
                <span className="cart-summary-note-icon">▼</span>
              </button>
            </div>

            <div className="cart-summary-tax-note">
              Taxes, discounts and <a href="/shipping-info">shipping</a> calculated at checkout.
            </div>

            <div className="cart-summary-total">
              <div className="cart-summary-total-label">Subtotal:</div>
              <div className="cart-summary-total-amount">${subtotal.toFixed(2)} USD</div>
            </div>

            <div className="cart-summary-terms">
              <label>
                <input 
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <span>I have read and agreed with the <a href="/terms">terms and conditions</a></span>
              </label>
            </div>

            <button 
              className={`cart-summary-checkout-btn ${!termsAcepted ? 'disabled' : ''}`}
              onClick={handleCheckout}
              disabled={!termsAccepted}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              Checkout
            </button>
          </div>
        </div>

      </div>
      <SlidingBanner/>
      <Footer />
    </>
  );
}
