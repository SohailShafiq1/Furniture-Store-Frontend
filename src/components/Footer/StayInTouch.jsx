import './StayInTouch.css';
import { useRef, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

export default function StayInTouch() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailRef = useRef(null);

  const handleSubscribe = async (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      if (emailRef.current) {
        emailRef.current.setCustomValidity('Please add email first');
        emailRef.current.reportValidity();
        emailRef.current.setCustomValidity('');
        emailRef.current.focus();
      } else {
        window.alert('Please add email first');
      }
      return;
    }

    if (emailRef.current && !emailRef.current.checkValidity()) {
      emailRef.current.reportValidity();
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/newsletter-subscribers/subscribe`, {
        email: trimmedEmail
      });

      window.alert(response.data?.message || 'Your email is saved successfully');
      setEmail('');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save email';
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="stay-in-touch">
      <div className="stay-container">
        <h2 className="stay-title">Stay in touch.</h2>
        <p className="stay-sub">Sign up for new arrivals, promotions, and trends.</p>
        <form className="stay-form" onSubmit={handleSubscribe} noValidate>
          <label className="visually-hidden" htmlFor="email">Email</label>
          <div className="stay-field">
            <input
              ref={emailRef}
              id="email"
              type="email"
              required
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
      </div>
    </section>
  );
}
