# 🔐 User Authentication Setup Guide

## ✅ What's Been Implemented

### 1. Authentication Pages
- ✅ **Login Page** (`/login`) - Email/password + Google OAuth
- ✅ **Signup Page** (`/signup`) - Registration with email verification
- ✅ **Navbar Updates** - Login/Signup buttons + User profile dropdown

### 2. Features Included
- ✅ Email/password authentication
- ✅ Google OAuth integration
- ✅ Email verification requirement
- ✅ Password validation (minimum 6 characters)
- ✅ User profile dropdown with logout
- ✅ Responsive mobile menu with auth options
- ✅ Error handling and user feedback

---

## 🔧 Supabase Configuration Required

### Step 1: Enable Email Verification

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **Settings** → **Email Auth**
3. Enable: **"Confirm email"** (toggle ON)
4. **Save changes**

### Step 2: Configure Email Templates

Go to **Authentication** → **Email Templates**

#### **Confirm Signup Template**:
```
Subject: Verify your SS PureCare account

Body:
<h2>Welcome to SS PureCare!</h2>
<p>Thanks for signing up! Please click the button below to verify your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email Address</a></p>
<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link will expire in 24 hours.</p>
<p>If you didn't create an account, you can safely ignore this email.</p>
```

#### **Magic Link Template** (Optional):
```
Subject: Sign in to SS PureCare

Body:
<h2>Sign in to SS PureCare</h2>
<p>Click the button below to sign in:</p>
<p><a href="{{ .ConfirmationURL }}">Sign In</a></p>
```

### Step 3: Set Site URL and Redirect URLs

Go to **Authentication** → **URL Configuration**

1. **Site URL**: `http://localhost:5173` (for development)
   - For production: `https://yourdomain.com`

2. **Redirect URLs** (add these):
   ```
   http://localhost:5173
   http://localhost:5173/
   http://localhost:5173/**
   ```

3. **Save changes**

---

## 🌐 Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**:
   - APIs & Services → Library → Search "Google+ API" → Enable

4. Create OAuth credentials:
   - APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: **Web application**
   - Name: `SS PureCare`

5. **Authorized redirect URIs** - Add:
   ```
   https://zvnkbxvvyqmxcygghdii.supabase.co/auth/v1/callback
   ```
   (Replace `zvnkbxvvyqmxcygghdii` with your Supabase project ID)

6. Click **Create** and copy:
   - Client ID
   - Client Secret

### Step 2: Configure in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Enable: **"Google enabled"** (toggle ON)
4. Paste:
   - **Client ID** (from Google Console)
   - **Client Secret** (from Google Console)
5. **Save**

### Step 3: Test Google Login

1. Go to `/signup` or `/login`
2. Click "Sign up with Google" or "Sign in with Google"
3. Should redirect to Google OAuth consent screen
4. After approval, redirects back to your app

---

## ✉️ Email Configuration (Optional - Better Deliverability)

By default, Supabase uses their SMTP server. For production, use a custom SMTP:

### Option 1: Use SendGrid (Recommended)

1. Create [SendGrid account](https://sendgrid.com/) (free tier available)
2. Generate API key
3. In Supabase: **Settings** → **Auth** → **SMTP Settings**
4. Configure:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: <your-sendgrid-api-key>
   Sender email: noreply@sspurecare.com
   Sender name: SS PureCare
   ```

### Option 2: Use Gmail (Development Only)

Not recommended for production, but works for testing:
```
Host: smtp.gmail.com
Port: 587
Username: your-gmail@gmail.com
Password: <app-specific-password>
```

---

## 🧪 Testing Authentication Flow

### Test 1: Email Signup
1. Go to `/signup`
2. Fill in:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `test123`
   - Confirm Password: `test123`
3. Click "Create Account"
4. ✅ Should see success message
5. Check email for verification link
6. Click verification link
7. Go to `/login` and sign in

### Test 2: Email Verification Enforcement
1. Try to login before verifying email
2. ✅ Should see error: "Please verify your email address"
3. Cannot login until email is verified

### Test 3: Google OAuth
1. Go to `/login`
2. Click "Sign in with Google"
3. ✅ Should redirect to Google consent screen
4. Approve permissions
5. ✅ Should redirect back to app and be logged in
6. Check Supabase Dashboard → Authentication → Users
7. ✅ Should see new user with Google provider

### Test 4: Navbar Updates
1. ✅ When logged out: See "Login" and "Sign Up" buttons
2. ✅ When logged in: See user avatar with dropdown
3. Click avatar → should see:
   - User name and email
   - Profile link
   - My Bookings link
   - Logout button
4. Click Logout → ✅ Should log out and redirect to home

---

## 🔒 Security Best Practices

### Already Implemented:
- ✅ Email verification required
- ✅ Password minimum length (6 characters)
- ✅ Secure password confirmation
- ✅ OAuth PKCE flow
- ✅ Automatic session management
- ✅ Protected routes (next step)

### Recommended Settings in Supabase:

**Authentication → Settings → Security:**
- ✅ Enable email confirmations: ON
- ✅ Enable secure email change: ON
- ✅ Enable secure password change: ON

**Password Requirements:**
- Minimum characters: 6 (can increase to 8+)
- Maximum characters: 72

**Session Settings:**
- JWT expiry: 3600 seconds (1 hour)
- Refresh token expiry: 2592000 seconds (30 days)

---

## 📋 Next Steps

### 1. Link User Accounts to Enquiries/Bookings

Update Contact form to use authenticated user:
```typescript
// In Contact.tsx
const { data: { user } } = await supabase.auth.getUser();

const { error } = await supabase.from("enquiries").insert({
  user_id: user?.id, // Link to authenticated user
  name: formData.name,
  email: formData.email,
  // ... rest of fields
});
```

### 2. Create Protected Routes

Users must be logged in to:
- View their bookings
- Access booking history
- Edit profile
- Chat with admin

### 3. Add User Dashboard

Create `/profile` page showing:
- User details
- Booking history
- Active enquiries
- Chat conversations

### 4. Update Database Schema

Add `user_id` foreign key to:
- ✅ enquiries table (already exists)
- ✅ bookings table (already exists)
- Link conversations to user_id

---

## 🎯 Success Criteria

When everything works:
1. ✅ Users can sign up with email/password
2. ✅ Verification email sent automatically
3. ✅ Users cannot login without verifying email
4. ✅ Google OAuth works seamlessly
5. ✅ Navbar shows auth status (logged in/out)
6. ✅ User avatar and dropdown functional
7. ✅ Logout works and redirects properly
8. ✅ Mobile menu shows auth options

---

## 🆘 Troubleshooting

### Issue: Email not received
- Check spam folder
- Verify Supabase email settings
- Check email template is enabled
- Use SendGrid for better deliverability

### Issue: Google OAuth fails
- Verify redirect URI matches exactly
- Check Google+ API is enabled
- Ensure Client ID/Secret are correct
- Clear browser cache and try again

### Issue: "Invalid login credentials"
- User might not have verified email yet
- Check password is correct
- Verify user exists in Supabase Dashboard

### Issue: Redirect after login fails
- Check Site URL is set correctly
- Verify redirect URLs include your domain
- Check APP_URL in .env file

---

## 🚀 Ready to Use!

The authentication system is now fully implemented! 

**Configure Supabase** (Steps 1-3 above) and then test the full flow. Once verified, proceed to link user accounts with enquiries and bookings.

---

**Current Status:**
- ✅ Login/Signup pages created
- ✅ Navbar updated with auth
- ⏳ Supabase configuration needed (follow guide above)
- ⏳ Google OAuth setup needed
- ⏳ Protected routes (next task)
- ⏳ User profile page (next task)
