# Population Script Troubleshooting Guide

## 🚨 Common Issues and Solutions

### ❌ "Server is not responding" Error

**Problem:** Script can't connect to the Spring Boot application

**Solutions:**

1. **Check if Spring Boot is running:**
   ```bash
   # In backend directory
   mvn spring-boot:run
   
   # Look for output like:
   # Started EventPlanningBackendApplication in 2.5 seconds
   ```

2. **Verify the port:**
   ```bash
   # Check if port 8080 is in use
   netstat -an | grep 8080
   
   # Or check with curl
   curl http://localhost:8080
   ```

3. **Check application.yml configuration:**
   ```yaml
   server:
     port: 8080  # Make sure this matches
   ```

### ❌ 401/403 Unauthorized Errors

**Problem:** Health endpoint requires authentication

**Solutions:**

1. **Add actuator dependency** (already fixed):
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-actuator</artifactId>
   </dependency>
   ```

2. **Restart the application** after adding the dependency:
   ```bash
   # Stop the app (Ctrl+C)
   # Restart with:
   mvn spring-boot:run
   ```

3. **Check security configuration:**
   ```java
   // In SecurityConfig.java, ensure this line exists:
   .requestMatchers(HttpMethod.GET, "/actuator/health").permitAll()
   ```

### ❌ 500 Internal Server Error

**Problem:** Actuator not properly configured

**Solutions:**

1. **Add actuator configuration to application.yml:**
   ```yaml
   management:
     endpoints:
       web:
         exposure:
           include: health,info
     endpoint:
       health:
         show-details: always
   ```

2. **Recompile and restart:**
   ```bash
   mvn clean compile
   mvn spring-boot:run
   ```

### ❌ Connection Refused

**Problem:** Application not running or wrong port

**Solutions:**

1. **Check if application started successfully:**
   ```bash
   # Look for these logs:
   # Tomcat started on port(s): 8080 (http)
   # Started EventPlanningBackendApplication
   ```

2. **Check for port conflicts:**
   ```bash
   # Change port in application.yml if needed:
   server:
     port: 8081  # Use different port
   ```

3. **Check firewall/antivirus blocking:**
   - Temporarily disable firewall
   - Add exception for port 8080

### ❌ Python Script Errors

**Problem:** Missing dependencies or Python issues

**Solutions:**

1. **Install required packages:**
   ```bash
   cd scripts
   pip install -r requirements.txt
   
   # Or manually:
   pip install requests==2.32.4 faker==40.4.0
   ```

2. **Check Python version:**
   ```bash
   python --version  # Should be 3.7+
   ```

3. **Run with verbose output:**
   ```bash
   python -v populate_sample_data.py
   ```

## 🔧 Debugging Steps

### Step 1: Manual Health Check
```bash
# Try without /api prefix
curl http://localhost:8080/actuator/health

# Try with /api prefix
curl http://localhost:8080/api/actuator/health

# Try basic server check
curl http://localhost:8080
```

### Step 2: Check Application Logs
Look for these important messages:
```
✅ Started EventPlanningBackendApplication
✅ Tomcat started on port(s): 8080
✅ H2 console available at /h2-console
❌ Failed to start bean 'actuatorEndpoint'
❌ Connection refused to database
```

### Step 3: Test Authentication Endpoint
```bash
# Test if auth endpoints work
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass123","role":"ORGANIZER"}'
```

### Step 4: Database Connection Check
```bash
# Access H2 console
# URL: http://localhost:8080/h2-console
# JDBC URL: jdbc:h2:mem:eventdb
# Username: sa
# Password: (leave blank)
```

## 🚀 Quick Fix Checklist

1. **Restart Spring Boot application**
   ```bash
   cd backend
   mvn clean spring-boot:run
   ```

2. **Wait for full startup** (look for "Started" message)

3. **Run population script**
   ```bash
   cd scripts
   python populate_sample_data.py
   ```

4. **If still failing, check:**
   - Port conflicts
   - Firewall blocking
   - Java version compatibility
   - Maven dependencies

## 📞 Getting Help

If issues persist:

1. **Share the error message** from the script
2. **Share application startup logs**
3. **Check if other endpoints work** (try auth registration)
4. **Verify H2 console access** at `http://localhost:8080/h2-console`

## 🎯 Success Indicators

When everything works, you should see:
```
🔍 Checking server at: http://localhost:8080/api/actuator/health
✅ Server is responding at http://localhost:8080/api/actuator/health
🚀 Starting sample data population...

📝 Creating Users...
✅ Registered ORGANIZER: Alice Johnson (alice@example.com)
✅ Registered VENDOR: Catering Co (catering@example.com)
...
🎊 Sample Data Population Complete!
```
