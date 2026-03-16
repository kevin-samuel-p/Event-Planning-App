import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';

const Notifications = () => {
  const navigate = useNavigate();

  return (
    <div className="notifications-container">
      <div className="notifications">
        <div className="notifications-header">
          <h2>Notifications</h2>
          <button 
            className="btn-back"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
        
        <div className="notifications-content">
          <p className="placeholder-text">
            Notifications feature coming soon! This page will show:
          </p>
          <ul className="feature-list">
            <li>Event invitations</li>
            <li>Task reminders</li>
            <li>Budget alerts</li>
            <li>Chat messages</li>
            <li>System notifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
