# Database Fix Instructions

## Issues Found and Fixed

### 1. **Admin Authentication System**
   - **Problem**: Code checks `user_roles` table but admin user not in the table
   - **Solution**: Added SQL to insert admin user and fix all policies

### 2. **has_role Function Conflicts**
   - **Problem**: Multiple versions of has_role function (ENUM vs TEXT parameter types)
   - **Solution**: Created unified function that uses TEXT parameter type

### 3. **RLS Policies**
   - **Problem**: Overly restrictive or missing policies blocking admin and anonymous access
   - **Solution**: Fixed all policies for enquiries, bookings, conversations, messages, tokens

### 4. **Anonymous User Access**
   - **Problem**: Anonymous users couldn't insert bookings/enquiries
   - **Solution**: Granted proper permissions to anon role

## How to Apply the Fix

### Option 1: Run Migration File (Recommended)
If you have Supabase CLI installed locally:
```bash
supabase db push
```

### Option 2: Manual SQL Execution (For Remote/Hosted Supabase)

1. **Open your Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project
   - Navigate to SQL Editor

2. **Copy and Run the Migration**
   - Open file: `supabase/migrations/20251204000000_fix_admin_system.sql`
   - Copy ALL the content
   - Paste into SQL Editor
   - Click "Run"

3. **Verify Admin User Was Created**
   - After running, check the "Result" panel at the bottom
   - Should see: `Admin users found: 1`
   - If it shows `0`, then the admin email doesn't exist in `auth.users` yet

4. **If Admin User Doesn't Exist in auth.users**
   You need to create the user first:
   - Go to Authentication > Users in Supabase Dashboard
   - Click "Add user" → "Create new user"
   - Email: `pandeyji252002@gmail.com`
   - Password: (set a secure password)
   - Auto Confirm User: YES
   - Click "Create user"
   - Then re-run the migration SQL

## What This Fix Does

### Frontend Changes (Already Applied)
- ✅ `src/hooks/useAuth.tsx` - Uses email-based admin check instead of database query
- ✅ `src/components/admin/ProtectedRoute.tsx` - Redirects properly for non-admin users
- ✅ `src/App.tsx` - Admin routes wrapped with AdminProtectedRoute, added /admin redirect

### Database Changes (Need to Run SQL)
- ✅ Inserts admin user into `user_roles` table
- ✅ Creates unified `has_role(UUID, TEXT)` function
- ✅ Fixes all RLS policies for:
  - `enquiries` - Public can insert, anyone can read, admins can update/delete
  - `enquiry_tokens` - Anyone can read, admins can manage
  - `bookings` - Public can insert, admins can read all, users can read their own
  - `conversations` - Admins can view/update, service role can manage
  - `messages` - Admins can view/insert/update, service role can manage
  - `payment_orders` - Admins can view all, users can view their own
- ✅ Grants proper permissions to `anon`, `authenticated`, and `service_role`
- ✅ Creates necessary indexes

## Testing After Fix

1. **Clear Browser Cache**
   - Open DevTools (F12)
   - Application tab → Clear site data
   - OR delete Local Storage, Session Storage, Cookies for localhost

2. **Login with Admin Email**
   - Go to http://localhost:8080/login
   - Email: `pandeyji252002@gmail.com`
   - Password: (your password)

3. **Verify Admin Access**
   - After login, should see "Admin Portal" button in navbar
   - Click it or go to http://localhost:8080/admin
   - Should redirect to http://localhost:8080/admin/dashboard
   - Should see admin dashboard with enquiries, bookings, etc.

4. **Test Booking Flow**
   - As admin, go to Admin Enquiries
   - Create or view an enquiry
   - Send booking link
   - Open link in incognito/private window
   - Complete booking form
   - Verify booking appears in Admin Bookings

## Current Admin Email
```
pandeyji252002@gmail.com
```

To change admin email, update:
1. `src/lib/constants.ts` - Change `ADMIN_EMAIL` constant
2. Run SQL in Supabase:
```sql
-- Update to new admin email
UPDATE public.user_roles
SET user_id = (SELECT id FROM auth.users WHERE email = 'newemail@example.com')
WHERE role = 'admin';
```

## Troubleshooting

### Issue: Still getting 403 errors in admin panel
**Solution**: Clear browser cache and re-login

### Issue: Admin button not showing in navbar
**Solution**: 
1. Check you're logged in with pandeyji252002@gmail.com
2. Check browser console for errors
3. Clear cache and re-login

### Issue: "Admin users found: 0" after running SQL
**Solution**: 
1. Admin user doesn't exist in auth.users yet
2. Create the user in Supabase Dashboard → Authentication → Users
3. Re-run the migration SQL

### Issue: Booking link shows "Invalid token"
**Solution**: 
1. Check that the SQL migration was run successfully
2. Verify anon role has SELECT permission on enquiry_tokens table
3. Check token hasn't expired (7 days from creation)

### Issue: Can't create booking via link
**Solution**:
1. Verify anon role has INSERT permission on bookings table
2. Check browser console for specific error
3. Verify RLS policies allow public inserts on bookings

## Files Modified

### Frontend (Already Updated)
- `src/hooks/useAuth.tsx`
- `src/components/admin/ProtectedRoute.tsx`
- `src/App.tsx`

### Database (Needs SQL Execution)
- `supabase/migrations/20251204000000_fix_admin_system.sql`

## Next Steps

1. ✅ Run the SQL migration (see "How to Apply the Fix" above)
2. ✅ Clear browser cache
3. ✅ Login with pandeyji252002@gmail.com
4. ✅ Test admin dashboard access
5. ✅ Test booking flow end-to-end
6. ✅ Deploy to production if everything works
