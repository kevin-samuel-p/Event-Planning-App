import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI } from '../services/api';
import './InvitationManagement.css';

const InvitationManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guests, setGuests] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    guestId: '',
    customMessage: 'You are cordially invited to this event. We hope you can join us!'
  });

  useEffect(() => {
    fetchGuestData();
  }, [id]);

  const fetchGuestData = async () => {
    try {
      // For now, we'll simulate guest and invitation data
      // In a real app, you'd call APIs to get guests and invitations
      const mockGuests = [
        { id: 7, name: 'Guest One', email: 'guest1@example.com' },
        { id: 8, name: 'Guest Two', email: 'guest2@example.com' },
        { id: 9, name: 'Guest Three', email: 'guest3@example.com' },
        { id: 10, name: 'Guest Four', email: 'guest4@example.com' }
      ];
      
      const mockInvitations = [
        { id: 1, guestId: 7, guestName: 'Guest One', rsvpStatus: 'ACCEPTED' },
        { id: 2, guestId: 8, guestName: 'Guest Two', rsvpStatus: 'PENDING' }
      ];

      setGuests(mockGuests);
      setInvitations(mockInvitations);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch guest data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    try {
      const response = await eventAPI.sendInvitation(id, inviteForm);
      const guest = guests.find(g => g.id === parseInt(inviteForm.guestId));
      const newInvitation = {
        id: Date.now(), // Use timestamp for unique ID
        guestId: parseInt(inviteForm.guestId),
        guestName: guest?.name || `Guest ${inviteForm.guestId}`,
        rsvpStatus: 'PENDING'
      };
      setInvitations([...invitations, newInvitation]);
      setShowInviteForm(false);
      setInviteForm({
        guestId: '',
        customMessage: 'You are cordially invited to this event. We hope you can join us!'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    }
  };

  const isGuestInvited = (guestId) => {
    return invitations.some(inv => inv.guestId === guestId);
  };

  const getInvitedGuests = () => {
    return invitations.map(inv => ({
      ...inv,
      guest: guests.find(g => g.id === inv.guestId)
    }));
  };

  const getAvailableGuests = () => {
    return guests.filter(guest => !isGuestInvited(guest.id));
  };

  const getRsvpStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#ffc107';
      case 'ACCEPTED': return '#28a745';
      case 'DECLINED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return <div className="invitation-loading">Loading...</div>;
  }

  return (
    <div className="invitation-container">
      <div className="invitation-header">
        <h2>Invitation Management</h2>
        <button className="btn-back" onClick={() => navigate(`/events/${id}`)}>
          ← Back to Event
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="invitation-content">
        <div className="available-guests-section">
          <h3>Available Guests ({getAvailableGuests().length})</h3>
          {getAvailableGuests().length === 0 ? (
            <p>All guests have been invited</p>
          ) : (
            <div className="guests-list">
              {getAvailableGuests().map(guest => (
                <div key={guest.id} className="guest-item">
                  <div className="guest-info">
                    <span className="guest-name">{guest.name}</span>
                    <span className="guest-email">{guest.email}</span>
                  </div>
                  <button 
                    className="btn-small"
                    onClick={() => {
                      setInviteForm({...inviteForm, guestId: guest.id.toString()});
                      setShowInviteForm(true);
                    }}
                  >
                    Invite
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="invitations-section">
          <h3>Invitation Status ({invitations.length})</h3>
          {invitations.length === 0 ? (
            <div className="no-invitations">
              <p>No invitations sent yet</p>
            </div>
          ) : (
            <div className="invitations-grid">
              {getInvitedGuests().map(invitation => (
                <div key={invitation.id} className="invitation-card">
                  <div className="invitation-header-info">
                    <h4>{invitation.guest?.name || 'Unknown Guest'}</h4>
                    <span 
                      className="rsvp-status"
                      style={{ backgroundColor: getRsvpStatusColor(invitation.rsvpStatus) }}
                    >
                      {invitation.rsvpStatus}
                    </span>
                  </div>
                  
                  <div className="invitation-details">
                    <div className="invitation-info">
                      <strong>Email:</strong> {invitation.guest?.email || 'N/A'}
                    </div>
                    <div className="invitation-info">
                      <strong>Guest ID:</strong> {invitation.guestId}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showInviteForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Send Invitation</h3>
              <form onSubmit={handleSendInvitation}>
                <div className="form-group">
                  <label>Guest:</label>
                  <input
                    type="text"
                    value={guests.find(g => g.id === parseInt(inviteForm.guestId))?.name || ''}
                    readOnly
                    className="readonly-input"
                  />
                </div>
                <div className="form-group">
                  <label>Custom Message (optional):</label>
                  <textarea
                    value={inviteForm.customMessage}
                    onChange={(e) => setInviteForm({...inviteForm, customMessage: e.target.value})}
                    rows="3"
                    placeholder="Add a personal message to the invitation..."
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Send Invitation</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowInviteForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationManagement;
