import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const { token } = useAdminAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const apiEndpoint = `${import.meta.env.VITE_API_URL}/analytics`;

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiEndpoint}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="error-container">
          <h3>Error Loading Analytics</h3>
          <p>{error}</p>
          <button onClick={fetchAnalytics} className="retry-button">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <p>Monitor your store performance</p>
      </div>

      {/* Main Container */}
      <div className="analytics-container">
        
        {/* Info Banner */}
        <div className="info-banner">
          <p>📌 <strong>Note:</strong> Product sales are calculated from all orders (pending + completed). Total Sales shows only confirmed payments.</p>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="card metric-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <p className="card-label">Total Sales</p>
              <h3 className="card-value">{formatCurrency(analytics.summary.totalSales)}</h3>
              <span className="card-meta">{analytics.summary.completedOrders} orders</span>
            </div>
          </div>

          <div className="card metric-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <p className="card-label">Total Revenue</p>
              <h3 className="card-value">{formatCurrency(analytics.summary.totalRevenue)}</h3>
              <span className="card-meta">All orders</span>
            </div>
          </div>

          <div className="card metric-card">
            <div className="card-icon">📦</div>
            <div className="card-content">
              <p className="card-label">Total Orders</p>
              <h3 className="card-value">{analytics.summary.totalOrders}</h3>
              <span className="card-meta">{analytics.summary.pendingOrders} pending</span>
            </div>
          </div>

          <div className="card metric-card">
            <div className="card-icon">👥</div>
            <div className="card-content">
              <p className="card-label">Customers</p>
              <h3 className="card-value">{analytics.summary.uniqueCustomers}</h3>
              <span className="card-meta">Unique customers</span>
            </div>
          </div>

          <div className="card metric-card">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <p className="card-label">Avg Order Value</p>
              <h3 className="card-value">{formatCurrency(analytics.summary.averageOrderValue)}</h3>
              <span className="card-meta">Per order</span>
            </div>
          </div>

          <div className="card metric-card">
            <div className="card-icon">🛍️</div>
            <div className="card-content">
              <p className="card-label">Products Sold</p>
              <h3 className="card-value">{analytics.totalProductsSold}</h3>
              <span className="card-meta">Total units</span>
            </div>
          </div>
        </div>

        {/* Store Performance Analytics */}
        <div className="analytics-section">
          <h2>Store Performance & Attribution</h2>
          {analytics.storePerformance && analytics.storePerformance.length > 0 ? (
            <div className="store-performance-table">
              <div className="table-header">
                <div className="col-name">Store Name</div>
                <div className="col-orders">Orders</div>
                <div className="col-units">Units Sold</div>
                <div className="col-revenue">Revenue</div>
                <div className="col-sources">Top Conversion Sources</div>
              </div>
              {analytics.storePerformance.map((store) => (
                <div key={store._id} className="table-row">
                  <div className="col-name">
                    <strong>{store.name}</strong>
                    <span className="store-id-sub">{store._id.substring(0, 8)}...</span>
                  </div>
                  <div className="col-orders">
                    <div className="order-stats">
                      <span className="total-orders">{store.totalOrders} total</span>
                      <span className="completed-orders">{store.completedOrders} completed</span>
                    </div>
                  </div>
                  <div className="col-units">{store.itemsSold} units</div>
                  <div className="col-revenue">
                    <div className="revenue-stats">
                      <span className="total-revenue">{formatCurrency(store.revenue)}</span>
                      <span className="completed-revenue">Paid: {formatCurrency(store.completedRevenue)}</span>
                    </div>
                  </div>
                  <div className="col-sources">
                    <div className="source-tags">
                      {Object.entries(store.conversionSource)
                        .filter(([_, count]) => count > 0)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([source, count]) => (
                          <span key={source} className="source-tag">
                            {source}: {count}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No store performance data available</p>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="analytics-section">
          <h2>Order Status Distribution</h2>
          <div className="status-grid">
            {Object.entries(analytics.statusDistribution).map(([status, count]) => (
              <div key={status} className="status-card">
                <div className="status-label">{status}</div>
                <div className="status-count">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Status Distribution */}
        <div className="analytics-section">
          <h2>Payment Status Distribution</h2>
          <div className="payment-grid">
            {Object.entries(analytics.paymentDistribution).map(([status, count]) => (
              <div key={status} className="payment-card">
                <div className="payment-label">{status}</div>
                <div className="payment-count">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="analytics-section">
          <h2>Payment Methods Used</h2>
          <div className="method-grid">
            {Object.entries(analytics.paymentMethods).map(([method, count]) => (
              <div key={method} className="method-card">
                <div className="method-label">{method}</div>
                <div className="method-count">{count} transactions</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="analytics-section">
          <h2>Top 5 Best Selling Products</h2>
          {analytics.topProducts.length > 0 ? (
            <div className="products-table">
              <div className="table-header">
                <div className="col-rank">Rank</div>
                <div className="col-name">Product Name</div>
                <div className="col-quantity">Units Sold</div>
                <div className="col-revenue">Revenue</div>
              </div>
              {analytics.topProducts.map((product, index) => (
                <div key={product._id} className="table-row">
                  <div className="col-rank">#{index + 1}</div>
                  <div className="col-name">{product.name}</div>
                  <div className="col-quantity">{product.quantity} units</div>
                  <div className="col-revenue">{formatCurrency(product.revenue)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No products sold yet</p>
          )}
        </div>

        {/* Least Selling Products */}
        <div className="analytics-section">
          <h2>Least Selling Products</h2>
          {analytics.bottomProducts && analytics.bottomProducts.length > 0 ? (
            <div className="products-table">
              <div className="table-header">
                <div className="col-rank">Rank</div>
                <div className="col-name">Product Name</div>
                <div className="col-quantity">Units Sold</div>
                <div className="col-revenue">Revenue</div>
              </div>
              {analytics.bottomProducts.map((product, index) => (
                <div key={product._id} className="table-row highlight-low">
                  <div className="col-rank">#{analytics.topProducts.length - index}</div>
                  <div className="col-name">{product.name}</div>
                  <div className="col-quantity">{product.quantity} units</div>
                  <div className="col-revenue">{formatCurrency(product.revenue)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No data available</p>
          )}
        </div>

        {/* Monthly Sales Trend */}
        <div className="analytics-section">
          <h2>Sales Trend (Last 30 Days)</h2>
          {Object.keys(analytics.monthlySales).length > 0 ? (
            <div className="sales-trend">
              {Object.entries(analytics.monthlySales)
                .sort((a, b) => new Date(a[0]) - new Date(b[0]))
                .map(([date, sales]) => (
                  <div key={date} className="trend-item">
                    <span className="trend-date">{new Date(date).toLocaleDateString()}</span>
                    <div className="trend-bar-container">
                      <div 
                        className="trend-bar"
                        style={{ 
                          width: `${(sales / Math.max(...Object.values(analytics.monthlySales))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="trend-value">{formatCurrency(sales)}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="no-data">No sales data for the last 30 days</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default AnalyticsDashboard;
