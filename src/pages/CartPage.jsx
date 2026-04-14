import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import SlidingBanner from '../components/SlidingBanner/SlidingBanner';
import './CartPage.css';
import './ReviewsPage.css';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart: cartData = { items: [], totalPrice: 0 }, removeFromCart, updateQuantity } = useCart();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    country: 'United States',
    province: '',
    zipcode: ''
  });

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    userName: '',
    email: '',
    rating: 5,
    title: '',
    comment: ''
  });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [activeReviewTab, setActiveReviewTab] = useState('product');

  // Product reviews states
  const [productReviews, setProductReviews] = useState([]);
  const [productReviewStats, setProductReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchReviews();
    fetchProductReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const storeId = localStorage.getItem('storeId') || 'default-store';
      const response = await axios.get(`${apiUrl}/reviews/store`, {
        params: { store: storeId, page: 1, limit: 30, sort: 'recent' }
      });
      setReviews(Array.isArray(response.data.reviews) ? response.data.reviews : []);
      setReviewStats(response.data.stats || {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchProductReviews = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await axios.get(`${apiUrl}/reviews/products/all`, {
        params: { page: 1, limit: 30, sort: 'recent' }
      });
      setProductReviews(Array.isArray(response.data.reviews) ? response.data.reviews : []);
      setProductReviewStats(response.data.stats || {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
    } catch (error) {
      console.error('Error fetching product reviews:', error);
    }
  };

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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setReviewLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const storeId = localStorage.getItem('storeId') || 'default-store';
      
      const response = await axios.post(`${apiUrl}/reviews/create`, {
        ...reviewForm,
        store: storeId,
        rating: parseInt(reviewForm.rating)
      });

      setReviewSuccess('Review submitted successfully!');
      setReviewForm({
        userName: '',
        email: '',
        rating: 5,
        title: '',
        comment: ''
      });
      setShowReviewForm(false);
      fetchReviews();
    } catch (error) {
      setReviewError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const summaryStats = activeReviewTab === 'product' ? productReviewStats : reviewStats;
  const displayedReviews = activeReviewTab === 'product' ? productReviews : reviews;
  const distribution = summaryStats?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const maxBar = Math.max(1, ...Object.values(distribution));

  const starText = (rating) => {
    const safe = Math.max(0, Math.min(5, parseInt(rating || 0, 10)));
    return `${'★'.repeat(safe)}${'☆'.repeat(5 - safe)}`;
  };

  const normalizeImageUrl = (path) => {
    if (!path) return '/logo.avif';
    return path.startsWith('http') ? path : `${BACKEND_URL}/${path}`;
  };

  return (
    <>
      <Header />
      <div className="cart-page">
        <div className={`cart-wrapper ${cart.length === 0 ? 'is-empty' : ''}`}>
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
                <div className="empty-cart-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </div>
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

          {cart.length > 0 && (
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
                className={`cart-summary-checkout-btn ${!termsAccepted ? 'disabled' : ''}`}
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
          )}
        </div>

      </div>

      <section className="cart-empty-banner" aria-label="Promotional banner">
        <SlidingBanner />
      </section>

      <section className="reviews-page cart-reviews-page" aria-label="Cart reviews section">
          <section className="reviews-overview" aria-label="Ratings overview">
            <div className="reviews-overview-left">
              <div className="reviews-stars">★★★★★</div>
              <p className="reviews-score">{Number(summaryStats?.averageRating || 0).toFixed(2)} out of 5</p>
              <p className="reviews-count">Based on {summaryStats?.totalReviews || 0} reviews</p>
            </div>

            <div className="reviews-overview-mid">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div className="reviews-bar-row" key={stars}>
                  <span className="reviews-row-stars">{starText(stars)}</span>
                  <div className="reviews-bar-track">
                    <div
                      className="reviews-bar-fill"
                      style={{ width: `${((distribution[stars] || 0) / maxBar) * 100}%` }}
                    />
                  </div>
                  <span className="reviews-row-count">{distribution[stars] || 0}</span>
                </div>
              ))}
            </div>

            <div className="reviews-overview-right">
              <button type="button" onClick={() => setShowReviewForm((v) => !v)}>Write a Store Review</button>
            </div>
          </section>

          {showReviewForm && (
            <section className="reviews-form-wrap" aria-label="Write store review">
              <h3>Share Your Experience</h3>
              {reviewError && <p className="reviews-form-error">{reviewError}</p>}
              {reviewSuccess && <p className="reviews-form-success">{reviewSuccess}</p>}
              <form onSubmit={handleSubmitReview} className="reviews-form-grid">
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  value={reviewForm.userName}
                  onChange={(e) => setReviewForm({ ...reviewForm, userName: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={reviewForm.email}
                  onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                />
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value, 10) })}
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
                <input
                  type="text"
                  placeholder="Review title"
                  required
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                />
                <textarea
                  placeholder="Your review"
                  required
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
                <button type="submit" disabled={reviewLoading}>
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </section>
          )}

          <section className="reviews-filter-card" aria-label="Review filters">
            <div className="reviews-tabs">
              <button
                type="button"
                className={activeReviewTab === 'product' ? 'active' : ''}
                onClick={() => setActiveReviewTab('product')}
              >
                Product Reviews ({productReviewStats?.totalReviews || 0})
              </button>
              <button
                type="button"
                className={activeReviewTab === 'store' ? 'active' : ''}
                onClick={() => setActiveReviewTab('store')}
              >
                Shop Reviews ({reviewStats?.totalReviews || 0})
              </button>
            </div>
            <div className="reviews-sort">Latest Reviews</div>
          </section>

          <section className="reviews-grid" aria-label="Review cards">
            {displayedReviews.length === 0 && <p className="no-reviews">No reviews available right now.</p>}

            {displayedReviews.map((review, index) => {
              const reviewImage = review?.images?.[0] || review?.product?.image || '/logo.avif';
              const reviewTitle = review?.title || 'Customer review';
              const reviewUser = review?.userName || 'Anonymous';
              const reviewText = review?.comment || '';
              const stars = Math.max(1, Math.min(5, parseInt(review?.rating || 0, 10)));

              return (
                <article
                  key={`${review?._id || reviewTitle}-${index}`}
                  className={`review-card ${index === 1 ? 'featured' : ''}`}
                >
                  <a href="#" className="review-product-link">
                    {review?.product?.title ? `about ${review.product.title}` : reviewTitle}
                  </a>
                  <div className="review-stars">{starText(stars)}</div>
                  <div className="review-user">
                    <span className="review-user-icon">◉</span>
                    <span>{reviewUser}</span>
                    {review?.isVerifiedPurchase && <span className="verified">Verified</span>}
                  </div>
                  <img src={normalizeImageUrl(reviewImage)} alt={reviewTitle} loading="lazy" />
                  <h4>{reviewTitle}</h4>
                  <p>{reviewText}</p>
                </article>
              );
            })}
          </section>
      </section>

      <Footer />
    </>
  );
}
