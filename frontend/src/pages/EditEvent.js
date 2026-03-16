import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI } from '../services/api';
import './EditEvent.css';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const updatedEvent = await eventAPI.updateEvent(id, event);
      console.log('Event updated successfully:', updatedEvent);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event');
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="edit-event-loading">Loading...</div>;
  }

  if (error && !event) {
    return <div className="edit-event-error">Error: {error}</div>;
  }

  if (!event) {
    return <div className="edit-event-error">Event not found</div>;
  }

  return (
    <div className="edit-event-container">
      <div className="edit-event-form">
        <h2>Edit Event</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="eventName">Event Name:</label>
            <input
              type="text"
              id="eventName"
              name="eventName"
              value={event.eventName}
              onChange={handleChange}
              required
              placeholder="Enter event name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="eventDate">Event Date:</label>
            <input
              type="date"
              id="eventDate"
              name="eventDate"
              value={event.eventDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="venue">Venue:</label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={event.venue}
              onChange={handleChange}
              required
              placeholder="Enter venue"
            />
          </div>

          <div className="form-group">
            <label htmlFor="eventType">Event Type:</label>
            <select
              id="eventType"
              name="eventType"
              value={event.eventType}
              onChange={handleChange}
              required
            >
              <option value="Wedding">Wedding</option>
              <option value="Conference">Conference</option>
              <option value="Birthday">Birthday</option>
              <option value="Corporate">Corporate</option>
              <option value="Party">Party</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;
