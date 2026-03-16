import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { eventAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showManageDropdown, setShowManageDropdown] = useState(false);
  const [dropdownSymbol, setDropdownSymbol] = useState('▶');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Determine user role for dashboard customization
  const getUserRole = () => {
    if (!user) return 'GUEST';
    if (user.role === 'ORGANIZER') return 'ORGANIZER';
    if (user.role === 'VENDOR') return 'VENDOR';
    return 'ATTENDEE'; // Default for regular users
  };

  const userRole = getUserRole();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        let eventsData;
        
        // Fetch events based on user role
        switch (userRole) {
          case 'ORGANIZER':
            eventsData = await eventAPI.getMyEvents(); // All events created by organizer
            break;
          case 'VENDOR':
            eventsData = await eventAPI.getVendorEvents(); // Events where vendor is hired
            break;
          case 'ATTENDEE':
            eventsData = await eventAPI.getInvitedEvents(); // Events user is invited to
            break;
          case 'GUEST':
          default:
            eventsData = []; // Guests don't see events until invited
            break;
        }
        
        setEvents(eventsData || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userRole]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEditModal(true);
  };

  const handleCreateEvent = () => {
    setShowCreateModal(true);
  };

  const handleViewInvitations = () => {
    navigate('/invitations');
  };

  const handleViewNotifications = () => {
    navigate('/notifications');
  };

  const handleManageDropdown = () => {
    setShowManageDropdown(!showManageDropdown);
    setDropdownSymbol(showManageDropdown ? '▶' : '▼');
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (error) {
    return <div className="dashboard-error">Error: {error}</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <h2>
              {userRole === 'ORGANIZER' && 'Welcome, Event Organizer!'}
              {userRole === 'VENDOR' && 'Welcome, Vendor Partner!'}
              {userRole === 'ATTENDEE' && 'Welcome, Event Attendee!'}
              {userRole === 'GUEST' && 'Welcome to Event Planner!'}
            </h2>
            <p className="user-role">
              {userRole === 'ORGANIZER' && 'Event Organizer'}
              {userRole === 'VENDOR' && 'Vendor Partner'}
              {userRole === 'ATTENDEE' && 'Event Attendee'}
              {userRole === 'GUEST' && 'Guest User'}
            </p>
            {user && user.email && (
              <p className="user-email">{user.email}</p>
            )}
          </div>
          <div className="header-actions">
            {userRole === 'ORGANIZER' && (
              <>
                <button 
                  className="header-btn" 
                  onClick={handleCreateEvent}
                  title="Create New Event"
                >
                  +
                </button>
                <button 
                  className="header-btn" 
                  onClick={handleViewInvitations}
                  title="View Invitations"
                >
                  ✉
                </button>
                <button 
                  className="header-btn" 
                  onClick={handleViewNotifications}
                  title="Notifications"
                >
                  🔔
                </button>
              </>
            )}
            
            {userRole === 'VENDOR' && (
              <>
                <button 
                  className="header-btn" 
                  onClick={() => navigate('/vendor-profile')}
                  title="My Vendor Profile"
                >
                  👤
                </button>
                <button 
                  className="header-btn" 
                  onClick={() => navigate('/vendor-opportunities')}
                  title="Event Opportunities"
                >
                  📅
                </button>
                <button 
                  className="header-btn" 
                  onClick={handleViewNotifications}
                  title="Notifications"
                >
                  🔔
                </button>
              </>
            )}
            
            {userRole === 'ATTENDEE' && (
              <>
                <button 
                  className="header-btn" 
                  onClick={() => navigate('/my-events')}
                  title="My Events"
                >
                  📅
                </button>
                <button 
                  className="header-btn" 
                  onClick={handleViewInvitations}
                  title="My Invitations"
                >
                  ✉
                </button>
                <button 
                  className="header-btn" 
                  onClick={() => navigate('/my-profile')}
                  title="My Profile"
                >
                  👤
                </button>
              </>
            )}
            
            {userRole === 'GUEST' && (
              <>
                <button 
                  className="header-btn" 
                  onClick={() => navigate('/explore-events')}
                  title="Explore Events"
                >
                  🔍
                </button>
                <button 
                  className="header-btn" 
                  onClick={() => navigate('/about')}
                  title="About Event Planner"
                >
                  ℹ️
                </button>
                <button 
                  className="header-btn" 
                  onClick={() => navigate('/signup')}
                  title="Sign Up"
                >
                  📝
                </button>
              </>
            )}
            
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Role-specific dashboard content */}
        {userRole === 'ORGANIZER' && (
          <div className="dashboard-section">
            <h3>Your Events</h3>
            {events.length === 0 ? (
              <div className="no-events">
                <p>No events created yet. Create your first event!</p>
                <button className="btn-primary" onClick={handleCreateEvent}>
                  Create Event
                </button>
              </div>
            ) : (
              <div className="events-grid">
                {events.map(event => (
                  <div key={event.id} className="event-card">
                    <h4>{event.eventName}</h4>
                    <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
                    <p><strong>Venue:</strong> {event.venue}</p>
                    <p><strong>Type:</strong> {event.eventType}</p>
                    <div className="event-actions">
                      <button 
                        className="btn-primary" 
                        onClick={() => handleViewEvent(event)}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn-secondary" 
                        onClick={() => handleEditEvent(event)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {userRole === 'VENDOR' && (
          <div className="dashboard-section">
            <h3>Your Event Contracts</h3>
            {events.length === 0 ? (
              <div className="no-events">
                <p>No event contracts yet. Browse available opportunities!</p>
                <button className="btn-primary" onClick={() => navigate('/vendor-opportunities')}>
                  Browse Opportunities
                </button>
              </div>
            ) : (
              <div className="events-grid">
                {events.map(event => (
                  <div key={event.id} className="event-card">
                    <h4>{event.eventName}</h4>
                    <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
                    <p><strong>Service:</strong> {event.serviceType}</p>
                    <p><strong>Status:</strong> 
                      <span className={`contract-status ${event.contractStatus?.toLowerCase()}`}>
                        {event.contractStatus}
                      </span>
                    </p>
                    <div className="event-actions">
                      <button 
                        className="btn-primary" 
                        onClick={() => navigate(`/events/${event.id}/vendor-details`)}
                      >
                        View Contract
                      </button>
                      <button 
                        className="btn-secondary" 
                        onClick={() => navigate(`/events/${event.id}/chat`)}
                      >
                        Contact Organizer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {userRole === 'ATTENDEE' && (
          <div className="dashboard-section">
            <h3>Your Invited Events</h3>
            {events.length === 0 ? (
              <div className="no-events">
                <p>No event invitations yet. Check back soon!</p>
                <button className="btn-primary" onClick={() => navigate('/explore-events')}>
                  Explore Events
                </button>
              </div>
            ) : (
              <div className="events-grid">
                {events.map(event => (
                  <div key={event.id} className="event-card">
                    <h4>{event.eventName}</h4>
                    <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
                    <p><strong>Venue:</strong> {event.venue}</p>
                    <p><strong>Type:</strong> {event.eventType}</p>
                    <p><strong>Invitation Status:</strong> 
                      <span className={`rsvp-status ${event.rsvpStatus?.toLowerCase()}`}>
                        {event.rsvpStatus || 'Pending'}
                      </span>
                    </p>
                    <div className="event-actions">
                      <button 
                        className="btn-primary" 
                        onClick={() => handleViewEvent(event)}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn-secondary" 
                        onClick={() => navigate(`/events/${event.id}/rsvp`)}
                      >
                        {event.rsvpStatus === 'ACCEPTED' ? 'Update RSVP' : 'RSVP'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {userRole === 'GUEST' && (
          <div className="dashboard-section">
            <h3>Welcome to Event Planner</h3>
            <div className="guest-welcome">
              <p>Discover and join amazing events in your area!</p>
              <div className="guest-actions">
                <button className="btn-primary" onClick={() => navigate('/explore-events')}>
                  Explore Events
                </button>
                <button className="btn-secondary" onClick={() => navigate('/about')}>
                  Learn More
                </button>
                <button className="btn-secondary" onClick={() => navigate('/signup')}>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preserved Quick Actions div for future personal DMs */}
        <div className="quick-actions">
          {/* Future personal messaging feature will go here */}
        </div>
      </main>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="event-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEvent.eventName}</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowEventModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="event-details-grid">
                <div className="details-left">
                  <div className="detail-item">
                    <label>Date:</label>
                    <span>{new Date(selectedEvent.eventDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Venue:</label>
                    <span>{selectedEvent.venue}</span>
                  </div>
                  <div className="detail-item">
                    <label>Type:</label>
                    <span>{selectedEvent.eventType}</span>
                  </div>
                </div>
                <div className="actions-right">
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
                            setShowEventModal(false);
                            setShowManageDropdown(false);
                            setDropdownSymbol('▶');
                            navigate(`/events/${selectedEvent.id}/budget`);
                          }}
                        >
                          Budget
                        </button>
                        <button 
                          className="dropdown-item"
                          onClick={() => {
                            setShowEventModal(false);
                            setShowManageDropdown(false);
                            setDropdownSymbol('▶');
                            navigate(`/events/${selectedEvent.id}/tasks`);
                          }}
                        >
                          Tasks
                        </button>
                        <button 
                          className="dropdown-item"
                          onClick={() => {
                            setShowEventModal(false);
                            setShowManageDropdown(false);
                            setDropdownSymbol('▶');
                            navigate(`/events/${selectedEvent.id}/vendors`);
                          }}
                        >
                          Vendors
                        </button>
                      </div>
                    )}
                  </div>
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      setShowEventModal(false);
                      navigate(`/events/${selectedEvent.id}/invitations`);
                    }}
                  >
                    Invitations
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      setShowEventModal(false);
                      navigate(`/events/${selectedEvent.id}/chat`);
                    }}
                  >
                    Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Event</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <form className="event-form">
                <div className="form-group">
                  <label>Event Name:</label>
                  <input type="text" placeholder="Enter event name" />
                </div>
                <div className="form-group">
                  <label>Date:</label>
                  <input type="date" />
                </div>
                <div className="form-group">
                  <label>Venue:</label>
                  <input type="text" placeholder="Enter venue" />
                </div>
                <div className="form-group">
                  <label>Type:</label>
                  <select>
                    <option value="">Select type</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  setShowCreateModal(false);
                  // Handle event creation logic here
                  console.log('Creating event...');
                }}
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && editingEvent && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Event</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <form className="event-form">
                <div className="form-group">
                  <label>Event Name:</label>
                  <input type="text" defaultValue={editingEvent.eventName} />
                </div>
                <div className="form-group">
                  <label>Date:</label>
                  <input type="date" defaultValue={editingEvent.eventDate?.split('T')[0]} />
                </div>
                <div className="form-group">
                  <label>Venue:</label>
                  <input type="text" defaultValue={editingEvent.venue} />
                </div>
                <div className="form-group">
                  <label>Type:</label>
                  <select defaultValue={editingEvent.eventType}>
                    <option value="Wedding">Wedding</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  setShowEditModal(false);
                  // Handle event update logic here
                  console.log('Updating event...');
                }}
              >
                Update Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
