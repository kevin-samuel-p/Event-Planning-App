import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import EventDayAgenda from '../components/EventDayAgenda';
import './EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showManageDropdown, setShowManageDropdown] = useState(false);
  const [dropdownSymbol, setDropdownSymbol] = useState('▶');

  // Check if today is event day
  const isEventDay = () => {
    if (!event) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.eventDate);
    eventDate.setHours(0, 0, 0, 0);
    return today.toDateString() === eventDate.toDateString();
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const events = await eventAPI.getMyEvents();
        const foundEvent = events.find(e => e.id === parseInt(id));
        setEvent(foundEvent);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleManageDropdown = () => {
    setShowManageDropdown(!showManageDropdown);
    setDropdownSymbol(showManageDropdown ? '▶' : '▼');
  };

  const handleManageBudget = () => {
    navigate(`/events/${id}/budget`);
  };

  const handleManageTasks = () => {
    navigate(`/events/${id}/tasks`);
  };

  const handleManageVendors = () => {
    navigate(`/events/${id}/vendors`);
  };

  const handleSendInvitations = () => {
    navigate(`/events/${id}/invitations`);
  };

  const handleViewChat = () => {
    navigate(`/events/${id}/chat`);
  };

  if (loading) {
    return <div className="event-details-loading">Loading...</div>;
  }

  if (error) {
    return <div className="event-details-error">Error: {error}</div>;
  }

  if (!event) {
    return <div className="event-details-error">Event not found</div>;
  }

  return (
    <div className="event-details-container">
      <div className="event-details">
        <div className="event-header">
          <h2>{event.eventName}</h2>
          <button 
            className="btn-back"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="event-info">
          <div className="info-section">
            <h3>Event Information</h3>
            <div className="info-item">
              <label>Date:</label>
              <span>{new Date(event.eventDate).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Venue:</label>
              <span>{event.venue}</span>
            </div>
            <div className="info-item">
              <label>Type:</label>
              <span>{event.eventType}</span>
            </div>
          </div>

          <div className="event-actions">
            <h3>Actions</h3>
            <div className="action-buttons">
              <div className="dropdown-container">
                <button 
                  className="btn-primary dropdown-btn"
                  onClick={handleManageDropdown}
                >
                  Manage {dropdownSymbol}
                </button>
                {showManageDropdown && (
                  <div className="dropdown-menu">
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        handleManageBudget();
                        setShowManageDropdown(false);
                        setDropdownSymbol('▶');
                      }}
                    >
                      Budget
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        handleManageTasks();
                        setShowManageDropdown(false);
                        setDropdownSymbol('▶');
                      }}
                    >
                      Tasks
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        handleManageVendors();
                        setShowManageDropdown(false);
                        setDropdownSymbol('▶');
                      }}
                    >
                      Vendors
                    </button>
                  </div>
                )}
              </div>
              
              <button 
                className="btn-primary"
                onClick={handleSendInvitations}
              >
                Invite
              </button>
              
              <button 
                className="btn-primary"
                onClick={handleViewChat}
              >
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Day Agenda - Only shows on event day */}
      {isEventDay() && (
        <EventDayAgenda 
          eventId={id} 
          isEventDay={isEventDay()} 
          userRole={user?.role || 'GUEST'} 
        />
      )}
    </div>
  );
};

export default EventDetails;
