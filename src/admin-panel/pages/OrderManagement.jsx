import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, BACKEND_URL } from '../../config/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import Modal from '../../components/Modal/Modal';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './OrderManagement.css';

const OrderManagement = () => {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [cancelReason, setCancelReason] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterStore, setFilterStore] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [stores, setStores] = useState([]);

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchStores();
    }
  }, [token]);

  const fetchStores = async () => {
    try {
      // Changed from .replace('/orders', '/admin') to a cleaner manual string to ensure it hits /api/admin/stores
      const res = await axios.get(`${BACKEND_URL}/api/admin/stores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStores(res.data);
    } catch (err) {
      console.error('Error fetching stores for filter:', err);
    }
  };

  const fetchOrders = async () => {
    if (!token) {
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/orders/admin/all-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setModal({
        isOpen: true,
        title: 'Error',
        message: err.response?.data?.message || 'Failed to fetch orders',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus, reason = '') => {
    try {
      setStatusUpdating(true);
      
      // Show loading message based on status
      const statusMessages = {
        'Confirmed': 'Confirming order and notifying customer...',
        'Processing': 'Processing order and sending update email...',
        'Shipped': 'Updating shipment status and notifying customer...',
        'Out for Delivery': 'Notifying customer - out for delivery...',
        'Delivered': 'Marking as delivered and sending confirmation...',
        'Cancelled': 'Cancelling order and notifying customer...'
      };
      
      // This is for visual feedback - the actual update happens via API
      const res = await axios.put(
        `${API_BASE_URL}/orders/admin/update-status/${orderId}`,
        { status: newStatus, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setModal({
          isOpen: true,
          title: 'Success',
          message: `Order status updated to ${newStatus}. Customer notified via email at ${getCustomerEmail()}.`,
          type: 'success'
        });
        // Refresh orders after a short delay to show completion
        setTimeout(() => {
          fetchOrders();
          setSelectedOrder(null);
          setCancelReason('');
        }, 500);
      }
    } catch (err) {
      console.error('Error updating order:', err);
      setModal({
        isOpen: true,
        title: 'Error',
        message: err.response?.data?.message || 'Failed to update order status',
        type: 'error'
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  const getCustomerEmail = () => {
    return selectedOrder?.user?.email || 'customer';
  };

  const fixPaymentStatuses = async () => {
    try {
      setStatusUpdating(true);
      const res = await axios.post(
        `${API_BASE_URL}/orders/admin/fix-payment-statuses`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setModal({
          isOpen: true,
          title: 'Success',
          message: `Fixed payment status for ${res.data.modifiedCount} orders. Page will refresh.`,
          type: 'success'
        });
        setTimeout(() => {
          fetchOrders();
        }, 500);
      }
    } catch (err) {
      console.error('Error fixing payment statuses:', err);
      setModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to fix payment statuses',
        type: 'error'
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  const markPaymentCompleted = async (orderId) => {
    try {
      setStatusUpdating(true);
      
      const res = await axios.post(
        `${API_BASE_URL}/orders/admin/mark-payment-completed/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setModal({
          isOpen: true,
          title: 'Success',
          message: 'Payment marked as completed and confirmation email sent to customer.',
          type: 'success'
        });
        setTimeout(() => {
          fetchOrders();
          setSelectedOrder(null);
        }, 500);
      }
    } catch (err) {
      console.error('Error marking payment as completed:', err);
      setModal({
        isOpen: true,
        title: 'Error',
        message: err.response?.data?.message || 'Failed to mark payment as completed',
        type: 'error'
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  const openCancelModal = () => {
    setModal({
      isOpen: true,
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order?',
      type: 'warning',
      action: 'confirm-cancel'
    });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  const filteredOrders = orders.filter(order => {
    const statusMatch = filterStatus === 'All' || order.orderStatus === filterStatus;
    
    // Store Filter Match - Check both main order storeId and individual item storeIds
    const storeMatch = filterStore === 'All' || 
      (order.storeId?._id === filterStore || order.storeId === filterStore) ||
      (order.items?.some(item => (item.storeId?._id === filterStore || item.storeId === filterStore)));

    const searchMatch = 
      (order._id?.toString() || '').includes(searchTerm) ||
      (order.user?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.user?.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    return statusMatch && storeMatch && searchMatch;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#ffc107',
      'Confirmed': '#17a2b8',
      'Processing': '#007bff',
      'Shipped': '#495057',
      'Out for Delivery': '#fd7e14',
      'Delivered': '#28a745',
      'Cancelled': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return <div className="om-loading">Loading orders...</div>;
  }

  return (
    <div className="order-management">
      <div className="om-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Order Management</h2>
            <p className="om-subtitle">Total Orders: {orders.length}</p>
          </div>
          <button 
            className="om-fix-payment-btn" 
            onClick={fixPaymentStatuses}
            title="Fix payment status for all confirmed orders with pending payment"
          >
            🔧 Fix Payment Status
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="om-filters">
        <div className="om-filter-group">
          <label>Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="om-select">
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="om-filter-group">
          <label>Filter by Store:</label>
          <select 
            value={filterStore} 
            onChange={(e) => setFilterStore(e.target.value)} 
            className="om-select"
          >
            <option value="All">All Stores</option>
            {stores.map(store => (
              <option key={store._id} value={store._id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        <div className="om-filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search by Order ID, Email, or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="om-search-input"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="om-table-wrapper">
        <table className="om-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Store</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order._id} className="om-row">
                  <td className="om-order-id">{order._id.substring(0, 8)}...</td>
                  <td>
                    <strong>{(order.user?.firstName || 'Guest')} {(order.user?.lastName || '')}</strong>
                    <div style={{ fontSize: '11px', color: '#666' }}>{order.user?.email || order.guestEmail || 'N/A'}</div>
                  </td>
                  <td>
                    <span className="om-store-name">
                      {order.storeId?.name || (typeof order.storeId === 'string' ? 'Loading...' : 'Unknown')}
                    </span>
                  </td>
                  <td className="om-items-count">{order.items?.length || 0} item(s)</td>
                  <td className="om-amount">${(order.totalAmount || 0).toFixed(2)}</td>
                  <td>
                    <span className="om-status-badge" style={{ backgroundColor: getStatusColor(order.orderStatus) }}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`om-payment-badge ${order.paymentStatus.toLowerCase()}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="om-date">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="om-action-btn om-view-btn"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="om-no-data">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="om-detail-modal">
          <div className="om-modal-content">
            <button className="om-modal-close" onClick={() => setSelectedOrder(null)}>✕</button>

            <div className="om-modal-header">
              <h3>Order Details: {selectedOrder._id}</h3>
            </div>

            <div className="om-modal-body">
              {/* Customer Info */}
              <div className="om-section">
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> {(selectedOrder.user?.firstName || '-')} {(selectedOrder.user?.lastName || '')}</p>
                <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || 'N/A'}</p>
              </div>

              {/* Shipping Address */}
              <div className="om-section">
                <h4>Shipping Address</h4>
                <p>{selectedOrder.shippingAddress?.address || 'N/A'}</p>
                <p>{selectedOrder.shippingAddress?.city || 'N/A'}, {selectedOrder.shippingAddress?.state || ''} {selectedOrder.shippingAddress?.zipCode || ''}</p>
              </div>

              {/* Order Items */}
              <div className="om-section">
                <h4>Items Ordered</h4>
                <table className="om-items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Variation</th>
                      <th>Qty</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.product?.name || 'Product'}</td>
                        <td>{item.variation || '-'}</td>
                        <td>{item.quantity}</td>
                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Summary */}
              <div className="om-section om-summary">
                <p><strong>Subtotal:</strong> <span>${(selectedOrder.totalAmount || 0).toFixed(2)}</span></p>
                <p><strong>Shipping:</strong> <span>FREE</span></p>
                <p className="om-total"><strong>Total:</strong> <span>${(selectedOrder.totalAmount || 0).toFixed(2)}</span></p>
              </div>

              {/* Order Status & Payment */}
              <div className="om-section om-status-section">
                <div>
                  <p><strong>Order Status:</strong></p>
                  <span className="om-status-badge" style={{ backgroundColor: getStatusColor(selectedOrder.orderStatus || 'Pending') }}>
                    {selectedOrder.orderStatus || 'Pending'}
                  </span>
                </div>
                <div>
                  <p><strong>Payment Status:</strong></p>
                  <span className={`om-payment-badge ${(selectedOrder.paymentStatus || 'Pending').toLowerCase()}`}>
                    {selectedOrder.paymentStatus || 'Pending'}
                  </span>
                  {selectedOrder.paymentStatus === 'Pending' && (
                    <button
                      className="om-mark-payment-btn"
                      onClick={() => markPaymentCompleted(selectedOrder._id)}
                      title="Mark this payment as completed (use if Stripe webhook failed)"
                    >
                      ✓ Mark Payment Completed
                    </button>
                  )}
                </div>
              </div>

              {/* Status Update Actions */}
              {selectedOrder.orderStatus !== 'Delivered' && selectedOrder.orderStatus !== 'Cancelled' && (
                <div className="om-section om-actions">
                  <h4>Update Order Status</h4>
                  <div className="om-action-buttons">
                    {selectedOrder.orderStatus === 'Pending' && (
                      <button
                        className="om-status-update-btn om-confirmed"
                        onClick={() => handleStatusUpdate(selectedOrder._id, 'Confirmed')}
                      >
                        ✓ Confirm Order
                      </button>
                    )}
                    {(selectedOrder.orderStatus === 'Confirmed' || selectedOrder.orderStatus === 'Pending') && (
                      <button
                        className="om-status-update-btn om-processing"
                        onClick={() => handleStatusUpdate(selectedOrder._id, 'Processing')}
                      >
                        ⚙️ Processing
                      </button>
                    )}
                    {selectedOrder.orderStatus === 'Processing' && (
                      <button
                        className="om-status-update-btn om-shipped"
                        onClick={() => handleStatusUpdate(selectedOrder._id, 'Shipped')}
                      >
                        📦 Shipped
                      </button>
                    )}
                    {selectedOrder.orderStatus === 'Shipped' && (
                      <button
                        className="om-status-update-btn om-delivery"
                        onClick={() => handleStatusUpdate(selectedOrder._id, 'Out for Delivery')}
                      >
                        🚚 Out for Delivery
                      </button>
                    )}
                    {selectedOrder.orderStatus === 'Out for Delivery' && (
                      <button
                        className="om-status-update-btn om-delivered"
                        onClick={() => handleStatusUpdate(selectedOrder._id, 'Delivered')}
                      >
                        ✓ Mark Delivered
                      </button>
                    )}
                    <button className="om-status-update-btn om-cancel" onClick={openCancelModal}>
                      ✕ Cancel Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={modal.isOpen && modal.action === 'confirm-cancel'}
        title="Cancel Order"
        message="Please provide a reason for cancellation:"
        type="warning"
        onConfirm={() => {
          if (cancelReason.trim()) {
            handleStatusUpdate(selectedOrder._id, 'Cancelled', cancelReason);
          }
        }}
        onCancel={() => {
          closeModal();
          setCancelReason('');
        }}
        showCancelButton={true}
        confirmText="Cancel Order"
      >
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Enter cancellation reason..."
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontFamily: 'inherit'
          }}
        />
      </Modal>

      {/* Regular Modal for success/error */}
      <Modal
        isOpen={modal.isOpen && !modal.action}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={closeModal}
        onCancel={closeModal}
        showCancelButton={false}
      />

      {/* Loading Spinner for status updates */}
      {statusUpdating && (
        <LoadingSpinner message="Processing... Sending confirmation email to customer..." />
      )}
    </div>
  );
};

export default OrderManagement;
