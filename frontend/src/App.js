import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import EventDetails from './pages/EventDetails';
import BudgetManagement from './pages/BudgetManagement';
import TaskManagement from './pages/TaskManagement';
import VendorManagement from './pages/VendorManagement';
import VendorContact from './pages/VendorContact';
import InvitationManagement from './pages/InvitationManagement';
import ChatInterface from './pages/ChatInterface';
import Invitations from './pages/Invitations';
import Notifications from './pages/Notifications';
import './App.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/events/create" element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            } />
            <Route path="/events/:id/edit" element={
              <ProtectedRoute>
                <EditEvent />
              </ProtectedRoute>
            } />
            <Route path="/events/:id" element={
              <ProtectedRoute>
                <EventDetails />
              </ProtectedRoute>
            } />
            <Route path="/events/:id/budget" element={
              <ProtectedRoute>
                <BudgetManagement />
              </ProtectedRoute>
            } />
            <Route path="/events/:id/tasks" element={
              <ProtectedRoute>
                <TaskManagement />
              </ProtectedRoute>
            } />
            <Route path="/events/:id/vendors" element={
              <ProtectedRoute>
                <VendorManagement />
              </ProtectedRoute>
            } />
            <Route path="/vendor-contact/:vendorId" element={
              <ProtectedRoute>
                <VendorContact />
              </ProtectedRoute>
            } />
            <Route path="/events/:id/invitations" element={
              <ProtectedRoute>
                <InvitationManagement />
              </ProtectedRoute>
            } />
            <Route path="/events/:id/chat" element={
              <ProtectedRoute>
                <ChatInterface />
              </ProtectedRoute>
            } />
            <Route path="/invitations" element={
              <ProtectedRoute>
                <Invitations />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
