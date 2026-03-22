import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI } from '../services/api';
import './BudgetManagement.css';

const BudgetManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [budget, setBudget] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('weekly');

  const [budgetForm, setBudgetForm] = useState({
    totalBudget: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'PAID',
    recipientName: '',
    vendorId: ''
  });

  const [vendors, setVendors] = useState([]);
  const [vendorSuggestions, setVendorSuggestions] = useState([]);
  const [showVendorSuggestions, setShowVendorSuggestions] = useState(false);

  useEffect(() => {
    fetchBudgetData();
    fetchVendors();
  }, [id]);

  // Close vendor suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.vendor-input-container')) {
        setShowVendorSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchVendors = async () => {
    try {
      const vendorsData = await eventAPI.getEventVendors(id);
      setVendors(vendorsData || []);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    }
  };

  const handleVendorNameChange = (e) => {
    const value = e.target.value;
    setPaymentForm({...paymentForm, recipientName: value, vendorId: ''});
    
    if (value.length > 0) {
      const filtered = vendors.filter(vendor => 
        vendor.vendorName.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 4);
      setVendorSuggestions(filtered);
      setShowVendorSuggestions(true);
    } else {
      setVendorSuggestions([]);
      setShowVendorSuggestions(false);
    }
  };

  const handleVendorSelect = (vendor) => {
    setPaymentForm({
      ...paymentForm,
      recipientName: vendor.vendorName,
      vendorId: vendor.vendorId
    });
    setVendorSuggestions([]);
    setShowVendorSuggestions(false);
  };

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch budget data
      const budgetData = await eventAPI.getBudget(id);
      setBudget(budgetData);
      
      // Fetch payments data if budget exists
      if (budgetData) {
        const paymentsData = await eventAPI.getPayments(budgetData.id);
        setPayments(paymentsData || []);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error('Failed to fetch budget data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics data
  const calculateAnalytics = () => {
    if (!budget || !payments.length) {
      return {
        totalSpent: 0,
        remainingBudget: 0,
        spentPercentage: 0,
        savingsPercentage: 0,
        weeklyData: []
      };
    }

    const totalSpent = payments.reduce((sum, payment) => {
      if (payment.paymentStatus === 'PAID') {
        return sum + payment.amount;
      }
      return sum;
    }, 0);

    const remainingBudget = budget.totalBudget - totalSpent;
    const spentPercentage = (totalSpent / budget.totalBudget) * 100;
    const savingsPercentage = remainingBudget > 0 ? (remainingBudget / budget.totalBudget) * 100 : 0;

    // Calculate weekly data (mock for now - can be enhanced with real date logic)
    const weeklyData = [
      { week: 'Week 1', amount: totalSpent * 0.3 },
      { week: 'Week 2', amount: totalSpent * 0.25 },
      { week: 'Week 3', amount: totalSpent * 0.2 },
      { week: 'Week 4', amount: totalSpent * 0.25 }
    ];

    return {
      totalSpent,
      remainingBudget,
      spentPercentage,
      savingsPercentage,
      weeklyData
    };
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    try {
      const response = await eventAPI.createBudget(id, { totalBudget: parseFloat(budgetForm.totalBudget) });
      setBudget(response);
      setShowCreateBudget(false);
      setBudgetForm({ totalBudget: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create budget');
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      if (!budget || !budget.id) {
        throw new Error('Budget not found. Please create a budget first.');
      }
      
      if (!paymentForm.vendorId) {
        throw new Error('Please select a vendor from the dropdown.');
      }
      
      console.log('Adding payment with budget ID:', budget.id);
      console.log('Payment data:', {
        eventVendorId: paymentForm.vendorId,
        amount: parseFloat(paymentForm.amount),
        paymentDate: paymentForm.paymentDate,
        paymentStatus: paymentForm.paymentStatus,
        recipientName: paymentForm.recipientName
      });
      
      const response = await eventAPI.addPayment(budget.id, {
        eventVendorId: paymentForm.vendorId,
        amount: parseFloat(paymentForm.amount),
        paymentDate: paymentForm.paymentDate,
        paymentStatus: paymentForm.paymentStatus,
        recipientName: paymentForm.recipientName
      });
      
      setPayments([...payments, { ...response, recipientName: paymentForm.recipientName }]);
      setShowAddPayment(false);
      setPaymentForm({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'PAID',
        recipientName: '',
        vendorId: ''
      });
      setError('');
    } catch (err) {
      console.error('Failed to add payment:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle specific Event Vendor not found error
      let errorMessage = 'Failed to add payment';
      if (err.response?.data?.message && err.response.data.message.includes('Event vendor not found')) {
        errorMessage = 'Cannot add payment: No vendor found for this event. Please add a vendor to the event first before adding payments.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  if (loading) {
    return <div className="budget-loading">Loading...</div>;
  }

  return (
    <div className="budget-container">
      <div className="budget-header">
        <h2>Budget Management</h2>
        <button className="btn-back" onClick={() => navigate(`/events/${id}`)}>
          ← Back to Event
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!budget ? (
        <div className="no-budget">
          <h3>No budget created yet</h3>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateBudget(true)}
          >
            Create Budget
          </button>
          
          {showCreateBudget && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Create Budget</h3>
                <form onSubmit={handleCreateBudget}>
                  <div className="form-group">
                    <label>Total Budget:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={budgetForm.totalBudget}
                      onChange={(e) => setBudgetForm({...budgetForm, totalBudget: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">Create</button>
                    <button type="button" className="btn-secondary" onClick={() => setShowCreateBudget(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="budget-content">
          <div className="budget-summary">
            <div className="summary-card">
              <h3>Total Budget</h3>
              <p className="amount">${budget.totalBudget.toFixed(2)}</p>
            </div>
            <div className="summary-card">
              <h3>Spent Amount</h3>
              <p className="amount spent">${budget.spentAmount.toFixed(2)}</p>
            </div>
            <div className="summary-card">
              <h3>Remaining</h3>
              <p className="amount remaining">${(budget.totalBudget - budget.spentAmount).toFixed(2)}</p>
            </div>
          </div>

          <div className="payments-section">
            <div className="section-header">
              <h3>Payments</h3>
              <button 
                className="btn-primary"
                onClick={() => {
                  setShowAddPayment(true);
                  setError(''); // Clear any previous errors
                }}
              >
                Add Payment
              </button>
            </div>

            <div className="payments-list">
              {payments.map(payment => (
                <div key={payment.id} className="payment-item">
                  <div className="payment-main-info">
                    <div className="payment-transaction">
                      <span className="recipient">Paid to: {payment.recipientName || 'Unknown'}</span>
                    </div>
                    <div className="payment-amount">${payment.amount.toFixed(2)}</div>
                  </div>
                  <div className="payment-meta">
                    <span className="payment-date">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                    <span className={`payment-status ${payment.paymentStatus.toLowerCase()}`}>
                      {payment.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showAddPayment && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Add Payment</h3>
                {error && (
                  <div className="error-message" style={{ 
                    backgroundColor: '#fee', 
                    border: '1px solid #fcc', 
                    borderRadius: '4px', 
                    padding: '10px', 
                    marginBottom: '15px', 
                    color: '#c33'
                  }}>
                    {error}
                  </div>
                )}
                <form onSubmit={handleAddPayment}>
                  <div className="form-group">
                    <label>Amount:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Recipient Name:</label>
                    <div className="vendor-input-container">
                      <input
                        type="text"
                        value={paymentForm.recipientName}
                        onChange={handleVendorNameChange}
                        onFocus={() => paymentForm.recipientName.length > 0 && setShowVendorSuggestions(true)}
                        placeholder="Start typing vendor name..."
                        required
                      />
                      {showVendorSuggestions && vendorSuggestions.length > 0 && (
                        <div className="vendor-suggestions">
                          {vendorSuggestions.map((vendor, index) => (
                            <div
                              key={index}
                              className="vendor-suggestion-item"
                              onClick={() => handleVendorSelect(vendor)}
                            >
                              {vendor.vendorName} - {vendor.serviceType}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Payment Date:</label>
                    <input
                      type="date"
                      value={paymentForm.paymentDate}
                      onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Status:</label>
                    <select
                      value={paymentForm.paymentStatus}
                      onChange={(e) => setPaymentForm({...paymentForm, paymentStatus: e.target.value})}
                    >
                      <option value="PAID">Paid</option>
                      <option value="PENDING">Pending</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">Add Payment</button>
                    <button type="button" className="btn-secondary" onClick={() => {
                      setShowAddPayment(false);
                      setError(''); // Clear error when canceling
                    }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Panel */}
      <div className={`analytics-panel ${showAnalyticsPanel ? 'show' : 'hide'}`}>
        <div className="analytics-header">
          <h4>View Budget Expenditure</h4>
          <button 
            className="toggle-panel-btn"
            onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
          >
            {showAnalyticsPanel ? '▶' : '◀'}
          </button>
        </div>
        {showAnalyticsPanel && (
          <div className="analytics-content">
            <div className="period-selector">
              <label>View Period:</label>
              <select 
                value={analyticsPeriod} 
                onChange={(e) => setAnalyticsPeriod(e.target.value)}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div className="analytics-stats">
              <div className="stat-item">
                <label>Budget Spent This {analyticsPeriod === 'weekly' ? 'Week' : 'Month'}</label>
                <span className="stat-value">${calculateAnalytics().totalSpent.toFixed(2)}</span>
              </div>
              <div className="stat-item">
                <label>Savings %</label>
                <span className={`stat-value ${calculateAnalytics().savingsPercentage >= 0 ? 'positive' : 'negative'}`}>
                  {calculateAnalytics().savingsPercentage >= 0 ? '+' : ''}{calculateAnalytics().savingsPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="stat-item">
                <label>vs Last {analyticsPeriod === 'weekly' ? 'Week' : 'Month'}</label>
                <span className="stat-value negative">-5.2%</span>
              </div>
              <div className="stat-item">
                <label>vs Median</label>
                <span className="stat-value positive">+8.1%</span>
              </div>
            </div>
            <div className="chart-container">
              <div className="mock-chart">
                {calculateAnalytics().weeklyData.map((week, index) => {
                  const maxAmount = Math.max(...calculateAnalytics().weeklyData.map(w => w.amount));
                  const heightPercentage = (week.amount / maxAmount) * 100;
                  return (
                    <div key={index} className="chart-bar-container">
                      <div 
                        className="chart-bar" 
                        style={{ height: `${heightPercentage}%` }}
                        title={`${week.week}: $${week.amount.toFixed(2)}`}
                      ></div>
                      <div className="chart-week-label">{week.week}</div>
                    </div>
                  );
                })}
              </div>
              <div className="chart-labels">
                {calculateAnalytics().weeklyData.map((week, index) => (
                  <span key={index}>{week.week}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Toggle Button */}
      <button 
        className="fixed-toggle-btn"
        onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
      >
        {showAnalyticsPanel ? '◀' : '▶'}
      </button>
    </div>
  );
};

export default BudgetManagement;
