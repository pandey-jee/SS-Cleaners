# 🔒 Security Audit Report - SS Cleaners
**Date:** December 4, 2025  
**Application:** SS Cleaners Web Application  
**Framework:** React + Supabase  

---

## 📋 Executive Summary

This security audit identified **12 vulnerabilities** ranging from **CRITICAL** to **LOW** severity. The application has good authentication foundation but requires immediate attention to authorization weaknesses, input validation, and payment security.

**Risk Level:** 🔴 **HIGH** - Immediate action required

---

## 🚨 CRITICAL Vulnerabilities

### 1. **Hardcoded Admin Email in Client Code** 
**Severity:** 🔴 CRITICAL  
**Location:** `src/lib/constants.ts`, multiple files  
**Risk:** Anyone can view source code and discover admin email

**Issue:**
```typescript
// EXPOSED TO ALL USERS
export const ADMIN_EMAIL = "pandeyji252002@gmail.com";
```

**Impact:**
- Admin email visible to attackers in browser DevTools
- Enables targeted phishing attacks
- Allows enumeration of admin accounts

**Fix:**
```typescript
// Remove hardcoded email, rely on database roles ONLY
// Check user_roles table via RLS policies instead
```

**Action Items:**
- ✅ Keep database-based admin check (user_roles table)
- ✅ Remove ADMIN_EMAIL constant from frontend
- ✅ Update useAuth.tsx to check user_roles table via Supabase query
- ❌ Never expose admin identifiers in client code

---

### 2. **Admin Email in Public SQL Files**
**Severity:** 🔴 CRITICAL  
**Location:** `supabase/migrations/*.sql`, `supabase/fix_admin_403.sql`  
**Risk:** Admin email exposed in Git repository

**Issue:**
```sql
WHERE email = 'pandeyji252002@gmail.com'
```

**Impact:**
- Anyone with repo access knows admin email
- Targeted attacks possible
- Email harvesting from public repos

**Fix:**
- Use environment variables for admin email in migrations
- Move admin setup to separate secure script
- Never commit admin credentials to Git

---

### 3. **Insufficient Input Sanitization**
**Severity:** 🔴 CRITICAL  
**Location:** Multiple forms (Contact, Booking, Messages)  
**Risk:** XSS (Cross-Site Scripting) attacks possible

**Vulnerable Code:**
```tsx
// No sanitization before storing
.insert({ message: userInput })
```

**Impact:**
- Malicious scripts can be injected
- Admin viewing messages could execute attacker's code
- Session hijacking possible

**Fix:**
```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitizedInput = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href']
});
```

**Action Items:**
- Install: `npm install isomorphic-dompurify`
- Sanitize all user inputs before storage
- Escape outputs when displaying

---

## ⚠️ HIGH Vulnerabilities

### 4. **Payment Amount Client-Side Control**
**Severity:** ⚠️ HIGH  
**Location:** `src/pages/payment/RazorpayCheckout.tsx`  
**Risk:** Users can manipulate payment amounts via URL

**Issue:**
```tsx
// Amount comes from URL query parameter - UNSAFE
const amount = searchParams.get('amount');
```

**Impact:**
- Users can change URL: `?amount=1` instead of `?amount=5000`
- Pay less than actual booking price
- Direct financial loss

**Fix:**
```typescript
// NEVER trust client for amount
// Fetch from database server-side
const { data: booking } = await supabase
  .from('bookings')
  .select('estimated_price')
  .eq('id', bookingId)
  .single();

// Use server-fetched amount ONLY
const amount = booking.estimated_price;
```

**Action Items:**
- Remove amount from URL parameters
- Fetch amount server-side in Edge Function
- Verify amount matches booking before creating order

---

### 5. **No Rate Limiting on API Endpoints**
**Severity:** ⚠️ HIGH  
**Location:** All Supabase Edge Functions  
**Risk:** DDoS attacks and brute force possible

**Issue:**
- No rate limiting on enquiry submissions
- No rate limiting on payment API
- No throttling on chat messages

**Impact:**
- Spam enquiries
- Resource exhaustion
- Increased costs
- Service downtime

**Fix:**
```typescript
// Add Upstash Redis rate limiting
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
});

const identifier = req.headers.get("x-forwarded-for") || "anonymous";
const { success } = await ratelimit.limit(identifier);

if (!success) {
  return new Response("Too many requests", { status: 429 });
}
```

**Action Items:**
- Implement Upstash Redis rate limiting
- Limit enquiries: 5 per IP per hour
- Limit messages: 30 per user per minute
- Limit payment attempts: 3 per booking per hour

---

### 6. **File Upload Without Type Validation**
**Severity:** ⚠️ HIGH  
**Location:** `src/pages/admin/AdminGallery.tsx`, `src/lib/imageCompression.ts`  
**Risk:** Malicious file uploads possible

**Issue:**
```tsx
// Only checks file extension, not actual content
const fileExt = file.name.split('.').pop();
```

**Impact:**
- Attackers can upload `.php.jpg` files
- Server-side code execution possible
- Storage hijacking
- Malware distribution

**Fix:**
```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Check MIME type, not extension
if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Invalid file type');
}

if (file.size > MAX_FILE_SIZE) {
  throw new Error('File too large');
}

// Verify magic bytes (file signature)
const arrayBuffer = await file.arrayBuffer();
const uint8Array = new Uint8Array(arrayBuffer);
const isValidImage = await verifyImageMagicBytes(uint8Array);
```

**Action Items:**
- Validate MIME types on client AND server
- Check file magic bytes for actual type
- Limit file sizes strictly
- Scan uploads with antivirus if possible

---

## 🟡 MEDIUM Vulnerabilities

### 7. **CORS Wildcard in Edge Functions**
**Severity:** 🟡 MEDIUM  
**Location:** All Supabase Edge Functions  
**Risk:** Any website can call your APIs

**Issue:**
```typescript
"Access-Control-Allow-Origin": "*" // TOO PERMISSIVE
```

**Impact:**
- Any website can make requests
- CSRF attacks possible
- API abuse from other domains

**Fix:**
```typescript
const ALLOWED_ORIGINS = [
  'https://ss-cleaners.vercel.app',
  'http://localhost:8080', // dev only
];

const origin = req.headers.get('origin');
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) 
    ? origin 
    : ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Credentials': 'true',
};
```

---

### 8. **Booking Token Security Weak**
**Severity:** 🟡 MEDIUM  
**Location:** `src/pages/booking/CompleteBooking.tsx`  
**Risk:** Token prediction or enumeration possible

**Issue:**
- Tokens might be predictable UUIDs
- No token expiration enforcement in UI
- Token reuse not properly prevented

**Impact:**
- Unauthorized booking access
- Token enumeration attacks
- Expired token usage

**Fix:**
```typescript
// Server-side token validation
const { data: token } = await supabase
  .from('enquiry_tokens')
  .select('*')
  .eq('token', tokenValue)
  .eq('used', false)
  .gte('expires_at', new Date().toISOString())
  .single();

if (!token) {
  throw new Error('Invalid, expired, or used token');
}

// Immediately mark as used
await supabase
  .from('enquiry_tokens')
  .update({ used: true, used_at: new Date().toISOString() })
  .eq('id', token.id);
```

---

### 9. **Insufficient Session Management**
**Severity:** 🟡 MEDIUM  
**Location:** `src/integrations/supabase/client.ts`  
**Risk:** Session hijacking possible

**Issue:**
```typescript
auth: {
  storage: localStorage, // Vulnerable to XSS
  persistSession: true,
}
```

**Impact:**
- Sessions stolen via XSS
- No session timeout enforcement
- Refresh tokens exposed

**Fix:**
```typescript
auth: {
  storage: sessionStorage, // Better than localStorage
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
  flowType: 'pkce', // More secure OAuth flow
}

// Add session timeout check
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
```

---

### 10. **No SQL Injection Protection in Raw Queries**
**Severity:** 🟡 MEDIUM  
**Location:** RLS Policies using string concatenation  
**Risk:** SQL injection if policies are modified incorrectly

**Current (Secure):**
```sql
-- Using parameterized values is good
USING ((SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com')
```

**Warning:**
Never construct SQL strings like this:
```sql
-- ❌ NEVER DO THIS
USING ('email = ' || user_input)
```

**Action:**
- Always use prepared statements
- Never concatenate user input in SQL
- Use Supabase client's parameterized queries

---

## 🔵 LOW Vulnerabilities

### 11. **Environment Variables Exposed in Bundle**
**Severity:** 🔵 LOW  
**Location:** Vite build output  
**Risk:** API keys visible in JavaScript bundle

**Issue:**
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

**Note:** This is **normal** for frontend apps - the publishable key is meant to be public. However:

**Best Practices:**
- ✅ Use `VITE_` prefix (public vars)
- ✅ Never put secrets in frontend
- ✅ Use RLS policies for all security
- ❌ Don't put service role keys in frontend

---

### 12. **Lack of Content Security Policy (CSP)**
**Severity:** 🔵 LOW  
**Location:** `index.html`  
**Risk:** XSS protection weakened

**Fix:**
Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://checkout.razorpay.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://*.supabase.co;
  connect-src 'self' https://*.supabase.co https://api.razorpay.com;
  font-src 'self';
  frame-src https://api.razorpay.com;
">
```

---

## ✅ Security Strengths

1. ✅ **Row Level Security (RLS)** enabled on all tables
2. ✅ **Email-based policies** as fallback for admin
3. ✅ **OAuth integration** with Google (secure auth)
4. ✅ **Payment verification** using HMAC signature
5. ✅ **Image compression** before upload (performance)
6. ✅ **HTTPS** on Vercel (encrypted transit)
7. ✅ **Database migrations** properly versioned

---

## 🛠️ Immediate Action Plan

### Priority 1 (This Week)
1. ✅ Remove hardcoded admin email from frontend
2. ✅ Fix payment amount to fetch from database
3. ✅ Add input sanitization with DOMPurify
4. ✅ Implement file type validation

### Priority 2 (Next Week)
5. ✅ Add rate limiting to Edge Functions
6. ✅ Restrict CORS to specific origins
7. ✅ Improve token validation
8. ✅ Add Content Security Policy

### Priority 3 (Ongoing)
9. Regular security audits
10. Dependency updates (npm audit)
11. Penetration testing
12. Security training for team

---

## 📊 Vulnerability Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 3 | Action Required |
| ⚠️ High | 3 | Action Required |
| 🟡 Medium | 4 | Recommended |
| 🔵 Low | 2 | Nice to Have |
| **Total** | **12** | |

---

## 🔗 Recommended Security Tools

1. **DOMPurify** - XSS protection
2. **Upstash Redis** - Rate limiting
3. **Helmet** - Security headers
4. **npm audit** - Dependency scanning
5. **Snyk** - Vulnerability monitoring
6. **OWASP ZAP** - Penetration testing

---

## 📚 Security Best Practices Moving Forward

1. **Never trust client input** - Validate everything server-side
2. **Principle of least privilege** - Minimal permissions for all users
3. **Defense in depth** - Multiple layers of security
4. **Secure by default** - Start with most restrictive settings
5. **Regular audits** - Monthly security reviews
6. **Update dependencies** - Weekly npm audit checks
7. **Monitor logs** - Watch for suspicious activity
8. **Incident response plan** - Be prepared for breaches

---

## 📞 Support & Questions

For security concerns or to report vulnerabilities:
- **Email:** security@sscleaner.com (recommended setup)
- **Current:** pandeyji252002@gmail.com (change after fixes)

---

**Report Generated:** December 4, 2025  
**Next Audit:** January 4, 2026  
**Auditor:** AI Security Assistant
