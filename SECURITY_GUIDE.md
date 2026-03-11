# Security Configuration Guide

## 🔐 Password Security

✅ **Already Implemented:**
- Passwords are hashed using BCryptPasswordEncoder
- Encoded passwords stored in database
- Plain text passwords never stored

## 🔑 JWT Secret Key Protection

### ⚠️ Current Issue
- JWT secret was hardcoded in application.yml
- Risk of accidental exposure in version control

### ✅ Solution Implemented

**1. Environment Variable Support**
```yaml
app:
  jwt:
    secret: ${JWT_SECRET:change-me-to-a-very-long-secret-key-for-hs256-signing}
    expiration-minutes: ${JWT_EXPIRATION_MINUTES:180}
```

**2. .env File Support**
- Created `.env.example` with configuration template
- Added `.env` to `.gitignore` to prevent commits
- Supports multiple environment configurations

## 🛡️ Setup Instructions

### Step 1: Generate Strong JWT Secret
```bash
# Generate 256-bit base64 encoded secret
openssl rand -base64 32
# Or use online generator for HS256 keys
```

### Step 2: Create Environment File
```bash
# Copy template
cp .env.example .env

# Edit with your values
JWT_SECRET=your-generated-secret-here
JWT_EXPIRATION_MINUTES=180
```

### Step 3: Database Configuration (Optional)
```bash
# Override default H2 settings
DB_URL=jdbc:h2:mem:eventdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
DB_USERNAME=sa
DB_PASSWORD=your-db-password
```

## 🔒 Security Best Practices

### ✅ What's Already Secure
- **Password Hashing**: BCrypt with proper salt
- **JWT Tokens**: HMAC-SHA256 signing
- **Stateless Authentication**: No session fixation
- **Role-Based Access**: JWT claims include user roles
- **Input Validation**: Jakarta validation on all endpoints

### 📋 Additional Recommendations

**1. Production Environment**
```bash
# Use environment-specific configs
export JWT_SECRET=$(openssl rand -base64 32)
export DB_PASSWORD=strong-production-password
```

**2. Secret Rotation**
- Rotate JWT secrets periodically
- Implement token refresh mechanism
- Consider shorter expiration for sensitive operations

**3. Additional Security Headers**
```java
// Add to SecurityConfig.java
.headers(headers -> headers
    .frameOptions(frame -> frame.deny())
    .contentTypeOptions(options -> options.disable())
    .httpStrictTransportSecurity(hsts -> hsts
        .maxAgeInSeconds(31536000)
        .includeSubDomains(true))
)
```

**4. Rate Limiting**
```java
// Consider adding bucket4j for API rate limiting
implementation 'com.github.vladimir-bukhtoyarov:bucket4j-spring-boot-starter:7.6.0'
```

## 🚨 Security Warnings

### Current State
- ✅ Passwords properly hashed
- ✅ JWT secret now externalized
- ✅ Environment variables supported
- ⚠️ Using H2 in-memory (development only)
- ⚠️ No HTTPS enforcement
- ⚠️ No rate limiting implemented

### Production Checklist
- [ ] Use PostgreSQL/MySQL instead of H2
- [ ] Configure HTTPS with valid certificates
- [ ] Implement rate limiting
- [ ] Add CSRF protection for web interfaces
- [ ] Set up security monitoring
- [ ] Regular security audits
- [ ] Secret rotation procedures

## 🔍 Verification

### Test Your Security Setup
```bash
# 1. Check JWT token generation
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# 2. Verify Bearer token usage
curl -X GET http://localhost:8080/api/events/my \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Test invalid token rejection
curl -X GET http://localhost:8080/api/events/my \
  -H "Authorization: Bearer INVALID_TOKEN"
```

Your authentication system is now properly secured with environment-based configuration!
