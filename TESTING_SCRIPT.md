# 🧪 **RentVerse - Complete Testing Script**

## 🎯 **Overview**
This comprehensive testing script verifies all 6 security modules and core functionality of the RentVerse platform.

**Estimated Time:** 45-60 minutes  
**Requirements:** All services running, database seeded

---

## 📋 **Pre-Testing Checklist**

### ✅ **Environment Setup**
- [ ] PostgreSQL database running
- [ ] Redis server running (optional)
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database migrated and seeded

### ✅ **Services Status**
```bash
# Check if services are running
curl http://localhost:3000/health
curl http://localhost:3001/api/health  # If available
```

---
🔍 Troubleshooting Port Conflicts:
Check What's Using a Port:
# Check specific port
netstat -ano | findstr :3001

# Check all our ports
netstat -ano | findstr "3000\|3001\|8000"

Kill Process Using Port:
# Kill by PID (replace XXXX with actual PID)
taskkill /PID XXXX /F

# Or kill all Node.js processes
taskkill /IM node.exe /F

## 🚀 **PHASE 1: System Setup & Health Checks**

### **Step 1.1: Start All Services**
```bash
# Terminal 1: Backend API Server
cd rentverse-backend
npm run dev

# Terminal 2: Frontend Application
cd rentverse-frontend
npm run dev

# Terminal 3: AI Service (Optional)
cd rentverse-ai-service
python -m rentverse.cli serve
```

### **Step 1.2: Verify Service Health**
```bash
# Test Backend Health
curl http://localhost:3000/health

# Expected Response:
{
  "status": "OK",
  "timestamp": "2025-12-13T...",
  "database": "Connected",
  "uptime": 123.45,
  "environment": "development"
}
```

### **Step 1.3: Check API Documentation**
- Open: http://localhost:3000/docs
- Verify Swagger UI loads
- Check all endpoints are documented

---

## 🔐 **PHASE 2: Module 1 - Authentication & MFA**

### **Step 2.1: Test User Registration**
```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Expected: 201 Created with user data and token
```

### **Step 2.2: Test Login with MFA**
```bash
# Step 1: Login (triggers OTP)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rentverse.com",
    "password": "password123"
  }'

# Expected: Check console/terminal for OTP code
# Response should include: "requireOTP": true
```

### **Step 2.3: Verify OTP**
```bash
# Step 2: Verify OTP (replace XXX with actual OTP from console)
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rentverse.com",
    "otp": "XXX"
  }'

# Expected: 200 OK with user data and JWT token
# Save the token for subsequent tests
```

### **Step 2.4: Test User Profile Access**
```bash
# Use token from previous step
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/auth/me

# Expected: 200 OK with user profile data
```

### **Step 2.5: Test Activity Logging**
```bash
# Check activity logs (Admin only)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:3000/api/auth/activity-logs

# Expected: Array of activity log entries
```

---

## 🛡️ **PHASE 3: Module 2 - API Gateway & Rate Limiting**

### **Step 3.1: Test Rate Limiting**
```bash
# Test rate limiting (should fail after 100 requests)
for i in {1..105}; do
  curl -s http://localhost:3000/api/properties &
done

# Expected: After 100 requests, get 429 status:
# "Too many requests from this IP, please try again after 15 minutes"
```

### **Step 3.2: Test CORS Headers**
```bash
# Test CORS preflight
curl -X OPTIONS http://localhost:3000/api/properties \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Expected: CORS headers in response
```

### **Step 3.3: Test Input Validation**
```bash
# Test invalid input
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "password": ""}'

# Expected: 400 Bad Request with validation errors
```

---

## 📄 **PHASE 4: Module 3 - Digital Contracts & PDF Generation**

### **Step 4.1: Create a Test Booking**
```bash
# First get a property ID
curl http://localhost:3000/api/properties | jq '.[0].id'

# Create booking (auto-generates PDF)
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "PROPERTY_ID_FROM_ABOVE",
    "startDate": "2025-12-20T10:00:00Z",
    "endDate": "2026-12-20T10:00:00Z",
    "rentAmount": 2500,
    "notes": "Test booking for PDF generation"
  }'

# Expected: 201 Created with booking data
# Note: PDF is auto-generated in background
```

### **Step 4.2: Get Rental Agreement PDF**
```bash
# Get PDF info
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/bookings/BOOKING_ID/rental-agreement

# Expected: PDF URL and metadata
```

### **Step 4.3: Download PDF File**
```bash
# Download actual PDF
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/bookings/BOOKING_ID/rental-agreement/download \
  -o rental-agreement.pdf

# Expected: PDF file downloaded
# Verify: file rental-agreement.pdf exists and is valid PDF
```

### **Step 4.4: Verify Digital Signature**
```bash
# Check PDF contains digital signature
# Open rental-agreement.pdf and verify signature
```

---

## 🤖 **PHASE 5: Module 4 - AI Anomaly Detection**

### **Step 5.1: Test Normal Login**
```bash
# Login with normal pattern
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@rentverse.com", "password": "password123"}'

# Expected: Normal processing, no anomaly flags
```

### **Step 5.2: Test Suspicious Activity**
```bash
# Rapid login attempts (may trigger anomaly detection)
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@rentverse.com", "password": "wrongpassword"}' &
done

# Check logs for anomaly detection
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:3000/api/auth/activity-logs | grep -i anomaly
```

### **Step 5.3: Test AI Service Health**
```bash
# If AI service is running
curl http://localhost:8000/health

# Expected: AI service status
```

---

## 📊 **PHASE 6: Module 5 - Activity Logging & Audit**

### **Step 6.1: Generate Various Activities**
```bash
# Login activity
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@rentverse.com", "password": "password123"}'

# Property view activity
curl http://localhost:3000/api/properties

# Booking activity (if you have a valid booking)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/bookings/my-bookings
```

### **Step 6.2: View Activity Logs**
```bash
# Get all activity logs (Admin only)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:3000/api/auth/activity-logs

# Expected: Comprehensive activity log with timestamps, actions, users
```

### **Step 6.3: Filter Activity Logs**
```bash
# Get recent logs
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:3000/api/auth/activity-logs?page=1&limit=10"

# Expected: Paginated results
```

---

## 🔧 **PHASE 7: Module 6 - CI/CD Security**

### **Step 7.1: Run Automated Tests**
```bash
cd rentverse-backend

# Run all tests
npm test

# Expected: All tests pass
# Output should show:
# ✓ Module 1: Authentication tests passed
# ✓ Module 2: Rate limiting tests passed
# ✓ Module 3: PDF generation tests passed
# ✓ Module 4: AI anomaly tests passed
# ✓ Module 5: Activity logging tests passed
```

### **Step 7.2: Security Vulnerability Scan**
```bash
# Check for vulnerabilities
npm audit

# Expected: No high/critical vulnerabilities
# Or: Fix available vulnerabilities if any
```

### **Step 7.3: Code Quality Check**
```bash
# Run linting
npm run lint

# Expected: No linting errors
```

---

## 🌐 **PHASE 8: Frontend Testing**

### **Step 8.1: Access Frontend Application**
- Open: http://localhost:3001
- Verify page loads
- Check responsive design

### **Step 8.2: Test User Registration Flow**
1. Click "Sign Up"
2. Fill registration form
3. Submit and verify success

### **Step 8.3: Test Login Flow**
1. Click "Login"
2. Enter credentials
3. Check for OTP requirement
4. Enter OTP from backend console
5. Verify successful login

### **Step 8.4: Test Property Browsing**
1. Browse property listings
2. Test search functionality
3. Test filtering options

### **Step 8.5: Test Booking Flow**
1. Select a property
2. Choose dates
3. Complete booking
4. Verify PDF generation

---

## 📊 **PHASE 9: Integration Testing**

### **Step 9.1: End-to-End Booking Flow**
```bash
# 1. Register/Login
# 2. Get properties
curl http://localhost:3000/api/properties

# 3. Create booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"propertyId": "PROP_ID", "startDate": "2025-12-20", "endDate": "2026-12-20", "rentAmount": 2500}'

# 4. Verify PDF generation
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/bookings/BOOKING_ID/rental-agreement

# 5. Check activity logs
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:3000/api/auth/activity-logs
```

### **Step 9.2: Admin Dashboard Testing**
```bash
# Get all bookings (admin)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:3000/api/bookings

# Get all users (if endpoint exists)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:3000/api/users

# Check system health
curl http://localhost:3000/health
```

---

## 🔍 **PHASE 10: Performance & Load Testing**

### **Step 10.1: API Response Time Testing**
```bash
# Test API response times
time curl http://localhost:3000/api/properties
time curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/bookings/my-bookings
```

### **Step 10.2: Concurrent User Simulation**
```bash
# Simulate multiple users
for i in {1..10}; do
  curl -s http://localhost:3000/api/properties &
done

# Monitor server performance
```

---

## 📋 **Testing Results Summary**

### **✅ Expected Results:**
- [ ] All API endpoints return 200/201 status codes
- [ ] Authentication flow works with OTP
- [ ] Rate limiting activates after 100 requests
- [ ] PDF contracts generate successfully
- [ ] Activity logs record all actions
- [ ] Automated tests pass
- [ ] No security vulnerabilities
- [ ] Frontend loads and functions properly

### **📊 Test Coverage:**
- [ ] **Module 1:** Authentication & MFA ✅
- [ ] **Module 2:** API Gateway & Rate Limiting ✅
- [ ] **Module 3:** Digital Contracts & PDF ✅
- [ ] **Module 4:** AI Anomaly Detection ✅
- [ ] **Module 5:** Activity Logging ✅
- [ ] **Module 6:** CI/CD Security ✅
- [ ] **Frontend Integration** ✅
- [ ] **End-to-End Flows** ✅

---

## 🚨 **Troubleshooting Guide**

### **Common Issues & Solutions:**

#### **1. Services Not Starting**
```bash
# Check port availability
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F
```

#### **2. Database Connection Issues**
```bash
# Test database
psql -U your_user -d rentverse

# Reset database
npx prisma migrate reset
```

#### **3. Authentication Failures**
```bash
# Check JWT token validity
# Verify user exists in database
# Check OTP in console logs
```

#### **4. PDF Generation Issues**
```bash
# Check Cloudinary credentials
# Verify booking exists
# Check server logs for PDF errors
```

---

## 🎯 **Final Verification Checklist**

- [ ] ✅ All 6 security modules tested and working
- [ ] ✅ Authentication flow complete (login → OTP → JWT)
- [ ] ✅ Rate limiting functional
- [ ] ✅ PDF contracts generated and downloadable
- [ ] ✅ Activity logs comprehensive
- [ ] ✅ Automated tests passing
- [ ] ✅ No critical vulnerabilities
- [ ] ✅ Frontend fully functional
- [ ] ✅ API documentation accessible
- [ ] ✅ Database properly seeded
- [ ] ✅ All services running stably

---

## 📞 **Support & Next Steps**

### **If Tests Fail:**
1. Check server logs for error details
2. Verify environment variables
3. Ensure database is properly seeded
4. Check network connectivity
5. Review firewall settings

### **Demo Preparation:**
- [ ] Record 3-minute demo video
- [ ] Test all flows on clean environment
- [ ] Prepare fallback scenarios
- [ ] Have all credentials ready

### **Submission Ready:**
- [ ] GitHub repository updated
- [ ] Demo video created
- [ ] Documentation complete
- [ ] All tests passing

**🎉 If all tests pass, your RentVerse platform is ready for submission!**