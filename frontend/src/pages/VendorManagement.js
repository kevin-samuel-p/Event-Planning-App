import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI } from '../services/api';
import './VendorManagement.css';

const VendorManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddVendor, setShowAddVendor] = useState(false);

  const [vendorForm, setVendorForm] = useState({
    vendorName: '',
    serviceType: '',
    contractStatus: 'PENDING'
  });
  const [vendorSuggestions, setVendorSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, [id]);

  const fetchVendors = async () => {
    try {
      // For now, we'll simulate vendor data
      // In a real app, you'd call the API to get vendors
      setVendors([
        {
          id: 1,
          vendorId: 5,
          vendorName: 'Catering Co.',
          serviceType: 'Catering',
          contractStatus: 'ACTIVE'
        },
        {
          id: 2,
          vendorId: 6,
          vendorName: 'Flower Shop',
          serviceType: 'Decorations',
          contractStatus: 'PENDING'
        }
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleVendorNameChange = (e) => {
    const value = e.target.value;
    setVendorForm({...vendorForm, vendorName: value});
    
    if (value.length > 0) {
      // Filter existing vendors based on name
      const filtered = vendors.filter(vendor => 
        vendor.vendorName.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 4); // Limit to 4 suggestions
      setVendorSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setVendorSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleVendorSelect = (vendor) => {
    setVendorForm({
      ...vendorForm,
      vendorName: vendor.vendorName,
      serviceType: vendor.serviceType
    });
    setShowSuggestions(false);
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    try {
      const response = await eventAPI.addVendor(id, vendorForm);
      setVendors([...vendors, { 
        ...response, 
        vendorName: vendorForm.vendorName 
      }]);
      setShowAddVendor(false);
      setVendorForm({
        vendorName: '',
        serviceType: '',
        contractStatus: 'PENDING'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vendor');
    }
  };

  const getContractStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#ffc107';
      case 'ACTIVE': return '#28a745';
      case 'COMPLETED': return '#6c757d';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return <div className="vendor-loading">Loading...</div>;
  }

  return (
    <div className="vendor-container">
      <div className="vendor-header">
        <h2>Vendor Management</h2>
        <button className="btn-back" onClick={() => navigate(`/events/${id}`)}>
          ← Back to Event
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="vendor-content">
        <div className="section-header">
          <h3>Vendors ({vendors.length})</h3>
          <button 
            className="btn-primary"
            onClick={() => setShowAddVendor(true)}
          >
            Add Vendor
          </button>
        </div>

        {vendors.length === 0 ? (
          <div className="no-vendors">
            <p>No vendors added yet</p>
          </div>
        ) : (
          <div className="vendors-grid">
            {vendors.map(vendor => (
              <div key={vendor.id} className="vendor-card">
                <div className="vendor-header-info">
                  <h4>{vendor.vendorName}</h4>
                  <span 
                    className="contract-status"
                    style={{ backgroundColor: getContractStatusColor(vendor.contractStatus) }}
                  >
                    {vendor.contractStatus}
                  </span>
                </div>
                
                <div className="vendor-details">
                  <div className="vendor-info">
                    <strong>Service Type:</strong> {vendor.serviceType}
                  </div>
                  <div className="vendor-info">
                    <strong>Vendor ID:</strong> {vendor.vendorId}
                  </div>
                </div>

                <div className="vendor-actions">
                  <button className="btn-secondary">View Details</button>
                  <button className="btn-secondary">Contact</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddVendor && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Vendor</h3>
            <form onSubmit={handleAddVendor}>
              <div className="form-group">
                <label>Vendor Name:</label>
                <div className="autocomplete-container">
                  <input
                    type="text"
                    value={vendorForm.vendorName}
                    onChange={handleVendorNameChange}
                    onFocus={() => vendorForm.vendorName.length > 0 && setShowSuggestions(true)}
                    placeholder="Start typing vendor name..."
                    required
                  />
                  {showSuggestions && vendorSuggestions.length > 0 && (
                    <div className="vendor-suggestions">
                      {vendorSuggestions.map((vendor, index) => (
                        <div 
                          key={vendor.id}
                          className="suggestion-item"
                          onClick={() => handleVendorSelect(vendor)}
                        >
                          <div className="suggestion-name">{vendor.vendorName}</div>
                          <div className="suggestion-type">{vendor.serviceType}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Service Type:</label>
                <select
                  value={vendorForm.serviceType}
                  onChange={(e) => setVendorForm({...vendorForm, serviceType: e.target.value})}
                  required
                >
                  <option value="">Select service type</option>
                  <option value="Catering">Catering</option>
                  <option value="Photography">Photography</option>
                  <option value="Music">Music</option>
                  <option value="Decorations">Decorations</option>
                  <option value="Venue">Venue</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Contract Status:</label>
                <select
                  value={vendorForm.contractStatus}
                  onChange={(e) => setVendorForm({...vendorForm, contractStatus: e.target.value})}
                >
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Add Vendor</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddVendor(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;
