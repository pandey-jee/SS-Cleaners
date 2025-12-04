# Database and Code Fixes - Complete Summary

## Date: December 4, 2024

## Issues Identified and Fixed

### 1. **Admin Authentication Not Working**
**Problem**: Admin user (pandeyji252002@gmail.com) couldn't access admin portal
**Root Cause**: 
- Code was checking `user_roles` table via database query
- Admin email not present in `user_roles` table
- has_role function had type conflicts (ENUM vs TEXT)

**Solution**:
- ✅ Updated frontend to use email-based check (`ADMIN_EMAIL` constant)
- ✅ Created migration to insert admin into `user_roles` table
- ✅ Fixed `has_role()` function to use TEXT parameter type
- ✅ Updated all RLS policies to work correctly

### 2. **RLS Policies Too Restrictive**
**Problem**: Anonymous users couldn't complete booking flow
**Root Cause**: Missing permissions and overly restrictive policies

**Solution**:
- ✅ Granted SELECT/INSERT permissions to `anon` role for required tables
- ✅ Fixed policies on: enquiries, enquiry_tokens, bookings, conversations, messages
- ✅ Allowed public to insert enquiries and bookings (for customer flow)
- ✅ Restricted admin operations properly with `has_role()` checks

### 3. **Admin Routes Not Protected**
**Problem**: Admin pages accessible without authentication
**Root Cause**: Routes not wrapped with ProtectedRoute component

**Solution**:
- ✅ Wrapped all admin routes with `AdminProtectedRoute`
- ✅ Added `/admin` → `/admin/dashboard` redirect
- ✅ Updated ProtectedRoute to redirect to `/login` for non-authenticated
- ✅ Redirects to home `/` for authenticated non-admin users

### 4. **TypeScript Errors in AdminBookingDetail**
**Problem**: Compiler errors for non-existent fields
**Root Cause**: Code using wrong field names

**Solution**:
- ✅ Fixed `property_size_sqft` → `property_size`
- ✅ Fixed `number_of_rooms` → `bedrooms`
- ✅ Fixed `number_of_bathrooms` → `bathrooms`
- ✅ Fixed `preferred_time_slot` → `time_slot`

## Files Modified

### Frontend Files
1. **src/hooks/useAuth.tsx**
   - Removed database query for user_roles
   - Added email-based admin check: `session.user.email === ADMIN_EMAIL`
   - Removed async setTimeout wrapping

2. **src/components/admin/ProtectedRoute.tsx**
   - Updated redirect logic: `/login` for non-authenticated, `/` for non-admin
   - Cleaner logic separating authentication and authorization checks

3. **src/App.tsx**
   - Added `Navigate` import
   - Imported `AdminProtectedRoute` from `@/components/admin/ProtectedRoute`
   - Wrapped all admin routes with `<AdminProtectedRoute>`
   - Added `/admin` redirect route

4. **src/pages/admin/AdminBookingDetail.tsx**
   - Fixed property field names to match database schema
   - Added null coalescing for optional fields

### Database Files
5. **supabase/migrations/20251204000000_fix_admin_system.sql** (NEW)
   - Comprehensive migration fixing all database issues
   - Inserts admin user into user_roles
   - Fixes has_role function
   - Updates all RLS policies
   - Grants proper permissions
   - Creates indexes

6. **DATABASE_FIX_INSTRUCTIONS.md** (NEW)
   - Complete instructions for applying database fixes
   - Troubleshooting guide
   - Testing checklist

## Database Schema Summary

### Tables with RLS Policies
- **enquiries**: Public can insert, anyone can read, admins can update/delete
- **enquiry_tokens**: Anyone can read (for validation), admins can manage
- **bookings**: Public can insert, admins read all, users read their own
- **conversations**: Admins can view/update, service role can manage
- **messages**: Admins can view/insert/update, service role can manage
- **payment_orders**: Admins view all, users view their own
- **user_roles**: Admins can view/manage, service role full access

### Key Functions
- **has_role(UUID, TEXT)**: Checks if user has specified role
- **generate_booking_token()**: Creates secure random tokens
- **create_conversation_for_enquiry()**: Auto-creates conversation on enquiry insert
- **update_unread_counts()**: Maintains message counts in conversations
- **mark_messages_read()**: Marks messages as read and resets counts

### Permissions Granted
- **anon**: SELECT on enquiries, enquiry_tokens; INSERT on enquiries, bookings
- **authenticated**: Full access to all tables (via RLS policies)
- **service_role**: Full access without RLS restrictions

## How to Apply Fixes

### Step 1: Apply Database Migration
```bash
# Option 1: If you have Supabase CLI
supabase db push

# Option 2: Via Supabase Dashboard
# 1. Go to https://app.supabase.com → Your Project → SQL Editor
# 2. Copy content from supabase/migrations/20251204000000_fix_admin_system.sql
# 3. Paste and click "Run"
# 4. Verify: Should see "Admin users found: 1"
```

### Step 2: Verify Admin User Exists
```sql
-- Run in Supabase SQL Editor
SELECT u.email, ur.role 
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'pandeyji252002@gmail.com';

-- Should return: pandeyji252002@gmail.com | admin
```

### Step 3: Clear Browser Cache and Login
1. Open DevTools (F12)
2. Application → Clear site data
3. Refresh page (Ctrl + F5)
4. Login with pandeyji252002@gmail.com
5. Should see "Admin Portal" button in navbar

### Step 4: Test Complete Flow
- ✅ Admin dashboard loads
- ✅ Can view enquiries
- ✅ Can view bookings
- ✅ Can send booking links
- ✅ Booking links work (test in incognito)
- ✅ Bookings can be created via link
- ✅ Admin can see new bookings

## Testing Checklist

### Admin Access
- [ ] Login with pandeyji252002@gmail.com
- [ ] See "Admin Portal" button in navbar
- [ ] Can access /admin/dashboard
- [ ] Can access /admin/enquiries
- [ ] Can access /admin/bookings
- [ ] Can access /admin/services
- [ ] Non-admin users redirected away

### Booking Flow (Anonymous User)
- [ ] Submit enquiry form
- [ ] Admin receives enquiry
- [ ] Admin sends booking link
- [ ] Link opens correctly (incognito)
- [ ] Complete booking form
- [ ] Booking created successfully
- [ ] Admin sees booking in dashboard

### Security
- [ ] Anonymous users can't access admin routes
- [ ] Logged-in non-admin users can't access admin routes
- [ ] Admin user can access all admin routes
- [ ] Database policies block unauthorized access
- [ ] Service role can bypass RLS (for edge functions)

## Current Configuration

### Admin Email
```typescript
// src/lib/constants.ts
export const ADMIN_EMAIL = "pandeyji252002@gmail.com";
```

### Admin Check Logic
```typescript
// src/hooks/useAuth.tsx
if (session?.user) {
  setIsAdmin(session.user.email === ADMIN_EMAIL);
}
```

### Database Admin Check
```sql
-- Function: has_role(UUID, TEXT)
SELECT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = _user_id AND role = _role
);

-- Usage in RLS Policies:
USING (public.has_role(auth.uid(), 'admin'))
```

## Troubleshooting

### Issue: "Admin users found: 0"
**Solution**: Admin user doesn't exist in auth.users yet
1. Go to Supabase Dashboard → Authentication → Users
2. Create user: pandeyji252002@gmail.com
3. Auto confirm: YES
4. Re-run migration SQL

### Issue: Admin button not showing
**Solution**: 
1. Clear browser cache completely
2. Hard refresh (Ctrl + Shift + R)
3. Re-login with admin email
4. Check console for errors

### Issue: 403 Forbidden in admin panel
**Solution**:
1. Verify migration was run successfully
2. Clear browser cache
3. Sign out completely
4. Sign in again
5. Check auth.uid() is not null (console: supabase.auth.getUser())

### Issue: Booking link invalid
**Solution**:
1. Verify token exists in enquiry_tokens table
2. Check token hasn't expired (expires_at > now())
3. Verify anon role has SELECT on enquiry_tokens
4. Check RLS policies allow anyone to read tokens

### Issue: Can't create booking via link
**Solution**:
1. Verify anon role has INSERT on bookings table
2. Check RLS policy "Public can insert bookings" exists
3. Verify required fields are provided (name, email, phone, address_line1)
4. Check browser console for specific error

## Migration Details

### Migration File: 20251204000000_fix_admin_system.sql

**Operations Performed:**
1. Inserts admin user into user_roles (ON CONFLICT DO UPDATE)
2. Drops old has_role function versions (ENUM and TEXT)
3. Creates unified has_role(UUID, TEXT) function
4. Drops all existing RLS policies
5. Creates new, correct RLS policies for all tables
6. Grants table-level permissions to anon, authenticated, service_role
7. Creates indexes for performance
8. Verifies admin user exists (RAISE NOTICE)

**Safety:**
- Uses IF NOT EXISTS where appropriate
- Uses DROP POLICY IF EXISTS (safe to re-run)
- Uses ON CONFLICT for admin insert (idempotent)
- Doesn't delete any data
- Only adds/updates policies and permissions

## Next Steps

1. ✅ Run database migration (see Step 1 above)
2. ✅ Clear browser cache
3. ✅ Login and test admin access
4. ✅ Test complete booking flow
5. ⚠️ Update Supabase Site URL (if using production)
6. ⚠️ Deploy to Vercel (if ready for production)
7. ⚠️ Test OAuth login on production

## Production Deployment Notes

When deploying to production:
1. Run migration on production database
2. Update Supabase Site URL from localhost to production domain
3. Update Redirect URLs in Supabase Dashboard
4. Test admin login on production
5. Test complete booking flow on production
6. Monitor error logs

## Support

If issues persist after following this guide:
1. Check browser console for JavaScript errors
2. Check Supabase logs in Dashboard → Logs
3. Run SQL queries to verify data state
4. Verify environment variables are set correctly

---

**All fixes have been applied to the codebase.**
**Database migration ready to run.**
**Instructions provided for testing and deployment.**
