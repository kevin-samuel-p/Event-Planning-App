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
    paymentStatus: 'PAID'
  });

  useEffect(() => {
    fetchBudgetData();
  }, [id]);

  const fetchBudgetData = async () => {
    try {
      // For now, we'll simulate budget data
      // In a real app, you'd have API calls to get budget and payments
      setBudget({
        id: 1,
        eventId: parseInt(id),
        totalBudget: 5000.00,
        spentAmount: 1200.50
      });
      setPayments([
        { id: 1, amount: 800.00, paymentDate: '2026-03-15', paymentStatus: 'PAID', transactorName: 'Alice Johnson', vendorName: 'Catering Co.' },
        { id: 2, amount: 400.50, paymentDate: '2026-03-16', paymentStatus: 'PAID', transactorName: 'Alice Johnson', vendorName: 'Flower Shop' }
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch budget data');
    } finally {
      setLoading(false);
    }
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
      // For now, we'll simulate adding payment
      const newPayment = {
        id: payments.length + 1,
        amount: parseFloat(paymentForm.amount),
        paymentDate: paymentForm.paymentDate,
        paymentStatus: paymentForm.paymentStatus
      };
      setPayments([...payments, newPayment]);
      setShowAddPayment(false);
      setPaymentForm({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'PAID'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add payment');
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
                onClick={() => setShowAddPayment(true)}
              >
                Add Payment
              </button>
            </div>

            <div className="payments-list">
              {payments.map(payment => (
                <div key={payment.id} className="payment-item">
                  <div className="payment-main-info">
                    <div className="payment-transaction">
                      <span className="transactor">{payment.transactorName}</span>
                      <span className="arrow">→</span>
                      <span className="vendor">{payment.vendorName}</span>
                    </div>
                    <div className="payment-amount">${payment.amount.toFixed(2)}</div>
                  </div>
                  <div className="payment-meta">
                    <span className="payment-date">{payment.paymentDate}</span>
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
                    <button type="button" className="btn-secondary" onClick={() => setShowAddPayment(false)}>
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
            
            <div className="chart-container">
              <div className="mock-chart">
                <div className="chart-bar" style={{ height: '60%' }}></div>
                <div className="chart-bar" style={{ height: '80%' }}></div>
                <div className="chart-bar" style={{ height: '45%' }}></div>
                <div className="chart-bar" style={{ height: '90%' }}></div>
              </div>
              <div className="chart-labels">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </div>

            <div className="analytics-stats">
              <div className="stat-item">
                <label>Budget Spent This {analyticsPeriod === 'weekly' ? 'Week' : 'Month'}</label>
                <span className="stat-value">$450.25</span>
              </div>
              <div className="stat-item">
                <label>Savings %</label>
                <span className="stat-value positive">+12.5%</span>
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
