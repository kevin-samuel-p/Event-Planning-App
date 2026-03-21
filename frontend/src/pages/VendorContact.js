import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { eventAPI } from '../services/api';
import './VendorContact.css';

const VendorContact = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const vendorId = location.pathname.split('/')[2];
    if (vendorId) {
      fetchVendor(vendorId);
    }
  }, [location]);

  const fetchVendor = async (vendorId) => {
    try {
      setLoading(true);
      setError('');
      const vendorData = await eventAPI.getVendorDetails(vendorId);
      setVendor(vendorData);
    } catch (err) {
      console.error('Failed to fetch vendor details:', err);
      setError('Failed to load vendor details');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToVendors = () => {
    // Get eventId from navigation state, fallback to generic vendor management
    const eventId = location.state?.eventId;
    if (eventId) {
      navigate(`/events/${eventId}/vendors`);
    } else {
      navigate('/vendor-management');
    }
  };

  const handleSendMessage = () => {
    // Implement message functionality
    alert('Message functionality coming soon!');
  };

  const handleCallVendor = () => {
    if (vendor?.phone) {
      window.location.href = `tel:${vendor.phone}`;
    } else {
      alert('Phone number not available');
    }
  };

  const handleEmailVendor = () => {
    if (vendor?.email) {
      window.location.href = `mailto:${vendor.email}`;
    } else {
      alert('Email address not available');
    }
  };

  if (loading) {
    return (
      <div className="vendor-contact-loading">
        <div className="loading-spinner"></div>
        <p>Loading vendor details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vendor-contact-error">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={handleBackToVendors} className="btn-primary">Back to Vendors</button>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="vendor-contact-error">
        <div className="error-message">
          <h3>Vendor Not Found</h3>
          <p>The requested vendor could not be found.</p>
          <button onClick={handleBackToVendors} className="btn-primary">Back to Vendors</button>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-contact-container">
      <div className="vendor-contact-header">
        <button onClick={handleBackToVendors} className="btn-secondary">
          ← Back to Vendors
        </button>
        <h1>Vendor Contact</h1>
      </div>

      <div className="vendor-contact-content">
        <div className="vendor-card">
          <div className="vendor-header">
            <h2>{vendor.name}</h2>
            <div className="vendor-subtitle">Vendor ID: {vendor.id}</div>
          </div>

          <div className="vendor-details">
            <div className="detail-row">
              <strong>Email:</strong> 
              <span>{vendor.email || 'Not available'}</span>
            </div>
            <div className="detail-row">
              <strong>Phone:</strong> 
              <span>{vendor.phone || 'Not available'}</span>
            </div>
          </div>

          <div className="contact-actions">
            <button className="btn-primary" onClick={handleSendMessage}>
              📧 Send Message
            </button>
            <button className="btn-secondary" onClick={handleCallVendor}>
              📞 Call Vendor
            </button>
            <button className="btn-secondary" onClick={handleEmailVendor}>
              ✉ Email Vendor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorContact;
