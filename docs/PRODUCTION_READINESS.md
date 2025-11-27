# Production Readiness Checklist
## Multi-Outlet Restaurant Management System

**Document Version**: 1.0
**Last Updated**: 2025-11-28
**Status**: ⚠️ Not Production Ready

---

## Executive Summary

This document outlines all 36 identified issues blocking production deployment. The application has a solid foundation but requires security hardening, input validation improvements, and UI enhancements before launch.

**Issues by Severity:**
- 🔴 **Critical (5)**: Must fix before any production deployment
- 🟠 **High (9)**: Strongly recommended before launch
- 🟡 **Medium (12)**: Important for robustness and quality
- 🔵 **Low (7)**: Good to have, can be addressed post-launch
- ⚪ **Infrastructure (3)**: Deployment and operational requirements

---

## Critical Issues (BLOCKING PRODUCTION)

### 1. 🔴 Insecure JWT_SECRET Placeholder

**Location**: `.env` (Line 5)
**Severity**: CRITICAL
**Priority**: P0 - Fix immediately

**Current State**:
```env
JWT_SECRET=your-secret-jwt-key-change-this-in-production-min-32-chars
```

**Issue**:
The JWT secret is a placeholder string. This means anyone could forge valid JWT tokens and impersonate users, completely bypassing authentication.

**Impact**:
- Tokens can be forged with knowledge of the placeholder secret
- Anyone can impersonate admin, manager, or employee accounts
- Complete authentication system compromise

**Fix**:
```env
JWT_SECRET=<generate-random-32-char-string>
```

**Implementation**:
1. Generate a strong random string (min 32 characters):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Replace the placeholder in `.env`
3. For production: Use environment variable injection from deployment platform (Vercel, AWS, etc.)
4. Implement secret rotation mechanism for future changes

**Validation**:
- Verify JWT_SECRET is at least 32 characters
- Test token generation and verification still works
- Ensure old tokens don't work after secret change

---

### 2. 🔴 Missing Input Validation on POST /api/payments

**Location**: `src/app/api/payments/route.js` (Lines 40-54)
**Severity**: CRITICAL
**Priority**: P0 - Fix immediately

**Current State**:
```javascript
// Line 40-54: No schema validation
const { orderId, amount, method } = req.body;

// Directly used without validation
const payment = await Payment.create({
  orderId,
  amount,
  method,
  ...
});
```

**Issue**:
POST endpoint accepts `orderId`, `amount`, and `method` without any schema validation. Malicious users can submit:
- Non-existent order IDs
- Negative or extreme amounts
- Invalid payment methods
- Missing required fields

**Impact**:
- Invalid payment records created
- Data integrity compromised
- Potential for financial record manipulation

**Fix**:
```javascript
import { z } from 'zod';

const paymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID required'),
  amount: z.number().positive('Amount must be positive'),
  method: z.enum(['cash', 'card', 'online']),
  transactionId: z.string().optional(),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const validatedData = paymentSchema.parse(body);

    // Safe to use validatedData now
    const payment = await Payment.create(validatedData);
    ...
  }
}
```

**Implementation Steps**:
1. Define Zod schema for payment creation
2. Validate request body against schema
3. Return 400 with validation errors if invalid
4. Test with invalid payloads (negative amounts, invalid methods, etc.)

**Files to Modify**:
- `src/app/api/payments/route.js` (POST handler)

---

### 3. 🔴 Missing Input Validation on PUT /api/payments

**Location**: `src/app/api/payments/route.js` (Lines 33-47)
**Severity**: CRITICAL
**Priority**: P0 - Fix immediately

**Current State**:
```javascript
// Line 33-47: No validation on update payload
const { status, transactionId } = req.body;
const payment = await Payment.findByIdAndUpdate(id, {
  status,
  transactionId,
  ...
});
```

**Issue**:
PUT endpoint accepts `status` and `transactionId` without validation. Users can set invalid statuses or provide malformed transaction IDs.

**Impact**:
- Payment status set to invalid values
- Broken transaction ID format
- Financial records inconsistent

**Fix**:
```javascript
const paymentUpdateSchema = z.object({
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  transactionId: z.string().min(5).optional(),
});

export async function PUT(req) {
  try {
    const body = await req.json();
    const validatedData = paymentUpdateSchema.parse(body);

    const payment = await Payment.findByIdAndUpdate(id, validatedData);
    ...
  }
}
```

**Implementation Steps**:
1. Define Zod schema for payment updates
2. Validate request body
3. Only allow specific status values
4. Test with invalid statuses

**Files to Modify**:
- `src/app/api/payments/route.js` (PUT handler)

---

### 4. 🔴 Inconsistent Authentication Pattern in Payment Endpoints

**Location**: `src/app/api/payments/route.js`, `src/app/api/payments/[id]/route.js`
**Severity**: CRITICAL
**Priority**: P0 - Fix immediately

**Current State**:
```javascript
// Manual token extraction (inconsistent)
const token = req.headers.authorization?.split(' ')[1];
if (!token) return handleApiError(res, 'No token', 401);

try {
  const decoded = verifyToken(token);
  // No role-based authorization
} catch (error) {
  return handleApiError(res, 'Invalid token', 401);
}
```

**Issue**:
Payment endpoints use manual token extraction instead of the standardized `authenticateRequest` helper. This creates:
- Inconsistent error handling
- Missing role-based authorization checks
- Duplicate code

**Impact**:
- Employees could potentially access/modify payments they shouldn't
- No authorization layer for resource access
- Code maintenance nightmare (auth logic in multiple places)

**Fix**:
```javascript
import { authenticateRequest } from '@/lib/api-helpers';

export async function GET(req) {
  const auth = authenticateRequest(req);
  if (!auth.success) {
    return handleApiError(res, auth.error, 401);
  }

  // Now auth.userId and auth.role are available
  const { userId, role } = auth;

  // Add role-based checks
  if (role === 'employee') {
    return handleApiError(res, 'Employees cannot access payments', 403);
  }

  ...
}
```

**Implementation Steps**:
1. Import `authenticateRequest` from lib/api-helpers
2. Replace all manual token extraction with authenticateRequest
3. Add role-based authorization for each endpoint
4. Add outlet authorization checks where applicable
5. Verify error handling is consistent

**Files to Modify**:
- `src/app/api/payments/route.js` (all handlers)
- `src/app/api/payments/[id]/route.js` (all handlers)

---

### 5. 🔴 Weak Rate Limiting Thresholds

**Location**: `src/lib/constants.js` (Lines 80-85)
**Severity**: CRITICAL
**Priority**: P0 - Fix immediately

**Current State**:
```javascript
// Lines 80-85
LOGIN_MAX_ATTEMPTS: 50,           // Way too high
LOGIN_RATE_LIMIT_WINDOW: 15 * 60, // 15 minutes
API_MAX_REQUESTS: 100,            // Too high for shared IP
API_RATE_LIMIT_WINDOW: 15 * 60,
```

**Issue**:
Rate limits are too permissive:
- 50 login attempts per 15 minutes allows brute force attacks
- 100 API requests per 15 minutes (~6.7 req/sec) is excessive for user operations

**Industry Standards**:
- Login attempts: 3-5 per 15 minutes
- API requests: 20-50 per 15 minutes (varies by endpoint)

**Impact**:
- Brute force attacks feasible on login
- Account takeover risk
- API abuse/DoS potential

**Fix**:
```javascript
LOGIN_MAX_ATTEMPTS: 5,            // 5 attempts per 15 min
LOGIN_RATE_LIMIT_WINDOW: 15 * 60, // 15 minutes (standard)
API_MAX_REQUESTS: 30,             // 30 requests per 15 min (safe)
API_RATE_LIMIT_WINDOW: 15 * 60,
```

**Implementation Steps**:
1. Update constants in `src/lib/constants.js`
2. Update login rate limit for authentication route
3. Update general API rate limit
4. Test with automated login attempts (should get rate limited)
5. Monitor actual usage patterns, adjust if needed

**Files to Modify**:
- `src/lib/constants.js`

**Testing**:
```bash
# Test login rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# Should get rate limited after 5 attempts
```

---

## High Priority Issues (STRONGLY RECOMMENDED)

### 6. 🟠 Client-Side Token Storage Security Risk

**Location**: `src/components/auth-provider.jsx` (Lines 12-24)
**Severity**: HIGH
**Priority**: P1 - Fix before production

**Issue**: JWT tokens stored in localStorage without HTTPOnly flag, vulnerable to XSS attacks.

**Fix**: Implement HTTPOnly cookies:
```javascript
// Instead of localStorage
localStorage.setItem('token', token);

// Use secure cookies
document.cookie = `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/`;
```

**Implementation**:
1. Create secure cookie utility function
2. Replace localStorage.setItem/getItem with secure cookies
3. Update auth-provider to use cookies
4. Test cookie security headers

**Files to Modify**:
- `src/components/auth-provider.jsx`
- `src/lib/auth.js` (add cookie utilities)

---

### 7. 🟠 Missing CORS and Content-Type Validation

**Location**: API routes globally
**Severity**: HIGH
**Priority**: P1 - Fix before production

**Issue**: No CORS headers; no Content-Type validation on POST/PUT requests.

**Fix**: Add middleware:
```javascript
// middleware.js
export const config = {
  matcher: ['/api/:path*'],
};

export function middleware(request) {
  const response = NextResponse.next();

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  return response;
}
```

**Files to Modify**:
- `middleware.js`

---

### 8. 🟠 Missing Error Details Sanitization

**Location**: `src/lib/api-helpers.js` (Line 179)
**Severity**: HIGH
**Priority**: P1 - Fix before production

**Issue**: Error logs expose stack traces and sensitive information.

**Fix**:
```javascript
export function handleApiError(res, error, statusCode = 500) {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Only log error ID, not full error
    const errorId = generateErrorId();
    logger.error(`Error ${errorId}:`, error);

    return res.status(statusCode).json({
      error: statusCode === 500 ? 'Internal Server Error' : error.message,
      ...(statusCode !== 500 && { details: error.message }),
    });
  } else {
    // In development, return full error
    return res.status(statusCode).json({
      error: error.message,
      stack: error.stack,
    });
  }
}
```

**Files to Modify**:
- `src/lib/api-helpers.js`

---

### 9. 🟠 Missing Outlet Authorization on Individual Orders

**Location**: `src/app/api/orders/[id]/route.js` (Lines 9-31, 33-87, 89-118)
**Severity**: HIGH
**Priority**: P1 - Fix before production

**Issue**: GET/PUT/DELETE on individual orders don't validate outlet access. Managers can access other outlets' orders.

**Fix**:
```javascript
export async function GET(req, { params }) {
  const auth = authenticateRequest(req);
  if (!auth.success) return handleApiError(res, auth.error, 401);

  const order = await Order.findById(params.id);

  // Add outlet authorization
  if (auth.role === 'manager' && order.outlet.toString() !== auth.outlet) {
    return handleApiError(res, 'Unauthorized', 403);
  }

  return res.json(order);
}
```

**Files to Modify**:
- `src/app/api/orders/[id]/route.js`

---

### 10. 🟠 Missing Validation on Menu Item Updates

**Location**: `src/app/api/menu/[id]/route.js` (Lines 46-47)
**Severity**: HIGH
**Priority**: P1 - Fix before production

**Issue**: PUT endpoint doesn't validate update payload. Invalid data (negative prices, etc.) could be saved.

**Fix**: Add Zod validation:
```javascript
const menuUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  price: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  isAvailable: z.boolean().optional(),
});

export async function PUT(req, { params }) {
  const body = await req.json();
  const validatedData = menuUpdateSchema.parse(body);

  const item = await MenuItem.findByIdAndUpdate(
    params.id,
    validatedData,
    { new: true }
  );

  return res.json(item);
}
```

**Files to Modify**:
- `src/app/api/menu/[id]/route.js`

---

### 11. 🟠 Missing Outlet Filtering on Menu Item GET

**Location**: `src/app/api/menu/[id]/route.js` (Line 12)
**Severity**: HIGH
**Priority**: P1 - Fix before production

**Issue**: GET by ID doesn't check outlet access. Employees can view all outlets' menu items.

**Fix**:
```javascript
export async function GET(req, { params }) {
  const auth = authenticateRequest(req);
  if (!auth.success) return handleApiError(res, auth.error, 401);

  const item = await MenuItem.findById(params.id);

  // Check outlet authorization
  if (auth.role === 'manager' && item.outlet.toString() !== auth.outlet) {
    return handleApiError(res, 'Unauthorized', 403);
  }

  return res.json(item);
}
```

**Files to Modify**:
- `src/app/api/menu/[id]/route.js`

---

### 12. 🟠 In-Memory Rate Limiting Not Distributed

**Location**: `src/lib/rate-limit.js` (Lines 5-50)
**Severity**: HIGH
**Priority**: P1 - Fix for scale

**Issue**: In-memory rate limit doesn't work with multiple server instances. Resets on server restart.

**Recommendation for Production**:
- Use Redis for distributed rate limiting
- Or use third-party service (Vercel Rate Limit, AWS API Gateway)

**For MVP**: Document this limitation and plan migration to Redis.

---

### 13. 🟠 Missing Outlet Authorization on GET /api/payments

**Location**: `src/app/api/payments/route.js` (Line 8-38)
**Severity**: HIGH
**Priority**: P1 - Fix before production

**Issue**: GET endpoint doesn't filter payments by user's outlet. Any authenticated user can view all payments.

**Fix**:
```javascript
export async function GET(req) {
  const auth = authenticateRequest(req);
  if (!auth.success) return handleApiError(res, auth.error, 401);

  let query = {};

  // Filter by outlet for managers/employees
  if (auth.role === 'manager') {
    const outlet = await Outlet.findById(auth.outlet);
    query = { outlet: outlet._id };
  } else if (auth.role === 'employee') {
    return handleApiError(res, 'Employees cannot access payments', 403);
  }
  // Admin can see all payments

  const payments = await Payment.find(query);
  return res.json(payments);
}
```

**Files to Modify**:
- `src/app/api/payments/route.js`

---

### 14. 🟠 Missing Sensitive Field Protection on User Endpoints

**Location**: `src/app/api/users/route.js` (Line 47-51)
**Severity**: HIGH
**Priority**: P1 - Security

**Issue**: While password is excluded, should use schema-level protection.

**Fix**:
```javascript
// In User model
const userSchema = new Schema({
  name: String,
  email: String,
  password: {
    type: String,
    select: false, // Never select by default
  },
  role: String,
  isActive: Boolean,
  // ... other fields
});

// In API, safely query without password
const user = await User.findById(id); // password not included
```

**Files to Modify**:
- `src/models/User.js`

---

## Medium Priority Issues (IMPORTANT)

### 15. 🟡 Console Error Statements in Production Code

**Locations**: Multiple files (~20+ React components)
- `src/lib/api-helpers.js:179`
- `src/lib/db.js:24-40`
- Various page components with console.error() in catch blocks

**Issue**: Console statements leak information and clutter browser console.

**Fix**:
```javascript
// Before
catch (error) {
  console.error('Error:', error);
  handleApiError(res, error);
}

// After
catch (error) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }
  logger.error('API Error', { error: error.message });
  handleApiError(res, error);
}
```

**Implementation**: Remove all console statements except those wrapped in NODE_ENV checks.

---

### 16. 🟡 Missing CSP Directives Specification

**Location**: `middleware.js` (Line 18)
**Issue**: CSP allows `'unsafe-eval'` and `'unsafe-inline'` weakening XSS protection.

**Recommendation**: Switch to nonce-based CSP:
```javascript
const nonce = crypto.randomUUID();
response.headers.set('Content-Security-Policy',
  `default-src 'self'; script-src 'nonce-${nonce}'`
);
```

---

### 17. 🟡 Missing API Response Compression

**Issue**: Responses not gzipped, leading to larger payloads.

**Fix**: Enable compression in Next.js:
```javascript
// next.config.mjs
export default {
  compress: true, // Enable gzip compression
};
```

---

### 18. 🟡 No Request Size Limits Configured

**Issue**: Potential DoS via large payload uploads.

**Fix**:
```javascript
// middleware.js
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
```

---

### 19. 🟡 Missing Timeout Configuration

**Issue**: Database queries have no timeout, can hang indefinitely.

**Fix**:
```javascript
// src/lib/db.js
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

---

### 20. 🟡 Missing Environment Variable Validation

**Issue**: App could run with missing critical variables.

**Fix**:
```javascript
// src/lib/config.js
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'NODE_ENV'];
requiredEnvVars.forEach(variable => {
  if (!process.env[variable]) {
    throw new Error(`Missing environment variable: ${variable}`);
  }
});
```

---

### 21-26. Other Medium Priority Issues

- **21. Missing API Versioning** - Implement /api/v1/ versioning strategy
- **22. Incomplete Error Boundaries** - Add ErrorBoundary components to pages
- **23. Missing Token Expiration Logout** - Implement auto-logout on token expiration
- **24. No Database Connection Pool Config** - Configure maxPoolSize, minPoolSize
- **25. Missing API Documentation** - Add Swagger/OpenAPI docs
- **26. Missing Request ID Tracking** - Add x-request-id for tracing

---

## Low Priority Issues (7)

26-32. Documentation, security.txt, deprecation headers, audit logging, development CSP settings, etc.

---

## Infrastructure Requirements (3)

### Health Check Endpoint
Add `/api/health` endpoint for load balancer health checks.

### Graceful Shutdown Handler
Implement SIGTERM/SIGINT handlers to close DB connections cleanly.

### Secrets Rotation Mechanism
Plan for JWT secret rotation without downtime.

---

## Implementation Roadmap

### Week 1 (Critical)
- Fix JWT_SECRET
- Add payment validation
- Standardize authentication
- Reduce rate limits
- Create header with theme toggle

### Week 2 (High Priority)
- Implement secure token storage
- Add CORS/Content-Type validation
- Add outlet authorization
- Improve error sanitization

### Week 3 (Medium Priority)
- Remove console statements
- Harden CSP
- Add compression
- Add timeouts
- Implement error boundaries

### Week 4 (Low/Infrastructure)
- Complete remaining issues
- Documentation
- Final security audit

---

## Deployment Checklist

Before deploying to production:

- [ ] All 5 critical issues fixed
- [ ] All 9 high-priority issues fixed
- [ ] JWT_SECRET rotated to production value
- [ ] Environment variables set for production
- [ ] Database backups configured
- [ ] Monitoring/logging set up
- [ ] Security headers verified
- [ ] Rate limiting tested
- [ ] Load testing completed
- [ ] Security audit passed

---

## Contact & Support

For security issues, please report privately through your security reporting channel.

For bug reports and feature requests, use the project issue tracker.

---

**Last Updated**: 2025-11-28
**Next Review**: After implementation of all critical issues
