# MySQL Database Setup Instructions

## Quick Setup

### 1. Create the .env file
You need to create the `.env` file manually in the project root with your MySQL credentials:

```env
# JWT Configuration
JWT_SECRET=mySuperSecretKeyForJWTTokenGenerationThatIsLongEnoughForHS256Algorithm
JWT_EXPIRATION_MINUTES=180

# MySQL Database Configuration
DB_URL=jdbc:mysql://localhost:3306/event_planning_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=your_mysql_password_here

# Server Configuration
SERVER_PORT=8080
```

### 2. Create MySQL Database
Run this SQL command in MySQL:
```sql
CREATE DATABASE IF NOT EXISTS event_planning_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

### 3. Test Connection
After creating the `.env` file, run:
```bash
cd backend
mvn spring-boot:run
```

## Common Issues & Solutions

### Connection Refused
- Make sure MySQL server is running on port 3306
- Check if MySQL service is started
- Verify firewall isn't blocking port 3306

### Authentication Failed
- Update `DB_PASSWORD` in `.env` with your actual MySQL password
- Ensure MySQL user has privileges to create databases
- Try using `root` user initially

### Database Not Found
- Run the database creation SQL command
- Check database name in `.env` matches created database
- Verify MySQL user has access to the database

### SSL/Timezone Issues
- The connection string includes `useSSL=false` for local development
- `serverTimezone=UTC` prevents timezone conflicts
- For production, use proper SSL certificates

## Verification
Once running, you should see:
- Spring Boot banner
- Database connection logs
- Application starting on port 8080
- No HikariCP connection errors

Then test with:
```bash
cd scripts
python populate_sample_data.py
```
