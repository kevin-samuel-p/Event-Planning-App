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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsData = await eventAPI.getMyEvents();
        setEvents(eventsData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewEvent = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const handleEditEvent = (eventId) => {
    navigate(`/events/${eventId}/edit`);
  };

  const handleCreateEvent = () => {
    navigate('/events/create');
  };

  const handleViewInvitations = () => {
    navigate('/invitations');
  };

  const handleViewNotifications = () => {
    navigate('/notifications');
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
            <h2>Welcome, {user?.name || 'User'}!</h2>
            <p className="user-role">Role: {user?.role}</p>
            <p className="user-email">{user?.email}</p>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-section">
          <h3>Your Events</h3>
          {events.length === 0 ? (
            <p className="no-events">No events yet. Create your first event!</p>
          ) : (
            <div className="events-grid">
              {events.map(event => (
                <div key={event.id} className="event-card">
                  <h4>{event.eventName}</h4>
                  <p className="event-date">
                    <strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}
                  </p>
                  <p className="event-venue">
                    <strong>Venue:</strong> {event.venue}
                  </p>
                  <p className="event-type">
                    <strong>Type:</strong> {event.eventType}
                  </p>
                  <div className="event-actions">
                    <button 
                      className="btn-primary" 
                      onClick={() => handleViewEvent(event.id)}
                    >
                      View Details
                    </button>
                    <button 
                      className="btn-secondary" 
                      onClick={() => handleEditEvent(event.id)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button 
              className="btn-primary" 
              onClick={handleCreateEvent}
            >
              Create New Event
            </button>
            <button 
              className="btn-secondary" 
              onClick={handleViewInvitations}
            >
              View Invitations
            </button>
            <button 
              className="btn-secondary" 
              onClick={handleViewNotifications}
            >
              Notifications
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
