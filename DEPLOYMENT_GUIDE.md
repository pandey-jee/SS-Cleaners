# 🚀 Production Deployment Guide

This guide walks you through deploying SS Cleaners to production with all security measures in place.

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. Database Migration ✅
- [ ] Run security migration on Supabase
- [ ] Create admin user account
- [ ] Verify RLS policies working

### 2. Environment Variables ✅
- [ ] Razorpay live keys configured
- [ ] CORS updated with production domain
- [ ] ENVIRONMENT set to "production"
- [ ] APP_URL set to production URL

### 3. Code Review ✅
- [ ] All security fixes committed
- [ ] No sensitive data in console.logs
- [ ] Password requirements strengthened
- [ ] Security headers configured

---

## 🔧 STEP-BY-STEP DEPLOYMENT

### Step 1: Deploy Database Migration

1. **Push migration to Supabase:**
   ```bash
   # If using Supabase CLI
   supabase db push
   
   # OR run manually in Supabase SQL Editor:
   # Copy contents of supabase/migrations/20251203000000_security_fixes.sql
   # and execute in SQL Editor
   ```

2. **Verify migration:**
   ```sql
   -- Check user_roles table exists
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'user_roles';
   
   -- Check RLS policies updated
   SELECT policyname, tablename 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

---

### Step 2: Create Admin Account

1. **Sign up for an account** at your deployment URL (use your admin email)

2. **Add admin role in Supabase SQL Editor:**
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   SELECT id, 'admin'
   FROM auth.users
   WHERE email = 'your-admin@sspurecare.com'
   ON CONFLICT (user_id) DO NOTHING;
   ```

3. **Verify admin access:**
   - Login with your admin account
   - Navigate to `/admin` route
   - Confirm dashboard is accessible

---

### Step 3: Deploy Frontend to Vercel

1. **Push to GitHub** (already done ✅)

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project:
     - **Framework Preset:** Vite
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`

3. **Add Environment Variables in Vercel:**
   ```
   VITE_SUPABASE_PROJECT_ID=your-project-id
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   VITE_SUPABASE_URL=https://your-project.supabase.co
   ```

4. **Deploy!** 🚀
   - Click "Deploy"
   - Wait for build to complete
   - Note your deployment URL (e.g., `https://ss-cleaners.vercel.app`)

---

### Step 4: Configure Custom Domain (Optional)

1. **Buy domain** (e.g., sscleaners.in from Hostinger)

2. **Add domain in Vercel:**
   - Go to Project Settings → Domains
   - Add your domain
   - Follow DNS configuration instructions

3. **Update DNS records** in Hostinger:
   ```
   Type: A
   Name: @
   Value: 76.76.19.19 (Vercel IP)
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. **Wait for DNS propagation** (5-30 minutes)

---

### Step 5: Update Edge Functions

1. **Update CORS configuration:**
   
   Edit `supabase/functions/_shared/cors.ts`:
   ```typescript
   const ALLOWED_ORIGINS = [
     "https://sscleaners.in",
     "https://www.sscleaners.in",
     "https://your-app.vercel.app", // Vercel URL
   ];
   ```

2. **Update environment variables in Supabase:**
   - Go to Supabase Dashboard → Edge Functions → Settings
   - Update/Add these variables:
     ```
     ENVIRONMENT=production
     APP_URL=https://sscleaners.in
     RAZORPAY_KEY_ID=<your-live-key-id>
     RAZORPAY_KEY_SECRET=<your-live-key-secret>
     GMAIL_USER=<your-gmail>
     GMAIL_APP_PASSWORD=<your-app-password>
     ```

3. **Redeploy all Edge Functions:**
   ```bash
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Deploy all functions
   supabase functions deploy create-razorpay-order
   supabase functions deploy verify-razorpay-payment
   supabase functions deploy send-booking-link
   supabase functions deploy send-enquiry-notification
   supabase functions deploy send-booking-confirmation
   supabase functions deploy send-chat-notification
   supabase functions deploy chat-ai
   ```

---

### Step 6: Switch to Live Razorpay Keys

⚠️ **IMPORTANT:** You're currently using TEST mode keys!

1. **Get live keys from Razorpay:**
   - Login to [razorpay.com](https://dashboard.razorpay.com)
   - Go to Settings → API Keys
   - Generate/reveal **Live Mode** keys
   - Copy Key ID and Key Secret

2. **Update in Supabase:**
   - Supabase Dashboard → Edge Functions → Settings
   - Update `RAZORPAY_KEY_ID` with live key
   - Update `RAZORPAY_KEY_SECRET` with live secret

3. **Test a payment:**
   - Make a real booking
   - Complete payment with actual card/UPI
   - Verify status updates correctly
   - Check email confirmation sent

---

## ✅ POST-DEPLOYMENT TESTING

### Test 1: Public Access
- [ ] Visit homepage (not logged in)
- [ ] Submit enquiry form
- [ ] Receive confirmation email

### Test 2: Admin Access
- [ ] Login as admin
- [ ] Access admin dashboard
- [ ] View enquiries
- [ ] Send booking link
- [ ] Update booking status

### Test 3: Booking Flow
- [ ] Receive booking link email
- [ ] Complete booking form
- [ ] Submit booking
- [ ] Make payment
- [ ] Verify booking status = "confirmed"
- [ ] Verify payment_status = "paid"

### Test 4: Security
- [ ] Try accessing /admin without login → Redirected to login
- [ ] Try accessing admin as non-admin user → Blocked
- [ ] Check security headers in browser DevTools
- [ ] Verify HTTPS enforced

### Test 5: RLS Policies
- [ ] Create non-admin user
- [ ] Try to access admin data → Should fail
- [ ] Verify can't enumerate booking tokens

---

## 🔍 MONITORING & MAINTENANCE

### Daily (First Week)
- Check Supabase logs for errors
- Monitor payment transactions
- Review enquiry submissions

### Weekly
- Check for failed emails in `email_notifications` table
- Review booking completion rate
- Monitor payment success rate

### Monthly
- Run `npm audit` for security vulnerabilities
- Update dependencies if needed
- Review security audit findings
- Check Supabase database size/usage

### Quarterly
- Full security audit
- Review and update admin users
- Backup database
- Test disaster recovery

---

## 🆘 TROUBLESHOOTING

### Issue: Admin Dashboard Not Accessible

**Solution:**
```sql
-- Verify your user has admin role
SELECT u.email, r.role 
FROM auth.users u
LEFT JOIN public.user_roles r ON u.id = r.user_id
WHERE u.email = 'your-email@domain.com';

-- If role is NULL, add it:
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'your-email@domain.com';
```

### Issue: Payment Failing

**Checklist:**
- [ ] Razorpay live keys configured (not test keys)
- [ ] Webhook URL updated (if using webhooks)
- [ ] Amount is in correct format (paise)
- [ ] Check Razorpay dashboard for error details

### Issue: Emails Not Sending

**Checklist:**
- [ ] GMAIL_USER set correctly
- [ ] GMAIL_APP_PASSWORD is app password (not regular password)
- [ ] Check Supabase Edge Function logs
- [ ] Verify email_notifications table for error messages

### Issue: CORS Errors

**Solution:**
- Update `supabase/functions/_shared/cors.ts` with your domain
- Redeploy all Edge Functions
- Clear browser cache
- Verify origin header matches ALLOWED_ORIGINS

---

## 📞 SUPPORT RESOURCES

- **Supabase Docs:** https://supabase.com/docs
- **Razorpay Docs:** https://razorpay.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Security Audit:** See `SECURITY_AUDIT.md`
- **Edge Functions Guide:** See `supabase/functions/SECURITY_README.md`

---

## 🎉 CONGRATULATIONS!

Your application is now live with enterprise-grade security! 

**Next Steps:**
1. Monitor for first 48 hours closely
2. Set up error alerting (Sentry recommended)
3. Create privacy policy and terms of service
4. Consider adding rate limiting if abuse detected

**Need Help?** Review the security audit and troubleshooting sections above.

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Production URL:** _____________  
**Admin Email:** _____________
