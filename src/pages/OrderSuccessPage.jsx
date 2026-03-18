import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './OrderSuccessPage.css';

const OrderSuccessPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Clear cart since payment was successful
    clearCart();
  }, [clearCart]);

  return (
    <div className="order-success-page">
      <Header />
      <div className="success-container">
        <div className="success-content">
          <div className="success-icon">✓</div>
          <h1>Order Placed Successfully!</h1>
          <p className="success-message">Thank you for your purchase. Your order has been confirmed.</p>
          
          <div className="order-details-box">
            <p><strong>Session ID:</strong> {sessionId}</p>
            <p>We've sent you a confirmation email with all the details of your order.</p>
          </div>

          <div className="success-actions">
            <button 
              className="btn-primary" 
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => navigate('/checkout')}
            >
              View Orders
            </button>
          </div>

          <div className="next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>📧 Check your email for the order confirmation</li>
              <li>📦 Track your order status from your account</li>
              <li>🚚 We'll notify you when your order ships</li>
              <li>💬 Need help? Contact our support team</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
