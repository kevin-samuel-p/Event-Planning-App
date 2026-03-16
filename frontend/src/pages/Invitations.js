import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Invitations.css';

const Invitations = () => {
  const navigate = useNavigate();

  return (
    <div className="invitations-container">
      <div className="invitations">
        <div className="invitations-header">
          <h2>Invitations</h2>
          <button 
            className="btn-back"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
        
        <div className="invitations-content">
          <p className="placeholder-text">
            Invitations feature coming soon! This page will show:
          </p>
          <ul className="feature-list">
            <li>Received invitations</li>
            <li>RSVP status</li>
            <li>Accept/Decline options</li>
            <li>Invitation history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Invitations;
