import React, { useState } from 'react';
import { BACKEND_URL } from '../../config/api';
import './ReviewSection.css';

const StarIcon = ({ filled, onClick, size = 16, interactive = false, color = "#1a1a1a" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill={filled ? (interactive ? "#FFB800" : color) : "none"} 
    stroke={filled ? (interactive ? "#FFB800" : color) : "#D1D1D1"} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ cursor: interactive ? 'pointer' : 'default' }}
    onClick={onClick}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

export default function ReviewSection({ product, onReviewAdded }) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/products/${product._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ 
          rating, 
          name: name || 'Anonymous', 
          comment,
          title: title || null,
          email: email || null,
          image: imagePreview || null,
          youtubeUrl: youtubeUrl || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        setComment('');
        setTitle('');
        setName('');
        setEmail('');
        setRating(5);
        setImage(null);
        setImagePreview(null);
        setYoutubeUrl('');
        setShowReviewForm(false);
        if (onReviewAdded) onReviewAdded();
      } else {
        setError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const averageRating = product.numReviews > 0 ? product.rating : 0;

  return (
    <div className="rs-section">
      <h2 className="rs-title">Customer Reviews</h2>
      
      <div className="rs-summary-card">
        <div className="rs-rating-summary">
          <div className="rs-stars-large">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} filled={i < Math.round(averageRating)} size={24} color="#FFB800" />
            ))}
          </div>
          <p className="rs-count-text">
            {product.numReviews > 0 
              ? `Based on ${product.numReviews} review${product.numReviews > 1 ? 's' : ''}`
              : 'Be the first to write a review'}
          </p>
        </div>
        
        <div className="rs-divider"></div>
        
        <div className="rs-action">
          <button 
            className="rs-write-btn"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            {showReviewForm ? 'Cancel review' : 'Write a review'}
          </button>
        </div>
      </div>

      {showReviewForm && (
        <form className="rs-form" onSubmit={handleSubmit}>
          <h3>Write a review</h3>
          
          <div className="rs-form-group">
            <label>Rating</label>
            <div className="rs-star-input">
              {[...Array(5)].map((_, i) => (
                <StarIcon 
                  key={i} 
                  filled={i < rating} 
                  size={32} 
                  interactive 
                  onClick={() => setRating(i + 1)} 
                />
              ))}
            </div>
          </div>

          <div className="rs-form-group">
            <label>Review Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Give your review a title"
              required
            />
          </div>

          <div className="rs-form-group">
            <label>Review content</label>
            <textarea 
              value={comment} 
              onChange={(e) => setComment(e.target.value)} 
              placeholder="Start writing here..."
              rows="6"
              required
            ></textarea>
          </div>

          <div className="rs-form-group">
            <label>Picture/Video (optional)</label>
            <div 
              className="rs-upload-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <div className="rs-image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button 
                    type="button" 
                    onClick={() => { setImage(null); setImagePreview(null); }}
                    className="rs-remove-image"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <svg className="rs-upload-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <p>Drag and drop your image here</p>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="rs-file-input"
                style={{ display: 'none' }}
                id="rs-image-input"
              />
              <label htmlFor="rs-image-input" className="rs-upload-label">
                or click to browse
              </label>
            </div>
          </div>

          <div className="rs-form-group">
            <label>YouTube URL</label>
            <input 
              type="url" 
              value={youtubeUrl} 
              onChange={(e) => setYoutubeUrl(e.target.value)} 
              placeholder="YouTube URL"
            />
          </div>

          <div className="rs-form-group">
            <label>Display name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Display name"
            />
          </div>

          <div className="rs-form-group">
            <label>Email address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Your email address"
              required
            />
          </div>

          {error && <p className="rs-error">{error}</p>}
          
          <div className="rs-disclaimer">
            <p>How we use your data: We'll only contact you about the review you left, and only if necessary. By submitting your review, you agree to our privacy policies.</p>
          </div>

          <div className="rs-form-actions">
            <button 
              type="button" 
              className="rs-cancel-btn"
              onClick={() => setShowReviewForm(false)}
            >
              Cancel review
            </button>
            <button type="submit" className="rs-submit-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {product.reviews && product.reviews.length > 0 && (
        <div className="rs-list">
          {product.reviews.map((review, idx) => (
            <div key={idx} className="rs-item">
              <div className="rs-item-header">
                <div className="rs-item-stars">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} filled={i < review.rating} size={14} color="#FFB800" />
                  ))}
                </div>
                <span className="rs-item-date">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              {review.title && <p className="rs-item-title">{review.title}</p>}
              <p className="rs-item-name">{review.name}</p>
              <p className="rs-item-comment">{review.comment}</p>
              {review.image && (
                <div className="rs-item-image">
                  <img src={review.image} alt="Review" />
                </div>
              )}
              {review.youtubeUrl && (
                <div className="rs-item-video">
                  <a href={review.youtubeUrl} target="_blank" rel="noopener noreferrer" className="rs-video-link">
                    Watch video: {review.youtubeUrl}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}