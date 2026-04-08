import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './CartPage.css';
import SlidingBanner from '../components/SlidingBanner/SlidingBanner';

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
  const [reviewPage, setReviewPage] = useState(1);

  // Product reviews states
  const [productReviews, setProductReviews] = useState([]);
  const [productReviewStats, setProductReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [productReviewPage, setProductReviewPage] = useState(1);

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
        params: { store: storeId, page: reviewPage, limit: 10 }
      });
      setReviews(Array.isArray(response.data.reviews) ? response.data.reviews : []);
      setReviewStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchProductReviews = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await axios.get(`${apiUrl}/reviews/products/all`, {
        params: { page: productReviewPage, limit: 10 }
      });
      setProductReviews(Array.isArray(response.data.reviews) ? response.data.reviews : []);
      setProductReviewStats(response.data.stats || {});
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

  const renderStars = (rating) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'star filled' : 'star'}>★</span>
        ))}
      </div>
    );
  };

  const renderDistributionStars = (rating) => {
    return (
      <div className="star-label">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'star filled' : 'star'}>★</span>
        ))}
      </div>
    );
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
        </div>

      </div>

      <div className="reviews-section">
        <div className="reviews-container">
          <h2>Store Reviews</h2>
          
          {/* Review Statistics */}
          <div className="review-stats">
            <div className="rating-summary">
              <div className="average-rating">
                {renderStars(Math.round(reviewStats.averageRating))}
                <span className="big-rating">{reviewStats.averageRating}</span>
                <span className="out-of">out of 5</span>
              </div>
              <p className="based-on">Based on {reviewStats.totalReviews} reviews</p>
            </div>
              
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="rating-row">
                  {renderDistributionStars(star)}
                  <div className="rating-bar">
                    <div 
                      className="rating-fill"
                      style={{
                        width: `${reviewStats.totalReviews > 0 
                          ? (reviewStats.ratingDistribution[star] / reviewStats.totalReviews) * 100 
                          : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="rating-count">{reviewStats.ratingDistribution[star]}</span>
                </div>
              ))}
            </div>

            <button 
              className="write-review-btn"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              Write a Store Review
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="review-form-container">
              <h3>Share Your Experience</h3>
              {reviewError && <div className="error-message">{reviewError}</div>}
              {reviewSuccess && <div className="success-message">{reviewSuccess}</div>}
              
              <form onSubmit={handleSubmitReview} className="review-form">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    value={reviewForm.userName}
                    onChange={(e) => setReviewForm({ ...reviewForm, userName: e.target.value })}
                    required
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={reviewForm.email}
                    onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label>Rating *</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${star <= reviewForm.rating ? 'active' : ''}`}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Review Title *</label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    required
                    placeholder="e.g. Amazing furniture"
                  />
                </div>

                <div className="form-group">
                  <label>Your Review *</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    required
                    placeholder="Share your experience with our store..."
                    rows="5"
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={reviewLoading}>
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="reviewer-details">
                        <h4>{review.userName}</h4>
                        <p className="review-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                          {review.isVerifiedPurchase && <span className="verified-badge">✓ Verified Purchase</span>}
                        </p>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>

                  <div className="review-body">
                    <h5>{review.title}</h5>
                    <p>{review.comment}</p>
                  </div>

                  {review.images && review.images.length > 0 && (
                    <div className="review-images">
                      {review.images.map((img, idx) => (
                        <img 
                          key={idx} 
                          src={img} 
                          alt="Review" 
                          className="review-image"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Product Reviews Section */}
      <div className="reviews-section">
        <div className="reviews-container">
          <h2>Product Reviews</h2>
          
          {/* Review Statistics */}
          <div className="review-stats">
            <div className="rating-summary">
              <div className="average-rating">
                {renderStars(Math.round(productReviewStats.averageRating))}
                <span className="big-rating">{productReviewStats.averageRating}</span>
                <span className="out-of">out of 5</span>
              </div>
              <p className="based-on">Based on {productReviewStats.totalReviews} reviews</p>
            </div>
              
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="rating-row">
                  {renderDistributionStars(star)}
                  <div className="rating-bar">
                    <div 
                      className="rating-fill"
                      style={{
                        width: `${productReviewStats.totalReviews > 0 
                          ? (productReviewStats.ratingDistribution[star] / productReviewStats.totalReviews) * 100 
                          : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="rating-count">{productReviewStats.ratingDistribution[star]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Reviews List */}
          <div className="reviews-list product-reviews-grid">
            {productReviews.length === 0 ? (
              <p className="no-reviews">No product reviews yet.</p>
            ) : (
              productReviews.map((review) => (
                <div key={review._id} className="product-review-card">
                  {review.product && review.product.image && (
                    <div className="product-review-image">
                      <img 
                        src={review.product.image.startsWith('http') 
                          ? review.product.image 
                          : `${BACKEND_URL}/${review.product.image}`}
                        alt={review.product.title}
                      />
                    </div>
                  )}
                  
                  <div className="product-review-content">
                    {review.product && (
                      <p className="review-product-name">
                        about <strong>{review.product.title}</strong>
                      </p>
                    )}

                    <div className="review-stars-section">
                      {renderStars(review.rating)}
                    </div>

                    <div className="reviewer-info-compact">
                      <div className="reviewer-avatar-small">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="reviewer-name">
                          {review.userName}
                          {review.isVerifiedPurchase && <span className="verified-badge">Verified</span>}
                        </p>
                      </div>
                    </div>

                    <h5 className="review-title">{review.title}</h5>
                    <p className="review-text">
                      {review.comment.length > 200 
                        ? `${review.comment.substring(0, 200)}...` 
                        : review.comment}
                    </p>

                    {review.comment.length > 200 && (
                      <a href="#" className="read-more">Read more</a>
                    )}

                    {review.images && review.images.length > 0 && (
                      <div className="review-images-compact">
                        {review.images.map((img, idx) => (
                          <img 
                            key={idx} 
                            src={img} 
                            alt="Review" 
                            className="review-image-small"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
