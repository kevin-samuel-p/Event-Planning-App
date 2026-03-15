# API Endpoints Documentation

This directory contains updated documentation for all backend API endpoints that match the current implementation.

## ✅ **Current Status - All Endpoints Working**

- **JWT Authentication:** ✅ Fixed and working
- **Database:** ✅ MySQL with sample data populated
- **Server:** ✅ Running on localhost:8080
- **All API Endpoints:** ✅ Tested and verified

## Files

- **auth_endpoints.txt** - Authentication endpoints (✅ Working)
- **event_endpoints_updated.txt** - Event management endpoints (✅ Updated & Working)
- **chat_endpoints_updated.txt** - Advanced chat system endpoints (✅ Updated & Working)
- **budget_endpoints.txt** - Budget management (✅ Working)
- **vendor_endpoints.txt** - Vendor management (✅ Working)
- **task_endpoints.txt** - Task management (✅ Working)
- **invitation_endpoints.txt** - Invitation system (✅ Working)
- **notification_endpoints.txt** - Notification system (✅ Working)
- **feedback_endpoints.txt** - Feedback system (✅ Working)

## Summary

### Authentication Endpoints (2 endpoints) ✅
- User registration - Working with JWT token generation
- User login - Working with valid JWT tokens

### Event Management Endpoints (15 endpoints) ✅
- Event CRUD operations - Working
- Budget management - Working  
- Vendor management - Working
- Task management - Working
- Invitation management - Working
- Payment tracking - Working
- Notifications - Working
- Feedback system - Working
- Event completion and reporting - Working

### Advanced Chat System Endpoints (10 endpoints) ✅
- Group Chat management (create, join, view members) - Working
- Forum management for topic-specific discussions - Working
- Group Chat messaging - Working
- Direct messaging between members - Working
- Message history retrieval - Working

## Total Endpoints: 27 ✅ All Working

All endpoints follow RESTful conventions and use standard HTTP methods (GET, POST, PATCH). The API base URL is `http://localhost:8080/api`.

## Authentication

All protected endpoints require JWT authentication:
- Include `Authorization: Bearer <token>` header
- Token obtained from `/api/auth/login` endpoint
- Tokens are valid for 1 hour

## Sample Data Available

The database is populated with sample data for testing:
- **Users:** alice@example.com (password: password123) - ORGANIZER
- **Events:** Summer Wedding Celebration, Corporate Annual Gala
- **Budgets, Vendors, Tasks, Chats, Forums, Messages**

## Chat System Features

The chat system provides:
- **Group Chats**: One per event with join codes
- **Forums**: Topic-specific discussion areas within group chats
- **Direct Messages**: Private conversations between group chat members
- **Real-time Messaging**: Send and receive messages in forums and DMs

## Frontend Development Ready

This API documentation is ready for frontend development with React:
- All endpoints tested and verified
- Sample requests and responses provided
- Authentication flow working
- Database populated with test data
- Clear endpoint specifications for React integration
