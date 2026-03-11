# API Endpoints Documentation

This directory contains documentation for all backend API endpoints discovered in the `backend/src` directory.

## Files

- **auth_endpoints.txt** - Authentication and authorization endpoints
- **event_endpoints.txt** - Event management and workflow endpoints
- **chat_endpoints.txt** - Advanced chat system with Group Chat, Forums, Attributes, and Direct Messages

## Summary

### Authentication Endpoints (2 endpoints)
- User registration
- User login

### Event Management Endpoints (15 endpoints)
- Event CRUD operations
- Budget management
- Vendor management
- Task management
- Invitation management
- Payment tracking
- Notifications
- Feedback system
- Event completion and reporting

### Advanced Chat System Endpoints (11 endpoints)
- Group Chat management (create, join, view members)
- Attribute-Based Access Control (ABAC) system
- Forum management for topic-specific discussions
- Group Chat messaging
- Direct messaging between members
- Configurable permissions and attributes

## Total Endpoints: 28

All endpoints follow RESTful conventions and use standard HTTP methods (GET, POST, PATCH). The API base URL is `http://localhost:8080/api`.

## Chat System Features

The new chat system replaces the old simple chat with:
- **Group Chats**: One per event with join codes
- **Forums**: Topic-specific discussion areas within group chats
- **Attributes**: Configurable permissions for ABAC (Attribute-Based Access Control)
- **Direct Messages**: Private conversations between group chat members
- **Flexible Permissions**: Organizers can configure attributes and assign them to members
