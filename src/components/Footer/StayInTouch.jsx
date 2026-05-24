import './StayInTouch.css';
import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

export default function StayInTouch() {
  const [email, setEmail] = useState('');
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification(message);
    setNotificationType(type);

    window.clearTimeout(showNotification.timer);
    showNotification.timer = window.setTimeout(() => {
      setNotification('');
      setNotificationType('');
    }, 2800);
  };

  const handleSubscribe = async (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      showNotification('Please add email first', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/newsletter-subscribers/subscribe`, {
        email: trimmedEmail
      });

      showNotification(response.data?.message || 'Your email is saved successfully', 'success');
      setEmail('');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save email';
      showNotification(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="stay-in-touch">
      <div className="stay-container">
        <h2 className="stay-title">Stay in touch.</h2>
        <p className="stay-sub">Sign up for new arrivals, promotions, and trends.</p>
        <form className="stay-form" onSubmit={handleSubscribe}>
          <label className="visually-hidden" htmlFor="email">Email</label>
          <div className="stay-field">
            <input
              id="email"
              type="email"
              placeholder="Your email"
              className="stay-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
            <button className="stay-btn" aria-label="Subscribe" type="submit" disabled={isSubmitting}>
              →
            </button>
          </div>
        </form>
        {notification && (
          <div className={`stay-notification stay-notification--${notificationType}`} role="status" aria-live="polite">
            {notification}
          </div>
        )}
      </div>
    </section>
  );
}
