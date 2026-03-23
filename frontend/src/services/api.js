// API service for Event Planning application
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const JWT_TOKEN_KEY = 'event_planning_token';

// Get stored JWT token
const getToken = () => {
  return localStorage.getItem(JWT_TOKEN_KEY);
};

// Store JWT token
const setToken = (token) => {
  localStorage.setItem(JWT_TOKEN_KEY, token);
};

// Remove JWT token
const removeToken = () => {
  localStorage.removeItem(JWT_TOKEN_KEY);
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor to include JWT token in requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    setToken(response.data.token);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    setToken(response.data.token);
    return response.data;
  },

  logout: () => {
    removeToken();
  }
};

// Event API calls
export const eventAPI = {
  getMyEvents: async () => {
    const response = await api.get('/events/my');
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  updateEvent: async (eventId, eventData) => {
    const response = await api.patch(`/events/${eventId}`, eventData);
    return response.data;
  },

  createBudget: async (eventId, budgetData) => {
    const response = await api.post(`/events/${eventId}/budget`, budgetData);
    return response.data;
  },

  getBudget: async (eventId) => {
    const response = await api.get(`/events/${eventId}/budget`);
    return response.data;
  },

  getPayments: async (budgetId) => {
    const response = await api.get(`/budgets/${budgetId}/payments`);
    return response.data;
  },

  addVendor: async (eventId, vendorData) => {
    const response = await api.post(`/events/${eventId}/vendors`, vendorData);
    return response.data;
  },

  getEventVendors: async (eventId) => {
    const response = await api.get(`/events/${eventId}/vendors`);
    return response.data;
  },

  getAllVendors: async () => {
    const response = await api.get('/vendor-directory');
    return response.data;
  },

  updateVendor: async (vendorId, vendorData) => {
    const response = await api.put(`/events/vendors/${vendorId}`, vendorData);
    return response.data;
  },

  getVendorDetails: async (vendorId) => {
    const response = await api.get(`/vendors/${vendorId}`);
    return response.data;
  },

  removeVendor: async (vendorId) => {
    const response = await api.delete(`/events/vendors/${vendorId}`);
    return response.data;
  },

  getTasks: async (eventId) => {
    const response = await api.get(`/events/${eventId}/tasks`);
    return response.data;
  },

  getAllTeamMembers: async () => {
    const response = await api.get('/team-members/list');
    return response.data;
  },

  createTask: async (eventId, taskData) => {
    const response = await api.post(`/events/${eventId}/tasks`, taskData);
    return response.data;
  },

  updateTaskStatus: async (taskId, statusData) => {
    const response = await api.patch(`/tasks/${taskId}/status`, statusData);
    return response.data;
  },

  // Missing functions - add them based on API endpoints
  getDelegatedTasks: async () => {
    const response = await api.get('/tasks/delegated');
    return response.data;
  },

  getAssignedTasks: async () => {
    const response = await api.get('/tasks/assigned');
    return response.data;
  },

  getVendorEvents: async () => {
    const response = await api.get('/events/vendor');
    return response.data;
  },

  getTeamEvents: async () => {
    const response = await api.get('/events/team');
    return response.data;
  },

  sendInvitation: async (eventId, invitationData) => {
    const response = await api.post(`/events/${eventId}/invitations`, invitationData);
    return response.data;
  },

  updateRsvp: async (invitationId, rsvpData) => {
    const response = await api.patch(`/invitations/${invitationId}/rsvp`, rsvpData);
    return response.data;
  },

  addPayment: async (budgetId, paymentData) => {
    const response = await api.post(`/budgets/${budgetId}/payments`, paymentData);
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('/notifications/me');
    return response.data;
  },

  markNotificationRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  submitFeedback: async (eventId, feedbackData) => {
    const response = await api.post(`/events/${eventId}/feedback`, feedbackData);
    return response.data;
  },

  completeEvent: async (eventId) => {
    const response = await api.post(`/events/${eventId}/complete`);
    return response.data;
  },

  getEventReport: async (eventId) => {
    const response = await api.get(`/events/${eventId}/report`);
    return response.data;
  }
};

// Chat API calls
export const chatAPI = {
  getEventGroupChat: async (eventId) => {
    const response = await api.get(`/group-chats/event/${eventId}`);
    return response.data;
  },

  getGroupChats: async () => {
    const response = await api.get('/group-chats');
    return response.data;
  },

  createGroupChat: async (chatData) => {
    const response = await api.post('/group-chats', chatData);
    return response.data;
  },

  joinGroupChat: async (joinData) => {
    const response = await api.post('/group-chats/join', joinData);
    return response.data;
  },

  getGroupChatMembers: async (groupChatId) => {
    const response = await api.get(`/group-chats/${groupChatId}/members`);
    return response.data;
  },

  addMemberToForum: async (forumId, userId) => {
    const response = await api.post(`/forums/${forumId}/members`, { userId });
    return response.data;
  },

  getForums: async (groupChatId) => {
    const response = await api.get(`/forums/group-chat/${groupChatId}`);
    return response.data;
  },

  createForum: async (forumData) => {
    const response = await api.post('/forums', forumData);
    return response.data;
  },

  sendGcMessage: async (messageData) => {
    const response = await api.post('/messages/gc', messageData);
    return response.data;
  },

  getForumMessages: async (forumId) => {
    const response = await api.get(`/messages/gc/forum/${forumId}`);
    return response.data;
  },

  createDirectMessage: async (messageData) => {
    const response = await api.post('/messages/direct', messageData);
    return response.data;
  },

  sendDmMessage: async (messageData) => {
    const response = await api.post('/messages/dm', messageData);
    return response.data;
  },

  getDirectMessages: async (dmId) => {
    const response = await api.get(`/messages/dm/${dmId}`);
    return response.data;
  }
};

export default api;
