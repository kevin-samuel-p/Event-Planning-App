# MySQL Database Migration Guide

## Prerequisites
1. MySQL Server installed and running on port 3306
2. MySQL command line client or GUI tool (like MySQL Workbench, DBeaver, or HeidiSQL)

## Setup Steps

### 1. Create Database
Run the provided MySQL setup script:
```bash
mysql -u root -p < database/mysql_setup.sql
```

Or execute these commands manually in MySQL:
```sql
CREATE DATABASE IF NOT EXISTS event_planning_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

### 2. Configure Environment Variables
Copy the example environment file and update it:
```bash
cp .env.example .env
```

Edit `.env` file with your MySQL credentials:
```env
# MySQL Database Configuration
DB_URL=jdbc:mysql://localhost:3306/event_planning_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=your_actual_mysql_password
```

### 3. Optional: Create Dedicated Database User
For better security, create a dedicated user:
```sql
CREATE USER 'event_user'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON event_planning_db.* TO 'event_user'@'localhost';
FLUSH PRIVILEGES;
```

Then update your `.env`:
```env
DB_USERNAME=event_user
DB_PASSWORD=your_password_here
```

### 4. Run the Application
```bash
cd backend
mvn spring-boot:run
```

The application will:
- Connect to MySQL database
- Auto-create tables using Hibernate (ddl-auto: update)
- Start on port 8080

### 5. Test with Sample Data
```bash
cd scripts
python populate_sample_data.py
```

## Migration Notes

### Differences from H2
- **Persistence**: Data persists between application restarts
- **Performance**: Better for production use
- **Tools**: Can use MySQL GUI tools for database management
- **Backups**: Standard MySQL backup procedures apply

### Troubleshooting

#### Connection Issues
- Ensure MySQL server is running on port 3306
- Check firewall settings
- Verify database name and credentials in `.env`

#### Schema Issues
- Hibernate will auto-create/update tables
- For manual schema changes, update entities or use SQL scripts
- Check MySQL logs for any errors

#### Performance
- Consider adding connection pool configuration
- Monitor MySQL performance metrics
- Add indexes for frequently queried columns

## Production Considerations
- Use SSL connections in production
- Set up proper database backups
- Configure connection pooling
- Use environment-specific configuration files
- Consider using MySQL's performance schema for monitoring
