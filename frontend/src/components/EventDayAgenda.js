import React, { useState, useEffect } from 'react';
import './EventDayAgenda.css';

const EventDayAgenda = ({ eventId, isEventDay, userRole }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Check if today is event day
  const checkEventDay = () => {
    return isEventDay;
  };

  // Calculate progress percentage with gradual filling
  const calculateProgress = () => {
    if (sessions.length === 0) return 0;
    const completedSessions = sessions.filter(session => session.status === 'COMPLETED').length;
    return Math.round((completedSessions / sessions.length) * 100);
  };

  // Get progress bar color based on completion status
  const getProgressColor = () => {
    const progress = calculateProgress();
    const hasFailedSessions = sessions.some(session => session.status === 'FAILED');
    
    if (progress === 100 && !hasFailedSessions) return '#28a745'; // Green - fully completed
    if (hasFailedSessions) return '#dc3545'; // Red - some sessions failed
    return '#ffc107'; // Yellow - in progress
  };

  // Update session status with real-time notification
  const updateSessionStatus = (sessionId, newStatus) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    // Update session status
    setSessions(prevSessions => 
      prevSessions.map(s => 
        s.id === sessionId ? { ...s, status: newStatus } : s
      )
    );

    // Add notification for session completion
    if (newStatus === 'COMPLETED') {
      const notification = {
        id: Date.now(),
        type: 'SESSION_COMPLETED',
        message: `Session "${session.name}" has been completed!`,
        sessionId: sessionId,
        timestamp: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
      
      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    }
  };

  // Mark session as complete (for organizers)
  const markSessionComplete = (sessionId) => {
    if (userRole === 'ORGANIZER') {
      updateSessionStatus(sessionId, 'COMPLETED');
    }
  };

  // Get session status class
  const getSessionStatusClass = (status) => {
    switch (status) {
      case 'COMPLETED': return 'session-completed';
      case 'IN_PROGRESS': return 'session-in-progress';
      case 'FAILED': return 'session-failed';
      case 'PENDING': 
      default: return 'session-pending';
    }
  };

  // Get progress bar segment style for gradual filling
  const getProgressSegmentStyle = (session, index) => {
    const progress = calculateProgress();
    const segmentProgress = (index + 1) / sessions.length * 100;
    const isCompleted = session.status === 'COMPLETED';
    const isFailed = session.status === 'FAILED';
    const isCurrent = index < sessions.filter(s => s.status === 'COMPLETED').length;
    
    return {
      width: `${100 / sessions.length}%`,
      backgroundColor: isCompleted ? '#28a745' : 
                       isFailed ? '#dc3545' : 
                       isCurrent ? '#ffc107' : '#6c757d',
      opacity: segmentProgress <= progress ? 1 : 0.3,
      transition: 'all 0.5s ease'
    };
  };

  // Mock data with default session templates
  useEffect(() => {
    const defaultSessions = [
      {
        id: 'session1',
        name: 'Venue Setup',
        startTime: '09:00',
        endTime: '10:00',
        description: 'Setup decorations, sound system, lighting',
        status: 'PENDING',
        assignedTo: ['team1', 'team2'],
        type: 'linear', // Linear session
        dependencies: []
      },
      {
        id: 'session2',
        name: 'Guest Arrival',
        startTime: '10:00',
        endTime: '12:00',
        description: 'Welcome guests, manage check-in',
        status: 'PENDING',
        assignedTo: ['team3'],
        type: 'linear', // Linear session
        dependencies: ['session1']
      },
      {
        id: 'session3',
        name: 'Main Event',
        startTime: '12:00',
        endTime: '16:00',
        description: 'Event execution and coordination',
        status: 'PENDING',
        assignedTo: ['organizer', 'team1', 'team2'],
        type: 'linear', // Linear session
        dependencies: ['session2']
      },
      {
        id: 'session4',
        name: 'Photography',
        startTime: '12:00',
        endTime: '16:00',
        description: 'Event photography and documentation',
        status: 'PENDING',
        assignedTo: ['vendor1'],
        type: 'concurrent', // Concurrent with Main Event
        dependencies: ['session2']
      },
      {
        id: 'session5',
        name: 'Catering Service',
        startTime: '12:00',
        endTime: '16:00',
        description: 'Food and beverage service',
        status: 'PENDING',
        assignedTo: ['vendor2'],
        type: 'concurrent', // Concurrent with Main Event
        dependencies: ['session2']
      },
      {
        id: 'session6',
        name: 'Cleanup & Closing',
        startTime: '16:00',
        endTime: '18:00',
        description: 'Venue cleanup, equipment return',
        status: 'PENDING',
        assignedTo: ['team1', 'team2', 'team3'],
        type: 'linear', // Linear session
        dependencies: ['session3', 'session4', 'session5']
      }
    ];
    
    setSessions(defaultSessions);
    setLoading(false);
  }, [eventId]);

  if (loading) {
    return <div className="agenda-loading">Loading agenda...</div>;
  }

  if (error) {
    return <div className="agenda-error">Error loading agenda: {error}</div>;
  }

  if (!checkEventDay()) {
    return null; // Only show on event day
  }

  return (
    <div className="event-day-agenda">
      {/* Notifications */}
      {notifications.map(notification => (
        <div key={notification.id} className="session-notification">
          <div className="notification-content">
            <span className="notification-icon">✅</span>
            <div className="notification-text">
              <strong>{notification.message}</strong>
              <small>{new Date(notification.timestamp).toLocaleTimeString()}</small>
            </div>
            <button 
              className="notification-close"
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            >
              ×
            </button>
          </div>
        </div>
      ))}

      <div className="agenda-header">
        <h3>Event Day Agenda</h3>
        <div className="agenda-summary">
          <span className="progress-text">
            {calculateProgress()}% Complete
          </span>
          <span className="session-count">
            {sessions.filter(s => s.status === 'COMPLETED').length} of {sessions.length} sessions
          </span>
        </div>
      </div>

      {/* Progress Bar with Gradual Filling */}
      <div className="agenda-progress">
        <div className="progress-container">
          {sessions.map((session, index) => (
            <div
              key={session.id}
              className={`progress-segment ${getSessionStatusClass(session.status)} ${session.type}`}
              style={getProgressSegmentStyle(session, index)}
              onClick={() => userRole === 'ORGANIZER' && session.status !== 'COMPLETED' && markSessionComplete(session.id)}
              title={userRole === 'ORGANIZER' ? 'Click to mark complete' : session.name}
            >
              <span className="segment-label">{session.name}</span>
              {session.type === 'concurrent' && (
                <span className="concurrent-indicator">⚡</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sessions List with Dependencies */}
      <div className="agenda-sessions">
        {sessions.map((session, index) => (
          <div key={session.id} className={`agenda-session ${getSessionStatusClass(session.status)} ${session.type}`}>
            <div className="session-header">
              <div className="session-time">
                <strong>{session.startTime}</strong>
                {session.endTime && ` - ${session.endTime}`}
              </div>
              <div className="session-status">
                <span className={`status-badge ${getSessionStatusClass(session.status)}`}>
                  {session.status.replace('_', ' ')}
                </span>
                <span className={`type-badge ${session.type}`}>
                  {session.type === 'concurrent' ? '⚡ Concurrent' : '📋 Linear'}
                </span>
              </div>
            </div>
            
            <div className="session-content">
              <h4>{session.name}</h4>
              <p className="session-description">{session.description}</p>
              
              {/* Dependencies */}
              {session.dependencies && session.dependencies.length > 0 && (
                <div className="session-dependencies">
                  <strong>Dependencies:</strong>
                  <div className="dependency-list">
                    {session.dependencies.map((depId, idx) => {
                      const depSession = sessions.find(s => s.id === depId);
                      return (
                        <span key={idx} className="dependency-item">
                          {depSession ? depSession.name : depId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {session.assignedTo && session.assignedTo.length > 0 && (
                <div className="session-assignments">
                  <strong>Assigned to:</strong>
                  <div className="assigned-users">
                    {session.assignedTo.map((userId, idx) => (
                      <span key={idx} className="assigned-user">
                        {userId.includes('vendor') ? 'Vendor' : 
                         userId.includes('organizer') ? 'Organizer' : 
                         `Team Member ${idx + 1}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Organizer Actions */}
            {userRole === 'ORGANIZER' && session.status !== 'COMPLETED' && (
              <div className="session-actions">
                <button 
                  className="btn-complete"
                  onClick={() => markSessionComplete(session.id)}
                  disabled={session.status === 'FAILED'}
                >
                  Mark Complete
                </button>
                {session.status === 'FAILED' && (
                  <button className="btn-retry">
                    Retry Session
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventDayAgenda;
