import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API_BASE_URL, BACKEND_URL } from '../config/api';
import axios from 'axios';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './OrderSuccessPage.css';

const OrderSuccessPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cartClearedRef = useRef(false);

  // Clear cart once when component mounts
  useEffect(() => {
    if (!cartClearedRef.current) {
      clearCart();
      cartClearedRef.current = true;
    }
  }, []);

  // Fetch order details when sessionId changes
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/orders/by-session/${sessionId}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        setError('Unable to load order details');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (sessionId) {
      fetchOrderDetails();
    }
  }, [sessionId]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    return imagePath.startsWith('http') ? imagePath : `${BACKEND_URL}/${imagePath}`;
  };

  return (
    <div className="order-success-page">
      <Header />
      <div className="success-container">
        <div className="success-content">
          <div className="success-icon">✓</div>
          <h1>Order Placed Successfully!</h1>
          <p className="success-message">Thank you for your purchase. Your order has been confirmed.</p>
          
          {loading ? (
            <p className="loading-text">Loading order details...</p>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : order ? (
            <>
              <div className="order-details-box">
                <p><strong>Order ID:</strong> {order.orderId || order._id}</p>
                <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                <p>We've sent you a confirmation email with all the details of your order.</p>
              </div>

              <div className="items-section">
                <h3>Order Items</h3>
                <div className="items-list">
                  {order.items && order.items.map((item, index) => (
                    <div key={index} className="item-card">
                      <div className="item-number">Item {index + 1}</div>
                      <div className="item-details">
                        <p><strong>Product:</strong> {item.product?.name || 'Unknown Product'}</p>
                        {item.variation && <p><strong>Variation:</strong> {item.variation}</p>}
                        <p><strong>Quantity:</strong> {item.quantity}</p>
                        <p><strong>Price:</strong> ${(item.price || 0).toFixed(2)}</p>
                        <p><strong>Subtotal:</strong> ${((item.price || 0) * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-summary">
                <p><strong>Total Amount:</strong> <span className="total-amount">${(order.totalAmount || 0).toFixed(2)}</span></p>
                {/* <p><strong>Payment Status:</strong> <span className="payment-status">{order.paymentStatus}</span></p> */}
              </div>
            </>
          ) : null}

          <div className="success-actions">
            <button 
              className="btn-primary" 
              onClick={() => navigate('/')}
            >
              Continue Shopping
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
