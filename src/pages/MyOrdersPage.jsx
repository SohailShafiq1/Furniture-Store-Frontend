import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserAuth } from '../context/UserAuthContext';
import { useNavigate } from 'react-router-dom';
import './MyOrdersPage.css';

const MyOrdersPage = () => {
  const { user, token, logout } = useUserAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  const apiEndpoint = `${import.meta.env.VITE_API_URL}/orders`;
  const backendRoot = import.meta.env.VITE_API_URL.replace('/api', '');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [token, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiEndpoint}/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Backend now returns array directly
      const ordersData = Array.isArray(response.data) ? response.data : [];
      setOrders(ordersData);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filterStatus === 'All' 
    ? orders 
    : orders.filter(order => order.orderStatus === filterStatus);

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#ff9800',
      'Processing': '#2196f3',
      'Shipped': '#673ab7',
      'Delivered': '#4caf50',
      'Cancelled': '#f44336'
    };
    return colors[status] || '#999';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'Completed': '#4caf50',
      'Pending': '#ff9800',
      'Failed': '#f44336'
    };
    return colors[status] || '#999';
  };

  const statuses = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="my-orders-page">
      {/* Header */}
      <div className="orders-header">
        <div className="header-content">
          <h1>My Orders</h1>
          <p className="header-subtitle">Track and manage all your purchases</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="orders-container">
        {/* Status Filter */}
        <div className="filter-section">
          <div className="filter-tabs">
            {statuses.map(status => (
              <button
                key={status}
                className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
                {status !== 'All' && (
                  <span className="filter-count">
                    {orders.filter(o => o.orderStatus === status).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3>Error Loading Orders</h3>
            <p>{error}</p>
            <button onClick={fetchOrders} className="retry-button">Try Again</button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 2L6.46 5.46M15 2l2.54 3.46M3 5h18v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm9 0v3"></path>
            </svg>
            <h3>No Orders Yet</h3>
            <p>You haven't placed any orders {filterStatus !== 'All' && `with status "${filterStatus}"`}.</p>
            <button onClick={() => navigate('/')} className="shop-button">Continue Shopping</button>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map(order => (
              <div key={order._id} className="order-card">
                {/* Card Header */}
                <div className="order-card-header">
                  <div className="order-info">
                    <h3>Order #{order._id.substring(0, 8).toUpperCase()}</h3>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="order-badges">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                    >
                      {order.orderStatus}
                    </span>
                    <span 
                      className="payment-badge"
                      style={{ backgroundColor: getPaymentStatusColor(order.paymentStatus) }}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="order-summary">
                  <div className="summary-item">
                    <label>Items</label>
                    <span>{order.items.length}</span>
                  </div>
                  <div className="summary-item">
                    <label>Total Amount</label>
                    <span className="amount">${(order.totalAmount / 100).toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <label>Payment Method</label>
                    <span>{order.paymentMethod}</span>
                  </div>
                </div>

                {/* Expand Button */}
                <button
                  className="expand-button"
                  onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                >
                  {expandedOrder === order._id ? '▼ Hide Details' : '▶ Show Details'}
                </button>

                {/* Expanded Details */}
                {expandedOrder === order._id && (
                  <div className="order-details-expanded">
                    
                    {/* Shipping Address */}
                    <div className="details-section">
                      <h4>Shipping Address</h4>
                      <div className="address-box">
                        <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                        <p>{order.shippingAddress.country}</p>
                        <p>Phone: {order.shippingAddress.phone}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="details-section">
                      <h4>Order Items</h4>
                      <div className="items-list">
                        {order.items.map((item, index) => (
                          <div key={index} className="item-row">
                            <div className="item-info">
                              <p className="item-name">
                                {item.product?.name || 'Product'}
                                {item.variation && <span className="variation"> ({item.variation})</span>}
                              </p>
                              <p className="item-price">Qty: {item.quantity}</p>
                            </div>
                            <div className="item-price">
                              ${(item.price * item.quantity / 100).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="details-section">
                      <h4>Cost Breakdown</h4>
                      <div className="cost-breakdown">
                        <div className="cost-row">
                          <span>Subtotal:</span>
                          <span>${((order.totalAmount - (order.shippingCost || 0) - (order.tax || 0)) / 100).toFixed(2)}</span>
                        </div>
                        {order.shippingCost > 0 && (
                          <div className="cost-row">
                            <span>Shipping Cost:</span>
                            <span>${(order.shippingCost / 100).toFixed(2)}</span>
                          </div>
                        )}
                        {order.tax > 0 && (
                          <div className="cost-row">
                            <span>Tax:</span>
                            <span>${(order.tax / 100).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="cost-row total">
                          <span>Total:</span>
                          <span>${(order.totalAmount / 100).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Timeline */}
                    <div className="details-section">
                      <h4>Order Status Timeline</h4>
                      <div className="timeline">
                        <div className={`timeline-item ${['Pending', 'Processing', 'Shipped', 'Delivered'].includes(order.orderStatus) ? 'completed' : ''}`}>
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <p className="timeline-title">Order Placed</p>
                            <p className="timeline-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className={`timeline-item ${['Processing', 'Shipped', 'Delivered'].includes(order.orderStatus) ? 'completed' : ''}`}>
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <p className="timeline-title">Processing</p>
                            <p className="timeline-date">In progress...</p>
                          </div>
                        </div>
                        <div className={`timeline-item ${['Shipped', 'Delivered'].includes(order.orderStatus) ? 'completed' : ''}`}>
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <p className="timeline-title">Shipped</p>
                            <p className="timeline-date">On the way...</p>
                          </div>
                        </div>
                        <div className={`timeline-item ${order.orderStatus === 'Delivered' ? 'completed' : ''}`}>
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <p className="timeline-title">Delivered</p>
                            <p className="timeline-date">Expected soon</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
