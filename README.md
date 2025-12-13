# RentVerse - Mobile SecOps Challenge Final Submission

## 🎯 **Project Overview**

RentVerse is a comprehensive property rental platform that implements **6 critical security modules** as part of the Mobile SecOps Challenge. The platform provides secure property listings, booking management, and digital contract generation with enterprise-grade security features.

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Node.js       │    │   Python AI     │
│   Frontend      │◄──►│   Backend API   │◄──►│   Service       │
│   (React)       │    │   (Express)     │    │   (FastAPI)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   Redis Cache   │    │   ML Models     │
│   Database      │    │   (Optional)    │    │   (Scikit-learn) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔒 **Security Modules Implemented**

### ✅ **Module 1: Authentication & MFA**
- **JWT-based authentication** with secure token management
- **OTP-based Multi-Factor Authentication** via email
- **AI-powered anomaly detection** for suspicious login attempts
- **Activity logging** for audit trails
- **OAuth integration** (Google, Facebook, GitHub, Twitter, Apple)

### ✅ **Module 2: API Gateway & Rate Limiting**
- **Express Rate Limit** middleware (100 requests/15min per IP)
- **Request throttling** to prevent abuse
- **CORS configuration** for cross-origin requests
- **Helmet.js** security headers
- **Input validation** with express-validator

### ✅ **Module 3: Digital Contracts & PDF Generation**
- **Automated PDF generation** for rental agreements
- **Digital signatures** with cryptographic hashing
- **Cloudinary integration** for document storage
- **Template-based contract generation**
- **Secure document access** with authentication

### ✅ **Module 4: AI Anomaly Detection**
- **Machine learning models** for login pattern analysis
- **Real-time threat detection** using scikit-learn
- **Automated bot detection** and blocking
- **Risk scoring** for suspicious activities
- **Integration with authentication flow**

### ✅ **Module 5: Activity Logging & Audit**
- **Comprehensive activity logging** for all user actions
- **Admin dashboard** for security monitoring
- **Database-backed audit trails**
- **Real-time activity tracking**
- **Export capabilities** for compliance

### ✅ **Module 6: CI/CD Security**
- **Automated security testing** with Jest
- **Vulnerability scanning** with npm audit
- **Code linting** with ESLint
- **Pre-commit hooks** with Husky
- **Security-focused CI/CD pipeline**

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Python 3.8+ (for AI service)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-github-repo-url>
cd rentverse-challenge
```

2. **Setup Backend**
```bash
cd rentverse-backend
npm install
cp .env.example .env
# Configure your .env file with database and API keys
npm run db:migrate
npm run db:seed
npm start
```

3. **Setup Frontend**
```bash
cd rentverse-frontend
npm install
cp .env.example .env
npm run dev
```

4. **Setup AI Service (Optional)**
```bash
cd rentverse-ai-service
pip install -r requirements.txt
python -m rentverse.cli serve
```

### Environment Variables

Create `.env` files in each service directory:

**Backend (.env):**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/rentverse
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CLOUD_NAME=your-cloudinary-cloud-name
CLOUD_API_KEY=your-cloudinary-api-key
CLOUD_API_SECRET=your-cloudinary-api-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3001
```

## 📖 **How to Use**

### For Users:
1. **Register/Login** with email and password
2. **Verify OTP** sent to your email for MFA
3. **Browse Properties** using search and filters
4. **Book Properties** with secure payment flow
5. **Download Contracts** as PDF with digital signatures

### For Landlords:
1. **List Properties** with detailed information
2. **Manage Bookings** (approve/reject tenant requests)
3. **Generate Contracts** automatically
4. **Monitor Activity** through dashboard

### For Admins:
1. **Access Admin Dashboard** with elevated permissions
2. **View All Bookings** across the platform
3. **Monitor Security Logs** and activity
4. **Manage Users** and system settings

## 🔧 **API Endpoints**

### Authentication
- `POST /api/auth/login` - Login with MFA
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get user profile

### Properties
- `GET /api/properties` - List properties
- `POST /api/properties` - Create property (landlord)
- `GET /api/properties/:id` - Get property details

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - User's bookings
- `GET /api/bookings/owner-bookings` - Owner's bookings
- `GET /api/bookings` - All bookings (admin only)

### Security
- `GET /api/auth/activity-logs` - Activity logs (admin)

## 🧪 **Testing All Modules**

### Automated Tests
```bash
cd rentverse-backend
npm test                    # Run all security tests
npm run test:auth          # Test authentication
npm run test:security      # Test security modules
```

### Manual Testing

#### Module 1: Authentication & MFA
```bash
# Login (triggers OTP)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rentverse.com","password":"password123"}'

# Verify OTP (check console for code)
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rentverse.com","otp":"OTP_CODE"}'
```

#### Module 2: Rate Limiting
```bash
# Test rate limiting (should fail after 100 requests)
for i in {1..110}; do curl http://localhost:3000/api/bookings & done
```

#### Module 3: Digital Contracts
```bash
# Create booking (auto-generates PDF)
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"propertyId":"PROP_ID","startDate":"2025-12-20","endDate":"2026-12-20","rentAmount":2500}'

# Download PDF
curl http://localhost:3000/api/bookings/BOOKING_ID/rental-agreement/download \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎥 **Demo Video**

[Link to 3-minute demo video showing all modules]

The demo covers:
1. **Authentication Flow** with MFA
2. **Rate Limiting** demonstration
3. **PDF Contract Generation**
4. **AI Anomaly Detection**
5. **Activity Logging Dashboard**
6. **Security Testing Suite**

## 📊 **Database Schema**

### Core Tables:
- **users** - User accounts with roles
- **properties** - Property listings
- **leases** - Booking/lease records
- **activity_logs** - Audit trails
- **property_types** - Property categories
- **amenities** - Property features

## 🔐 **Security Features**

- **JWT Authentication** with secure token storage
- **OTP-based MFA** for enhanced security
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **SQL injection prevention** with Prisma ORM
- **XSS protection** with Helmet.js
- **CORS configuration** for API security
- **Digital signatures** for document integrity
- **AI-powered threat detection**
- **Comprehensive audit logging**

## 🚀 **Deployment**

### Local Development
```bash
# Start all services
npm run dev:all

# Or start individually
npm run dev:backend
npm run dev:frontend
npm run dev:ai
```

### Production Deployment
```bash
# Build for production
npm run build

# Deploy with Docker
docker-compose up -d
```

## 🤝 **Team Information**

**Team Name:** VECNA
**Members:**
- MOHAMAD BUKHARI BIN AHMAD HUZAIRI - [Role]
- MUHAMAD ZULKARNAIN BIN SAMSUDIN - [Role]
- [Member 3] - [Role]

## 📞 **Support**

For technical support or questions:
- **Documentation:** [Link to detailed docs]
- **API Reference:** http://localhost:3000/docs
- **GitHub Issues:** [Link to GitHub repo]

## 📄 **License**

This project is submitted as part of the Mobile SecOps Challenge. All rights reserved to the development team.

---

## 🎯 **Challenge Completion Summary**

✅ **All 6 Security Modules Implemented**
✅ **End-to-End Testing Completed**
✅ **Production-Ready Code**
✅ **Comprehensive Documentation**
✅ **Demo System Ready**

**Submission Date:** December 17, 2025
**GitHub Repository:** [Your GitHub Link]
**Demo Video:** [Video Link]
**Live Demo:** http://localhost:3000 (when running)
