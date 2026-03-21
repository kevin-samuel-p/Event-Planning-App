import { useState, useEffect, useCallback } from 'react';
import eventDayService from '../services/EventDayService';

// Custom hook for event day coordination
export const useEventDay = (eventId, userRole) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isEventDay, setIsEventDay] = useState(false);

  // Check if today is event day
  const checkEventDay = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // This would be enhanced to check actual event date
    return today.toDateString() === new Date().toDateString();
  }, []);

  // Calculate progress from sessions
  const calculateProgress = useCallback((sessionList) => {
    if (!sessionList || sessionList.length === 0) return 0;
    const completedSessions = sessionList.filter(session => session.status === 'COMPLETED').length;
    return Math.round((completedSessions / sessionList.length) * 100);
  }, []);

  // Update session status (organizer action)
  const updateSessionStatus = useCallback(async (sessionId, newStatus) => {
    try {
      await eventDayService.updateSessionStatus(eventId, sessionId, newStatus);
    } catch (err) {
      setError(err.message);
    }
  }, [eventId]);

  // Mark session as complete
  const markSessionComplete = useCallback(async (sessionId) => {
    if (userRole === 'ORGANIZER') {
      await updateSessionStatus(sessionId, 'COMPLETED');
    }
  }, [userRole, updateSessionStatus]);

  // Get progress bar color
  const getProgressColor = useCallback(() => {
    if (progress === 100) return '#28a745'; // Green - fully completed
    if (sessions.some(session => session.status === 'FAILED')) return '#dc3545'; // Red - some sessions failed
    return '#ffc107'; // Yellow - in progress
  }, [progress, sessions]);

  // Get session status class
  const getSessionStatusClass = useCallback((status) => {
    switch (status) {
      case 'COMPLETED': return 'session-completed';
      case 'IN_PROGRESS': return 'session-in-progress';
      case 'FAILED': return 'session-failed';
      case 'PENDING': 
      default: return 'session-pending';
    }
  }, []);

  // Handle real-time updates
  const handleEventUpdate = useCallback((data) => {
    setSessions(data.sessions || []);
    setProgress(calculateProgress(data.sessions));
    setLoading(false);
    setError(null);
  }, [calculateProgress]);

  // Initialize and subscribe to real-time updates
  useEffect(() => {
    if (!eventId) return;

    setLoading(true);
    setError(null);

    // Subscribe to real-time updates
    eventDayService.subscribe(eventId, handleEventUpdate);

    // Check event day status
    const eventDayActive = checkEventDay();
    setIsEventDay(eventDayActive);

    // Initial fetch
    eventDayService.fetchEventUpdates(eventId);

    return () => {
      eventDayService.unsubscribe(eventId, handleEventUpdate);
    };
  }, [eventId, checkEventDay, handleEventUpdate]);

  return {
    // State
    sessions,
    loading,
    error,
    progress,
    isEventDay,
    
    // Actions
    updateSessionStatus,
    markSessionComplete,
    
    // Helpers
    getProgressColor,
    getSessionStatusClass,
    calculateProgress
  };
};
