# MySQL Data Population Guide

## Quick Start

### 1. Install Dependencies
```bash
cd scripts
pip install -r requirements_mysql.txt
```

### 2. Set MySQL Password (Optional)
Set environment variable or enter when prompted:
```bash
# Option 1: Set environment variable
export MYSQL_PASSWORD=your_mysql_password

# Option 2: Script will prompt for password
python populate_sample_data_mysql.py
```

### 3. Run the Script
```bash
cd scripts
python populate_sample_data_mysql.py
```

## What the Script Does

The script directly inserts data into MySQL using SQL queries:

### 1. **Users Table**
- 10 sample users with different roles
- Passwords are hashed using SHA-256
- All users use password: `password123`

### 2. **Events Table**
- 2 sample events created by organizers
- Future dates (30 and 60 days from now)
- Different venues and event types

### 3. **Budgets Table**
- Random budgets between $5,000-$20,000
- One budget per event

### 4. **Event Vendors Table**
- Links vendors to events
- Random service types and contract status

### 5. **Group Chats Table**
- One group chat per event
- Auto-generated join codes

### 6. **Forums Table**
- 3 forums per group chat
- Different discussion topics

### 7. **Forum Messages Table**
- Sample messages in each forum
- Sent by organizer users

## Database Schema Used

The script expects these tables (auto-created by Hibernate):
```sql
users (id, name, email, phone, password, role, created_at, updated_at)
events (id, title, description, event_date, location, organizer_id, created_at, updated_at)
budgets (id, event_id, total_budget, allocated_budget, spent_amount, created_at, updated_at)
event_vendors (id, event_id, vendor_id, service_type, contract_status, created_at, updated_at)
group_chats (id, gc_name, join_code, event_id, created_at, updated_at)
forums (id, forum_name, group_chat_id, created_at, updated_at)
forum_messages (id, forum_id, sender_id, message, created_at, updated_at)
```

## Troubleshooting

### Connection Issues
- **Access denied**: Check MySQL password
- **Database not found**: Create database first
- **Port issues**: Ensure MySQL runs on port 3306

### Table Issues
- **Table doesn't exist**: Start the Spring Boot app first to create tables
- **Column mismatch**: Check entity definitions match database schema

### Data Issues
- **Duplicate entries**: Script creates fresh data each run
- **Foreign key errors**: Ensure users are created before events

## Benefits of Direct MySQL Approach

### ✅ **Advantages**
- **No JWT required** - Bypasses authentication issues
- **Much faster** - Direct SQL instead of HTTP calls
- **Reliable** - No network or API errors
- **Bulk operations** - Can insert many records quickly
- **Transaction control** - Rollback on errors

### 🔄 **Comparison with API Method**

| Feature | API Method | MySQL Method |
|---------|------------|--------------|
| Speed | Slow (HTTP calls) | Fast (direct SQL) |
| Reliability | Network dependent | Database dependent |
| Authentication | JWT tokens required | No auth needed |
| Error handling | HTTP status codes | Database errors |
| Debugging | API logs | SQL logs |
| Setup | Requires running app | Just database |

## Sample Data Created

### Users (10 total)
- **Organizers**: Alice Johnson, Bob Smith
- **Vendors**: Catering Co, Photo Studio, Music Band  
- **Team Members**: Charlie Davis, Diana Wilson
- **Guests**: Eve Brown, Frank Miller, Grace Lee

### Events (2 total)
- Summer Wedding Celebration (30 days from now)
- Corporate Annual Gala (60 days from now)

### Per Event
- 1 budget ($5,000-$20,000)
- 2 vendors
- 1 group chat
- 3 forums
- 15+ messages

## Testing the Data

After running the script, you can:
1. Start the Spring Boot application
2. Login with any user (password: password123)
3. View events, chats, and forums
4. Test API endpoints with real data
