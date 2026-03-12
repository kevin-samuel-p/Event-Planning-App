# Postman API Testing Collection

## 🚀 Complete API Test Suite

This Postman collection provides comprehensive testing for all Event Planning API endpoints including JWT authentication, event management, and the advanced chat system.

## 📋 Collection Structure

### 🔐 Authentication (8 requests)
- Register users for each role (Organizer, Vendor, Team Member, Guest)
- Login for each user type
- Automatic token storage and management

### 🎉 Event Management (15 requests)
- Create events (Wedding, Corporate)
- Create budgets
- Add vendors and tasks
- Send invitations and manage RSVPs
- Process payments
- Submit feedback
- Generate reports

### 💬 Advanced Chat System (20 requests)
- Create and join group chats
- Manage attributes (ABAC)
- Create forums
- Send forum messages
- Create and manage direct messages
- Complete chat workflow testing

### 📢 Notifications & Health (3 requests)
- Get notifications
- Mark notifications as read
- Health check endpoint

## 🛠️ Setup Instructions

### 1. Import Collection
1. Open Postman
2. Click "Import" → "Select File"
3. Choose `Event_Planning_API.postman_collection.json`
4. The collection will import with all folders and requests

### 2. Environment Variables
The collection uses automatic variable management:
- `base_url`: `http://localhost:8080/api` (auto-set)
- `*_token`: JWT tokens for each user type (auto-set)
- `*_id`: Entity IDs (events, budgets, tasks, etc.) (auto-set)
- `*_join_code`: Group chat join codes (auto-set)

### 3. Prerequisites
- Spring Boot application running on `localhost:8080`
- H2 database accessible (optional: run Python script first)
- No additional environment setup needed

## 🎯 Testing Workflow

### Phase 1: Authentication
1. Run all requests in **🔐 Authentication** folder
2. This creates users and stores their tokens
3. Tokens automatically used in subsequent requests

### Phase 2: Event Management
1. Run requests in **🎉 Event Management** folder sequentially
2. Events, budgets, vendors, tasks created automatically
3. IDs stored for chat system testing

### Phase 3: Chat System
1. Run requests in **💬 Advanced Chat System** folder
2. Creates group chats, forums, attributes
3. Tests complete messaging workflow

### Phase 4: Notifications
1. Run **📢 Notifications & Health** requests
2. Tests notification system and health check

## 🧪 Test Features

### ✅ Automated Testing
Each request includes test scripts that verify:
- HTTP status codes
- Response structure validation
- Required field presence
- Data type validation

### 🔄 Variable Management
- Automatic token storage after successful login
- Entity ID capture after creation
- Join code storage for group chats
- Cross-request data sharing

### 📊 Comprehensive Coverage
- All 28 API endpoints tested
- Multiple user roles tested
- Error scenarios covered
- Real-world data flows

## 📝 Request Details

### Authentication Tests
```http
POST /auth/register
POST /auth/login
```
- Tests all user roles
- Validates JWT token generation
- Stores tokens for future requests

### Event Management Tests
```http
POST /events
POST /events/{id}/budget
POST /events/{id}/vendors
POST /events/{id}/tasks
PATCH /tasks/{id}/status
POST /events/{id}/invitations
PATCH /invitations/{id}/rsvp
POST /budgets/{id}/payments
POST /events/{id}/feedback
POST /events/{id}/complete
GET /events/{id}/report
```

### Chat System Tests
```http
POST /group-chats
POST /group-chats/join
GET /group-chats/{id}/members
POST /attributes
POST /attributes/assign
POST /forums
GET /forums/group-chat/{id}
POST /messages/gc
GET /messages/gc/forum/{id}
POST /messages/direct
POST /messages/dm
GET /messages/dm/{id}
```

## 🔍 Test Scenarios

### ✅ Success Cases
- User registration and login
- Event creation and management
- Budget and payment processing
- Chat system full workflow
- Direct messaging between users

### 🧪 Data Validation
- Email uniqueness validation
- Budget constraint checking
- Role-based access control
- Chat membership verification
- Message threading

### 🔄 State Testing
- Task status transitions
- RSVP status changes
- Payment status updates
- Notification read/unread states

## 📊 Expected Results

### After Full Test Run
- **Users Created**: 4 (Organizer, Vendor, Team Member, Guest)
- **Events Created**: 2 (Wedding, Corporate)
- **Group Chats**: 2 (one per event)
- **Forums**: 6 (3 per group chat)
- **Messages**: Multiple forum and direct messages
- **Tasks**: Created and status updated
- **Payments**: Processed with budget validation

### Database State
You can verify the test results in H2 console:
- Users table: 4+ records
- Events table: 2 records
- Group chats: 2 records
- Forums: 6 records
- Messages: Multiple records

## 🚨 Troubleshooting

### Common Issues

**401 Unauthorized**
```bash
# Check if tokens are stored
# Run authentication requests first
# Verify server JWT secret matches
```

**404 Not Found**
```bash
# Check if entity IDs are set
# Run prerequisite requests first
# Verify entity creation succeeded
```

**400 Bad Request**
```bash
# Check request body format
# Verify required fields
# Check data types and constraints
```

**500 Server Error**
```bash
# Check server logs
# Verify database connectivity
# Check for constraint violations
```

### Debug Mode
Enable Postman console to see:
- Request details
- Response headers
- Variable values
- Test results

## 🔧 Customization

### Modify Test Data
Edit request bodies in the collection:
```json
{
    "eventName": "Your Custom Event",
    "eventDate": "2026-12-25",
    "venue": "Custom Venue"
}
```

### Add New Tests
1. Duplicate existing request
2. Modify endpoint and body
3. Add test scripts as needed
4. Update variable references

### Environment Changes
```javascript
// In collection variables
base_url: "http://your-server:port/api"
```

## 📈 Performance Testing

### Load Testing
- Use Postman Runner for bulk testing
- Adjust iteration counts
- Monitor response times
- Check for race conditions

### Concurrent Testing
- Test multiple users simultaneously
- Verify chat message ordering
- Check database consistency

## 🎉 Next Steps

After successful testing:
1. **API Documentation**: Update based on test results
2. **Frontend Integration**: Use validated endpoints
3. **Production Setup**: Configure real database
4. **Monitoring**: Add health checks and logging
5. **Security**: Implement rate limiting and monitoring

This collection provides a complete foundation for API validation and frontend development! 🚀
