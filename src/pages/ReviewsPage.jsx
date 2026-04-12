import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { API_BASE_URL, BACKEND_URL } from '../config/api';
import './AboutUsPage.css';
import './ReviewsPage.css';

const normalizeImageUrl = (path) => {
  if (!path) return '/logo.avif';
  return path.startsWith('http') ? path : `${BACKEND_URL}/${path}`;
};

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState('product');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const [storeReviews, setStoreReviews] = useState([]);
  const [productReviews, setProductReviews] = useState([]);
  const [storeStats, setStoreStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [productStats, setProductStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  const [reviewForm, setReviewForm] = useState({
    userName: '',
    email: '',
    rating: 5,
    title: '',
    comment: ''
  });

  const storeId = useMemo(() => localStorage.getItem('storeId') || 'default-store', []);

  const summaryStats = activeTab === 'product' ? productStats : storeStats;
  const displayedReviews = activeTab === 'product' ? productReviews : storeReviews;
  const distribution = summaryStats?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const maxBar = Math.max(1, ...Object.values(distribution));

  const mediaThumbs = useMemo(() => {
    const fromProductImages = productReviews
      .map((review) => review?.product?.image || review?.images?.[0])
      .filter(Boolean);
    const fromStoreImages = storeReviews
      .map((review) => review?.images?.[0])
      .filter(Boolean);
    return [...fromProductImages, ...fromStoreImages].slice(0, 7);
  }, [productReviews, storeReviews]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const [storeRes, productRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/reviews/store`, {
            params: { store: storeId, page: 1, limit: 30, sort: 'recent' }
          }),
          axios.get(`${API_BASE_URL}/reviews/products/all`, {
            params: { page: 1, limit: 30, sort: 'recent' }
          })
        ]);

        setStoreReviews(Array.isArray(storeRes.data?.reviews) ? storeRes.data.reviews : []);
        setProductReviews(Array.isArray(productRes.data?.reviews) ? productRes.data.reviews : []);
        setStoreStats(storeRes.data?.stats || {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        });
        setProductStats(productRes.data?.stats || {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        });
      } catch (error) {
        console.error('Error loading reviews page data:', error);
      }
    };

    loadReviews();
  }, [storeId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setReviewLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/reviews/create`, {
        ...reviewForm,
        store: storeId,
        rating: parseInt(reviewForm.rating, 10)
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

      const refreshed = await axios.get(`${API_BASE_URL}/reviews/store`, {
        params: { store: storeId, page: 1, limit: 30, sort: 'recent' }
      });
      setStoreReviews(Array.isArray(refreshed.data?.reviews) ? refreshed.data.reviews : []);
      setStoreStats(refreshed.data?.stats || storeStats);
    } catch (error) {
      setReviewError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const starText = (rating) => `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`;

  return (
    <>
      <Header />
      <main className="reviews-page">
        <section className="about-hero reviews-hero" aria-label="Reviews hero section">
          <h1>Reviews</h1>
        </section>

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

        <section className="reviews-media-strip" aria-label="Customer photos and badges">
          <div className="reviews-media-left">
            <h3>Customer photos & videos</h3>
            <div className="reviews-media-thumbs">
              {mediaThumbs.map((img, i) => (
                <img key={i} src={normalizeImageUrl(img)} alt={`Customer media ${i + 1}`} loading="lazy" />
              ))}
              <a href="#">See more</a>
            </div>
          </div>
          <div className="reviews-media-right">
            <div className="badge">1752<br />Verified Reviews</div>
            <div className="badge">104<br />Monthly Record</div>
            <div className="badge">Silver<br />Authenticity</div>
            <div className="badge">Top 1%<br />Trending</div>
            <div className="badge">Top 5%<br />Stores</div>
          </div>
        </section>

        <section className="reviews-filter-card" aria-label="Review filters">
          <div className="reviews-tabs">
            <button
              type="button"
              className={activeTab === 'product' ? 'active' : ''}
              onClick={() => setActiveTab('product')}
            >
              Product Reviews ({productStats?.totalReviews || 0})
            </button>
            <button
              type="button"
              className={activeTab === 'store' ? 'active' : ''}
              onClick={() => setActiveTab('store')}
            >
              Shop Reviews ({storeStats?.totalReviews || 0})
            </button>
          </div>
          <div className="reviews-sort">Highest Rating ▾</div>
        </section>

        <section className="reviews-grid" aria-label="Review cards">
          {displayedReviews.map((review, index) => {
            const reviewImage =
              review?.images?.[0] ||
              review?.product?.image ||
              '/logo.avif';
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
      </main>
      <Footer />
    </>
  );
}
