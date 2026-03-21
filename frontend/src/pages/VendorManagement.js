import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI } from '../services/api';
import './VendorManagement.css';

// Vendor service mapping for auto-selection
const VENDOR_SERVICE_MAPPING = {
  'Catering Excellence': 'Catering',
  'Bloom Florists': 'Florist',
  'Snap Photography': 'Photography',
  'DJ Beats Entertainment': 'Entertainment',
  'Elite Transportation': 'Transportation',
  'Gourmet Catering Co': 'Catering',
  'Decor Plus': 'Decoration',
  'Sound Systems Pro': 'Entertainment'
};

// Helper function to get default service type for vendor
const getDefaultServiceType = (vendorName) => {
  return VENDOR_SERVICE_MAPPING[vendorName] || '';
};

const VendorManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [vendorForm, setVendorForm] = useState({
    vendorName: '',
    serviceType: '',
    contractStatus: 'PROPOSED'
  });
  const [allVendors, setAllVendors] = useState([]);
  const [vendorSuggestions, setVendorSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchVendors();
    fetchAllVendors();
  }, [id]);

  const fetchAllVendors = async () => {
    try {
      const vendorsData = await eventAPI.getAllVendors();
      setAllVendors(vendorsData || []);
    } catch (err) {
      console.error('Failed to fetch all vendors:', err);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch real vendor data from API
      const vendorsData = await eventAPI.getEventVendors(id);
      setVendors(vendorsData || []);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
      setError('Failed to load vendors. Please try again.');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorNameChange = (e) => {
    const value = e.target.value;
    setVendorForm({...vendorForm, vendorName: value});
    
    if (value.length > 0) {
      // Filter from all available vendors, not just event vendors
      const filtered = allVendors.filter(vendor => 
        vendor.name.toLowerCase().includes(value.toLowerCase())
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
      vendorName: vendor.name,
      serviceType: getDefaultServiceType(vendor.name), // Auto-select service type
      contractStatus: 'PROPOSED'
    });
    setVendorSuggestions([]);
    setShowSuggestions(false);
  };

  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setVendorForm({
      vendorName: vendor.vendorName,
      serviceType: vendor.serviceType || getDefaultServiceType(vendor.vendorName),
      contractStatus: vendor.contractStatus
    });
    setShowAddVendor(true);
  };

  const handleContactVendor = (vendor) => {
    // Navigate to vendor contact page with vendor details
    navigate(`/vendor-contact/${vendor.vendorId}`, { 
      state: { 
        vendorName: vendor.vendorName,
        vendorId: vendor.vendorId,
        serviceType: vendor.serviceType,
        email: vendor.email || '',
        eventId: id  // Add the current event ID
      }
    });
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        // Update existing vendor
        console.log('Editing vendor:', editingVendor); // Debug log
        console.log('Vendor form:', vendorForm); // Debug log
        
        // Use the vendor ID from the editingVendor object directly
        const response = await eventAPI.updateVendor(editingVendor.id, {
          serviceType: vendorForm.serviceType,
          contractStatus: vendorForm.contractStatus
        });
        
        console.log('Update request:', {
          vendorId: editingVendor.id,
          serviceType: vendorForm.serviceType,
          contractStatus: vendorForm.contractStatus
        }); // Debug log
        setVendors(vendors.map(v => 
          v.id === editingVendor.id ? { ...response, vendorName: vendorForm.vendorName } : v
        ));
        setEditingVendor(null);
        setShowAddVendor(false);
        setVendorForm({
          vendorName: '',
          serviceType: '',
          contractStatus: 'PROPOSED'
        });
      } else {
        // Add new vendor
        const selectedVendor = allVendors.find(v => v.name === vendorForm.vendorName);
        
        if (!selectedVendor) {
          setError('Please select a valid vendor from suggestions or enter an existing vendor name');
          return;
        }

        const response = await eventAPI.addVendor(id, {
          vendorId: selectedVendor.id,
          serviceType: vendorForm.serviceType,
          contractStatus: vendorForm.contractStatus
        });
        
        setVendors([...vendors, { ...response, vendorName: vendorForm.vendorName }]);
        setShowAddVendor(false);
        setVendorForm({
          vendorName: '',
          serviceType: '',
          contractStatus: 'PROPOSED'
        });
        setError('');
      }
    } catch (err) {
      console.error('Failed to save vendor:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save vendor');
    }
  };

  const handleRemoveVendor = async () => {
    if (!editingVendor) return;
    
    if (window.confirm('Are you sure you want to remove this vendor from the event?')) {
      try {
        await eventAPI.removeVendor(editingVendor.id);
        setVendors(vendors.filter(v => v.id !== editingVendor.id));
        setEditingVendor(null);
        setShowAddVendor(false);
        setVendorForm({
          vendorName: '',
          serviceType: '',
          contractStatus: 'PROPOSED'
        });
        setError('');
      } catch (err) {
        console.error('Failed to remove vendor:', err);
        setError(err.response?.data?.message || err.message || 'Failed to remove vendor');
      }
    }
  };

  const getContractStatusColor = (status) => {
    switch (status) {
      case 'PROPOSED': return '#ffc107';
      case 'ACTIVE': return '#28a745';
      case 'COMPLETED': return '#6c757d';
      case 'CANCELLED': return '#dc3545';
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
                  <button className="btn-secondary" onClick={() => handleEditVendor(vendor)}>Edit Details</button>
                  <button className="btn-secondary" onClick={() => handleContactVendor(vendor)}>Contact</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddVendor && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingVendor ? 'Edit Vendor' : 'Add Vendor'}</h3>
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
                          <div className="suggestion-name">{vendor.name}</div>
                          <div className="suggestion-email">{vendor.email}</div>
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
                  <option value="PROPOSED">Proposed</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingVendor ? 'Update Vendor' : 'Add Vendor'}
                </button>
                {editingVendor && (
                  <button type="button" className="btn-danger" onClick={handleRemoveVendor}>
                    Remove Vendor
                  </button>
                )}
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
