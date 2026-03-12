# Sample Data Population Scripts

## 🚀 Quick Start

### Prerequisites
- Spring Boot application running on `localhost:8080`
- Python 3.7+ installed
- pip package manager

### Setup
```bash
# Navigate to scripts directory
cd scripts

# Install dependencies
pip install -r requirements.txt

# Or install manually
pip install requests faker
```

### Run Sample Data Script
```bash
python populate_sample_data.py
```

## 📊 What Gets Created

### 👥 Users (10 total)
- **Organizers (2)**: alice@example.com, bob@example.com
- **Vendors (3)**: catering@example.com, photo@example.com, music@example.com  
- **Team Members (2)**: charlie@example.com, diana@example.com
- **Guests (3)**: eve@example.com, frank@example.com, grace@example.com

**All users use password: `password123`**

### 🎉 Events (2 total)
- Summer Wedding Celebration
- Corporate Annual Gala

### 💬 Chat System
- **Group Chats**: 1 per event
- **Forums**: 3 per group chat (General, Venue, Vendor)
- **Members**: Multiple users joined per chat
- **Messages**: Sample messages in each forum

### 💰 Budgets & Vendors
- **Budgets**: 1 per event ($5,000-$20,000)
- **Vendors**: 2 per event from available vendors

## 🗄️ Database Persistence

### Current Setup (Development)
```
Database: H2 In-Memory
Persistence: ❌ Volatile (wiped on JVM restart)
Location: Memory only
```

### Data Lifecycle
- ✅ **Data survives**: Application restarts (same JVM session)
- ❌ **Data lost**: JVM shutdown/restart
- ✅ **Easy reset**: Stop/start Spring Boot app

### Production Recommendation
```yaml
# application.yml (Production)
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/eventplanning
    username: ${DB_USERNAME:eventuser}
    password: ${DB_PASSWORD:strongpassword}
  jpa:
    hibernate:
      ddl-auto: validate  # Use migrations in production
```

## 🔧 Customization

### Modify Sample Data
Edit `populate_sample_data.py`:
```python
# Change user count
organizer1 = self.register_user("Your Name", "your@email.com", "password123", "ORGANIZER")

# Change event details
event1 = self.create_event(organizer_token, {
    "eventName": "Your Custom Event",
    "eventDate": "2026-12-25",
    "venue": "Your Venue",
    "eventType": "Custom"
})
```

### Add More Data Types
```python
def create_task(self, token, event_id, task_data):
    # Add task creation logic
    pass

def send_invitation(self, token, event_id, guest_id):
    # Add invitation logic  
    pass
```

## 🐛 Troubleshooting

### Common Issues

**Server Not Running**
```bash
❌ Cannot connect to server
# Solution: Start Spring Boot application first
mvn spring-boot:run
```

**Port Conflicts**
```bash
❌ Connection refused
# Solution: Check if port 8080 is available
netstat -an | grep 8080
```

**Authentication Issues**
```bash
❌ Failed to login
# Solution: Check JWT secret in application.yml
# Ensure JWT_SECRET is set or using fallback
```

**Database Issues**
```bash
❌ User already exists
# Solution: Stop/start Spring Boot app to reset H2 database
```

### Debug Mode
```python
# Add to populate_sample_data.py for debugging
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📝 API Testing Ready

After running the script, you'll have:
- ✅ 10 users with different roles
- ✅ 2 events with budgets and vendors  
- ✅ Complete chat system setup
- ✅ JWT tokens available for testing
- ✅ Perfect foundation for Postman testing

**Next Steps:**
1. Run the population script
2. Test login with any user (password: password123)
3. Import the Postman collection
4. Start API testing!

## 🔄 Reset Data

To reset all sample data:
```bash
# Stop Spring Boot application
# Start it again - H2 database will be empty
# Run the population script again
python populate_sample_data.py
```
