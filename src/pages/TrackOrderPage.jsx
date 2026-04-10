import { useState } from 'react';
import axios from 'axios';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { BACKEND_URL } from '../config/api';
import './TrackOrderPage.css';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setOrder(null);

    const trimmedOrderId = orderId.trim();
    if (!trimmedOrderId) {
      setError('Please enter an order ID to track.');
      return;
    }

    if (/\s/.test(trimmedOrderId)) {
      setError('Order ID should not contain spaces. Please enter the exact ID.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/orders/track/${encodeURIComponent(trimmedOrderId)}`);
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        setError(response.data.message || 'Order not found.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to find that order. Please check the ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="track-order-page">
        <section className="track-order-hero">
          <div className="track-order-inner">
            <h1>Track Delivery</h1>
            <p>
              Enter your order ID below and click "Find" to view the current status of your delivery.
            </p>
            <form className="track-order-form" onSubmit={handleSubmit}>
              <label htmlFor="orderId">Order ID</label>
              <div className="track-order-input-group">
                <input
                  id="orderId"
                  type="text"
                  placeholder="Enter your order ID"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Finding…' : 'Find'}
                </button>
              </div>
            </form>
            {error && <p className="track-order-error">{error}</p>}
          </div>
        </section>

        {order && (
          <section className="track-order-details">
            <div className="track-order-card">
              <h2>Order Status</h2>
              <div className="track-order-summary">
                <div>
                  <span className="track-order-label">Order ID</span>
                  <p>{order.orderId || order._id}</p>
                </div>
                <div>
                  <span className="track-order-label">Status</span>
                  <p>{order.orderStatus}</p>
                </div>
                <div>
                  <span className="track-order-label">Payment Status</span>
                  <p>{order.paymentStatus}</p>
                </div>
                <div>
                  <span className="track-order-label">Total</span>
                  <p>${order.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              <div className="track-order-section">
                <h3>Shipping Address</h3>
                <p>
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p>{order.shippingAddress.phone}</p>
              </div>

              <div className="track-order-section">
                <h3>Items</h3>
                <div className="track-order-items">
                  {order.items.map((item) => (
                    <div key={item._id || item.product._id} className="track-order-item">
                      <div>
                        <strong>{item.product?.name || 'Product'}</strong>
                        <p>Qty: {item.quantity}</p>
                      </div>
                      <p>${item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
