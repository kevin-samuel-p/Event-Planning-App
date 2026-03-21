// Real-time Event Day Service for coordination
class EventDayService {
  constructor() {
    this.subscribers = new Map();
    this.pollingIntervals = new Map();
    this.eventDayStatus = new Map();
  }

  // Subscribe to real-time updates for a specific event
  subscribe(eventId, callback) {
    if (!this.subscribers.has(eventId)) {
      this.subscribers.set(eventId, new Set());
    }
    this.subscribers.get(eventId).add(callback);

    // Start polling for this event if not already started
    if (!this.pollingIntervals.has(eventId)) {
      this.startPolling(eventId);
    }
  }

  // Unsubscribe from updates
  unsubscribe(eventId, callback) {
    if (this.subscribers.has(eventId)) {
      this.subscribers.get(eventId).delete(callback);
      
      // Stop polling if no more subscribers
      if (this.subscribers.get(eventId).size === 0) {
        this.stopPolling(eventId);
      }
    }
  }

  // Start polling for event updates
  startPolling(eventId) {
    const interval = setInterval(async () => {
      await this.fetchEventUpdates(eventId);
    }, 5000); // Poll every 5 seconds

    this.pollingIntervals.set(eventId, interval);
  }

  // Stop polling for event
  stopPolling(eventId) {
    if (this.pollingIntervals.has(eventId)) {
      clearInterval(this.pollingIntervals.get(eventId));
      this.pollingIntervals.delete(eventId);
    }
  }

  // Fetch event updates from backend
  async fetchEventUpdates(eventId) {
    try {
      // This would be replaced with actual API call
      const response = await fetch(`/api/events/${eventId}/agenda`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch event updates');
      }

      const data = await response.json();
      
      // Update local status and notify subscribers
      this.eventDayStatus.set(eventId, {
        sessions: data.sessions,
        lastUpdated: new Date(),
        progress: this.calculateProgress(data.sessions)
      });

      this.notifySubscribers(eventId, data);
    } catch (error) {
      console.error('Failed to fetch event updates:', error);
    }
  }

  // Calculate progress from sessions
  calculateProgress(sessions) {
    if (!sessions || sessions.length === 0) return 0;
    const completedSessions = sessions.filter(session => session.status === 'COMPLETED').length;
    return Math.round((completedSessions / sessions.length) * 100);
  }

  // Notify all subscribers of updates
  notifySubscribers(eventId, data) {
    if (this.subscribers.has(eventId)) {
      this.subscribers.get(eventId).forEach(callback => {
        callback(data);
      });
    }
  }

  // Update session status (organizer action)
  async updateSessionStatus(eventId, sessionId, newStatus) {
    try {
      const response = await fetch(`/api/events/${eventId}/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update session status');
      }

      const updatedData = await response.json();
      
      // Update local cache and notify subscribers
      const currentStatus = this.eventDayStatus.get(eventId);
      if (currentStatus) {
        const updatedSessions = currentStatus.sessions.map(session =>
          session.id === sessionId ? { ...session, status: newStatus } : session
        );
        
        this.eventDayStatus.set(eventId, {
          ...currentStatus,
          sessions: updatedSessions,
          lastUpdated: new Date(),
          progress: this.calculateProgress(updatedSessions)
        });
      }

      this.notifySubscribers(eventId, updatedData);
    } catch (error) {
      console.error('Failed to update session status:', error);
      throw error;
    }
  }

  // Get cached event status
  getEventStatus(eventId) {
    return this.eventDayStatus.get(eventId);
  }

  // Check if event day is active
  isEventDayActive(eventId) {
    const status = this.eventDayStatus.get(eventId);
    return status && status.isEventDay;
  }

  // Cleanup all subscriptions and intervals
  cleanup() {
    // Clear all polling intervals
    this.pollingIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.pollingIntervals.clear();

    // Clear all subscribers
    this.subscribers.clear();
    this.eventDayStatus.clear();
  }
}

// Create singleton instance
const eventDayService = new EventDayService();

export default eventDayService;
