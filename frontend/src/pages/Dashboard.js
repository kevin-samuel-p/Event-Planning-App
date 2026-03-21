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

  // New state for enhanced features
  const [tasks, setTasks] = useState([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expandedTasks, setExpandedTasks] = useState(true);
  const [showDMPanel, setShowDMPanel] = useState(false);
  const [isEventDay, setIsEventDay] = useState(false);
  const [eventDayNotification, setEventDayNotification] = useState(null);

  // Determine user role for dashboard customization
  const getUserRole = () => {
    if (!user) return 'GUEST';
    if (user.role === 'ORGANIZER') return 'ORGANIZER';
    if (user.role === 'VENDOR') return 'VENDOR';
    if (user.role === 'TEAM_MEMBER') return 'TEAM_MEMBER';
    return 'GUEST'; // Default for regular users
  };

  const userRole = getUserRole();

  // Helper functions for enhanced features
  const getTaskPriority = (deadline) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(deadline);
    taskDate.setHours(0, 0, 0, 0);
    
    const diffTime = taskDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue'; // Red
    if (diffDays === 0) return 'today'; // Yellow
    if (diffDays <= 7) return 'this-week'; // Green
    return 'future'; // Gray
  };

  const getTaskPriorityClass = (deadline) => {
    const priority = getTaskPriority(deadline);
    switch (priority) {
      case 'overdue': return 'task-overdue';
      case 'today': return 'task-today';
      case 'this-week': return 'task-week';
      case 'future': return 'task-future';
      default: return 'task-future';
    }
  };

  const checkEventDay = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if any event is today
    const todayEvent = events.find(event => {
      const eventDate = new Date(event.eventDate);
      eventDate.setHours(0, 0, 0, 0);
      return today.toDateString() === eventDate.toDateString();
    });
    
    if (todayEvent) {
      if (!isEventDay) {
        setIsEventDay(true);
        setEventDayNotification({
          type: 'EVENT_STARTED',
          message: `Event "${todayEvent.eventName}" has started!`,
          eventId: todayEvent.id,
          timestamp: new Date()
        });
        
        // Clear notification after 5 seconds
        setTimeout(() => setEventDayNotification(null), 5000);
      }
    } else {
      setIsEventDay(false);
    }
  };

  const getTimelineData = () => {
    if (events.length === 0) return [];
    
    const allDates = [];
    events.forEach(event => {
      allDates.push({
        date: new Date(event.eventDate),
        type: 'event',
        title: event.eventName,
        id: event.id
      });
    });
    
    tasks.forEach(task => {
      allDates.push({
        date: new Date(task.deadline),
        type: 'task',
        title: task.taskName,
        id: task.id
      });
    });
    
    return allDates.sort((a, b) => a.date - b.date);
  };

  const handleMarkTaskDone = async (taskId) => {
    try {
      await eventAPI.updateTaskStatus(taskId, 'COMPLETED');
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: 'COMPLETED' } : task
      ));
    } catch (err) {
      console.error('Failed to mark task as done:', err);
    }
  };

  const toggleTaskExpansion = () => {
    setExpandedTasks(!expandedTasks);
  };

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
          case 'TEAM_MEMBER':
            eventsData = await eventAPI.getTeamEvents(); // Events team member is assigned to
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

    const fetchTasks = async () => {
      try {
        let tasksData;
        
        // Fetch tasks based on user role
        switch (userRole) {
          case 'ORGANIZER':
            tasksData = await eventAPI.getDelegatedTasks(); // All tasks delegated by organizer
            break;
          case 'VENDOR':
            tasksData = await eventAPI.getAssignedTasks(); // Tasks assigned to vendor
            break;
          case 'TEAM_MEMBER':
            tasksData = await eventAPI.getAssignedTasks(); // Tasks assigned to team member
            break;
          case 'GUEST':
          default:
            tasksData = []; // Guests have no tasks
            break;
        }
        
        setTasks(tasksData || []);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      }
    };

    fetchEvents();
    if (userRole !== 'GUEST') {
      fetchTasks();
    }
  }, [userRole]);

  // Check for event day every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkEventDay();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [events]);

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
        {/* Event Day Notification */}
        {eventDayNotification && (
          <div className="event-day-notification">
            <div className="notification-content">
              <span className="notification-icon">🎉</span>
              <div className="notification-text">
                <strong>{eventDayNotification.message}</strong>
                <small>{new Date(eventDayNotification.timestamp).toLocaleTimeString()}</small>
              </div>
              <button 
                className="notification-close"
                onClick={() => setEventDayNotification(null)}
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        <div className="header-content">
          <div className="user-info">
            <h2>
              {userRole === 'ORGANIZER' && 'Welcome, Event Organizer!'}
              {userRole === 'VENDOR' && 'Welcome, Vendor Partner!'}
              {userRole === 'TEAM_MEMBER' && 'Welcome, Team Member!'}
              {userRole === 'GUEST' && 'Welcome to Event Planner!'}
            </h2>
            <p className="user-role">
              {userRole === 'ORGANIZER' && 'Event Organizer'}
              {userRole === 'VENDOR' && 'Vendor Partner'}
              {userRole === 'TEAM_MEMBER' && 'Team Member'}
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
            
            {userRole === 'TEAM_MEMBER' && (
              <>
                <button 
                  className="header-btn" 
                  onClick={() => navigate('/my-tasks')}
                  title="My Tasks"
                >
                  �
                </button>
                <button 
                  className="header-btn" 
                  onClick={() => navigate('/team-events')}
                  title="Team Events"
                >
                  📅
                </button>
                <button 
                  className="header-btn" 
                  onClick={() => navigate('/team-chat')}
                  title="Team Chat"
                >
                  �
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
        <div className="dashboard-content">
          {/* Timeline Component */}
          {userRole !== 'GUEST' && events.length > 0 && (
            <div className="timeline-container">
              <div className="timeline-header">
                <h4>Event Timeline</h4>
                <button 
                  className="calendar-toggle-btn"
                  onClick={() => setShowCalendarModal(true)}
                  title="Open Calendar"
                >
                  📅
                </button>
              </div>
              <div className="timeline">
                <div className="timeline-line"></div>
                <div className="timeline-content">
                  {getTimelineData().map((item, index) => {
                    const position = (index / (getTimelineData().length - 1)) * 100;
                    const isToday = item.date.toDateString() === new Date().toDateString();
                    const isEventDay = item.type === 'event' && position >= 75 && position <= 80;
                    
                    return (
                      <div
                        key={item.id}
                        className={`timeline-point ${item.type} ${isToday ? 'today' : ''} ${isEventDay ? 'event-day' : ''}`}
                        style={{ left: `${position}%` }}
                        title={`${item.title} - ${item.date.toLocaleDateString()}`}
                      >
                        <div className="timeline-dot"></div>
                        <div className="timeline-tooltip">
                          <strong>{item.title}</strong>
                          <br />
                          {item.date.toLocaleDateString()}
                          {isToday && <span className="today-indicator">Today</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Left Column - Events */}
          <div className="dashboard-left">
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

            {userRole === 'TEAM_MEMBER' && (
              <div className="dashboard-section">
                <h3>Team Events</h3>
                {events.length === 0 ? (
                  <div className="no-events">
                    <p>No team events assigned yet.</p>
                    <button className="btn-primary" onClick={() => navigate('/team-dashboard')}>
                      View Team Dashboard
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
                        <p><strong>Your Role:</strong> Team Member</p>
                        <div className="event-actions">
                          <button 
                            className="btn-primary" 
                            onClick={() => handleViewEvent(event)}
                          >
                            View Details
                          </button>
                          <button 
                            className="btn-secondary" 
                            onClick={() => navigate(`/events/${event.id}/tasks`)}
                          >
                            My Tasks
                          </button>
                          {isEventDay && (
                            <button 
                              className="btn-agenda"
                              onClick={() => navigate(`/events/${event.id}/agenda`)}
                            >
                              View Agenda
                            </button>
                          )}
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
          </div>

          {/* Right Column - Todo List and DM Panel */}
          {userRole !== 'GUEST' && (
            <div className="dashboard-right">
              {/* Todo List */}
              <div className="todo-section">
                <div className="todo-header" onClick={toggleTaskExpansion}>
                  <h4>Tasks</h4>
                  <span className="todo-expand-icon">
                    {expandedTasks ? '▼' : '▶'}
                  </span>
                </div>
                {expandedTasks && (
                  <div className="todo-list">
                    {tasks.length === 0 ? (
                      <p className="no-tasks">No tasks assigned</p>
                    ) : (
                      tasks
                        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                        .slice(0, 6)
                        .map(task => (
                          <div key={task.id} className={`todo-item ${getTaskPriorityClass(task.deadline)}`}>
                            <div className="todo-content">
                              <div className="todo-info">
                                <strong>{task.taskName}</strong>
                                <small>{new Date(task.deadline).toLocaleDateString()}</small>
                              </div>
                              {userRole !== 'ORGANIZER' && task.status !== 'COMPLETED' && (
                                <button 
                                  className="todo-done-btn"
                                  onClick={() => handleMarkTaskDone(task.id)}
                                  title="Mark as Done"
                                >
                                  ✓
                                </button>
                              )}
                              {userRole === 'ORGANIZER' && (
                                <span className={`task-status ${task.status?.toLowerCase()}`}>
                                  {task.status || 'PENDING'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                    )}
                    {tasks.length > 6 && (
                      <button className="todo-expand-more" onClick={toggleTaskExpansion}>
                        {expandedTasks ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* DM Panel Placeholder */}
              <div className="dm-section">
                <div className="dm-header">
                  <h4>Messages</h4>
                </div>
                <div className="dm-placeholder">
                  <p>Direct messages will appear here</p>
                  <small>DM functionality coming soon...</small>
                </div>
              </div>
            </div>
          )}
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

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="modal-overlay" onClick={() => setShowCalendarModal(false)}>
          <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="calendar-header">
              <h3>Event Calendar</h3>
              <div className="calendar-nav">
                <button 
                  className="calendar-nav-btn"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                >
                  ‹
                </button>
                <span className="calendar-month">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button 
                  className="calendar-nav-btn"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                >
                  ›
                </button>
              </div>
              <button 
                className="modal-close-btn"
                onClick={() => setShowCalendarModal(false)}
              >
                ×
              </button>
            </div>
            <div className="calendar-grid">
              {/* Calendar days would be generated here */}
              <div className="calendar-placeholder">
                <p>Calendar view with event dates and task deadlines</p>
                <small>Full calendar implementation coming soon...</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
